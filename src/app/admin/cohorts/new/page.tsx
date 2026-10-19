import { Suspense } from "react";
import { AdminHeader, Panel } from "@/components/admin/page-parts";
import { CohortForm } from "@/components/admin/cohort-form";
import { FormSkeleton } from "@/components/ui/misc";
import { requireStaffPage } from "@/server/auth/session";
import { cohortFormOptions } from "../options";

// Session-dependent staff page, rendered per request.
export const instant = false;

export const metadata = { title: "New cohort" };

export default async function NewCohortPage(props: PageProps<"/admin/cohorts/new">) {
  const actor = await requireStaffPage("cohort.edit");
  const options = await cohortFormOptions(actor.organisationId);
  return (
    <>
      <AdminHeader title="Schedule a cohort" back={{ href: "/admin/cohorts", label: "All cohorts" }} description="Set the fee after saving — fees are proposed and approved separately." />
      <Panel>
        <Suspense fallback={<FormSkeleton />}>
          {props.searchParams.then(({ course }) => (
            <CohortForm {...options} defaultCourseId={typeof course === "string" ? course : undefined} />
          ))}
        </Suspense>
      </Panel>
    </>
  );
}
