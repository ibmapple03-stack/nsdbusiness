import "server-only";
import { z } from "zod";

export type EnquiryType = "CONTACT" | "CORPORATE_TRAINING" | "PARTNERSHIP";

export const ENQUIRY_LABELS: Record<EnquiryType, string> = {
  CONTACT: "General enquiry",
  CORPORATE_TRAINING: "Corporate training request",
  PARTNERSHIP: "Partnership enquiry",
};

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);
const required = (max: number, label: string) => z.string().trim().min(1, `${label} is required.`).max(max, `Keep this under ${max} characters.`);

const phone = z
  .string()
  .trim()
  .max(30)
  .regex(/^[+\d][\d\s()-]{6,}$/, "Enter a phone number, e.g. +234 803 000 0000.")
  .or(z.literal(""));

export const enquiryInput = z
  .object({
    type: z.enum(["CONTACT", "CORPORATE_TRAINING", "PARTNERSHIP"]),
    name: required(120, "Your name"),
    email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(200),
    phone: phone.optional().default(""),
    organisationName: text(200).optional().default(""),
    subject: text(200).optional().default(""),
    message: required(4000, "A message"),
    headcount: text(40).optional().default(""),
    preferredDates: text(200).optional().default(""),
    topics: text(500).optional().default(""),
    interest: text(200).optional().default(""),
    consent: z.literal("on", { message: "Confirm that we may use these details to reply to you." }),
  })
  .refine((v) => v.type === "CONTACT" || !!v.organisationName, { path: ["organisationName"], message: "Organisation is required." });

export type Enquiry = z.infer<typeof enquiryInput>;

/** Plain-text email for the academy office. The visitor's address is set as Reply-To. */
export function enquiryEmail(e: Enquiry, to: string) {
  const rows: [string, string][] = [
    ["Name", e.name],
    ["Email", e.email],
    ["Phone", e.phone],
    ["Organisation", e.organisationName],
    ["Subject", e.subject],
    ["Participants", e.headcount],
    ["Preferred dates", e.preferredDates],
    ["Topics", e.topics],
    ["Area of interest", e.interest],
  ];
  const details = rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n");
  const about = e.subject || e.organisationName;
  return {
    to,
    replyTo: e.email,
    subject: `${ENQUIRY_LABELS[e.type]} from ${e.name}${about ? ` — ${about}` : ""}`.slice(0, 200),
    text: `${ENQUIRY_LABELS[e.type]} sent from the website.\n\n${details}\n\nMessage:\n${e.message}\n\nReply to this email to answer ${e.name} directly.`,
  };
}

export function formToObject(fd: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of new Set(fd.keys())) if (!key.startsWith("$ACTION")) out[key] = String(fd.get(key) ?? "");
  return out;
}

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) out[String(issue.path[0] ?? "form")] ??= issue.message;
  return out;
}
