import { defineConfig, devices } from "@playwright/test";
import { testEnv } from "./tests/test-env";

/** End-to-end tests run against a PRODUCTION build (`next build && next start`). */
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
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npx next build && npx next start -p 3100",
    url: "http://localhost:3100",
    timeout: 300_000,
    // E2E_REUSE=1 skips the rebuild when a test server is already running on :3100.
    reuseExistingServer: !!process.env.E2E_REUSE,
    env: { ...testEnv, NEXT_TELEMETRY_DISABLED: "1" },
    stdout: "ignore",
    stderr: "pipe",
  },
});
