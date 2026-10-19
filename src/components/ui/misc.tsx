import Link from "next/link";
import type { ReactNode } from "react";

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-navy-200 bg-navy-50/60 px-6 py-10 text-center">
      <p className="font-display text-lg font-semibold text-navy-900">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-prose text-muted">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Visible marker for unapproved text shown only in local preview mode. */
export function Breadcrumb({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden className="text-navy-200">/</span>}
            {item.href ? (
              <Link href={item.href} className="underline decoration-navy-200 underline-offset-4 hover:text-navy-900 hover:decoration-gold-500">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-[var(--radius-sm)] bg-navy-100 ${className}`} />;
}

export function PageHeader({ title, intro, children }: { title: string; intro?: ReactNode; children?: ReactNode }) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="container-page py-10 sm:py-14">
        {children}
        <h1 className="mt-3 max-w-3xl text-[clamp(2rem,4.5vw,3rem)] font-bold tracking-[-0.03em]">{title}</h1>
        {intro && <div className="mt-4 max-w-2xl text-lg text-muted">{intro}</div>}
      </div>
    </header>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading form">
      <Skeleton className="h-16" />
      <Skeleton className="h-16" />
      <Skeleton className="h-32" />
    </div>
  );
}
