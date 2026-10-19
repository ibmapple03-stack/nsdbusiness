import Link from "next/link";
import { AdminHeader, Table, rowLink, td } from "@/components/admin/page-parts";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { requireStaffPage } from "@/server/auth/session";
import { db } from "@/server/db";
import { formatDateTimeWAT } from "@/lib/time";

// Session-dependent staff page, rendered per request.
export const instant = false;

export const metadata = { title: "Events" };

export default async function EventsAdminPage() {
  const actor = await requireStaffPage("content.edit");
  const events = await db.event.findMany({ where: { organisationId: actor.organisationId }, orderBy: { startsAt: "desc" } });
  return (
    <>
      <AdminHeader title="Events" actions={<ButtonLink href="/admin/events/new">New event</ButtonLink>} />
      {events.length ? (
        <Table caption="Events" head={["Event", "Starts", "Status"]}>
          {events.map((e) => (
            <tr key={e.id}>
              <td className={td}>
                <Link href={`/admin/events/${e.id}`} className={rowLink}>
                  {e.title}
                </Link>
              </td>
              <td className={td}>{formatDateTimeWAT(e.startsAt)}</td>
              <td className={td}>
                <StatusBadge status={e.status} />
              </td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState title="No events yet" action={<ButtonLink href="/admin/events/new">Add an event</ButtonLink>} />
      )}
    </>
  );
}
