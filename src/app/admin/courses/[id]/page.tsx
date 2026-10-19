import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader, Panel, rowLink } from "@/components/admin/page-parts";
import { CourseForm } from "@/components/admin/course-form";
import { WorkflowPanel } from "@/components/admin/workflow-panel";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { can } from "@/server/auth/actor";
import { requireStaffPage } from "@/server/auth/session";
import { userNames } from "@/server/admin-data";
import { db } from "@/server/db";
import { formatDate } from "@/lib/time";

// Session-dependent staff page, rendered per request.
export const instant = false;

export default async function AdminCoursePage(props: PageProps<"/admin/courses/[id]">) {
  const actor = await requireStaffPage("course.view");
  const { id } = await props.params;
  const course = await db.course.findFirst({
    where: { id, organisationId: actor.organisationId },
    include: { cohorts: { orderBy: { startDate: "asc" } } },
  });
  if (!course) notFound();
  const names = await userNames([course.submittedById, course.reviewedById]);
  const editable = can(actor, "course.edit") && (course.status === "DRAFT" || course.status === "REJECTED");

  return (
    <>
      <AdminHeader title={course.title} back={{ href: "/admin/courses", label: "All courses" }} />
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-6">
          {!editable && can(actor, "course.edit") && (
            <Alert tone="info" title="This course is locked for editing">
              <p>Records that are awaiting approval or published change only through the approval process. Use “Move back to draft” to make changes; a published course is then withdrawn from the website until it is approved again.</p>
            </Alert>
          )}
          <Panel>
            <CourseForm course={course} readOnly={!editable} />
          </Panel>
        </div>
        <div className="space-y-6">
          <WorkflowPanel actor={actor} entity="course" record={course} names={names} />
          <Panel title="Cohorts">
            {course.cohorts.length ? (
              <ul className="space-y-3">
                {course.cohorts.map((c) => (
                  <li key={c.id}>
                    <Link href={`/admin/cohorts/${c.id}`} className={rowLink}>
                      {c.code}
                    </Link>
                    <p className="text-sm text-muted">
                      {formatDate(c.startDate, "short")} · {c.cohortStatus.toLowerCase()}
                    </p>
                    <StatusBadge status={c.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No cohorts scheduled.</p>
            )}
            {can(actor, "cohort.edit") && (
              <ButtonLink href={`/admin/cohorts/new?course=${course.id}`} variant="secondary" size="sm" className="mt-4">
                Schedule a cohort
              </ButtonLink>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
