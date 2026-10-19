import "server-only";
import type { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { assertCan, assertSameOrg, AuthzError, type Actor, UserFacingError } from "@/server/auth/actor";
import { assertEditable } from "@/server/services/workflow-service";
import type { cohortInput, courseInput, sessionInput, venueInput } from "@/server/validation";
import { formatDateTimeWAT, overlaps } from "@/lib/time";
import { formatNaira } from "@/lib/money";

type CourseInput = z.output<typeof courseInput>;
type CohortInput = z.output<typeof cohortInput>;
type SessionInput = z.output<typeof sessionInput>;
type VenueInput = z.output<typeof venueInput>;

async function assertUniqueSlug(organisationId: string, slug: string, exceptId?: string) {
  const clash = await db.course.findFirst({ where: { organisationId, slug, NOT: exceptId ? { id: exceptId } : undefined }, select: { id: true } });
  if (clash) throw new UserFacingError("Another course already uses that web address.", { slug: "Choose a different web address." });
}

// ── Courses ──────────────────────────────────────────────────────

export async function createCourse(actor: Actor, input: CourseInput, ip: string | null = null) {
  assertCan(actor, "course.edit");
  await assertUniqueSlug(actor.organisationId, input.slug);
  return db.$transaction(async (tx) => {
    const course = await tx.course.create({ data: { ...input, organisationId: actor.organisationId } });
    await audit(tx, actor, actor.organisationId, { action: "course.create", entityType: "course", entityId: course.id, after: { title: course.title }, ip });
    return course;
  });
}

export async function updateCourse(actor: Actor, id: string, input: CourseInput, ip: string | null = null) {
  assertCan(actor, "course.edit");
  const existing = await db.course.findUnique({ where: { id } });
  if (!existing) throw new UserFacingError("Course not found.");
  assertSameOrg(actor, existing.organisationId);
  assertEditable(existing.status);
  await assertUniqueSlug(actor.organisationId, input.slug, id);
  return db.$transaction(async (tx) => {
    const course = await tx.course.update({ where: { id }, data: input });
    await audit(tx, actor, actor.organisationId, { action: "course.update", entityType: "course", entityId: id, before: { title: existing.title, slug: existing.slug }, after: { title: course.title, slug: course.slug }, ip });
    return course;
  });
}

// ── Cohorts ──────────────────────────────────────────────────────

async function assertCohortRefs(organisationId: string, input: CohortInput) {
  const course = await db.course.findFirst({ where: { id: input.courseId, organisationId }, select: { id: true } });
  if (!course) throw new UserFacingError("Choose a course.", { courseId: "Choose a course." });
  if (input.venueId && !(await db.venue.findFirst({ where: { id: input.venueId, organisationId } }))) {
    throw new UserFacingError("Choose a venue from the list.", { venueId: "Unknown venue." });
  }
  if (input.instructorId && !(await db.staffProfile.findFirst({ where: { id: input.instructorId, organisationId } }))) {
    throw new UserFacingError("Choose an instructor from the list.", { instructorId: "Unknown instructor." });
  }
  const clash = await db.cohort.findFirst({ where: { organisationId, code: input.code }, select: { id: true } });
  return clash?.id ?? null;
}

/** Fees are deliberately not part of cohort editing — see proposeFee / approveFee. */
export async function createCohort(actor: Actor, input: CohortInput, ip: string | null = null) {
  assertCan(actor, "cohort.edit");
  if (await assertCohortRefs(actor.organisationId, input)) throw new UserFacingError("That cohort code is already in use.", { code: "Choose a different code." });
  return db.$transaction(async (tx) => {
    const cohort = await tx.cohort.create({ data: { ...input, organisationId: actor.organisationId } });
    await audit(tx, actor, actor.organisationId, { action: "cohort.create", entityType: "cohort", entityId: cohort.id, after: { code: cohort.code }, ip });
    return cohort;
  });
}

export async function updateCohort(actor: Actor, id: string, input: CohortInput, ip: string | null = null) {
  assertCan(actor, "cohort.edit");
  const existing = await db.cohort.findUnique({ where: { id } });
  if (!existing) throw new UserFacingError("Cohort not found.");
  assertSameOrg(actor, existing.organisationId);
  // Operational status (planned → open → running → completed) may change while published.
  const onlyStatusChange =
    existing.status === "PUBLISHED" &&
    Object.entries(input).every(([k, v]) => k === "cohortStatus" || String(v) === String((existing as Record<string, unknown>)[k]));
  if (!onlyStatusChange) assertEditable(existing.status);
  const clashId = await assertCohortRefs(actor.organisationId, input);
  if (clashId && clashId !== id) throw new UserFacingError("That cohort code is already in use.", { code: "Choose a different code." });
  return db.$transaction(async (tx) => {
    const cohort = await tx.cohort.update({ where: { id }, data: input });
    await audit(tx, actor, actor.organisationId, {
      action: "cohort.update",
      entityType: "cohort",
      entityId: id,
      before: { code: existing.code, cohortStatus: existing.cohortStatus, capacity: existing.capacity },
      after: { code: cohort.code, cohortStatus: cohort.cohortStatus, capacity: cohort.capacity },
      ip,
    });
    return cohort;
  });
}

// ── Fees (maker-checker) ─────────────────────────────────────────

export async function proposeFee(actor: Actor, cohortId: string, amountKobo: number, reason: string, ip: string | null = null) {
  assertCan(actor, "fees.propose");
  if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0) throw new UserFacingError("Enter a positive amount.");
  const cohort = await db.cohort.findUnique({ where: { id: cohortId } });
  if (!cohort) throw new UserFacingError("Cohort not found.");
  assertSameOrg(actor, cohort.organisationId);
  return db.$transaction(async (tx) => {
    await tx.cohort.update({
      where: { id: cohortId },
      data: { proposedFeeKobo: amountKobo, feeProposedById: actor.userId, feeProposedAt: new Date(), feeProposalReason: reason },
    });
    await audit(tx, actor, cohort.organisationId, {
      action: "fee.propose",
      entityType: "cohort",
      entityId: cohortId,
      reason,
      before: { feeKobo: cohort.feeKobo },
      after: { proposedFeeKobo: amountKobo, display: formatNaira(amountKobo) },
      ip,
    });
  });
}

