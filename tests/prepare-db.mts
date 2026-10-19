/**
 * Prepares the TEST database for end-to-end runs: migrations + seed, then
 * resets per-run fixtures (demo accounts' authenticator enrolment and rate
 * limit counters) so every run starts from the same state. Touches only the
 * _test database named in tests/test-env.ts.
 */
import { Client } from "pg";
import { prepareTestDatabase } from "./reset-db";
import { TEST_DATABASE_URL } from "./test-env";

prepareTestDatabase();

const client = new Client({ connectionString: TEST_DATABASE_URL });
await client.connect();
await client.query(`DELETE FROM "twoFactor" WHERE "userId" IN (SELECT id FROM "user" WHERE email LIKE '%.demo@example.test')`);
await client.query(`UPDATE "user" SET "twoFactorEnabled" = false WHERE email LIKE '%.demo@example.test'`);
await client.query(`DELETE FROM "session" WHERE "userId" IN (SELECT id FROM "user" WHERE email LIKE '%.demo@example.test')`);
await client.query(`DELETE FROM "rateLimit"`);
await client.query(`DELETE FROM "RateLimitBucket"`);
await client.end();
console.log("Test database ready.");
