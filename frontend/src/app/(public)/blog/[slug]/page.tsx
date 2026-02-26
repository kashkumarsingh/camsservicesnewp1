import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPost } from '@/server/blog/getBlogPost';
import { getBlogPosts } from '@/server/blog/getBlogPosts';
import { getRelatedPosts } from '@/server/blog/getRelatedPosts';
import { getBlogCategories } from '@/server/blog/getBlogCategories';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, Clock, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import { RichTextBlock } from '@/components/shared/public-page';
import BlogSidebar from './BlogSidebar';
import { ROUTES } from '@/utils/routes';
import { buildPublicMetadata } from '@/server/metadata/buildPublicMetadata';
import { SEO_DEFAULTS } from '@/utils/seoConstants';
import { BLOG_DETAIL_PAGE } from '@/app/(public)/constants/blogDetailPageConstants';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

/** Literal required for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: BLOG_DETAIL_PAGE.META_NOT_FOUND_TITLE,
    };
  }

  const seoTitle = post.seo?.title || post.title;
  const seoDescription = post.seo?.description || post.excerpt || undefined;
  const ogImage =
    post.seo?.og_image || post.featuredImage || `${BASE_URL}/images/og-default.jpg`;
  const imageUrl = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`;

  return buildPublicMetadata(
    {
      title: `${seoTitle} | ${SEO_DEFAULTS.siteName} Blog`,
      description: seoDescription,
      path: `/blog/${slug}`,
      type: 'article',
      imageUrl,
      imageAlt: post.title,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: post.tags.map(tag => tag.name),
    },
    BASE_URL
  );
}

import { withTimeoutFallback } from '@/utils/promiseUtils';
import { formatDate } from '@/utils/formatDate';
import { DATE_FORMAT_LONG } from '@/utils/appConstants';

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await withTimeoutFallback(getBlogPost(slug), 3500, null); // 3.5s timeout – detail page can wait slightly longer

  if (!post) {
    notFound();
  }

  // Fetch sidebar data in parallel with timeouts
  const [relatedPostsResult, recentPostsResult, categoriesResult] = await Promise.allSettled([
    withTimeoutFallback(getRelatedPosts(post, 3), 2500, []),
    withTimeoutFallback(
      getBlogPosts({ published: true, sortBy: 'publishedAt', sortOrder: 'desc' }).then(posts =>
        posts.filter(p => p.id !== post.id).slice(0, 5)
      ),
      2500,
      []
    ),
    withTimeoutFallback(getBlogCategories(), 2500, []),
  ]);

  const relatedPosts = relatedPostsResult.status === 'fulfilled' ? relatedPostsResult.value : [];
  const recentPosts = recentPostsResult.status === 'fulfilled' ? recentPostsResult.value : [];
  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];

  // Generate JSON-LD structured data for BlogPosting
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage ? `${BASE_URL}${post.featuredImage}` : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      image: post.author.avatar ? `${BASE_URL}${post.author.avatar}` : undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: 'CAMS Services',
      url: BASE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${slug}`,
    },
    articleSection: post.category?.name,
    keywords: post.tags.map(tag => tag.name).join(', '),
    wordCount: post.content.split(/\s+/).length,
    timeRequired: post.readingTime ? `PT${post.readingTime}M` : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="min-h-screen">
        {/* Hero Section */}
        {post.featuredImage && (
          <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
              <div className="container mx-auto max-w-4xl">
                {post.category && (
                  <span className="inline-block bg-gradient-to-r from-primary-blue/90 to-light-blue-cyan/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-md">
                    {post.category.name}
                  </span>
                )}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 heading-text-shadow">
                  {post.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                  <span className="flex items-center gap-2">
                    <User size={18} />
                    {post.author.name}
                  </span>
                  {post.publishedAt && (
                    <span className="flex items-center gap-2">
                      <Calendar size={18} />
                      {formatDate(post.publishedAt, DATE_FORMAT_LONG)}
                    </span>
                  )}
                  {post.readingTime && (
                    <span className="flex items-center gap-2">
                      <Clock size={18} />
                      {post.readingTime} min read
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content – warm kid-friendly background */}
        <div className="bg-gradient-to-br from-blue-50/60 via-white to-purple-50/40">
          <div className="container mx-auto max-w-7xl px-4 py-12">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
          {/* Back Button */}
          <Link href={ROUTES.BLOG}>
            <Button variant="bordered" size="sm" className="mb-8">
              <ArrowLeft size={16} className="mr-2" />
              {BLOG_DETAIL_PAGE.BACK_TO_BLOG}
            </Button>
          </Link>

          {/* Title (if no hero image) */}
          {!post.featuredImage && (
            <div className="mb-8">
              {post.category && (
                <span className="inline-block bg-gradient-to-r from-primary-blue/15 to-light-blue-cyan/15 text-navy-blue px-2.5 py-1 rounded-full text-sm font-semibold mb-4">
                  {post.category.name}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-navy-blue mb-4">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-primary-blue font-medium mb-6">
                <span className="flex items-center gap-2">
                  <User size={16} className="text-primary-blue" />
                  {post.author.name}
                </span>
                {post.publishedAt && (
                  <span className="flex items-center gap-2">
                    <Calendar size={16} className="text-star-gold" />
                    {formatDate(post.publishedAt, DATE_FORMAT_LONG)}
                  </span>
                )}
                {post.readingTime && (
                  <span className="flex items-center gap-2">
                    <Clock size={16} className="text-light-blue-cyan" />
                    {post.readingTime} min read
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <div className="text-xl text-navy-blue/85 mb-8 font-light leading-relaxed">
              {post.excerpt}
            </div>
          )}

          {/* Tags – playful pills */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map(tag => (
                <span
                  key={tag.id}
                  className="bg-primary-blue/10 text-navy-blue px-3 py-1 rounded-full text-sm font-medium"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <RichTextBlock
            content={post.content}
            proseClassName="prose prose-lg max-w-none prose-headings:text-navy-blue prose-p:text-navy-blue/90 prose-a:text-primary-blue prose-a:no-underline hover:prose-a:underline prose-strong:text-navy-blue prose-code:text-primary-blue prose-pre:bg-navy-blue prose-pre:text-white"
          />

          {/* Author Bio – soft gradient card */}
          {post.author.bio && (
            <div className="mt-12 pt-8 border-t-2 border-primary-blue/20">
              <div className="flex items-start gap-4 p-6 rounded-card bg-gradient-to-r from-blue-50/80 to-purple-50/50 border border-primary-blue/10">
                {post.author.avatar && (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={80}
                    height={80}
                    className="rounded-full ring-2 ring-primary-blue/20"
                  />
                )}
                <div>
                  <h3 className="text-xl font-heading font-bold text-navy-blue mb-2">
                    {post.author.name}
                  </h3>
                  {post.author.bio && (
                    <p className="text-navy-blue/85">{post.author.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CTA – already gradient */}
          <div className="mt-12 p-8 bg-gradient-to-r from-primary-blue to-light-blue-cyan rounded-card text-white text-center shadow-card">
            <h3 className="text-2xl font-bold mb-4">{BLOG_DETAIL_PAGE.CTA_TITLE}</h3>
            <p className="mb-6 text-lg opacity-90">
              {BLOG_DETAIL_PAGE.CTA_SUBTITLE}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button href={ROUTES.CONTACT} variant="secondary" size="lg" withArrow>
                {BLOG_DETAIL_PAGE.CTA_PRIMARY}
              </Button>
              <Button href={ROUTES.PACKAGES} variant="outlineWhite" size="lg" withArrow>
                {BLOG_DETAIL_PAGE.CTA_SECONDARY}
              </Button>
            </div>
          </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <BlogSidebar
                  currentPost={post}
                  relatedPosts={relatedPosts}
                  recentPosts={recentPosts}
                  categories={categories}
                  shareUrl={`${BASE_URL}/blog/${slug}`}
                />
              </div>
            </div>
          </div>
        </div>
        </div>
      </article>
    </>
  );
}
