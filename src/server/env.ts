import "server-only";
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

const schema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  IP_HASH_SALT: z.string().min(16),
  EMAIL_DRIVER: z.enum(["console", "resend"]).default("console"),
  EMAIL_FROM: z.string().min(3),
  RESEND_API_KEY: z.string().optional(),
  REQUIRE_STAFF_MFA: z.enum(["true", "false"]).default("true"),
  CONTENT_PREVIEW: z.enum(["true", "false"]).default("false"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}\nSee .env.example.`);
}

export const env = {
  ...parsed.data,
  isProduction,
  // MFA for staff and draft previews can only be relaxed outside production.
  requireStaffMfa: isProduction || parsed.data.REQUIRE_STAFF_MFA === "true",
  contentPreview: !isProduction && parsed.data.CONTENT_PREVIEW === "true",
};
