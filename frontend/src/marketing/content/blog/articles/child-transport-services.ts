import type { MarketingBlogPostDTO } from "@/marketing/types/blog";
import { CAMS_UNSPLASH_PHOTO } from "@/marketing/mock/cams-unsplash";
import { formatReadTimeLabel } from "@/marketing/content/blog/seo-blog-helpers";

const content = `
Reliable **child transport services** are essential when a young person cannot use standard school buses or family cars safely — whether because of care proceedings, SEND needs, behaviour or placement instability. This guide explains how UK commissioners plan **child transport services**, what good looks like on the ground, and how transport links to wider support.

## In this article

- [What child transport services cover](#what-child-transport-services-cover)
- [Types of journeys commissioners request](#types-of-journeys-commissioners-request)
- [Risk assessment and journey planning](#risk-assessment-and-journey-planning)
- [Staffing and vehicle standards](#staffing-and-vehicle-standards)
- [Linking transport with mentoring](#linking-transport-with-mentoring)
- [Frequently asked questions](#frequently-asked-questions)

<h2 id="what-child-transport-services-cover">What child transport services cover</h2>

**Child transport services** provide planned movement of children and young people with appropriate supervision. CAMS Services delivers:

- Home-to-school and home-to-nursery routes
- Foster placement and residential transitions
- Contact centre and supervised family time journeys
- Community access for appointments, activities and wellbeing sessions
- Emergency or short-notice cover when placements change

Every journey is scoped to the individual. A five-year-old with autism may need a quiet vehicle and visual timetable; a teenager in care may need an adult who understands conflict de-escalation after contact sessions.

Explore programme detail on our [Community Access and Transport Services](/services/community) page.

<h2 id="types-of-journeys-commissioners-request">Types of journeys commissioners request</h2>

### School transport support

When exclusion, anxiety or SEMH needs make mainstream school transport unsuitable, commissioners request dedicated runs. Read our in-depth guide to [school transport support for SEMH](/blog/school-transport-support-semh).

### Contact centre transport

Neutral, punctual transport protects children from adult conflict. Our [contact centre transport](/blog/contact-centre-transport) article covers handovers and documentation.

### Foster placement support

Moves between carers are high-stress events. Transport staff should know comfort items, triggers and who receives the child at the door. See [foster placement support](/blog/foster-placement-support) for the full placement pathway.

### Accompanied appointments

Some children need an adult in the room — not just in the car — for health, CAMHS or review meetings. Packages can combine transport with [mentoring and coaching](/services/mentoring).

<h2 id="risk-assessment-and-journey-planning">Risk assessment and journey planning</h2>

Backlinko and Semrush both stress that trustworthy content answers real buyer questions. For **child transport services**, commissioners ask:

1. **What happens if the child refuses to leave the vehicle?**
2. **Who is authorised to receive them at drop-off?**
3. **How are route changes communicated?**
4. **What notes are shared with the social worker?**

CAMS completes risk assessments before the first journey. We capture allergies, restraint policies (we do not use physical restraint unless legally required and trained), communication preferences and prohibited contact persons.

Journey plans include backup routes, rest stops for long distances and named escalation contacts. When court orders specify times, we treat punctuality as a safeguarding issue — late arrival can derail supervised contact.

<h2 id="staffing-and-vehicle-standards">Staffing and vehicle standards</h2>

Quality **child transport services** depend on people, not just vehicles:

- Enhanced DBS clearance and safeguarding training
- First-aid awareness and lone-working procedures
- Experience with SEND, trauma and care-experienced young people
- Clear ID and CAMS-branded identification for handovers

Vehicles are maintained to legal standards, with child seats or boosters where required. For high-anxiety passengers, we match calmer drivers and allow familiar staff across repeated journeys so trust can build.

<h2 id="linking-transport-with-mentoring">Linking transport with mentoring</h2>

Transport-only packages solve logistics. Transport **plus** mentoring solves behaviour, attendance and emotional regulation over time. Many local authorities commission blended packages from our [intervention packages](/packages) catalogue — for example three mentoring sessions weekly with school run cover on the same days so one trusted adult anchors the week.

If you are a parent or foster carer struggling with morning routines, [family support services](/blog/family-support-services-uk) may help align home and transport expectations.

**Ready to commission?** [Make a referral](/referral) or [speak to CAMS](/contact) about child transport services in your area.

<h2 id="frequently-asked-questions">Frequently asked questions</h2>

### Are child transport services the same as taxis?

No. Taxis move passengers from A to B. Child transport services include safeguarding-trained staff, risk assessments, referrer reporting and handover protocols required by children's services.

### Can transport cover multiple counties?

Yes. CAMS operates UK-wide. Long-distance foster matching and out-of-area schools are common reasons for cross-county routes.

### What information do you need to start?

Placement address, schedule, behaviour and health notes, authorised recipients at drop-off, referrer contact and any court orders affecting contact or travel.

### Do you transport children with EHCPs?

Yes. We work with SEND teams on [SEND support services](/blog/send-support-services) including tailored school runs and community access.
`.trim();

export const childTransportServicesArticle: MarketingBlogPostDTO = {
  slug: "blog/child-transport-services-uk",
  focusKeyword: "child transport services",
  metaTitle: "Child Transport Services UK: Safe School & Contact Runs",
  metaDescription:
    "Child transport services for school, contact centres and foster placements. Safeguarding-first UK journeys with risk assessments and trained escorts. Refer CAMS.",
  title: "Child Transport Services: Safe, Reliable Journeys for Children and Young People",
  excerpt:
    "A commissioner’s guide to child transport services — journey types, risk assessments, staffing standards and how transport links to mentoring support.",
  category: "Transport",
  publishedLabel: "June 5, 2026",
  publishedAt: "2026-06-05T09:00:00.000Z",
  readTimeLabel: formatReadTimeLabel(content),
  icon: "mapPin",
  coverPhotoId: CAMS_UNSPLASH_PHOTO.community,
  coverImageAlt: "Safeguarding-trained driver providing child transport services on a school route in the UK",
  content,
  tags: [
    "child transport services",
    "school transport support",
    "child escort services",
    "foster placement transport",
    "safeguarding",
  ],
  faq: [
    {
      question: "Are child transport services the same as taxis?",
      answer:
        "No. Child transport includes safeguarding-trained staff, risk assessments, handover protocols and referrer reporting — not just point-to-point travel.",
    },
    {
      question: "Can transport cover multiple counties?",
      answer:
        "Yes. CAMS provides UK-wide child transport for out-of-area schools, foster placements and contact arrangements.",
    },
    {
      question: "What information do you need to start?",
      answer:
        "Addresses, schedule, behaviour and health notes, authorised drop-off contacts, referrer details and any relevant court orders.",
    },
    {
      question: "Do you transport children with EHCPs?",
      answer:
        "Yes. We deliver SEND-aware transport alongside dedicated SEND support services for learning and school engagement.",
    },
  ],
};
