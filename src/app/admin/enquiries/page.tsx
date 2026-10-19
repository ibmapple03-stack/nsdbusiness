import Link from "next/link";
import { AdminHeader, Table, rowLink, td } from "@/components/admin/page-parts";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { requireStaffPage } from "@/server/auth/session";
import { db } from "@/server/db";
import { formatDateTimeWAT } from "@/lib/time";

// Session-dependent staff page, rendered per request.
export const instant = false;

export const metadata = { title: "Enquiries" };

const ENQUIRY_TYPE = { CONTACT: "Contact", CORPORATE_TRAINING: "Corporate training", PARTNERSHIP: "Partnership" } as const;
const STATUS_TONE = { NEW: "attention", IN_PROGRESS: "info", CLOSED: "muted" } as const;

export default async function EnquiriesPage() {
  const actor = await requireStaffPage("enquiry.view");
  const enquiries = await db.enquiry.findMany({ where: { organisationId: actor.organisationId }, orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <>
      <AdminHeader title="Enquiries" description="Messages from the contact, corporate training and partnership forms." />
      {enquiries.length ? (
        <Table caption="Enquiries" head={["From", "Type", "Received", "Status"]}>
          {enquiries.map((e) => (
            <tr key={e.id}>
              <td className={td}>
                <Link href={`/admin/enquiries/${e.id}`} className={rowLink}>
                  {e.name}
                </Link>
                {e.organisationName && <p className="text-sm text-muted">{e.organisationName}</p>}
              </td>
              <td className={td}>{ENQUIRY_TYPE[e.type]}</td>
              <td className={td}>{formatDateTimeWAT(e.createdAt)}</td>
              <td className={td}>
                <Badge tone={STATUS_TONE[e.status]}>{e.status.replace("_", " ").toLowerCase()}</Badge>
              </td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState title="No enquiries yet">
          <p>Messages sent through the website will appear here.</p>
        </EmptyState>
      )}
    </>
  );
}
