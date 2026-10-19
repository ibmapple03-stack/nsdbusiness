"use server";

import { headers } from "next/headers";
import type { ActionResult } from "@/components/ui/action-form";
import { EmailNotActivatedError, sendEmail } from "@/server/email";
import { env } from "@/server/env";
import { enquiryEmail, enquiryInput, fieldErrors, formToObject } from "@/server/enquiry";
import { formTokenAge } from "@/server/form-token";
import { rateLimit } from "@/server/rate-limit";

const MIN_FILL_MS = 3_000;
const MAX_FILL_MS = 1000 * 60 * 60 * 6;

export async function submitEnquiry(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const thanks: ActionResult = { ok: true, message: "Thank you. Your message has been sent to the academy office, and we will reply by email." };
  if (!env.formsEnabled) return { ok: false, message: "Online messages are not available yet. Please call or email the academy office." };

  // Honeypot: real people never see or fill this field. Pretend success so bots learn nothing.
  if (String(formData.get("website") ?? "").trim()) return thanks;

  const age = formTokenAge(String(formData.get("token") ?? ""));
  if (age === null || age > MAX_FILL_MS) return { ok: false, message: "This form has expired. Reload the page and try again." };
  if (age < MIN_FILL_MS) return thanks;

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`enquiry:${ip}`, 5, 600)) {
    return { ok: false, message: "Too many messages from this connection. Wait ten minutes and try again." };
  }

  const parsed = enquiryInput.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, message: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };

  try {
    await sendEmail(enquiryEmail(parsed.data, env.ENQUIRY_TO));
  } catch (e) {
    console.error("Enquiry email failed", e);
    if (e instanceof EmailNotActivatedError) {
      return { ok: false, message: `Online messages are being switched on. Please email ${env.ENQUIRY_TO} for now.` };
    }
    return { ok: false, message: `Your message could not be sent. Please email ${env.ENQUIRY_TO} instead.` };
  }
  return thanks;
}
