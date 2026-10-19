import Link from "next/link";
import { AdminHeader, Table, rowLink, td } from "@/components/admin/page-parts";
import { StatusBadge } from "@/components/ui/badge";
import { requireStaffPage } from "@/server/auth/session";
import { db } from "@/server/db";

// Session-dependent staff page, rendered per request.
export const instant = false;

export const metadata = { title: "Page text" };

export default async function ContentPage() {
  const actor = await requireStaffPage("content.edit");
  const blocks = await db.contentBlock.findMany({ where: { organisationId: actor.organisationId }, orderBy: { key: "asc" } });
  return (
    <>
      <AdminHeader title="Page text" description="Editable text on the public pages. A block appears on the website only after it is approved and published." />
      <Table caption="Page text blocks" head={["Text", "Where it appears", "Status"]}>
        {blocks.map((b) => (
          <tr key={b.id}>
            <td className={td}>
              <Link href={`/admin/content/${b.id}`} className={rowLink}>
                {b.title}
              </Link>
            </td>
            <td className={`${td} text-muted`}>{b.location}</td>
            <td className={td}>
              <StatusBadge status={b.status} />
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
