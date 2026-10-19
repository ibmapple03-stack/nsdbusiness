import { z } from "zod";
import { DeliveryFormat, Pillar, ProfileKind, NewsKind, CohortStatus, EnquiryType, Role } from "@/generated/prisma/enums";
import { parseDateInput, parseWATLocal } from "@/lib/time";
import { parseNairaToKobo } from "@/lib/money";

// ── Field helpers ────────────────────────────────────────────────

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);
const required = (max: number, label = "This field") =>
  z.string().trim().min(1, `${label} is required.`).max(max, `Keep this under ${max} characters.`);

export const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, "Add a web address.")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens only.");

/** Textarea with one entry per line → string[] */
const lines = (maxItems: number) =>
  z
    .string()
    .default("")
    .transform((v) =>
      v
        .split(/\r?\n/)
        .map((s) => s.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().max(300)).max(maxItems));

const dateInput = (label: string) =>
  z.string().transform((v, ctx) => {
    const d = parseDateInput(v);
    if (!d) ctx.addIssue({ code: "custom", message: `Enter a valid ${label}.` });
    return d as Date;
  });

const optionalDateInput = z.string().transform((v) => (v ? parseDateInput(v) : null));

const watDateTime = (label: string) =>
  z.string().transform((v, ctx) => {
    const d = parseWATLocal(v);
    if (!d) ctx.addIssue({ code: "custom", message: `Enter a valid ${label} (Nigeria time).` });
    return d as Date;
  });

const optionalId = z
  .string()
  .optional()
  .transform((v) => (v ? v : null));

const intOrNull = z
  .string()
  .optional()
  .transform((v, ctx) => {
    if (!v) return null;
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0) ctx.addIssue({ code: "custom", message: "Enter a whole number." });
    return n;
  });

export const nairaAmount = z.string().transform((v, ctx) => {
  const kobo = parseNairaToKobo(v);
  if (kobo === null || kobo <= 0) ctx.addIssue({ code: "custom", message: "Enter an amount in naira, e.g. 150000 or 150,000.00." });
  return kobo as number;
});

// ── Courses & cohorts ────────────────────────────────────────────

