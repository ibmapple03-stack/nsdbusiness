import { notFound } from "next/navigation";
import { AdminHeader, Panel } from "@/components/admin/page-parts";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { CheckboxGroup, TextArea } from "@/components/ui/field";
import { setActiveAction, setRolesAction } from "@/app/admin/actions";
import { ROLE_LABELS, STAFF_ROLES } from "@/server/auth/permissions";
import { requireStaffPage } from "@/server/auth/session";
import { db } from "@/server/db";

// Session-dependent staff page, rendered per request.
export const instant = false;

export default async function UserPage(props: PageProps<"/admin/users/[id]">) {
  const actor = await requireStaffPage("users.manage");
  const { id } = await props.params;
  const user = await db.user.findUnique({
    where: { id },
    include: { memberships: { where: { organisationId: actor.organisationId } } },
  });
  if (!user || !user.memberships.length) notFound();
  const active = user.memberships.some((m) => m.active);

  return (
    <>
      <AdminHeader title={user.name} description={user.email} back={{ href: "/admin/users", label: "All users" }} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Roles">
          <ActionForm action={setRolesAction} className="space-y-5">
            <input type="hidden" name="id" value={user.id} />
            <CheckboxGroup name="roles" legend="Roles in this academy" defaultValues={user.memberships.map((m) => m.role)} options={STAFF_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))} />
            <TextArea name="reason" label="Reason for the change" rows={2} required />
            <SubmitButton>Save roles</SubmitButton>
          </ActionForm>
        </Panel>
        {user.id !== actor.userId && (
          <Panel title={active ? "Deactivate" : "Reactivate"}>
            <p className="mb-4 text-[0.9375rem] text-muted">
              {active ? "Deactivating signs them out immediately and blocks access. Records they created are kept." : "Restores the roles shown on the left."}
            </p>
            <ActionForm action={setActiveAction} className="space-y-4">
              <input type="hidden" name="id" value={user.id} />
              <input type="hidden" name="active" value={active ? "false" : "true"} />
              <TextArea name="reason" label="Reason" rows={2} required />
              <SubmitButton variant={active ? "danger" : "primary"}>{active ? "Deactivate account" : "Reactivate account"}</SubmitButton>
            </ActionForm>
          </Panel>
        )}
      </div>
    </>
  );
}
