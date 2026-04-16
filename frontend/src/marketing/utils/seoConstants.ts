/**
 * Default SEO values when CMS metadata fields are empty.
 * Use for public page generateMetadata() fallbacks — never leave title or description blank.
 */
export const SEO_DEFAULTS = {
  siteName: 'CAMS Services',
  title: 'CAMS Services | Specialist SEN & Trauma-Informed Care',
  description:
    'Specialist SEN and trauma-informed care programmes with DBS-checked professionals, personalised plans, and proven results.',
  /** Default OG image path (relative to site origin) */
  ogImagePath: '/og-images/og-image.jpg',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'CAMS Services',
} as const;