export async function decideFee(actor: Actor, cohortId: string, decision: "approve" | "reject", reason: string, ip: string | null = null) {
  assertCan(actor, "fees.approve");
  const cohort = await db.cohort.findUnique({ where: { id: cohortId } });
  if (!cohort) throw new UserFacingError("Cohort not found.");
  assertSameOrg(actor, cohort.organisationId);
  if (cohort.proposedFeeKobo == null) throw new UserFacingError("There is no fee proposal to decide.");
  if (cohort.feeProposedById === actor.userId) throw new AuthzError("A different person must approve a fee you proposed.");
  if (decision === "reject" && !reason.trim()) throw new UserFacingError("Give a reason for returning the proposal.", { reason: "A reason is required." });

  return db.$transaction(async (tx) => {
    // Guard against a concurrent change to the proposal between read and write.
    const updated = await tx.cohort.updateMany({
      where: { id: cohortId, proposedFeeKobo: cohort.proposedFeeKobo, feeProposedById: cohort.feeProposedById },
      data: {
        ...(decision === "approve" ? { feeKobo: cohort.proposedFeeKobo } : {}),
        proposedFeeKobo: null,
        feeProposedById: null,
        feeProposedAt: null,
        feeProposalReason: null,
      },
    });
    if (updated.count !== 1) throw new UserFacingError("The proposal changed while you were reviewing it. Reload and try again.");
    await audit(tx, actor, cohort.organisationId, {
      action: `fee.${decision}`,
      entityType: "cohort",
      entityId: cohortId,
      reason: reason || null,
      before: { feeKobo: cohort.feeKobo, proposedFeeKobo: cohort.proposedFeeKobo, proposedBy: cohort.feeProposedById },
      after: { feeKobo: decision === "approve" ? cohort.proposedFeeKobo : cohort.feeKobo },
      ip,
    });
  });
}

// ── Timetable ────────────────────────────────────────────────────

export type Conflict = { kind: "venue" | "instructor"; cohortCode: string; startsAt: Date; endsAt: Date; message: string };

