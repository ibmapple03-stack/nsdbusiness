"use server";

import type { ActionResult } from "@/components/ui/action-form";
import { EnquiryStatus, Role } from "@/generated/prisma/enums";
import { UserFacingError } from "@/server/auth/actor";
import { auth } from "@/server/auth/auth";
import { addSession, createCohort, createCourse, decideFee, proposeFee, removeSession, saveVenue, updateCohort, updateCourse } from "@/server/services/catalogue-service";
import { newPolicyVersion, saveEvent, saveNews, saveProfile, setPhotoApproval, setSettingVerified, updateContentBlock, updatePolicy, updateSetting } from "@/server/services/content-service";
import { updateEnquiry } from "@/server/services/enquiry-service";
import { createStaffUser, setUserActive, setUserRoles } from "@/server/services/user-service";
import { WORKFLOW_ENTITIES, transition, type WorkflowEntity } from "@/server/services/workflow-service";
import { ACTION_LABELS, type WorkflowAction } from "@/server/workflow";
import {
  cohortInput,
  contentBlockInput,
  courseInput,
  eventInput,
  feeProposalInput,
  fieldErrors,
  formToObject,
  newsInput,
  policyInput,
  profileInput,
  sessionInput,
  settingInput,
  staffUserInput,
  venueInput,
} from "@/server/validation";
import { runAction, str } from "./run-action";
import type { z } from "zod";

function parse<T extends z.ZodType>(schema: T, fd: FormData): z.output<T> {
  const result = schema.safeParse(formToObject(fd));
  if (!result.success) throw new UserFacingError("Check the highlighted fields.", fieldErrors(result.error));
  return result.data;
}

// ── Workflow (all publishable records) ──

export async function transitionAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const entity = str(fd, "entity") as WorkflowEntity;
  const action = str(fd, "action") as WorkflowAction;
  if (!(entity in WORKFLOW_ENTITIES) || !(action in ACTION_LABELS)) return { ok: false, message: "Unknown action." };
  // The precise permission (edit vs approve) is enforced inside transition().
  return runAction("admin.access", async (actor, ip) => {
    const { status, tag } = await transition(actor, entity, str(fd, "id"), action, str(fd, "reason") || null, ip);
    return { message: `${WORKFLOW_ENTITIES[entity].label} is now ${status.toLowerCase()}.`, tags: [tag] };
  });
}

// ── Courses & cohorts ──

export async function saveCourseAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAction("course.edit", async (actor, ip) => {
    const input = parse(courseInput, fd);
    const id = str(fd, "id");
    if (id) {
      await updateCourse(actor, id, input, ip);
      return { message: "Course saved.", tags: ["catalogue"] };
    }
    const course = await createCourse(actor, input, ip);
    return { redirectTo: `/admin/courses/${course.id}` };
  });
}

export async function saveCohortAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAction("cohort.edit", async (actor, ip) => {
    const input = parse(cohortInput, fd);
    const id = str(fd, "id");
    if (id) {
      await updateCohort(actor, id, input, ip);
      return { message: "Cohort saved.", tags: ["catalogue"] };
    }
    const cohort = await createCohort(actor, input, ip);
    return { redirectTo: `/admin/cohorts/${cohort.id}` };
  });
}

export async function proposeFeeAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAction("fees.propose", async (actor, ip) => {
    const { amount, reason } = parse(feeProposalInput, fd);
    await proposeFee(actor, str(fd, "id"), amount, reason, ip);
    return { message: "Fee proposal sent for approval." };
  });
}

export async function decideFeeAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAction("fees.approve", async (actor, ip) => {
    const decision = str(fd, "decision") === "approve" ? "approve" : "reject";
    await decideFee(actor, str(fd, "id"), decision, str(fd, "reason"), ip);
    return { message: decision === "approve" ? "Fee approved and now live." : "Fee proposal returned.", tags: ["catalogue"] };
  });
}

export async function addSessionAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAction("timetable.edit", async (actor, ip) => {
    await addSession(actor, str(fd, "cohortId"), parse(sessionInput, fd), ip);
    return { message: "Session added to the timetable." };
  });
}

export async function removeSessionAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAction("timetable.edit", async (actor, ip) => {
    await removeSession(actor, str(fd, "sessionId"), ip);
    return { message: "Session removed." };
  });
}

