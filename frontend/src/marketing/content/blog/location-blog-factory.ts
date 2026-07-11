import type { MarketingBlogPostDTO } from '@/marketing/types/blog';
import { CAMS_UNSPLASH_PHOTO } from '@/marketing/mock/cams-unsplash';
import { formatReadTimeLabel } from '@/marketing/content/blog/seo-blog-helpers';
import {
  articleToc,
  endArticleCta,
  faqSection,
  midArticleCta,
  OUTBOUND,
} from '@/marketing/content/blog/article-blocks';
import { LOCATION_AREAS } from '@/marketing/content/locations';
import type { LocationArea } from '@/marketing/content/locations/types';
import { SERVICE_LOCATION_KEYWORDS } from '@/marketing/content/locations/service-location-keywords';
import { ROUTES } from '@/shared/utils/routes';

const COVER_BY_INDEX = [
  CAMS_UNSPLASH_PHOTO.community,
  CAMS_UNSPLASH_PHOTO.mentoring,
  CAMS_UNSPLASH_PHOTO.sen,
  CAMS_UNSPLASH_PHOTO.routine,
] as const;

function areaServiceLinks(area: LocationArea): string {
  return SERVICE_LOCATION_KEYWORDS.filter((s) =>
    area.serviceSlugs.includes(s.slug)
  )
    .map(
      (s) =>
        `[${s.label} in ${area.name}](${ROUTES.AREA_SERVICE_BY_SLUG(area.slug, s.slug)})`
    )
    .join(', ');
}

