import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = ["/", "/courses", "/courses/entrepreneurship-small-business", "/about", "/admissions", "/corporate-training", "/news", "/news/academy-incorporated", "/contact", "/policies", "/policies/privacy"];

test.describe("public pages", () => {
  for (const path of PAGES) {
    test(`${path} renders without horizontal scroll or serious accessibility issues`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1").first()).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      const serious = axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    });
  }

  test("unpublished content and removed login pages are not reachable", async ({ page, request }) => {
    // With Partial Prefetching, Next.js serves the not-found page (noindex) for
    // slugs it did not prerender; what matters is that no draft content is sent.
    const course = await (await request.get("/courses/business-management")).text();
    expect(course).not.toContain("Core management skills");
    expect(course).toContain('name="robots" content="noindex"');
    for (const path of ["/login", "/admin"]) {
      expect(await (await request.get(path)).text()).toContain('name="robots" content="noindex"');
    }
    // Unpublished people are never named; there are no login links.
    await page.goto("/about");
    await expect(page.getByText("Muktar Buba")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /log ?in|sign in/i })).toHaveCount(0);
  });

  test("course filters work through the URL", async ({ page }) => {
    await page.goto("/courses?status=PROPOSED");
    const rows = page.locator("main ul > li h3");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toHaveText(/Entrepreneurship/);
  });
});

test.describe("keyboard use", () => {
  test("the first Tab reaches the skip link, which moves focus to the content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("the menu opens from the keyboard on small screens", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile menu only");
    await page.goto("/");
    const summary = page.locator("summary", { hasText: "Menu" });
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Courses" })).toBeVisible();
  });
});

test.describe("enquiry form", () => {
  test("shows field errors, then accepts a valid message", async ({ page, isMobile }) => {
    test.skip(isMobile, "run once");
    await page.goto("/contact");
    await page.waitForTimeout(3_200); // the form rejects instant (bot-like) submissions
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Check the highlighted fields.")).toBeVisible();
    await expect(page.getByLabel("Your name")).toHaveAttribute("aria-invalid", "true");

    await page.getByLabel("Your name").fill("Test Visitor");
    await page.getByLabel("Email address").fill("visitor@example.test");
    await page.getByLabel("Your message").fill("When does the next bookkeeping course start?");
    await page.getByLabel(/I agree that NSD Business Academy/).check();
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText(/Your message has been sent to the academy office/)).toBeVisible();
  });
});
