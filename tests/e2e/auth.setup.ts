import { test as setup, expect, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { TEST_PASSWORD } from "../test-env";
import { totp } from "./totp";
import { ROLES, stateFile } from "./roles";

/**
 * Signs in each fictional demo role once, completing the mandatory
 * authenticator enrolment, and saves the browser state for the other tests.
 */

async function enrolAndSignIn(page: Page, role: string) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(`${role}.demo@example.test`);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  // Staff without an authenticator are sent to set one up before anything else.
  await expect(page).toHaveURL(/\/account\/security\?setup=required/);
  await page.getByLabel("Confirm your password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Continue" }).click();
  // Better Auth allows 3 two-factor requests per 10 s per client; wait out the window if hit.
  const manualKey = page.getByText("Can’t scan? Enter the key manually");
  const limited = page.getByText(/Too many attempts/);
  await expect(manualKey.or(limited)).toBeVisible();
  if (await limited.isVisible()) {
    await page.waitForTimeout(11_000);
    await page.getByRole("button", { name: "Continue" }).click();
  }
  await page.getByText("Can’t scan? Enter the key manually").click();
  const secret = (await page.locator("p.font-mono").first().textContent())!.trim();
  await page.getByLabel("6-digit code").fill(totp(secret));
  await page.getByRole("button", { name: "Turn on two-step sign-in" }).click();
  const saved = page.getByRole("heading", { name: "Save your backup codes" });
  await expect(saved.or(limited)).toBeVisible();
  if (await limited.isVisible()) {
    await page.waitForTimeout(11_000);
    await page.getByLabel("6-digit code").fill(totp(secret));
    await page.getByRole("button", { name: "Turn on two-step sign-in" }).click();
  }
  await expect(page.getByRole("heading", { name: "Save your backup codes" })).toBeVisible();
  await page.getByRole("button", { name: /I have saved my codes/ }).click();
  await expect(page.getByRole("heading", { name: /Welcome/ })).toBeVisible();
}

for (const role of ROLES) {
  setup(`sign in as ${role}`, async ({ page }) => {
    setup.setTimeout(90_000);
    await enrolAndSignIn(page, role);
    mkdirSync("test-results/.auth", { recursive: true });
    writeFileSync(stateFile(role), JSON.stringify(await page.context().storageState()));
  });
}