/** Curriculum textarea: "## Module title" lines followed by "- topic" lines. */
const curriculum = z
  .string()
  .default("")
  .transform((v) => {
    const modules: { title: string; topics: string[] }[] = [];
    for (const raw of v.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line) continue;
      if (line.startsWith("#")) modules.push({ title: line.replace(/^#+\s*/, ""), topics: [] });
      else {
        if (!modules.length) modules.push({ title: "Overview", topics: [] });
        modules[modules.length - 1].topics.push(line.replace(/^[-•*]\s*/, ""));
      }
    }
    return modules;
  });

export const courseInput = z.object({
  title: required(160, "Title"),
  slug,
  pillar: z.enum(Pillar),
  summary: text(400),
  description: text(6000),
  targetAudience: text(1500),
  outcomes: lines(20),
  prerequisites: lines(20),
  curriculum,
  durationLabel: text(120),
  durationWeeks: intOrNull,
  deliveryFormats: z.array(z.enum(DeliveryFormat)).default([]),
  assessment: text(2000),
  completionRequirements: text(2000),
  certificateType: text(400),
  refundTerms: text(2000),
});

export const cohortInput = z
  .object({
    courseId: required(64, "Course"),
    code: required(40, "Cohort code"),
    startDate: dateInput("start date"),
    endDate: dateInput("end date"),
    applicationDeadline: optionalDateInput,
    timetableSummary: text(300),
    deliveryFormat: z.enum(DeliveryFormat),
    venueId: optionalId,
    instructorId: optionalId,
    capacity: z.coerce.number().int("Enter a whole number.").min(1, "Capacity must be at least 1.").max(1000),
    paymentOptions: text(1000),
    instalmentsAllowed: z.string().optional().transform((v) => v === "on"),
    cohortStatus: z.enum(CohortStatus),
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, { path: ["endDate"], message: "End date must be on or after the start date." })
  .refine((v) => !v.applicationDeadline || !v.startDate || v.applicationDeadline <= v.startDate, {
    path: ["applicationDeadline"],
    message: "The application deadline should be on or before the start date.",
  });

export const sessionInput = z
  .object({
    startsAt: watDateTime("start time"),
    endsAt: watDateTime("end time"),
    venueId: optionalId,
    instructorId: optionalId,
    note: text(200),
  })
  .refine((v) => !v.startsAt || !v.endsAt || v.endsAt > v.startsAt, { path: ["endsAt"], message: "End time must be after the start time." });

export const feeProposalInput = z.object({
  amount: nairaAmount,
  reason: required(500, "A reason"),
});

export const venueInput = z.object({
  name: required(120, "Name"),
  address: text(300),
  capacity: intOrNull,
  notes: text(1000),
});

// ── People & content ─────────────────────────────────────────────

export const profileInput = z.object({
  name: required(120, "Name"),
  slug,
  kind: z.enum(ProfileKind),
  publicTitle: required(160, "Public title"),
  bio: text(4000),
  internalNote: text(1000),
  sortOrder: z.coerce.number().int().min(0).max(1000).default(100),
  reportsToId: optionalId,
});

export const contentBlockInput = z.object({
  title: required(160, "Title"),
  body: text(8000),
});

export const policyInput = z.object({
  title: required(160, "Title"),
  summary: text(500),
  body: text(30000),
});

export const newsInput = z.object({
  title: required(160, "Title"),
  slug,
  kind: z.enum(NewsKind),
  summary: text(400),
  body: text(20000),
});

export const eventInput = z
  .object({
    title: required(160, "Title"),
    slug,
    description: text(6000),
    startsAt: watDateTime("start time"),
    endsAt: z.string().optional().transform((v) => (v ? parseWATLocal(v) : null)),
    location: text(300),
  })
  .refine((v) => !v.endsAt || !v.startsAt || v.endsAt > v.startsAt, { path: ["endsAt"], message: "End time must be after the start time." });

export const settingInput = z.object({ value: text(1000) });

// ── Public enquiries ─────────────────────────────────────────────

const phone = z
  .string()
  .trim()
  .max(30)
  .regex(/^[+\d][\d\s()-]{6,}$/, "Enter a phone number, e.g. +234 803 000 0000.")
  .or(z.literal(""))
  .transform((v) => v || null);

export const enquiryInput = z.object({
  type: z.enum(EnquiryType),
  name: required(120, "Your name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(200),
  phone: phone.optional().transform((v) => v ?? null),
  organisationName: text(200).optional().transform((v) => v || null),
  subject: text(200).optional().default(""),
  message: required(4000, "A message"),
  headcount: z.string().optional(),
  preferredDates: text(200).optional(),
  topics: text(500).optional(),
  interest: text(200).optional(),
  consent: z.literal("on", { message: "Confirm that we may use these details to reply to you." }),
}).refine((v) => v.type === "CONTACT" || !!v.organisationName, { path: ["organisationName"], message: "Organisation is required." });

// ── Users ────────────────────────────────────────────────────────

export const staffUserInput = z.object({
  name: required(120, "Name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  roles: z.array(z.enum(Role)).min(1, "Choose at least one role."),
});

export const reasonInput = z.object({ reason: text(500) });

// ── FormData → object ────────────────────────────────────────────

const ARRAY_FIELDS = new Set(["deliveryFormats", "roles"]);

export function formToObject(fd: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of new Set(fd.keys())) {
    if (key.startsWith("$ACTION")) continue;
    out[key] = ARRAY_FIELDS.has(key) ? fd.getAll(key).map(String) : String(fd.get(key) ?? "");
  }
  for (const key of ARRAY_FIELDS) if (!(key in out)) out[key] = [];
  return out;
}

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
