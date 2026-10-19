import "server-only";
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Every setting is optional, so the site builds and runs with none at all.
 * Without email settings the enquiry forms are replaced by the office's
 * phone number and email address.
 */
const schema = z.object({
  FORM_SECRET: z.string().min(16, "FORM_SECRET must be at least 16 characters").optional(),
  EMAIL_DRIVER: z.enum(["console", "resend"]).default("console"),
  EMAIL_FROM: z.string().min(3).default("NSD Business Academy <no-reply@nsdbusinessltd.com>"),
  RESEND_API_KEY: z.string().optional(),
  /** Where enquiry form messages are delivered. */
  ENQUIRY_TO: z.string().email().default("info@nsdbusinessltd.com"),
  /** Automated tests only: lets a production build print emails to the console. Never set this on Vercel. */
  E2E_CONSOLE_EMAIL: z.enum(["true", "false"]).default("false"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}\nSee .env.example.`);
}

const data = parsed.data;

export const env = {
  ...data,
  isProduction,
  /** Development may print emails to the console; production needs Resend and a form secret. */
  formsEnabled:
    !isProduction ||
    (!!data.FORM_SECRET && (data.E2E_CONSOLE_EMAIL === "true" ? data.EMAIL_DRIVER === "console" : data.EMAIL_DRIVER === "resend" && !!data.RESEND_API_KEY)),
  formSecret: data.FORM_SECRET ?? (isProduction ? "" : "development-only-form-secret"),
};
