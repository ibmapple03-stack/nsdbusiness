import { notFound } from "next/navigation";
import { AdminHeader, Panel } from "@/components/admin/page-parts";
import { NewsForm } from "@/components/admin/news-event-forms";
import { WorkflowPanel } from "@/components/admin/workflow-panel";
import { requireStaffPage } from "@/server/auth/session";
import { userNames } from "@/server/admin-data";
import { db } from "@/server/db";

// Session-dependent staff page, rendered per request.
export const instant = false;

export default async function NewsPostAdminPage(props: PageProps<"/admin/news/[id]">) {
  const actor = await requireStaffPage("content.edit");
  const { id } = await props.params;
  const post = await db.newsPost.findFirst({ where: { id, organisationId: actor.organisationId } });
  if (!post) notFound();
  const names = await userNames([post.submittedById, post.reviewedById]);
  return (
    <>
      <AdminHeader title={post.title} back={{ href: "/admin/news", label: "All news" }} />
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <Panel>
          <NewsForm post={post} readOnly={post.status !== "DRAFT" && post.status !== "REJECTED"} />
        </Panel>
        <WorkflowPanel actor={actor} entity="news" record={post} names={names} />
      </div>
    </>
  );
}