function buildLocationBlogContent(area: LocationArea): string {
  const neighbourhoods = area.keyAreas.join(', ');
  const sample = area.keyAreas[0] ?? area.name;
  const focus = `chaperone services ${area.name}`;
  const hqNote = area.isHeadquarters
    ? ' CAMS services Ltd is headquartered in Greenford, Ealing, so routing and practitioner continuity are especially strong across this borough.'
    : '';

  const localParagraphs = area.paragraphs.join('\n\n');

  const faqItems = [
    {
      q: `Do you provide chaperone services in ${area.name}?`,
      a: `Yes. CAMS delivers chaperone services and chaperone service in ${area.name} for contact centre journeys, school runs and foster placement moves across ${sample} and wider ${area.name}. See our [${area.name} area page](${ROUTES.AREA_BY_SLUG(area.slug)}) for neighbourhoods and referral routes.`,
    },
    {
      q: `Is youth mentoring available in ${area.name}?`,
      a: `Yes. One-to-one youth mentoring and mentoring services are delivered across ${area.name} with DBS-checked practitioners. Sessions can combine with transport where assessments support a consistent adult.`,
    },
    {
      q: `Can you provide SEND support in ${area.name}?`,
      a: `Yes. SEND support services in ${area.name} include school engagement, autism and ADHD-informed sessions, and advocacy aligned with EHCP outcomes where commissioned.`,
    },
    {
      q: `Which neighbourhoods in ${area.name} do you cover?`,
      a: `We plan sessions and journeys across ${area.name} including ${neighbourhoods}. Share postcodes when you refer so we can confirm routing and practitioner availability.`,
    },
    {
      q: `How do schools and local authorities refer in ${area.name}?`,
      a: `Use our [online referral form](${ROUTES.REFERRAL}) or [contact page](${ROUTES.CONTACT}). We respond within one working day with feasibility, safeguarding questions and recommended programmes.`,
    },
    {
      q: `Can family support be commissioned alongside chaperone services in ${area.name}?`,
      a: `Yes. Many ${area.name} packages combine [family support services](/services/routine) with transport or mentoring when home and school messaging needs to align.`,
    },
  ];

  return `
**Chaperone services ${area.name}** are among the most common search terms when a child cannot travel alone, when SEMH barriers block school attendance, or when contact weekends destabilise a placement.

Commissioners, SENCOs and foster agencies look for **chaperone services ${area.name}** that combine trained adult presence with local knowledge of ${neighbourhoods}. This guide explains how CAMS services delivers **chaperone service ${area.name}**, child transport, youth mentoring, SEND support and family support across the borough.${hqNote}

Families comparing providers should expect DBS-checked practitioners, defined handovers, factual journey notes and the option to combine programmes through [intervention packages](${ROUTES.PACKAGES}).

${articleToc([
  { label: `Why ${focus} need local providers`, anchor: 'why-chaperone-services-need-local-providers' },
  { label: `Chaperone and child transport in ${area.name}`, anchor: 'chaperone-and-child-transport' },
  { label: `Youth mentoring and SEND support`, anchor: 'youth-mentoring-and-send-support' },
  { label: `Family and behaviour support locally`, anchor: 'family-and-behaviour-support-locally' },
  { label: `Neighbourhoods and bordering areas`, anchor: 'neighbourhoods-and-bordering-areas' },
  { label: `How to refer in ${area.name}`, anchor: 'how-to-refer' },
  { label: 'Frequently asked questions', anchor: 'frequently-asked-questions' },
])}

## Why ${focus} need local providers

${localParagraphs}

**Chaperone services ${area.name}** differ from a generic taxi contract because safeguarding sits at the centre of every journey. Court-ordered contact, placement moves and SEMH-friendly school runs all require adults who understand de-escalation, handover protocols and the stress of transitions.

Local authorities publishing [children in need statistics](${OUTBOUND.childrensServices}) continue to highlight transport and mentoring as protective factors when relationships are fragile.

CAMS combines chaperone service, child transport services, youth mentoring, SEND support services and family support services through one referral route. Programme pages for this borough: ${areaServiceLinks(area)}.

Read national commissioning standards in our [chaperone services UK](/blog/chaperone-services-uk), [child transport services](/blog/child-transport-services-uk) and [SEND support services](/blog/send-support-services) guides.

${midArticleCta(
  `Discuss chaperone services in ${area.name}`,
  `Submit a referral with postcodes, schedules and safeguarding context. We confirm feasibility for chaperone, transport, mentoring or SEND cover across ${area.name}.`
)}

## Chaperone and child transport in ${area.name}

**Chaperone service ${area.name}** covers supervised child transport when a young person cannot travel alone. Typical journeys include contact centre transport, SEMH-friendly school runs, foster placement moves and appointments.

Unlike a taxi booking, CAMS chaperone services include trained adult presence, defined handovers and de-escalation support. Our [chaperone services landing page](${ROUTES.CHAPERONE_SERVICES}) explains national standards; the [${area.name} borough hub](${ROUTES.AREA_BY_SLUG(area.slug)}) lists local neighbourhoods.

For court-ordered contact, see [contact centre transport](/blog/contact-centre-transport). For school-specific planning, see [school transport support](/blog/school-transport-support-semh).

### Safeguarding on local journeys

Every journey ends with a defined handover: who receives the child, where, and under what conditions. Factual journey notes support social workers and reviewing officers where commissioned. The [SCIE safeguarding hub](${OUTBOUND.safeguarding}) reminds all practitioners that transport is safeguarding infrastructure, not logistics alone.

Supervised contact arrangements may reference [contact order legislation](${OUTBOUND.contactOrders}); CAMS staff follow referrer instructions and do not facilitate adult conflict at handover.

### When commissioners choose chaperone services over standard transport

Panels ask whether the child can travel on public transport, whether a parent can escort, and whether risk requires a trained adult. **Chaperone services ${area.name}** are usually approved when:

- Care proceedings or contact orders require neutral handovers
- SEMH or SEND needs make independent travel unsafe
- Placement instability means the child needs the same escort each week
- Previous taxi contracts failed to document incidents or refusals

## Youth mentoring and SEND support

**Youth mentoring ${area.name}** helps children build confidence, attendance and decision-making with a consistent DBS-checked mentor. **SEND support services ${area.name}** align with school targets and EHCP outcomes where commissioned.

Many ${area.name} cases combine mentoring with transport so the same practitioner anchors difficult weeks. Read [youth mentoring services](/blog/youth-mentoring-services) and [family support services](/blog/family-support-services-uk) for package design ideas.

The [SEND Code of Practice](${OUTBOUND.sendCode}) recognises that support may need to wrap around the school day, not only sit inside the classroom. Parents navigating assessments can also use [IPSEA EHCP guidance](${OUTBOUND.ehcpGuide}) alongside school SENCO advice.

### School attendance and SEMH

Mondays after contact weekends and mornings after placement moves are high-risk for refusal. Combining [behaviour support](/services/goals) with mentoring can stabilise regulation before the school gate.

## Family and behaviour support locally

**Family support services ${area.name}** help parents, carers and young people align communication, boundaries and routines. This is often commissioned alongside **chaperone services ${area.name}** when home and school give conflicting messages.

Foster carers may need coaching around contact cycles; read [foster placement support](/blog/foster-placement-support) for how transport, mentoring and carer work fit together.

## Neighbourhoods and bordering areas

CAMS plans sessions and journeys across **${neighbourhoods}**. ${area.notes}

Bordering boroughs may be relevant when placements or schools cross boundaries. Visit [service areas](${ROUTES.AREAS}) for neighbouring hubs and deep pages such as [chaperone & transport in ${area.name}](${ROUTES.AREA_SERVICE_BY_SLUG(area.slug, 'community')}).

## How to refer in ${area.name}

1. Complete the [referral form](${ROUTES.REFERRAL}) with postcodes, schedule and behaviour notes.
2. Include court orders, EHCP extracts or contact plans where relevant.
3. Expect a response within one working day with feasibility and safeguarding questions.

Schools and local authorities can also use the [contact page](${ROUTES.CONTACT}) for commissioning discussions and panel paperwork.

### Schools, IFAs and local authority routes in ${area.name}

Schools often commission **chaperone services ${area.name}** when a pupil's SEMH profile makes independent travel unsafe. IFAs and children's services teams may fund transport alongside mentoring when a care plan names supervised contact or placement stability goals.

Virtual school heads may join panel calls when attendance affects permanence. Share court orders, EHCP Section F extracts and behaviour support plans at referral so CAMS can recommend the right mix of [community transport](${ROUTES.AREA_SERVICE_BY_SLUG(area.slug, 'community')}), [mentoring](${ROUTES.AREA_SERVICE_BY_SLUG(area.slug, 'mentoring')}) and [SEND support](${ROUTES.AREA_SERVICE_BY_SLUG(area.slug, 'sen')}).

### What to include in a ${area.name} referral

Strong referrals typically include postcodes, bell times, contact centre slots, triggers, calming strategies and named handover adults. Photos of meeting points are helpful for complex sites. Avoid expecting practitioners to mediate adult conflict; neutral handover locations protect the child.

Read the 2026 trend piece on [SEND transport commissioning](/blog/send-transport-ehcp-commissioning-2026) if travel is the primary barrier to attendance.

${endArticleCta(
  `Commission chaperone services in ${area.name}`,
  `CAMS services Ltd delivers chaperone services, transport, mentoring, SEND and family support across ${area.name}. Submit a referral or speak to our team about framework agreements.`
)}

## Frequently asked questions

${faqSection(faqItems)}
`.trim();
}

