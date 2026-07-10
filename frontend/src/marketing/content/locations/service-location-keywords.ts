/**
 * Location + service keyword catalog for area landing pages.
 * Area pages are local HUBS for all programmes — not chaperone-only.
 */

export type ServiceLocationKeyword = {
  readonly slug: string;
  readonly label: string;
  /** Primary search phrases people use with a place name */
  readonly searchPhrases: readonly string[];
  readonly servicePath: string;
};

/** Core programmes commissioners search for with "[service] [location]". */
export const SERVICE_LOCATION_KEYWORDS: readonly ServiceLocationKeyword[] = [
  {
    slug: 'community',
    label: 'Chaperone & child transport',
    searchPhrases: [
      'chaperone service',
      'chaperoning services',
      'child transport services',
      'school transport support',
      'contact centre transport',
    ],
    servicePath: '/services/community',
  },
  {
    slug: 'mentoring',
    label: 'Youth mentoring',
    searchPhrases: ['youth mentoring', 'mentoring services', 'mentor for children', 'one-to-one mentoring'],
    servicePath: '/services/mentoring',
  },
  {
    slug: 'sen',
    label: 'SEND support',
    searchPhrases: [
      'SEND support services',
      'SEN support',
      'SEND support',
      'school engagement support',
      'autism school support',
    ],
    servicePath: '/services/sen',
  },
  {
    slug: 'routine',
    label: 'Family support',
    searchPhrases: ['family support services', 'family support', 'parent coaching', 'family coaching'],
    servicePath: '/services/routine',
  },
  {
    slug: 'goals',
    label: 'Behaviour support',
    searchPhrases: ['behaviour support', 'behavioural support', 'SEMH support', 'conflict resolution support'],
    servicePath: '/services/goals',
  },
  {
    slug: 'sports-support-programme',
    label: 'Sports support',
    searchPhrases: ['sports mentoring', 'sports support programme', 'youth sports mentoring'],
    servicePath: '/services/sports-support-programme',
  },
  {
    slug: 'boxing-fitness',
    label: 'Fitness & wellbeing',
    searchPhrases: ['fitness mentoring', 'wellbeing support', 'boxing mentoring for youth'],
    servicePath: '/services/boxing-fitness',
  },
] as const;

export function serviceKeywordsForArea(placeName: string): readonly string[] {
  return SERVICE_LOCATION_KEYWORDS.flatMap((service) =>
    service.searchPhrases.map((phrase) => `${phrase} ${placeName}`)
  );
}

export function areaMetaTitle(placeName: string): string {
  return `Child support ${placeName} | Chaperone, transport & mentoring`;
}

export function areaMetaDescription(
  area: { name: string; keyAreas: readonly string[]; isHeadquarters?: boolean }
): string {
  const places = area.keyAreas.slice(0, 4).join(', ');
  const hq = area.isHeadquarters ? ' HQ Greenford.' : '';
  return `Chaperone service, child transport, youth mentoring, SEND support and family support in ${area.name} (${places}). DBS-checked practitioners for schools, IFAs and local authorities.${hq} CAMS services.`;
}

export function areaHeroTitle(placeName: string): string {
  return `Chaperone, transport & mentoring in ${placeName}`;
}

export function areaHeroSubtitle(
  area: { name: string; keyAreas: readonly string[] }
): string {
  const sample = area.keyAreas.slice(0, 3).join(', ');
  return `Chaperone service, child transport services, youth mentoring, SEND support and family support across ${area.name} including ${sample}. Safeguarding-led one-to-one provision for schools, local authorities and families.`;
}

export function buildAreaServicesFaq(
  area: { name: string; keyAreas: readonly string[] },
  keyAreaSample: string
): readonly { q: string; a: string }[] {
  const { name } = area;
  const neighbourhoods = area.keyAreas.slice(0, 5).join(', ');

  return [
    {
      q: `Do you provide chaperone service in ${name}?`,
      a: `Yes. CAMS delivers chaperone service and chaperoning services in ${name} for supervised child transport, contact centre journeys, school runs and foster placement moves across ${keyAreaSample} and wider ${name}.`,
    },
    {
      q: `Is child transport available in ${name}?`,
      a: `Yes. Our child transport services in ${name} include SEMH-friendly school transport support, contact centre runs and foster placement journeys. Each route is risk-assessed with clear handover points.`,
    },
    {
      q: `Do you offer youth mentoring in ${name}?`,
      a: `Yes. Youth mentoring and mentoring services are delivered one-to-one across ${name}. Practitioners build confidence, attendance and decision-making skills with DBS-checked, trauma-informed support.`,
    },
    {
      q: `Can you provide SEND support in ${name}?`,
      a: `Yes. SEND support services in ${name} include school engagement, autism and ADHD-informed sessions, and advocacy aligned with EHCP outcomes. We can combine SEND support with transport where assessments allow.`,
    },
    {
      q: `Do you deliver family support services in ${name}?`,
      a: `Yes. Family support services in ${name} help parents, carers and young people align communication, boundaries and routines, often alongside mentoring or transport in the same package.`,
    },
    {
      q: `Which neighbourhoods in ${name} do you cover?`,
      a: `We plan sessions and journeys across ${name} including ${neighbourhoods}. Share postcodes when you refer so we can confirm routing and practitioner availability.`,
    },
    {
      q: `How do schools and local authorities refer in ${name}?`,
      a: `Use our online referral form or contact page. We respond within one working day with feasibility, safeguarding questions and recommended programmes: chaperone, transport, mentoring, SEND or combined packages.`,
    },
  ];
}

export function areaSeoIntroParagraphs(
  area: { name: string; keyAreas: readonly string[] }
): readonly string[] {
  const neighbourhoods = area.keyAreas.join(', ');
  const name = area.name;

  return [
    `CAMS services in ${name} delivers chaperone service, chaperoning services, child transport services, youth mentoring, SEND support services, family support services, school transport support and SEMH behaviour support across ${neighbourhoods}.`,
    `Families and commissioners search for chaperone service ${name}, child transport ${name}, youth mentoring ${name}, SEND support ${name}, or family support services ${name} when a young person needs consistent, safeguarding-led adults. CAMS provides one-to-one provision, not group programmes.`,
    `Programmes available in ${name} include chaperone & community transport, mentoring and coaching, SEN and education support, family support service, behavioural management, sports support and fitness mentoring. Services can be combined through intervention packages.`,
    `Submit a referral with postcodes, schedules and safeguarding context to confirm capacity for chaperone, transport, mentoring or SEND cover in ${name}.`,
  ];
}

export function areaJsonLdServiceTypes(): readonly string[] {
  return SERVICE_LOCATION_KEYWORDS.flatMap((s) => s.searchPhrases);
}
