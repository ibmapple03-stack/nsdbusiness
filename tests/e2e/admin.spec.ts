import { test, expect } from "@playwright/test";
import { stateFile } from "./roles";

const RUN = Date.now().toString(36);
const COURSE_TITLE = `E2E Course ${RUN}`;
const COURSE_SLUG = `e2e-course-${RUN}`;

test.describe.configure({ mode: "serial" });

test.describe("secretary", () => {
  test.use({ storageState: stateFile("secretary") });

  test("cannot open access management or change fees", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page.getByRole("heading", { name: "You do not have access to this page" })).toBeVisible();

    await page.goto("/admin/cohorts");
    await page.getByRole("link", { name: "DEMO-ENT-01" }).click();
    await expect(page.getByRole("heading", { name: "DEMO-ENT-01" })).toBeVisible();
    await expect(page.getByLabel("Propose a fee (₦)")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Approve fee" })).toHaveCount(0);
  });

  test("sees enquiries but not approval queues", async ({ page }) => {
    await page.goto("/admin");
    const nav = page.getByRole("navigation", { name: "Administration" }).first();
    await expect(nav.getByRole("link", { name: /Enquiries/ })).toBeVisible();
    await expect(nav.getByRole("link", { name: /Approvals/ })).toHaveCount(0);
  });
});

test.describe("publication needs a second person", () => {
  test("manager creates and submits a course", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: stateFile("manager") });
    const page = await ctx.newPage();
    await page.goto("/admin/courses/new");
    await page.getByLabel("Course title").fill(COURSE_TITLE);
    await page.getByLabel("Web address").fill(COURSE_SLUG);
    await page.getByLabel("Subject area").selectOption("BUSINESS_SUPPORT");
    await page.getByRole("button", { name: "Create course" }).click();
    await expect(page.getByRole("heading", { name: COURSE_TITLE })).toBeVisible();

    await page.getByRole("button", { name: "Submit for approval" }).click();
    const publication = page.getByRole("region", { name: "Publication" });
    await expect(publication.getByRole("status").filter({ hasText: "Awaiting approval" })).toBeVisible();
    // The manager has no approve button.
    await expect(page.getByRole("button", { name: "Approve" })).toHaveCount(0);
    await ctx.close();
  });

  test("coordinator approves it from the queue; it stays off the website", async ({ browser, request }) => {
    const ctx = await browser.newContext({ storageState: stateFile("coordinator") });
    const page = await ctx.newPage();
    await page.goto("/admin/approvals");
    await page.getByRole("link", { name: COURSE_TITLE }).click();
    await page.getByLabel("Note or reason").fill("Approved in e2e test");
    await page.getByRole("button", { name: "Approve", exact: true }).click();
    await expect(page.getByRole("region", { name: "Publication" }).getByRole("status").filter({ hasText: "Approved, not published" })).toBeVisible();
    await ctx.close();

    // Approved but not published: still not public.
    const body = await (await request.get(`/courses/${COURSE_SLUG}`)).text();
    expect(body).not.toContain(COURSE_TITLE);
  });

  test("the CEO sees the decision in the audit log", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: stateFile("ceo") });
    const page = await ctx.newPage();
    await page.goto("/admin/audit?q=course.approve");
    await expect(page.getByRole("cell", { name: "Approved in e2e test" }).first()).toBeVisible();
    await expect(page.getByRole("cell", { name: /Demo Operations Coordinator/ }).first()).toBeVisible();
    await ctx.close();
  });
});
