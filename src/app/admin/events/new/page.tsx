import { AdminHeader, Panel } from "@/components/admin/page-parts";
import { EventForm } from "@/components/admin/news-event-forms";
import { requireStaffPage } from "@/server/auth/session";

// Session-dependent staff page, rendered per request.
export const instant = false;

export const metadata = { title: "New event" };

export default async function NewEventPage() {
  await requireStaffPage("content.edit");
  return (
    <>
      <AdminHeader title="New event" back={{ href: "/admin/events", label: "All events" }} />
      <Panel>
        <EventForm />
      </Panel>
    </>
  );
}
