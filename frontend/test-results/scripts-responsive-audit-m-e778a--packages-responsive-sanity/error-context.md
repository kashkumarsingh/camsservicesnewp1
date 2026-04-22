# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: scripts/responsive-audit.spec.ts >> mobile-375 /packages responsive sanity
- Location: scripts/responsive-audit.spec.ts:76:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 5000ms
  Timeout 5000ms exceeded.

  Snapshot: responsive-mobile-375-_packages.png

Call log:
  - Expect "toHaveScreenshot(responsive-mobile-375-_packages.png)" with timeout 5000ms
    - generating new stable screenshot expectation
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
          - heading "Intervention Packages" [level=1] [ref=e21]
          - generic [ref=e22]: Eight solar-system tiers, from a short Mercury entry block through our Neptune flagship, so you can match hours, intensity, and reporting to your young person.
        - generic [ref=e24]:
          - generic [ref=e26]:
            - img "Young person working towards goals with mentor support" [ref=e27]
            - generic [ref=e28]:
              - paragraph [ref=e29]: Outcome-led support
              - heading "Choose a package that matches both risk and readiness" [level=2] [ref=e30]
              - paragraph [ref=e31]: Every tier is designed around practical engagement, confidence building, and measurable progression. Start at the right level and scale support as outcomes improve.
          - paragraph [ref=e33]: Buying a package now starts with parent authentication. Existing parents should sign in, and new parents can create an account before checkout.
          - generic [ref=e34]:
            - article [ref=e35]:
              - img [ref=e37]
              - heading "Mercury" [level=3] [ref=e40]
              - paragraph [ref=e41]: Initial Assessment
              - paragraph [ref=e42]:
                - link "View full details" [ref=e43]:
                  - /url: /packages/mercury
              - paragraph [ref=e44]: 3 Hours
              - paragraph [ref=e45]: £195
              - generic [ref=e47]:
                - list [ref=e48]:
                  - listitem [ref=e49]:
                    - generic [ref=e50]: •
                    - generic [ref=e51]: Structured initial assessment session
                  - listitem [ref=e52]:
                    - generic [ref=e53]: •
                    - generic [ref=e54]: Engagement and behaviour overview
                  - listitem [ref=e55]:
                    - generic [ref=e56]: •
                    - generic [ref=e57]: Trust-building first contact
                  - listitem [ref=e58]:
                    - generic [ref=e59]: •
                    - generic [ref=e60]: Clear support pathway and recommendations
                - button "Show 4 more" [ref=e61]
              - generic [ref=e62]:
                - img [ref=e63]
                - generic [ref=e66]: Best for understanding needs before starting structured support.
              - link "Select Package" [ref=e67]:
                - /url: /login?role=parent&intent=buy-package&package=mercury&redirect=%2Fpackages
              - link "New parent? Sign up first" [ref=e68]:
                - /url: /register?role=parent&intent=buy-package&package=mercury&redirect=%2Fpackages
            - article [ref=e69]:
              - img [ref=e71]
              - heading "Venus" [level=3] [ref=e74]
              - paragraph [ref=e75]: Early Engagement
              - paragraph [ref=e76]:
                - link "View full details" [ref=e77]:
                  - /url: /packages/venus
              - paragraph [ref=e78]: 6 Hours
              - paragraph [ref=e79]: £300
              - generic [ref=e81]:
                - list [ref=e82]:
                  - listitem [ref=e83]:
                    - generic [ref=e84]: •
                    - generic [ref=e85]: Structured 1:1 mentoring sessions
                  - listitem [ref=e86]:
                    - generic [ref=e87]: •
                    - generic [ref=e88]: Activity-based engagement to build trust and confidence
                  - listitem [ref=e89]:
                    - generic [ref=e90]: •
                    - generic [ref=e91]: Goal setting (2-3 clear targets)
                  - listitem [ref=e92]:
                    - generic [ref=e93]: •
                    - generic [ref=e94]: Early progress tracking
                - button "Show 4 more" [ref=e95]
              - generic [ref=e96]:
                - img [ref=e97]
                - generic [ref=e100]: Best for building early engagement and quick wins.
              - link "Select Package" [ref=e101]:
                - /url: /login?role=parent&intent=buy-package&package=venus&redirect=%2Fpackages
              - link "New parent? Sign up first" [ref=e102]:
                - /url: /register?role=parent&intent=buy-package&package=venus&redirect=%2Fpackages
            - article [ref=e103]:
              - generic [ref=e104]: Most Popular
              - img [ref=e106]
              - heading "Earth" [level=3] [ref=e111]
              - paragraph [ref=e112]: Core Intervention
              - paragraph [ref=e113]:
                - link "View full details" [ref=e114]:
                  - /url: /packages/earth
              - paragraph [ref=e115]: 9 Hours
              - paragraph [ref=e116]: £450
              - generic [ref=e118]:
                - list [ref=e119]:
                  - listitem [ref=e120]:
                    - generic [ref=e121]: •
                    - generic [ref=e122]: Structured 1:1 mentoring sessions
                  - listitem [ref=e123]:
                    - generic [ref=e124]: •
                    - generic [ref=e125]: Activity-based engagement to build trust and confidence
                  - listitem [ref=e126]:
                    - generic [ref=e127]: •
                    - generic [ref=e128]: Personalised support plan based on initial assessment
                  - listitem [ref=e129]:
                    - generic [ref=e130]: •
                    - generic [ref=e131]: Progress tracking against agreed goals
                - button "Show 6 more" [ref=e132]
              - generic [ref=e133]:
                - img [ref=e134]
                - generic [ref=e137]: Best for consistent support and measurable progress.
              - link "Select Package" [ref=e138]:
                - /url: /login?role=parent&intent=buy-package&package=earth&redirect=%2Fpackages
              - link "New parent? Sign up first" [ref=e139]:
                - /url: /register?role=parent&intent=buy-package&package=earth&redirect=%2Fpackages
            - article [ref=e140]:
              - img [ref=e142]
              - heading "Mars" [level=3] [ref=e144]
              - paragraph [ref=e145]: Behaviour & Routine Focus
              - paragraph [ref=e146]:
                - link "View full details" [ref=e147]:
                  - /url: /packages/mars
              - paragraph [ref=e148]: 12 Hours
              - paragraph [ref=e149]: £600
              - generic [ref=e151]:
                - list [ref=e152]:
                  - listitem [ref=e153]:
                    - generic [ref=e154]: •
                    - generic [ref=e155]: Structured 1:1 mentoring sessions
                  - listitem [ref=e156]:
                    - generic [ref=e157]: •
                    - generic [ref=e158]: Activity-based engagement to build trust and confidence
                  - listitem [ref=e159]:
                    - generic [ref=e160]: •
                    - generic [ref=e161]: Personalised intervention plan based on assessment
                  - listitem [ref=e162]:
                    - generic [ref=e163]: •
                    - generic [ref=e164]: Behaviour, engagement, and routine monitoring
                - button "Show 6 more" [ref=e165]
              - generic [ref=e166]:
                - img [ref=e167]
                - generic [ref=e170]: Best for building structure, routine, and behaviour change.
              - link "Select Package" [ref=e171]:
                - /url: /login?role=parent&intent=buy-package&package=mars&redirect=%2Fpackages
              - link "New parent? Sign up first" [ref=e172]:
                - /url: /register?role=parent&intent=buy-package&package=mars&redirect=%2Fpackages
            - article [ref=e173]:
              - img [ref=e175]
              - heading "Jupiter" [level=3] [ref=e177]
              - paragraph [ref=e178]: High Impact Mentoring
              - paragraph [ref=e179]:
                - link "View full details" [ref=e180]:
                  - /url: /packages/jupiter
              - paragraph [ref=e181]: 15 Hours
              - paragraph [ref=e182]: £750
              - generic [ref=e184]:
                - list [ref=e185]:
                  - listitem [ref=e186]:
                    - generic [ref=e187]: •
                    - generic [ref=e188]: Structured 1:1 mentoring sessions
                  - listitem [ref=e189]:
                    - generic [ref=e190]: •
                    - generic [ref=e191]: Activity-based engagement to build trust and confidence
                  - listitem [ref=e192]:
                    - generic [ref=e193]: •
                    - generic [ref=e194]: Personalised intervention plan based on assessment
                  - listitem [ref=e195]:
                    - generic [ref=e196]: •
                    - generic [ref=e197]: Behaviour, engagement, and resilience development
                - button "Show 7 more" [ref=e198]
              - generic [ref=e199]:
                - img [ref=e200]
                - generic [ref=e203]: Best for higher-risk cases needing stronger structure and coordination.
              - link "Select Package" [ref=e204]:
                - /url: /login?role=parent&intent=buy-package&package=jupiter&redirect=%2Fpackages
              - link "New parent? Sign up first" [ref=e205]:
                - /url: /register?role=parent&intent=buy-package&package=jupiter&redirect=%2Fpackages
            - article [ref=e206]:
              - generic [ref=e207]: Best for Complex Needs
              - img [ref=e209]
              - heading "Saturn" [level=3] [ref=e215]
              - paragraph [ref=e216]: Deep Intervention
              - paragraph [ref=e217]:
                - link "View full details" [ref=e218]:
                  - /url: /packages/saturn
              - paragraph [ref=e219]: 18 Hours
              - paragraph [ref=e220]: £900
              - generic [ref=e222]:
                - list [ref=e223]:
                  - listitem [ref=e224]:
                    - generic [ref=e225]: •
                    - generic [ref=e226]: Structured 1:1 mentoring sessions
                  - listitem [ref=e227]:
                    - generic [ref=e228]: •
                    - generic [ref=e229]: Activity-based engagement to build trust and confidence
                  - listitem [ref=e230]:
                    - generic [ref=e231]: •
                    - generic [ref=e232]: Personalised intervention plan based on assessment
                  - listitem [ref=e233]:
                    - generic [ref=e234]: •
                    - generic [ref=e235]: Behaviour, engagement, and routine monitoring
                - button "Show 7 more" [ref=e236]
              - generic [ref=e237]:
                - img [ref=e238]
                - generic [ref=e241]: Best for ongoing behavioural needs and deeper intervention.
              - link "Select Package" [ref=e242]:
                - /url: /login?role=parent&intent=buy-package&package=saturn&redirect=%2Fpackages
              - link "New parent? Sign up first" [ref=e243]:
                - /url: /register?role=parent&intent=buy-package&package=saturn&redirect=%2Fpackages
            - article [ref=e244]:
              - img [ref=e246]
              - heading "Uranus" [level=3] [ref=e248]
              - paragraph [ref=e249]: Premium Intensive Support
              - paragraph [ref=e250]:
                - link "View full details" [ref=e251]:
                  - /url: /packages/uranus
              - paragraph [ref=e252]: 21 Hours
              - paragraph [ref=e253]: £1,050
              - generic [ref=e255]:
                - list [ref=e256]:
                  - listitem [ref=e257]:
                    - generic [ref=e258]: •
                    - generic [ref=e259]: Structured 1:1 mentoring sessions
                  - listitem [ref=e260]:
                    - generic [ref=e261]: •
                    - generic [ref=e262]: Activity-based engagement to build trust and confidence
                  - listitem [ref=e263]:
                    - generic [ref=e264]: •
                    - generic [ref=e265]: Personalised multi-area support plan based on assessment
                  - listitem [ref=e266]:
                    - generic [ref=e267]: •
                    - generic [ref=e268]: Behaviour, engagement, and social development monitoring
                - button "Show 8 more" [ref=e269]
              - generic [ref=e270]:
                - img [ref=e271]
                - generic [ref=e274]: Best for complex cases needing consistency and priority support.
              - link "Select Package" [ref=e275]:
                - /url: /login?role=parent&intent=buy-package&package=uranus&redirect=%2Fpackages
              - link "New parent? Sign up first" [ref=e276]:
                - /url: /register?role=parent&intent=buy-package&package=uranus&redirect=%2Fpackages
            - article [ref=e277]:
              - img [ref=e279]
              - heading "Neptune" [level=3] [ref=e283]
              - paragraph [ref=e284]: Flagship Programme
              - paragraph [ref=e285]:
                - link "View full details" [ref=e286]:
                  - /url: /packages/neptune
              - paragraph [ref=e287]: 24 Hours
              - paragraph [ref=e288]: £1,200
              - generic [ref=e290]:
                - list [ref=e291]:
                  - listitem [ref=e292]:
                    - generic [ref=e293]: •
                    - generic [ref=e294]: Structured 1:1 mentoring sessions
                  - listitem [ref=e295]:
                    - generic [ref=e296]: •
                    - generic [ref=e297]: Activity-based engagement to build trust and confidence
                  - listitem [ref=e298]:
                    - generic [ref=e299]: •
                    - generic [ref=e300]: Personalised long-term intervention plan based on assessment
                  - listitem [ref=e301]:
                    - generic [ref=e302]: •
                    - generic [ref=e303]: Continuous progress tracking and documentation
                - button "Show 8 more" [ref=e304]
              - generic [ref=e305]:
                - img [ref=e306]
                - generic [ref=e309]: Best for full support and long-term progression.
              - link "Select Package" [ref=e310]:
                - /url: /login?role=parent&intent=buy-package&package=neptune&redirect=%2Fpackages
              - link "New parent? Sign up first" [ref=e311]:
                - /url: /register?role=parent&intent=buy-package&package=neptune&redirect=%2Fpackages
        - generic [ref=e313]:
          - generic [ref=e314]:
            - heading "Package Comparison" [level=2] [ref=e315]
            - paragraph [ref=e316]: Compare features across every tier, Mercury through Neptune, to find the right fit.
          - table [ref=e318]:
            - rowgroup [ref=e319]:
              - row "Feature Mercury Venus Earth Mars Jupiter Saturn Uranus Neptune" [ref=e320]:
                - columnheader "Feature" [ref=e321]
                - columnheader "Mercury" [ref=e322]:
                  - generic [ref=e323]:
                    - img [ref=e324]
                    - text: Mercury
                - columnheader "Venus" [ref=e327]:
                  - generic [ref=e328]:
                    - img [ref=e329]
                    - text: Venus
                - columnheader "Earth" [ref=e332]:
                  - generic [ref=e333]:
                    - img [ref=e334]
                    - text: Earth
                - columnheader "Mars" [ref=e339]:
                  - generic [ref=e340]:
                    - img [ref=e341]
                    - text: Mars
                - columnheader "Jupiter" [ref=e343]:
                  - generic [ref=e344]:
                    - img [ref=e345]
                    - text: Jupiter
                - columnheader "Saturn" [ref=e347]:
                  - generic [ref=e348]:
                    - img [ref=e349]
                    - text: Saturn
                - columnheader "Uranus" [ref=e355]:
                  - generic [ref=e356]:
                    - img [ref=e357]
                    - text: Uranus
                - columnheader "Neptune" [ref=e359]:
                  - generic [ref=e360]:
                    - img [ref=e361]
                    - text: Neptune
            - rowgroup [ref=e365]:
              - row "Hours 3 6 9 12 15 18 21 24" [ref=e366]:
                - rowheader "Hours" [ref=e367]:
                  - strong [ref=e368]: Hours
                - cell "3" [ref=e369]
                - cell "6" [ref=e370]
                - cell "9" [ref=e371]
                - cell "12" [ref=e372]
                - cell "15" [ref=e373]
                - cell "18" [ref=e374]
                - cell "21" [ref=e375]
                - cell "24" [ref=e376]
              - row "Price £195 £300 £450 £600 £750 £900 £1,050 £1,200" [ref=e377]:
                - rowheader "Price" [ref=e378]:
                  - strong [ref=e379]: Price
                - cell "£195" [ref=e380]
                - cell "£300" [ref=e381]
                - cell "£450" [ref=e382]
                - cell "£600" [ref=e383]
                - cell "£750" [ref=e384]
                - cell "£900" [ref=e385]
                - cell "£1,050" [ref=e386]
                - cell "£1,200" [ref=e387]
              - row "Cost per Hour £65 £50 £50 £50 £50 £50 £50 £50" [ref=e388]:
                - rowheader "Cost per Hour" [ref=e389]:
                  - strong [ref=e390]: Cost per Hour
                - cell "£65" [ref=e391]
                - cell "£50" [ref=e392]
                - cell "£50" [ref=e393]
                - cell "£50" [ref=e394]
                - cell "£50" [ref=e395]
                - cell "£50" [ref=e396]
                - cell "£50" [ref=e397]
                - cell "£50" [ref=e398]
              - row "1:1 Mentoring ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓" [ref=e399]:
                - rowheader "1:1 Mentoring" [ref=e400]:
                  - strong [ref=e401]: 1:1 Mentoring
                - cell "✓" [ref=e402]
                - cell "✓" [ref=e403]
                - cell "✓" [ref=e404]
                - cell "✓" [ref=e405]
                - cell "✓" [ref=e406]
                - cell "✓" [ref=e407]
                - cell "✓" [ref=e408]
                - cell "✓" [ref=e409]
              - row "Activities Included 1 1-2 2-3 2-4 3-4 3-5 4-5 5+" [ref=e410]:
                - rowheader "Activities Included" [ref=e411]:
                  - strong [ref=e412]: Activities Included
                - cell "1" [ref=e413]
                - cell "1-2" [ref=e414]
                - cell "2-3" [ref=e415]
                - cell "2-4" [ref=e416]
                - cell "3-4" [ref=e417]
                - cell "3-5" [ref=e418]
                - cell "4-5" [ref=e419]
                - cell "5+" [ref=e420]
              - row "Support Plan Basic ✓ ✓ ✓ ✓ ✓ ✓ ✓" [ref=e421]:
                - rowheader "Support Plan" [ref=e422]:
                  - strong [ref=e423]: Support Plan
                - cell "Basic" [ref=e424]
                - cell "✓" [ref=e425]
                - cell "✓" [ref=e426]
                - cell "✓" [ref=e427]
                - cell "✓" [ref=e428]
                - cell "✓" [ref=e429]
                - cell "✓" [ref=e430]
                - cell "✓" [ref=e431]
              - row "Progress Tracking Basic ✓ Structured Structured Structured Structured Detailed Continuous" [ref=e432]:
                - rowheader "Progress Tracking" [ref=e433]:
                  - strong [ref=e434]: Progress Tracking
                - cell "Basic" [ref=e435]
                - cell "✓" [ref=e436]
                - cell "Structured" [ref=e437]
                - cell "Structured" [ref=e438]
                - cell "Structured" [ref=e439]
                - cell "Structured" [ref=e440]
                - cell "Detailed" [ref=e441]
                - cell "Continuous" [ref=e442]
              - row "Behaviour Focus - Light ✓ ✓ Strong ✓ Strong ✓ Strong ✓ Advanced ✓ Advanced" [ref=e443]:
                - rowheader "Behaviour Focus" [ref=e444]:
                  - strong [ref=e445]: Behaviour Focus
                - cell "-" [ref=e446]
                - cell "Light" [ref=e447]
                - cell "✓" [ref=e448]
                - cell "✓ Strong" [ref=e449]
                - cell "✓ Strong" [ref=e450]
                - cell "✓ Strong" [ref=e451]
                - cell "✓ Advanced" [ref=e452]
                - cell "✓ Advanced" [ref=e453]
              - row "Parent / Referrer Check-in Feedback Summary Mid-point Review Review Strategy session Strategy session Ongoing" [ref=e454]:
                - rowheader "Parent / Referrer Check-in" [ref=e455]:
                  - strong [ref=e456]: Parent / Referrer Check-in
                - cell "Feedback" [ref=e457]
                - cell "Summary" [ref=e458]
                - cell "Mid-point" [ref=e459]
                - cell "Review" [ref=e460]
                - cell "Review" [ref=e461]
                - cell "Strategy session" [ref=e462]
                - cell "Strategy session" [ref=e463]
                - cell "Ongoing" [ref=e464]
              - row "Reports Brief Summary Full Full Mid + Final Final Detailed Full documentation" [ref=e465]:
                - rowheader "Reports" [ref=e466]:
                  - strong [ref=e467]: Reports
                - cell "Brief" [ref=e468]
                - cell "Summary" [ref=e469]
                - cell "Full" [ref=e470]
                - cell "Full" [ref=e471]
                - cell "Mid + Final" [ref=e472]
                - cell "Final" [ref=e473]
                - cell "Detailed" [ref=e474]
                - cell "Full documentation" [ref=e475]
              - row "School / Professional Liaison - - - - ✓ ✓ ✓ ✓" [ref=e476]:
                - rowheader "School / Professional Liaison" [ref=e477]:
                  - strong [ref=e478]: School / Professional Liaison
                - cell "-" [ref=e479]
                - cell "-" [ref=e480]
                - cell "-" [ref=e481]
                - cell "-" [ref=e482]
                - cell "✓" [ref=e483]
                - cell "✓" [ref=e484]
                - cell "✓" [ref=e485]
                - cell "✓" [ref=e486]
              - row "Senior Oversight - - - - - - ✓ ✓" [ref=e487]:
                - rowheader "Senior Oversight" [ref=e488]:
                  - strong [ref=e489]: Senior Oversight
                - cell "-" [ref=e490]
                - cell "-" [ref=e491]
                - cell "-" [ref=e492]
                - cell "-" [ref=e493]
                - cell "-" [ref=e494]
                - cell "-" [ref=e495]
                - cell "✓" [ref=e496]
                - cell "✓" [ref=e497]
              - row "Priority Scheduling - - - - - - ✓ ✓" [ref=e498]:
                - rowheader "Priority Scheduling" [ref=e499]:
                  - strong [ref=e500]: Priority Scheduling
                - cell "-" [ref=e501]
                - cell "-" [ref=e502]
                - cell "-" [ref=e503]
                - cell "-" [ref=e504]
                - cell "-" [ref=e505]
                - cell "-" [ref=e506]
                - cell "✓" [ref=e507]
                - cell "✓" [ref=e508]
              - row "Follow-up Session - - - - - - - ✓" [ref=e509]:
                - rowheader "Follow-up Session" [ref=e510]:
                  - strong [ref=e511]: Follow-up Session
                - cell "-" [ref=e512]
                - cell "-" [ref=e513]
                - cell "-" [ref=e514]
                - cell "-" [ref=e515]
                - cell "-" [ref=e516]
                - cell "-" [ref=e517]
                - cell "-" [ref=e518]
                - cell "✓" [ref=e519]
              - row "Transport Included ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓" [ref=e520]:
                - rowheader "Transport Included" [ref=e521]:
                  - strong [ref=e522]: Transport Included
                - cell "✓" [ref=e523]
                - cell "✓" [ref=e524]
                - cell "✓" [ref=e525]
                - cell "✓" [ref=e526]
                - cell "✓" [ref=e527]
                - cell "✓" [ref=e528]
                - cell "✓" [ref=e529]
                - cell "✓" [ref=e530]
              - row "Snacks Included ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓" [ref=e531]:
                - rowheader "Snacks Included" [ref=e532]:
                  - strong [ref=e533]: Snacks Included
                - cell "✓" [ref=e534]
                - cell "✓" [ref=e535]
                - cell "✓" [ref=e536]
                - cell "✓" [ref=e537]
                - cell "✓" [ref=e538]
                - cell "✓" [ref=e539]
                - cell "✓" [ref=e540]
                - cell "✓" [ref=e541]
        - generic [ref=e543]:
          - heading "Frequently Asked Questions" [level=2] [ref=e545]
          - generic [ref=e546]:
            - generic [ref=e547]:
              - button "Which package should I choose?" [ref=e548]:
                - generic [ref=e549]: Which package should I choose?
                - generic [ref=e550]: ▼
              - paragraph [ref=e551]: Tiers are named in solar-system order from Mercury (initial assessment) through Neptune (our flagship programme). Earth is our most popular core intervention (9 hours). Saturn suits deeper, ongoing behavioural needs. Choose based on hours, support intensity, and reporting depth; we can advise on a call.
            - generic [ref=e552]:
              - button "Can I extend a package?" [ref=e553]:
                - generic [ref=e554]: Can I extend a package?
                - generic [ref=e555]: ▼
              - paragraph [ref=e556]: Yes. Packages can be extended with additional hours. We recommend reviewing progress at the end of each package and agreeing next steps together.
            - generic [ref=e557]:
              - button "What if my circumstances change?" [ref=e558]:
                - generic [ref=e559]: What if my circumstances change?
                - generic [ref=e560]: ▼
              - paragraph [ref=e561]: We're flexible. If a young person's needs change mid-programme, we can adjust the intervention plan. Contact us to discuss options.
            - generic [ref=e562]:
              - button "Do you offer additional support costs?" [ref=e563]:
                - generic [ref=e564]: Do you offer additional support costs?
                - generic [ref=e565]: ▼
              - paragraph [ref=e566]: Package fees include transport to sessions. Specialist activities beyond the agreed plan, or extra formal reports, may have additional costs. Anything extra is agreed in advance with full transparency.
            - generic [ref=e567]:
              - button "How do payment terms work?" [ref=e568]:
                - generic [ref=e569]: How do payment terms work?
                - generic [ref=e570]: ▼
              - paragraph [ref=e571]: Single sessions are paid in full. Block bookings (packages) are due within 14 days of invoice. We offer flexible payment arrangements for specific circumstances.
            - generic [ref=e572]:
              - button "What happens after a package ends?" [ref=e573]:
                - generic [ref=e574]: What happens after a package ends?
                - generic [ref=e575]: ▼
              - paragraph [ref=e576]: We provide detailed recommendations and follow-up support. Many young people continue with extended or different packages based on progress and evolving needs.
            - generic [ref=e577]:
              - button "Can packages be customized?" [ref=e578]:
                - generic [ref=e579]: Can packages be customized?
                - generic [ref=e580]: ▼
              - paragraph [ref=e581]: Absolutely. If our standard packages don't perfectly fit your needs, we can discuss custom interventions. Contact us to explore options.
            - generic [ref=e582]:
              - button "What's included in the cost?" [ref=e583]:
                - generic [ref=e584]: What's included in the cost?
                - generic [ref=e585]: ▼
              - paragraph [ref=e586]: Cost includes the mentor's time, DBS checking, training, supervision, transport to sessions, reports where applicable, and ongoing communication with referrers.
        - generic [ref=e591]:
          - generic [ref=e592]:
            - paragraph [ref=e593]: Take the next step
            - heading "Ready to Invest in Change?" [level=2] [ref=e594]
          - generic [ref=e595]:
            - paragraph [ref=e596]: Every young person deserves the chance to thrive. Let's find the right package and mentoring approach for your situation.
            - generic [ref=e597]:
              - link "Make a Referral" [ref=e598]:
                - /url: /referral
              - link "Talk to Our Team" [ref=e599]:
                - /url: /contact
              - link "View Services" [ref=e600]:
                - /url: /services
      - generic "Programme photography strip" [ref=e601]:
        - generic [ref=e603]:
          - figure [ref=e604]:
            - img "Young person taking part in outdoor sports support" [ref=e605]
          - figure [ref=e606]:
            - img "One-to-one fitness and wellbeing session" [ref=e607]
          - figure [ref=e608]:
            - img "Supported community access and travel" [ref=e609]
          - figure [ref=e610]:
            - img "Behavioural management and goal-setting support" [ref=e611]
          - figure [ref=e612]:
            - img "Mentoring and coaching conversation" [ref=e613]
          - figure [ref=e614]:
            - img "Family support and relationship-building session" [ref=e615]
          - figure [ref=e616]:
            - img "SEN and education support activity" [ref=e617]
          - figure [ref=e618]:
            - img "Young person taking part in outdoor sports support" [ref=e619]
          - figure [ref=e620]:
            - img "One-to-one fitness and wellbeing session" [ref=e621]
          - figure [ref=e622]:
            - img "Supported community access and travel" [ref=e623]
          - figure [ref=e624]:
            - img "Behavioural management and goal-setting support" [ref=e625]
          - figure [ref=e626]:
            - img "Mentoring and coaching conversation" [ref=e627]
          - figure [ref=e628]:
            - img "Family support and relationship-building session" [ref=e629]
          - figure [ref=e630]:
            - img "SEN and education support activity" [ref=e631]
      - generic [ref=e633]:
        - generic [ref=e634]:
          - generic [ref=e635]:
            - link "CAMS Services" [ref=e636]:
              - /url: /
              - img "CAMS Services" [ref=e637]
            - paragraph [ref=e638]: Structured mentoring and intervention for young people across the UK, safeguarding-led, relationship-first, and built for real-world progress.
          - generic [ref=e639]:
            - generic [ref=e640]:
              - heading "Quick links" [level=4] [ref=e641]
              - list [ref=e642]:
                - listitem [ref=e643]:
                  - link "About Us" [ref=e644]:
                    - /url: /about
                - listitem [ref=e645]:
                  - link "Our Services" [ref=e646]:
                    - /url: /services
                - listitem [ref=e647]:
                  - link "Packages" [ref=e648]:
                    - /url: /packages
                - listitem [ref=e649]:
                  - link "Our Team" [ref=e650]:
                    - /url: /trainers
                - listitem [ref=e651]:
                  - link "Blog & Resources" [ref=e652]:
                    - /url: /blog
                - listitem [ref=e653]:
                  - link "FAQs" [ref=e654]:
                    - /url: /faq
            - generic [ref=e655]:
              - heading "Families" [level=4] [ref=e656]
              - list [ref=e657]:
                - listitem [ref=e658]:
                  - link "Parent sign in" [ref=e659]:
                    - /url: /login
                - listitem [ref=e660]:
                  - link "Parent sign up" [ref=e661]:
                    - /url: /register
                - listitem [ref=e662]:
                  - link "Make a referral" [ref=e663]:
                    - /url: /contact
                - listitem [ref=e664]:
                  - link "Contact" [ref=e665]:
                    - /url: /contact
            - generic [ref=e666]:
              - heading "Partners" [level=4] [ref=e667]
              - list [ref=e668]:
                - listitem [ref=e669]:
                  - link "Trainer sign in" [ref=e670]:
                    - /url: /login
                - listitem [ref=e671]:
                  - link "School partnerships" [ref=e672]:
                    - /url: /contact
                - listitem [ref=e673]:
                  - link "Intervention packages" [ref=e674]:
                    - /url: /packages
                - listitem [ref=e675]:
                  - link "About CAMS" [ref=e676]:
                    - /url: /about
            - generic [ref=e677]:
              - heading "Organisation" [level=4] [ref=e678]
              - list [ref=e679]:
                - listitem [ref=e680]:
                  - link "Become a trainer" [ref=e681]:
                    - /url: /become-a-trainer
                - listitem [ref=e682]:
                  - link "Policies" [ref=e683]:
                    - /url: /policies
                - listitem [ref=e684]:
                  - link "FAQs" [ref=e685]:
                    - /url: /faq
                - listitem [ref=e686]:
                  - link "Contact" [ref=e687]:
                    - /url: /contact
        - generic [ref=e688]:
          - paragraph [ref=e689]: © 2026 CAMS Services Ltd. All rights reserved.
          - navigation "Legal" [ref=e690]:
            - link "Policies" [ref=e691]:
              - /url: /policies
            - link "FAQ" [ref=e692]:
              - /url: /faq
            - link "Contact" [ref=e693]:
              - /url: /contact
      - generic [ref=e695]:
        - generic:
          - link "Contact us":
            - /url: /contact
            - img
            - generic: Contact us
          - link "Book call":
            - /url: /contact
            - img
            - generic: Book call
        - button "Open quick actions" [ref=e696]:
          - img [ref=e697]
      - generic [ref=e700]:
        - generic [ref=e701]:
          - heading "Cookies and your privacy" [level=2] [ref=e702]
          - paragraph [ref=e703]:
            - text: We use essential cookies so the site works. With your permission we may also use optional cookies for preferences, usage statistics, or relevant updates. Read our
            - link "policies" [ref=e704]:
              - /url: /policies
            - text: for details.
        - generic [ref=e705]:
          - button "Accept all" [ref=e706]
          - button "Essential only" [ref=e707]
          - button "Manage preferences" [ref=e708]
  - button "Open Next.js Dev Tools" [ref=e714] [cursor=pointer]:
    - img [ref=e715]
  - alert [ref=e718]
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