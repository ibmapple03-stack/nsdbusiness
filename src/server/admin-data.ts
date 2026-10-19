import "server-only";
import { db } from "@/server/db";
import { can, type Actor } from "@/server/auth/actor";
import { WORKFLOW_ENTITIES, type WorkflowEntity } from "@/server/services/workflow-service";

/** Workflow entities this person may approve. */
export function approvableEntities(actor: Actor): WorkflowEntity[] {
  return (Object.keys(WORKFLOW_ENTITIES) as WorkflowEntity[]).filter((e) => can(actor, WORKFLOW_ENTITIES[e].approve));
}

export async function approvalCounts(actor: Actor) {
  const org = actor.organisationId;
  const entities = approvableEntities(actor);
  const where = { organisationId: org, status: "SUBMITTED" as const };
  const counts = await Promise.all(
    entities.map((e) => {
      switch (e) {
        case "course": return db.course.count({ where });
        case "cohort": return db.cohort.count({ where });
        case "profile": return db.staffProfile.count({ where });
        case "content": return db.contentBlock.count({ where });
        case "policy": return db.policy.count({ where });
        case "news": return db.newsPost.count({ where });
        case "event": return db.event.count({ where });
      }
    }),
  );
  const fees = can(actor, "fees.approve")
    ? await db.cohort.count({ where: { organisationId: org, proposedFeeKobo: { not: null }, feeProposedById: { not: actor.userId } } })
    : 0;
  const newEnquiries = can(actor, "enquiry.view") ? await db.enquiry.count({ where: { organisationId: org, status: "NEW" } }) : 0;
  return {
    canApprove: entities.length > 0 || can(actor, "fees.approve"),
    total: counts.reduce<number>((a, b) => a + (b ?? 0), 0) + fees,
    fees,
    newEnquiries,
  };
}

export type QueueItem = { entity: WorkflowEntity | "fee"; id: string; title: string; href: string; submittedAt: Date | null; submittedBy: string | null; mine: boolean };

/** Everything waiting for a decision that this person is allowed to make. */
export async function approvalQueue(actor: Actor): Promise<QueueItem[]> {
  const org = actor.organisationId;
  const where = { organisationId: org, status: "SUBMITTED" as const };
  const entities = new Set(approvableEntities(actor));
  const items: QueueItem[] = [];
  const push = (entity: WorkflowEntity, rows: { id: string; submittedAt: Date | null; submittedById: string | null }[], title: (r: never) => string, href: (id: string) => string) => {
    for (const r of rows) items.push({ entity, id: r.id, title: title(r as never), href: href(r.id), submittedAt: r.submittedAt, submittedBy: r.submittedById, mine: r.submittedById === actor.userId });
  };
  if (entities.has("course")) push("course", await db.course.findMany({ where }), (r: { title: string }) => r.title, (id) => `/admin/courses/${id}`);
  if (entities.has("cohort")) push("cohort", await db.cohort.findMany({ where }), (r: { code: string }) => r.code, (id) => `/admin/cohorts/${id}`);
  if (entities.has("profile")) push("profile", await db.staffProfile.findMany({ where }), (r: { name: string }) => r.name, (id) => `/admin/people/${id}`);
  if (entities.has("content")) push("content", await db.contentBlock.findMany({ where }), (r: { title: string }) => r.title, (id) => `/admin/content/${id}`);
  if (entities.has("policy")) push("policy", await db.policy.findMany({ where }), (r: { title: string; version: number }) => `${r.title} (v${r.version})`, (id) => `/admin/policies/${id}`);
  if (entities.has("news")) push("news", await db.newsPost.findMany({ where }), (r: { title: string }) => r.title, (id) => `/admin/news/${id}`);
  if (entities.has("event")) push("event", await db.event.findMany({ where }), (r: { title: string }) => r.title, (id) => `/admin/events/${id}`);

  if (can(actor, "fees.approve")) {
    const fees = await db.cohort.findMany({ where: { organisationId: org, proposedFeeKobo: { not: null } } });
    for (const c of fees) {
      items.push({ entity: "fee", id: c.id, title: `Fee for ${c.code}`, href: `/admin/cohorts/${c.id}#fees`, submittedAt: c.feeProposedAt, submittedBy: c.feeProposedById, mine: c.feeProposedById === actor.userId });
    }
  }

  const ids = [...new Set(items.map((i) => i.submittedBy).filter(Boolean))] as string[];
  const names = new Map((await db.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } })).map((u) => [u.id, u.name]));
  return items
    .map((i) => ({ ...i, submittedBy: i.submittedBy ? (names.get(i.submittedBy) ?? "Unknown") : null }))
    .sort((a, b) => (a.submittedAt?.getTime() ?? 0) - (b.submittedAt?.getTime() ?? 0));
}

/** Instructors see only cohorts assigned to their own profile. */
export async function instructorCohorts(actor: Actor) {
  return db.cohort.findMany({
    where: { organisationId: actor.organisationId, instructor: { userId: actor.userId } },
    orderBy: { startDate: "asc" },
    include: { course: { select: { title: true } }, venue: { select: { name: true } }, sessions: { orderBy: { startsAt: "asc" }, where: { startsAt: { gte: new Date() } }, take: 5 } },
  });
}

/** Look up display names for user ids (for "submitted by", audit, etc.). */
export async function userNames(ids: (string | null | undefined)[]) {
  const unique = [...new Set(ids.filter(Boolean))] as string[];
  if (!unique.length) return new Map<string, string>();
  const rows = await db.user.findMany({ where: { id: { in: unique } }, select: { id: true, name: true } });
  return new Map(rows.map((u) => [u.id, u.name]));
}
