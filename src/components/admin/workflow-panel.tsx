import type { ContentStatus } from "@/generated/prisma/enums";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { StatusBadge } from "@/components/ui/badge";
import { TextArea } from "@/components/ui/field";
import { transitionAction } from "@/app/admin/actions";
import { can, type Actor } from "@/server/auth/actor";
import { WORKFLOW_ENTITIES, type WorkflowEntity } from "@/server/services/workflow-service";
import { ACTION_LABELS, ACTION_TIER, availableActions, REASON_REQUIRED, type WorkflowAction } from "@/server/workflow";
import { formatDateTimeWAT } from "@/lib/time";

const ORDER: WorkflowAction[] = ["submit", "approve", "publish", "reject", "unpublish", "revise", "archive"];

/**
 * Shows the record's status and only the decisions this person may take.
 * The server re-checks permission, state and the maker-checker rule.
 */
export function WorkflowPanel({
  actor,
  entity,
  record,
  names,
}: {
  actor: Actor;
  entity: WorkflowEntity;
  record: { id: string; status: ContentStatus; submittedById: string | null; submittedAt: Date | null; reviewedById: string | null; reviewedAt: Date | null; reviewNote: string | null };
  names: Map<string, string>;
}) {
  const config = WORKFLOW_ENTITIES[entity];
  const actions = ORDER.filter((a) => availableActions(record.status).includes(a))
    .filter((a) => can(actor, ACTION_TIER[a] === "approve" ? config.approve : config.edit))
    .filter((a) => !(a === "approve" && record.submittedById === actor.userId));
  const ownSubmission = record.status === "SUBMITTED" && record.submittedById === actor.userId && can(actor, config.approve);
  const needsReason = actions.some((a) => REASON_REQUIRED.has(a));

  return (
    <section aria-labelledby="workflow-heading" className="rounded-[var(--radius-lg)] border border-line bg-paper p-5 shadow-[var(--shadow-raised)]">
      <div className="flex items-center justify-between gap-3">
        <h2 id="workflow-heading" className="text-base font-semibold">
          Publication
        </h2>
        <span role="status" aria-live="polite">
          <StatusBadge status={record.status} />
        </span>
      </div>
      <dl className="mt-3 space-y-1 text-sm text-muted">
        {record.submittedAt && (
          <div>
            <dt className="inline">Submitted: </dt>
            <dd className="inline">
              {names.get(record.submittedById ?? "") ?? "—"}, {formatDateTimeWAT(record.submittedAt)}
            </dd>
          </div>
        )}
        {record.reviewedAt && (
          <div>
            <dt className="inline">Last decision: </dt>
            <dd className="inline">
              {names.get(record.reviewedById ?? "") ?? "—"}, {formatDateTimeWAT(record.reviewedAt)}
            </dd>
          </div>
        )}
      </dl>
      {record.reviewNote && (
        <p className="mt-3 rounded-[var(--radius-sm)] bg-gold-100 p-3 text-sm text-[#4d3700]">
          <span className="font-semibold">Reviewer note:</span> {record.reviewNote}
        </p>
      )}
      {ownSubmission && <p className="mt-3 text-sm text-muted">You submitted this, so another approver must decide on it.</p>}
      {actions.length > 0 ? (
        <ActionForm action={transitionAction} className="mt-4 space-y-3">
          <input type="hidden" name="entity" value={entity} />
          <input type="hidden" name="id" value={record.id} />
          {(needsReason || actions.includes("approve")) && (
            <TextArea name="reason" label="Note or reason" rows={2} hint={needsReason ? "Required when returning, unpublishing or archiving." : undefined} />
          )}
          <div className="flex flex-wrap gap-2">
            {actions.map((a) => (
              <SubmitButton key={a} name="action" value={a} size="sm" variant={a === "approve" || a === "publish" || a === "submit" ? "primary" : a === "archive" ? "danger" : "secondary"} pendingLabel="Working…">
                {ACTION_LABELS[a]}
              </SubmitButton>
            ))}
          </div>
        </ActionForm>
      ) : (
        !ownSubmission && <p className="mt-3 text-sm text-muted">No actions available to you at this stage.</p>
      )}
    </section>
  );
}
