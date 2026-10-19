import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StageBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/misc";
import { RichText } from "@/components/ui/rich-text";
import { FORMAT_LABELS, PILLAR_COLOR_VAR, PILLAR_LABELS, SITE } from "@/lib/site";
import { formatNaira } from "@/lib/money";
import { formatDate } from "@/lib/time";
import { STAGE_LABELS, deriveStage, getPublishedCourse, getPublishedCourses } from "@/server/public-data";

// Blocks on purpose: unknown or unpublished slugs must return a real HTTP 404.
export const instant = false;

export async function generateStaticParams() {
  const courses = await getPublishedCourses();
  // Cache Components needs at least one entry; the placeholder renders a 404.
  return courses.length ? courses.map((c) => ({ slug: c.slug })) : [{ slug: "__none" }];
}

export async function generateMetadata(props: PageProps<"/courses/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const course = await getPublishedCourse(slug);
  if (!course) return { title: "Course not found", robots: { index: false } };
  return {
    title: course.title,
    description: course.summary || undefined,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: { title: course.title, description: course.summary || undefined, type: "article" },
  };
}

export default async function CoursePage(props: PageProps<"/courses/[slug]">) {
  const { slug } = await props.params;
  const course = await getPublishedCourse(slug);
  // Before any streaming, so unpublished or unknown courses return a real 404.
  if (!course) notFound();

  const openCohort = course.cohorts.find((c) => c.cohortStatus === "OPEN");

  return (
    <article>
      <header className="border-b border-line bg-surface">
        <div className="container-page py-10 sm:py-14">
          <Breadcrumb items={[{ href: "/courses", label: "Courses" }, { label: course.title }]} />
          <p className="mt-6 flex items-center gap-2 text-sm font-medium text-muted">
            <span aria-hidden className="h-3 w-1 rounded-full" style={{ background: PILLAR_COLOR_VAR[course.pillar] }} />
            {PILLAR_LABELS[course.pillar]}
          </p>
          <h1 className="mt-2 max-w-3xl text-[clamp(2rem,4.5vw,3rem)] font-bold tracking-[-0.03em]">{course.title}</h1>
          {course.summary && <p className="mt-4 max-w-2xl text-lg text-muted">{course.summary}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StageBadge stage={course.stage} label={STAGE_LABELS[course.stage]} />
            {course.durationLabel && <span className="text-[0.9375rem] text-muted">{course.durationLabel}</span>}
            <span className="text-[0.9375rem] text-muted">{course.deliveryFormats.map((f) => FORMAT_LABELS[f]).join(", ")}</span>
          </div>
          {openCohort && (
            <div className="mt-8">
              <ButtonLink href={`/admissions?course=${course.slug}`} size="lg">
                How to apply
              </ButtonLink>
            </div>
          )}
        </div>
      </header>

      <div className="container-page grid gap-12 py-12 lg:grid-cols-[1fr_20rem] lg:py-16">
        <div className="min-w-0 space-y-12">
          {course.description && course.description !== course.summary && (
            <Section title="About this course">
              <RichText text={course.description} />
            </Section>
          )}
          {course.targetAudience && (
            <Section title="Who it is for">
              <RichText text={course.targetAudience} />
            </Section>
          )}
          {course.outcomes.length > 0 && (
            <Section title="What you will be able to do">
              <ul className="grid gap-3 sm:grid-cols-2">
                {course.outcomes.map((o) => (
                  <li key={o} className="flex gap-3 rounded-[var(--radius-md)] border border-line p-4 text-[0.9375rem]">
                    <svg viewBox="0 0 16 16" className="mt-1 size-4 shrink-0 text-emerald-600" aria-hidden>
                      <path d="M2.5 8.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {o}
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {course.curriculum.length > 0 && (
            <Section title="Curriculum">
              <ol className="space-y-4">
                {course.curriculum.map((m, i) => (
                  <li key={i} className="grid grid-cols-[2.25rem_1fr] gap-3">
                    <span aria-hidden className="flex size-9 items-center justify-center rounded-full bg-navy-100 font-display text-sm font-semibold text-navy-800">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="pt-1.5 text-base font-semibold">{m.title}</h3>
                      {m.topics.length > 0 && <p className="mt-1 text-[0.9375rem] text-muted">{m.topics.join(" · ")}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </Section>
          )}
          <Section title="Dates, fees and places">
            {course.cohorts.length ? (
              <ul className="space-y-4">
                {course.cohorts.map((c) => {
                  const stage = deriveStage([c]);
                  return (
                    <li key={c.code} className="rounded-[var(--radius-lg)] border border-line p-5 shadow-[var(--shadow-raised)]">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold">
                          {formatDate(c.startDate)} – {formatDate(c.endDate)}
                        </h3>
                        <StageBadge stage={stage} label={STAGE_LABELS[stage]} />
                      </div>
                      <dl className="mt-4 grid gap-x-8 gap-y-3 text-[0.9375rem] sm:grid-cols-2">
                        <Item label="Fee">{c.feeKobo != null ? formatNaira(c.feeKobo) : "To be confirmed"}</Item>
                        {c.applicationDeadline && <Item label="Application deadline">{formatDate(c.applicationDeadline)}</Item>}
                        {c.timetableSummary && <Item label="Timetable">{c.timetableSummary}</Item>}
                        <Item label="Format">{FORMAT_LABELS[c.deliveryFormat]}</Item>
                        {c.venue && <Item label="Venue">{c.venue.name}</Item>}
                        <Item label="Places">{c.capacity}</Item>
                        {c.instructor && <Item label="Instructor">{c.instructor.name}</Item>}
                        {c.paymentOptions && <Item label="Payment options">{c.paymentOptions}</Item>}
                        {c.instalmentsAllowed && <Item label="Instalments">Available — the plan is set out in your invoice</Item>}
                      </dl>
                      <p className="mt-3 text-sm text-muted">Cohort {c.code}. Times are Nigeria time (WAT).</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted">Dates for this course have not been set yet. Contact the academy office to register your interest.</p>
            )}
          </Section>
          {(course.assessment || course.completionRequirements) && (
            <Section title="Assessment and completion">
              {course.assessment && <RichText text={course.assessment} />}
              {course.completionRequirements && <RichText text={course.completionRequirements} className="prose-academy mt-3" />}
            </Section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
            <h2 className="text-base font-semibold">Certificate</h2>
            <p className="mt-2 text-[0.9375rem]">{course.certificateType}</p>
            <p className="mt-3 text-sm text-muted">{SITE.accreditationStatement}</p>
          </div>
          {course.prerequisites.length > 0 && (
            <div className="rounded-[var(--radius-lg)] border border-line p-5">
              <h2 className="text-base font-semibold">Before you start</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.9375rem]">
                {course.prerequisites.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-[var(--radius-lg)] border border-line p-5">
            <h2 className="text-base font-semibold">Refunds and cancellation</h2>
            <RichText text={course.refundTerms} className="prose-academy mt-2 text-[0.9375rem]" />
            <Link href="/policies/enrolment-and-refunds" className="mt-3 inline-block text-sm font-medium text-navy-700 underline decoration-navy-200 underline-offset-4 hover:decoration-gold-500">
              Enrolment and refund policy
            </Link>
          </div>
        </aside>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-[1.5rem] font-bold tracking-[-0.02em]">{title}</h2>
      {children}
    </section>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-medium text-ink">{children}</dd>
    </div>
  );
}
