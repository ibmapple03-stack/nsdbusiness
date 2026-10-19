// Usage: node scripts/screenshot.mjs <url> [label] [WIDTHxHEIGHT] [--full]
// Saves to ./temporary_screenshots/screenshot-N[-label].png (never overwrites).
import { chromium } from "@playwright/test";
import { mkdir, readdir } from "node:fs/promises";

const [url = "http://localhost:3000", label = "", size = "1440x900", flag] = process.argv.slice(2);
const [width, height] = size.split("x").map(Number);
const dir = "temporary_screenshots";
await mkdir(dir, { recursive: true });
const n = (await readdir(dir)).filter((f) => f.startsWith("screenshot-")).length + 1;
const file = `${dir}/screenshot-${n}${label ? `-${label}` : ""}.png`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce" });
await page.goto(url, { waitUntil: "networkidle" });
// Scroll through so lazy-loaded images render, then return to the top.
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
  window.scrollTo(0, 0);
});
await page.waitForLoadState("networkidle");
await page.screenshot({ path: file, fullPage: flag !== "--viewport" });
await browser.close();
console.log(file);
