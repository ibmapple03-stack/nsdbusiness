"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavGroup = { label: string; items: { href: string; label: string; count?: number }[] };

export function AdminNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Administration" className="space-y-6">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="px-3 text-xs font-medium text-navy-400">{g.label}</p>
          <ul className="mt-1.5 space-y-0.5">
            {g.items.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between rounded-[var(--radius-sm)] px-3 py-2 text-[0.9375rem] transition-colors duration-150 ${
                      active ? "bg-navy-700 font-medium text-white" : "text-navy-800 hover:bg-navy-100"
                    }`}
                  >
                    {item.label}
                    {!!item.count && (
                      <span className={`rounded-full px-2 text-xs font-semibold leading-5 ${active ? "bg-gold-500 text-navy-950" : "bg-gold-100 text-gold-700"}`}>
                        {item.count}
                        <span className="sr-only"> waiting</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
