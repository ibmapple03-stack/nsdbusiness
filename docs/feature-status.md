# Feature status

Updated: 19 October 2026 (Stage 1, with management content).

- **Working** — built and tested against a real database.
- **Demo** — works, but shows fictional data or needs real content.
- **Pending** — designed or documented, not built, or waiting for credentials or decisions.

## Stage 1 — Design and foundation

| Area | Feature | Status | Notes |
|---|---|---|---|
| Foundation | Next.js 16 + TypeScript + Tailwind 4, Postgres + Prisma 7, migrations | Working | |
| | Separate dev / test / production configuration, `.env.example` | Working | Production values pending accounts |
| | Fictional seed data and demo staff accounts | Working | Tests only (`nsd_test`); removed from the local dev database; refused in production |
| Design | Brand tokens (navy, deep navy, emerald, restrained gold), Poppins/Inter, components | Working | Fonts self-hosted |
| | Logo, site icon, social-sharing image | Working | Extracted from the supplied screenshot; original vector file still wanted for print and large sizes |
| | Reduced motion, focus styles, skip link, mobile layouts | Working | Tested at 390px and 1440px |
| Public site | Home, About, Courses, Course detail, Admissions, Corporate & Partnerships, News & Events, Contact, Policies | Working | Shows only published/verified content; empty sections hide |
| | Course search and filters (subject, format, duration, status) | Working | URL-based, works without JavaScript |
| | Proposed / open / running / completed status | Working | Derived from published cohorts |
| | Founder profile | Working | Biography and photo approved by management (18 Oct 2026) |
| | Page text and policies | Working | Supplied by management 19 Oct 2026; policies await professional review |
| | First course (proposed, no dates) | Working | Dates, venue and final fee pending approval |
| | Enquiry forms with validation, honeypot, timing check, rate limit | Working | Emails to staff: Stage 4 notifications |
| | Verified address, telephone, email | Working | Office hours and map pin awaiting confirmation |
| | Map | Pending | Appears once the office-entrance pin is supplied |
| | SEO metadata, Open Graph, sitemap.xml, robots.txt | Working | |
| | 404, error, offline message, loading states | Working | See known limitation 1 |
| Admin | Staff sign-in, email verification, password set/reset | Working | Real emails need an email provider |
| | Mandatory two-step sign-in (TOTP + backup codes) for staff | Working | Tested end to end |
| | Role/permission matrix enforced on server and in services | Working | 36 unit/integration + 39 end-to-end tests |
| | Draft → submitted → approved → published workflow with maker-checker | Working | Courses, cohorts, profiles, page text, policies, news, events |
| | Approval queue | Working | |
| | Course and cohort management | Working | Reusable course vs scheduled cohort |
| | Fee proposal and separate approval | Working | Proposer can never approve, including the CEO |
| | Timetable sessions with venue/instructor clash checks | Working | |
| | Venues | Working | |
| | People/profiles with reporting lines and separate photo approval | Working | Photos served from private storage only after approval. Local-disk storage only: production photos need the Stage 2 object storage |
| | Verified contact details | Working | |
| | Versioned policies (published version stays live while the next is drafted) | Working | Legal review pending |
| | Enquiry handling | Working | |
| | Audit log with redaction | Working | |
| | Staff accounts, roles, deactivation (CEO only) | Working | |
| | Instructor view of assigned cohorts | Working | Teaching tools in Stage 3 |
| | Dual Nigeria / New York clock | Working | |

## Stages 2–4

| Area | Feature | Status |
|---|---|---|
| Admissions | Student accounts, applications, document uploads, decisions, enrolment terms | Pending (Stage 2) |
| | Guardian workflow for minors | Pending — management decision required first |
| Payments | Paystack sandbox adapter, invoices, instalments, receipts, webhooks, reconciliation, manual payments, refunds | Pending (Stage 2) — design in `payments-architecture.md` |
| Storage | Private uploads with signed short-lived links, type/size validation | Pending (Stage 2); private local media route working |
| Learning | Modules, lessons, resources, quizzes, assignments, feedback, draft/released grades | Pending (Stage 3) |
| Operations | Attendance, work diaries, leave, clock corrections, tasks, document register, assets, purchase requests, complaints, reports | Pending (Stage 3) |
| Automation | Notifications, email workflows with owners/logs/retries/overrides | Pending (Stage 4) |
| Certificates | Numbered certificates, QR verification, revocation | Pending (Stage 4) |
| Launch | CSP nonces, backup restore test, production deployment | Pending (Stage 4) — runbook in `deployment.md` |

## Known limitations (Stage 1)

1. **Status code for unpublished detail pages.** In production builds, Next.js 16 Partial Prefetching serves `/courses/<unknown>`, `/news/<unknown>` and `/policies/<unknown>` as the not-found page with `noindex` but HTTP status 200, not 404. No unpublished content is sent; this is verified by end-to-end tests. Local development returns 404.
2. **Editing published records** requires moving them back to draft, which removes them from the site until re-approved. Policies avoid this through versions. Draft revisions for other records are a Stage 4 improvement.
3. **Content Security Policy** allows inline scripts, which Next.js hydration needs. Nonce-based CSP is planned for Stage 4.
