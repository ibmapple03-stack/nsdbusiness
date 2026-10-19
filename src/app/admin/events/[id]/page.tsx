import { notFound } from "next/navigation";
import { AdminHeader, Panel } from "@/components/admin/page-parts";
import { EventForm } from "@/components/admin/news-event-forms";
import { WorkflowPanel } from "@/components/admin/workflow-panel";
import { requireStaffPage } from "@/server/auth/session";
import { userNames } from "@/server/admin-data";
import { db } from "@/server/db";

// Session-dependent staff page, rendered per request.
export const instant = false;

export default async function EventAdminPage(props: PageProps<"/admin/events/[id]">) {
  const actor = await requireStaffPage("content.edit");
  const { id } = await props.params;
  const event = await db.event.findFirst({ where: { id, organisationId: actor.organisationId } });
  if (!event) notFound();
  const names = await userNames([event.submittedById, event.reviewedById]);
  return (
    <>
      <AdminHeader title={event.title} back={{ href: "/admin/events", label: "All events" }} />
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <Panel>
          <EventForm event={event} readOnly={event.status !== "DRAFT" && event.status !== "REJECTED"} />
        </Panel>
        <WorkflowPanel actor={actor} entity="event" record={event} names={names} />
      </div>
    </>
  );
}
