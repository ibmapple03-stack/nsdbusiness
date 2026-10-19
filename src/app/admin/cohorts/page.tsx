import Link from "next/link";
import { AdminHeader, Table, rowLink, td } from "@/components/admin/page-parts";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { can } from "@/server/auth/actor";
import { requireStaffPage } from "@/server/auth/session";
import { db } from "@/server/db";
import { formatNaira } from "@/lib/money";
import { formatDate } from "@/lib/time";

// Session-dependent staff page, rendered per request.
export const instant = false;

export const metadata = { title: "Cohorts" };

export default async function CohortsPage() {
  const actor = await requireStaffPage("course.view");
  const cohorts = await db.cohort.findMany({
    where: { organisationId: actor.organisationId },
    orderBy: { startDate: "desc" },
    include: { course: { select: { title: true } }, venue: { select: { name: true } }, instructor: { select: { name: true } } },
  });
  return (
    <>
      <AdminHeader
        title="Cohorts and timetable"
        description="Each cohort is a scheduled run of a course with its own dates, venue, instructor, places and fee."
        actions={can(actor, "cohort.edit") && <ButtonLink href="/admin/cohorts/new">New cohort</ButtonLink>}
      />
      {cohorts.length ? (
        <Table caption="Cohorts" head={["Cohort", "Dates", "Venue / instructor", "Fee", "Stage", "Publication"]}>
          {cohorts.map((c) => (
            <tr key={c.id}>
              <td className={td}>
                <Link href={`/admin/cohorts/${c.id}`} className={rowLink}>
                  {c.code}
                </Link>
                <p className="text-sm text-muted">{c.course.title}</p>
              </td>
              <td className={td}>
                {formatDate(c.startDate, "short")} – {formatDate(c.endDate, "short")}
              </td>
              <td className={td}>
                {c.venue?.name ?? "—"}
                <p className="text-sm text-muted">{c.instructor?.name ?? "No instructor"}</p>
              </td>
              <td className={td}>
                {c.feeKobo != null ? formatNaira(c.feeKobo) : "Not set"}
                {c.proposedFeeKobo != null && (
                  <p>
                    <Badge tone="attention">Change proposed</Badge>
                  </p>
                )}
              </td>
              <td className={td}>{c.cohortStatus.toLowerCase()}</td>
              <td className={td}>
                <StatusBadge status={c.status} />
              </td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState title="No cohorts yet" action={can(actor, "cohort.edit") && <ButtonLink href="/admin/cohorts/new">Schedule the first cohort</ButtonLink>}>
          <p>Schedule a cohort once a course outline is ready.</p>
        </EmptyState>
      )}
    </>
  );
}
