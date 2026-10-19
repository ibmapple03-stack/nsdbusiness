import { execSync } from "node:child_process";
import { testEnv } from "./test-env";

/**
 * Bring the test database up to date without deleting anything:
 * apply pending migrations, then re-run the idempotent seed (which also
 * restores the fictional demo cohorts to known values). Tests create their
 * own records with run-unique names so they can be re-run safely.
 */
export function prepareTestDatabase() {
  const env = { ...process.env, ...testEnv, NODE_ENV: "test" as const };
  execSync("npx prisma migrate deploy", { env, stdio: "pipe" });
  execSync("npx prisma db seed", { env, stdio: "pipe" });
}
