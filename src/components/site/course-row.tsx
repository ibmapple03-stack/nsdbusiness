import Link from "next/link";
import { StageBadge } from "@/components/ui/badge";
import { FORMAT_LABELS, PILLAR_COLOR_VAR, PILLAR_LABELS } from "@/lib/site";
import { formatDate } from "@/lib/time";
import { STAGE_LABELS, type PublicCourseSummary } from "@/server/public-data";

/**
 * Courses are listed as rows, not cards: the coloured edge identifies the
 * service pillar, and the status is always spelled out in words.
 */
export function CourseRow({ course, headingLevel = "h3" }: { course: PublicCourseSummary; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <li className="group relative">
      <div
        className="grid gap-3 border-l-4 bg-paper py-5 pl-5 pr-4 transition-[background-color] duration-200 group-hover:bg-navy-50/70 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6 sm:pr-6"
        style={{ borderLeftColor: PILLAR_COLOR_VAR[course.pillar] }}
      >
        <div className="min-w-0">
          <p className="text-sm text-muted">{PILLAR_LABELS[course.pillar]}</p>
          <Heading className="mt-0.5 text-[1.1875rem] font-semibold">
            <Link href={`/courses/${course.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none group-has-[a:focus-visible]:underline">
              {course.title}
            </Link>
          </Heading>
          {course.summary && <p className="mt-1 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">{course.summary}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted sm:flex-col sm:items-end sm:text-right">
          <StageBadge stage={course.stage} label={STAGE_LABELS[course.stage]} />
          <span>
            {course.deliveryFormats.map((f) => FORMAT_LABELS[f]).join(", ")}
            {course.nextStart && <> · starts {formatDate(course.nextStart, "short")}</>}
          </span>
        </div>
      </div>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-sm ring-gold-500 group-has-[a:focus-visible]:ring-3" />
    </li>
  );
}
