import { getBlogPosts } from '@/server/blog/getBlogPosts';
import BlogPageClient from './BlogPageClient';
import { buildPublicMetadata } from '@/server/metadata/buildPublicMetadata';
import { ROUTES } from '@/utils/routes';
import { BLOG_META } from '@/components/blog/blogPageConstants';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

/** Literal required for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

export async function generateMetadata() {
  return buildPublicMetadata(
    {
      title: BLOG_META.TITLE,
      description: BLOG_META.DESCRIPTION,
      path: ROUTES.BLOG,
      imageAlt: 'CAMS Services Blog',
    },
    BASE_URL
  );
}

import { withTimeoutFallback } from '@/utils/promiseUtils';

export default async function BlogPage() {
  // Fetch blog posts server-side with ISR caching and timeout
  const posts = await withTimeoutFallback(
    getBlogPosts({
      published: true,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    }),
    3000, // 3s timeout – show blog shell quickly even if backend is slow
    [] // Fallback to empty array
  );

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'CAMS Services Blog',
    description: 'Expert insights and practical advice for supporting children with SEN',
    url: `${BASE_URL}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'CAMS Services',
      url: BASE_URL,
    },
    blogPost: posts.slice(0, 10).map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: post.featuredImage ? `${BASE_URL}${post.featuredImage}` : undefined,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: {
        '@type': 'Person',
        name: post.author.name,
      },
      url: `${BASE_URL}/blog/${post.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPageClient posts={posts} />
    </>
  );
}
