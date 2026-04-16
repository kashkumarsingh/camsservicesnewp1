import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPost } from '@/marketing/server/blog/getBlogPost';
import { BlogPostPageClient } from '@/marketing/components/blog/BlogPostPageClient';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { SEO_DEFAULTS } from '@/marketing/utils/seoConstants';
import { BLOG_DETAIL_PAGE } from '@/app/(public)/constants/blogDetailPageConstants';
import { getBlogPosts } from '@/marketing/server/blog/getBlogPosts';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

/** Literal required for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

type AdjacentPostLink = {
  slug: string;
  title: string;
};

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

import { withTimeoutFallback } from '@/marketing/utils/promiseUtils';

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await withTimeoutFallback(getBlogPost(slug), 3500, null); // 3.5s timeout – detail page can wait slightly longer

  if (!post) {
    notFound();
  }

  const orderedPosts = await withTimeoutFallback(
    getBlogPosts({
      published: true,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    }),
    3500,
    []
  );

  const currentIndex = orderedPosts.findIndex(candidate => candidate.slug === post.slug);
  const previousPost: AdjacentPostLink | null =
    currentIndex >= 0 && currentIndex < orderedPosts.length - 1
      ? {
          slug: orderedPosts[currentIndex + 1].slug,
          title: orderedPosts[currentIndex + 1].title,
        }
      : null;
  const nextPost: AdjacentPostLink | null =
    currentIndex > 0
      ? {
          slug: orderedPosts[currentIndex - 1].slug,
          title: orderedPosts[currentIndex - 1].title,
        }
      : null;

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
      <BlogPostPageClient post={post} previousPost={previousPost} nextPost={nextPost} />
    </>
  );
}
