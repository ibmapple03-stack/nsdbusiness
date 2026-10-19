import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminNav, type NavGroup } from "@/components/admin/admin-nav";
import { DualClock } from "@/components/admin/clock";
import { SignOutButton } from "@/components/admin/sign-out";
import { LogoMark } from "@/components/site/logo";
import { Skeleton } from "@/components/ui/misc";
import { can, type Actor } from "@/server/auth/actor";
import { ROLE_LABELS } from "@/server/auth/permissions";
import { requireStaffPage } from "@/server/auth/session";
import { approvalCounts } from "@/server/admin-data";

// Staff pages depend on the session and redirect when signed out; they are not prefetched as instant.
export const instant = false;

export const metadata: Metadata = { title: { default: "Administration", template: "%s | NSD Admin" }, robots: { index: false, follow: false } };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Frame>{children}</Frame>
    </Suspense>
  );
}

async function Frame({ children }: { children: React.ReactNode }) {
  const actor = await requireStaffPage();
  const counts = await approvalCounts(actor);
  const groups = navFor(actor, counts);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <header className="bg-navy-950 text-white">
        <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <LogoMark inverse className="h-6" />
            <span className="font-display text-[0.9375rem] font-semibold">NSD Academy Admin</span>
          </Link>
          <div className="hidden md:block">
            <DualClock />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-right text-sm leading-tight sm:block">
              <span className="block font-medium">{actor.name}</span>
              <span className="block text-navy-400">{actor.roles.map((r) => ROLE_LABELS[r]).join(", ")}</span>
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col lg:flex-row">
        <aside className="border-b border-line bg-paper px-3 py-4 lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:py-6">
          <details className="lg:hidden">
            <summary className="cursor-pointer rounded-[var(--radius-sm)] px-3 py-2 font-display font-semibold text-navy-800">Menu</summary>
            <div className="mt-3">
              <AdminNav groups={groups} />
            </div>
          </details>
          <div className="hidden lg:block">
            <AdminNav groups={groups} />
          </div>
        </aside>
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 outline-none lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

/** Navigation shows only what the person can use. The server still checks every page and action. */
function navFor(actor: Actor, counts: Awaited<ReturnType<typeof approvalCounts>>): NavGroup[] {
  const groups: NavGroup[] = [
    {
      label: "Overview",
      items: [
        { href: "/admin", label: "Dashboard" },
        ...(counts.canApprove ? [{ href: "/admin/approvals", label: "Approvals", count: counts.total }] : []),
      ],
    },
  ];
  const catalogue = [
    can(actor, "course.view") && { href: "/admin/courses", label: "Courses" },
    can(actor, "course.view") && { href: "/admin/cohorts", label: "Cohorts & timetable" },
    can(actor, "venue.edit") && { href: "/admin/venues", label: "Venues" },
  ].filter(Boolean) as NavGroup["items"];
  if (catalogue.length) groups.push({ label: "Courses", items: catalogue });

  const website = [
    can(actor, "profile.edit") && { href: "/admin/people", label: "People" },
    can(actor, "content.edit") && { href: "/admin/content", label: "Page text" },
    can(actor, "content.edit") && { href: "/admin/news", label: "News" },
    can(actor, "content.edit") && { href: "/admin/events", label: "Events" },
    can(actor, "policy.edit") && { href: "/admin/policies", label: "Policies" },
    can(actor, "settings.edit") && { href: "/admin/settings", label: "Contact details" },
  ].filter(Boolean) as NavGroup["items"];
  if (website.length) groups.push({ label: "Website", items: website });

  const office = [
    can(actor, "enquiry.view") && { href: "/admin/enquiries", label: "Enquiries", count: counts.newEnquiries },
    can(actor, "audit.view") && { href: "/admin/audit", label: "Audit log" },
    can(actor, "users.manage") && { href: "/admin/users", label: "Users & access" },
  ].filter(Boolean) as NavGroup["items"];
  if (office.length) groups.push({ label: "Office", items: office });

  groups.push({ label: "Account", items: [{ href: "/account/security", label: "Two-step sign-in" }] });
  return groups;
}

function ShellSkeleton() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface" role="status" aria-busy="true" aria-label="Loading administration">
      <div className="h-14 bg-navy-950" />
      <div className="flex flex-1">
        <div className="hidden w-64 space-y-3 border-r border-line bg-paper p-6 lg:block">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </div>
        <div className="flex-1 space-y-4 p-8">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-40" />
        </div>
      </div>
    </div>
  );
}
