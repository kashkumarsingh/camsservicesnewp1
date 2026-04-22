# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: scripts/responsive-audit.spec.ts >> mobile-390 /bookings responsive sanity
- Location: scripts/responsive-audit.spec.ts:76:9

# Error details

```
Error: A snapshot doesn't exist at /home/buildco/camsservicesnewp1/frontend/scripts/responsive-audit.spec.ts-snapshots/responsive-mobile-390--bookings-linux.png, writing actual.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - navigation [ref=e3]:
      - link "CAMS Services" [ref=e4] [cursor=pointer]:
        - /url: /
        - img "CAMS Services" [ref=e5]
      - generic [ref=e6]:
        - button "Open navigation menu" [ref=e7]
        - button "Close mobile menu backdrop"
        - generic:
          - list:
            - listitem:
              - link "Home":
                - /url: /
            - listitem:
              - link "About":
                - /url: /about
            - listitem:
              - generic:
                - link "Services":
                  - /url: /services
                - button "Services submenu": +
            - listitem:
              - link "Packages":
                - /url: /packages
            - listitem:
              - link "Become a Trainer":
                - /url: /become-a-trainer
            - listitem:
              - link "Blog":
                - /url: /blog
            - listitem:
              - link "Contact":
                - /url: /contact
  - main [ref=e12]:
    - generic [ref=e15]:
      - img [ref=e18]
      - heading "Payment Status Unknown" [level=1] [ref=e22]
      - paragraph [ref=e23]: Unable to determine payment status. Please check your dashboard for booking details.
      - generic [ref=e24]:
        - link "Go to Dashboard" [ref=e25] [cursor=pointer]:
          - /url: /dashboard/parent
          - button "Go to Dashboard" [ref=e26]:
            - img [ref=e27]
            - text: Go to Dashboard
            - generic [ref=e30]: →
        - link "Book a Package" [ref=e31] [cursor=pointer]:
          - /url: /packages
          - button "Book a Package" [ref=e32]:
            - img [ref=e33]
            - text: Book a Package
  - button "Open Next.js Dev Tools" [ref=e42] [cursor=pointer]:
    - img [ref=e43]
  - alert [ref=e46]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | const BASE_URL = process.env.AUDIT_BASE_URL ?? "http://localhost:3001";
  4   | 
  5   | const routes = [
  6   |   "/",
  7   |   "/services",
  8   |   "/packages",
  9   |   "/faq",
  10  |   "/contact",
  11  |   "/about",
  12  |   "/login",
  13  |   "/register",
  14  |   "/bookings",
  15  |   "/checkout",
  16  | ];
  17  | 
  18  | const viewports = [
  19  |   { label: "mobile-375", width: 375, height: 812 },
  20  |   { label: "mobile-390", width: 390, height: 844 },
  21  |   { label: "tablet-768", width: 768, height: 1024 },
  22  |   { label: "desktop-1280", width: 1280, height: 800 },
  23  |   { label: "desktop-1440", width: 1440, height: 900 },
  24  | ];
  25  | 
  26  | function getElementIssues() {
  27  |   const body = document.body;
  28  |   if (!body) return [] as string[];
  29  | 
  30  |   const viewportWidth = window.innerWidth;
  31  |   const viewportHeight = window.innerHeight;
  32  |   const candidates = Array.from(
  33  |     body.querySelectorAll<HTMLElement>(
  34  |       "a, button, input, select, textarea, [role='button'], [data-testid], [aria-label]",
  35  |     ),
  36  |   );
  37  | 
  38  |   const issues: string[] = [];
  39  | 
  40  |   for (const el of candidates) {
  41  |     const style = window.getComputedStyle(el);
  42  |     if (
  43  |       style.display === "none" ||
  44  |       style.visibility === "hidden" ||
  45  |       style.opacity === "0" ||
  46  |       style.pointerEvents === "none"
  47  |     ) {
  48  |       continue;
  49  |     }
  50  | 
  51  |     const rect = el.getBoundingClientRect();
  52  |     if (rect.width < 1 || rect.height < 1) continue;
  53  | 
  54  |     const offscreenHorizontally = rect.left < -1 || rect.right > viewportWidth + 1;
  55  |     const offscreenVertically = rect.bottom < 0 || rect.top > viewportHeight;
  56  | 
  57  |     if (offscreenHorizontally && !offscreenVertically) {
  58  |       const idPart = el.id ? `#${el.id}` : "";
  59  |       const classPart = typeof el.className === "string" && el.className.trim()
  60  |         ? `.${el.className.trim().split(/\s+/).slice(0, 2).join(".")}`
  61  |         : "";
  62  |       const textPart = (el.textContent ?? "").trim().slice(0, 40);
  63  |       issues.push(
  64  |         `${el.tagName.toLowerCase()}${idPart}${classPart} offscreen x:[${Math.round(rect.left)},${Math.round(rect.right)}] text:"${textPart}"`,
  65  |       );
  66  | 
  67  |       if (issues.length >= 12) break;
  68  |     }
  69  |   }
  70  | 
  71  |   return issues;
  72  | }
  73  | 
  74  | for (const viewport of viewports) {
  75  |   for (const route of routes) {
  76  |     test(`${viewport.label} ${route} responsive sanity`, async ({ page }) => {
  77  |       await page.setViewportSize({ width: viewport.width, height: viewport.height });
  78  |       const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
  79  | 
  80  |       expect(response?.ok(), `Failed to load route ${route}`).toBeTruthy();
  81  | 
  82  |       const metrics = await page.evaluate(() => {
  83  |         const doc = document.documentElement;
  84  |         const body = document.body;
  85  |         const scrollWidth = Math.max(doc.scrollWidth, body?.scrollWidth ?? 0);
  86  |         const clientWidth = doc.clientWidth;
  87  |         return { scrollWidth, clientWidth };
  88  |       });
  89  | 
  90  |       expect(
  91  |         metrics.scrollWidth,
  92  |         `Horizontal overflow on ${route} at ${viewport.width}w (scrollWidth ${metrics.scrollWidth} > clientWidth ${metrics.clientWidth})`,
  93  |       ).toBeLessThanOrEqual(metrics.clientWidth + 1);
  94  | 
  95  |       const issues = await page.evaluate(getElementIssues);
  96  |       expect(
  97  |         issues,
  98  |         `Potential off-screen interactive elements on ${route} at ${viewport.width}w:\n${issues.join("\n")}`,
  99  |       ).toEqual([]);
  100 | 
> 101 |       await expect(page).toHaveScreenshot(
      |       ^ Error: A snapshot doesn't exist at /home/buildco/camsservicesnewp1/frontend/scripts/responsive-audit.spec.ts-snapshots/responsive-mobile-390--bookings-linux.png, writing actual.
  102 |         `responsive-${viewport.label}-${route.replace(/\//g, "_") || "home"}.png`,
  103 |         { fullPage: true, animations: "disabled" },
  104 |       );
  105 |     });
  106 |   }
  107 | }
  108 | 
```