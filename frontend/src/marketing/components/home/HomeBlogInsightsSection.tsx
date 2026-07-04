import type { ReactElement } from "react";
import Link from "next/link";
import { ROUTES } from "@/shared/utils/routes";
import { SEO_BLOG_ARTICLES } from "@/marketing/content/blog";
import { PAGE_LAYOUT } from "@/marketing/components/shared/page-layout";

const FEATURED = SEO_BLOG_ARTICLES.slice(0, 4);

export function HomeBlogInsightsSection(): ReactElement {
  return (
    <section className="border-b border-slate-200/80 bg-white px-4 py-20 md:py-28">
      <div className={PAGE_LAYOUT.container}>
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">Insights</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-cams-ink md:text-4xl">
            Guides for commissioners, schools and families
          </h2>
          <p className="mt-4 text-base leading-8 text-cams-ink-secondary">
            Practical articles on chaperone services, child transport, SEND support, mentoring and family support,
            written for local authorities, schools and parents navigating referrals.
          </p>
        </header>

        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {FEATURED.map((post) => {
            const slug = post.slug.replace(/^blog\//, "");
            return (
              <li key={post.slug}>
                <Link
                  href={`${ROUTES.BLOG}/${slug}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50/50 p-5 transition hover:border-cams-primary/30 hover:bg-white hover:shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-cams-primary">{post.category}</p>
                  <h3 className="mt-2 text-lg font-bold leading-snug text-cams-dark">{post.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-cams-slate">{post.excerpt}</p>
                  <span className="mt-3 inline-block text-sm font-semibold text-cams-primary">Read article →</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-8">
          <Link href={ROUTES.BLOG} className="font-semibold text-cams-primary underline underline-offset-2">
            View all articles
          </Link>
        </p>
      </div>
    </section>
  );
}
