/**
 * Canonical NAP (name, address, phone) for GBP, Yell, citations and JSON-LD.
 * Legal entity name on directories; display name matches public site branding.
 */
export const BUSINESS_LEGAL_NAME = 'CAMS Services Ltd' as const;

/** Public site / marketing brand (lowercase s). */
export const BUSINESS_DISPLAY_NAME = 'CAMS services' as const;

export const BUSINESS_WEBSITE = 'https://www.camsservices.co.uk' as const;

/** Live Yell Business listing (Phase 5 citation). */
export const YELL_LISTING_URL =
  'https://www.yell.com/biz/cams-services-ltd-greenford-11042887/' as const;

/**
 * Verified Google Business Profile (g.page short link).
 * Review requests: GBP_REVIEW_URL
 */
export const GBP_LISTING_URL = 'https://g.page/r/CRKve-dqA7MKEBM' as const;

/** GBP "Ask for reviews" / review collection link. */
export const GBP_REVIEW_URL = 'https://g.page/r/CRKve-dqA7MKEBM/review' as const;

/** Primary category shown on verified GBP (Jul 2026). */
export const GBP_PRIMARY_CATEGORY = 'Youth social services organization' as const;

/** Seven primary GBP / Yell service areas mapped to /areas/{slug} pages. */
export const GBP_YELL_PRIMARY_AREA_SLUGS = [
  'ealing',
  'harrow',
  'brent',
  'hillingdon',
  'barnet',
  'hounslow',
  'watford',
] as const;

export type GbpYellPrimaryAreaSlug = (typeof GBP_YELL_PRIMARY_AREA_SLUGS)[number];

export const BUSINESS_HEADQUARTERS_AREA_SLUG: GbpYellPrimaryAreaSlug = 'ealing';

export const BUSINESS_NAP = {
  legalName: BUSINESS_LEGAL_NAME,
  displayName: BUSINESS_DISPLAY_NAME,
  phone: '+44 7939 990587',
  phoneTelHref: '+447939990587',
  /** UK national format for GBP, Yell and directory listings. */
  phoneNationalDisplay: '07939 990587',
  email: 'info@camsservices.co.uk',
  streetAddress: '51 Eastmead Avenue',
  addressLocality: 'Greenford',
  addressRegion: 'London',
  postalCode: 'UB6 9RD',
  addressCountry: 'GB',
  fullAddress: '51 Eastmead Avenue, Greenford, UB6 9RD, United Kingdom',
  shortAddress: '51 Eastmead Avenue, UB6 9RD',
  website: BUSINESS_WEBSITE,
  headquartersAreaSlug: BUSINESS_HEADQUARTERS_AREA_SLUG,
  headquartersPath: '/areas/ealing',
  /** Opens verified GBP on Google Maps (shows business name on pin). */
  mapsPlaceUrl: GBP_LISTING_URL,
  mapsSearchUrl:
    'https://www.google.com/maps/search/?api=1&query=CAMS+Services+Ltd,+51+Eastmead+Avenue,+Greenford,+UB6+9RD',
  mapsEmbedUrl:
    'https://maps.google.com/maps?q=CAMS+Services+Ltd,+51+Eastmead+Avenue,+Greenford,+UB6+9RD&hl=en&z=17&output=embed',
} as const;

export const BUSINESS_POSTAL_ADDRESS_SCHEMA = {
  '@type': 'PostalAddress' as const,
  streetAddress: BUSINESS_NAP.streetAddress,
  addressLocality: BUSINESS_NAP.addressLocality,
  addressRegion: BUSINESS_NAP.addressRegion,
  postalCode: BUSINESS_NAP.postalCode,
  addressCountry: BUSINESS_NAP.addressCountry,
};

/** Yell / GBP "areas you serve" labels aligned to primary slugs. */
export const GBP_YELL_AREA_LABELS: Record<GbpYellPrimaryAreaSlug, string> = {
  ealing: 'Ealing, London',
  harrow: 'Harrow, London',
  brent: 'Brent, London',
  hillingdon: 'Hillingdon, London',
  barnet: 'Barnet, London',
  hounslow: 'Hounslow, London',
  watford: 'Watford, Hertfordshire',
};

/** Broader coverage labels for GBP / Yell (in addition to the seven mapped boroughs). */
export const GBP_YELL_BROADER_AREA_LABELS = [
  'Greater London',
  'Essex',
  'Hertfordshire',
  'United Kingdom',
] as const;
