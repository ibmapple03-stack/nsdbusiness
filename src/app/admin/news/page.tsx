import Link from "next/link";
import { AdminHeader, Table, rowLink, td } from "@/components/admin/page-parts";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { requireStaffPage } from "@/server/auth/session";
import { db } from "@/server/db";
import { formatDate } from "@/lib/time";

// Session-dependent staff page, rendered per request.
export const instant = false;

export const metadata = { title: "News" };

export default async function NewsAdminPage() {
  const actor = await requireStaffPage("content.edit");
  const posts = await db.newsPost.findMany({ where: { organisationId: actor.organisationId }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <AdminHeader title="News" description="Announcements must be verified before publication." actions={<ButtonLink href="/admin/news/new">New post</ButtonLink>} />
      {posts.length ? (
        <Table caption="News posts" head={["Title", "Published", "Status"]}>
          {posts.map((p) => (
            <tr key={p.id}>
              <td className={td}>
                <Link href={`/admin/news/${p.id}`} className={rowLink}>
                  {p.title}
                </Link>
              </td>
              <td className={td}>{p.publishedAt ? formatDate(p.publishedAt, "short") : "—"}</td>
              <td className={td}>
                <StatusBadge status={p.status} />
              </td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState title="No posts yet" action={<ButtonLink href="/admin/news/new">Write the first post</ButtonLink>} />
      )}
    </>
  );
}
