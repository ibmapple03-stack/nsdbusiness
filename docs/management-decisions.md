# Decisions and credentials still required

Updated 19 October 2026, after management supplied the website content and launch information. Nothing in this list is published or assumed until management supplies it. Items marked ★ block launch.

## Supplied on 19 October 2026 (now in the site)

- Office address, telephone (+234 803 758 8888) and general enquiries email (info@nsdbusinessltd.com), shown on the Contact page, footer and home page.
- Domain: `www.nsdbusinessltd.com`. Admin email `admin@nsdbusinessltd.com` is the privacy, complaints and refunds contact in the policies. CEO login: `drnasidi@nsdbusinessltd.com`.
- First course: *Practical Entrepreneurship and Small Business Management*, published as a **proposed** course with no dates (enrolment is not open).
- Policy content for all five policies; no [bracketed] placeholders remain. Learners must be 18 or over.
- Admissions requirements for the introductory course.
- Founder biography (updated wording) and photo approved. Muktar Buba's biography entered (profile unpublished until his title is confirmed).
- Incorporation announcement (dated 30 September 2026) on News & Events.
- Certificate wording for course 1, for Stage 4 certificates:
  > "NSD Business Academy Limited certifies that [Learner Name] successfully completed Practical Entrepreneurship and Small Business Management, comprising 24 instructor-led hours and practical assessments, from [Start Date] to [End Date]."
  > With certificate number, issue date and authorised signatures. Must not imply NBTE accreditation or a nationally recognised qualification.

## Still to confirm before launch

- ★ **Test every contact:** the website, all three mailboxes (info@, admin@, drnasidi@) and the telephone number. The CEO account invitation is sent only after the drnasidi@ mailbox is confirmed working.
- ★ **Map pin:** Muktar to supply the exact Google Maps pin at the office entrance (not the hospital's location).
- **Office hours:** Monday–Friday, 8:00 a.m.–5:00 p.m. is entered but hidden until management confirms it.
- **WhatsApp:** confirm availability before a WhatsApp button is added.
- ★ **Professional (legal) review** of the five policies, now that the gaps are filled. In particular: the privacy notice's list of service providers (name them once hosting, email and payment accounts exist), the documented retention schedule for completed-course records, and financial-record retention periods (accountant to confirm). The previous limitation-of-liability placeholder was removed from the terms; a legal adviser may add wording.
- Designate the officer responsible for privacy requests and confirm the admin@ inbox is monitored.

## Course 1 — before enrolment opens

Publish dates and open applications only after management approves the course **budget, instructor, venue, timetable and fee** and any applicable permissions:
- Start date (none is published until set).
- Teaching venue (separate from the administrative office).
- Final fee. ₦30,000 per participant is shown as *proposed*, with two instalments of ₦15,000 (after admission, and before Week 3), subject to a completed course costing.
- Online checkout is enabled only after payment verification and reconciliation have been tested (Stage 2).

## People

- Confirm Muktar Buba's public title ("Administration, Training and Operations Coordinator" is proposed). His biography is entered.
- Academy Manager: full name, approved title, biography and photograph.
- Maryam Muhammad Gabdo (Secretary and Administrative Officer): publish her profile and photograph only with approval and her permission.
- Instructor profiles: names, approved biographies, photos with consent. No qualifications, achievements or photographs are invented.

## Brand

- The current logo (extracted from `logo.jpg`) stays in use for now. The original vector file is still wanted for print, signage and certificates.
- Proposed five pillars, **pending approval**: Business and Entrepreneurship, Digital Skills, Vocational Skills, Employability, Community Enterprise. The site's subject filter still uses the guideline's pillars (which include Professional Development and Business Support) until the new set is approved.
- The brand guideline mock-ups ("500+ students", "100+ businesses", "50+ instructors", sample testimonial) are **not used anywhere** and must not be.

## Content

- Course details for the other 9 draft courses.
- Yola office announcement, after visitor arrangements are confirmed.
- Partners and sponsors: only documented partnerships, with permission to use names and logos. Prospective partners, organisations approached for support and government agencies are never shown as confirmed partners.

## Decisions

- Guardian and safeguarding process, before any learner under 18 is admitted (currently 18+ only).
- Approval limits: should the Coordinator's fee and refund approvals have an upper limit above which the CEO must approve?
- Should the Coordinator also be able to approve policies (currently CEO only)?
- Working hours and leave rules for the staff attendance module (Stage 3).

## Launch check (from management)

Before publishing admissions or accepting payments, management approves: verified contacts and map pin; first course budget, instructor, venue, dates and fee; enrolment, refund and privacy policies; secure student and staff access; tested payment confirmation and receipts; accurate certificate wording; approved public team profiles and brand assets.

## Accounts and credentials (owned by the academy, never by a developer)

| Item | Needed for | Stage |
|---|---|---|
| ★ Vercel account (team owned by the academy) | Hosting | Launch |
| ★ Managed PostgreSQL account | Database + backups | Launch |
| ★ Domain registrar access for `nsdbusinessltd.com` | DNS | Launch |
| ★ Email sending service (Resend or SMTP) + DNS records | Password and notification emails | Launch |
| Paystack business account: test keys, then live keys after verification | Payments | 2 |
| Private object storage (Cloudflare R2 / Supabase Storage) | Application documents | 2 |
| WhatsApp Business Platform (official API) | Notifications — only after approval and recipient opt-in | 4 |
