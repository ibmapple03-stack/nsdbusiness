import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/misc";
import { RichText, listItems } from "@/components/ui/rich-text";
import { SITE } from "@/lib/site";
import { getContentBlocks, getPublishedProfiles } from "@/server/public-data";

export const metadata: Metadata = {
  title: "About the academy",
  description: "The purpose, mission and leadership of NSD Business Academy Limited, Yola, Adamawa State.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [blocks, profiles] = await Promise.all([getContentBlocks(), getPublishedProfiles()]);
  const statements = (["about.purpose", "about.mission", "about.vision"] as const).map((k) => blocks[k]).filter(Boolean);
  const values = blocks["about.values"];
  const leadership = profiles.filter((p) => p.kind === "LEADERSHIP");
  const staff = profiles.filter((p) => p.kind === "STAFF");
  const instructors = profiles.filter((p) => p.kind === "INSTRUCTOR");

  return (
    <>
      <PageHeader
        title="About NSD Business Academy"
        intro="We deliver practical business, vocational, entrepreneurial and digital skills that help people improve their livelihoods, build enterprises and prepare for work."
      />

      {statements.length > 0 && (
        <section aria-label="Purpose, mission and vision" className="container-page py-14">
          <div className="grid gap-10 md:grid-cols-3">
            {statements.map((s) => (
              <div key={s!.title} className="border-t-2 border-navy-700 pt-5">
                <h2 className="text-xl font-semibold">{s!.title}</h2>
                <p className="mt-2 text-[1.0625rem] leading-relaxed text-muted">{s!.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {values && (
        <section aria-labelledby="values-heading" className="bg-surface py-14">
          <div className="container-page">
            <h2 id="values-heading" className="text-[1.75rem] font-bold tracking-[-0.02em]">
              {values.title}
            </h2>
            <dl className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {listItems(values.body).map((item) => {
                const [term, ...rest] = item.split(":");
                const description = rest.join(":").trim();
                return (
                  <div key={item}>
                    <dt className="font-display font-semibold text-navy-900">{term}</dt>
                    <dd className="mt-1 text-muted">{description.charAt(0).toUpperCase() + description.slice(1)}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </section>
      )}

      {leadership.length > 0 && (
        <section id="leadership" aria-labelledby="leadership-heading" className="container-page py-14">
          <h2 id="leadership-heading" className="text-[1.75rem] font-bold tracking-[-0.02em]">
            Leadership
          </h2>
          <div className="mt-8 space-y-12">
            {leadership.map((p) => (
              <article key={p.slug} className="grid gap-8 md:grid-cols-[14rem_1fr]">
                <Portrait name={p.name} photo={p.photo} />
                <div>
                  <h3 className="text-2xl font-bold tracking-[-0.02em]">{p.name}</h3>
                  <p className="mt-1 font-display font-medium text-gold-700">{p.publicTitle}</p>
                  <RichText text={p.bio} className="prose-academy mt-4" />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {(staff.length > 0 || instructors.length > 0) && (
        <section aria-labelledby="team-heading" className="border-t border-line py-14">
          <div className="container-page">
            <h2 id="team-heading" className="text-[1.75rem] font-bold tracking-[-0.02em]">
              Our team
            </h2>
            <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[...staff, ...instructors].map((p) => (
                <li key={p.slug} className="flex gap-4">
                  <div className="w-20 shrink-0">
                    <Portrait name={p.name} photo={p.photo} small />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="text-[0.9375rem] text-muted">{p.publicTitle}</p>
                    {p.bio && <p className="mt-2 text-[0.9375rem]">{p.bio}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section aria-labelledby="status-heading" className="bg-navy-950 py-14 text-navy-100">
        <div className="container-page grid gap-8 md:grid-cols-[1fr_1.2fr]">
          <h2 id="status-heading" className="text-[1.75rem] font-bold tracking-[-0.02em] text-white">
            Registration and status
          </h2>
          <div className="space-y-4">
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[1rem]">
              <dt className="text-navy-400">Registered name</dt>
              <dd className="text-white">{SITE.legalName}</dd>
              <dt className="text-navy-400">Registered with</dt>
              <dd className="text-white">{SITE.cac.registrar}, Nigeria</dd>
              <dt className="text-navy-400">RC number</dt>
              <dd className="text-white">{SITE.cac.rcNumber}</dd>
              <dt className="text-navy-400">Incorporated</dt>
              <dd className="text-white">{SITE.cac.incorporated}</dd>
              <dt className="text-navy-400">Location</dt>
              <dd className="text-white">{SITE.location}</dd>
            </dl>
            <p className="text-[0.9375rem] text-navy-200">{SITE.accreditationStatement}</p>
          </div>
        </div>
      </section>
    </>
  );
}

function Portrait({ name, photo, small = false }: { name: string; photo: string | null; small?: boolean }) {
  const initials = name
    .replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  if (!photo) {
    return (
      <div role="img" aria-label={`Photo not yet available for ${name}`} className={`flex aspect-[4/5] w-full items-center justify-center rounded-[var(--radius-lg)] bg-navy-100 font-display font-bold text-navy-600 ${small ? "text-xl" : "text-4xl"}`}>
        {initials}
      </div>
    );
  }
  return (
    <div className="relative aspect-[4/5] w-full max-w-56 overflow-hidden rounded-[var(--radius-lg)] bg-navy-100">
      <Image src={photo} alt={`Portrait of ${name}`} fill sizes={small ? "5rem" : "14rem"} className="object-cover object-top" />
    </div>
  );
}
