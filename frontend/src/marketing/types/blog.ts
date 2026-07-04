import type { CamsIconName } from '@/marketing/mock/cams-icon-registry';
import { CAMS_UNSPLASH_PHOTO } from '@/marketing/mock/cams-unsplash';

export type CamsUnsplashPhotoId =
  (typeof CAMS_UNSPLASH_PHOTO)[keyof typeof CAMS_UNSPLASH_PHOTO];

/** Yoast / Semrush-style FAQ block for featured snippets and FAQ schema. */
export interface SeoBlogFaqItem {
  question: string;
  answer: string;
}

/**
 * SEO blog post shape aligned with Yoast, Semrush and Backlinko on-page guidance:
 * focus keyword, meta title/description, heading hierarchy, internal links, FAQ.
 */
export interface MarketingBlogPostDTO {
  slug: string;
  /** Primary keyword — used in title, intro, URL and meta (Yoast focus keyphrase). */
  focusKeyword: string;
  /** SERP title, 50–60 characters where possible. */
  metaTitle: string;
  /** SERP description, 150–160 characters with CTA. */
  metaDescription: string;
  /** On-page H1. */
  title: string;
  /** On-page subtitle below H1. */
  excerpt: string;
  category: string;
  publishedLabel: string;
  /** ISO date for sorting, sitemap and article schema. */
  publishedAt: string;
  readTimeLabel: string;
  icon: CamsIconName;
  coverPhotoId: CamsUnsplashPhotoId;
  coverImageUrl?: string;
  /** Descriptive alt text for the hero image (accessibility + image SEO). */
  coverImageAlt: string;
  /** Markdown or HTML body with H2/H3 hierarchy and internal links. */
  content: string;
  tags: string[];
  faq: SeoBlogFaqItem[];
}

export interface SitePageDTO {
  slug: string;
  title: string;
  heroHeading: string;
  summary: string;
  sourceHtmlFile: string;
}
