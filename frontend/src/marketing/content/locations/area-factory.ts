import type { LocationArea, LocationCouncilType } from '@/marketing/content/locations/types';

export const CORE_SERVICE_SLUGS = [
  'community',
  'mentoring',
  'sen',
  'routine',
  'goals',
  'sports-support-programme',
] as const;

export function areaFaq(placeName: string, keyAreaSample: string): LocationArea['faq'] {
  return [
    {
      q: `Do you provide chaperone services in ${placeName}?`,
      a: `Yes. CAMS services delivers chaperone services, child transport and mentoring across ${placeName} for local authorities, schools, foster agencies and families. Contact us to discuss availability in ${keyAreaSample} and surrounding neighbourhoods.`,
    },
    {
      q: `Which neighbourhoods in ${placeName} do you cover?`,
      a: `We plan journeys across ${placeName} based on referrer need, including school runs, contact centre transport, foster moves and community access. Share postcodes when you refer so we can confirm routing and practitioner cover.`,
    },
    {
      q: `How do schools and local authorities refer in ${placeName}?`,
      a: `Use our online referral form or contact page. We respond within one working day with feasibility, safeguarding questions and recommended next steps.`,
    },
  ];
}

export type CreateLocationAreaInput = {
  readonly slug: string;
  readonly name: string;
  readonly councilType: LocationCouncilType;
  readonly councilTypeLabel: string;
  readonly region: string;
  readonly regionSlug: string;
  readonly keyAreas: readonly string[];
  readonly notes: string;
  readonly borderingSlugs: readonly string[];
  readonly paragraphs: readonly string[];
  readonly faqSample?: string;
  readonly expansionTier: 'phase6-essex' | 'phase6-hertfordshire' | 'phase6-london';
  readonly metaTitle?: string;
  readonly metaDescription?: string;
  readonly heroDescription?: string;
};

export function createLocationArea(input: CreateLocationAreaInput): LocationArea {
  const sample = input.faqSample ?? input.keyAreas[0] ?? input.name;
  const neighbourhoods = input.keyAreas.slice(0, 3).join(', ');

  return {
    slug: input.slug,
    name: input.name,
    councilType: input.councilType,
    councilTypeLabel: input.councilTypeLabel,
    region: input.region,
    regionSlug: input.regionSlug,
    keyAreas: input.keyAreas,
    notes: input.notes,
    borderingSlugs: input.borderingSlugs,
    expansionTier: input.expansionTier,
    focusKeyword: `chaperone services ${input.name}`,
    metaTitle:
      input.metaTitle ??
      `Chaperone services ${input.name} | Child transport & mentoring`,
    metaDescription:
      input.metaDescription ??
      `Chaperone services in ${input.name}: ${neighbourhoods}. Child transport, school runs, youth mentoring and SEND support from CAMS services Ltd.`,
    heroDescription:
      input.heroDescription ??
      `Chaperone services, school transport and mentoring across ${input.name}, including ${neighbourhoods}.`,
    paragraphs: input.paragraphs,
    faq: areaFaq(input.name, sample),
    serviceSlugs: CORE_SERVICE_SLUGS,
  };
}
