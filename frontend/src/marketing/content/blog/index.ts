import type { MarketingBlogPostDTO } from '@/marketing/types/blog';
import { chaperoneServicesUkArticle } from '@/marketing/content/blog/articles/chaperone-services-uk';
import { childTransportServicesArticle } from '@/marketing/content/blog/articles/child-transport-services';
import { sendSupportServicesArticle } from '@/marketing/content/blog/articles/send-support-services';
import { fosterPlacementSupportArticle } from '@/marketing/content/blog/articles/foster-placement-support';
import { contactCentreTransportArticle } from '@/marketing/content/blog/articles/contact-centre-transport';
import { youthMentoringServicesArticle } from '@/marketing/content/blog/articles/youth-mentoring-services';
import { schoolTransportSupportArticle } from '@/marketing/content/blog/articles/school-transport-support';
import { familySupportServicesArticle } from '@/marketing/content/blog/articles/family-support-services';
import { LOCATION_BLOG_ARTICLES } from '@/marketing/content/blog/location-blog-factory';
import { sendTransportEhcpCommissioning2026Article } from '@/marketing/content/blog/articles/trending/send-transport-ehcp-commissioning-2026';
import { semhInclusionCommissioning2026Article } from '@/marketing/content/blog/articles/trending/semh-inclusion-commissioning-2026';
import { placementStabilityCommissioning2026Article } from '@/marketing/content/blog/articles/trending/placement-stability-commissioning-2026';
import { chaperoneProcurementLa2026Article } from '@/marketing/content/blog/articles/trending/chaperone-procurement-la-2026';

/** National service guides (Phase 1). */
export const NATIONAL_SEO_BLOG_ARTICLES: ReadonlyArray<MarketingBlogPostDTO> = [
  chaperoneServicesUkArticle,
  childTransportServicesArticle,
  sendSupportServicesArticle,
  fosterPlacementSupportArticle,
  contactCentreTransportArticle,
  youthMentoringServicesArticle,
  schoolTransportSupportArticle,
  familySupportServicesArticle,
];

/** Phase 4: 2026 UK commissioning trend articles. */
export const TRENDING_SEO_BLOG_ARTICLES: ReadonlyArray<MarketingBlogPostDTO> = [
  sendTransportEhcpCommissioning2026Article,
  semhInclusionCommissioning2026Article,
  placementStabilityCommissioning2026Article,
  chaperoneProcurementLa2026Article,
];

/** All public SEO articles: national + location cluster + trending. */
export const SEO_BLOG_ARTICLES: ReadonlyArray<MarketingBlogPostDTO> = [
  ...NATIONAL_SEO_BLOG_ARTICLES,
  ...LOCATION_BLOG_ARTICLES,
  ...TRENDING_SEO_BLOG_ARTICLES,
];

const bySlug = new Map(SEO_BLOG_ARTICLES.map((post) => [post.slug, post]));

/** Normalise `/blog/foo`, `blog/foo`, or `foo` to `foo`. */
export function normalizePublicBlogSlug(slug: string): string {
  return slug.replace(/^\/+/, '').replace(/^blog\//, '');
}

const publicSeoBlogSlugs = new Set(
  SEO_BLOG_ARTICLES.map((post) => normalizePublicBlogSlug(post.slug))
);

/** Only these slugs are published on the marketing site (sitemap, listing, detail). */
export function isPublicSeoBlogSlug(slug: string): boolean {
  return publicSeoBlogSlugs.has(normalizePublicBlogSlug(slug));
}

export function getSeoBlogPostBySlug(slug: string): MarketingBlogPostDTO | null {
  const normalized = normalizePublicBlogSlug(slug);
  if (!isPublicSeoBlogSlug(normalized)) {
    return null;
  }
  return bySlug.get(normalized) ?? bySlug.get(`blog/${normalized}`) ?? null;
}

export function getLocationBlogArticleForArea(areaSlug: string): MarketingBlogPostDTO | undefined {
  return LOCATION_BLOG_ARTICLES.find((post) => post.slug.endsWith(`-${areaSlug}`));
}

/** Blog URLs for sitemap.xml — SEO articles only (no legacy demo slugs). */
export function getSeoBlogSitemapEntries(): ReadonlyArray<{
  path: string;
  lastModified: Date;
}> {
  return SEO_BLOG_ARTICLES.map((post) => ({
    path: `blog/${post.slug.replace(/^blog\//, '')}`,
    lastModified: new Date(post.publishedAt),
  }));
}

/** Internal footer/nav links — helps crawlers discover sitemap blog URLs. */
export function getSeoBlogFooterLinks(): ReadonlyArray<{ href: string; label: string }> {
  return NATIONAL_SEO_BLOG_ARTICLES.map((post) => ({
    href: `/blog/${post.slug.replace(/^blog\//, '')}`,
    label: post.title.length > 52 ? `${post.title.slice(0, 49)}…` : post.title,
  }));
}

/** Trending commissioning articles for blog hub highlights. */
export function getTrendingBlogFooterLinks(): ReadonlyArray<{ href: string; label: string }> {
  return TRENDING_SEO_BLOG_ARTICLES.map((post) => ({
    href: `/blog/${post.slug.replace(/^blog\//, '')}`,
    label: post.title.length > 52 ? `${post.title.slice(0, 49)}…` : post.title,
  }));
}
