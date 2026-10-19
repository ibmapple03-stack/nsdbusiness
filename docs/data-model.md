# Data model

Schema: `prisma/schema.prisma`. Migrations: `prisma/migrations/`. Conventions:

- **Money** is integer kobo (`Int`, NGN minor units). Never floats. Helpers in `src/lib/money.ts`.
- **Time** is stored in UTC. Calendar dates (`@db.Date`) are stored at UTC midnight. Forms take Nigeria time (WAT, UTC+1, no daylight saving). Helpers in `src/lib/time.ts`.
- **Organisation scoping.** Every business table has `organisationId`.
- **Workflow fields** on publishable records: `status`, `submittedById/At`, `reviewedById/At`, `reviewNote`.

## Stage 1 (built)

| Model | Purpose | Notes |
|---|---|---|
| `Organisation` | The academy | Exists so records of other organisations are never mixed in |
| `User`, `Session`, `Account`, `Verification`, `TwoFactor`, `RateLimit` | Authentication | Managed by Better Auth — keep field names |
| `Membership` | User ↔ organisation ↔ role | One row per role; `active` flag for deactivation |
| `StaffProfile` | Public profiles + reporting lines | `internalNote` never public; `photoApproved` separate from publication |
| `Course` | Reusable course definition | Outcomes, curriculum (JSON), formats, certificate type, refund terms |
| `Cohort` | Scheduled run of a course | Dates, venue, instructor, capacity, `feeKobo` (live) and `proposedFeeKobo` (awaiting approval), operational `cohortStatus` + editorial `status` |
| `CohortSession` | One class meeting | Indexed for venue/instructor clash checks |
| `Venue` | Rooms and spaces | |
| `ContentBlock` | Editable page text by key | e.g. `home.intro`, `about.mission` |
| `Policy` | Versioned policies | Unique `(slug, version)`; published version stays live while the next is drafted |
| `NewsPost`, `Event` | News and events | |
| `SiteSetting` | Contact details etc. | Public only when `verified` |
| `Enquiry` | Contact / corporate / partnership forms | Raw IP never stored, only a salted hash |
| `AuditLog` | Who did what, when, why | Redacted before/after snapshots |
| `RateLimitBucket` | Form rate limiting | Fixed window, works across serverless instances |

### Course status shown to the public

Derived, never stored: from the course's **published** cohorts → *Open for applications* (any `OPEN`), *In progress* (`RUNNING`), *Upcoming* (`PLANNED`), *Completed*, or *Proposed* (published course with no cohorts yet).

## Stage 2 (designed)

`Application` (+ documents, decision history) → `AdmissionDecision` → `Enrolment` (terms acceptance timestamp) → `Invoice` / `InvoiceLine` (kobo) → `InstalmentPlan` → `PaymentAttempt` (our reference, provider reference, status) → `ProviderEvent` (**unique** provider event id — webhook idempotency) → `Payment` (verified settlement) → `Receipt` (**unique** per payment) · `ManualPaymentRecord` (recorded by → approved by) · `RefundRequest` (requested by → approved by → processed) · `Discount` · `Guardian` (consent record for minors, pending policy).

Registration, application, admission, payment and enrolment are separate records with separate states. A payment never changes an application or enrolment on its own.

## Stage 3 (designed)

`Module`, `Lesson`, `Resource`, `Assignment`, `Submission`, `Grade` (`DRAFT`/`RELEASED`), `AttendanceRecord`, `StaffShift`, `Break`, `LeaveRequest`, `ClockCorrection` (needs approval), `DailyDiary`, `Task`, `DocumentRegister`, `Correspondence`, `Asset`, `PurchaseRequest`, `ApprovalLimit`, `Complaint`.

## Stage 4 (designed)

`Notification`, `AutomationRule` (owner, enabled, retry limit), `AutomationRun` (idempotency key, attempts, outcome), `Certificate` (number, QR token, `ISSUED`/`REVOKED`/`CORRECTED`), `CertificateApproval`.