export async function saveVenueAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAction("venue.edit", async (actor, ip) => {
    const id = str(fd, "id") || null;
    await saveVenue(actor, id, parse(venueInput, fd), ip);
    return id ? { message: "Venue saved.", tags: ["catalogue"] } : { redirectTo: "/admin/venues" };
  });
}

// ── People & content ──

export async function saveProfileAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAction("profile.edit", async (actor, ip) => {
    const id = str(fd, "id") || null;
    const profile = await saveProfile(actor, id, parse(profileInput, fd), ip);
    return id ? { message: "Profile saved.", tags: ["people"] } : { redirectTo: `/admin/people/${profile.id}` };
  });
}

export async function photoApprovalAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAction("profile.approve", async (actor, ip) => {
    const approved = str(fd, "approved") === "true";
    await setPhotoApproval(actor, str(fd, "id"), approved, str(fd, "reason"), ip);
    return { message: approved ? "Photo approved for publication." : "Photo withdrawn from the website.", tags: ["people"] };
  });
}

export async function saveContentAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAction("content.edit", async (actor, ip) => {
    await updateContentBlock(actor, str(fd, "id"), parse(contentBlockInput, fd), ip);
    return { message: "Text saved.", tags: ["content"] };
  });
}

export async function savePolicyAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAction("policy.edit", async (actor, ip) => {
    await updatePolicy(actor, str(fd, "id"), parse(policyInput, fd), ip);
    return { message: "Policy saved.", tags: ["policies"] };
  });
}

export async function newPolicyVersionAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAction("policy.edit", async (actor, ip) => {
    const next = await newPolicyVersion(actor, str(fd, "id"), ip);
    return { redirectTo: `/admin/policies/${next.id}` };
  });
}

export async function saveNewsAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAction("content.edit", async (actor, ip) => {
    const id = str(fd, "id") || null;
    const post = await saveNews(actor, id, parse(newsInput, fd), ip);
    return id ? { message: "Post saved.", tags: ["news"] } : { redirectTo: `/admin/news/${post.id}` };
  });
}

export async function saveEventAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAction("content.edit", async (actor, ip) => {
    const id = str(fd, "id") || null;
    const event = await saveEvent(actor, id, parse(eventInput, fd), ip);
    return id ? { message: "Event saved.", tags: ["news"] } : { redirectTo: `/admin/events/${event.id}` };
  });
}

export async function updateSettingAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAction("settings.edit", async (actor, ip) => {
    await updateSetting(actor, str(fd, "id"), parse(settingInput, fd).value, ip);
    return { message: "Saved. The value is hidden from the public site until it is verified.", tags: ["settings"] };
  });
}

export async function verifySettingAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAction("settings.verify", async (actor, ip) => {
    const verified = str(fd, "verified") === "true";
    await setSettingVerified(actor, str(fd, "id"), verified, ip);
    return { message: verified ? "Verified and now shown publicly." : "Withdrawn from the public site.", tags: ["settings"] };
  });
}

// ── Enquiries ──

export async function updateEnquiryAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAction("enquiry.manage", async (actor, ip) => {
    const status = str(fd, "status") as EnquiryStatus;
    if (!(status in EnquiryStatus)) throw new UserFacingError("Choose a status.");
    await updateEnquiry(actor, str(fd, "id"), status, str(fd, "note"), ip);
    return { message: "Enquiry updated." };
  });
}

// ── Users & access ──

export async function createUserAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAction("users.manage", async (actor, ip) => {
    const input = parse(staffUserInput, fd);
    await createStaffUser(actor, input, ip);
    // Sends the "set your password" email.
    await auth.api.requestPasswordReset({ body: { email: input.email, redirectTo: "/reset-password" } });
    return { redirectTo: "/admin/users?created=1" };
  });
}

export async function setRolesAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAction("users.manage", async (actor, ip) => {
    const roles = fd.getAll("roles").map(String).filter((r): r is Role => r in Role);
    if (!roles.length) throw new UserFacingError("Choose at least one role, or deactivate the account instead.");
    if (!str(fd, "reason")) throw new UserFacingError("Give a reason for this change.", { reason: "A reason is required." });
    await setUserRoles(actor, str(fd, "id"), roles, str(fd, "reason"), ip);
    return { message: "Roles updated." };
  });
}

export async function setActiveAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  return runAction("users.manage", async (actor, ip) => {
    const active = str(fd, "active") === "true";
    await setUserActive(actor, str(fd, "id"), active, str(fd, "reason"), ip);
    return { message: active ? "Account reactivated." : "Account deactivated and signed out." };
  });
}
