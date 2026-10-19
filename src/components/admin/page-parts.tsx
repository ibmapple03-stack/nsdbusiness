import Link from "next/link";
import type { ReactNode } from "react";

export function AdminHeader({ title, description, back, actions }: { title: string; description?: ReactNode; back?: { href: string; label: string }; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back && (
          <Link href={back.href} className="text-sm text-navy-700 underline decoration-navy-200 underline-offset-4 hover:decoration-gold-500">
            {back.label}
          </Link>
        )}
        <h1 className="mt-1 text-[1.75rem] font-bold tracking-[-0.02em]">{title}</h1>
        {description && <div className="mt-1 max-w-3xl text-[0.9375rem] text-muted">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, children, id, className = "" }: { title?: string; children: ReactNode; id?: string; className?: string }) {
  return (
    <section id={id} aria-label={title} className={`rounded-[var(--radius-lg)] border border-line bg-paper p-5 shadow-[var(--shadow-raised)] sm:p-6 ${className}`}>
      {title && <h2 className="mb-4 text-lg font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

/** Accessible data table that scrolls horizontally on small screens. */
export function Table({ caption, head, children, empty }: { caption: string; head: string[]; children: ReactNode; empty?: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-paper shadow-[var(--shadow-raised)]">
      <table className="w-full min-w-[40rem] text-left text-[0.9375rem]">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-line bg-surface text-sm text-muted">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
      {empty}
    </div>
  );
}

export const td = "px-4 py-3 align-top";
export const rowLink = "font-medium text-navy-800 underline decoration-navy-200 underline-offset-4 hover:decoration-gold-500";
