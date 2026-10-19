import { notFound } from "next/navigation";
import { AdminHeader, Panel } from "@/components/admin/page-parts";
import { WorkflowPanel } from "@/components/admin/workflow-panel";
import { Alert } from "@/components/ui/alert";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { TextArea, TextField } from "@/components/ui/field";
import { newPolicyVersionAction, savePolicyAction } from "@/app/admin/actions";
import { requireStaffPage } from "@/server/auth/session";
import { userNames } from "@/server/admin-data";
import { db } from "@/server/db";

// Session-dependent staff page, rendered per request.
export const instant = false;

export default async function PolicyAdminPage(props: PageProps<"/admin/policies/[id]">) {
  const actor = await requireStaffPage("policy.edit");
  const { id } = await props.params;
  const policy = await db.policy.findFirst({ where: { id, organisationId: actor.organisationId } });
  if (!policy) notFound();
  const names = await userNames([policy.submittedById, policy.reviewedById]);
  const editable = policy.status === "DRAFT" || policy.status === "REJECTED";

  return (
    <>
      <AdminHeader title={`${policy.title} (v${policy.version})`} back={{ href: "/admin/policies", label: "All policies" }} />
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {policy.status !== "PUBLISHED" && (
            <Alert tone="warning" title="Management and legal review required">
              <p>Do not approve this policy until a qualified legal adviser has reviewed it. Replace every [bracketed] item with confirmed facts.</p>
            </Alert>
          )}
          <Panel>
            <ActionForm action={savePolicyAction} className="space-y-5">
              <input type="hidden" name="id" value={policy.id} />
              <fieldset disabled={!editable} className="space-y-5 disabled:opacity-80">
                <TextField name="title" label="Title" required defaultValue={policy.title} />
                <TextArea name="summary" label="Summary" rows={2} defaultValue={policy.summary} />
                <TextArea name="body" label="Policy text" rows={24} defaultValue={policy.body} hint="Plain text. “## ” for headings, “- ” for bullets." />
              </fieldset>
              {editable && <SubmitButton>Save policy</SubmitButton>}
            </ActionForm>
          </Panel>
        </div>
        <div className="space-y-6">
          <WorkflowPanel actor={actor} entity="policy" record={policy} names={names} />
          {policy.status === "PUBLISHED" && (
            <Panel title="Revise">
              <p className="mb-3 text-sm text-muted">Start version {policy.version + 1} as a draft. This version stays live until the new one is published.</p>
              <ActionForm action={newPolicyVersionAction}>
                <input type="hidden" name="id" value={policy.id} />
                <SubmitButton size="sm" variant="secondary">
                  Start a new version
                </SubmitButton>
              </ActionForm>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
