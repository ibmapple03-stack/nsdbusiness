# Sitemap

## Public website

| Path | Page | Content source |
|---|---|---|
| `/` | Home: tagline, upcoming cohorts, introduction, courses, learning formats (only those offered), outcomes (from published courses), founder, announcements, contact strip | Published records only; empty sections are hidden |
| `/about` | Purpose, mission, vision, values, leadership, team, registration and status | Page text + published profiles + fixed CAC facts (`src/lib/site.ts`) |
| `/courses` | Catalogue with search and filters (subject, format, duration, enrolment status) — URL-driven, works without JavaScript | Published courses; status derived from published cohorts |
| `/courses/[slug]` | Course detail: outcomes, curriculum, cohorts with dates/fees/places, assessment, certificate type, refunds | Published course + published cohorts |
| `/admissions` | Steps, requirements, fees, help, scholarships (none at present) | Page text |
| `/corporate-training` | Custom training and partnership enquiry forms | Page text + `Enquiry` |
| `/news`, `/news/[slug]` | Announcements and events | Published news/events |
| `/contact` | Verified contact details, optional map, enquiry form | Verified `SiteSetting` values only |
| `/policies`, `/policies/[slug]` | Privacy, terms, enrolment and refunds, complaints, accessibility | Published policy versions (drafts shown only in local preview) |
| `/login`, `/reset-password` | Staff sign-in (students from Stage 2), set/reset password | — |
| `/account/security` | Two-step sign-in set-up | — |
| `/sitemap.xml`, `/robots.txt` | Search engine files (published pages only; admin disallowed) | — |

## Staff administration (`/admin`, sign-in required)

| Path | Purpose | Permission |
|---|---|---|
| `/admin` | Dashboard (approvals, cohorts, enquiries; instructors see assigned cohorts) | `admin.access` |
| `/admin/approvals` | Everything awaiting a decision the user may make | any `*.approve` |
| `/admin/courses`, `/new`, `/[id]` | Course definitions + publication workflow | `course.view` / `course.edit` |
| `/admin/cohorts`, `/new`, `/[id]` | Cohorts, fee proposal/approval, timetable with clash checks | `course.view`, `cohort.edit`, `fees.*`, `timetable.edit` |
| `/admin/venues` | Venues used for clash checks | `venue.edit` |
| `/admin/people`, `/new`, `/[id]` | Profiles, reporting lines, photo approval | `profile.edit` / `profile.approve` |
| `/admin/content`, `/[id]` | Editable page text | `content.edit` |
| `/admin/news`, `/admin/events` | Announcements and events | `content.edit` |
| `/admin/policies`, `/[id]` | Versioned policies | `policy.edit` / `policy.approve` |
| `/admin/settings` | Contact details with verification | `settings.edit` / `settings.verify` |
| `/admin/enquiries`, `/[id]` | Public form submissions | `enquiry.view` / `enquiry.manage` |
| `/admin/audit` | Audit log | `audit.view` |
| `/admin/users`, `/new`, `/[id]` | Staff accounts and roles | `users.manage` (CEO) |

## Planned (later stages)

`/apply`, `/portal/*` (student), `/teach/*` (instructor), `/admin/admissions`, `/admin/finance`, `/admin/attendance`, `/admin/diaries`, `/admin/documents`, `/admin/reports`, `/verify/[code]` (certificate verification), `/api/payments/paystack/webhook`.
