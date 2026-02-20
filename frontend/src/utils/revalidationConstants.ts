/**
 * ISR revalidation intervals for public/CMS content.
 * Use these constants instead of hardcoding seconds so revalidation policy is in one place.
 *
 * Cache tags must match what the backend invalidates on save (e.g. RevalidateTag::dispatch).
 * See .cursor/rules/public-cms-pages.mdc for tag conventions.
 *
 * Route segment config: Next.js requires `export const revalidate = <number>` to be a literal
 * (e.g. 1800), not an imported constant. Use 1800 for CONTENT_PAGE in page/layout exports and
 * add a comment: "see revalidationConstants.ts CONTENT_PAGE". Use REVALIDATION_TIMES in fetch().
 */
export const REVALIDATION_TIMES = {
  /** Content pages (about, policies, pages, blog) — 30 minutes. Segment config must use literal 1800. */
  CONTENT_PAGE: 1800,
  /** Site settings / global config — 1 hour */
  SITE_SETTINGS: 3600,
  /** No ISR cache (e.g. user-specific or highly dynamic pages) */
  NO_CACHE: 0,
} as const;

/** Cache tag names used with Next.js revalidateTag; must match backend RevalidateTag::dispatch() calls */
export const CACHE_TAGS = {
  PAGES: 'pages',
  PAGE_SLUG: (slug: string) => `page:${slug}` as const,
  BLOG_POSTS: 'blog-posts',
  BLOG_POST_SLUG: (slug: string) => `blog-post:${slug}` as const,
  SITE_SETTINGS: 'site-settings',
  SERVICES: 'services',
  SERVICE_SLUG: (slug: string) => `service:${slug}` as const,
  FAQS: 'faqs',
  FAQ_SLUG: (slug: string) => `faq:${slug}` as const,
  PACKAGES: 'packages',
  PACKAGE_SLUG: (slug: string) => `package:${slug}` as const,
  TRAINERS: 'trainers',
  TRAINER_SLUG: (slug: string) => `trainer:${slug}` as const,
} as const;
