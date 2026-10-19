# Roles and permissions

**Source of truth:** `src/server/auth/permissions.ts`. Regenerate the table below with `npx tsx scripts/print-roles.ts` after any change. Unit tests in `tests/unit/permissions.test.ts` lock in the key rules.

## How access is enforced

1. **Server, not buttons.** Every admin page calls `requireStaffPage(permission)` and every server action calls `runAction(permission, …)`, which re-reads the session and roles on each request. Hiding a button is only a convenience.
2. **Service layer checks again.** Each service function (`src/server/services/*`) calls `assertCan()` and `assertSameOrg()` before touching data, so a mistake in a page cannot bypass a rule.
3. **Organisation scoping.** Roles are held per organisation (`Membership`). All queries filter by the actor's `organisationId`. Staff who also work for SABFI get no access to SABFI records through this platform, and SABFI data is not stored here.
4. **Maker-checker.**
   - Approving a submission requires a *different* person from the submitter (all publishable records).
   - Fee changes are *proposed* by one person and *approved* by another. Even the CEO cannot approve their own fee proposal.
   - Contact details become public only after someone with `settings.verify` verifies them; editing a value un-verifies it.
5. **Audit.** Every sensitive change writes an `AuditLog` row (who, when, what, why) in the same database transaction. Email addresses, phone numbers, passwords, tokens and IPs are redacted from snapshots.
6. **Two-step sign-in.** Mandatory for every staff role in production (TOTP authenticator + one-time backup codes).

## Roles

| Role | Who | Summary |
|---|---|---|
| CEO | Managing Director/CEO | Organisation-wide oversight, all approvals, access management. Only role that can approve policies and create staff accounts. |
| Coordinator | Administration, Training and Operations Coordinator (Muktar) | Academy operations and approval queues. No access management, no payment recording/verification. |
| Manager | Academy Manager | Courses, cohorts, instructors, timetables, admissions, operational reports. Proposes fees; cannot approve them. |
| Secretary | Secretary and Administrative Officer | Enquiries, correspondence, schedules, draft page text. **No** fee changes, refund approval, or payment verification. |
| Finance | Finance Officer | Proposes fees; invoices, payment recording and verification, reconciliation (Stage 2). |
| Instructor | Instructors | Only cohorts assigned to their own profile. No finance, admissions, enquiries or course editing. |
| Student / Guardian | Learners (Stage 2) | Their own records only. |

## Permission matrix

| Permission | CEO | Coord. | Manager | Secretary | Finance | Instructor | Student | Guardian |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `admin.access` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |  |  |
| `content.edit` | ✓ | ✓ | ✓ | ✓ |  |  |  |  |
| `content.approve` | ✓ | ✓ |  |  |  |  |  |  |
| `course.view` | ✓ | ✓ | ✓ | ✓ | ✓ |  |  |  |
| `course.edit` | ✓ | ✓ | ✓ |  |  |  |  |  |
| `course.approve` | ✓ | ✓ |  |  |  |  |  |  |
| `cohort.edit` | ✓ | ✓ | ✓ |  |  |  |  |  |
| `cohort.approve` | ✓ | ✓ |  |  |  |  |  |  |
| `timetable.edit` | ✓ | ✓ | ✓ | ✓ |  |  |  |  |
| `venue.edit` | ✓ | ✓ | ✓ |  |  |  |  |  |
| `fees.propose` | ✓ |  | ✓ |  | ✓ |  |  |  |
| `fees.approve` | ✓ | ✓ |  |  |  |  |  |  |
| `profile.edit` | ✓ | ✓ | ✓ |  |  |  |  |  |
| `profile.approve` | ✓ | ✓ |  |  |  |  |  |  |
| `policy.edit` | ✓ | ✓ | ✓ |  |  |  |  |  |
| `policy.approve` | ✓ |  |  |  |  |  |  |  |
| `settings.edit` | ✓ | ✓ | ✓ |  |  |  |  |  |
| `settings.verify` | ✓ | ✓ |  |  |  |  |  |  |
| `enquiry.view` | ✓ | ✓ | ✓ | ✓ |  |  |  |  |
| `enquiry.manage` | ✓ | ✓ | ✓ | ✓ |  |  |  |  |
| `audit.view` | ✓ | ✓ |  |  |  |  |  |  |
| `reports.view` | ✓ | ✓ | ✓ |  | ✓ |  |  |  |
| `users.manage` | ✓ |  |  |  |  |  |  |  |
| `admissions.view` | ✓ | ✓ | ✓ | ✓ |  |  |  |  |
| `admissions.decide` | ✓ | ✓ | ✓ |  |  |  |  |  |
| `finance.view` | ✓ | ✓ |  |  | ✓ |  |  |  |
| `payments.record` | ✓ |  |  |  | ✓ |  |  |  |
| `payments.verify` | ✓ |  |  |  | ✓ |  |  |  |
| `refunds.request` | ✓ |  | ✓ | ✓ | ✓ |  |  |  |
| `refunds.approve` | ✓ | ✓ |  |  |  |  |  |  |
| `teaching.assigned` |  |  |  |  |  | ✓ |  |  |
| `student.self` |  |  |  |  |  |  | ✓ | ✓ |

Permissions from `admissions.*` downward are declared now so the whole matrix can be reviewed by management; the screens that use them arrive in Stages 2–3.

## Reporting lines (recorded on profiles, not used for access)

- Academy Manager → Muktar Buba → CEO
- Secretary and Administrative Officer → coordinates through Muktar Buba; may receive document assignments directly from the CEO.

## Decisions for management

- Should the Coordinator also approve policies? (Currently CEO only.)
- Should fee approval by the Coordinator have an upper limit, above which the CEO must approve? (Approval-limit tables arrive with purchase requests in Stage 3.)
