import type { DeliveryFormat, Pillar } from "@/content/types";

export type FilterableCourse = {
  title: string;
  summary: string;
  pillar: Pillar;
  deliveryFormats: DeliveryFormat[];
  durationWeeks: number | null;
  stage: "OPEN" | "RUNNING" | "UPCOMING" | "COMPLETED" | "PROPOSED";
};

export const DURATION_BANDS = {
  short: { label: "Up to 4 weeks", test: (w: number) => w <= 4 },
  medium: { label: "5 to 8 weeks", test: (w: number) => w >= 5 && w <= 8 },
  long: { label: "More than 8 weeks", test: (w: number) => w > 8 },
} as const;

export type CourseFilters = { q?: string; subject?: string; format?: string; duration?: string; status?: string };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

export function parseFilters(params: Record<string, string | string[] | undefined>): CourseFilters {
  return { q: one(params.q)?.slice(0, 100), subject: one(params.subject), format: one(params.format), duration: one(params.duration), status: one(params.status) };
}

export function filterCourses<T extends FilterableCourse>(courses: T[], f: CourseFilters): T[] {
  const q = f.q?.toLowerCase();
  const band = f.duration && f.duration in DURATION_BANDS ? DURATION_BANDS[f.duration as keyof typeof DURATION_BANDS] : null;
  return courses.filter(
    (c) =>
      (!q || c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q)) &&
      (!f.subject || c.pillar === f.subject) &&
      (!f.format || c.deliveryFormats.includes(f.format as DeliveryFormat)) &&
      (!band || (c.durationWeeks != null && band.test(c.durationWeeks))) &&
      (!f.status || c.stage === f.status),
  );
}
