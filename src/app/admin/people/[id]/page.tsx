import Image from "next/image";
import { notFound } from "next/navigation";
import { AdminHeader, Panel } from "@/components/admin/page-parts";
import { ProfileForm } from "@/components/admin/profile-form";
import { WorkflowPanel } from "@/components/admin/workflow-panel";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { TextField } from "@/components/ui/field";
import { photoApprovalAction } from "@/app/admin/actions";
import { can } from "@/server/auth/actor";
import { requireStaffPage } from "@/server/auth/session";
import { userNames } from "@/server/admin-data";
import { db } from "@/server/db";

// Session-dependent staff page, rendered per request.
export const instant = false;

export default async function ProfilePage(props: PageProps<"/admin/people/[id]">) {
  const actor = await requireStaffPage("profile.edit");
  const { id } = await props.params;
  const profile = await db.staffProfile.findFirst({ where: { id, organisationId: actor.organisationId } });
  if (!profile) notFound();
  const people = await db.staffProfile.findMany({ where: { organisationId: actor.organisationId }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  const names = await userNames([profile.submittedById, profile.reviewedById]);
  const editable = profile.status === "DRAFT" || profile.status === "REJECTED";

  return (
    <>
      <AdminHeader title={profile.name} description={profile.publicTitle} back={{ href: "/admin/people", label: "All people" }} />
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <Panel>
          <ProfileForm profile={profile} people={people} readOnly={!editable} />
        </Panel>
        <div className="space-y-6">
          <WorkflowPanel actor={actor} entity="profile" record={profile} names={names} />
          <Panel title="Photo">
            {profile.photoPath ? (
              <>
                <div className="relative aspect-[4/5] w-40 overflow-hidden rounded-[var(--radius-md)] bg-navy-100">
                  {/* Staff preview through the admin-only route, regardless of approval. */}
                  <Image src={`/admin/media/profile/${profile.id}`} alt={`Photo on file for ${profile.name}`} fill sizes="10rem" className="object-cover object-top" unoptimized />
                </div>
                <p className="mt-3 text-sm text-muted">{profile.photoApproved ? "Approved for publication." : "Not approved for publication — the website shows initials instead."}</p>
                {can(actor, "profile.approve") && (
                  <ActionForm action={photoApprovalAction} className="mt-3 space-y-3">
                    <input type="hidden" name="id" value={profile.id} />
                    <input type="hidden" name="approved" value={profile.photoApproved ? "false" : "true"} />
                    <TextField name="reason" label="Note" hint="e.g. Approved by email on 2 Nov" />
                    <SubmitButton size="sm" variant={profile.photoApproved ? "secondary" : "primary"}>
                      {profile.photoApproved ? "Withdraw photo" : "Approve photo for publication"}
                    </SubmitButton>
                  </ActionForm>
                )}
              </>
            ) : (
              <p className="text-sm text-muted">No photo on file. Photo uploads arrive with private file storage in Stage 2.</p>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
