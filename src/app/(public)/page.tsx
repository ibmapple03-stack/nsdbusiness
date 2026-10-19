import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { StageBadge } from "@/components/ui/badge";
import { RichText, listItems } from "@/components/ui/rich-text";
import { CourseRow } from "@/components/site/course-row";
import { FORMAT_DESCRIPTIONS, FORMAT_LABELS, SITE } from "@/lib/site";
import { formatDate } from "@/lib/time";
import {
  STAGE_LABELS,
  getContentBlocks,
  getPublishedCourse,
  getPublishedCourses,
  getPublishedNews,
  getPublishedProfiles,
  getUpcomingCohorts,
  getVerifiedContact,
  deriveStage,
} from "@/server/public-data";
import type { DeliveryFormat } from "@/content/types";

export default async function HomePage() {
  const [blocks, courses, cohorts, profiles, news, contact] = await Promise.all([
    getContentBlocks(),
    getPublishedCourses(),
    getUpcomingCohorts(4),
    getPublishedProfiles(),
    getPublishedNews(),
    getVerifiedContact(),
  ]);

  const intro = blocks["home.intro"];
  const audience = blocks["home.audience"];
  const founder = profiles.find((p) => p.kind === "LEADERSHIP");
  // Only formats that a published course actually offers.
  const formats = [...new Set(courses.flatMap((c) => c.deliveryFormats))] as DeliveryFormat[];

  return (
    <>
      <Hero cohorts={cohorts} />

      {(intro || audience) && (
        <section aria-labelledby="intro-heading" className="container-page grid gap-10 py-16 lg:grid-cols-[1.3fr_1fr] lg:gap-16 lg:py-20">
          {intro && (
            <div>
              <h2 id="intro-heading" className="text-[clamp(1.75rem,3.5vw,2.375rem)] font-bold tracking-[-0.03em]">
                {intro.title}
              </h2>
              <RichText text={intro.body} className="prose-academy mt-4 text-lg text-muted" />
            </div>
          )}
          {audience && (
            <div className="lg:pt-2">
              <h2 className="text-xl font-semibold">{audience.title}</h2>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {listItems(audience.body).map((item) => (
                  <li key={item} className="py-3 text-[1rem]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section aria-labelledby="courses-heading" className="bg-surface py-16 lg:py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="courses-heading" className="text-[clamp(1.75rem,3.5vw,2.375rem)] font-bold tracking-[-0.03em]">
              Courses
            </h2>
            {courses.length > 0 && (
              <Link href="/courses" className="font-display font-semibold text-navy-700 underline decoration-navy-200 underline-offset-4 hover:decoration-gold-500">
                See all courses and filters
              </Link>
            )}
          </div>
          {courses.length ? (
            <ul className="mt-8 divide-y divide-line overflow-hidden rounded-[var(--radius-lg)] border border-line shadow-[var(--shadow-raised)]">
              {courses.slice(0, 6).map((c) => (
                <CourseRow key={c.slug} course={c} />
              ))}
            </ul>
          ) : (
            <p className="mt-4 max-w-2xl text-lg text-muted">
              Our first courses are being prepared. They will be listed here, with dates and fees, as soon as they are confirmed.
            </p>
          )}
        </div>
      </section>

      {formats.length > 0 && (
        <section aria-labelledby="formats-heading" className="container-page py-16 lg:py-20">
          <h2 id="formats-heading" className="text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.03em]">
            How courses are taught
          </h2>
          <dl className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {formats.map((f) => (
              <div key={f} className="border-t-2 border-navy-700 pt-4">
                <dt className="font-display text-lg font-semibold text-navy-900">{FORMAT_LABELS[f]}</dt>
                <dd className="mt-1 text-muted">{FORMAT_DESCRIPTIONS[f]}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {courses.length > 0 && <Outcomes courses={courses} />}

      {founder && (
        <section aria-labelledby="founder-heading" className="bg-navy-950 text-navy-100">
          <div className="container-page grid items-center gap-10 py-16 md:grid-cols-[minmax(0,14rem)_1fr] lg:py-20">
            <FounderPortrait photo={founder.photo} name={founder.name} />
            <div>
              <h2 id="founder-heading" className="text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.03em] text-white">
                {founder.name}
              </h2>
              <p className="mt-1 font-display text-gold-400">{founder.publicTitle}</p>
              <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed">{founder.bio}</p>
              <Link href="/about#leadership" className="mt-6 inline-block font-display font-semibold text-white underline decoration-gold-500 underline-offset-4 hover:text-gold-100">
                Read more about the academy&rsquo;s leadership
              </Link>
            </div>
          </div>
        </section>
      )}

      {news.length > 0 && (
        <section aria-labelledby="news-heading" className="container-page py-16 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="news-heading" className="text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.03em]">
              Announcements
            </h2>
            <Link href="/news" className="font-display font-semibold text-navy-700 underline decoration-navy-200 underline-offset-4 hover:decoration-gold-500">
              All news and events
            </Link>
          </div>
          <ul className="mt-6 grid gap-6 md:grid-cols-3">
            {news.slice(0, 3).map((n) => (
              <li key={n.slug} className="border-t border-line pt-4">
                {n.publishedAt && <p className="text-sm text-muted">{formatDate(n.publishedAt)}</p>}
                <h3 className="mt-1 text-lg font-semibold">
                  <Link href={`/news/${n.slug}`} className="hover:underline hover:decoration-gold-500 hover:underline-offset-4">
                    {n.title}
                  </Link>
                </h3>
                {n.summary && <p className="mt-1 text-[0.9375rem] text-muted">{n.summary}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="contact-heading" className="border-t border-line bg-surface">
        <div className="container-page flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="contact-heading" className="text-2xl font-bold tracking-[-0.02em]">
              Talk to the academy
            </h2>
            <p className="mt-2 text-muted">
              {contact.address ?? SITE.location}
              {contact.phone && <> · {contact.phone}</>}
              {contact.officeHours && <> · {contact.officeHours}</>}
            </p>
          </div>
          <ButtonLink href="/contact" variant="secondary">
            Send us a message
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

function Hero({ cohorts }: { cohorts: Awaited<ReturnType<typeof getUpcomingCohorts>> }) {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden bg-navy-950 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60rem 30rem at 85% -10%, rgb(42 78 124 / 0.55), transparent 60%), radial-gradient(40rem 24rem at -10% 110%, rgb(30 58 95 / 0.7), transparent 60%)",
        }}
      />
      <div className="container-page relative grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.45fr_1fr] lg:items-center lg:py-24">
        <div>
          <h1 id="hero-heading" className="font-display text-[clamp(2.5rem,6.2vw,4.25rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-white">
            <span className="block">Learn skills.</span>
            <span className="relative block w-fit sm:whitespace-nowrap">
              Build businesses.
              <svg viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden className="absolute -bottom-3 left-0 h-[0.45em] w-full overflow-visible sm:-bottom-4">
                <path className="swoosh-path" pathLength={1} d="M4 30 C 110 44, 260 40, 396 6" fill="none" stroke="var(--color-gold-500)" strokeWidth="7" strokeLinecap="round" />
              </svg>
            </span>
            <span className="mt-3 block text-navy-200">Create your future.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-navy-100">
            Practical business, vocational and digital skills training in Yola, Adamawa State — for people starting out, growing a trade or preparing for work.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/courses" variant="inverse" size="lg">
              Explore courses
            </ButtonLink>
            <ButtonLink href="/admissions" size="lg" className="border border-white/30 bg-transparent shadow-none hover:bg-white/10">
              Apply
            </ButtonLink>
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] bg-paper p-6 text-ink shadow-[0_24px_60px_rgb(0_0_0/0.35)] sm:p-7">
          <h2 className="font-display text-lg font-semibold text-navy-900">Upcoming cohorts</h2>
          {cohorts.length ? (
            <ul className="mt-4 divide-y divide-line">
              {cohorts.map((c) => {
                const stage = deriveStage([c]);
                return (
                  <li key={c.code} className="py-3.5">
                    <Link href={`/courses/${c.course.slug}`} className="font-display font-semibold text-navy-800 hover:underline hover:decoration-gold-500 hover:underline-offset-4">
                      {c.course.title}
                    </Link>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                      <StageBadge stage={stage} label={STAGE_LABELS[stage]} />
                      <span>Starts {formatDate(c.startDate, "short")}</span>
                      {c.applicationDeadline && c.cohortStatus === "OPEN" && <span>Apply by {formatDate(c.applicationDeadline, "short")}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-muted">New cohort dates will appear here once they are confirmed. Contact the academy office to register your interest.</p>
          )}
        </div>
      </div>
    </section>
  );
}

/** Outcomes come from the published courses themselves — nothing is invented here. */
async function Outcomes({ courses }: { courses: { slug: string }[] }) {
  const details = (await Promise.all(courses.slice(0, 3).map((c) => getPublishedCourse(c.slug)))).filter((d) => d && d.outcomes.length);
  if (!details.length) return null;
  return (
    <section aria-labelledby="outcomes-heading" className="border-y border-line bg-surface py-16 lg:py-20">
      <div className="container-page">
        <h2 id="outcomes-heading" className="max-w-2xl text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.03em]">
          What you will be able to do
        </h2>
        <div className="mt-8 grid gap-10 md:grid-cols-3">
          {details.map((d) => (
            <div key={d!.slug}>
              <h3 className="font-display text-base font-semibold text-navy-700">{d!.title}</h3>
              <ul className="mt-3 space-y-2">
                {d!.outcomes.slice(0, 3).map((o) => (
                  <li key={o} className="flex gap-2.5 text-[0.9375rem]">
                    <svg viewBox="0 0 16 16" className="mt-1.5 size-3.5 shrink-0 text-emerald-600" aria-hidden>
                      <path d="M2.5 8.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderPortrait({ photo, name }: { photo: string | null; name: string }) {
  if (!photo) return <AvatarPlaceholder name={name} />;
  return (
    <div className="relative aspect-[4/5] w-40 overflow-hidden rounded-[var(--radius-lg)] ring-1 ring-white/15 md:w-full">
      <Image src={photo} alt={`Portrait of ${name}`} fill sizes="(min-width: 768px) 14rem, 10rem" className="object-cover object-top" />
    </div>
  );
}

export function AvatarPlaceholder({ name }: { name: string }) {
  const initials = name
    .replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <div role="img" aria-label={`Photo not yet available for ${name}`} className="flex aspect-[4/5] w-40 items-center justify-center rounded-[var(--radius-lg)] bg-navy-800 font-display text-4xl font-bold text-navy-200 ring-1 ring-white/10 md:w-full">
      {initials}
    </div>
  );
}
