import "server-only";
import type { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { assertCan, assertSameOrg, type Actor, UserFacingError } from "@/server/auth/actor";
import { assertEditable } from "@/server/services/workflow-service";
import type { contentBlockInput, eventInput, newsInput, policyInput, profileInput } from "@/server/validation";

type ProfileInput = z.output<typeof profileInput>;
type BlockInput = z.output<typeof contentBlockInput>;
type PolicyInput = z.output<typeof policyInput>;
type NewsInput = z.output<typeof newsInput>;
type EventInput = z.output<typeof eventInput>;

// ── Staff profiles ───────────────────────────────────────────────

export async function saveProfile(actor: Actor, id: string | null, input: ProfileInput, ip: string | null = null) {
  assertCan(actor, "profile.edit");
  const org = actor.organisationId;
  const clash = await db.staffProfile.findFirst({ where: { organisationId: org, slug: input.slug, NOT: id ? { id } : undefined } });
  if (clash) throw new UserFacingError("Another profile uses that web address.", { slug: "Choose a different web address." });
  if (input.reportsToId) {
    if (input.reportsToId === id) throw new UserFacingError("A person cannot report to themselves.", { reportsToId: "Choose someone else." });
    const manager = await db.staffProfile.findFirst({ where: { id: input.reportsToId, organisationId: org } });
    if (!manager) throw new UserFacingError("Choose a manager from the list.", { reportsToId: "Unknown person." });
  }
  if (id) {
    const existing = await db.staffProfile.findUnique({ where: { id } });
    if (!existing) throw new UserFacingError("Profile not found.");
    assertSameOrg(actor, existing.organisationId);
    assertEditable(existing.status);
  }
  return db.$transaction(async (tx) => {
    const profile = id
      ? await tx.staffProfile.update({ where: { id }, data: input })
      : await tx.staffProfile.create({ data: { ...input, organisationId: org } });
    await audit(tx, actor, org, { action: id ? "profile.update" : "profile.create", entityType: "profile", entityId: profile.id, after: { name: profile.name, publicTitle: profile.publicTitle, photoApproved: profile.photoApproved }, ip });
    return profile;
  });
}

/** Photo approval is its own decision, available at any stage of the profile. */
export async function setPhotoApproval(actor: Actor, id: string, approved: boolean, reason: string, ip: string | null = null) {
  assertCan(actor, "profile.approve");
  const existing = await db.staffProfile.findUnique({ where: { id } });
  if (!existing) throw new UserFacingError("Profile not found.");
  assertSameOrg(actor, existing.organisationId);
  if (approved && !existing.photoPath) throw new UserFacingError("There is no photo on file.");
  await db.$transaction(async (tx) => {
    await tx.staffProfile.update({ where: { id }, data: { photoApproved: approved } });
    await audit(tx, actor, existing.organisationId, { action: approved ? "profile.photo_approve" : "profile.photo_withdraw", entityType: "profile", entityId: id, reason, ip });
  });
}

// ── Content blocks ───────────────────────────────────────────────

export async function updateContentBlock(actor: Actor, id: string, input: BlockInput, ip: string | null = null) {
  assertCan(actor, "content.edit");
  const existing = await db.contentBlock.findUnique({ where: { id } });
  if (!existing) throw new UserFacingError("Content not found.");
  assertSameOrg(actor, existing.organisationId);
  assertEditable(existing.status);
  return db.$transaction(async (tx) => {
    const block = await tx.contentBlock.update({ where: { id }, data: input });
    await audit(tx, actor, existing.organisationId, { action: "content.update", entityType: "content", entityId: id, before: { title: existing.title }, after: { title: block.title }, ip });
    return block;
  });
}

// ── Policies ─────────────────────────────────────────────────────

export async function updatePolicy(actor: Actor, id: string, input: PolicyInput, ip: string | null = null) {
  assertCan(actor, "policy.edit");
  const existing = await db.policy.findUnique({ where: { id } });
  if (!existing) throw new UserFacingError("Policy not found.");
  assertSameOrg(actor, existing.organisationId);
  assertEditable(existing.status);
  return db.$transaction(async (tx) => {
    const policy = await tx.policy.update({ where: { id }, data: input });
    await audit(tx, actor, existing.organisationId, { action: "policy.update", entityType: "policy", entityId: id, after: { title: policy.title, version: policy.version }, ip });
    return policy;
  });
}

/** Start a new version from a published policy, leaving the published one live until the new one is approved. */
export async function newPolicyVersion(actor: Actor, id: string, ip: string | null = null) {
  assertCan(actor, "policy.edit");
  const current = await db.policy.findUnique({ where: { id } });
  if (!current) throw new UserFacingError("Policy not found.");
  assertSameOrg(actor, current.organisationId);
  const latest = await db.policy.findFirst({ where: { organisationId: current.organisationId, slug: current.slug }, orderBy: { version: "desc" } });
  if (latest && latest.status !== "PUBLISHED" && latest.status !== "ARCHIVED") {
    throw new UserFacingError(`Version ${latest.version} is still in progress. Finish or archive it first.`);
  }
  return db.$transaction(async (tx) => {
    const next = await tx.policy.create({
      data: {
        organisationId: current.organisationId,
        slug: current.slug,
        title: current.title,
        summary: current.summary,
        body: current.body,
        version: (latest?.version ?? current.version) + 1,
      },
    });
    await audit(tx, actor, current.organisationId, { action: "policy.new_version", entityType: "policy", entityId: next.id, after: { slug: next.slug, version: next.version }, ip });
    return next;
  });
}

// ── News & events ────────────────────────────────────────────────

export async function saveNews(actor: Actor, id: string | null, input: NewsInput, ip: string | null = null) {
  assertCan(actor, "content.edit");
  const org = actor.organisationId;
  if (await db.newsPost.findFirst({ where: { organisationId: org, slug: input.slug, NOT: id ? { id } : undefined } })) {
    throw new UserFacingError("Another post uses that web address.", { slug: "Choose a different web address." });
  }
  if (id) {
    const existing = await db.newsPost.findUnique({ where: { id } });
    if (!existing) throw new UserFacingError("Post not found.");
    assertSameOrg(actor, existing.organisationId);
    assertEditable(existing.status);
  }
  return db.$transaction(async (tx) => {
    const post = id ? await tx.newsPost.update({ where: { id }, data: input }) : await tx.newsPost.create({ data: { ...input, organisationId: org } });
    await audit(tx, actor, org, { action: id ? "news.update" : "news.create", entityType: "news", entityId: post.id, after: { title: post.title }, ip });
    return post;
  });
}

export async function saveEvent(actor: Actor, id: string | null, input: EventInput, ip: string | null = null) {
  assertCan(actor, "content.edit");
  const org = actor.organisationId;
  if (await db.event.findFirst({ where: { organisationId: org, slug: input.slug, NOT: id ? { id } : undefined } })) {
    throw new UserFacingError("Another event uses that web address.", { slug: "Choose a different web address." });
  }
  if (id) {
    const existing = await db.event.findUnique({ where: { id } });
    if (!existing) throw new UserFacingError("Event not found.");
    assertSameOrg(actor, existing.organisationId);
    assertEditable(existing.status);
  }
  return db.$transaction(async (tx) => {
    const event = id ? await tx.event.update({ where: { id }, data: input }) : await tx.event.create({ data: { ...input, organisationId: org } });
    await audit(tx, actor, org, { action: id ? "event.update" : "event.create", entityType: "event", entityId: event.id, after: { title: event.title }, ip });
    return event;
  });
}

// ── Site settings (verified contact details) ─────────────────────

export async function updateSetting(actor: Actor, id: string, value: string, ip: string | null = null) {
  assertCan(actor, "settings.edit");
  const existing = await db.siteSetting.findUnique({ where: { id } });
  if (!existing) throw new UserFacingError("Setting not found.");
  assertSameOrg(actor, existing.organisationId);
  return db.$transaction(async (tx) => {
    // Any change withdraws the value from the public site until someone verifies it again.
    await tx.siteSetting.update({ where: { id }, data: { value, verified: false, verifiedById: null, verifiedAt: null } });
    await audit(tx, actor, existing.organisationId, { action: "setting.update", entityType: "setting", entityId: id, before: { key: existing.key, value: existing.value }, after: { key: existing.key, value }, ip });
  });
}

export async function setSettingVerified(actor: Actor, id: string, verified: boolean, ip: string | null = null) {
  assertCan(actor, "settings.verify");
  const existing = await db.siteSetting.findUnique({ where: { id } });
  if (!existing) throw new UserFacingError("Setting not found.");
  assertSameOrg(actor, existing.organisationId);
  if (verified && !existing.value.trim()) throw new UserFacingError("Enter a value before verifying it.");
  await db.$transaction(async (tx) => {
    await tx.siteSetting.update({ where: { id }, data: verified ? { verified: true, verifiedById: actor.userId, verifiedAt: new Date() } : { verified: false, verifiedById: null, verifiedAt: null } });
    await audit(tx, actor, existing.organisationId, { action: verified ? "setting.verify" : "setting.unverify", entityType: "setting", entityId: id, after: { key: existing.key }, ip });
  });
}
