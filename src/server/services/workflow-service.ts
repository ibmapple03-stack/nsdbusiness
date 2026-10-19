import "server-only";
import type { ContentStatus } from "@/generated/prisma/enums";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { assertCan, assertSameOrg, type Actor, UserFacingError } from "@/server/auth/actor";
import type { Permission } from "@/server/auth/permissions";
import {
  ACTION_TIER,
  REASON_REQUIRED,
  assertSeparateApprover,
  nextStatus,
  WorkflowError,
  type WorkflowAction,
} from "@/server/workflow";

export const WORKFLOW_ENTITIES = {
  course: { label: "Course", edit: "course.edit", approve: "course.approve", tag: "catalogue" },
  cohort: { label: "Cohort", edit: "cohort.edit", approve: "cohort.approve", tag: "catalogue" },
  profile: { label: "Profile", edit: "profile.edit", approve: "profile.approve", tag: "people" },
  content: { label: "Page content", edit: "content.edit", approve: "content.approve", tag: "content" },
  policy: { label: "Policy", edit: "policy.edit", approve: "policy.approve", tag: "policies" },
  news: { label: "News post", edit: "content.edit", approve: "content.approve", tag: "news" },
  event: { label: "Event", edit: "content.edit", approve: "content.approve", tag: "news" },
} as const satisfies Record<string, { label: string; edit: Permission; approve: Permission; tag: string }>;

export type WorkflowEntity = keyof typeof WORKFLOW_ENTITIES;

type WorkflowRecord = { id: string; organisationId: string; status: ContentStatus; submittedById: string | null };

type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0];

// Each Prisma delegate has its own type; this narrow view is all the workflow needs.
type Delegate = {
  findUnique(args: { where: { id: string } }): Promise<(WorkflowRecord & Record<string, unknown>) | null>;
  update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<unknown>;
};

function delegate(tx: Tx, entity: WorkflowEntity): Delegate {
  const map = {
    course: tx.course,
    cohort: tx.cohort,
    profile: tx.staffProfile,
    content: tx.contentBlock,
    policy: tx.policy,
    news: tx.newsPost,
    event: tx.event,
  } as unknown as Record<WorkflowEntity, Delegate>;
  return map[entity];
}

/** Extra rules that must hold before something becomes public. */
async function assertPublishable(tx: Tx, entity: WorkflowEntity, record: Record<string, unknown>) {
  if (entity === "cohort") {
    const course = await tx.course.findUnique({ where: { id: record.courseId as string }, select: { status: true } });
    if (course?.status !== "PUBLISHED") throw new UserFacingError("Publish the course before publishing one of its cohorts.");
  }
  if (entity === "course") {
    if (!String(record.certificateType ?? "").trim()) throw new UserFacingError("Add the certificate type before publishing.");
    if (!String(record.refundTerms ?? "").trim()) throw new UserFacingError("Add refund and cancellation terms before publishing.");
  }
  if (entity === "profile" && !String(record.bio ?? "").trim()) {
    throw new UserFacingError("Add a biography before publishing this profile.");
  }
}

export async function transition(
  actor: Actor,
  entity: WorkflowEntity,
  id: string,
  action: WorkflowAction,
  reason: string | null,
  ip: string | null = null,
): Promise<{ status: ContentStatus; tag: string }> {
  const config = WORKFLOW_ENTITIES[entity];
  assertCan(actor, ACTION_TIER[action] === "approve" ? config.approve : config.edit);
  if (REASON_REQUIRED.has(action) && !reason?.trim()) {
    throw new UserFacingError("Give a reason for this decision.", { reason: "A reason is required." });
  }

  return db.$transaction(async (tx) => {
    const d = delegate(tx, entity);
    const record = await d.findUnique({ where: { id } });
    if (!record) throw new UserFacingError(`${config.label} not found.`);
    assertSameOrg(actor, record.organisationId);

    let to: ContentStatus;
    try {
      to = nextStatus(record.status, action);
      assertSeparateApprover(action, actor.userId, record.submittedById);
    } catch (e) {
      if (e instanceof WorkflowError) throw new UserFacingError(e.message);
      throw e;
    }
    if (action === "publish") await assertPublishable(tx, entity, record);

    const now = new Date();
    const data: Record<string, unknown> = { status: to };
    if (action === "submit") Object.assign(data, { submittedById: actor.userId, submittedAt: now, reviewNote: null });
    if (action === "approve" || action === "reject") {
      Object.assign(data, { reviewedById: actor.userId, reviewedAt: now, reviewNote: reason?.trim() || null });
    }
    if (action === "revise") Object.assign(data, { submittedById: null, submittedAt: null });
    if (action === "publish" && entity === "news" && !record.publishedAt) data.publishedAt = now;
    if (action === "publish" && entity === "policy" && !record.effectiveFrom) data.effectiveFrom = now;

    await d.update({ where: { id }, data });
    await audit(tx, actor, record.organisationId, {
      action: `${entity}.${action}`,
      entityType: entity,
      entityId: id,
      reason,
      before: { status: record.status },
      after: { status: to },
      ip,
    });
    return { status: to, tag: config.tag };
  });
}

/** Editing is allowed only while a record is a draft or has been returned. */
export function assertEditable(status: ContentStatus) {
  if (status !== "DRAFT" && status !== "REJECTED") {
    throw new UserFacingError("Move this back to draft before editing. Published records change only through approval.");
  }
}
