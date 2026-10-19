import { defineConfig, devices } from "@playwright/test";
import { testEnv } from "./tests/test-env";

/**
 * End-to-end tests run against a PRODUCTION build (`next build && next start`)
 * using the separate test database. Production rules apply: draft content is
 * hidden and staff must use two-step sign-in.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } }, dependencies: ["setup"], testIgnore: /auth\.setup\.ts/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, dependencies: ["setup"], testMatch: /public\.spec\.ts/ },
  ],
  webServer: {
    command: "npx tsx tests/prepare-db.mts && npx next build && npx next start -p 3100",
    url: "http://localhost:3100",
    timeout: 300_000,
    // E2E_REUSE=1 skips the rebuild when a test server is already running on :3100.
    reuseExistingServer: !!process.env.E2E_REUSE,
    env: { ...testEnv, NEXT_TELEMETRY_DISABLED: "1" },
    stdout: "ignore",
    stderr: "pipe",
  },
});
