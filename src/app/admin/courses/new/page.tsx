import { AdminHeader, Panel } from "@/components/admin/page-parts";
import { CourseForm } from "@/components/admin/course-form";
import { requireStaffPage } from "@/server/auth/session";

// Session-dependent staff page, rendered per request.
export const instant = false;

export const metadata = { title: "New course" };

export default async function NewCoursePage() {
  await requireStaffPage("course.edit");
  return (
    <>
      <AdminHeader title="New course" back={{ href: "/admin/courses", label: "All courses" }} description="New courses start as drafts and are not visible on the website until approved and published." />
      <Panel>
        <CourseForm />
      </Panel>
    </>
  );
}
