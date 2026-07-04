import type { MarketingBlogPostDTO } from "@/marketing/types/blog";
import { CAMS_UNSPLASH_PHOTO } from "@/marketing/mock/cams-unsplash";
import { formatReadTimeLabel } from "@/marketing/content/blog/seo-blog-helpers";

const content = `
**SEND support services** help children and young people with special educational needs and disabilities access learning, regulate emotions and participate in school life. For parents, SENCOs and local authority SEND teams, the right one-to-one support can prevent placement breakdown and reduce crisis interventions.

## In this article

- [What SEND support services include](#what-send-support-services-include)
- [Autism, ADHD and SEMH-informed practice](#autism-adhd-and-semh-informed-practice)
- [School engagement and attendance](#school-engagement-and-attendance)
- [Working with EHCP outcomes](#working-with-ehcp-outcomes)
- [Transport and community access for SEND](#transport-and-community-access-for-send)
- [Frequently asked questions](#frequently-asked-questions)

<h2 id="what-send-support-services-include">What SEND support services include</h2>

**SEND support services** at CAMS are delivered one-to-one through our [SEN and Education Support](/services/sen) programme. Typical elements include:

- **Learning support** aligned with school targets and EHCP outcomes
- **Sensory-aware session structure** with movement breaks and visual planning
- **Communication and advocacy** so the young person can express needs safely
- **Transition support** between classes, schools or key stages
- **Collaboration** with families, SENCOs and external therapists

Unlike generic tuition, SEND support services recognise that behaviour is often communication. A child refusing literacy work may be overwhelmed by noise, hungry, or carrying shame from yesterday's exclusion.

<h2 id="autism-adhd-and-semh-informed-practice">Autism, ADHD and SEMH-informed practice</h2>

### Autism

Predictable routines, literal language and advance warning of changes reduce anxiety. Our practitioners use social stories, timers and low-arousal environments where possible.

### ADHD

Shorter task chunks, immediate feedback and movement integrated into sessions improve engagement. We avoid framing restlessness as defiance.

### SEMH

Many children with SEMH needs have experienced adversity. Trauma-informed practice — calm tone, choice, repair after conflict — sits at the core of our [behavioural management](/services/goals) pathway.

Yoast-style readability means short paragraphs and clear headings. Semrush topical depth means we go beyond labels: support must match the **individual** profile, not a diagnosis alone.

<h2 id="school-engagement-and-attendance">School engagement and attendance</h2>

School avoidance is rising. **SEND support services** can:

1. Meet the young person at home to rebuild morning routines before returning to site
2. Accompany them on [school transport](/blog/school-transport-support-semh) so the day starts with a trusted adult
3. Provide in-school shadowing where commissioners agree partial timetable reintegration
4. Debrief with parents through [family support services](/blog/family-support-services-uk)

Attendance improves when the child feels safe — not when pressure increases without support.

<h2 id="working-with-ehcp-outcomes">Working with EHCP outcomes</h2>

Commissioners often ask how one-to-one hours map to EHCP sections. CAMS aligns session goals with:

- **Section B** — special educational needs descriptions
- **Section F** — provision such as hours, grouping and delivery model
- **Outcome targets** — measurable steps reviewed termly

We welcome multi-agency meetings and provide progress summaries where commissioned. Transparent reporting helps local authorities defend provision at annual reviews.

<h2 id="transport-and-community-access-for-send">Transport and community access for SEND</h2>

SEND is not only a classroom issue. Community trips build independence, social confidence and life skills. Our [Community Access and Transport Services](/services/community) combine safe travel with coached community participation — practising bus skills, shopping routines or leisure activities with an adult who knows the young person's triggers.

For wider transport commissioning context, see [child transport services](/blog/child-transport-services-uk).

**Start a conversation:** [Make a referral](/referral) or view [packages](/packages) that combine SEND hours with mentoring.

<h2 id="frequently-asked-questions">Frequently asked questions</h2>

### Can SEND support services be funded through an EHCP?

Often yes — via Section F provision or personal budgets depending on local policy. We work with SEND teams and parents to scope hours that match the plan.

### Do you support children not yet on an EHCP?

Yes. Schools and early-help teams commission support while assessments are in progress, especially when attendance is at risk.

### Can the same worker provide transport and SEND support?

Yes, where risk assessments support it. A consistent adult across transport and mentoring can accelerate trust.

### What qualifications do SEND practitioners hold?

Team members bring youth work, education support and safeguarding experience; role-specific training covers autism, ADHD and trauma-informed practice. Enhanced DBS clearance is standard.
`.trim();

export const sendSupportServicesArticle: MarketingBlogPostDTO = {
  slug: "blog/send-support-services",
  focusKeyword: "SEND support services",
  metaTitle: "SEND Support Services: One-to-One UK Help for SEND",
  metaDescription:
    "SEND support services for autism, ADHD and SEMH. School engagement, EHCP-aligned one-to-one help and safe transport across the UK. Refer CAMS Services.",
  title: "SEND Support Services: Practical One-to-One Help for Children With Additional Needs",
  excerpt:
    "How SEND support services strengthen school engagement, EHCP delivery and community access — with autism, ADHD and SEMH-informed one-to-one practice.",
  category: "SEND",
  publishedLabel: "May 28, 2026",
  publishedAt: "2026-05-28T09:00:00.000Z",
  readTimeLabel: formatReadTimeLabel(content),
  icon: "puzzle",
  coverPhotoId: CAMS_UNSPLASH_PHOTO.sen,
  coverImageAlt: "One-to-one SEND support services session supporting a young person with learning in the UK",
  content,
  tags: [
    "SEND support services",
    "SEN support",
    "autism support",
    "ADHD mentoring",
    "school engagement",
  ],
  faq: [
    {
      question: "Can SEND support services be funded through an EHCP?",
      answer:
        "Often yes, via Section F provision or personal budgets depending on local policy. CAMS scopes hours to match the plan and outcomes.",
    },
    {
      question: "Do you support children not yet on an EHCP?",
      answer:
        "Yes. Early-help and school teams commission support during assessment, especially when attendance or placement stability is at risk.",
    },
    {
      question: "Can the same worker provide transport and SEND support?",
      answer:
        "Yes, where risk assessments support a blended role. Consistency across transport and mentoring can build trust faster.",
    },
    {
      question: "What qualifications do SEND practitioners hold?",
      answer:
        "Practitioners bring youth work and education support experience with autism, ADHD and trauma-informed training. Enhanced DBS clearance is standard.",
    },
  ],
};
