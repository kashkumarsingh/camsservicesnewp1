import type { ReactElement } from 'react';
import Link from 'next/link';
import { BLOG_INDEX_SEO_PROSE } from '@/marketing/content/page-seo-intros';
import { SEO_BLOG_ARTICLES } from '@/marketing/content/blog';
import { ROUTES } from '@/shared/utils/routes';
import { CamsIcon } from '@/marketing/components/shared/CamsIcon';
import { Button } from '@/marketing/components/ui/button';
import { PAGE_LAYOUT, PAGE_SURFACES } from '@/marketing/components/shared/page-layout';

/** Server-rendered intro for /blog (crawlable text-HTML ratio). */
export function BlogSeoIntro(): ReactElement {
  const { eyebrow, title, titleAs, paragraphs, links } = BLOG_INDEX_SEO_PROSE;
  const TitleTag = titleAs ?? 'h2';

  return (
    <section
      className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-cams-soft/70 via-white to-white py-12 md:py-16"
      aria-labelledby="blog-seo-intro-heading"
    >
      <div
        className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-cams-primary/[0.07] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-cams-secondary/[0.08] blur-3xl"
        aria-hidden
      />

      <div className={`${PAGE_LAYOUT.container} relative`}>
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">{eyebrow}</p>
          ) : null}
          <TitleTag
            id="blog-seo-intro-heading"
            className="mt-3 font-heading text-3xl font-bold tracking-tight text-cams-ink md:text-4xl"
          >
            {title}
          </TitleTag>
          <div className="mt-5 space-y-4 text-base leading-7 text-cams-ink-secondary">
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

        <nav
          className="mt-10 rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-sm md:mt-12 md:p-8"
          aria-label="Featured commissioning guides"
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-cams-ink md:text-2xl">Featured guides</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-cams-slate">
                Jump to the topic most relevant to your referral. Each guide covers safeguarding, commissioning
                context, and how CAMS services can support your next step.
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-cams-primary">
              {SEO_BLOG_ARTICLES.length} articles
            </p>
          </div>

          <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {SEO_BLOG_ARTICLES.map((post) => {
              const slug = post.slug.replace(/^blog\//, '');
              return (
                <li key={post.slug}>
                  <Link
                    href={`${ROUTES.BLOG}/${slug}`}
                    className={`group flex h-full flex-col ${PAGE_SURFACES.cardHoverLiftPrimary} p-5`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-flex shrink-0 rounded-xl border border-cams-primary/15 bg-cams-primary/[0.08] p-2">
                        <CamsIcon name={post.icon} size={22} strokeWidth={1.5} />
                      </span>
                      <div className="min-w-0">
                        <span className="inline-flex rounded-full bg-cams-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cams-primary">
                          {post.category}
                        </span>
                        <h3 className="mt-2 text-sm font-bold leading-snug text-cams-dark transition group-hover:text-cams-primary">
                          {post.title}
                        </h3>
                      </div>
                    </div>
                    <span className="mt-4 text-xs font-semibold text-cams-primary">Read guide →</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </section>
  );
}
