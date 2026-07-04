'use client';

import type { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function headingText(children: ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map((child) => headingText(child)).join('');
  if (children && typeof children === 'object' && 'props' in children) {
    return headingText((children as { props: { children?: ReactNode } }).props.children);
  }
  return String(children ?? '');
}

function isInternalHref(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}

type MarkdownLinkProps = {
  href?: string;
  children?: ReactNode;
};

const markdownComponents = {
  h2: ({ children }: { children?: ReactNode }) => {
    const text = headingText(children);
    return (
      <h2 id={slugifyHeading(text)} className="mt-12 scroll-mt-24 text-2xl font-bold text-cams-dark md:text-3xl">
        {children}
      </h2>
    );
  },
  h3: ({ children }: { children?: ReactNode }) => {
    const text = headingText(children);
    return (
      <h3 id={slugifyHeading(text)} className="mt-8 scroll-mt-24 text-xl font-bold text-cams-dark md:text-2xl">
        {children}
      </h3>
    );
  },
  p: ({ children }: { children?: ReactNode }) => (
    <p className="mt-5 leading-8 text-cams-slate">{children}</p>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="mt-5 list-disc space-y-2 pl-6 text-cams-slate">{children}</ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="mt-5 list-decimal space-y-2 pl-6 text-cams-slate">{children}</ol>
  ),
  li: ({ children }: { children?: ReactNode }) => <li className="leading-8">{children}</li>,
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold text-cams-dark">{children}</strong>
  ),
  a: ({ href, children }: MarkdownLinkProps) => {
    if (!href) return <span>{children}</span>;
    const className = 'font-semibold text-cams-primary underline underline-offset-2 hover:text-cams-primary/80';
    if (isInternalHref(href)) {
      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  },
  hr: () => <hr className="my-10 border-slate-200" />,
  table: ({ children }: { children?: ReactNode }) => (
    <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: { children?: ReactNode }) => <thead className="bg-slate-50">{children}</thead>,
  th: ({ children }: { children?: ReactNode }) => (
    <th className="px-4 py-3 font-semibold text-cams-dark">{children}</th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="border-t border-slate-200 px-4 py-3 text-cams-slate">{children}</td>
  ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="my-8 rounded-2xl border border-cams-primary/20 bg-cams-primary/5 px-6 py-5 text-cams-dark">
      {children}
    </blockquote>
  ),
};

type BlogArticleBodyProps = {
  content: string;
};

/** Renders SEO blog markdown with heading anchors, internal/outbound links and CTA blocks. */
export function BlogArticleBody({ content }: BlogArticleBodyProps): ReactElement | null {
  if (!content?.trim()) return null;

  return (
    <div className="blog-article-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
