import { describe, expect, it } from "vitest";
import { PERMISSIONS, ROLE_PERMISSIONS, permissionsFor, rolesHave } from "@/server/auth/permissions";

describe("role permission matrix", () => {
  it("only uses declared permissions", () => {
    for (const perms of Object.values(ROLE_PERMISSIONS)) for (const p of perms) expect(PERMISSIONS).toContain(p);
  });

  it("secretary cannot change fees, approve refunds or verify payments", () => {
    const s = permissionsFor(["SECRETARY_ADMIN"]);
    for (const p of ["fees.propose", "fees.approve", "refunds.approve", "payments.verify", "users.manage", "course.approve"] as const) {
      expect(s.has(p), p).toBe(false);
    }
  });

  it("instructors have no finance, payroll, admissions or user access", () => {
    const i = permissionsFor(["INSTRUCTOR"]);
    for (const p of ["finance.view", "payments.record", "payments.verify", "fees.propose", "admissions.view", "users.manage", "enquiry.view", "course.edit"] as const) {
      expect(i.has(p), p).toBe(false);
    }
    expect(i.has("teaching.assigned")).toBe(true);
  });

  it("students have no staff access at all", () => {
    expect([...permissionsFor(["STUDENT"])]).toEqual(["student.self"]);
  });

  it("only the CEO manages access", () => {
    const holders = Object.entries(ROLE_PERMISSIONS).filter(([, p]) => p.includes("users.manage")).map(([r]) => r);
    expect(holders).toEqual(["CEO"]);
  });

  it("whoever can propose fees cannot also approve them, except the CEO (who is blocked per-record)", () => {
    for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
      if (role === "CEO") continue;
      expect(perms.includes("fees.propose") && perms.includes("fees.approve"), role).toBe(false);
    }
  });

  it("the coordinator approves but cannot record or verify payments", () => {
    expect(rolesHave(["OPERATIONS_COORDINATOR"], "fees.approve")).toBe(true);
    expect(rolesHave(["OPERATIONS_COORDINATOR"], "payments.verify")).toBe(false);
    expect(rolesHave(["OPERATIONS_COORDINATOR"], "users.manage")).toBe(false);
  });

  it("combining roles unions permissions", () => {
    const p = permissionsFor(["SECRETARY_ADMIN", "FINANCE_OFFICER"]);
    expect(p.has("enquiry.manage") && p.has("payments.record")).toBe(true);
  });
});
