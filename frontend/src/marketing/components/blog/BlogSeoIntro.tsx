import type { ReactElement } from 'react';
import Link from 'next/link';
import { PageSeoProse } from '@/marketing/components/seo/PageSeoProse';
import { BLOG_INDEX_SEO_PROSE } from '@/marketing/content/page-seo-intros';
import { SEO_BLOG_ARTICLES } from '@/marketing/content/blog';
import { ROUTES } from '@/shared/utils/routes';

/** Server-rendered intro for /blog (crawlable text-HTML ratio). */
export function BlogSeoIntro(): ReactElement {
  return (
    <PageSeoProse
      eyebrow={BLOG_INDEX_SEO_PROSE.eyebrow}
      title={BLOG_INDEX_SEO_PROSE.title}
      titleAs={BLOG_INDEX_SEO_PROSE.titleAs}
      paragraphs={BLOG_INDEX_SEO_PROSE.paragraphs}
      links={BLOG_INDEX_SEO_PROSE.links}
      className="border-b border-slate-200"
    >
      <nav className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-6" aria-label="CAMS services articles">
        <h2 className="text-lg font-bold text-navy-blue">Featured guides</h2>
        <ul className="mt-4 space-y-2">
          {SEO_BLOG_ARTICLES.map((post) => {
            const slug = post.slug.replace(/^blog\//, '');
            return (
              <li key={post.slug}>
                <Link
                  href={`${ROUTES.BLOG}/${slug}`}
                  className="text-sm font-semibold text-primary-blue underline underline-offset-2"
                >
                  {post.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </PageSeoProse>
  );
}
