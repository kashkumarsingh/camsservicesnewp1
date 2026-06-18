/**
 * Default SEO values when CMS metadata fields are empty.
 * Use for public page generateMetadata() fallbacks — never leave title or description blank.
 */
export const SEO_DEFAULTS = {
  siteName: 'CAMS Services',
  title: 'CAMS Services | Chaperone, Transport, Mentoring & Support',
  description:
    'Trusted chaperone, transport, mentoring and support services — safe, reliable, and tailored to individual needs.',
  /** Default OG image path (relative to site origin) */
  ogImagePath: '/og-images/og-image.jpg',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'CAMS Services',
} as const;
