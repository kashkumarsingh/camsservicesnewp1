import type { ReactElement } from 'react';
import { resolvePagePrimaryImage } from '@/marketing/content/image-seo-catalog';

type PagePrimaryImageSectionProps = {
  /** Canonical path, e.g. `/chaperone-services` or `/areas/ealing` */
  pagePath: string;
  areaName?: string;
  /** `visible` = on-page photo; `sr-only` = crawlable only (page already has photos). */
  variant?: 'visible' | 'sr-only';
};

/**
 * On-page primary image for Google Images: real &lt;img&gt; with keyword alt, near page hero.
 * Uses direct /images/ URLs (not CSS backgrounds) per Google image SEO guidance.
 */
export function PagePrimaryImageSection({
  pagePath,
  areaName,
  variant = 'visible',
}: PagePrimaryImageSectionProps): ReactElement | null {
  const image = resolvePagePrimaryImage(pagePath, { areaName });
  if (!image) return null;

  const figureClass =
    variant === 'sr-only'
      ? 'sr-only'
      : 'mt-8 overflow-hidden rounded-2xl border border-slate-200/90 shadow-sm';

  return (
    <figure className={figureClass}>
      <img
        src={image.path}
        alt={image.alt}
        width={1200}
        height={675}
        className={
          variant === 'sr-only'
            ? undefined
            : 'h-auto max-h-[420px] w-full object-cover'
        }
        loading={variant === 'sr-only' ? 'lazy' : 'eager'}
        decoding="async"
      />
      <figcaption className={variant === 'sr-only' ? undefined : 'sr-only'}>
        {image.caption}
      </figcaption>
    </figure>
  );
}
