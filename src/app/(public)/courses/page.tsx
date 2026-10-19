import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CourseRow } from "@/components/site/course-row";
import { buttonClass } from "@/components/ui/button";
import { EmptyState, PageHeader, Skeleton } from "@/components/ui/misc";
import { DURATION_BANDS, filterCourses, parseFilters, type CourseFilters } from "@/lib/course-filter";
import { FORMAT_LABELS, PILLAR_LABELS } from "@/lib/site";
import { STAGE_LABELS, getPublishedCourses } from "@/server/public-data";

export const metadata: Metadata = {
  title: "Courses",
  description: "Practical business, vocational and digital skills courses offered by NSD Business Academy in Yola, Adamawa State.",
  alternates: { canonical: "/courses" },
};

const select =
  "block w-full rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2.5 text-[0.9375rem] hover:border-navy-400 focus:border-navy-700 focus:outline-none focus:ring-3 focus:ring-gold-500/50";

export default function CoursesPage(props: PageProps<"/courses">) {
  return (
    <>
      <PageHeader
        title="Courses"
        intro="Every course is practical and built around real work. Each course shows whether it is open for applications, in progress, upcoming or still being proposed."
      />
      <div className="container-page py-10 lg:py-14">
        <Suspense fallback={<ResultsSkeleton />}>
          <Results searchParams={props.searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Results({ searchParams }: Pick<PageProps<"/courses">, "searchParams">) {
  const filters = parseFilters(await searchParams);
  const all = await getPublishedCourses();
  const results = filterCourses(all, filters);
  const active = Object.values(filters).some(Boolean);

  return (
    <div className="grid gap-10 lg:grid-cols-[17rem_1fr]">
      <FilterForm filters={filters} />
      <section aria-labelledby="results-heading">
        <h2 id="results-heading" className="sr-only">
          Results
        </h2>
        <p role="status" className="mb-4 text-muted">
          {all.length === 0
            ? "No courses are published yet."
            : `Showing ${results.length} of ${all.length} ${all.length === 1 ? "course" : "courses"}${active ? " matching your filters" : ""}.`}
        </p>
        {results.length ? (
          <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-lg)] border border-line shadow-[var(--shadow-raised)]">
            {results.map((c) => (
              <CourseRow key={c.slug} course={c} headingLevel="h3" />
            ))}
          </ul>
        ) : all.length === 0 ? (
          <EmptyState title="Our first courses are being prepared">
            <p>Courses will be listed here with dates and fees as soon as they are confirmed. Contact the academy office to register your interest.</p>
          </EmptyState>
        ) : (
          <EmptyState
            title="No courses match those filters"
            action={
              <Link href="/courses" className={buttonClass("secondary")}>
                Clear filters
              </Link>
            }
          >
            <p>Try removing a filter or searching for a different word.</p>
          </EmptyState>
        )}
      </section>
    </div>
  );
}

/** A plain GET form: filtering works without JavaScript and every result has a shareable URL. */
function FilterForm({ filters }: { filters: CourseFilters }) {
  return (
    <form method="get" action="/courses" role="search" aria-label="Filter courses" className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div>
        <label htmlFor="q" className="mb-1.5 block font-display text-[0.9375rem] font-medium text-navy-900">
          Search
        </label>
        <input id="q" name="q" type="search" defaultValue={filters.q} placeholder="e.g. bookkeeping" className={select} />
      </div>
      <Filter id="subject" label="Subject" value={filters.subject} options={Object.entries(PILLAR_LABELS)} />
      <Filter id="format" label="Delivery format" value={filters.format} options={Object.entries(FORMAT_LABELS)} />
      <Filter id="duration" label="Duration" value={filters.duration} options={Object.entries(DURATION_BANDS).map(([k, v]) => [k, v.label])} />
      <Filter id="status" label="Enrolment status" value={filters.status} options={Object.entries(STAGE_LABELS)} />
      <div className="flex items-center gap-4 pt-1">
        <button type="submit" className={buttonClass("primary")}>
          Apply filters
        </button>
        <Link href="/courses" className="text-[0.9375rem] font-medium text-navy-700 underline decoration-navy-200 underline-offset-4 hover:decoration-gold-500">
          Clear
        </Link>
      </div>
    </form>
  );
}

function Filter({ id, label, value, options }: { id: string; label: string; value?: string; options: [string, string][] }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-display text-[0.9375rem] font-medium text-navy-900">
        {label}
      </label>
      <select id={id} name={id} defaultValue={value ?? ""} className={select}>
        <option value="">Any</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[17rem_1fr]" role="status" aria-busy="true" aria-label="Loading courses">
      <div className="space-y-4">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  );
}
