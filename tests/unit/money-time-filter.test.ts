import { describe, expect, it } from "vitest";
import { formatNaira, koboToNairaInput, parseNairaToKobo } from "@/lib/money";
import { formatDate, overlaps, parseDateInput, parseWATLocal, toWATLocalInput } from "@/lib/time";
import { filterCourses, parseFilters } from "@/lib/course-filter";
import { redact } from "@/server/audit";
import { enquiryInput } from "@/server/validation";

describe("money (kobo)", () => {
  it("parses naira input into integer kobo", () => {
    expect(parseNairaToKobo("150000")).toBe(15_000_000);
    expect(parseNairaToKobo("150,000.50")).toBe(15_000_050);
    expect(parseNairaToKobo("₦45,000")).toBe(4_500_000);
    expect(parseNairaToKobo("0.1")).toBe(10);
  });

  it("rejects ambiguous or invalid amounts", () => {
    for (const bad of ["", "abc", "1.234", "-5", "1e5", "12..3"]) expect(parseNairaToKobo(bad), bad).toBeNull();
  });

  it("formats kobo as NGN and round-trips to form input", () => {
    expect(formatNaira(4_500_000)).toMatch(/45,000\.00/);
    expect(koboToNairaInput(15_000_050)).toBe("150000.50");
    expect(() => formatNaira(1.5)).toThrow();
  });
});

describe("time (WAT)", () => {
  it("interprets form times as Nigeria time and stores UTC", () => {
    const d = parseWATLocal("2026-11-02T09:30")!;
    expect(d.toISOString()).toBe("2026-11-02T08:30:00.000Z");
    expect(toWATLocalInput(d)).toBe("2026-11-02T09:30");
  });

  it("keeps calendar dates on the same day", () => {
    expect(formatDate(parseDateInput("2026-09-30")!)).toBe("30 September 2026");
  });

  it("detects overlaps with half-open intervals", () => {
    const t = (h: number) => new Date(Date.UTC(2026, 10, 2, h));
    expect(overlaps(t(9), t(11), t(10), t(12))).toBe(true);
    expect(overlaps(t(9), t(10), t(10), t(11))).toBe(false);
  });
});

describe("course filters", () => {
  const courses = [
    { title: "Digital Marketing", summary: "social media", pillar: "DIGITAL_SKILLS" as const, deliveryFormats: ["CLASSROOM" as const, "BLENDED" as const], durationWeeks: 6, stage: "OPEN" as const },
    { title: "Fashion and Tailoring", summary: "sewing", pillar: "VOCATIONAL_SKILLS" as const, deliveryFormats: ["CLASSROOM" as const], durationWeeks: 12, stage: "UPCOMING" as const },
  ];
  it("filters by text, subject, format, duration and status", () => {
    expect(filterCourses(courses, { q: "sew" }).map((c) => c.title)).toEqual(["Fashion and Tailoring"]);
    expect(filterCourses(courses, { format: "BLENDED" })).toHaveLength(1);
    expect(filterCourses(courses, { duration: "long" })[0].title).toBe("Fashion and Tailoring");
    expect(filterCourses(courses, { status: "OPEN", subject: "DIGITAL_SKILLS" })).toHaveLength(1);
    expect(filterCourses(courses, parseFilters({ subject: "BUSINESS_SUPPORT" }))).toHaveLength(0);
  });
});

describe("audit redaction", () => {
  it("never copies personal or secret values into snapshots", () => {
    const out = redact({ name: "A", email: "a@b.c", phone: "080", password: "x", nested: { token: "t", title: "ok" } }) as Record<string, unknown>;
    expect(out.email).toBe("[redacted]");
    expect(out.phone).toBe("[redacted]");
    expect(out.password).toBe("[redacted]");
    expect((out.nested as Record<string, unknown>).token).toBe("[redacted]");
    expect((out.nested as Record<string, unknown>).title).toBe("ok");
  });
});

describe("enquiry validation", () => {
  const base = { name: "A Visitor", email: "a@example.test", message: "Hello", consent: "on" };
  it("accepts a contact form that has no organisation or phone field", () => {
    expect(enquiryInput.safeParse({ ...base, type: "CONTACT" }).success).toBe(true);
  });
  it("requires an organisation for corporate and partnership enquiries", () => {
    expect(enquiryInput.safeParse({ ...base, type: "CORPORATE_TRAINING" }).success).toBe(false);
    expect(enquiryInput.safeParse({ ...base, type: "PARTNERSHIP", organisationName: "Org" }).success).toBe(true);
  });
  it("requires consent", () => {
    expect(enquiryInput.safeParse({ ...base, type: "CONTACT", consent: undefined }).success).toBe(false);
  });
});
