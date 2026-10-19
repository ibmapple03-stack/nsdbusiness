import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { AuthzError, UserFacingError, makeActor } from "@/server/auth/actor";
import { addSession, createCohort, decideFee, proposeFee, updateCourse } from "@/server/services/catalogue-service";
import { setSettingVerified, updateSetting } from "@/server/services/content-service";
import { createStaffUser, setUserRoles } from "@/server/services/user-service";
import { transition } from "@/server/services/workflow-service";
import { instructorCohorts } from "@/server/admin-data";
import { RUN, actorFor, draftCourse, orgId } from "./helpers";

afterAll(() => db.$disconnect());

async function demoCohort() {
  return db.cohort.findFirstOrThrow({ where: { code: "DEMO-ENT-01" } });
}

describe("fees: proposal and approval are separated", () => {
  it("the secretary cannot propose or approve a fee", async () => {
    const secretary = await actorFor("secretary");
    const cohort = await demoCohort();
    await expect(proposeFee(secretary, cohort.id, 5_000_000, "test")).rejects.toBeInstanceOf(AuthzError);
    await expect(decideFee(secretary, cohort.id, "approve", "")).rejects.toBeInstanceOf(AuthzError);
  });

  it("finance proposes, the live fee is unchanged until a different approver decides", async () => {
    const finance = await actorFor("finance");
    const coordinator = await actorFor("coordinator");
    const before = await demoCohort();

    await proposeFee(finance, before.id, 4_800_000, "Updated materials cost");
    const pending = await demoCohort();
    expect(pending.feeKobo).toBe(before.feeKobo);
    expect(pending.proposedFeeKobo).toBe(4_800_000);

    // Finance has no approval permission at all.
    await expect(decideFee(finance, before.id, "approve", "")).rejects.toBeInstanceOf(AuthzError);

    await decideFee(coordinator, before.id, "approve", "OK");
    const after = await demoCohort();
    expect(after.feeKobo).toBe(4_800_000);
    expect(after.proposedFeeKobo).toBeNull();

    const log = await db.auditLog.findFirst({ where: { entityId: before.id, action: "fee.approve" }, orderBy: { createdAt: "desc" } });
    expect(log?.actorId).toBe(coordinator.userId);
  });

  it("even the CEO cannot approve a fee they proposed", async () => {
    const ceo = await actorFor("ceo");
    const cohort = await demoCohort();
    await proposeFee(ceo, cohort.id, 5_100_000, "CEO proposal");
    await expect(decideFee(ceo, cohort.id, "approve", "")).rejects.toBeInstanceOf(AuthzError);
    await decideFee(await actorFor("coordinator"), cohort.id, "reject", "Not this term");
    expect((await demoCohort()).feeKobo).toBe(cohort.feeKobo);
  });
});

describe("publication workflow", () => {
  it("an editor cannot approve, and a submitter cannot approve their own work", async () => {
    const manager = await actorFor("manager");
    const ceo = await actorFor("ceo");
    const coordinator = await actorFor("coordinator");
    const course = await draftCourse("workflow-test");

    await transition(manager, "course", course.id, "submit", null);
    await expect(transition(manager, "course", course.id, "approve", null)).rejects.toBeInstanceOf(AuthzError);

    const ceoCourse = await draftCourse("workflow-test-ceo");
    await transition(ceo, "course", ceoCourse.id, "submit", null);
    await expect(transition(ceo, "course", ceoCourse.id, "approve", null)).rejects.toBeInstanceOf(UserFacingError);

    await transition(coordinator, "course", course.id, "approve", "Looks good");
    // Publishing requires certificate wording and refund terms.
    await expect(transition(coordinator, "course", course.id, "publish", null)).rejects.toThrow(/certificate/i);
  });

  it("published records cannot be edited directly", async () => {
    const manager = await actorFor("manager");
    const published = await db.course.findFirstOrThrow({ where: { slug: "digital-marketing" } });
    expect(published.status).toBe("PUBLISHED");
    await expect(
      updateCourse(manager, published.id, { ...published, curriculum: [], durationWeeks: published.durationWeeks } as never),
    ).rejects.toThrow(/back to draft/i);
  });

  it("rejecting requires a reason", async () => {
    const coordinator = await actorFor("coordinator");
    const course = await draftCourse("reject-test");
    await transition(await actorFor("manager"), "course", course.id, "submit", null);
    await expect(transition(coordinator, "course", course.id, "reject", "  ")).rejects.toThrow(/reason/i);
  });
});

