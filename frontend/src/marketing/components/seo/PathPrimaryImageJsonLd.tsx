'use client';

import type { ReactElement } from 'react';
import { usePathname } from 'next/navigation';
import {
  absoluteImageUrl,
  resolvePagePrimaryImage,
} from '@/marketing/content/image-seo-catalog';
import { getLocationAreaBySlug } from '@/marketing/content/locations';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://www.camsservices.co.uk';

/**
 * Injects WebPage + primaryImageOfPage schema for the current route (whole marketing site).
 */
export function PathPrimaryImageJsonLd(): ReactElement | null {
  const pathname = usePathname() ?? '/';
  const areaMatch = pathname.match(/^\/areas\/([^/]+)$/);
  const area = areaMatch ? getLocationAreaBySlug(areaMatch[1]) : null;
  const image = resolvePagePrimaryImage(pathname, { areaName: area?.name });

  if (!image) return null;

  const pageUrl = `${BASE_URL}${pathname === '/' ? '' : pathname}`;
  const imageUrl = absoluteImageUrl(BASE_URL, image.path);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: image.title,
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: imageUrl,
      contentUrl: imageUrl,
      caption: image.caption,
      description: image.alt,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
