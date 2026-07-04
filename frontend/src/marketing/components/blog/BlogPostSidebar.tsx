'use client';

import type { ReactElement } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock } from 'lucide-react';
import type { BlogPostDTO } from '@/core/application/blog';
import { ROUTES } from '@/shared/utils/routes';
import { formatDate } from '@/shared/utils/formatDate';
import { DATE_FORMAT_MONTH_DAY } from '@/shared/utils/appConstants';
import { BLOG_SIDEBAR } from '@/marketing/constants/blogDetailPageConstants';
import { BlogContactSidebarForm } from '@/marketing/components/blog/BlogContactSidebarForm';
import { Button } from '@/marketing/components/ui/button';

type BlogPostSidebarProps = {
  currentPost: BlogPostDTO;
  relatedPosts: BlogPostDTO[];
};

export function BlogPostSidebar({ currentPost, relatedPosts }: BlogPostSidebarProps): ReactElement {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start" aria-label="Blog sidebar">
      <BlogContactSidebarForm articleTitle={currentPost.title} articleSlug={currentPost.slug} />

      {relatedPosts.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-cams-dark">
            {BLOG_SIDEBAR.RELATED_TITLE}
          </h2>
          <ul className="mt-4 space-y-4">
            {relatedPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`${ROUTES.BLOG}/${post.slug}`}
                  className="group flex gap-3 rounded-xl border border-transparent p-1 transition hover:border-slate-200 hover:bg-white"
                >
                  {post.featuredImage ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200">
                      <Image
                        src={post.featuredImage}
                        alt={post.featuredImageAlt ?? post.title}
                        fill
                        className="object-cover transition group-hover:scale-105"
                        sizes="64px"
                      />
                    </div>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-cams-dark group-hover:text-cams-primary">
                      {post.title}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-cams-slate">
                      {post.publishedAt ? (
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(post.publishedAt, DATE_FORMAT_MONTH_DAY)}
                        </span>
                      ) : null}
                      {post.readingTime ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          {post.readingTime} min
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-2xl border border-cams-primary/20 bg-gradient-to-br from-cams-primary/10 to-cams-secondary/5 p-5">
        <h2 className="text-base font-bold text-cams-dark">{BLOG_SIDEBAR.REFERRAL_TITLE}</h2>
        <p className="mt-2 text-sm leading-6 text-cams-slate">{BLOG_SIDEBAR.REFERRAL_DESCRIPTION}</p>
        <div className="mt-4 flex flex-col gap-2">
          <Button href={ROUTES.REFERRAL} variant="primary" className="w-full justify-center">
            {BLOG_SIDEBAR.REFERRAL_BUTTON}
          </Button>
          <Button href={ROUTES.PACKAGES} variant="secondary" className="w-full justify-center">
            {BLOG_SIDEBAR.PACKAGES_BUTTON}
          </Button>
        </div>
      </div>
    </aside>
  );
}
