import "server-only";
import type { z } from "zod";
import type { EnquiryStatus } from "@/generated/prisma/enums";
import { db } from "@/server/db";
import { audit, hashIp } from "@/server/audit";
import { assertCan, assertSameOrg, type Actor, UserFacingError } from "@/server/auth/actor";
import type { enquiryInput } from "@/server/validation";

type EnquiryInput = z.output<typeof enquiryInput>;

export async function createEnquiry(organisationId: string, input: EnquiryInput, ip: string | null) {
  const details: Record<string, string> = {};
  if (input.headcount) details.headcount = input.headcount.slice(0, 20);
  if (input.preferredDates) details.preferredDates = input.preferredDates;
  if (input.topics) details.topics = input.topics;
  if (input.interest) details.interest = input.interest;

  return db.enquiry.create({
    data: {
      organisationId,
      type: input.type,
      name: input.name,
      email: input.email,
      phone: input.phone,
      organisationName: input.organisationName,
      subject: input.subject,
      message: input.message,
      details,
      ipHash: hashIp(ip),
    },
    select: { id: true },
  });
}

export async function updateEnquiry(actor: Actor, id: string, status: EnquiryStatus, note: string, ip: string | null = null) {
  assertCan(actor, "enquiry.manage");
  const existing = await db.enquiry.findUnique({ where: { id } });
  if (!existing) throw new UserFacingError("Enquiry not found.");
  assertSameOrg(actor, existing.organisationId);
  await db.$transaction(async (tx) => {
    await tx.enquiry.update({ where: { id }, data: { status, handledNote: note, assignedToId: existing.assignedToId ?? actor.userId } });
    await audit(tx, actor, existing.organisationId, { action: "enquiry.update", entityType: "enquiry", entityId: id, before: { status: existing.status }, after: { status }, reason: note, ip });
  });
}
