import type { ReactElement, ReactNode } from 'react';
import Link from 'next/link';

export type PageSeoLink = {
  href: string;
  label: string;
};

type PageSeoProseProps = {
  eyebrow?: string;
  title: string;
  titleAs?: 'h1' | 'h2';
  paragraphs: readonly string[];
  links?: readonly PageSeoLink[];
  children?: ReactNode;
  className?: string;
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
}: PageSeoProseProps): ReactElement {
  const TitleTag = titleAs;

  return (
    <section
      className={`border-t border-slate-200 bg-white py-12 ${className}`.trim()}
      aria-labelledby="page-seo-prose-heading"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-blue">{eyebrow}</p>
        ) : null}
        <TitleTag id="page-seo-prose-heading" className="mt-2 font-heading text-2xl font-bold text-navy-blue md:text-3xl">
          {title}
        </TitleTag>
        <div className="mt-4 space-y-4 text-base leading-7 text-slate-600">
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
        {links && links.length > 0 ? (
          <p className="mt-6 text-sm leading-6 text-slate-500">
            {links.map((link, index) => (
              <span key={link.href}>
                {index > 0 ? (index === links.length - 1 ? ', and ' : ', ') : null}
                <Link href={link.href} className="font-semibold text-primary-blue underline underline-offset-2">
                  {link.label}
                </Link>
              </span>
            ))}
            .
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
