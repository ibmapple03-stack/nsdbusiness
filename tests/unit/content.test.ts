import { describe, expect, it } from "vitest";
import { COURSES } from "@/content/courses";
import { CONTENT_BLOCKS } from "@/content/pages";
import { POLICIES } from "@/content/policies";
import { PEOPLE } from "@/content/people";
import { NEWS } from "@/content/news";
import { CONTACT } from "@/content/contact";

const published = COURSES.filter((c) => c.published);
const PLACEHOLDER = /\[[^\]]*\]|to be confirmed by the Academy Manager|Draft outline/i;

describe("published content", () => {
  it("has no unfilled [placeholders] or draft notes", () => {
    const texts = [
      ...CONTENT_BLOCKS.map((b) => b.body),
      ...POLICIES.map((p) => p.body),
      ...published.flatMap((c) => [c.summary, c.description ?? "", c.assessment, c.completionRequirements, c.certificateType ?? "", c.refundTerms ?? ""]),
      ...PEOPLE.filter((p) => p.published).map((p) => p.bio),
      ...NEWS.map((n) => n.body),
    ];
    for (const t of texts) expect(t).not.toMatch(PLACEHOLDER);
  });

  it("gives every published course its certificate wording and refund terms", () => {
    expect(published.length).toBeGreaterThan(0);
    for (const c of published) {
      expect(c.certificateType, c.slug).toBeTruthy();
      expect(c.refundTerms, c.slug).toBeTruthy();
    }
  });

  it("never claims accreditation", () => {
    const all = JSON.stringify([COURSES, CONTENT_BLOCKS, POLICIES, PEOPLE, NEWS]);
    expect(all).not.toMatch(/\bNBTE\b|accredited by|nationally recognised qualification/i);
  });

  it("uses unique slugs", () => {
    for (const list of [COURSES, POLICIES, PEOPLE, NEWS]) {
      const slugs = list.map((x) => x.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it("uses the academy's own domain for email", () => {
    expect(CONTACT.email).toMatch(/@nsdbusinessltd\.com$/);
    expect(JSON.stringify(POLICIES)).not.toMatch(/nsdbussiness/);
  });
});
