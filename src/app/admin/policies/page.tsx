import Link from "next/link";
import { AdminHeader, Table, rowLink, td } from "@/components/admin/page-parts";
import { StatusBadge } from "@/components/ui/badge";
import { requireStaffPage } from "@/server/auth/session";
import { db } from "@/server/db";
import { formatDate } from "@/lib/time";

// Session-dependent staff page, rendered per request.
export const instant = false;

export const metadata = { title: "Policies" };

export default async function PoliciesAdminPage() {
  const actor = await requireStaffPage("policy.edit");
  const policies = await db.policy.findMany({ where: { organisationId: actor.organisationId }, orderBy: [{ slug: "asc" }, { version: "desc" }] });
  return (
    <>
      <AdminHeader
        title="Policies"
        description="Every policy needs management and legal review before publication. A published policy stays live while a new version is drafted."
      />
      <Table caption="Policies" head={["Policy", "Version", "Effective from", "Status"]}>
        {policies.map((p) => (
          <tr key={p.id}>
            <td className={td}>
              <Link href={`/admin/policies/${p.id}`} className={rowLink}>
                {p.title}
              </Link>
            </td>
            <td className={td}>v{p.version}</td>
            <td className={td}>{p.effectiveFrom ? formatDate(p.effectiveFrom, "short") : "—"}</td>
            <td className={td}>
              <StatusBadge status={p.status} />
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
