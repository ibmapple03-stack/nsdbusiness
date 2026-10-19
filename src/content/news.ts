/**
 * News and events. Announce only confirmed facts: no unconfirmed programme
 * dates, achievements or student outcomes.
 */
export type NewsPost = {
  slug: string;
  kind: "ANNOUNCEMENT" | "UPDATE" | "GUIDE";
  title: string;
  summary: string;
  body: string;
  /** "YYYY-MM-DD" */
  publishedAt: string;
};

export type AcademyEvent = {
  slug: string;
  title: string;
  description: string;
  /** ISO date-time with offset, e.g. "2026-11-20T10:00:00+01:00" */
  startsAt: string;
  endsAt?: string;
  location: string;
};

export const NEWS: NewsPost[] = [
  {
    slug: "academy-incorporated",
    kind: "ANNOUNCEMENT",
    title: "NSD Business Academy Limited is incorporated",
    summary: "The academy was incorporated with the Corporate Affairs Commission on 30 September 2026.",
    body: "NSD Business Academy Limited was incorporated in Nigeria with the Corporate Affairs Commission on 30 September 2026 (RC 9902304).\n\nThe academy is based in Yola, Adamawa State, and will offer practical business, vocational and digital skills training. Its first proposed course, Practical Entrepreneurship and Small Business Management, is being prepared. Dates and fees will be published once they are confirmed.\n\nTo register your interest, contact the academy office.",
    publishedAt: "2026-09-30",
  },
];

export const EVENTS: AcademyEvent[] = [];
