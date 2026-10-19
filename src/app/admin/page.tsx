import Link from "next/link";
import { AdminHeader, Panel, rowLink } from "@/components/admin/page-parts";
import { Badge } from "@/components/ui/badge";
import { can } from "@/server/auth/actor";
import { requireStaffPage } from "@/server/auth/session";
import { approvalCounts, instructorCohorts } from "@/server/admin-data";
import { db } from "@/server/db";
import { formatDate, formatDateTimeWAT } from "@/lib/time";

// Session-dependent staff page, rendered per request.
export const instant = false;

export default async function DashboardPage() {
  const actor = await requireStaffPage();
  const org = actor.organisationId;
  const counts = await approvalCounts(actor);

  const [courseStats, cohortStats, recentEnquiries, myCohorts, unverified] = await Promise.all([
    can(actor, "course.view") ? db.course.groupBy({ by: ["status"], where: { organisationId: org }, _count: true }) : null,
    can(actor, "course.view")
      ? db.cohort.findMany({ where: { organisationId: org, cohortStatus: { in: ["OPEN", "PLANNED", "RUNNING"] } }, orderBy: { startDate: "asc" }, take: 5, include: { course: { select: { title: true } } } })
      : null,
    can(actor, "enquiry.view") ? db.enquiry.findMany({ where: { organisationId: org }, orderBy: { createdAt: "desc" }, take: 5 }) : null,
    actor.roles.includes("INSTRUCTOR") ? instructorCohorts(actor) : null,
    can(actor, "settings.edit") ? db.siteSetting.count({ where: { organisationId: org, verified: false } }) : 0,
  ]);

  const published = courseStats?.find((s) => s.status === "PUBLISHED")?._count ?? 0;
  const totalCourses = courseStats?.reduce((a, s) => a + s._count, 0) ?? 0;

  return (
    <>
      <AdminHeader title={`Welcome, ${actor.name.split(" ")[0]}`} description="Times are shown in Nigeria time (WAT) unless marked otherwise." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {counts.canApprove && <Stat href="/admin/approvals" label="Waiting for your approval" value={counts.total} highlight={counts.total > 0} />}
        {courseStats && <Stat href="/admin/courses" label="Courses published" value={`${published} of ${totalCourses}`} />}
        {can(actor, "enquiry.view") && <Stat href="/admin/enquiries" label="New enquiries" value={counts.newEnquiries} highlight={counts.newEnquiries > 0} />}
        {can(actor, "settings.edit") && <Stat href="/admin/settings" label="Contact details not yet verified" value={unverified} />}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {cohortStats && (
          <Panel title="Current and upcoming cohorts">
            {cohortStats.length ? (
              <ul className="divide-y divide-line">
                {cohortStats.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <Link href={`/admin/cohorts/${c.id}`} className={rowLink}>
                        {c.code}
                      </Link>
                      <p className="text-sm text-muted">{c.course.title}</p>
                    </div>
                    <div className="text-right text-sm text-muted">
                      <Badge tone={c.cohortStatus === "OPEN" ? "positive" : "neutral"}>{c.cohortStatus.toLowerCase()}</Badge>
                      <p className="mt-1">Starts {formatDate(c.startDate, "short")}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No cohorts are planned yet.</p>
            )}
          </Panel>
        )}

        {recentEnquiries && (
          <Panel title="Latest enquiries">
            {recentEnquiries.length ? (
              <ul className="divide-y divide-line">
                {recentEnquiries.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link href={`/admin/enquiries/${e.id}`} className={rowLink}>
                        {e.name}
                      </Link>
                      <p className="truncate text-sm text-muted">{e.subject || e.message}</p>
                    </div>
                    <span className="shrink-0 text-sm text-muted">{formatDateTimeWAT(e.createdAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No enquiries yet.</p>
            )}
          </Panel>
        )}

        {myCohorts && (
          <Panel title="Your assigned cohorts">
            {myCohorts.length ? (
              <ul className="divide-y divide-line">
                {myCohorts.map((c) => (
                  <li key={c.id} className="py-3">
                    <p className="font-medium">
                      {c.code} — {c.course.title}
                    </p>
                    <p className="text-sm text-muted">
                      {formatDate(c.startDate, "short")} to {formatDate(c.endDate, "short")}
                      {c.venue && <> · {c.venue.name}</>}
                    </p>
                    {c.sessions.length > 0 && <p className="text-sm text-muted">Next session: {formatDateTimeWAT(c.sessions[0].startsAt)}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">You have not been assigned to a cohort yet. Teaching tools (attendance, materials, assessments) arrive in Stage 3.</p>
            )}
          </Panel>
        )}
      </div>
    </>
  );
}

function Stat({ href, label, value, highlight = false }: { href: string; label: string; value: number | string; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className={`group rounded-[var(--radius-lg)] border bg-paper p-5 shadow-[var(--shadow-raised)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-floating)] ${highlight ? "border-gold-500" : "border-line"}`}
    >
      <p className="font-display text-3xl font-bold text-navy-900 tabular-nums">{value}</p>
      <p className="mt-1 text-[0.9375rem] text-muted group-hover:text-navy-800">{label}</p>
    </Link>
  );
}
