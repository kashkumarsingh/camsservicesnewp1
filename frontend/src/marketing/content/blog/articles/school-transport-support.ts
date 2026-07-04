import type { MarketingBlogPostDTO } from "@/marketing/types/blog";
import { CAMS_UNSPLASH_PHOTO } from "@/marketing/mock/cams-unsplash";
import { formatReadTimeLabel } from "@/marketing/content/blog/seo-blog-helpers";

const content = `
**School transport support** is critical when a young person cannot ride mainstream buses — because of SEMH needs, care status, exclusion risk or anxiety after trauma. This guide explains how commissioners design **school transport support** that protects attendance, reduces exclusions and keeps mornings predictable.

## In this article

- [When mainstream school transport is not enough](#when-mainstream-school-transport-is-not-enough)
- [SEMH-aware morning routines](#semh-aware-morning-routines)
- [Linking transport to SEND and mentoring](#linking-transport-to-send-and-mentoring)
- [Handover with schools and carers](#handover-with-schools-and-carers)
- [Measuring impact on attendance](#measuring-impact-on-attendance)
- [Frequently asked questions](#frequently-asked-questions)

<h2 id="when-mainstream-school-transport-is-not-enough">When mainstream school transport is not enough</h2>

Local authorities fund mainstream **school transport support** when distance and eligibility criteria are met. However, many children need **dedicated** transport because:

- Anxiety or school avoidance makes shared buses overwhelming
- Behaviour incidents put other passengers at risk
- Foster or care placements change school mid-year
- SEMH needs require a trusted adult, not only a seat

CAMS provides specialist runs as part of wider [child transport services](/blog/child-transport-services-uk) and [chaperone services UK](/blog/chaperone-services-uk).

<h2 id="semh-aware-morning-routines">SEMH-aware morning routines</h2>

Mornings are flashpoints. Effective **school transport support** includes:

### Predictable pickup

Same time window, same vehicle where possible, advance text to carers when delays occur.

### Low-arousal communication

Short sentences, calm tone, no lecture on the way to school when the child is already dysregulated.

### Sensory considerations

Noise, smell and seating position matter — especially for autistic passengers. See [SEND support services](/blog/send-support-services).

### Regulation before gate

Five minutes of calm in the car park beats rushing a distressed child through the school door. Staff agree gate protocols with SENCOs in advance.

<h2 id="linking-transport-to-send-and-mentoring">Linking transport to SEND and mentoring</h2>

Transport alone can become a taxi service. Lasting attendance gains usually need teaching-and-learning or emotional support too.

| Package element | Attendance impact |
|---|---|
| Dedicated school run | Removes barrier of getting to site |
| [Mentoring](/services/mentoring) | Builds skills to stay once arrived |
| [SEN support](/services/sen) | Addresses classroom barriers |
| [Behaviour support](/services/goals) | Reduces incident cycles |

Explore combined options in our [intervention packages](/packages) catalogue.

<h2 id="handover-with-schools-and-carers">Handover with schools and carers</h2>

Clear handover protects everyone:

1. **Named school contact** receives the child at agreed location (reception, inclusion hub, pastoral office)
2. **Foster carers or parents** get factual journey notes when commissioned
3. **Social workers** see patterns — refusals, late arrivals, triggers — not only incidents
4. **Residential homes** coordinate uniform, medication and equipment before pickup

When court-ordered contact sits mid-week, align transport with [contact centre transport](/blog/contact-centre-transport) so weekends do not undo weekday progress.

<h2 id="measuring-impact-on-attendance">Measuring impact on attendance</h2>

Commissioners should track:

- Sessions attended vs sessions commissioned
- Late arrivals and early pickups
- Exclusion days following transport days
- Young person's self-report on morning stress (simple 1–5 scale)

Improvement is rarely linear. A child who attends three days weekly after months of zero is progress worth defending at annual review.

**Commission school transport support:** [Make a referral](/referral) or [contact CAMS](/contact).

<h2 id="frequently-asked-questions">Frequently asked questions</h2>

### Is school transport support only for children with EHCPs?

No. SEMH, care status and medical needs can justify specialist transport without an EHCP, depending on local policy.

### Can the transport worker mentor at school?

Sometimes, where schools agree on-site shadowing and risk assessments cover dual roles. Otherwise mentoring is booked separately.

### What vehicle types do you use?

Saloon cars, MPVs and accessible vehicles depending on passenger needs and equipment.

### Do you cover alternative provision and college routes?

Yes. Post-16 routes and AP sites are commissioned similarly with age-appropriate safeguarding.
`.trim();

export const schoolTransportSupportArticle: MarketingBlogPostDTO = {
  slug: "blog/school-transport-support-semh",
  focusKeyword: "school transport support",
  metaTitle: "School Transport Support for SEMH & Behaviour Needs",
  metaDescription:
    "School transport support for SEMH, anxiety and care-experienced pupils. Dedicated UK school runs with safeguarding-trained staff. Refer CAMS Services.",
  title: "School Transport Support for Children With SEMH and Behavioural Needs",
  excerpt:
    "When mainstream buses are not enough — how dedicated school transport support protects attendance with SEMH-aware routines and school handovers.",
  category: "Education",
  publishedLabel: "April 28, 2026",
  publishedAt: "2026-04-28T09:00:00.000Z",
  readTimeLabel: formatReadTimeLabel(content),
  icon: "graduationCap",
  coverPhotoId: CAMS_UNSPLASH_PHOTO.inclusiveLearning,
  coverImageAlt: "School transport support worker helping a young person arrive calmly at school in the UK",
  content,
  tags: [
    "school transport support",
    "SEMH",
    "school attendance",
    "SEND transport",
    "child transport services",
  ],
  faq: [
    {
      question: "Is school transport support only for children with EHCPs?",
      answer:
        "No. SEMH needs, care status and medical requirements can justify specialist transport depending on local authority policy.",
    },
    {
      question: "Can the transport worker mentor at school?",
      answer:
        "Sometimes, where schools agree on-site shadowing and risk assessments cover dual roles. Otherwise mentoring is commissioned separately.",
    },
    {
      question: "What vehicle types do you use?",
      answer:
        "Saloon cars, MPVs and accessible vehicles depending on passenger needs, mobility equipment and route length.",
    },
    {
      question: "Do you cover alternative provision and college routes?",
      answer:
        "Yes. CAMS provides post-16 and alternative provision routes with age-appropriate safeguarding.",
    },
  ],
};
