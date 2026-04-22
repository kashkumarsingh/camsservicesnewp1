# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: scripts/responsive-audit.spec.ts >> mobile-390 / responsive sanity
- Location: scripts/responsive-audit.spec.ts:76:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 5000ms
  Timeout 5000ms exceeded.

  Snapshot: responsive-mobile-390-_.png

Call log:
  - Expect "toHaveScreenshot(responsive-mobile-390-_.png)" with timeout 5000ms
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
          - paragraph [ref=e21]: Connect first · Then support change
          - heading "1-2-1 Mentoring and intervention that young people feel" [level=1] [ref=e22]
          - paragraph [ref=e23]: We combine safeguarding discipline with relationship-led mentoring for 7 to 21 year olds, so everyone understands what happens first, how progress is reviewed, and what support looks like week to week across schools, homes and community settings.
          - generic [ref=e24]:
            - link "Make a referral" [ref=e25]:
              - /url: /referral
            - link "Book a free call" [ref=e26]:
              - /url: /contact
          - generic [ref=e27]:
            - generic [ref=e28]:
              - term [ref=e29]: Families supported
              - definition [ref=e30]: 500+
              - paragraph [ref=e31]: Families supported
            - generic [ref=e32]:
              - term [ref=e33]: DBS checked
              - definition [ref=e34]: 100%
              - paragraph [ref=e35]: DBS checked
            - generic [ref=e36]:
              - term [ref=e37]: Satisfaction
              - definition [ref=e38]: 98%
              - paragraph [ref=e39]: Satisfaction
            - generic [ref=e40]:
              - term [ref=e41]: Years delivering
              - definition [ref=e42]: 10+
              - paragraph [ref=e43]: Years delivering
          - paragraph [ref=e44]: Illustrative highlights across CAMS delivery, outcomes vary by context and tier of support.
        - generic [ref=e52]:
          - generic [ref=e53]:
            - paragraph [ref=e54]: Why CAMS is trusted
            - heading "Trusted delivery, not just good intentions." [level=2] [ref=e55]
          - list [ref=e56]:
            - listitem [ref=e57]:
              - paragraph [ref=e58]: Safeguarding-first
              - paragraph [ref=e59]: DBS-checked mentors and clear escalation routes
            - listitem [ref=e60]:
              - paragraph [ref=e61]: Joined-up communication
              - paragraph [ref=e62]: Families, schools, and referrers stay aligned
            - listitem [ref=e63]:
              - paragraph [ref=e64]: Measured progression
              - paragraph [ref=e65]: Session goals, review points, and practical next steps
        - generic [ref=e67]:
          - generic [ref=e68]:
            - paragraph [ref=e69]: Our services
            - heading "Programmes you can mix, match, and scale" [level=2] [ref=e70]
            - paragraph [ref=e71]: All programmes are delivered on a one-to-one basis, tailored to each young person with clear structure, consistency and safeguarding throughout
          - generic [ref=e72]:
            - heading "Programmes" [level=3] [ref=e73]
            - list "Programmes, each links to a service page" [ref=e74]:
              - listitem [ref=e75]:
                - link "Sports Support Programme One-to-one support across training, development and participation in sport" [ref=e76]:
                  - /url: /services/sports-support-programme
                  - generic [ref=e78]:
                    - img [ref=e80]
                    - generic [ref=e86]:
                      - text: Sports Support Programme
                      - paragraph [ref=e87]: One-to-one support across training, development and participation in sport
                    - generic [ref=e88]: →
              - listitem [ref=e89]:
                - link "Fitness and Wellbeing One-to-one support to improve physical health, routine and overall wellbeing" [ref=e90]:
                  - /url: /services/boxing-fitness
                  - generic [ref=e92]:
                    - img [ref=e94]
                    - generic [ref=e100]:
                      - text: Fitness and Wellbeing
                      - paragraph [ref=e101]: One-to-one support to improve physical health, routine and overall wellbeing
                    - generic [ref=e102]: →
              - listitem [ref=e103]:
                - link "Community Access and Transport Services One-to-one support to safely access the community, activities and appointments" [ref=e104]:
                  - /url: /services/community
                  - generic [ref=e106]:
                    - img [ref=e108]
                    - generic [ref=e111]:
                      - text: Community Access and Transport Services
                      - paragraph [ref=e112]: One-to-one support to safely access the community, activities and appointments
                    - generic [ref=e113]: →
              - listitem [ref=e114]:
                - link "Behavioural Management and Conflict Resolution One-to-one strategies to manage behaviour, reduce conflict and improve responses" [ref=e115]:
                  - /url: /services/goals
                  - generic [ref=e117]:
                    - img [ref=e119]
                    - generic [ref=e123]:
                      - text: Behavioural Management and Conflict Resolution
                      - paragraph [ref=e124]: One-to-one strategies to manage behaviour, reduce conflict and improve responses
                    - generic [ref=e125]: →
              - listitem [ref=e126]:
                - link "Mentoring and Coaching One-to-one guidance to build confidence, decision making and personal growth" [ref=e127]:
                  - /url: /services/mentoring
                  - generic [ref=e129]:
                    - img [ref=e131]
                    - generic [ref=e133]:
                      - text: Mentoring and Coaching
                      - paragraph [ref=e134]: One-to-one guidance to build confidence, decision making and personal growth
                    - generic [ref=e135]: →
              - listitem [ref=e136]:
                - link "Family Support Service One-to-one support to strengthen communication and build healthier relationships" [ref=e137]:
                  - /url: /services/routine
                  - generic [ref=e139]:
                    - img [ref=e141]
                    - generic [ref=e143]:
                      - text: Family Support Service
                      - paragraph [ref=e144]: One-to-one support to strengthen communication and build healthier relationships
                    - generic [ref=e145]: →
              - listitem [ref=e146]:
                - link "SEN and Education Support One-to-one tailored support for additional needs, learning and school engagement" [ref=e147]:
                  - /url: /services/sen
                  - generic [ref=e149]:
                    - img [ref=e151]
                    - generic [ref=e153]:
                      - text: SEN and Education Support
                      - paragraph [ref=e154]: One-to-one tailored support for additional needs, learning and school engagement
                    - generic [ref=e155]: →
            - link "All services overview" [ref=e157]:
              - /url: /services
        - generic [ref=e159]:
          - generic [ref=e160]:
            - paragraph [ref=e161]: Packages
            - heading "Transparent tiers. Clear expectations." [level=2] [ref=e162]
            - paragraph [ref=e163]: Choose the intensity that matches risk, attendance, and the outcomes you are working towards, then scale as confidence grows.
          - generic [ref=e164]:
            - paragraph [ref=e165]: Hours by tier
            - list [ref=e166]:
              - listitem [ref=e167]:
                - img [ref=e169]
                - generic [ref=e172]:
                  - paragraph [ref=e174]:
                    - text: Mercury
                    - generic [ref=e175]: ", Initial Assessment"
                  - paragraph [ref=e176]: 3 Hours
              - listitem [ref=e177]:
                - img [ref=e179]
                - generic [ref=e182]:
                  - paragraph [ref=e184]:
                    - text: Venus
                    - generic [ref=e185]: ", Early Engagement"
                  - paragraph [ref=e186]: 6 Hours
              - listitem [ref=e187]:
                - img [ref=e189]
                - generic [ref=e194]:
                  - paragraph [ref=e196]:
                    - text: Earth
                    - generic [ref=e197]: ", Core Intervention"
                  - paragraph [ref=e198]: 9 Hours
              - listitem [ref=e199]:
                - img [ref=e201]
                - generic [ref=e203]:
                  - paragraph [ref=e205]:
                    - text: Mars
                    - generic [ref=e206]: ", Behaviour & Routine Focus"
                  - paragraph [ref=e207]: 12 Hours
              - listitem [ref=e208]:
                - img [ref=e210]
                - generic [ref=e212]:
                  - paragraph [ref=e214]:
                    - text: Jupiter
                    - generic [ref=e215]: ", High Impact Mentoring"
                  - paragraph [ref=e216]: 15 Hours
              - listitem [ref=e217]:
                - img [ref=e219]
                - generic [ref=e225]:
                  - paragraph [ref=e227]:
                    - text: Saturn
                    - generic [ref=e228]: ", Deep Intervention"
                  - paragraph [ref=e229]: 18 Hours
              - listitem [ref=e230]:
                - img [ref=e232]
                - generic [ref=e234]:
                  - paragraph [ref=e236]:
                    - text: Uranus
                    - generic [ref=e237]: ", Premium Intensive Support"
                  - paragraph [ref=e238]: 21 Hours
              - listitem [ref=e239]:
                - img [ref=e241]
                - generic [ref=e245]:
                  - paragraph [ref=e247]:
                    - text: Neptune
                    - generic [ref=e248]: ", Flagship Programme"
                  - paragraph [ref=e249]: 24 Hours
            - generic [ref=e250]:
              - paragraph [ref=e251]: Full comparison tables, pricing, features, and how to select a tier, continue on the packages page.
              - link "View packages" [ref=e252]:
                - /url: /packages
        - region "Connect first. Then support change." [ref=e253]:
          - generic [ref=e254]:
            - generic [ref=e255]:
              - paragraph: "01"
              - figure [ref=e257]:
                - img "Mentor and young person in conversation during a session" [ref=e261]
            - article [ref=e262]:
              - paragraph [ref=e265]: Method
              - heading "Connect first. Then support change." [level=2] [ref=e266]:
                - text: Connect first.
                - generic [ref=e267]: Then support change.
              - paragraph [ref=e268]: Behaviour shifts when trust lands first. We invest in rapport, predictable boundaries, and shared language with families and schools before we expect big moves on goals or attendance.
              - link "Read our methodology" [ref=e269]:
                - /url: /about
                - text: Read our methodology
                - generic [ref=e270]: →
        - region "Young people navigating complex moments" [ref=e271]:
          - generic [ref=e272]:
            - article [ref=e273]:
              - paragraph: "02"
              - generic [ref=e274]:
                - paragraph [ref=e276]: Who we support
                - heading "Young people navigating complex moments" [level=2] [ref=e278]
                - paragraph [ref=e279]: Every plan is individual. Common entry points include attendance friction, anxiety, neurodivergence, and confidence gaps, always with consent, dignity, and age-appropriate pacing.
                - generic [ref=e280]:
                  - paragraph [ref=e281]: Common entry points
                  - list [ref=e282]:
                    - listitem [ref=e283]:
                      - generic [ref=e285]:
                        - generic [ref=e286]: "01"
                        - generic [ref=e287]: School refusal
                    - listitem [ref=e288]:
                      - generic [ref=e290]:
                        - generic [ref=e291]: "02"
                        - generic [ref=e292]: Anxiety & isolation
                    - listitem [ref=e293]:
                      - generic [ref=e295]:
                        - generic [ref=e296]: "03"
                        - generic [ref=e297]: ADHD & autism
                    - listitem [ref=e298]:
                      - generic [ref=e300]:
                        - generic [ref=e301]: "04"
                        - generic [ref=e302]: Low confidence
                - link "Explore programmes" [ref=e303]:
                  - /url: /services
                  - text: Explore programmes
                  - generic [ref=e304]: →
            - figure [ref=e306]:
              - img "Young people taking part in a community engagement activity" [ref=e310]
        - generic [ref=e312]:
          - generic [ref=e313]:
            - paragraph [ref=e314]: Voices
            - heading "Outcomes worth hearing" [level=2] [ref=e315]
            - paragraph [ref=e316]: Families and referrers tell us what changes when mentoring is consistent, structured, and kind, with the same standards you will read in our policies and case studies.
          - generic [ref=e317]:
            - article [ref=e318]:
              - generic "5 out of 5 stars" [ref=e319]:
                - img [ref=e320]
                - img [ref=e322]
                - img [ref=e324]
                - img [ref=e326]
                - img [ref=e328]
              - paragraph [ref=e330]: “My son went from school refusal to full attendance. The mentor believed in him when he did not believe in himself.”
              - paragraph [ref=e331]: Sarah M.
              - paragraph [ref=e332]: Parent, school refusal support
            - article [ref=e333]:
              - generic "5 out of 5 stars" [ref=e334]:
                - img [ref=e335]
                - img [ref=e337]
                - img [ref=e339]
                - img [ref=e341]
                - img [ref=e343]
              - paragraph [ref=e345]: “I finally have real friends and I am not scared anymore. My mentor helped me see I am not alone.”
              - paragraph [ref=e346]: Emma, age 12
              - paragraph [ref=e347]: Confidence & social anxiety
            - article [ref=e348]:
              - generic "5 out of 5 stars" [ref=e349]:
                - img [ref=e350]
                - img [ref=e352]
                - img [ref=e354]
                - img [ref=e356]
                - img [ref=e358]
              - paragraph [ref=e360]: “After ADHD diagnosis, we finally have a mentor with strategies that actually work for our family.”
              - paragraph [ref=e361]: David K.
              - paragraph [ref=e362]: Parent, ADHD support
        - generic [ref=e367]:
          - generic [ref=e368]:
            - paragraph [ref=e369]: Take the next step
            - heading "Ready to open the door for a young person you care about?" [level=2] [ref=e370]
          - generic [ref=e371]:
            - paragraph [ref=e372]: Tell us the story in a referral or book a call, and we will match intensity, programme mix, and safeguarding steps with honesty about what is realistic.
            - generic [ref=e373]:
              - link "Check Risk Assessment" [ref=e374]:
                - /url: /risk-assessment
              - link "Make a Referral" [ref=e375]:
                - /url: /referral
              - link "Book a Free Consultation" [ref=e376]:
                - /url: /contact
      - generic "Programme photography strip" [ref=e377]:
        - generic [ref=e379]:
          - figure [ref=e380]:
            - img "Young person taking part in outdoor sports support" [ref=e381]
          - figure [ref=e382]:
            - img "One-to-one fitness and wellbeing session" [ref=e383]
          - figure [ref=e384]:
            - img "Supported community access and travel" [ref=e385]
          - figure [ref=e386]:
            - img "Behavioural management and goal-setting support" [ref=e387]
          - figure [ref=e388]:
            - img "Mentoring and coaching conversation" [ref=e389]
          - figure [ref=e390]:
            - img "Family support and relationship-building session" [ref=e391]
          - figure [ref=e392]:
            - img "SEN and education support activity" [ref=e393]
          - figure [ref=e394]:
            - img "Young person taking part in outdoor sports support" [ref=e395]
          - figure [ref=e396]:
            - img "One-to-one fitness and wellbeing session" [ref=e397]
          - figure [ref=e398]:
            - img "Supported community access and travel" [ref=e399]
          - figure [ref=e400]:
            - img "Behavioural management and goal-setting support" [ref=e401]
          - figure [ref=e402]:
            - img "Mentoring and coaching conversation" [ref=e403]
          - figure [ref=e404]:
            - img "Family support and relationship-building session" [ref=e405]
          - figure [ref=e406]:
            - img "SEN and education support activity" [ref=e407]
      - generic [ref=e409]:
        - generic [ref=e410]:
          - generic [ref=e411]:
            - link "CAMS Services" [ref=e412]:
              - /url: /
              - img "CAMS Services" [ref=e413]
            - paragraph [ref=e414]: Structured mentoring and intervention for young people across the UK, safeguarding-led, relationship-first, and built for real-world progress.
          - generic [ref=e415]:
            - generic [ref=e416]:
              - heading "Quick links" [level=4] [ref=e417]
              - list [ref=e418]:
                - listitem [ref=e419]:
                  - link "About Us" [ref=e420]:
                    - /url: /about
                - listitem [ref=e421]:
                  - link "Our Services" [ref=e422]:
                    - /url: /services
                - listitem [ref=e423]:
                  - link "Packages" [ref=e424]:
                    - /url: /packages
                - listitem [ref=e425]:
                  - link "Our Team" [ref=e426]:
                    - /url: /trainers
                - listitem [ref=e427]:
                  - link "Blog & Resources" [ref=e428]:
                    - /url: /blog
                - listitem [ref=e429]:
                  - link "FAQs" [ref=e430]:
                    - /url: /faq
            - generic [ref=e431]:
              - heading "Families" [level=4] [ref=e432]
              - list [ref=e433]:
                - listitem [ref=e434]:
                  - link "Parent sign in" [ref=e435]:
                    - /url: /login
                - listitem [ref=e436]:
                  - link "Parent sign up" [ref=e437]:
                    - /url: /register
                - listitem [ref=e438]:
                  - link "Make a referral" [ref=e439]:
                    - /url: /contact
                - listitem [ref=e440]:
                  - link "Contact" [ref=e441]:
                    - /url: /contact
            - generic [ref=e442]:
              - heading "Partners" [level=4] [ref=e443]
              - list [ref=e444]:
                - listitem [ref=e445]:
                  - link "Trainer sign in" [ref=e446]:
                    - /url: /login
                - listitem [ref=e447]:
                  - link "School partnerships" [ref=e448]:
                    - /url: /contact
                - listitem [ref=e449]:
                  - link "Intervention packages" [ref=e450]:
                    - /url: /packages
                - listitem [ref=e451]:
                  - link "About CAMS" [ref=e452]:
                    - /url: /about
            - generic [ref=e453]:
              - heading "Organisation" [level=4] [ref=e454]
              - list [ref=e455]:
                - listitem [ref=e456]:
                  - link "Become a trainer" [ref=e457]:
                    - /url: /become-a-trainer
                - listitem [ref=e458]:
                  - link "Policies" [ref=e459]:
                    - /url: /policies
                - listitem [ref=e460]:
                  - link "FAQs" [ref=e461]:
                    - /url: /faq
                - listitem [ref=e462]:
                  - link "Contact" [ref=e463]:
                    - /url: /contact
        - generic [ref=e464]:
          - paragraph [ref=e465]: © 2026 CAMS Services Ltd. All rights reserved.
          - navigation "Legal" [ref=e466]:
            - link "Policies" [ref=e467]:
              - /url: /policies
            - link "FAQ" [ref=e468]:
              - /url: /faq
            - link "Contact" [ref=e469]:
              - /url: /contact
      - generic [ref=e471]:
        - generic:
          - link "Contact us":
            - /url: /contact
            - img
            - generic: Contact us
          - link "Book call":
            - /url: /contact
            - img
            - generic: Book call
        - button "Open quick actions" [ref=e472]:
          - img [ref=e473]
      - generic [ref=e476]:
        - generic [ref=e477]:
          - heading "Cookies and your privacy" [level=2] [ref=e478]
          - paragraph [ref=e479]:
            - text: We use essential cookies so the site works. With your permission we may also use optional cookies for preferences, usage statistics, or relevant updates. Read our
            - link "policies" [ref=e480]:
              - /url: /policies
            - text: for details.
        - generic [ref=e481]:
          - button "Accept all" [ref=e482]
          - button "Essential only" [ref=e483]
          - button "Manage preferences" [ref=e484]
  - button "Open Next.js Dev Tools" [ref=e490] [cursor=pointer]:
    - img [ref=e491]
  - alert [ref=e494]
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