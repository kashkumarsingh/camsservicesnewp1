# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: scripts/responsive-audit.spec.ts >> mobile-390 /faq responsive sanity
- Location: scripts/responsive-audit.spec.ts:76:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 5000ms
  Failed to take two consecutive stable screenshots.

  Snapshot: responsive-mobile-390-_faq.png

Call log:
  - Expect "toHaveScreenshot(responsive-mobile-390-_faq.png)" with timeout 5000ms
    - generating new stable screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 1375 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 250ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 3208 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 500ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 2852 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 1000ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Timeout 5000ms exceeded.

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - navigation [ref=e3]:
      - link "CAMS Services" [ref=e4]:
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
    - generic [ref=e13]:
      - generic [ref=e14]:
        - generic [ref=e19]:
          - heading "Frequently Asked Questions" [level=1] [ref=e20]
          - paragraph [ref=e21]: Find answers to common questions about CAMS Services, our packages, and support.
          - generic [ref=e22]:
            - link "Still Have Questions?" [ref=e23]:
              - /url: /contact
              - text: Still Have Questions?
              - img [ref=e25]
            - link "Explore Our Services" [ref=e27]:
              - /url: /services
              - text: Explore Our Services
              - img [ref=e29]
        - paragraph [ref=e36]: No FAQs found
        - generic [ref=e38]:
          - heading "Didn't Find What You're Looking For?" [level=2] [ref=e39]
          - paragraph [ref=e40]: Our team is here to help! Contact us and we'll answer any questions you have.
          - generic [ref=e41]:
            - link "Contact Us Today" [ref=e42]:
              - /url: /contact
              - text: Contact Us Today
              - img [ref=e44]
            - link "View Our Packages" [ref=e46]:
              - /url: /packages
              - text: View Our Packages
              - img [ref=e48]
          - generic [ref=e50]:
            - generic [ref=e51]: No obligation
            - generic [ref=e52]: Tailored support
            - generic [ref=e53]: 500+ families
      - generic "Programme photography strip" [ref=e54]:
        - generic [ref=e56]:
          - figure [ref=e57]:
            - img "Young person taking part in outdoor sports support" [ref=e58]
          - figure [ref=e59]:
            - img "One-to-one fitness and wellbeing session" [ref=e60]
          - figure [ref=e61]:
            - img "Supported community access and travel" [ref=e62]
          - figure [ref=e63]:
            - img "Behavioural management and goal-setting support" [ref=e64]
          - figure [ref=e65]:
            - img "Mentoring and coaching conversation" [ref=e66]
          - figure [ref=e67]:
            - img "Family support and relationship-building session" [ref=e68]
          - figure [ref=e69]:
            - img "SEN and education support activity" [ref=e70]
          - figure [ref=e71]:
            - img "Young person taking part in outdoor sports support" [ref=e72]
          - figure [ref=e73]:
            - img "One-to-one fitness and wellbeing session" [ref=e74]
          - figure [ref=e75]:
            - img "Supported community access and travel" [ref=e76]
          - figure [ref=e77]:
            - img "Behavioural management and goal-setting support" [ref=e78]
          - figure [ref=e79]:
            - img "Mentoring and coaching conversation" [ref=e80]
          - figure [ref=e81]:
            - img "Family support and relationship-building session" [ref=e82]
          - figure [ref=e83]:
            - img "SEN and education support activity" [ref=e84]
      - generic [ref=e86]:
        - generic [ref=e87]:
          - generic [ref=e88]:
            - link "CAMS Services" [ref=e89]:
              - /url: /
              - img "CAMS Services" [ref=e90]
            - paragraph [ref=e91]: Structured mentoring and intervention for young people across the UK, safeguarding-led, relationship-first, and built for real-world progress.
          - generic [ref=e92]:
            - generic [ref=e93]:
              - heading "Quick links" [level=4] [ref=e94]
              - list [ref=e95]:
                - listitem [ref=e96]:
                  - link "About Us" [ref=e97]:
                    - /url: /about
                - listitem [ref=e98]:
                  - link "Our Services" [ref=e99]:
                    - /url: /services
                - listitem [ref=e100]:
                  - link "Packages" [ref=e101]:
                    - /url: /packages
                - listitem [ref=e102]:
                  - link "Our Team" [ref=e103]:
                    - /url: /trainers
                - listitem [ref=e104]:
                  - link "Blog & Resources" [ref=e105]:
                    - /url: /blog
                - listitem [ref=e106]:
                  - link "FAQs" [ref=e107]:
                    - /url: /faq
            - generic [ref=e108]:
              - heading "Families" [level=4] [ref=e109]
              - list [ref=e110]:
                - listitem [ref=e111]:
                  - link "Parent sign in" [ref=e112]:
                    - /url: /login
                - listitem [ref=e113]:
                  - link "Parent sign up" [ref=e114]:
                    - /url: /register
                - listitem [ref=e115]:
                  - link "Make a referral" [ref=e116]:
                    - /url: /contact
                - listitem [ref=e117]:
                  - link "Contact" [ref=e118]:
                    - /url: /contact
            - generic [ref=e119]:
              - heading "Partners" [level=4] [ref=e120]
              - list [ref=e121]:
                - listitem [ref=e122]:
                  - link "Trainer sign in" [ref=e123]:
                    - /url: /login
                - listitem [ref=e124]:
                  - link "School partnerships" [ref=e125]:
                    - /url: /contact
                - listitem [ref=e126]:
                  - link "Intervention packages" [ref=e127]:
                    - /url: /packages
                - listitem [ref=e128]:
                  - link "About CAMS" [ref=e129]:
                    - /url: /about
            - generic [ref=e130]:
              - heading "Organisation" [level=4] [ref=e131]
              - list [ref=e132]:
                - listitem [ref=e133]:
                  - link "Become a trainer" [ref=e134]:
                    - /url: /become-a-trainer
                - listitem [ref=e135]:
                  - link "Policies" [ref=e136]:
                    - /url: /policies
                - listitem [ref=e137]:
                  - link "FAQs" [ref=e138]:
                    - /url: /faq
                - listitem [ref=e139]:
                  - link "Contact" [ref=e140]:
                    - /url: /contact
        - generic [ref=e141]:
          - paragraph [ref=e142]: © 2026 CAMS Services Ltd. All rights reserved.
          - navigation "Legal" [ref=e143]:
            - link "Policies" [ref=e144]:
              - /url: /policies
            - link "FAQ" [ref=e145]:
              - /url: /faq
            - link "Contact" [ref=e146]:
              - /url: /contact
      - generic [ref=e148]:
        - generic:
          - link "Contact us":
            - /url: /contact
            - img
            - generic: Contact us
          - link "Book call":
            - /url: /contact
            - img
            - generic: Book call
        - button "Open quick actions" [ref=e149]:
          - img [ref=e150]
      - generic [ref=e153]:
        - generic [ref=e154]:
          - heading "Cookies and your privacy" [level=2] [ref=e155]
          - paragraph [ref=e156]:
            - text: We use essential cookies so the site works. With your permission we may also use optional cookies for preferences, usage statistics, or relevant updates. Read our
            - link "policies" [ref=e157]:
              - /url: /policies
            - text: for details.
        - generic [ref=e158]:
          - button "Accept all" [ref=e159]
          - button "Essential only" [ref=e160]
          - button "Manage preferences" [ref=e161]
  - button "Open Next.js Dev Tools" [ref=e167] [cursor=pointer]:
    - img [ref=e168]
  - alert [ref=e171]
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
      |                          ^ Error: expect(page).toHaveScreenshot(expected) failed
  102 |         `responsive-${viewport.label}-${route.replace(/\//g, "_") || "home"}.png`,
  103 |         { fullPage: true, animations: "disabled" },
  104 |       );
  105 |     });
  106 |   }
  107 | }
  108 | 
```