export async function findConflicts(
  organisationId: string,
  slot: { startsAt: Date; endsAt: Date; venueId: string | null; instructorId: string | null },
  excludeSessionId?: string,
): Promise<Conflict[]> {
  if (!slot.venueId && !slot.instructorId) return [];
  const candidates = await db.cohortSession.findMany({
    where: {
      id: excludeSessionId ? { not: excludeSessionId } : undefined,
      cohort: { organisationId, cohortStatus: { not: "CANCELLED" } },
      startsAt: { lt: slot.endsAt },
      endsAt: { gt: slot.startsAt },
      OR: [
        ...(slot.venueId ? [{ venueId: slot.venueId }] : []),
        ...(slot.instructorId ? [{ instructorId: slot.instructorId }] : []),
      ],
    },
    include: { cohort: { select: { code: true } }, venue: { select: { name: true } }, instructor: { select: { name: true } } },
  });
  const conflicts: Conflict[] = [];
  for (const s of candidates) {
    if (!overlaps(slot.startsAt, slot.endsAt, s.startsAt, s.endsAt)) continue;
    const when = `${formatDateTimeWAT(s.startsAt)}`;
    if (slot.venueId && s.venueId === slot.venueId) {
      conflicts.push({ kind: "venue", cohortCode: s.cohort.code, startsAt: s.startsAt, endsAt: s.endsAt, message: `${s.venue?.name ?? "Venue"} is booked by ${s.cohort.code} at ${when}.` });
    }
    if (slot.instructorId && s.instructorId === slot.instructorId) {
      conflicts.push({ kind: "instructor", cohortCode: s.cohort.code, startsAt: s.startsAt, endsAt: s.endsAt, message: `${s.instructor?.name ?? "Instructor"} is teaching ${s.cohort.code} at ${when}.` });
    }
  }
  return conflicts;
}

export async function addSession(actor: Actor, cohortId: string, input: SessionInput, ip: string | null = null) {
  assertCan(actor, "timetable.edit");
  const cohort = await db.cohort.findUnique({ where: { id: cohortId } });
  if (!cohort) throw new UserFacingError("Cohort not found.");
  assertSameOrg(actor, cohort.organisationId);
  const slot = {
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    venueId: input.venueId ?? cohort.venueId,
    instructorId: input.instructorId ?? cohort.instructorId,
  };
  const conflicts = await findConflicts(cohort.organisationId, slot);
  if (conflicts.length) throw new UserFacingError(`Timetable conflict: ${conflicts.map((c) => c.message).join(" ")}`);
  return db.$transaction(async (tx) => {
    const session = await tx.cohortSession.create({ data: { cohortId, ...slot, note: input.note } });
    await audit(tx, actor, cohort.organisationId, { action: "timetable.add", entityType: "cohort", entityId: cohortId, after: { sessionId: session.id, startsAt: slot.startsAt }, ip });
    return session;
  });
}

export async function removeSession(actor: Actor, sessionId: string, ip: string | null = null) {
  assertCan(actor, "timetable.edit");
  const session = await db.cohortSession.findUnique({ where: { id: sessionId }, include: { cohort: true } });
  if (!session) throw new UserFacingError("Session not found.");
  assertSameOrg(actor, session.cohort.organisationId);
  await db.$transaction(async (tx) => {
    await tx.cohortSession.delete({ where: { id: sessionId } });
    await audit(tx, actor, session.cohort.organisationId, { action: "timetable.remove", entityType: "cohort", entityId: session.cohortId, before: { startsAt: session.startsAt }, ip });
  });
  return session.cohortId;
}

// ── Venues ───────────────────────────────────────────────────────

export async function saveVenue(actor: Actor, id: string | null, input: VenueInput, ip: string | null = null) {
  assertCan(actor, "venue.edit");
  if (id) {
    const existing = await db.venue.findUnique({ where: { id } });
    if (!existing) throw new UserFacingError("Venue not found.");
    assertSameOrg(actor, existing.organisationId);
  }
  return db.$transaction(async (tx) => {
    const venue = id
      ? await tx.venue.update({ where: { id }, data: input })
      : await tx.venue.create({ data: { ...input, organisationId: actor.organisationId } });
    await audit(tx, actor, actor.organisationId, { action: id ? "venue.update" : "venue.create", entityType: "venue", entityId: venue.id, after: { name: venue.name }, ip });
    return venue;
  });
}
