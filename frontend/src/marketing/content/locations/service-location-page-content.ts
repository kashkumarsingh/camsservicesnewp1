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

function getBorderingAreasForContent(area: LocationArea): readonly LocationArea[] {
  const bySlug = new Map(LOCATION_AREAS.map((item) => [item.slug, item]));
  return area.borderingSlugs
    .map((slug) => bySlug.get(slug))
    .filter((item): item is LocationArea => item != null);
}

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
  const borderingNames = getBorderingAreasForContent(area)
    .slice(0, 3)
    .map((item) => item.name)
    .join(', ');
  const featureSummary = programme.features.slice(0, 3).join('; ');

  const localityParagraphs: string[] = [];

  if (area.paragraphs[1]) {
    localityParagraphs.push(area.paragraphs[1]);
  }

  if (area.isHeadquarters) {
    localityParagraphs.push(
      `CAMS Services Ltd is headquartered in Greenford, ${place}. Local routing, escalation and supervision sit on the borough border, so ${neighbourhoods} journeys are planned with realistic buffer times.`
    );
  } else if (borderingNames) {
    localityParagraphs.push(
      `We plan ${keyword.label.toLowerCase()} in ${place} alongside bordering commissioning areas including ${borderingNames} when schools, placements or contact centres cross boundaries.`
    );
  }

  localityParagraphs.push(
    `Typical ${place} outcomes include ${featureSummary}. Referrers receive feasibility confirmation, safeguarding questions and a named practitioner pathway within one working day.`
  );

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
      ...localityParagraphs,
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
      {
        q: `Which neighbourhoods in ${place} do you cover for ${keyword.label.toLowerCase()}?`,
        a: `We plan sessions and journeys across ${neighbourhoods}. Share postcodes, bell times and handover requirements when you refer.`,
      },
      {
        q: `How quickly can ${keyword.label.toLowerCase()} start in ${place}?`,
        a: `After referral we confirm safeguarding fit, practitioner availability and travel feasibility for ${place}. Urgent contact transport or school runs are prioritised when risk assessments allow.`,
      },
    ],
    focusPhrases,
  };
}
