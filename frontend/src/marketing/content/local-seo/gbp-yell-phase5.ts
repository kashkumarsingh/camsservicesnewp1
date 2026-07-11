import { getLocationAreaBySlug } from '@/marketing/content/locations';
import { LOCATION_AREAS } from '@/marketing/content/locations/areas';
import {
  BUSINESS_NAP,
  GBP_LISTING_URL,
  GBP_YELL_AREA_LABELS,
  GBP_YELL_BROADER_AREA_LABELS,
  GBP_YELL_PRIMARY_AREA_SLUGS,
  type GbpYellPrimaryAreaSlug,
} from '@/marketing/constants/businessNap';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';

/**
 * Client-approved Yell / GBP long description (no phone or URL; directories often strip them).
 * Avoid "escort/escorts" on Yell; use chaperone / supervised transport wording.
 */
export const YELL_GBP_LONG_DESCRIPTION = `CAMS Services Ltd provides one to one mentoring, SEND support, community access, chaperone services and safeguarding support for children, young people and families across London.

We work with local authorities, schools, residential children's homes, foster agencies and families to deliver tailored support that helps children and young people build confidence, independence, social skills and positive routines through meaningful one to one support and community based activities.

Our services include activity based mentoring, community access, supervised child transport, home to school and nursery transport, contact arrangements, placement transitions, family support and safeguarding led travel. Every service is tailored to the individual's needs and delivered by experienced, Enhanced DBS checked practitioners using trauma informed approaches.

CAMS Services provides reliable planned, emergency and commissioned support, working in partnership with professionals and families to promote safety, wellbeing and positive outcomes for children and young people.

We believe every child deserves opportunities to build confidence, develop independence and enjoy positive experiences in a safe and supportive environment.`.trim();

/** Yell strapline (50 chars max). */
export const YELL_STRAPLINE = 'UK chaperone services, transport & youth support';

/** Yell business summary (180 chars max). */
export const YELL_BUSINESS_SUMMARY =
  'CAMS Services Ltd delivers chaperone services and safeguarding-led child transport for schools, foster agencies and families across London and the UK.';

/** Google Business Profile description (750 chars max; no phone or URL). */
export const GBP_BUSINESS_DESCRIPTION = `CAMS Services Ltd provides one to one mentoring, SEND support, community access, chaperone services and safeguarding support for children, young people and families across London.

We work with local authorities, schools, residential children's homes, foster agencies and families to deliver tailored support that helps children build confidence, independence and social skills through meaningful one to one support and community based activities.

Our services include supervised child transport, home to school transport, contact arrangements, placement transitions, family support and safeguarding led travel. Delivered by Enhanced DBS checked, trauma informed practitioners.

Based in Greenford, Ealing with UK-wide delivery by arrangement.`.trim();

/** Client products & services list for Yell (paste each with +). */
export const YELL_PRODUCTS_AND_SERVICES = [
  'One to One Mentoring',
  'SEND Support',
  'SEMH Support',
  'Community Access Support',
  'Positive Activities',
  'Life Skills Development',
  'Independent Living Skills',
  'Behaviour and Emotional Support',
  'Family Support',
  'Parent and Carer Support',
  'School Engagement Support',
  'School Attendance Support',
  'Alternative Provision Support',
  'Chaperone Services',
  'Safeguarding Support',
  'Supervised Child Transport',
  'Contact Arrangement Support',
  'Home to School Transport',
  'Home to Nursery Transport',
  'Placement Transition Support',
  'Residential Care Support',
  'Activity Support',
  'Holiday Support',
  'Emergency Support Cover',
  'Local Authority Commissioned Services',
  'School Support Services',
  'Foster Placement Support',
  'Enhanced DBS Checked Practitioners',
  'Trauma Informed Practitioners',
] as const;

export type GbpYellAreaEntry = {
  slug: GbpYellPrimaryAreaSlug;
  name: string;
  yellLabel: string;
  areaPagePath: string;
  areaPageUrl: string;
  focusKeyword: string;
  isHeadquarters: boolean;
  gbpPostTitle: string;
  gbpPostBody: string;
};

