/**
 * All timestamps are stored in UTC. Local academy schedules are shown in
 * Nigeria time (WAT, Africa/Lagos, UTC+1 with no daylight saving). The CEO
 * works from New York, so staff screens can show New York time alongside.
 */

export const ACADEMY_TZ = "Africa/Lagos";
export const NEW_YORK_TZ = "America/New_York";

const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: ACADEMY_TZ, day: "numeric", month: "long", year: "numeric" });
const shortDateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: ACADEMY_TZ, day: "numeric", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: ACADEMY_TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const nyFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: NEW_YORK_TZ,
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

/** Calendar dates (stored as @db.Date at UTC midnight) — format without shifting the day. */
export function formatDate(d: Date, style: "long" | "short" = "long"): string {
  const utcDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12));
  return (style === "long" ? dateFmt : shortDateFmt).format(utcDay);
}

export function formatDateTimeWAT(d: Date): string {
  return `${dateTimeFmt.format(d)} WAT`;
}

export function formatNewYork(d: Date): string {
  return nyFmt.format(d);
}

/** Interpret a `datetime-local` value ("2026-11-02T09:30") as Nigeria time. */
export function parseWATLocal(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const d = new Date(`${value}:00+01:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Format a UTC instant as a `datetime-local` value in Nigeria time. */
export function toWATLocalInput(d: Date | null | undefined): string {
  if (!d) return "";
  const shifted = new Date(d.getTime() + 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 16);
}

/** Parse a `date` input ("2026-11-02") as a calendar date at UTC midnight. */
export function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toDateInput(d: Date | null | undefined): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

/** Half-open interval overlap: [aStart, aEnd) ∩ [bStart, bEnd) ≠ ∅ */
export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}
