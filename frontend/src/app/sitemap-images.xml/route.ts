import { getImageSitemapEntries, absoluteImageUrl } from '@/marketing/content/image-seo-catalog';
import { getCanonicalUrlForSiteSlug } from '@/marketing/lib/public-site-url';
import { shouldIndexSite } from '@/marketing/lib/site-indexing';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(): Promise<Response> {
  if (!shouldIndexSite()) {
    return new Response('Not found', { status: 404 });
  }

  const baseUrl = getCanonicalUrlForSiteSlug('').replace(/\/$/, '');
  const entries = getImageSitemapEntries();

  const body = entries
    .map((entry) => {
      const pageUrl = getCanonicalUrlForSiteSlug(entry.pagePath.replace(/^\//, ''));
      const imageNodes = entry.images
        .map((image) => {
          const loc = absoluteImageUrl(baseUrl, image.path);
          return `    <image:image>
      <image:loc>${escapeXml(loc)}</image:loc>
      <image:title>${escapeXml(image.title)}</image:title>
      <image:caption>${escapeXml(image.caption)}</image:caption>
    </image:image>`;
        })
        .join('\n');

      if (imageNodes.length === 0) return '';

      return `  <url>
    <loc>${escapeXml(pageUrl)}</loc>
${imageNodes}
  </url>`;
    })
    .filter(Boolean)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
