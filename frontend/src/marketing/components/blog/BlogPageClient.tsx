"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CamsIcon } from "@/marketing/components/shared/CamsIcon";
import { PageShell } from "@/marketing/components/shared/PageShell";
import { PageHeroBand } from "@/marketing/components/shared/PageHeroBand";
import { PageCtaSection } from "@/marketing/components/shared/PageCtaSection";
import { BLOG_POST_DTOS } from "@/marketing/mock/blog-posts";
import { camsUnsplashPhotoUrl } from "@/marketing/mock/cams-unsplash";
import { fetchPublicApiJson } from "@/marketing/lib/public-api";
import { mapBlogApiPostToDto, type BlogApiPost } from "@/marketing/lib/blog-api-mappers";

export function BlogPageClient(): ReactElement {
  const [posts, setPosts] = useState(BLOG_POST_DTOS);

  useEffect(() => {
    void fetchPublicApiJson<{ success: boolean; data?: BlogApiPost[] }>("/api/v1/blog/posts")
      .then((response) => {
        const rows = response.data ?? [];
        if (rows.length === 0) {
          return;
        }

        setPosts(rows.map((row) => mapBlogApiPostToDto(row, String(row.slug ?? ""))));
      })
      .catch(() => {
        // Keep mock fallback when API is unavailable.
      });
  }, []);

  return (
    <PageShell maxWidthClassName="max-w-[1600px]">
      <PageHeroBand
        title={
          <>
            Blog & <span className="text-cams-primary">Insights</span>
          </>
        }
        description="Expert articles on youth mentoring, behaviour change, emotional wellbeing, and supporting young people."
      />
      <section aria-labelledby="blog-latest-heading" className="space-y-8">
        <header className="text-center">
          <h2
            id="blog-latest-heading"
            className="font-heading text-3xl font-bold md:text-4xl"
          >
            Latest <span className="text-cams-primary">Articles</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-cams-slate">
            Practical ideas from CAMS practitioners. When you are ready to move from reading to
            action, start with{" "}
            <Link href="/referral" className="font-semibold text-cams-primary underline underline-offset-2">
              make a referral
            </Link>{" "}
            or{" "}
            <Link href="/packages" className="font-semibold text-cams-primary underline underline-offset-2">
              compare intervention packages
            </Link>
            .
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => {
            const cardSrc = post.coverImageUrl ?? camsUnsplashPhotoUrl(post.coverPhotoId, 700, 520);
            const cardAlt = `Cover image for ${post.title}`;

            return (
              <article
                key={post.slug}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-2 hover:border-cams-primary hover:shadow-lg"
              >
                <a href={`/${post.slug}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-cams-primary focus-visible:ring-offset-2">
                  <div className="brand-image-frame h-52 w-full">
                    <Image
                      src={cardSrc}
                      alt={cardAlt}
                      className="h-full w-full object-cover"
                      width={700}
                      height={520}
                    />
                  </div>
                </a>
                <div className="p-6">
                  <span className="inline-flex rounded-full bg-cams-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cams-primary">
                    {post.category}
                  </span>
                  <h3 className="mt-3 text-2xl font-bold leading-snug">
                    <a
                      href={`/${post.slug}`}
                      className="inline-flex items-start gap-2 text-cams-dark transition hover:text-cams-primary"
                    >
                      <CamsIcon name={post.icon} surface="light" size={28} className="mt-1 shrink-0" strokeWidth={1.5} />
                      <span>{post.title}</span>
                    </a>
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-cams-slate">{post.excerpt}</p>
                  <div className="mt-4 flex flex-wrap gap-4 border-b border-slate-200 pb-4 text-xs text-cams-slate">
                    <span className="inline-flex items-center gap-1.5">
                      <CamsIcon name="calendar" surface="muted" size={14} strokeWidth={2} />
                      {post.publishedLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CamsIcon name="timer" surface="muted" size={14} strokeWidth={2} />
                      {post.readTimeLabel}
                    </span>
                  </div>
                  <a
                    href={`/${post.slug}`}
                    className="mt-4 inline-flex text-sm font-semibold text-cams-primary"
                  >
                    Read article →
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <PageCtaSection
        heading={
          <>
            Ready for <span className="text-cams-secondary">hands-on support</span>?
          </>
        }
        description="If an article resonates, the next step is a tailored mentoring conversation for your young person."
        actions={[
          { href: "/referral", label: "Make a referral", variant: "primary" },
          { href: "/contact", label: "Talk to our team", variant: "secondary" }
        ]}
      />
    </PageShell>
  );
}
