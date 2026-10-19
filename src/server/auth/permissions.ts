/**
 * Role → permission matrix. This file is the single source of truth and is
 * mirrored in docs/roles-and-permissions.md. Every server action and route
 * handler checks permissions through `can()` / `requirePermission()`; hiding a
 * button in the UI is never the only control.
 */
import type { Role } from "@/generated/prisma/enums";

export const PERMISSIONS = [
  // Admin area
  "admin.access",
  // Public content: pages, news, events
  "content.edit",
  "content.approve",
  // Course definitions and scheduled cohorts
  "course.view",
  "course.edit",
  "course.approve",
  "cohort.edit",
  "cohort.approve",
  "timetable.edit",
  "venue.edit",
  // Fees — proposing and approving are separate
  "fees.propose",
  "fees.approve",
  // People
  "profile.edit",
  "profile.approve",
  // Policies
  "policy.edit",
  "policy.approve",
  // Verified contact details and site settings
  "settings.edit",
  "settings.verify",
  // Enquiries from public forms
  "enquiry.view",
  "enquiry.manage",
  // Oversight
  "audit.view",
  "reports.view",
  "users.manage",
  // Stage 2+ (declared now so the matrix is reviewed as a whole)
  "admissions.view",
  "admissions.decide",
  "finance.view",
  "payments.record",
  "payments.verify",
  "refunds.request",
  "refunds.approve",
  "teaching.assigned",
  "student.self",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const STAFF_BASE: Permission[] = ["admin.access", "course.view"];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  CEO: PERMISSIONS.filter((p) => p !== "teaching.assigned" && p !== "student.self"),

  // Academy operational oversight and approval queues within delegated limits.
  // Access management stays with the CEO.
  OPERATIONS_COORDINATOR: [
    ...STAFF_BASE,
    "content.edit",
    "content.approve",
    "course.edit",
    "course.approve",
    "cohort.edit",
    "cohort.approve",
    "timetable.edit",
    "venue.edit",
    "fees.approve",
    "profile.edit",
    "profile.approve",
    "policy.edit",
    "settings.edit",
    "settings.verify",
    "enquiry.view",
    "enquiry.manage",
    "audit.view",
    "reports.view",
    "admissions.view",
    "admissions.decide",
    "finance.view",
    "refunds.approve",
  ],

  // Courses, cohorts, instructors, admissions, timetables, operational reports.
  ACADEMY_MANAGER: [
    ...STAFF_BASE,
    "content.edit",
    "course.edit",
    "cohort.edit",
    "timetable.edit",
    "venue.edit",
    "fees.propose",
    "profile.edit",
    "policy.edit",
    "settings.edit",
    "enquiry.view",
    "enquiry.manage",
    "reports.view",
    "admissions.view",
    "admissions.decide",
    "refunds.request",
  ],

  // Applications, correspondence, schedules, document registers, authorised
  // record updates. No refund approval, fee changes, or payment verification.
  SECRETARY_ADMIN: [
    ...STAFF_BASE,
    "content.edit",
    "timetable.edit",
    "enquiry.view",
    "enquiry.manage",
    "admissions.view",
    "refunds.request",
  ],

  // Invoices, reconciliation, financial reports, authorised payment processes.
  FINANCE_OFFICER: [
    ...STAFF_BASE,
    "fees.propose",
    "reports.view",
    "finance.view",
    "payments.record",
    "payments.verify",
    "refunds.request",
  ],

  // Assigned cohorts only. No payroll or financial records.
  INSTRUCTOR: ["admin.access", "teaching.assigned"],

  STUDENT: ["student.self"],
  GUARDIAN: ["student.self"],
};

export function permissionsFor(roles: readonly Role[]): Set<Permission> {
  const set = new Set<Permission>();
  for (const role of roles) for (const p of ROLE_PERMISSIONS[role]) set.add(p);
  return set;
}

export function rolesHave(roles: readonly Role[], permission: Permission): boolean {
  return roles.some((r) => ROLE_PERMISSIONS[r].includes(permission));
}

export const ROLE_LABELS: Record<Role, string> = {
  CEO: "Managing Director/CEO",
  OPERATIONS_COORDINATOR: "Administration, Training and Operations Coordinator",
  ACADEMY_MANAGER: "Academy Manager",
  SECRETARY_ADMIN: "Secretary and Administrative Officer",
  FINANCE_OFFICER: "Finance Officer",
  INSTRUCTOR: "Instructor",
  STUDENT: "Student",
  GUARDIAN: "Parent or guardian",
};

export const STAFF_ROLES: Role[] = [
  "CEO",
  "OPERATIONS_COORDINATOR",
  "ACADEMY_MANAGER",
  "SECRETARY_ADMIN",
  "FINANCE_OFFICER",
  "INSTRUCTOR",
];
