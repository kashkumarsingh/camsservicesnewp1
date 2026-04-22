import { test, expect } from "@playwright/test";

const BASE_URL = process.env.AUDIT_BASE_URL ?? "http://localhost:3001";

const routes = [
  "/",
  "/services",
  "/packages",
  "/faq",
  "/contact",
  "/about",
  "/login",
  "/register",
  "/bookings",
  "/checkout",
];

const viewports = [
  { label: "mobile-375", width: 375, height: 812 },
  { label: "mobile-390", width: 390, height: 844 },
  { label: "tablet-768", width: 768, height: 1024 },
  { label: "desktop-1280", width: 1280, height: 800 },
  { label: "desktop-1440", width: 1440, height: 900 },
];

function getElementIssues() {
  const body = document.body;
  if (!body) return [] as string[];

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const candidates = Array.from(
    body.querySelectorAll<HTMLElement>(
      "a, button, input, select, textarea, [role='button'], [data-testid], [aria-label]",
    ),
  );

  const issues: string[] = [];

  for (const el of candidates) {
    const style = window.getComputedStyle(el);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.opacity === "0" ||
      style.pointerEvents === "none"
    ) {
      continue;
    }

    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) continue;

    const offscreenHorizontally = rect.left < -1 || rect.right > viewportWidth + 1;
    const offscreenVertically = rect.bottom < 0 || rect.top > viewportHeight;

    if (offscreenHorizontally && !offscreenVertically) {
      const idPart = el.id ? `#${el.id}` : "";
      const classPart = typeof el.className === "string" && el.className.trim()
        ? `.${el.className.trim().split(/\s+/).slice(0, 2).join(".")}`
        : "";
      const textPart = (el.textContent ?? "").trim().slice(0, 40);
      issues.push(
        `${el.tagName.toLowerCase()}${idPart}${classPart} offscreen x:[${Math.round(rect.left)},${Math.round(rect.right)}] text:"${textPart}"`,
      );

      if (issues.length >= 12) break;
    }
  }

  return issues;
}

for (const viewport of viewports) {
  for (const route of routes) {
    test(`${viewport.label} ${route} responsive sanity`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });

      expect(response?.ok(), `Failed to load route ${route}`).toBeTruthy();

      const metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const scrollWidth = Math.max(doc.scrollWidth, body?.scrollWidth ?? 0);
        const clientWidth = doc.clientWidth;
        return { scrollWidth, clientWidth };
      });

      expect(
        metrics.scrollWidth,
        `Horizontal overflow on ${route} at ${viewport.width}w (scrollWidth ${metrics.scrollWidth} > clientWidth ${metrics.clientWidth})`,
      ).toBeLessThanOrEqual(metrics.clientWidth + 1);

      const issues = await page.evaluate(getElementIssues);
      expect(
        issues,
        `Potential off-screen interactive elements on ${route} at ${viewport.width}w:\n${issues.join("\n")}`,
      ).toEqual([]);

      await expect(page).toHaveScreenshot(
        `responsive-${viewport.label}-${route.replace(/\//g, "_") || "home"}.png`,
        { fullPage: true, animations: "disabled" },
      );
    });
  }
}
