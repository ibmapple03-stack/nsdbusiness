import { Suspense } from "react";
import { AdminHeader, Table, td } from "@/components/admin/page-parts";
import { Skeleton } from "@/components/ui/misc";
import { buttonClass } from "@/components/ui/button";
import { requireStaffPage } from "@/server/auth/session";
import { db } from "@/server/db";
import { formatDateTimeWAT, formatNewYork } from "@/lib/time";

// Session-dependent staff page, rendered per request.
export const instant = false;

export const metadata = { title: "Audit log" };

const PAGE_SIZE = 50;

export default async function AuditPage(props: PageProps<"/admin/audit">) {
  await requireStaffPage("audit.view");
  return (
    <>
      <AdminHeader title="Audit log" description="Every sensitive action: who acted, when and why. Personal details are redacted from snapshots. Entries cannot be edited or deleted from the application." />
      <Suspense fallback={<Skeleton className="h-96" />}>
        <Entries searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function Entries({ searchParams }: Pick<PageProps<"/admin/audit">, "searchParams">) {
  const actor = await requireStaffPage("audit.view");
  const { page, q } = await searchParams;
  const pageNo = Math.max(1, Number(page) || 1);
  const query = typeof q === "string" ? q.trim().slice(0, 60) : "";
  const where = {
    organisationId: actor.organisationId,
    ...(query ? { OR: [{ action: { contains: query } }, { actorLabel: { contains: query, mode: "insensitive" as const } }, { entityType: { contains: query } }] } : {}),
  };
  const [rows, total] = await Promise.all([
    db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (pageNo - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.auditLog.count({ where }),
  ]);
  const showNy = actor.roles.includes("CEO");
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <form method="get" className="mb-4 flex max-w-md gap-2" role="search">
        <label htmlFor="q" className="sr-only">
          Filter by action, person or record type
        </label>
        <input id="q" name="q" defaultValue={query} placeholder="Filter, e.g. fee or Demo CEO" className="flex-1 rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2" />
        <button className={buttonClass("secondary", "sm")}>Filter</button>
      </form>
      <Table caption="Audit log entries" head={["When", "Who", "Action", "Record", "Reason / change"]}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className={`${td} whitespace-nowrap`}>
              {formatDateTimeWAT(r.createdAt)}
              {showNy && <p className="text-xs text-muted">{formatNewYork(r.createdAt)}</p>}
            </td>
            <td className={td}>{r.actorLabel}</td>
            <td className={`${td} font-mono text-sm`}>{r.action}</td>
            <td className={`${td} text-sm text-muted`}>
              {r.entityType} · {r.entityId.slice(0, 10)}
            </td>
            <td className={`${td} text-sm`}>
              {r.reason && <p>{r.reason}</p>}
              {(r.before || r.after) && (
                <details>
                  <summary className="cursor-pointer text-navy-700">Details</summary>
                  <pre className="mt-1 max-w-md overflow-x-auto whitespace-pre-wrap rounded bg-surface p-2 text-xs">{JSON.stringify({ before: r.before, after: r.after }, null, 1)}</pre>
                </details>
              )}
            </td>
          </tr>
        ))}
      </Table>
      <nav aria-label="Audit log pages" className="mt-4 flex items-center gap-4 text-sm">
        {pageNo > 1 && <a href={`?page=${pageNo - 1}&q=${encodeURIComponent(query)}`} className="underline">Newer</a>}
        <span className="text-muted">
          Page {pageNo} of {pages} · {total} entries
        </span>
        {pageNo < pages && <a href={`?page=${pageNo + 1}&q=${encodeURIComponent(query)}`} className="underline">Older</a>}
      </nav>
    </>
  );
}
