import { notFound } from "next/navigation";
import { AdminHeader, Panel } from "@/components/admin/page-parts";
import { CohortForm } from "@/components/admin/cohort-form";
import { WorkflowPanel } from "@/components/admin/workflow-panel";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { SelectField, TextArea, TextField } from "@/components/ui/field";
import { addSessionAction, decideFeeAction, proposeFeeAction, removeSessionAction } from "@/app/admin/actions";
import { can } from "@/server/auth/actor";
import { requireStaffPage } from "@/server/auth/session";
import { userNames } from "@/server/admin-data";
import { db } from "@/server/db";
import { formatNaira } from "@/lib/money";
import { formatDateTimeWAT, formatNewYork } from "@/lib/time";
import { cohortFormOptions } from "../options";

// Session-dependent staff page, rendered per request.
export const instant = false;

export default async function CohortPage(props: PageProps<"/admin/cohorts/[id]">) {
  const actor = await requireStaffPage("course.view");
  const { id } = await props.params;
  const cohort = await db.cohort.findFirst({
    where: { id, organisationId: actor.organisationId },
    include: {
      course: { select: { title: true } },
      sessions: { orderBy: { startsAt: "asc" }, include: { venue: { select: { name: true } }, instructor: { select: { name: true } } } },
    },
  });
  if (!cohort) notFound();
  const options = await cohortFormOptions(actor.organisationId);
  const names = await userNames([cohort.submittedById, cohort.reviewedById, cohort.feeProposedById]);
  const draft = cohort.status === "DRAFT" || cohort.status === "REJECTED";
  const canEdit = can(actor, "cohort.edit");
  const showsNy = actor.roles.includes("CEO");

  return (
    <>
      <AdminHeader title={cohort.code} description={cohort.course.title} back={{ href: "/admin/cohorts", label: "All cohorts" }} />
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-6">
          <Panel title="Details">
            <CohortForm cohort={cohort} {...options} readOnly={!canEdit || (!draft && cohort.status !== "PUBLISHED")} statusOnly={canEdit && cohort.status === "PUBLISHED"} />
          </Panel>

          <Panel title="Timetable">
            <p className="-mt-2 mb-4 text-sm text-muted">
              Times are Nigeria time (WAT). New sessions are checked against every other cohort for venue and instructor clashes.
            </p>
            {cohort.sessions.length ? (
              <ul className="mb-6 divide-y divide-line rounded-[var(--radius-md)] border border-line">
                {cohort.sessions.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="font-medium">
                        {formatDateTimeWAT(s.startsAt)} – {formatDateTimeWAT(s.endsAt).split(", ").pop()}
                      </p>
                      {showsNy && <p className="text-sm text-muted">New York: {formatNewYork(s.startsAt)}</p>}
                      <p className="text-sm text-muted">
                        {s.venue?.name ?? "No venue"} · {s.instructor?.name ?? "No instructor"}
                        {s.note && <> · {s.note}</>}
                      </p>
                    </div>
                    {can(actor, "timetable.edit") && (
                      <ActionForm action={removeSessionAction}>
                        <input type="hidden" name="sessionId" value={s.id} />
                        <SubmitButton variant="quiet" size="sm" pendingLabel="Removing…">
                          Remove
                        </SubmitButton>
                      </ActionForm>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-6 text-muted">No sessions scheduled yet.</p>
            )}
            {can(actor, "timetable.edit") && (
              <ActionForm action={addSessionAction} resetOnSuccess className="space-y-4">
                <input type="hidden" name="cohortId" value={cohort.id} />
                <h3 className="font-display font-semibold">Add a session</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField name="startsAt" label="Starts (WAT)" type="datetime-local" required />
                  <TextField name="endsAt" label="Ends (WAT)" type="datetime-local" required />
                  <SelectField name="venueId" label="Venue" placeholder="Cohort default" options={options.venues.map((v) => ({ value: v.id, label: v.name }))} />
                  <SelectField name="instructorId" label="Instructor" placeholder="Cohort default" options={options.instructors.map((v) => ({ value: v.id, label: v.name }))} />
                  <TextField name="note" label="Note" className="md:col-span-2" />
                </div>
                <SubmitButton variant="secondary" pendingLabel="Checking for clashes…">
                  Add session
                </SubmitButton>
              </ActionForm>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <WorkflowPanel actor={actor} entity="cohort" record={cohort} names={names} />

          <Panel title="Fee" id="fees">
            <p className="font-display text-2xl font-bold text-navy-900">{cohort.feeKobo != null ? formatNaira(cohort.feeKobo) : "Not set"}</p>
            <p className="text-sm text-muted">Live fee. It changes only after a different authorised person approves a proposal.</p>

            {cohort.proposedFeeKobo != null && (
              <div className="mt-4 rounded-[var(--radius-md)] border border-gold-500/60 bg-gold-100/60 p-4">
                <p className="font-medium">Proposed: {formatNaira(cohort.proposedFeeKobo)}</p>
                <p className="text-sm text-muted">
                  By {names.get(cohort.feeProposedById ?? "") ?? "—"}
                  {cohort.feeProposedAt && <>, {formatDateTimeWAT(cohort.feeProposedAt)}</>}
                </p>
                {cohort.feeProposalReason && <p className="mt-1 text-sm">Reason: {cohort.feeProposalReason}</p>}
                {can(actor, "fees.approve") && cohort.feeProposedById !== actor.userId ? (
                  <ActionForm action={decideFeeAction} className="mt-3 space-y-3">
                    <input type="hidden" name="id" value={cohort.id} />
                    <TextArea name="reason" label="Note" rows={2} hint="Required if returning the proposal." />
                    <div className="flex gap-2">
                      <SubmitButton name="decision" value="approve" size="sm">
                        Approve fee
                      </SubmitButton>
                      <SubmitButton name="decision" value="reject" size="sm" variant="secondary">
                        Return
                      </SubmitButton>
                    </div>
                  </ActionForm>
                ) : (
                  <p className="mt-2 text-sm text-muted">Waiting for an authorised approver.</p>
                )}
              </div>
            )}

            {can(actor, "fees.propose") && (
              <ActionForm action={proposeFeeAction} resetOnSuccess className="mt-5 space-y-3 border-t border-line pt-4">
                <input type="hidden" name="id" value={cohort.id} />
                <TextField name="amount" label="Propose a fee (₦)" required inputMode="decimal" placeholder="e.g. 45,000" />
                <TextArea name="reason" label="Reason" rows={2} required />
                <SubmitButton size="sm" variant="secondary">
                  Send for approval
                </SubmitButton>
              </ActionForm>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
