# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: scripts/responsive-audit.spec.ts >> mobile-375 /contact responsive sanity
- Location: scripts/responsive-audit.spec.ts:76:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 5000ms
  Timeout 5000ms exceeded.

  Snapshot: responsive-mobile-375-_contact.png

Call log:
  - Expect "toHaveScreenshot(responsive-mobile-375-_contact.png)" with timeout 5000ms
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
        - generic [ref=e20]:
          - heading "Contact CAMS" [level=1] [ref=e21]
          - generic [ref=e22]: Tell us what is happening and where support is needed. We route each enquiry to the right next step quickly and clearly.
        - generic [ref=e23]:
          - generic [ref=e24]:
            - paragraph [ref=e25]: Who should contact us
            - heading "Built for real-world decisions" [level=2] [ref=e26]
            - paragraph [ref=e27]: Whether you are making a first enquiry or arranging targeted support, this page helps you choose the right route without delays.
          - generic [ref=e28]:
            - article [ref=e29]:
              - img [ref=e31]
              - heading "Parents and carers" [level=3] [ref=e36]
              - paragraph [ref=e37]: Discuss behaviour, engagement, routine, confidence, or SEN support needs.
            - article [ref=e38]:
              - img [ref=e40]
              - heading "Schools and settings" [level=3] [ref=e43]
              - paragraph [ref=e44]: Coordinate referrals, safeguarding context, and delivery planning with your team.
            - article [ref=e45]:
              - img [ref=e47]
              - heading "Partner professionals" [level=3] [ref=e49]
              - paragraph [ref=e50]: Align around intervention goals, timescales, and practical outcomes.
        - generic [ref=e51]:
          - generic [ref=e52]:
            - paragraph [ref=e53]: Enquiry
            - heading "Start with a smarter intake" [level=2] [ref=e54]
            - paragraph [ref=e55]: Share the essentials once, and we will route your enquiry to the right person with the right response type.
            - generic [ref=e56]:
              - generic [ref=e57]:
                - generic [ref=e58]:
                  - generic [ref=e59]: Full name *
                  - textbox "Full name *" [ref=e60]:
                    - /placeholder: Your full name
                - generic [ref=e61]:
                  - generic [ref=e62]: School, college, or service (optional)
                  - textbox "School, college, or service (optional)" [ref=e63]:
                    - /placeholder: Leave blank if you are a parent or carer
              - generic [ref=e64]:
                - generic [ref=e65]:
                  - generic [ref=e66]: Email address *
                  - textbox "Email address *" [ref=e67]:
                    - /placeholder: you@example.com
                - generic [ref=e68]:
                  - generic [ref=e69]: Phone number
                  - textbox "Phone number" [ref=e70]:
                    - /placeholder: Optional - for call back
              - generic [ref=e71]:
                - generic [ref=e72]:
                  - generic [ref=e73]: Enquiry type *
                  - combobox "Enquiry type *" [ref=e74]:
                    - option "Select an option" [selected]
                    - option "General support enquiry"
                    - option "New referral discussion"
                    - option "Package and pricing guidance"
                    - option "Partnership or commissioning enquiry"
                    - option "Other"
                - generic [ref=e75]:
                  - generic [ref=e76]: Preferred contact method
                  - combobox "Preferred contact method" [ref=e77]:
                    - option "No preference" [selected]
                    - option "Email"
                    - option "Phone call"
                    - option "Either"
              - generic [ref=e78]:
                - generic [ref=e79]: Preferred start timeline
                - combobox "Preferred start timeline" [ref=e80]:
                  - option "Select timeline (optional)" [selected]
                  - option "As soon as possible"
                  - option "Within this month"
                  - option "Next school term"
                  - option "Planning ahead"
              - generic [ref=e81]:
                - generic [ref=e82]: Any urgent safety concerns?
                - combobox "Any urgent safety concerns?" [ref=e83]:
                  - option "Prefer not to say" [selected]
                  - option "No immediate concerns"
                  - option "Yes - there are some concerns"
                  - option "Yes - urgent concerns"
                - paragraph [ref=e84]: This helps us prioritise your enquiry. You can share details later by phone.
              - generic [ref=e85]:
                - generic [ref=e86]: How can we help? *
                - textbox "How can we help? *" [ref=e87]:
                  - /placeholder: "A short note is enough (2-3 lines). Example: 'My son is struggling in school and needs mentoring support.'"
                - paragraph [ref=e88]: No need to write full background at this stage.
              - button "Submit Enquiry" [ref=e89]
          - generic [ref=e90]:
            - generic [ref=e91]:
              - article [ref=e92]:
                - img [ref=e94]
                - heading "Location" [level=3] [ref=e97]
                - paragraph [ref=e98]: CAMS Services Ltd, London, United Kingdom
                - paragraph [ref=e99]: Delivery across London and surrounding areas by arrangement.
              - article [ref=e100]:
                - img [ref=e102]
                - heading "Call Back Request" [level=3] [ref=e104]
                - paragraph [ref=e105]: Request a call and we reply within one working day.
                - paragraph [ref=e106]: "Phone support hours: Monday to Friday, 9:00 to 18:00."
              - article [ref=e107]:
                - img [ref=e109]
                - heading "Email" [level=3] [ref=e112]
                - paragraph [ref=e113]: hello@camsservices.co.uk
                - paragraph [ref=e114]: Most enquiries are answered within 24 hours.
              - article [ref=e115]:
                - img [ref=e117]
                - heading "Response Commitment" [level=3] [ref=e120]
                - paragraph [ref=e121]: Same-day acknowledgement during working hours.
                - paragraph [ref=e122]: Clear next-step message with owner and expected timeline.
            - generic [ref=e123]:
              - heading "Need a faster route?" [level=3] [ref=e124]
              - paragraph [ref=e125]: For immediate pathway decisions, these pages usually answer the next question fastest.
              - generic [ref=e126]:
                - link "View referral process" [ref=e127]:
                  - /url: /referral
                - link "Compare support packages" [ref=e128]:
                  - /url: /packages
                - link "Explore service pathways" [ref=e129]:
                  - /url: /services
        - generic [ref=e130]:
          - paragraph [ref=e131]: What happens next
          - heading "Contact to action plan" [level=2] [ref=e132]
          - generic [ref=e133]:
            - article [ref=e134]:
              - img [ref=e136]
              - heading "1. Initial triage" [level=3] [ref=e138]
              - paragraph [ref=e139]: "We review your enquiry and identify the best pathway: contact advice, referral, or package guidance."
            - article [ref=e140]:
              - img [ref=e142]
              - heading "2. Clarification call" [level=3] [ref=e146]
              - paragraph [ref=e147]: If needed, we schedule a focused call to understand context, goals, and practical constraints.
            - article [ref=e148]:
              - img [ref=e150]
              - heading "3. Recommended next step" [level=3] [ref=e153]
              - paragraph [ref=e154]: You receive a clear recommendation with timeline, expected outcomes, and route to start.
        - generic [ref=e155]:
          - paragraph [ref=e156]: Location
          - heading "Find Us" [level=2] [ref=e157]
          - paragraph [ref=e158]: Map shows London centre as a placeholder until your final venue is published.
          - iframe [ref=e160]:
            - link "Open in Maps (opens in new tab)" [ref=f2e4] [cursor=pointer]:
              - /url: about:invalid#zClosurez
              - text: Open in Maps
              - img [ref=f2e6]
        - region "Quick Answers" [ref=e161]:
          - paragraph [ref=e162]: Common questions
          - heading "Quick Answers" [level=2] [ref=e163]
          - paragraph [ref=e164]: "Shortcuts to the most common next steps: referrals, service fit, and careers."
          - generic [ref=e165]:
            - article [ref=e166]:
              - img [ref=e169]
              - heading "How do I make a referral?" [level=3] [ref=e172]
              - link "View referral process" [ref=e173]:
                - /url: /referral
                - text: View referral process
                - generic [ref=e174]: →
            - article [ref=e175]:
              - img [ref=e178]
              - heading "Which service is right for us?" [level=3] [ref=e180]
              - link "Explore services" [ref=e181]:
                - /url: /services
                - text: Explore services
                - generic [ref=e182]: →
            - article [ref=e183]:
              - img [ref=e186]
              - heading "Are you hiring?" [level=3] [ref=e189]
              - link "View careers" [ref=e190]:
                - /url: /careers
                - text: View careers
                - generic [ref=e191]: →
        - generic [ref=e196]:
          - generic [ref=e197]:
            - paragraph [ref=e198]: Take the next step
            - heading "Want us to review your situation first?" [level=2] [ref=e199]
          - generic [ref=e200]:
            - paragraph [ref=e201]: Share context through a referral and we will recommend the right package and pathway.
            - generic [ref=e202]:
              - link "Make a Referral" [ref=e203]:
                - /url: /referral
              - link "View Packages" [ref=e204]:
                - /url: /packages
      - generic "Programme photography strip" [ref=e205]:
        - generic [ref=e207]:
          - figure [ref=e208]:
            - img "Young person taking part in outdoor sports support" [ref=e209]
          - figure [ref=e210]:
            - img "One-to-one fitness and wellbeing session" [ref=e211]
          - figure [ref=e212]:
            - img "Supported community access and travel" [ref=e213]
          - figure [ref=e214]:
            - img "Behavioural management and goal-setting support" [ref=e215]
          - figure [ref=e216]:
            - img "Mentoring and coaching conversation" [ref=e217]
          - figure [ref=e218]:
            - img "Family support and relationship-building session" [ref=e219]
          - figure [ref=e220]:
            - img "SEN and education support activity" [ref=e221]
          - figure [ref=e222]:
            - img "Young person taking part in outdoor sports support" [ref=e223]
          - figure [ref=e224]:
            - img "One-to-one fitness and wellbeing session" [ref=e225]
          - figure [ref=e226]:
            - img "Supported community access and travel" [ref=e227]
          - figure [ref=e228]:
            - img "Behavioural management and goal-setting support" [ref=e229]
          - figure [ref=e230]:
            - img "Mentoring and coaching conversation" [ref=e231]
          - figure [ref=e232]:
            - img "Family support and relationship-building session" [ref=e233]
          - figure [ref=e234]:
            - img "SEN and education support activity" [ref=e235]
      - generic [ref=e237]:
        - generic [ref=e238]:
          - generic [ref=e239]:
            - link "CAMS Services" [ref=e240]:
              - /url: /
              - img "CAMS Services" [ref=e241]
            - paragraph [ref=e242]: Structured mentoring and intervention for young people across the UK, safeguarding-led, relationship-first, and built for real-world progress.
          - generic [ref=e243]:
            - generic [ref=e244]:
              - heading "Quick links" [level=4] [ref=e245]
              - list [ref=e246]:
                - listitem [ref=e247]:
                  - link "About Us" [ref=e248]:
                    - /url: /about
                - listitem [ref=e249]:
                  - link "Our Services" [ref=e250]:
                    - /url: /services
                - listitem [ref=e251]:
                  - link "Packages" [ref=e252]:
                    - /url: /packages
                - listitem [ref=e253]:
                  - link "Our Team" [ref=e254]:
                    - /url: /trainers
                - listitem [ref=e255]:
                  - link "Blog & Resources" [ref=e256]:
                    - /url: /blog
                - listitem [ref=e257]:
                  - link "FAQs" [ref=e258]:
                    - /url: /faq
            - generic [ref=e259]:
              - heading "Families" [level=4] [ref=e260]
              - list [ref=e261]:
                - listitem [ref=e262]:
                  - link "Parent sign in" [ref=e263]:
                    - /url: /login
                - listitem [ref=e264]:
                  - link "Parent sign up" [ref=e265]:
                    - /url: /register
                - listitem [ref=e266]:
                  - link "Make a referral" [ref=e267]:
                    - /url: /contact
                - listitem [ref=e268]:
                  - link "Contact" [ref=e269]:
                    - /url: /contact
            - generic [ref=e270]:
              - heading "Partners" [level=4] [ref=e271]
              - list [ref=e272]:
                - listitem [ref=e273]:
                  - link "Trainer sign in" [ref=e274]:
                    - /url: /login
                - listitem [ref=e275]:
                  - link "School partnerships" [ref=e276]:
                    - /url: /contact
                - listitem [ref=e277]:
                  - link "Intervention packages" [ref=e278]:
                    - /url: /packages
                - listitem [ref=e279]:
                  - link "About CAMS" [ref=e280]:
                    - /url: /about
            - generic [ref=e281]:
              - heading "Organisation" [level=4] [ref=e282]
              - list [ref=e283]:
                - listitem [ref=e284]:
                  - link "Become a trainer" [ref=e285]:
                    - /url: /become-a-trainer
                - listitem [ref=e286]:
                  - link "Policies" [ref=e287]:
                    - /url: /policies
                - listitem [ref=e288]:
                  - link "FAQs" [ref=e289]:
                    - /url: /faq
                - listitem [ref=e290]:
                  - link "Contact" [ref=e291]:
                    - /url: /contact
        - generic [ref=e292]:
          - paragraph [ref=e293]: © 2026 CAMS Services Ltd. All rights reserved.
          - navigation "Legal" [ref=e294]:
            - link "Policies" [ref=e295]:
              - /url: /policies
            - link "FAQ" [ref=e296]:
              - /url: /faq
            - link "Contact" [ref=e297]:
              - /url: /contact
      - generic [ref=e299]:
        - generic:
          - link "Contact us":
            - /url: /contact
            - img
            - generic: Contact us
          - link "Book call":
            - /url: /contact
            - img
            - generic: Book call
        - button "Open quick actions" [ref=e300]:
          - img [ref=e301]
      - generic [ref=e304]:
        - generic [ref=e305]:
          - heading "Cookies and your privacy" [level=2] [ref=e306]
          - paragraph [ref=e307]:
            - text: We use essential cookies so the site works. With your permission we may also use optional cookies for preferences, usage statistics, or relevant updates. Read our
            - link "policies" [ref=e308]:
              - /url: /policies
            - text: for details.
        - generic [ref=e309]:
          - button "Accept all" [ref=e310]
          - button "Essential only" [ref=e311]
          - button "Manage preferences" [ref=e312]
  - generic [ref=e317] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e318]:
      - img [ref=e319]
    - generic [ref=e322]:
      - button "Open issues overlay" [ref=e323]:
        - generic [ref=e324]:
          - generic [ref=e325]: "1"
          - generic [ref=e326]: "2"
        - generic [ref=e327]:
          - text: Issue
          - generic [ref=e328]: s
      - button "Collapse issues badge" [ref=e329]:
        - img [ref=e330]
  - alert [ref=e332]
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