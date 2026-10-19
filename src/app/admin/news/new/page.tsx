import { AdminHeader, Panel } from "@/components/admin/page-parts";
import { NewsForm } from "@/components/admin/news-event-forms";
import { requireStaffPage } from "@/server/auth/session";

// Session-dependent staff page, rendered per request.
export const instant = false;

export const metadata = { title: "New post" };

export default async function NewNewsPage() {
  await requireStaffPage("content.edit");
  return (
    <>
      <AdminHeader title="New post" back={{ href: "/admin/news", label: "All news" }} />
      <Panel>
        <NewsForm />
      </Panel>
    </>
  );
}
