import { test, expect } from '@playwright/test';

const PUBLIC_PATHS = ['/', '/packages', '/login', '/contact'] as const;

const VIEWPORTS = [
  { label: 'iphone-14', width: 390, height: 844 },
  { label: 'ipad-portrait', width: 768, height: 1024 },
  { label: 'ipad-landscape-mac-split', width: 1024, height: 768 },
  { label: 'macbook-air-13', width: 1280, height: 800 },
] as const;

async function dismissCookieBanner(page: import('@playwright/test').Page): Promise<void> {
  const accept = page.getByRole('button', { name: 'Accept all' });
  if (await accept.isVisible({ timeout: 2000 }).catch(() => false)) {
    await accept.click();
  }
}

for (const viewport of VIEWPORTS) {
  for (const path of PUBLIC_PATHS) {
    test(`no horizontal overflow — ${viewport.label} — ${path}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await dismissCookieBanner(page);

      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(
        metrics.scrollWidth,
        `scrollWidth ${metrics.scrollWidth} > clientWidth ${metrics.clientWidth}`
      ).toBeLessThanOrEqual(metrics.clientWidth + 1);
    });
  }
}
