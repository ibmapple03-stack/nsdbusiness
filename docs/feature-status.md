# Feature status

Updated: 19 October 2026. The project is now the public website only. Logins, the staff admin area and the database moved out to a separate future project; that work is preserved on the `platform-stage1` branch.

| Area | Feature | Status | Notes |
|---|---|---|---|
| Pages | Home, About, Courses, Course detail, Admissions, Corporate & Partnerships, News & Events, Contact, Policies | Working | Content from `src/content/`; empty sections hide |
| | Course search and filters (subject, format, duration, status) | Working | URL-based, works without JavaScript |
| | First course, *Practical Entrepreneurship and Small Business Management* | Working | Shown as proposed; dates, venue and final fee pending approval |
| | Founder profile with photo | Working | Approved 18–19 Oct 2026 |
| | Contact details | Working | Office hours and map pin awaiting confirmation |
| | Policies (5) | Working | Gaps filled from management guidance; legal review pending |
| | Incorporation announcement | Working | |
| Forms | Contact, corporate training, partnership enquiries emailed to the office | Working | Needs a Resend account and key in production; until then, phone and email are shown |
| | Spam protection: honeypot, timing token, rate limit | Working | Rate limit is per server instance (no database) |
| Design | Brand tokens, Poppins/Inter, logo, icons, social image | Working | Logo extracted from a screenshot; vector still wanted |
| | Accessibility, reduced motion, mobile layouts | Working | Automated axe checks on every page at 390px and 1440px |
| SEO | Metadata, Open Graph, sitemap.xml, robots.txt | Working | |
| Hosting | Builds on Vercel with no settings or database | Working | Domain and Resend still to connect |

## Moved to the separate portal project

Staff sign-in with two-step verification, approval workflows, audit log, course and cohort management, admissions, payments (Paystack), learning tools, attendance, certificates and automation. See the `platform-stage1` branch.

## Known limitation

Pages for unknown course, news or policy addresses show the not-found page with `noindex`; in production builds Next.js returns HTTP status 200 for these rather than 404.
