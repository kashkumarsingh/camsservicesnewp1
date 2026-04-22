# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: scripts/responsive-audit.spec.ts >> mobile-375 /services responsive sanity
- Location: scripts/responsive-audit.spec.ts:76:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 5000ms
  Timeout 5000ms exceeded.

  Snapshot: responsive-mobile-375-_services.png

Call log:
  - Expect "toHaveScreenshot(responsive-mobile-375-_services.png)" with timeout 5000ms
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
          - heading "Our Services" [level=1] [ref=e21]
          - generic [ref=e22]: Seven one-to-one programmes — sport, mentoring, community, education support, family, behaviour and fitness — designed to build confidence, engagement, and real change in young people's lives.
        - region "How CAMS delivers mentoring" [ref=e23]:
          - heading "How CAMS delivers mentoring" [level=2] [ref=e24]
          - article [ref=e25]:
            - img [ref=e27]
            - heading "Trust first" [level=3] [ref=e29]
            - paragraph [ref=e30]: Relationship quality comes before behaviour demands, so change sticks outside the session.
          - article [ref=e31]:
            - img [ref=e33]
            - heading "Activity-led" [level=3] [ref=e35]
            - paragraph [ref=e36]: Structured programmes use sport, routines, and real-world tasks, not slides and lectures.
          - article [ref=e37]:
            - img [ref=e39]
            - heading "Joined-up" [level=3] [ref=e44]
            - paragraph [ref=e45]: We align with families, schools, and agencies so the young person hears one coherent story.
        - region "Programmes you can mix, match, and scale" [ref=e46]:
          - generic [ref=e47]:
            - paragraph [ref=e48]: Pathways
            - heading "Programmes you can mix, match, and scale" [level=2] [ref=e49]
            - paragraph [ref=e50]: All programmes are delivered on a one-to-one basis, tailored to each young person with clear structure, consistency and safeguarding throughout.
          - navigation "Jump to programmes" [ref=e51]:
            - generic [ref=e52]:
              - paragraph [ref=e53]: Jump to programme
              - list [ref=e55]:
                - listitem [ref=e56]:
                  - link "Sports Support Programme" [ref=e57]:
                    - /url: "#programme-sports-support-programme"
                - listitem [ref=e58]:
                  - link "Fitness and Wellbeing" [ref=e59]:
                    - /url: "#programme-boxing-fitness"
                - listitem [ref=e60]:
                  - link "Community Access and Transport Services" [ref=e61]:
                    - /url: "#programme-community"
                - listitem [ref=e62]:
                  - link "Behavioural Management and Conflict Resolution" [ref=e63]:
                    - /url: "#programme-goals"
                - listitem [ref=e64]:
                  - link "Mentoring and Coaching" [ref=e65]:
                    - /url: "#programme-mentoring"
                - listitem [ref=e66]:
                  - link "Family Support Service" [ref=e67]:
                    - /url: "#programme-routine"
                - listitem [ref=e68]:
                  - link "SEN and Education Support" [ref=e69]:
                    - /url: "#programme-sen"
          - generic [ref=e70]:
            - article [ref=e71]:
              - generic [ref=e72]:
                - generic [ref=e74]:
                  - img "Sports Support Programme" [ref=e75]
                  - generic [ref=e76]:
                    - img [ref=e77]
                    - generic [ref=e83]:
                      - paragraph [ref=e84]: 01 — Sports pathway
                      - heading "Sports Support Programme" [level=3] [ref=e85]
                - generic [ref=e86]:
                  - paragraph [ref=e87]: One-to-one support across training, development and participation in sport
                  - list [ref=e88]:
                    - listitem [ref=e89]:
                      - generic [ref=e90]: →
                      - generic [ref=e91]: Training and competition readiness
                    - listitem [ref=e92]:
                      - generic [ref=e93]: →
                      - generic [ref=e94]: Development planning with the young person
                    - listitem [ref=e95]:
                      - generic [ref=e96]: →
                      - generic [ref=e97]: Participation and engagement in sport settings
                    - listitem [ref=e98]:
                      - generic [ref=e99]: →
                      - generic [ref=e100]: Mentoring alongside physical progression
                  - generic [ref=e101]:
                    - link "Full programme detail" [ref=e102]:
                      - /url: /services/sports-support-programme
                    - link "See packages" [ref=e103]:
                      - /url: /packages
            - article [ref=e104]:
              - generic [ref=e105]:
                - generic [ref=e107]:
                  - img "Fitness and Wellbeing" [ref=e108]
                  - generic [ref=e109]:
                    - img [ref=e110]
                    - generic [ref=e116]:
                      - paragraph [ref=e117]: 02 — Fitness pathway
                      - heading "Fitness and Wellbeing" [level=3] [ref=e118]
                - generic [ref=e119]:
                  - paragraph [ref=e120]: One-to-one support to improve physical health, routine and overall wellbeing
                  - list [ref=e121]:
                    - listitem [ref=e122]:
                      - generic [ref=e123]: →
                      - generic [ref=e124]: Physical health and energy
                    - listitem [ref=e125]:
                      - generic [ref=e126]: →
                      - generic [ref=e127]: Routine and healthy habits
                    - listitem [ref=e128]:
                      - generic [ref=e129]: →
                      - generic [ref=e130]: Emotional regulation through movement
                    - listitem [ref=e131]:
                      - generic [ref=e132]: →
                      - generic [ref=e133]: Wellbeing goals co-designed with the young person
                  - generic [ref=e134]:
                    - link "Full programme detail" [ref=e135]:
                      - /url: /services/boxing-fitness
                    - link "See packages" [ref=e136]:
                      - /url: /packages
            - article [ref=e137]:
              - generic [ref=e138]:
                - generic [ref=e140]:
                  - img "Community Access and Transport Services" [ref=e141]
                  - generic [ref=e142]:
                    - img [ref=e143]
                    - generic [ref=e146]:
                      - paragraph [ref=e147]: 03 — Community pathway
                      - heading "Community Access and Transport Services" [level=3] [ref=e148]
                - generic [ref=e149]:
                  - paragraph [ref=e150]: One-to-one support to safely access the community, activities and appointments
                  - list [ref=e151]:
                    - listitem [ref=e152]:
                      - generic [ref=e153]: →
                      - generic [ref=e154]: Safe community access and travel
                    - listitem [ref=e155]:
                      - generic [ref=e156]: →
                      - generic [ref=e157]: Activities and appointments supported in person
                    - listitem [ref=e158]:
                      - generic [ref=e159]: →
                      - generic [ref=e160]: Social confidence in public settings
                    - listitem [ref=e161]:
                      - generic [ref=e162]: →
                      - generic [ref=e163]: Practical planning with families and referrers
                  - generic [ref=e164]:
                    - link "Full programme detail" [ref=e165]:
                      - /url: /services/community
                    - link "See packages" [ref=e166]:
                      - /url: /packages
            - article [ref=e167]:
              - generic [ref=e168]:
                - generic [ref=e170]:
                  - img "Behavioural Management and Conflict Resolution" [ref=e171]
                  - generic [ref=e172]:
                    - img [ref=e173]
                    - generic [ref=e177]:
                      - paragraph [ref=e178]: 04 — Behaviour & goals
                      - heading "Behavioural Management and Conflict Resolution" [level=3] [ref=e179]
                - generic [ref=e180]:
                  - paragraph [ref=e181]: One-to-one strategies to manage behaviour, reduce conflict and improve responses
                  - list [ref=e182]:
                    - listitem [ref=e183]:
                      - generic [ref=e184]: →
                      - generic [ref=e185]: Behaviour strategies that fit the young person
                    - listitem [ref=e186]:
                      - generic [ref=e187]: →
                      - generic [ref=e188]: Conflict reduction and de-escalation skills
                    - listitem [ref=e189]:
                      - generic [ref=e190]: →
                      - generic [ref=e191]: Clear expectations and consistent follow-through
                    - listitem [ref=e192]:
                      - generic [ref=e193]: →
                      - generic [ref=e194]: Milestone reviews with referrers and family
                  - generic [ref=e195]:
                    - link "Full programme detail" [ref=e196]:
                      - /url: /services/goals
                    - link "See packages" [ref=e197]:
                      - /url: /packages
            - article [ref=e198]:
              - generic [ref=e199]:
                - generic [ref=e201]:
                  - img "Mentoring and Coaching" [ref=e202]
                  - generic [ref=e203]:
                    - img [ref=e204]
                    - generic [ref=e206]:
                      - paragraph [ref=e207]: 05 — Core pathway
                      - heading "Mentoring and Coaching" [level=3] [ref=e208]
                - generic [ref=e209]:
                  - paragraph [ref=e210]: One-to-one guidance to build confidence, decision making and personal growth
                  - list [ref=e211]:
                    - listitem [ref=e212]:
                      - generic [ref=e213]: →
                      - generic [ref=e214]: Confidence and self-belief
                    - listitem [ref=e215]:
                      - generic [ref=e216]: →
                      - generic [ref=e217]: Decision-making and reflection
                    - listitem [ref=e218]:
                      - generic [ref=e219]: →
                      - generic [ref=e220]: Personal growth at the young person’s pace
                    - listitem [ref=e221]:
                      - generic [ref=e222]: →
                      - generic [ref=e223]: Consistent, DBS-checked mentor relationship
                  - generic [ref=e224]:
                    - link "Full programme detail" [ref=e225]:
                      - /url: /services/mentoring
                    - link "See packages" [ref=e226]:
                      - /url: /packages
            - article [ref=e227]:
              - generic [ref=e228]:
                - generic [ref=e230]:
                  - img "Family Support Service" [ref=e231]
                  - generic [ref=e232]:
                    - img [ref=e233]
                    - generic [ref=e235]:
                      - paragraph [ref=e236]: 06 — Family & life skills
                      - heading "Family Support Service" [level=3] [ref=e237]
                - generic [ref=e238]:
                  - paragraph [ref=e239]: One-to-one support to strengthen communication and build healthier relationships
                  - list [ref=e240]:
                    - listitem [ref=e241]:
                      - generic [ref=e242]: →
                      - generic [ref=e243]: Family communication and alignment
                    - listitem [ref=e244]:
                      - generic [ref=e245]: →
                      - generic [ref=e246]: Healthier relationships and boundaries
                    - listitem [ref=e247]:
                      - generic [ref=e248]: →
                      - generic [ref=e249]: Joint-up messaging with school where needed
                    - listitem [ref=e250]:
                      - generic [ref=e251]: →
                      - generic [ref=e252]: Practical strategies that everyone can use
                  - generic [ref=e253]:
                    - link "Full programme detail" [ref=e254]:
                      - /url: /services/routine
                    - link "See packages" [ref=e255]:
                      - /url: /packages
            - article [ref=e256]:
              - generic [ref=e257]:
                - generic [ref=e259]:
                  - img "SEN and Education Support" [ref=e260]
                  - generic [ref=e261]:
                    - img [ref=e262]
                    - generic [ref=e264]:
                      - paragraph [ref=e265]: 07 — Specialist pathway
                      - heading "SEN and Education Support" [level=3] [ref=e266]
                - generic [ref=e267]:
                  - paragraph [ref=e268]: One-to-one tailored support for additional needs, learning and school engagement
                  - list [ref=e269]:
                    - listitem [ref=e270]:
                      - generic [ref=e271]: →
                      - generic [ref=e272]: Additional learning needs and school engagement
                    - listitem [ref=e273]:
                      - generic [ref=e274]: →
                      - generic [ref=e275]: Autism and ADHD-informed approaches
                    - listitem [ref=e276]:
                      - generic [ref=e277]: →
                      - generic [ref=e278]: Communication and advocacy support
                    - listitem [ref=e279]:
                      - generic [ref=e280]: →
                      - generic [ref=e281]: Flexible pacing with clear structure
                  - generic [ref=e282]:
                    - link "Full programme detail" [ref=e283]:
                      - /url: /services/sen
                    - link "See packages" [ref=e284]:
                      - /url: /packages
        - region "Expected outcomes" [ref=e285]:
          - paragraph [ref=e286]: Impact
          - heading "Expected outcomes" [level=2] [ref=e287]
          - paragraph [ref=e288]: These are the kinds of shifts families and schools often report when engagement and trust are built consistently over time.
          - generic [ref=e289]:
            - article [ref=e290]:
              - img [ref=e292]
              - heading "Improved engagement" [level=3] [ref=e294]
              - paragraph [ref=e295]: Greater willingness to participate and try new things.
            - article [ref=e296]:
              - img [ref=e298]
              - heading "Emotional regulation" [level=3] [ref=e306]
              - paragraph [ref=e307]: Healthier emotional responses and coping strategies.
            - article [ref=e308]:
              - img [ref=e310]
              - heading "Reduced challenging behaviour" [level=3] [ref=e313]
              - paragraph [ref=e314]: Decreases in disruptive or harmful behaviours.
            - article [ref=e315]:
              - img [ref=e317]
              - heading "Relationship improvements" [level=3] [ref=e319]
              - paragraph [ref=e320]: Stronger trust with consistent adults.
            - article [ref=e321]:
              - img [ref=e323]
              - heading "Increased confidence" [level=3] [ref=e325]
              - paragraph [ref=e326]: Improved self-esteem and self-belief.
            - article [ref=e327]:
              - img [ref=e329]
              - heading "Goal achievement" [level=3] [ref=e335]
              - paragraph [ref=e336]: Measurable progress towards clear targets.
        - generic [ref=e341]:
          - generic [ref=e342]:
            - paragraph [ref=e343]: Take the next step
            - heading "Ready to get started?" [level=2] [ref=e344]
          - generic [ref=e345]:
            - paragraph [ref=e346]: Tell us about your context and we will recommend the best support path for your young person.
            - generic [ref=e347]:
              - link "Check risk suitability" [ref=e348]:
                - /url: /risk-assessment
              - link "Make a referral" [ref=e349]:
                - /url: /referral
              - link "View packages" [ref=e350]:
                - /url: /packages
              - link "Book a consultation" [ref=e351]:
                - /url: /contact
      - generic "Programme photography strip" [ref=e352]:
        - generic [ref=e354]:
          - figure [ref=e355]:
            - img "Young person taking part in outdoor sports support" [ref=e356]
          - figure [ref=e357]:
            - img "One-to-one fitness and wellbeing session" [ref=e358]
          - figure [ref=e359]:
            - img "Supported community access and travel" [ref=e360]
          - figure [ref=e361]:
            - img "Behavioural management and goal-setting support" [ref=e362]
          - figure [ref=e363]:
            - img "Mentoring and coaching conversation" [ref=e364]
          - figure [ref=e365]:
            - img "Family support and relationship-building session" [ref=e366]
          - figure [ref=e367]:
            - img "SEN and education support activity" [ref=e368]
          - figure [ref=e369]:
            - img "Young person taking part in outdoor sports support" [ref=e370]
          - figure [ref=e371]:
            - img "One-to-one fitness and wellbeing session" [ref=e372]
          - figure [ref=e373]:
            - img "Supported community access and travel" [ref=e374]
          - figure [ref=e375]:
            - img "Behavioural management and goal-setting support" [ref=e376]
          - figure [ref=e377]:
            - img "Mentoring and coaching conversation" [ref=e378]
          - figure [ref=e379]:
            - img "Family support and relationship-building session" [ref=e380]
          - figure [ref=e381]:
            - img "SEN and education support activity" [ref=e382]
      - generic [ref=e384]:
        - generic [ref=e385]:
          - generic [ref=e386]:
            - link "CAMS Services" [ref=e387]:
              - /url: /
              - img "CAMS Services" [ref=e388]
            - paragraph [ref=e389]: Structured mentoring and intervention for young people across the UK, safeguarding-led, relationship-first, and built for real-world progress.
          - generic [ref=e390]:
            - generic [ref=e391]:
              - heading "Quick links" [level=4] [ref=e392]
              - list [ref=e393]:
                - listitem [ref=e394]:
                  - link "About Us" [ref=e395]:
                    - /url: /about
                - listitem [ref=e396]:
                  - link "Our Services" [ref=e397]:
                    - /url: /services
                - listitem [ref=e398]:
                  - link "Packages" [ref=e399]:
                    - /url: /packages
                - listitem [ref=e400]:
                  - link "Our Team" [ref=e401]:
                    - /url: /trainers
                - listitem [ref=e402]:
                  - link "Blog & Resources" [ref=e403]:
                    - /url: /blog
                - listitem [ref=e404]:
                  - link "FAQs" [ref=e405]:
                    - /url: /faq
            - generic [ref=e406]:
              - heading "Families" [level=4] [ref=e407]
              - list [ref=e408]:
                - listitem [ref=e409]:
                  - link "Parent sign in" [ref=e410]:
                    - /url: /login
                - listitem [ref=e411]:
                  - link "Parent sign up" [ref=e412]:
                    - /url: /register
                - listitem [ref=e413]:
                  - link "Make a referral" [ref=e414]:
                    - /url: /contact
                - listitem [ref=e415]:
                  - link "Contact" [ref=e416]:
                    - /url: /contact
            - generic [ref=e417]:
              - heading "Partners" [level=4] [ref=e418]
              - list [ref=e419]:
                - listitem [ref=e420]:
                  - link "Trainer sign in" [ref=e421]:
                    - /url: /login
                - listitem [ref=e422]:
                  - link "School partnerships" [ref=e423]:
                    - /url: /contact
                - listitem [ref=e424]:
                  - link "Intervention packages" [ref=e425]:
                    - /url: /packages
                - listitem [ref=e426]:
                  - link "About CAMS" [ref=e427]:
                    - /url: /about
            - generic [ref=e428]:
              - heading "Organisation" [level=4] [ref=e429]
              - list [ref=e430]:
                - listitem [ref=e431]:
                  - link "Become a trainer" [ref=e432]:
                    - /url: /become-a-trainer
                - listitem [ref=e433]:
                  - link "Policies" [ref=e434]:
                    - /url: /policies
                - listitem [ref=e435]:
                  - link "FAQs" [ref=e436]:
                    - /url: /faq
                - listitem [ref=e437]:
                  - link "Contact" [ref=e438]:
                    - /url: /contact
        - generic [ref=e439]:
          - paragraph [ref=e440]: © 2026 CAMS Services Ltd. All rights reserved.
          - navigation "Legal" [ref=e441]:
            - link "Policies" [ref=e442]:
              - /url: /policies
            - link "FAQ" [ref=e443]:
              - /url: /faq
            - link "Contact" [ref=e444]:
              - /url: /contact
      - generic [ref=e446]:
        - generic:
          - link "Contact us":
            - /url: /contact
            - img
            - generic: Contact us
          - link "Book call":
            - /url: /contact
            - img
            - generic: Book call
        - button "Open quick actions" [ref=e447]:
          - img [ref=e448]
      - generic [ref=e451]:
        - generic [ref=e452]:
          - heading "Cookies and your privacy" [level=2] [ref=e453]
          - paragraph [ref=e454]:
            - text: We use essential cookies so the site works. With your permission we may also use optional cookies for preferences, usage statistics, or relevant updates. Read our
            - link "policies" [ref=e455]:
              - /url: /policies
            - text: for details.
        - generic [ref=e456]:
          - button "Accept all" [ref=e457]
          - button "Essential only" [ref=e458]
          - button "Manage preferences" [ref=e459]
  - button "Open Next.js Dev Tools" [ref=e465] [cursor=pointer]:
    - img [ref=e466]
  - alert [ref=e469]
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