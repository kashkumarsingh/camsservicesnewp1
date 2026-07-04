import type { ReactElement } from "react";
import Link from "next/link";
import { ROUTES } from "@/shared/utils/routes";
import { SEO_BLOG_ARTICLES } from "@/marketing/content/blog";

const RELATED_ARTICLES = SEO_BLOG_ARTICLES.slice(0, 3);

type PackageInternalLinksProps = {
  packageName: string;
};

/** Extra internal links for package detail pages (Semrush: pages with only one internal link). */
export function PackageInternalLinks({ packageName }: PackageInternalLinksProps): ReactElement {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 md:p-8" aria-labelledby="package-explore-heading">
      <h2 id="package-explore-heading" className="text-xl font-bold text-cams-dark md:text-2xl">
        Explore CAMS alongside the {packageName} package
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-cams-slate md:text-base">
        Intervention packages work best when families and referrers understand how chaperone, transport and mentoring
        services fit together. Use the links below to compare services, read commissioning guides, or start a referral.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-cams-dark">Services and referral</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href={ROUTES.SERVICES} className="font-semibold text-cams-primary underline underline-offset-2">
                All CAMS Services
              </Link>
            </li>
            <li>
              <Link href={ROUTES.PACKAGES} className="font-semibold text-cams-primary underline underline-offset-2">
                Compare intervention packages
              </Link>
            </li>
            <li>
              <Link href={ROUTES.REFERRAL} className="font-semibold text-cams-primary underline underline-offset-2">
                Make a referral
              </Link>
            </li>
            <li>
              <Link href={ROUTES.CONTACT} className="font-semibold text-cams-primary underline underline-offset-2">
                Contact our team
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-cams-dark">Related articles</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {RELATED_ARTICLES.map((post) => {
              const slug = post.slug.replace(/^blog\//, "");
              return (
                <li key={post.slug}>
                  <Link
                    href={`${ROUTES.BLOG}/${slug}`}
                    className="font-semibold text-cams-primary underline underline-offset-2"
                  >
                    {post.title}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link href={ROUTES.BLOG} className="font-semibold text-cams-primary underline underline-offset-2">
                All blog articles
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
