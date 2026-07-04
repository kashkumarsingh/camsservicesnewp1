import type { ReactElement, ReactNode } from 'react';
import { Button } from '@/marketing/components/ui/button';
import { cn } from '@/marketing/lib/utils';

export type PageSeoLink = {
  href: string;
  label: string;
};

export const SEO_INTRO_PANEL_CLASS =
  'rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-sm md:p-8';

type PageSeoProseProps = {
  eyebrow?: string;
  title: string;
  titleAs?: 'h1' | 'h2';
  paragraphs: readonly string[];
  links?: readonly PageSeoLink[];
  children?: ReactNode;
  className?: string;
  /** panel = card inside a page shell; section = standalone full-width block */
  variant?: 'panel' | 'section';
  headingId?: string;
};

/** Server-rendered prose block for crawlable text-HTML ratio and word count. */
export function PageSeoProse({
  eyebrow,
  title,
  titleAs = 'h2',
  paragraphs,
  links,
  children,
  className = '',
  variant = 'panel',
  headingId = 'page-seo-prose-heading',
}: PageSeoProseProps): ReactElement {
  const TitleTag = titleAs;

  const content = (
    <div className={cn(variant === 'panel' && SEO_INTRO_PANEL_CLASS)}>
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">{eyebrow}</p>
        ) : null}
        <TitleTag
          id={headingId}
          className="mt-3 font-heading text-2xl font-bold tracking-tight text-cams-ink md:text-3xl"
        >
          {title}
        </TitleTag>
        <div className="mt-4 space-y-4 text-base leading-7 text-cams-ink-secondary">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        {children}
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
    </div>
  );

  if (variant === 'panel') {
    return (
      <section className={className} aria-labelledby={headingId}>
        {content}
      </section>
    );
  }

  return (
    <section
      className={cn(
        'border-b border-slate-200/80 bg-gradient-to-b from-cams-soft/50 to-white py-12 md:py-16',
        className,
      )}
      aria-labelledby={headingId}
    >
      <div className="mx-auto max-w-[1600px] px-4 md:px-6">{content}</div>
    </section>
  );
}
