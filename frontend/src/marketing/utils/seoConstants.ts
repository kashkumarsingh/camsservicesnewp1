/**
 * Default SEO values when CMS metadata fields are empty.
 * Use for public page generateMetadata() fallbacks — never leave title or description blank.
 */
export const SEO_DEFAULTS = {
  siteName: 'CAMS services',
  title: 'Chaperone Services UK | Child Transport & Family Support | CAMS services',
  description:
    'Chaperone services UK, child transport services, school transport support, family support services, SEND support services, foster placement support, mentoring services, and local authority support services tailored to individual needs.',
  /** Default OG image path — dynamic `/og` route is used by buildPublicMetadata */
  ogImagePath: '/og',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'CAMS services - Chaperone and Child Transport Services UK',
} as const;