export function getGbpYellPrimaryAreaEntries(): readonly GbpYellAreaEntry[] {
  const baseUrl = getMetadataBaseUrl();

  return GBP_YELL_PRIMARY_AREA_SLUGS.map((slug) => {
    const area = getLocationAreaBySlug(slug);
    if (!area) {
      throw new Error(`Missing location area for GBP/Yell slug: ${slug}`);
    }

    const areaPagePath = ROUTES.AREA_BY_SLUG(slug);
    const areaPageUrl = `${baseUrl}${areaPagePath}`;
    const isHeadquarters = slug === BUSINESS_NAP.headquartersAreaSlug;
    const keyword = area.focusKeyword ?? `chaperone services ${area.name}`;

    const gbpPostTitle = isHeadquarters
      ? `Chaperone services in Ealing — Greenford HQ`
      : `Chaperone services in ${area.name}`;

    const hqLine = isHeadquarters
      ? 'Our Greenford HQ anchors West London chaperone and child transport cover.'
      : `We plan school runs, contact centre journeys and foster moves across ${area.name}.`;

    const gbpPostBody = `${keyword} from CAMS services Ltd: DBS-checked, trauma-informed practitioners for local authorities, schools and families. ${hqLine}

Refer online or view our ${area.name} area page for neighbourhoods and programme links:
${areaPageUrl}

HQ and wider West London hubs: ${baseUrl}${ROUTES.AREA_BY_SLUG(BUSINESS_NAP.headquartersAreaSlug)}`;

    return {
      slug,
      name: area.name,
      yellLabel: GBP_YELL_AREA_LABELS[slug],
      areaPagePath,
      areaPageUrl,
      focusKeyword: keyword,
      isHeadquarters,
      gbpPostTitle,
      gbpPostBody,
    };
  });
}

/** Identical NAP block for directory citations (paste into description or additional info fields). */
export function formatCitationNapBlock(options?: { includeWebsite?: boolean }): string {
  const lines = [
    BUSINESS_NAP.legalName,
    BUSINESS_NAP.streetAddress,
    `${BUSINESS_NAP.addressLocality}, ${BUSINESS_NAP.postalCode}`,
    BUSINESS_NAP.phone,
    BUSINESS_NAP.email,
  ];

  if (options?.includeWebsite !== false) {
    lines.push(BUSINESS_NAP.website);
    lines.push(`${BUSINESS_NAP.website}${BUSINESS_NAP.headquartersPath}`);
  }

  return lines.join('\n');
}

export type CitationDirectoryEntry = {
  id: string;
  name: string;
  priority: 'tier1' | 'tier2';
  listingUrl?: string;
  notes: string;
};

/** Off-site citation targets; complete listings with identical NAP + HQ area link. */
export const CITATION_DIRECTORIES: readonly CitationDirectoryEntry[] = [
  {
    id: 'google-business-profile',
    name: 'Google Business Profile',
    priority: 'tier1',
    listingUrl: GBP_LISTING_URL,
    notes:
      'Verified (Jul 2026). Website and services added. Profile https://g.page/r/CRKve-dqA7MKEBM. Reviews https://g.page/r/CRKve-dqA7MKEBM/review. Add posts linking to /areas/ealing.',
  },
  {
    id: 'yell',
    name: 'Yell Business',
    priority: 'tier1',
    listingUrl: 'https://www.yell.com/biz/cams-services-ltd-greenford-11042887/',
    notes:
      'Live listing. NAP aligned with site (51 Eastmead Avenue, UB6 9RD). Website should point to camsservices.co.uk.',
  },
  {
    id: 'bing-places',
    name: 'Bing Places for Business',
    priority: 'tier1',
    notes: 'Mirror GBP NAP exactly. Category: social services / child care related where available.',
  },
  {
    id: 'apple-business-connect',
    name: 'Apple Business Connect',
    priority: 'tier2',
    notes: 'Same NAP and website. Add service area polygons or labels for West London.',
  },
  {
    id: 'facebook',
    name: 'Facebook Business Page',
    priority: 'tier1',
    listingUrl: 'https://www.facebook.com/profile.php?id=61590231848807',
    notes: 'About section: short description + link to /areas/ealing. Match address and phone.',
  },
  {
    id: 'instagram',
    name: 'Instagram Business',
    priority: 'tier2',
    listingUrl: 'https://www.instagram.com/camsservicesltd/',
    notes: 'Bio link to website or /areas. NAP in contact buttons where available.',
  },
] as const;

/** URLs to request indexing in Google Search Console after deploy. */
export function getGscIndexingPriorityUrls(): readonly string[] {
  const baseUrl = getMetadataBaseUrl();
  const areaUrls = LOCATION_AREAS.map((area) => `${baseUrl}${ROUTES.AREA_BY_SLUG(area.slug)}`);
  const hqSamples = getGbpYellPrimaryAreaEntries().map((entry) => entry.areaPageUrl);

  return [
    `${baseUrl}/`,
    `${baseUrl}${ROUTES.CHAPERONE_SERVICES}`,
    `${baseUrl}${ROUTES.AREAS}`,
    ...hqSamples,
    ...areaUrls.filter((url) => !hqSamples.includes(url)),
    `${baseUrl}${ROUTES.CONTACT}`,
    `${baseUrl}${ROUTES.REFERRAL}`,
  ];
}

/** Plain-text export for GSC paste or Search Console API workflows. */
export function formatGscIndexingUrlList(): string {
  return getGscIndexingPriorityUrls().join('\n');
}

/** All Yell / GBP area labels (seven mapped + broader). */
export function getYellGbpAreaLabels(): readonly string[] {
  return [
    ...GBP_YELL_PRIMARY_AREA_SLUGS.map((slug) => GBP_YELL_AREA_LABELS[slug]),
    ...GBP_YELL_BROADER_AREA_LABELS,
  ];
}
