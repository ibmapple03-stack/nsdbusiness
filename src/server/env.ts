import "server-only";
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Every setting is optional, so the site builds and runs with none at all.
 * In production, enquiry forms are delivered through FormSubmit by default
 * (no account or DNS records; the first message triggers a one-time
 * activation email to ENQUIRY_TO). Resend is supported as an alternative.
 */
const schema = z.object({
  EMAIL_DRIVER: z.enum(["console", "formsubmit", "resend"]).default(isProduction ? "formsubmit" : "console"),
  /** Where enquiry form messages are delivered. */
  ENQUIRY_TO: z.string().email().default("info@nsdbusinessltd.com"),
  /** Optional: the random string FormSubmit emails after activation, used instead of the address. */
  FORMSUBMIT_ALIAS: z.string().regex(/^[A-Za-z0-9]+$/, "Use only the letters and numbers FormSubmit gave you").optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().min(3).default("NSD Business Academy <no-reply@nsdbusinessltd.com>"),
  /** Signs form timing tokens. Recommended in production: openssl rand -base64 32 */
  FORM_SECRET: z.string().min(16, "FORM_SECRET must be at least 16 characters").optional(),
  /** Automated tests only: lets a production build print emails to the console. Never set this on Vercel. */
  E2E_CONSOLE_EMAIL: z.enum(["true", "false"]).default("false"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}\nSee .env.example.`);
}

const data = parsed.data;

function formsEnabled(): boolean {
  if (!isProduction) return true;
  if (data.EMAIL_DRIVER === "formsubmit") return true;
  if (data.EMAIL_DRIVER === "resend") return !!data.RESEND_API_KEY;
  return data.E2E_CONSOLE_EMAIL === "true"; // console driver in a production build: tests only
}

export const env = {
  ...data,
  isProduction,
  /** When false, the forms are replaced by the office's phone number and email address. */
  formsEnabled: formsEnabled(),
  // Without FORM_SECRET the timing token uses a fixed key: still a speed bump for bots,
  // alongside the honeypot and rate limit, but set FORM_SECRET for full strength.
  formSecret: data.FORM_SECRET ?? "nsd-form-token-default-key",
};
