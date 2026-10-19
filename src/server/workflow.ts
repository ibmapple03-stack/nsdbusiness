/**
 * Editorial workflow shared by every publishable record:
 *
 *   DRAFT ──submit──▶ SUBMITTED ──approve──▶ APPROVED ──publish──▶ PUBLISHED
 *     ▲                  │                                            │
 *     └──── revise ◀── REJECTED ◀──reject──┘          archive ◀───────┘
 *
 * Approving requires a different person from the one who submitted it.
 * Pure functions only — persistence lives in services/workflow-service.ts.
 */
import type { ContentStatus } from "@/generated/prisma/enums";

export type WorkflowAction = "submit" | "approve" | "reject" | "publish" | "unpublish" | "archive" | "revise";

const TRANSITIONS: Record<WorkflowAction, { from: ContentStatus[]; to: ContentStatus }> = {
  submit: { from: ["DRAFT", "REJECTED"], to: "SUBMITTED" },
  approve: { from: ["SUBMITTED"], to: "APPROVED" },
  reject: { from: ["SUBMITTED", "APPROVED"], to: "REJECTED" },
  publish: { from: ["APPROVED"], to: "PUBLISHED" },
  unpublish: { from: ["PUBLISHED"], to: "APPROVED" },
  archive: { from: ["DRAFT", "REJECTED", "APPROVED", "PUBLISHED"], to: "ARCHIVED" },
  revise: { from: ["REJECTED", "APPROVED", "PUBLISHED", "ARCHIVED"], to: "DRAFT" },
};

/** Which permission tier each action needs: editors move work forward, approvers decide. */
export const ACTION_TIER: Record<WorkflowAction, "edit" | "approve"> = {
  submit: "edit",
  revise: "edit",
  approve: "approve",
  reject: "approve",
  publish: "approve",
  unpublish: "approve",
  archive: "approve",
};

/** Actions that must record a reason in the audit log. */
export const REASON_REQUIRED: ReadonlySet<WorkflowAction> = new Set(["reject", "unpublish", "archive"]);

export class WorkflowError extends Error {}

export function nextStatus(current: ContentStatus, action: WorkflowAction): ContentStatus {
  const rule = TRANSITIONS[action];
  if (!rule.from.includes(current)) {
    throw new WorkflowError(`Cannot ${action} a record that is ${current.toLowerCase()}.`);
  }
  return rule.to;
}

export function availableActions(current: ContentStatus): WorkflowAction[] {
  return (Object.keys(TRANSITIONS) as WorkflowAction[]).filter((a) => TRANSITIONS[a].from.includes(current));
}

/** Maker-checker rule: the submitter cannot approve their own submission. */
export function assertSeparateApprover(action: WorkflowAction, actorId: string, submittedById: string | null) {
  if (action === "approve" && submittedById && submittedById === actorId) {
    throw new WorkflowError("A different person must approve this. You submitted it.");
  }
}

export const STATUS_LABELS: Record<ContentStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Awaiting approval",
  APPROVED: "Approved, not published",
  REJECTED: "Returned for changes",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const ACTION_LABELS: Record<WorkflowAction, string> = {
  submit: "Submit for approval",
  approve: "Approve",
  reject: "Return for changes",
  publish: "Publish",
  unpublish: "Unpublish",
  archive: "Archive",
  revise: "Move back to draft",
};
