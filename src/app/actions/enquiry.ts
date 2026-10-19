"use server";

import type { ActionResult } from "@/components/ui/action-form";
import { hashIp } from "@/server/audit";
import { requestIp } from "@/server/auth/session";
import { academyId } from "@/server/org";
import { formTokenAge } from "@/server/form-token";
import { rateLimit } from "@/server/rate-limit";
import { createEnquiry } from "@/server/services/enquiry-service";
import { enquiryInput, fieldErrors, formToObject } from "@/server/validation";

const MIN_FILL_MS = 3_000;
const MAX_FILL_MS = 1000 * 60 * 60 * 6;

export async function submitEnquiry(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const thanks: ActionResult = { ok: true, message: "Thank you. Your message has been received and the academy office will reply by email." };

  // Honeypot: real people never see or fill this field. Pretend success so bots learn nothing.
  if (String(formData.get("website") ?? "").trim()) return thanks;

  const age = formTokenAge(String(formData.get("token") ?? ""));
  if (age === null || age > MAX_FILL_MS) return { ok: false, message: "This form has expired. Reload the page and try again." };
  if (age < MIN_FILL_MS) return thanks;

  const ip = await requestIp();
  if (!(await rateLimit(`enquiry:${hashIp(ip) ?? "unknown"}`, 5, 600))) {
    return { ok: false, message: "Too many messages from this connection. Wait ten minutes and try again." };
  }

  const parsed = enquiryInput.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, message: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };

  await createEnquiry(await academyId(), parsed.data, ip);
  return thanks;
}
