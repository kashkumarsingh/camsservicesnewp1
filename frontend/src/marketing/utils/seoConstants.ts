/**
 * Default SEO values when CMS metadata fields are empty.
 * Use for public page generateMetadata() fallbacks — never leave title or description blank.
 */
export const SEO_DEFAULTS = {
  siteName: 'CAMS services',
  title: 'Chaperone services UK | Chaperone service | CAMS services',
  description:
    'Professional chaperone service and chaperone services UK for children in care, contact transport and SEND. DBS-checked child chaperones for schools and local authorities.',
  ogImagePath: '/og',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'CAMS services - Chaperone services UK and child transport',
} as const;

/** Priority commercial terms (children's services only — not medical/dance/molecular). */
export const CHAPERONE_SEO_TERMS = {
  primary: 'chaperone services',
  secondary: 'chaperone service',
  branded: 'chaperone services UK',
} as const;
