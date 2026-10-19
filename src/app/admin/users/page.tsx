import Link from "next/link";
import { Suspense } from "react";
import { AdminHeader, Table, rowLink, td } from "@/components/admin/page-parts";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ROLE_LABELS } from "@/server/auth/permissions";
import { requireStaffPage } from "@/server/auth/session";
import { db } from "@/server/db";

// Session-dependent staff page, rendered per request.
export const instant = false;

export const metadata = { title: "Users & access" };

export default async function UsersPage(props: PageProps<"/admin/users">) {
  const actor = await requireStaffPage("users.manage");
  const members = await db.membership.findMany({
    where: { organisationId: actor.organisationId },
    include: { user: { select: { id: true, name: true, email: true, emailVerified: true, twoFactorEnabled: true } } },
    orderBy: { user: { name: "asc" } },
  });
  const users = new Map<string, { user: (typeof members)[number]["user"]; roles: string[]; active: boolean }>();
  for (const m of members) {
    const entry = users.get(m.userId) ?? { user: m.user, roles: [], active: false };
    entry.roles.push(ROLE_LABELS[m.role]);
    entry.active ||= m.active;
    users.set(m.userId, entry);
  }

  return (
    <>
      <AdminHeader
        title="Users and access"
        description="Accounts for this academy only. Access to another organisation's records (for example SABFI) is never granted from here."
        actions={<ButtonLink href="/admin/users/new">Add a staff member</ButtonLink>}
      />
      <Suspense>
        {props.searchParams.then(({ created }) => (created ? <Alert tone="success" title="Account created. A link to set a password has been emailed to them." /> : null))}
      </Suspense>
      <Table caption="Staff accounts" head={["Name", "Roles", "Email confirmed", "Two-step sign-in", "Access"]}>
        {[...users.values()].map(({ user, roles, active }) => (
          <tr key={user.id}>
            <td className={td}>
              <Link href={`/admin/users/${user.id}`} className={rowLink}>
                {user.name}
              </Link>
              <p className="text-sm text-muted">{user.email}</p>
            </td>
            <td className={td}>{roles.join(", ")}</td>
            <td className={td}>{user.emailVerified ? "Yes" : <Badge tone="attention">Pending</Badge>}</td>
            <td className={td}>{user.twoFactorEnabled ? "On" : <Badge tone="attention">Not set up</Badge>}</td>
            <td className={td}>{active ? <Badge tone="positive">Active</Badge> : <Badge tone="negative">Deactivated</Badge>}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
