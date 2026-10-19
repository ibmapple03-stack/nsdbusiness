import Link from "next/link";
import { AdminHeader, Table, rowLink, td } from "@/components/admin/page-parts";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { can } from "@/server/auth/actor";
import { requireStaffPage } from "@/server/auth/session";
import { db } from "@/server/db";
import { PILLAR_LABELS } from "@/lib/site";

// Session-dependent staff page, rendered per request.
export const instant = false;

export const metadata = { title: "Courses" };

export default async function AdminCoursesPage() {
  const actor = await requireStaffPage("course.view");
  const courses = await db.course.findMany({
    where: { organisationId: actor.organisationId },
    orderBy: { title: "asc" },
    include: { _count: { select: { cohorts: true } } },
  });

  return (
    <>
      <AdminHeader
        title="Courses"
        description="Course definitions are reusable. Scheduled runs with dates, venues and fees are managed as cohorts."
        actions={can(actor, "course.edit") && <ButtonLink href="/admin/courses/new">New course</ButtonLink>}
      />
      <Table caption="Courses" head={["Course", "Subject area", "Cohorts", "Status"]}>
        {courses.map((c) => (
          <tr key={c.id}>
            <td className={td}>
              <Link href={`/admin/courses/${c.id}`} className={rowLink}>
                {c.title}
              </Link>
              <p className="text-sm text-muted">/courses/{c.slug}</p>
            </td>
            <td className={td}>{PILLAR_LABELS[c.pillar]}</td>
            <td className={td}>{c._count.cohorts}</td>
            <td className={td}>
              <StatusBadge status={c.status} />
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
