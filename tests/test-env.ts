/**
 * Environment for automated tests. Uses the separate `nsd_test` database and
 * throwaway, non-secret values. Never point tests at a real database.
 */
export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgresql://postgres@localhost:5432/nsd_test";
export const TEST_PASSWORD = "Test-only-password-123!";

export const testEnv: Record<string, string> = {
  DATABASE_URL: TEST_DATABASE_URL,
  BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret-0123456789",
  BETTER_AUTH_URL: "http://localhost:3100",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3100",
  IP_HASH_SALT: "test-salt-0123456789",
  EMAIL_DRIVER: "console",
  EMAIL_FROM: "Test <test@localhost>",
  REQUIRE_STAFF_MFA: "false",
  CONTENT_PREVIEW: "true",
  SEED_DEMO_CATALOGUE: "true",
  SEED_DEMO_PASSWORD: TEST_PASSWORD,
};

if (!/nsd_test|_test\b/.test(TEST_DATABASE_URL)) {
  throw new Error("Refusing to run tests against a database whose name does not end in _test.");
}
