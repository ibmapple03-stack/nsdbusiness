/** Environment for automated tests: throwaway, non-secret values. */
export const testEnv: Record<string, string> = {
  NEXT_PUBLIC_SITE_URL: "http://localhost:3100",
  FORM_SECRET: "test-form-secret-0123456789abcdef",
  EMAIL_DRIVER: "formsubmit",
  EMAIL_FROM: "Test <test@localhost>",
  ENQUIRY_TO: "office@example.test",
};