export function buildLocationBlogArticle(
  area: LocationArea,
  index: number
): MarketingBlogPostDTO {
  const slug = `blog/child-support-${area.slug}`;
  const focusKeyword = `chaperone services ${area.name}`;
  const title = `Chaperone & Child Support in ${area.name} | CAMS services`;
  const content = buildLocationBlogContent(area);
  const day = 10 + (index % 20);
  const month = index < 7 ? '06' : '07';

  return {
    slug,
    focusKeyword,
    metaTitle: `Chaperone services ${area.name} | Transport & mentoring`,
    metaDescription: `Chaperone services ${area.name}: child transport, youth mentoring and SEND support. DBS-checked practitioners for schools and local authorities. Refer CAMS services.`,
    title,
    excerpt: `Chaperone services ${area.name}: child transport, youth mentoring and SEND support across ${area.keyAreas.slice(0, 3).join(', ')}.`,
    category: 'Service areas',
    publishedLabel: `July ${day}, 2026`,
    publishedAt: `2026-${month}-${String(day).padStart(2, '0')}T09:00:00.000Z`,
    readTimeLabel: formatReadTimeLabel(content),
    icon: 'mapPin',
    coverPhotoId: COVER_BY_INDEX[index % COVER_BY_INDEX.length],
    coverImageAlt: `Chaperone services ${area.name} - child transport and mentoring with CAMS services`,
    content,
    tags: [
      focusKeyword,
      `chaperone service ${area.name}`,
      `child transport ${area.name}`,
      `youth mentoring ${area.name}`,
      `SEND support ${area.name}`,
      area.name,
    ],
    faq: [
      {
        question: `Do you provide chaperone services in ${area.name}?`,
        answer: `Yes. CAMS delivers chaperone services and child transport across ${area.name} for schools, IFAs and local authorities.`,
      },
      {
        question: `Which neighbourhoods in ${area.name} do you cover?`,
        answer: `We cover ${area.keyAreas.join(', ')} and wider ${area.name}. Share postcodes at referral.`,
      },
    ],
  };
}

/** Phase 2: one SEO article per borough/town, linking to /areas/{slug} and service×location pages. */
export const LOCATION_BLOG_ARTICLES: readonly MarketingBlogPostDTO[] = LOCATION_AREAS.map(
  (area, index) => buildLocationBlogArticle(area, index)
);
