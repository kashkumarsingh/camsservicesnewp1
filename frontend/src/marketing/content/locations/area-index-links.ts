import { getLocationAreaBySlug } from '@/marketing/content/locations';
import { SERVICE_LOCATION_KEYWORDS } from '@/marketing/content/locations/service-location-keywords';
import { ROUTES } from '@/shared/utils/routes';

export type AreaIndexLink = {
  readonly href: string;
  readonly label: string;
};

const PRIORITY_SERVICE_LOCATION_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['ealing', 'community'],
  ['ealing', 'mentoring'],
  ['ealing', 'sports-support-programme'],
  ['ealing', 'routine'],
  ['harrow', 'sen'],
  ['harrow', 'sports-support-programme'],
  ['hillingdon', 'community'],
  ['hillingdon', 'goals'],
  ['brent', 'community'],
  ['brent', 'sports-support-programme'],
  ['hounslow', 'mentoring'],
  ['hounslow', 'sports-support-programme'],
  ['barnet', 'sen'],
  ['barnet', 'sports-support-programme'],
  ['enfield', 'community'],
  ['enfield', 'sen'],
  ['enfield', 'sports-support-programme'],
  ['chelmsford', 'community'],
  ['chelmsford', 'routine'],
  ['colchester', 'goals'],
  ['colchester', 'mentoring'],
  ['basildon', 'community'],
  ['basildon', 'sports-support-programme'],
  ['harlow', 'community'],
  ['harlow', 'goals'],
  ['harlow', 'sen'],
  ['harlow', 'sports-support-programme'],
  ['st-albans', 'community'],
  ['st-albans', 'goals'],
  ['st-albans', 'routine'],
  ['stevenage', 'community'],
  ['kingston-upon-thames', 'community'],
  ['kingston-upon-thames', 'routine'],
  ['kingston-upon-thames', 'sports-support-programme'],
  ['waltham-forest', 'community'],
  ['waltham-forest', 'mentoring'],
  ['waltham-forest', 'routine'],
  ['waltham-forest', 'sen'],
  ['waltham-forest', 'sports-support-programme'],
  ['haringey', 'community'],
  ['redbridge', 'community'],
  ['slough', 'community'],
  ['brentwood', 'community'],
  ['brentwood', 'mentoring'],
  ['brentwood', 'sports-support-programme'],
  ['hammersmith-and-fulham', 'sports-support-programme'],
  ['kensington-and-chelsea', 'community'],
  ['richmond-upon-thames', 'routine'],
];

function serviceLocationLink(areaSlug: string, serviceSlug: string): AreaIndexLink | null {
  const area = getLocationAreaBySlug(areaSlug);
  const service = SERVICE_LOCATION_KEYWORDS.find((item) => item.slug === serviceSlug);
  if (!area || !service || !area.serviceSlugs.includes(serviceSlug)) {
    return null;
  }

  return {
    href: ROUTES.AREA_SERVICE_BY_SLUG(areaSlug, serviceSlug),
    label: `${service.label} ${area.name}`,
  };
}

/** Sitewide internal links to priority service × location URLs (GSC discovery). */
export function getPriorityServiceLocationLinks(): readonly AreaIndexLink[] {
  const seen = new Set<string>();
  const links: AreaIndexLink[] = [];

  for (const [areaSlug, serviceSlug] of PRIORITY_SERVICE_LOCATION_PAIRS) {
    const link = serviceLocationLink(areaSlug, serviceSlug);
    if (!link || seen.has(link.href)) continue;
    seen.add(link.href);
    links.push(link);
  }

  return links;
}

const PRIORITY_BOROUGH_SLUGS = [
  'ealing',
  'harrow',
  'hillingdon',
  'brent',
  'hounslow',
  'barnet',
  'watford',
  'chelmsford',
  'st-albans',
  'enfield',
] as const;

/** Borough hub links for footer and home. */
export function getPriorityBoroughLinks(): readonly AreaIndexLink[] {
  return PRIORITY_BOROUGH_SLUGS.flatMap((slug) => {
    const area = getLocationAreaBySlug(slug);
    if (!area) return [];
    return [{ href: ROUTES.AREA_BY_SLUG(slug), label: `Chaperone ${area.name}` }];
  });
}
