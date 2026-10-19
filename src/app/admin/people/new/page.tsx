import { AdminHeader, Panel } from "@/components/admin/page-parts";
import { ProfileForm } from "@/components/admin/profile-form";
import { requireStaffPage } from "@/server/auth/session";
import { db } from "@/server/db";

// Session-dependent staff page, rendered per request.
export const instant = false;

export const metadata = { title: "New profile" };

export default async function NewProfilePage() {
  const actor = await requireStaffPage("profile.edit");
  const people = await db.staffProfile.findMany({ where: { organisationId: actor.organisationId }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  return (
    <>
      <AdminHeader title="New profile" back={{ href: "/admin/people", label: "All people" }} />
      <Panel>
        <ProfileForm people={people} />
      </Panel>
    </>
  );
}
