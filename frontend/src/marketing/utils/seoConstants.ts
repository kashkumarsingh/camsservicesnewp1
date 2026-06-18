/**
 * Default SEO values when CMS metadata fields are empty.
 * Use for public page generateMetadata() fallbacks — never leave title or description blank.
 */
export const SEO_DEFAULTS = {
  siteName: 'CAMS Services',
  title: 'Chaperone Services UK | Child Transport & Family Support | CAMS Services',
  description:
    'Chaperone services UK, child transport services, school transport support, family support services, SEND support services, foster placement support, mentoring services, and local authority support services tailored to individual needs.',
  /** Default OG image path (relative to site origin) */
  ogImagePath: '/og-images/og-image.jpg',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'CAMS Services - Chaperone and Child Transport Services UK',
} as const;
