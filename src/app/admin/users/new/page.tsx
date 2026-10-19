import { AdminHeader, Panel } from "@/components/admin/page-parts";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { CheckboxGroup, TextField } from "@/components/ui/field";
import { createUserAction } from "@/app/admin/actions";
import { ROLE_LABELS, STAFF_ROLES } from "@/server/auth/permissions";
import { requireStaffPage } from "@/server/auth/session";

// Session-dependent staff page, rendered per request.
export const instant = false;

export const metadata = { title: "Add a staff member" };

export default async function NewUserPage() {
  await requireStaffPage("users.manage");
  return (
    <>
      <AdminHeader title="Add a staff member" back={{ href: "/admin/users", label: "All users" }} description="They will receive an email link to set their own password, then set up two-step sign-in." />
      <Panel className="max-w-2xl">
        <ActionForm action={createUserAction} className="space-y-5">
          <TextField name="name" label="Full name" required autoComplete="off" />
          <TextField name="email" label="Work email" type="email" required autoComplete="off" />
          <CheckboxGroup name="roles" legend="Roles" hint="Give the fewest roles needed. See docs/roles-and-permissions.md for what each role can do." options={STAFF_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))} />
          <SubmitButton>Create account and send invitation</SubmitButton>
        </ActionForm>
      </Panel>
    </>
  );
}
