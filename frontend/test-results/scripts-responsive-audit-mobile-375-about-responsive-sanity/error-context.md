# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: scripts/responsive-audit.spec.ts >> mobile-375 /about responsive sanity
- Location: scripts/responsive-audit.spec.ts:76:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 5000ms
  Timeout 5000ms exceeded.

  Snapshot: responsive-mobile-375-_about.png

Call log:
  - Expect "toHaveScreenshot(responsive-mobile-375-_about.png)" with timeout 5000ms
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
          - heading "About CAMS" [level=1] [ref=e21]
          - generic [ref=e22]: 10+ years and 500+ families supported through consistent trust-first mentoring and structured interventions.
        - generic [ref=e24]:
          - generic [ref=e25]:
            - paragraph [ref=e26]: Our journey
            - heading "Our story" [level=2] [ref=e27]
            - paragraph [ref=e28]: CAMS exists so every young person can feel seen, supported, and able to move forward. We pair structured mentoring with boxing, fitness, routines, and community activity, because engagement often starts through doing, not just talking.
          - generic [ref=e29]:
            - img "Mentoring session in progress with a small group of young people" [ref=e32]
            - generic [ref=e33]:
              - heading "Built on real relationships" [level=3] [ref=e34]
              - paragraph [ref=e35]: "CAMS was founded on a simple belief: every young person deserves the chance to thrive. We began in schools and neighbourhoods, learning that when adults show up consistently, and use activity as a bridge, young people often re-engage with education, peer groups, and their own goals."
              - paragraph [ref=e36]:
                - text: From those early partnerships, CAMS grew into a full mentoring organisation supporting hundreds of families across the UK, with transparent routes for
                - link "referral" [ref=e37]:
                  - /url: /referral
                - text: and a
                - link "menu of services" [ref=e38]:
                  - /url: /services
                - text: schools can align to their cohorts.
              - generic [ref=e39]:
                - article [ref=e40]:
                  - paragraph [ref=e41]: 10+
                  - paragraph [ref=e42]: Years of experience
                - article [ref=e43]:
                  - paragraph [ref=e44]: 500+
                  - paragraph [ref=e45]: Families supported
        - region "CAMS at a glance" [ref=e46]:
          - generic [ref=e47]:
            - heading "CAMS at a glance" [level=2] [ref=e48]
            - paragraph [ref=e49]: CAMS at a glance
            - generic [ref=e50]:
              - generic [ref=e51]:
                - paragraph [ref=e52]: 10+
                - paragraph [ref=e53]: Years of experience
              - generic [ref=e54]:
                - paragraph [ref=e55]: 500+
                - paragraph [ref=e56]: Families supported
              - generic [ref=e57]:
                - paragraph [ref=e58]: 98%
                - paragraph [ref=e59]: Satisfaction rate
        - generic [ref=e61]:
          - generic [ref=e62]:
            - paragraph [ref=e63]: Our framework
            - heading "Mission & values" [level=2] [ref=e64]
            - paragraph [ref=e65]: "Our mission keeps every session honest: trusted relationships first, structured activity second, and outcomes that belong to the young person."
          - figure "Mission statement" [ref=e66]:
            - generic [ref=e67]: Mission statement
            - blockquote [ref=e68]: To provide structured, activity-based mentoring that builds confidence, engagement, and real change in young people's lives.
          - generic [ref=e69]:
            - article [ref=e70]:
              - generic [ref=e73]:
                - heading "Consistency" [level=3] [ref=e74]
                - paragraph [ref=e75]: Reliable sessions and predictable boundaries so young people know someone will show up for them.
            - article [ref=e76]:
              - generic [ref=e79]:
                - heading "Care" [level=3] [ref=e80]
                - paragraph [ref=e81]: Warm, non-judgemental relationships that honour each young person's story and pace.
            - article [ref=e82]:
              - generic [ref=e85]:
                - heading "Integrity" [level=3] [ref=e86]
                - paragraph [ref=e87]: Honest communication with families, schools, and agencies, aligned with safeguarding practice.
            - article [ref=e88]:
              - generic [ref=e91]:
                - heading "Evidence-based" [level=3] [ref=e92]
                - paragraph [ref=e93]: Approaches grounded in what works in youth mentoring and youth work, reviewed as we learn.
            - article [ref=e94]:
              - generic [ref=e97]:
                - heading "Growth-minded" [level=3] [ref=e98]
                - paragraph [ref=e99]: We focus on strengths, small wins, and progress over perfection, building agency step by step.
            - article [ref=e100]:
              - generic [ref=e103]:
                - heading "Collaboration" [level=3] [ref=e104]
                - paragraph [ref=e105]: We work with parents, schools, and partners so support feels joined-up, not isolated.
        - generic [ref=e107]:
          - generic [ref=e108]:
            - paragraph [ref=e109]: People behind CAMS
            - heading "Meet our team" [level=2] [ref=e110]
            - paragraph [ref=e111]: "Trainers, mentors, and programme leads share one brief: stay consistent, stay curious, and keep young people safe while they grow."
          - generic [ref=e112]:
            - article [ref=e113]:
              - generic "Kenneth Holder, Director. CAMS brand avatar with initials." [ref=e115]:
                - img [ref=e116]
                - generic [ref=e146]: KH
              - generic [ref=e147]:
                - heading "Kenneth Holder" [level=3] [ref=e148]
                - paragraph [ref=e149]: Director
            - article [ref=e150]:
              - generic "James Mitchell, Senior Programme Manager. CAMS brand avatar with initials." [ref=e152]:
                - img [ref=e153]
                - generic [ref=e183]: JM
              - generic [ref=e184]:
                - heading "James Mitchell" [level=3] [ref=e185]
                - paragraph [ref=e186]: Senior Programme Manager
            - article [ref=e187]:
              - generic "Emma Roberts, Trainer & Coach. CAMS brand avatar with initials." [ref=e189]:
                - img [ref=e190]
                - generic [ref=e220]: ER
              - generic [ref=e221]:
                - heading "Emma Roberts" [level=3] [ref=e222]
                - paragraph [ref=e223]: Trainer & Coach
            - article [ref=e224]:
              - generic "Michael Chen, Head of Partnerships. CAMS brand avatar with initials." [ref=e226]:
                - img [ref=e227]
                - generic [ref=e257]: MC
              - generic [ref=e258]:
                - heading "Michael Chen" [level=3] [ref=e259]
                - paragraph [ref=e260]: Head of Partnerships
            - article [ref=e261]:
              - generic "Lisa Thompson, Safeguarding Officer. CAMS brand avatar with initials." [ref=e263]:
                - img [ref=e264]
                - generic [ref=e294]: LT
              - generic [ref=e295]:
                - heading "Lisa Thompson" [level=3] [ref=e296]
                - paragraph [ref=e297]: Safeguarding Officer
            - article [ref=e298]:
              - generic "David Williams, Lead Mentor. CAMS brand avatar with initials." [ref=e300]:
                - img [ref=e301]
                - generic [ref=e331]: DW
              - generic [ref=e332]:
                - heading "David Williams" [level=3] [ref=e333]
                - paragraph [ref=e334]: Lead Mentor
          - paragraph [ref=e335]:
            - text: Interested in joining us?
            - link "View careers and trainer roles" [ref=e336]:
              - /url: /careers
            - text: .
        - generic [ref=e339]:
          - paragraph [ref=e340]: Why CAMS
          - heading "Why schools & families choose CAMS" [level=2] [ref=e341]
          - paragraph [ref=e342]: Practical reasons teams return to us, without watering down safeguarding or the quality of relationships.
          - img "Mentor and young person taking part in an outdoor community-based CAMS activity" [ref=e344]
          - list [ref=e345]:
            - listitem [ref=e346]:
              - generic [ref=e347]:
                - generic [ref=e348]: "01"
                - generic [ref=e349]:
                  - heading "10+ years proven track record" [level=3] [ref=e350]
                  - paragraph [ref=e351]: A long history of delivering mentoring and interventions alongside schools and families across the UK.
            - listitem [ref=e352]:
              - generic [ref=e353]:
                - generic [ref=e354]: "02"
                - generic [ref=e355]:
                  - heading "100% DBS checked" [level=3] [ref=e356]
                  - paragraph [ref=e357]: Robust safer recruitment and ongoing safeguarding oversight for every team member who works with young people.
            - listitem [ref=e358]:
              - generic [ref=e359]:
                - generic [ref=e360]: "03"
                - generic [ref=e361]:
                  - heading "Activity-based approach" [level=3] [ref=e362]
                  - paragraph [ref=e363]: Mentoring happens through boxing, fitness, community trips, and routines, so engagement feels natural.
            - listitem [ref=e364]:
              - generic [ref=e365]:
                - generic [ref=e366]: "04"
                - generic [ref=e367]:
                  - heading "Evidence-informed methods" [level=3] [ref=e368]
                  - paragraph [ref=e369]: Programme design reflects youth mentoring evidence, clinical safeguarding expectations, and feedback from partners.
            - listitem [ref=e370]:
              - generic [ref=e371]:
                - generic [ref=e372]: "05"
                - generic [ref=e373]:
                  - heading "Personalised support" [level=3] [ref=e374]
                  - paragraph [ref=e375]: Plans respond to each young person's goals, whether academic, social, emotional, or behavioural.
            - listitem [ref=e376]:
              - generic [ref=e377]:
                - generic [ref=e378]: "06"
                - generic [ref=e379]:
                  - heading "Real relationships matter" [level=3] [ref=e380]
                  - paragraph [ref=e381]: Trust and consistency come before outcomes; the relationship is the intervention we protect most.
        - generic [ref=e386]:
          - generic [ref=e387]:
            - paragraph [ref=e388]: Take the next step
            - heading "Let's work together" [level=2] [ref=e389]
          - generic [ref=e390]:
            - paragraph [ref=e391]: Ready to support a young person? Let's discuss how CAMS can help.
            - generic [ref=e392]:
              - link "Make a Referral" [ref=e393]:
                - /url: /referral
              - link "Book a Free Consultation" [ref=e394]:
                - /url: /contact
              - link "Explore Trainer Roles" [ref=e395]:
                - /url: /careers
      - generic "Programme photography strip" [ref=e396]:
        - generic [ref=e398]:
          - figure [ref=e399]:
            - img "Young person taking part in outdoor sports support" [ref=e400]
          - figure [ref=e401]:
            - img "One-to-one fitness and wellbeing session" [ref=e402]
          - figure [ref=e403]:
            - img "Supported community access and travel" [ref=e404]
          - figure [ref=e405]:
            - img "Behavioural management and goal-setting support" [ref=e406]
          - figure [ref=e407]:
            - img "Mentoring and coaching conversation" [ref=e408]
          - figure [ref=e409]:
            - img "Family support and relationship-building session" [ref=e410]
          - figure [ref=e411]:
            - img "SEN and education support activity" [ref=e412]
          - figure [ref=e413]:
            - img "Young person taking part in outdoor sports support" [ref=e414]
          - figure [ref=e415]:
            - img "One-to-one fitness and wellbeing session" [ref=e416]
          - figure [ref=e417]:
            - img "Supported community access and travel" [ref=e418]
          - figure [ref=e419]:
            - img "Behavioural management and goal-setting support" [ref=e420]
          - figure [ref=e421]:
            - img "Mentoring and coaching conversation" [ref=e422]
          - figure [ref=e423]:
            - img "Family support and relationship-building session" [ref=e424]
          - figure [ref=e425]:
            - img "SEN and education support activity" [ref=e426]
      - generic [ref=e428]:
        - generic [ref=e429]:
          - generic [ref=e430]:
            - link "CAMS Services" [ref=e431]:
              - /url: /
              - img "CAMS Services" [ref=e432]
            - paragraph [ref=e433]: Structured mentoring and intervention for young people across the UK, safeguarding-led, relationship-first, and built for real-world progress.
          - generic [ref=e434]:
            - generic [ref=e435]:
              - heading "Quick links" [level=4] [ref=e436]
              - list [ref=e437]:
                - listitem [ref=e438]:
                  - link "About Us" [ref=e439]:
                    - /url: /about
                - listitem [ref=e440]:
                  - link "Our Services" [ref=e441]:
                    - /url: /services
                - listitem [ref=e442]:
                  - link "Packages" [ref=e443]:
                    - /url: /packages
                - listitem [ref=e444]:
                  - link "Our Team" [ref=e445]:
                    - /url: /trainers
                - listitem [ref=e446]:
                  - link "Blog & Resources" [ref=e447]:
                    - /url: /blog
                - listitem [ref=e448]:
                  - link "FAQs" [ref=e449]:
                    - /url: /faq
            - generic [ref=e450]:
              - heading "Families" [level=4] [ref=e451]
              - list [ref=e452]:
                - listitem [ref=e453]:
                  - link "Parent sign in" [ref=e454]:
                    - /url: /login
                - listitem [ref=e455]:
                  - link "Parent sign up" [ref=e456]:
                    - /url: /register
                - listitem [ref=e457]:
                  - link "Make a referral" [ref=e458]:
                    - /url: /contact
                - listitem [ref=e459]:
                  - link "Contact" [ref=e460]:
                    - /url: /contact
            - generic [ref=e461]:
              - heading "Partners" [level=4] [ref=e462]
              - list [ref=e463]:
                - listitem [ref=e464]:
                  - link "Trainer sign in" [ref=e465]:
                    - /url: /login
                - listitem [ref=e466]:
                  - link "School partnerships" [ref=e467]:
                    - /url: /contact
                - listitem [ref=e468]:
                  - link "Intervention packages" [ref=e469]:
                    - /url: /packages
                - listitem [ref=e470]:
                  - link "About CAMS" [ref=e471]:
                    - /url: /about
            - generic [ref=e472]:
              - heading "Organisation" [level=4] [ref=e473]
              - list [ref=e474]:
                - listitem [ref=e475]:
                  - link "Become a trainer" [ref=e476]:
                    - /url: /become-a-trainer
                - listitem [ref=e477]:
                  - link "Policies" [ref=e478]:
                    - /url: /policies
                - listitem [ref=e479]:
                  - link "FAQs" [ref=e480]:
                    - /url: /faq
                - listitem [ref=e481]:
                  - link "Contact" [ref=e482]:
                    - /url: /contact
        - generic [ref=e483]:
          - paragraph [ref=e484]: © 2026 CAMS Services Ltd. All rights reserved.
          - navigation "Legal" [ref=e485]:
            - link "Policies" [ref=e486]:
              - /url: /policies
            - link "FAQ" [ref=e487]:
              - /url: /faq
            - link "Contact" [ref=e488]:
              - /url: /contact
      - generic [ref=e490]:
        - generic:
          - link "Contact us":
            - /url: /contact
            - img
            - generic: Contact us
          - link "Book call":
            - /url: /contact
            - img
            - generic: Book call
        - button "Open quick actions" [ref=e491]:
          - img [ref=e492]
      - generic [ref=e495]:
        - generic [ref=e496]:
          - heading "Cookies and your privacy" [level=2] [ref=e497]
          - paragraph [ref=e498]:
            - text: We use essential cookies so the site works. With your permission we may also use optional cookies for preferences, usage statistics, or relevant updates. Read our
            - link "policies" [ref=e499]:
              - /url: /policies
            - text: for details.
        - generic [ref=e500]:
          - button "Accept all" [ref=e501]
          - button "Essential only" [ref=e502]
          - button "Manage preferences" [ref=e503]
  - button "Open Next.js Dev Tools" [ref=e509] [cursor=pointer]:
    - img [ref=e510]
  - alert [ref=e513]
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