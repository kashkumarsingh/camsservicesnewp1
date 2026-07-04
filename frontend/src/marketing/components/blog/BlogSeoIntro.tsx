import type { ReactElement } from 'react';
import { BLOG_INDEX_SEO_PROSE } from '@/marketing/content/page-seo-intros';
import { Button } from '@/marketing/components/ui/button';

/** Server-rendered intro for /blog (crawlable text-HTML ratio). Renders between hero and article grid. */
export function BlogSeoIntro(): ReactElement {
  const { eyebrow, title, titleAs, paragraphs, links } = BLOG_INDEX_SEO_PROSE;
  const TitleTag = titleAs ?? 'h2';

  return (
    <section
      className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-sm md:p-8"
      aria-labelledby="blog-seo-intro-heading"
    >
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">{eyebrow}</p>
        ) : null}
        <TitleTag
          id="blog-seo-intro-heading"
          className="mt-3 font-heading text-2xl font-bold tracking-tight text-cams-ink md:text-3xl"
        >
          {title}
        </TitleTag>
        <div className="mt-4 space-y-4 text-base leading-7 text-cams-ink-secondary">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        {links && links.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {links.map((link, index) => (
              <Button
                key={link.href}
                href={link.href}
                variant={index === 0 ? 'primary' : 'secondary'}
              >
                {link.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
