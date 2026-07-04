import type { ReactElement, ReactNode } from 'react';
import { Button } from '@/marketing/components/ui/button';
import { SEO_INTRO_PANEL_CLASS, type PageSeoLink } from '@/marketing/components/seo/PageSeoProse';
import { cn } from '@/marketing/lib/utils';

export type MarketingSeoOverviewBlock = {
  title: string;
  content: ReactNode;
};

type MarketingSeoOverviewPanelProps = {
  eyebrow?: string;
  title: string;
  headingId: string;
  paragraphs?: readonly string[];
  blocks?: readonly MarketingSeoOverviewBlock[];
  links?: readonly PageSeoLink[];
  className?: string;
  footer?: ReactNode;
};

/** Styled long-form overview for programme and package detail pages (SEO + readable layout). */
export function MarketingSeoOverviewPanel({
  eyebrow,
  title,
  headingId,
  paragraphs,
  blocks,
  links,
  className,
  footer,
}: MarketingSeoOverviewPanelProps): ReactElement {
  return (
    <section className={cn('py-10 md:py-12', className)} aria-labelledby={headingId}>
      <div className="mx-auto max-w-[1600px] px-4 md:px-6">
        <div className={SEO_INTRO_PANEL_CLASS}>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">{eyebrow}</p>
          ) : null}
          <h2 id={headingId} className="mt-3 font-heading text-2xl font-bold tracking-tight text-cams-ink md:text-3xl">
            {title}
          </h2>

          {paragraphs && paragraphs.length > 0 ? (
            <div className="mt-4 max-w-3xl space-y-4 text-base leading-7 text-cams-ink-secondary">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : null}

          {blocks && blocks.length > 0 ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {blocks.map((block) => (
                <article
                  key={block.title}
                  className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-sm"
                >
                  <h3 className="font-heading text-lg font-bold text-cams-ink">{block.title}</h3>
                  <div className="mt-3 text-sm leading-7 text-cams-ink-secondary md:text-base">{block.content}</div>
                </article>
              ))}
            </div>
          ) : null}

          {footer ? <div className="mt-6 max-w-3xl text-sm leading-7 text-cams-ink-secondary">{footer}</div> : null}

          {links && links.length > 0 ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {links.map((link, index) => (
                <Button key={link.href} href={link.href} variant={index === 0 ? 'primary' : 'secondary'}>
                  {link.label}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
