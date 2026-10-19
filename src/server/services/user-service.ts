import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import type { z } from "zod";
import type { Role } from "@/generated/prisma/enums";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { assertCan, type Actor, UserFacingError } from "@/server/auth/actor";
import { STAFF_ROLES } from "@/server/auth/permissions";
import type { staffUserInput } from "@/server/validation";

type StaffUserInput = z.output<typeof staffUserInput>;

function assertStaffRoles(roles: Role[]) {
  const invalid = roles.filter((r) => !STAFF_ROLES.includes(r));
  if (invalid.length) throw new UserFacingError("Student and guardian accounts are created through admissions, not here.");
}

/**
 * Create a staff account. The person receives a "set your password" link by
 * email; no one else ever knows their password.
 */
export async function createStaffUser(actor: Actor, input: StaffUserInput, ip: string | null = null) {
  assertCan(actor, "users.manage");
  assertStaffRoles(input.roles);
  if (await db.user.findUnique({ where: { email: input.email } })) {
    throw new UserFacingError("An account with that email already exists.", { email: "Already registered." });
  }
  // Unusable random password until the person sets their own.
  const placeholder = await hashPassword(randomBytes(32).toString("base64url"));
  const userId = randomUUID();
  await db.$transaction(async (tx) => {
    await tx.user.create({ data: { id: userId, name: input.name, email: input.email, emailVerified: false } });
    await tx.account.create({ data: { id: randomUUID(), accountId: userId, providerId: "credential", userId, password: placeholder } });
    await tx.membership.createMany({ data: input.roles.map((role) => ({ userId, organisationId: actor.organisationId, role })) });
    await audit(tx, actor, actor.organisationId, { action: "user.create", entityType: "user", entityId: userId, after: { name: input.name, roles: input.roles }, ip });
  });
  return userId;
}

export async function setUserRoles(actor: Actor, userId: string, roles: Role[], reason: string, ip: string | null = null) {
  assertCan(actor, "users.manage");
  assertStaffRoles(roles);
  if (userId === actor.userId && !roles.includes("CEO") && actor.roles.includes("CEO")) {
    throw new UserFacingError("You cannot remove your own CEO role. Ask another administrator.");
  }
  const org = actor.organisationId;
  const before = await db.membership.findMany({ where: { userId, organisationId: org }, select: { role: true, active: true } });
  if (!before.length) throw new UserFacingError("That person is not a member of this organisation.");
  await db.$transaction(async (tx) => {
    await tx.membership.deleteMany({ where: { userId, organisationId: org, role: { notIn: roles } } });
    for (const role of roles) {
      await tx.membership.upsert({
        where: { userId_organisationId_role: { userId, organisationId: org, role } },
        create: { userId, organisationId: org, role },
        update: { active: true },
      });
    }
    await audit(tx, actor, org, { action: "user.roles", entityType: "user", entityId: userId, reason, before: before.map((m) => m.role), after: roles, ip });
  });
}

export async function setUserActive(actor: Actor, userId: string, active: boolean, reason: string, ip: string | null = null) {
  assertCan(actor, "users.manage");
  if (userId === actor.userId) throw new UserFacingError("You cannot deactivate your own account.");
  if (!reason.trim()) throw new UserFacingError("Give a reason.", { reason: "A reason is required." });
  const org = actor.organisationId;
  await db.$transaction(async (tx) => {
    const res = await tx.membership.updateMany({ where: { userId, organisationId: org }, data: { active } });
    if (!res.count) throw new UserFacingError("That person is not a member of this organisation.");
    // End their sessions immediately when access is removed.
    if (!active) await tx.session.deleteMany({ where: { userId } });
    await audit(tx, actor, org, { action: active ? "user.reactivate" : "user.deactivate", entityType: "user", entityId: userId, reason, ip });
  });
}
