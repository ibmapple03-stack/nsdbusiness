import "server-only";
import type { CohortStatus, DeliveryFormat, Pillar } from "@/content/types";
import { COURSES, type Course } from "@/content/courses";
import { CONTENT_BLOCKS } from "@/content/pages";
import { POLICIES, POLICIES_EFFECTIVE_FROM } from "@/content/policies";
import { PEOPLE } from "@/content/people";
import { EVENTS, NEWS } from "@/content/news";
import { CONTACT } from "@/content/contact";

/**
 * Read-only access to the website's content files in src/content. Only
 * entries marked `published` are ever returned.
 */

export type PublicStage = "OPEN" | "RUNNING" | "UPCOMING" | "COMPLETED" | "PROPOSED";

export const STAGE_LABELS: Record<PublicStage, string> = {
  OPEN: "Open for applications",
  RUNNING: "In progress",
  UPCOMING: "Upcoming",
  COMPLETED: "Completed",
  PROPOSED: "Proposed",
};

/** A course's public stage is derived from its cohorts — never stored separately. */
export function deriveStage(cohorts: { cohortStatus: CohortStatus }[]): PublicStage {
  const s = new Set(cohorts.map((c) => c.cohortStatus));
  if (s.has("OPEN")) return "OPEN";
  if (s.has("RUNNING")) return "RUNNING";
  if (s.has("PLANNED")) return "UPCOMING";
  if (s.has("COMPLETED")) return "COMPLETED";
  return "PROPOSED";
}

const day = (d: string) => new Date(`${d}T00:00:00Z`);

function cohortsOf(course: Course) {
  return (course.cohorts ?? [])
    .map((k) => ({
      code: k.code,
      startDate: day(k.startDate),
      endDate: day(k.endDate),
      applicationDeadline: k.applicationDeadline ? day(k.applicationDeadline) : null,
      timetableSummary: k.timetableSummary ?? "",
      deliveryFormat: k.deliveryFormat,
      capacity: k.capacity,
      feeKobo: k.feeNaira != null ? k.feeNaira * 100 : null,
      paymentOptions: k.paymentOptions ?? "",
      instalmentsAllowed: k.instalmentsAllowed ?? false,
      cohortStatus: k.status,
      venue: k.venue ? { name: k.venue } : null,
      instructor: null as { name: string; slug: string } | null,
    }))
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

const published = () => COURSES.filter((c) => c.published);

export type PublicCourseSummary = {
  slug: string;
  title: string;
  pillar: Pillar;
  summary: string;
  durationLabel: string;
  durationWeeks: number | null;
  deliveryFormats: DeliveryFormat[];
  stage: PublicStage;
  nextStart: Date | null;
};

export async function getPublishedCourses(): Promise<PublicCourseSummary[]> {
  return published()
    .map((c) => {
      const cohorts = cohortsOf(c);
      return {
        slug: c.slug,
        title: c.title,
        pillar: c.pillar,
        summary: c.summary,
        durationLabel: c.durationLabel,
        durationWeeks: c.durationWeeks,
        deliveryFormats: c.deliveryFormats,
        stage: deriveStage(cohorts),
        nextStart: cohorts.find((k) => k.cohortStatus === "OPEN" || k.cohortStatus === "PLANNED")?.startDate ?? null,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getPublishedCourse(slug: string) {
  const course = published().find((c) => c.slug === slug);
  if (!course) return null;
  const cohorts = cohortsOf(course);
  return {
    ...course,
    description: course.description ?? course.summary,
    certificateType: course.certificateType ?? "",
    refundTerms: course.refundTerms ?? "",
    stage: deriveStage(cohorts),
    cohorts,
  };
}

export async function getUpcomingCohorts(limit = 4) {
  return published()
    .flatMap((c) =>
      cohortsOf(c)
        .filter((k) => k.cohortStatus === "OPEN" || k.cohortStatus === "PLANNED")
        .map((k) => ({ ...k, course: { slug: c.slug, title: c.title, pillar: c.pillar } })),
    )
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, limit);
}

export async function getPublishedProfiles() {
  return PEOPLE.filter((p) => p.published).map(({ slug, kind, name, publicTitle, bio, photo }) => ({ slug, kind, name, publicTitle, bio, photo: photo ?? null }));
}

export type PublicBlock = { title: string; body: string };

export async function getContentBlocks(): Promise<Record<string, PublicBlock>> {
  return Object.fromEntries(CONTENT_BLOCKS.filter((b) => b.body.trim()).map((b) => [b.key, { title: b.title, body: b.body }]));
}

export async function getPolicies() {
  return POLICIES.map((p) => ({ ...p, effectiveFrom: day(POLICIES_EFFECTIVE_FROM) }));
}

export async function getPolicy(slug: string) {
  const all = await getPolicies();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getPublishedNews() {
  return [...NEWS].map((n) => ({ ...n, publishedAt: day(n.publishedAt) })).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export async function getPublishedEvents() {
  return [...EVENTS]
    .map((e) => ({ ...e, startsAt: new Date(e.startsAt), endsAt: e.endsAt ? new Date(e.endsAt) : null }))
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

export type ContactDetails = typeof CONTACT;

export async function getVerifiedContact(): Promise<ContactDetails> {
  return CONTACT;
}
