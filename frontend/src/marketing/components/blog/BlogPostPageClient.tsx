import type { ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, User } from "lucide-react";
import { PageShell } from "@/marketing/components/shared/PageShell";
import { PageCtaSection } from "@/marketing/components/shared/PageCtaSection";
import { RichTextBlock } from "@/components/shared/public-page";
import type { BlogPostDTO } from "@/core/application/blog";
import { ROUTES } from "@/shared/utils/routes";
import { formatDate } from "@/shared/utils/formatDate";
import { DATE_FORMAT_LONG } from "@/shared/utils/appConstants";

type BlogPostPageClientProps = {
  post: BlogPostDTO;
  previousPost?: {
    slug: string;
    title: string;
  } | null;
  nextPost?: {
    slug: string;
    title: string;
  } | null;
};

export function BlogPostPageClient({
  post,
  previousPost = null,
  nextPost = null,
}: BlogPostPageClientProps): ReactElement {
  const heroSrc = post.featuredImage || "/images/og-default.jpg";
  const heroAlt = `Illustration for ${post.title}`;

  return (
    <PageShell maxWidthClassName="max-w-3xl">
      <article className="pb-12">
        <header className="border-b border-slate-200 pb-8">
          {post.category ? (
            <p className="text-sm font-semibold uppercase tracking-wide text-cams-primary">
              {post.category.name}
            </p>
          ) : null}
          <h1 className="mt-3 text-3xl font-bold leading-tight text-cams-dark md:text-4xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-4 text-lg leading-relaxed text-cams-ink-secondary">{post.excerpt}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-cams-slate">
            {post.publishedAt ? (
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={16} />
                {formatDate(post.publishedAt, DATE_FORMAT_LONG)}
              </span>
            ) : null}
            {post.readingTime ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={16} />
                {post.readingTime} min read
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <User size={16} />
              {post.author.name}
            </span>
          </div>
        </header>

        <div className="brand-image-frame mt-10 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <Image src={heroSrc} alt={heroAlt} className="h-auto w-full object-cover" width={1600} height={720} />
        </div>

        <div className="mt-10 text-base leading-8 text-cams-slate md:text-lg">
          <RichTextBlock content={post.content} />
        </div>

        <footer className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          {previousPost || nextPost ? (
            <nav className="mb-5 border-b border-slate-200 pb-5" aria-label="Blog article pagination">
              <p className="text-xs font-semibold uppercase tracking-wide text-cams-slate">Read next</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {previousPost ? (
                  <Link
                    href={`${ROUTES.BLOG}/${previousPost.slug}`}
                    className="rounded-xl border border-slate-200 bg-white p-4 text-sm transition hover:border-cams-primary/40 hover:shadow-sm"
                    aria-label={`Read previous article: ${previousPost.title}`}
                  >
                    <span className="block text-xs font-semibold uppercase tracking-wide text-cams-slate">
                      Previous article
                    </span>
                    <span className="mt-1 block font-semibold text-cams-dark">{previousPost.title}</span>
                  </Link>
                ) : (
                  <div aria-hidden className="hidden md:block" />
                )}
                {nextPost ? (
                  <Link
                    href={`${ROUTES.BLOG}/${nextPost.slug}`}
                    className="rounded-xl border border-slate-200 bg-white p-4 text-sm transition hover:border-cams-primary/40 hover:shadow-sm"
                    aria-label={`Read next article: ${nextPost.title}`}
                  >
                    <span className="block text-xs font-semibold uppercase tracking-wide text-cams-slate">
                      Next article
                    </span>
                    <span className="mt-1 block font-semibold text-cams-dark">{nextPost.title}</span>
                  </Link>
                ) : null}
              </div>
            </nav>
          ) : null}

          <p className="font-semibold text-cams-dark">Continue exploring</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <Link href={ROUTES.BLOG} className="font-semibold text-cams-primary underline underline-offset-2">
              ← All articles
            </Link>
            <Link href={ROUTES.REFERRAL} className="font-semibold text-cams-primary underline underline-offset-2">
              Make a referral
            </Link>
            <Link href={ROUTES.CONTACT} className="font-semibold text-cams-primary underline underline-offset-2">
              Talk to our team
            </Link>
          </div>
        </footer>
      </article>

      <PageCtaSection
        heading={
          <>
            From insight to <span className="text-cams-secondary">action</span>
          </>
        }
        description="If this article resonates, the next step is a conversation about tailored mentoring for your young person."
        actions={[
          { href: ROUTES.REFERRAL, label: "Make a referral", variant: "primary" },
          { href: ROUTES.CONTACT, label: "Contact CAMS", variant: "secondary" },
        ]}
      />
    </PageShell>
  );
}
