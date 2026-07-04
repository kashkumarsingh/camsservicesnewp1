import type { Metadata } from 'next';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { SEO_DEFAULTS } from '@/marketing/utils/seoConstants';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';

export interface CmsPageSeoSource {
  title: string;
  summary?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
}

export function buildCmsPageMetadata(
  page: CmsPageSeoSource,
  path: string,
  options?: {
    baseUrl?: string;
    titleSuffix?: boolean;
    type?: 'website' | 'article';
  }
): Metadata {
  const baseUrl = options?.baseUrl ?? getMetadataBaseUrl();
  const rawTitle = page.metaTitle?.trim() || page.title?.trim() || SEO_DEFAULTS.title;
  const title =
    options?.titleSuffix === false || page.metaTitle?.trim()
      ? rawTitle
      : `${rawTitle} | ${SEO_DEFAULTS.siteName}`;
  const description =
    page.metaDescription?.trim() || page.summary?.trim() || SEO_DEFAULTS.description;

  return buildPublicMetadata(
    {
      title,
      description,
      path,
      imageUrl: page.ogImage,
      imageAlt: page.title,
      type: options?.type,
    },
    baseUrl
  );
}
