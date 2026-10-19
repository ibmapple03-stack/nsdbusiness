import Link from "next/link";
import { AdminHeader, Table, rowLink, td } from "@/components/admin/page-parts";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { forbidden } from "next/navigation";
import { requireStaffPage } from "@/server/auth/session";
import { approvalQueue, approvalCounts } from "@/server/admin-data";
import { WORKFLOW_ENTITIES } from "@/server/services/workflow-service";
import { formatDateTimeWAT } from "@/lib/time";

// Session-dependent staff page, rendered per request.
export const instant = false;

export const metadata = { title: "Approvals" };

export default async function ApprovalsPage() {
  const actor = await requireStaffPage();
  if (!(await approvalCounts(actor)).canApprove) forbidden();
  const queue = await approvalQueue(actor);

  return (
    <>
      <AdminHeader title="Approvals" description="Items submitted for a decision that your role can approve. You cannot approve something you submitted yourself." />
      {queue.length ? (
        <Table caption="Items awaiting approval" head={["Item", "Type", "Submitted by", "Submitted"]}>
          {queue.map((q) => (
            <tr key={`${q.entity}-${q.id}`}>
              <td className={td}>
                <Link href={q.href} className={rowLink}>
                  {q.title}
                </Link>
                {q.mine && <p className="text-sm text-muted">Submitted by you — another approver must decide.</p>}
              </td>
              <td className={td}>
                <Badge tone={q.entity === "fee" ? "attention" : "neutral"}>{q.entity === "fee" ? "Fee change" : WORKFLOW_ENTITIES[q.entity].label}</Badge>
              </td>
              <td className={td}>{q.submittedBy ?? "—"}</td>
              <td className={td}>{q.submittedAt ? formatDateTimeWAT(q.submittedAt) : "—"}</td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState title="Nothing is waiting for you">
          <p>Submitted courses, cohorts, profiles, page text, policies and fee changes will appear here.</p>
        </EmptyState>
      )}
    </>
  );
}
