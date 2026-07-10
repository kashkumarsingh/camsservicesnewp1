/**
 * Default SEO values when CMS metadata fields are empty.
 * Use for public page generateMetadata() fallbacks — never leave title or description blank.
 */
export const SEO_DEFAULTS = {
  siteName: 'CAMS services',
  title: 'Chaperone service UK | Chaperoning services | CAMS services',
  description:
    'Chaperone service, chaperoning services and chaperone services UK for children in care, contact transport and SEND. DBS-checked child chaperones for schools and local authorities.',
  ogImagePath: '/og',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'CAMS services - Chaperone services UK and child transport',
} as const;

/** Priority commercial terms (children's services only — not medical/dance/molecular). */
export const CHAPERONE_SEO_TERMS = {
  primary: 'chaperone services',
  secondary: 'chaperone service',
  chaperoning: 'chaperoning services',
  chaperoningSingular: 'chaperoning service',
  branded: 'chaperone services UK',
  nearMe: 'chaperone service near me',
} as const;
