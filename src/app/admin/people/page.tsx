import Link from "next/link";
import { AdminHeader, Table, rowLink, td } from "@/components/admin/page-parts";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { requireStaffPage } from "@/server/auth/session";
import { db } from "@/server/db";

// Session-dependent staff page, rendered per request.
export const instant = false;

export const metadata = { title: "People" };

const KIND = { LEADERSHIP: "Leadership", STAFF: "Staff", INSTRUCTOR: "Instructor" };

export default async function PeoplePage() {
  const actor = await requireStaffPage("profile.edit");
  const people = await db.staffProfile.findMany({
    where: { organisationId: actor.organisationId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { reportsTo: { select: { name: true } } },
  });
  return (
    <>
      <AdminHeader
        title="People"
        description="Public profiles for leadership, staff and instructors. Profiles stay off the website until approved, and photos need separate approval."
        actions={<ButtonLink href="/admin/people/new">New profile</ButtonLink>}
      />
      <Table caption="Profiles" head={["Name", "Public title", "Reports to", "Type", "Status"]}>
        {people.map((p) => (
          <tr key={p.id}>
            <td className={td}>
              <Link href={`/admin/people/${p.id}`} className={rowLink}>
                {p.name}
              </Link>
              {p.internalNote && <p className="text-sm text-muted">{p.internalNote}</p>}
            </td>
            <td className={td}>{p.publicTitle}</td>
            <td className={td}>{p.reportsTo?.name ?? "—"}</td>
            <td className={td}>{KIND[p.kind]}</td>
            <td className={td}>
              <StatusBadge status={p.status} />
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
