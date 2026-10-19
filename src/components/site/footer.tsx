import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { SITE } from "@/lib/site";
import { getVerifiedContact } from "@/server/public-data";

const POLICY_LINKS = [
  { href: "/policies/privacy", label: "Privacy notice" },
  { href: "/policies/terms", label: "Terms of use" },
  { href: "/policies/enrolment-and-refunds", label: "Enrolment and refunds" },
  { href: "/policies/complaints", label: "Complaints" },
  { href: "/policies/accessibility", label: "Accessibility" },
];

const link = "text-navy-200 underline-offset-4 transition-colors hover:text-white hover:underline";

export async function SiteFooter() {
  const contact = await getVerifiedContact();
  return (
    <footer className="mt-auto bg-navy-950 text-navy-200">
      <div className="h-1 bg-gradient-to-r from-gold-500 via-gold-400 to-transparent" aria-hidden />
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo inverse />
          <p className="max-w-xs text-[0.9375rem] leading-relaxed">Learn skills. Build businesses. Create your future.</p>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold text-white">Learn</h2>
          <ul className="mt-3 space-y-2 text-[0.9375rem]">
            <li><Link className={link} href="/courses">Courses</Link></li>
            <li><Link className={link} href="/admissions">Admissions</Link></li>
            <li><Link className={link} href="/corporate-training">Corporate training</Link></li>
            <li><Link className={link} href="/news">News & events</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold text-white">Academy</h2>
          <ul className="mt-3 space-y-2 text-[0.9375rem]">
            <li><Link className={link} href="/about">About us</Link></li>
            <li><Link className={link} href="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold text-white">Contact</h2>
          <address className="mt-3 space-y-1 text-[0.9375rem] not-italic">
            <p>{contact.address ?? SITE.location}</p>
            {contact.phone && <p><a className={link} href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a></p>}
            {contact.email && <p><a className={link} href={`mailto:${contact.email}`}>{contact.email}</a></p>}
          </address>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-4 py-6 text-sm sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-xl text-navy-400">{SITE.statusStatement}</p>
          <nav aria-label="Policies">
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {POLICY_LINKS.map((p) => (
                <li key={p.href}><Link className={link} href={p.href}>{p.label}</Link></li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
