/**
 * Shared helper for public page metadata.
 * Use from generateMetadata() so CMS title/description and SEO_DEFAULTS are applied in one place.
 */

import type { Metadata } from 'next';
import { shouldIndexSite } from '@/marketing/lib/site-indexing';
import {
  absoluteImageUrl,
  resolvePagePrimaryImage,
} from '@/marketing/content/image-seo-catalog';
import { SEO_DEFAULTS } from '@/marketing/utils/seoConstants';

function buildDynamicOgImageUrl(baseUrl: string, path: string): string {
  const normalized = path.replace(/^\//, '').replace(/\/$/, '');
  return normalized ? `${baseUrl}/og/${normalized}` : `${baseUrl}/og`;
}

export interface BuildPublicMetadataOptions {
  /** Page title (from CMS or fallback); use SEO_DEFAULTS.title when empty */
  title?: string | null;
  /** Meta description (from CMS or fallback); use SEO_DEFAULTS.description when empty */
  description?: string | null;
  /** Canonical path including leading slash, e.g. '/about', '/blog/my-post' */
  path: string;
  /** Full URL for OG image, or path (will be prefixed with baseUrl) */
  imageUrl?: string | null;
  /** Alt text for OG image */
  imageAlt?: string | null;
  /** Site name for OG; defaults to SEO_DEFAULTS.siteName */
  siteName?: string | null;
  /** Open Graph type */
  type?: 'website' | 'article';
  /** For article: published time (ISO string) */
  publishedTime?: string;
  /** For article: modified time (ISO string) */
  modifiedTime?: string;
  /** For article: author names */
  authors?: string[];
  /** For article: tag names */
  tags?: string[];
  /** Borough or place name for area landing metadata images */
  areaName?: string | null;
  /** When true, keep dynamic /og text cards instead of programme photos */
  useDynamicOgImage?: boolean;
}

/**
 * Build Next.js Metadata for a public page using CMS fields and SEO_DEFAULTS fallbacks.
 * Pass the result to generateMetadata() return value.
 *
 * @param options - Title, description, path, and optional OG/Article fields
 * @param baseUrl - Full origin, e.g. https://example.com (no trailing slash)
 */
export function buildPublicMetadata(
  options: BuildPublicMetadataOptions,
  baseUrl: string
): Metadata {
  const title = options.title?.trim() || SEO_DEFAULTS.title;
  const description = options.description?.trim() || SEO_DEFAULTS.description;
  const siteName = options.siteName?.trim() || SEO_DEFAULTS.siteName;
  const canonicalUrl = `${baseUrl.replace(/\/$/, '')}${options.path.startsWith('/') ? options.path : `/${options.path}`}`;

  const primaryImage = !options.imageUrl && !options.useDynamicOgImage
    ? resolvePagePrimaryImage(options.path, {
        areaName: options.areaName ?? undefined,
      })
    : null;

  const imageUrl = options.imageUrl
    ? options.imageUrl.startsWith('http')
      ? options.imageUrl
      : `${baseUrl.replace(/\/$/, '')}${options.imageUrl.startsWith('/') ? options.imageUrl : `/${options.imageUrl}`}`
    : primaryImage
      ? absoluteImageUrl(baseUrl.replace(/\/$/, ''), primaryImage.path)
      : buildDynamicOgImageUrl(baseUrl.replace(/\/$/, ''), options.path);
  const imageAlt = options.imageAlt?.trim() || primaryImage?.alt || SEO_DEFAULTS.ogImageAlt;
  const indexable = shouldIndexSite();

  const openGraph: Metadata['openGraph'] = {
    title,
    description,
    url: canonicalUrl,
    siteName,
    type: options.type ?? 'website',
    images: [
      {
        url: imageUrl,
        width: SEO_DEFAULTS.ogImageWidth,
        height: SEO_DEFAULTS.ogImageHeight,
        alt: imageAlt,
      },
    ],
    ...(options.type === 'article' && {
      publishedTime: options.publishedTime,
      modifiedTime: options.modifiedTime,
      authors: options.authors,
      tags: options.tags,
    }),
  };

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: imageUrl }],
    },
    ...(!indexable && {
      robots: { index: false, follow: false },
    }),
  };
}
