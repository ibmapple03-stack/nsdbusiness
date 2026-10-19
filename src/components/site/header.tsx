import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { ButtonLink } from "@/components/ui/button";

export const NAV = [
  { href: "/courses", label: "Courses" },
  { href: "/admissions", label: "Admissions" },
  { href: "/about", label: "About" },
  { href: "/corporate-training", label: "Corporate training" },
  { href: "/news", label: "News & events" },
  { href: "/contact", label: "Contact" },
];

const navLink =
  "rounded-[var(--radius-sm)] px-3 py-2 text-[0.9375rem] font-medium text-navy-800 transition-colors duration-150 hover:bg-navy-50 hover:text-navy-950";

/**
 * Header works without JavaScript: the mobile menu is a native <details>
 * disclosure, so it is keyboard- and screen-reader-accessible by default.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="rounded-[var(--radius-sm)]" aria-label="NSD Business Academy — home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={navLink}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ButtonLink href="/admissions" size="sm">
            Apply
          </ButtonLink>
        </div>

        <details className="group relative lg:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-[var(--radius-sm)] px-3 font-display text-[0.9375rem] font-semibold text-navy-800 hover:bg-navy-50 [&::-webkit-details-marker]:hidden">
            <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="group-open:hidden" />
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="hidden group-open:block" />
            </svg>
            Menu
          </summary>
          <nav aria-label="Main" className="fixed inset-x-0 top-16 border-b border-line bg-paper shadow-[var(--shadow-floating)]">
            <ul className="container-page grid gap-1 py-4">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={`${navLink} block py-3 text-base`}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-3 grid border-t border-line pt-4">
                <ButtonLink href="/admissions">Apply</ButtonLink>
              </li>
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}
