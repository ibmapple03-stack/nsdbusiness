# Sitemap

The website has no logins. Student, instructor and staff portals will be a separate project (its starting point is saved on the `platform-stage1` branch).

| Path | Page | Content file (`src/content/`) |
|---|---|---|
| `/` | Home: tagline, upcoming cohorts, introduction, courses, learning formats (only those offered), outcomes, founder, announcements, contact strip | all; empty sections are hidden |
| `/about` | Purpose, mission, vision, values, leadership, team, registration and status | `pages.ts`, `people.ts`, plus CAC facts in `src/lib/site.ts` |
| `/courses` | Catalogue with search and filters (subject, format, duration, status), URL-driven, works without JavaScript | `courses.ts` (`published: true` only) |
| `/courses/[slug]` | Course detail: outcomes, curriculum, dates/fees/places, assessment, certificate, refunds | `courses.ts` |
| `/admissions` | Steps, requirements, fees, help | `pages.ts` |
| `/corporate-training` | Training-request and partnership enquiry forms (emailed to the office) | `pages.ts` |
| `/news`, `/news/[slug]` | Announcements and events | `news.ts` |
| `/contact` | Contact details, optional map, enquiry form | `contact.ts` |
| `/policies`, `/policies/[slug]` | Privacy, terms, enrolment and refunds, complaints, accessibility | `policies.ts` |
| `/sitemap.xml`, `/robots.txt` | Search engine files | generated |