describe("organisation isolation", () => {
  it("staff of another organisation cannot touch academy records", async () => {
    const other = await db.organisation.upsert({ where: { slug: "other-org-test" }, create: { slug: "other-org-test", name: "Other organisation (test)" }, update: {} });
    const ceo = await actorFor("ceo");
    const outsider = makeActor({ userId: ceo.userId, name: "Outsider", email: "x@example.test", organisationId: other.id, roles: ["CEO"] });
    const course = await draftCourse("isolation-test");
    await expect(transition(outsider, "course", course.id, "submit", null)).rejects.toBeInstanceOf(AuthzError);
  });
});

describe("instructors", () => {
  it("see only cohorts assigned to them and cannot edit courses", async () => {
    const instructor = await actorFor("instructor");
    const cohorts = await instructorCohorts(instructor);
    expect(cohorts.length).toBeGreaterThan(0);
    const profile = await db.staffProfile.findUniqueOrThrow({ where: { userId: instructor.userId } });
    expect(cohorts.every((c) => c.instructorId === profile.id)).toBe(true);

    const course = await draftCourse("instructor-test");
    await expect(transition(instructor, "course", course.id, "submit", null)).rejects.toBeInstanceOf(AuthzError);
  });
});

describe("timetable", () => {
  it("rejects a session that double-books a venue", async () => {
    const manager = await actorFor("manager");
    const organisationId = await orgId();
    const a = await demoCohort();
    const course = await draftCourse("timetable-test");
    const b = await createCohort(manager, {
      courseId: course.id,
      code: `TT-${RUN}`,
      startDate: new Date("2026-11-16T00:00:00Z"),
      endDate: new Date("2026-12-18T00:00:00Z"),
      applicationDeadline: null,
      timetableSummary: "",
      deliveryFormat: "CLASSROOM",
      venueId: a.venueId,
      instructorId: null,
      capacity: 10,
      paymentOptions: "",
      instalmentsAllowed: false,
      cohortStatus: "PLANNED",
    });
    // A run-unique day so repeated runs never collide with each other.
    const day = new Date(Date.UTC(2030, 0, 1) + (Date.now() % 100_000) * 86_400_000);
    const at = (h: number) => new Date(day.getTime() + h * 3_600_000);
    const slot = { startsAt: at(9), endsAt: at(12), venueId: null, instructorId: null, note: "" };
    await addSession(manager, a.id, slot);
    await expect(addSession(manager, b.id, slot)).rejects.toThrow(/conflict/i);
    // Back-to-back is fine.
    await addSession(manager, b.id, { ...slot, startsAt: at(12), endsAt: at(14) });
    expect(await db.cohortSession.count({ where: { cohort: { organisationId } } })).toBeGreaterThanOrEqual(2);
  });
});

describe("contact details and access management", () => {
  it("editing a verified value withdraws it until verified again", async () => {
    const manager = await actorFor("manager");
    const coordinator = await actorFor("coordinator");
    const setting = await db.siteSetting.findFirstOrThrow({ where: { key: "contact.address" } });
    expect(setting.verified).toBe(true);
    await updateSetting(manager, setting.id, `Yola, Adamawa State, Nigeria (test ${RUN})`);
    expect((await db.siteSetting.findUniqueOrThrow({ where: { id: setting.id } })).verified).toBe(false);
    await expect(setSettingVerified(manager, setting.id, true)).rejects.toBeInstanceOf(AuthzError);
    await setSettingVerified(coordinator, setting.id, true);
    expect((await db.siteSetting.findUniqueOrThrow({ where: { id: setting.id } })).verified).toBe(true);
  });

  it("only the CEO can create accounts or change roles", async () => {
    const coordinator = await actorFor("coordinator");
    const secretary = await actorFor("secretary");
    await expect(createStaffUser(coordinator, { name: "X", email: `x.${RUN}@example.test`, roles: ["CEO"] })).rejects.toBeInstanceOf(AuthzError);
    await expect(setUserRoles(secretary, secretary.userId, ["CEO"], "self-promotion")).rejects.toBeInstanceOf(AuthzError);
  });

  it("staff accounts cannot be given student roles from the admin area", async () => {
    const ceo = await actorFor("ceo");
    await expect(createStaffUser(ceo, { name: "Y", email: `y.${RUN}@example.test`, roles: ["STUDENT"] })).rejects.toBeInstanceOf(UserFacingError);
  });
});
