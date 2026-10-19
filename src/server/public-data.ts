import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { CohortStatus, DeliveryFormat, Pillar } from "@/generated/prisma/enums";
import { db } from "@/server/db";
import { env } from "@/server/env";
import { academyId } from "@/server/org";

/**
 * Read-only queries for the public website. Only PUBLISHED records are ever
 * returned, except that local development may preview draft page text and
 * policies (CONTENT_PREVIEW=true), which are then visibly marked as drafts.
 */

export type PublicStage = "OPEN" | "RUNNING" | "UPCOMING" | "COMPLETED" | "PROPOSED";

export const STAGE_LABELS: Record<PublicStage, string> = {
  OPEN: "Open for applications",
  RUNNING: "In progress",
  UPCOMING: "Upcoming",
  COMPLETED: "Completed",
  PROPOSED: "Proposed",
};

/** A course's public stage is derived from its published cohorts — never stored separately. */
export function deriveStage(cohorts: { cohortStatus: CohortStatus }[]): PublicStage {
  const s = new Set(cohorts.map((c) => c.cohortStatus));
  if (s.has("OPEN")) return "OPEN";
  if (s.has("RUNNING")) return "RUNNING";
  if (s.has("PLANNED")) return "UPCOMING";
  if (s.has("COMPLETED")) return "COMPLETED";
  return "PROPOSED";
}

const publicCohortSelect = {
  id: true,
  code: true,
  startDate: true,
  endDate: true,
  applicationDeadline: true,
  timetableSummary: true,
  deliveryFormat: true,
  capacity: true,
  feeKobo: true,
  paymentOptions: true,
  instalmentsAllowed: true,
  cohortStatus: true,
  venue: { select: { name: true, address: true } },
  instructor: { select: { name: true, slug: true, status: true } },
} as const;

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
  "use cache";
  cacheLife("hours");
  cacheTag("catalogue");
  const organisationId = await academyId();
  const courses = await db.course.findMany({
    where: { organisationId, status: "PUBLISHED" },
    orderBy: { title: "asc" },
    include: {
      cohorts: {
        where: { status: "PUBLISHED", cohortStatus: { not: "CANCELLED" } },
        select: { cohortStatus: true, startDate: true },
        orderBy: { startDate: "asc" },
      },
    },
  });
  return courses.map((c) => ({
    slug: c.slug,
    title: c.title,
    pillar: c.pillar,
    summary: c.summary,
    durationLabel: c.durationLabel,
    durationWeeks: c.durationWeeks,
    deliveryFormats: c.deliveryFormats,
    stage: deriveStage(c.cohorts),
    nextStart: c.cohorts.find((k) => k.cohortStatus === "OPEN" || k.cohortStatus === "PLANNED")?.startDate ?? null,
  }));
}

export async function getPublishedCourse(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalogue");
  const organisationId = await academyId();
  const course = await db.course.findFirst({
    where: { organisationId, slug, status: "PUBLISHED" },
    include: {
      cohorts: {
        where: { status: "PUBLISHED", cohortStatus: { not: "CANCELLED" } },
        orderBy: { startDate: "asc" },
        select: publicCohortSelect,
      },
    },
  });
  if (!course) return null;
  return {
    ...course,
    curriculum: (Array.isArray(course.curriculum) ? course.curriculum : []) as { title: string; topics: string[] }[],
    stage: deriveStage(course.cohorts),
    cohorts: course.cohorts.map((k) => ({
      ...k,
      // Only name an instructor whose own profile has been approved for publication.
      instructor: k.instructor?.status === "PUBLISHED" ? { name: k.instructor.name, slug: k.instructor.slug } : null,
    })),
  };
}

export async function getUpcomingCohorts(limit = 4) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalogue");
  const organisationId = await academyId();
  return db.cohort.findMany({
    where: { organisationId, status: "PUBLISHED", cohortStatus: { in: ["OPEN", "PLANNED"] }, course: { status: "PUBLISHED" } },
    orderBy: { startDate: "asc" },
    take: limit,
    select: { code: true, startDate: true, applicationDeadline: true, cohortStatus: true, deliveryFormat: true, course: { select: { slug: true, title: true, pillar: true } } },
  });
}

export async function getPublishedProfiles() {
  "use cache";
  cacheLife("hours");
  cacheTag("people");
  const organisationId = await academyId();
  const profiles = await db.staffProfile.findMany({
    where: { organisationId, status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { slug: true, kind: true, name: true, publicTitle: true, bio: true, photoPath: true, photoApproved: true },
  });
  // A photo is public only when separately approved.
  return profiles.map(({ photoPath, photoApproved, ...p }) => ({ ...p, photoPath: photoApproved ? photoPath : null }));
}

export type PublicBlock = { title: string; body: string; isDraft: boolean };

export async function getContentBlocks(): Promise<Record<string, PublicBlock>> {
  "use cache";
  cacheLife("hours");
  cacheTag("content");
  const organisationId = await academyId();
  const blocks = await db.contentBlock.findMany({
    where: { organisationId, status: env.contentPreview ? { not: "ARCHIVED" } : "PUBLISHED" },
    select: { key: true, title: true, body: true, status: true },
  });
  return Object.fromEntries(blocks.filter((b) => b.body.trim()).map((b) => [b.key, { title: b.title, body: b.body, isDraft: b.status !== "PUBLISHED" }]));
}

export async function getPolicies() {
  "use cache";
  cacheLife("hours");
  cacheTag("policies");
  const organisationId = await academyId();
  const rows = await db.policy.findMany({
    where: { organisationId, status: env.contentPreview ? { not: "ARCHIVED" } : "PUBLISHED" },
    orderBy: [{ slug: "asc" }, { version: "desc" }],
  });
  // One entry per policy: the published version, or in preview the latest draft.
  const bySlug = new Map<string, (typeof rows)[number] & { isDraft: boolean }>();
  for (const p of rows) {
    const current = bySlug.get(p.slug);
    const isDraft = p.status !== "PUBLISHED";
    if (!current || (current.isDraft && !isDraft)) bySlug.set(p.slug, { ...p, isDraft });
  }
  return [...bySlug.values()];
}

export async function getPolicy(slug: string) {
  const all = await getPolicies();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getPublishedNews() {
  "use cache";
  cacheLife("hours");
  cacheTag("news");
  const organisationId = await academyId();
  return db.newsPost.findMany({
    where: { organisationId, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: { slug: true, kind: true, title: true, summary: true, body: true, publishedAt: true },
  });
}

export async function getPublishedEvents() {
  "use cache";
  cacheLife("hours");
  cacheTag("news");
  const organisationId = await academyId();
  return db.event.findMany({
    where: { organisationId, status: "PUBLISHED" },
    orderBy: { startsAt: "asc" },
    select: { slug: true, title: true, description: true, startsAt: true, endsAt: true, location: true },
  });
}

export type ContactDetails = Partial<Record<"address" | "phone" | "email" | "officeHours" | "mapQuery" | "whatsapp", string>>;

/** Only verified contact details are ever shown publicly. */
export async function getVerifiedContact(): Promise<ContactDetails> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");
  const organisationId = await academyId();
  const rows = await db.siteSetting.findMany({ where: { organisationId, verified: true, key: { startsWith: "contact." } } });
  return Object.fromEntries(rows.filter((r) => r.value.trim()).map((r) => [r.key.replace("contact.", ""), r.value]));
}

export const isPreview = () => env.contentPreview;
