import type { LocationArea } from '@/marketing/content/locations/types';
import { LOCATION_AREAS } from '@/marketing/content/locations/areas';
import {
  SERVICE_LOCATION_KEYWORDS,
  type ServiceLocationKeyword,
} from '@/marketing/content/locations/service-location-keywords';
import { getServiceProgrammeBySlug } from '@/marketing/mock/services-programmes';
import { ROUTES } from '@/shared/utils/routes';

export type ServiceLocationPageContent = {
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly paragraphs: readonly string[];
  readonly faq: readonly { q: string; a: string }[];
  readonly focusPhrases: readonly string[];
};

function getServiceKeyword(slug: string): ServiceLocationKeyword | undefined {
  return SERVICE_LOCATION_KEYWORDS.find((s) => s.slug === slug);
}

export function isValidAreaServicePair(
  area: LocationArea,
  serviceSlug: string
): boolean {
  return area.serviceSlugs.includes(serviceSlug);
}

export function getServiceLocationPairs(): ReadonlyArray<{
  areaSlug: string;
  serviceSlug: string;
}> {
  const pairs: Array<{ areaSlug: string; serviceSlug: string }> = [];
  for (const area of LOCATION_AREAS) {
    for (const serviceSlug of area.serviceSlugs) {
      pairs.push({ areaSlug: area.slug, serviceSlug });
    }
  }
  return pairs;
}

export function getServiceLocationSitemapEntries(): ReadonlyArray<{
  path: string;
  lastModified: Date;
}> {
  return getServiceLocationPairs().map((pair) => ({
    path: `areas/${pair.areaSlug}/${pair.serviceSlug}`,
    lastModified: new Date(),
  }));
}

export function buildServiceLocationPageContent(
  area: LocationArea,
  serviceSlug: string
): ServiceLocationPageContent | null {
  if (!isValidAreaServicePair(area, serviceSlug)) return null;

  const keyword = getServiceKeyword(serviceSlug);
  const programme = getServiceProgrammeBySlug(serviceSlug);
  if (!keyword || !programme) return null;

  const place = area.name;
  const neighbourhoods = area.keyAreas.slice(0, 5).join(', ');
  const primaryPhrase = keyword.searchPhrases[0];
  const secondaryPhrase = keyword.searchPhrases[1] ?? keyword.searchPhrases[0];

  const focusPhrases = keyword.searchPhrases.map((p) => `${p} ${place}`);

  return {
    metaTitle: `${primaryPhrase} ${place} | ${programme.title}`,
    metaDescription: `${keyword.label} in ${place} (${neighbourhoods}). DBS-checked CAMS practitioners for schools, local authorities and families. Refer online.`,
    heroTitle: `${keyword.label} in ${place}`,
    heroSubtitle: `${primaryPhrase} and ${secondaryPhrase} across ${place} including ${neighbourhoods}. Safeguarding-led one-to-one provision from CAMS services.`,
    paragraphs: [
      `CAMS services delivers ${keyword.label.toLowerCase()} across ${place}. Commissioners and families search for ${primaryPhrase} ${place} and ${secondaryPhrase} ${place} when a young person needs a consistent, trained adult.`,
      area.paragraphs[0] ?? `We work with schools, nurseries, IFAs and children's services teams across ${place}.`,
      `Programme detail: ${programme.tagline}. Sessions are one-to-one, risk-assessed and documented for referrers where commissioned.`,
      `Explore the wider [${place} borough hub](${ROUTES.AREA_BY_SLUG(area.slug)}) for all programmes, or the national [${programme.title}](${ROUTES.SERVICE_BY_SLUG(serviceSlug)}) page for full feature lists and packages.`,
    ],
    faq: [
      {
        q: `Do you provide ${primaryPhrase} in ${place}?`,
        a: `Yes. CAMS delivers ${keyword.label.toLowerCase()} in ${place} across ${neighbourhoods}. Submit a referral with postcodes and schedule to confirm capacity.`,
      },
      {
        q: `Who can refer for ${keyword.label.toLowerCase()} in ${place}?`,
        a: `Local authorities, schools, SENCOs, foster agencies and parents can refer via our online form. We respond within one working day.`,
      },
      {
        q: `Can programmes be combined in ${place}?`,
        a: `Yes. Many ${place} cases combine chaperone transport, mentoring, SEND support or family support through [intervention packages](${ROUTES.PACKAGES}).`,
      },
    ],
    focusPhrases,
  };
}
