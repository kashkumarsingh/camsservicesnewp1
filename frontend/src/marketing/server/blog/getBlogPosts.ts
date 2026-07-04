/**
 * Server-side utility for fetching blog posts
 *
 * Used in Server Components to fetch blog posts with ISR caching.
 * Resolves API_URL for server-side fetches within Docker network.
 */

import { BlogFilterOptions, BlogPostDTO } from '@/core/application/blog';
import { BLOG_POST_DTOS } from '@/marketing/mock/blog-posts';
import { marketingBlogPostToDto } from '@/marketing/content/blog/seo-blog-helpers';

function marketingPostsAsDtos(): BlogPostDTO[] {
  return BLOG_POST_DTOS.map(marketingBlogPostToDto);
}

function sortPosts(posts: BlogPostDTO[], options?: BlogFilterOptions): BlogPostDTO[] {
  const sortBy = options?.sortBy ?? 'publishedAt';
  const sortOrder = options?.sortOrder ?? 'desc';
  const multiplier = sortOrder === 'asc' ? 1 : -1;

  return [...posts].sort((a, b) => {
    if (sortBy === 'publishedAt') {
      const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return (aTime - bTime) * multiplier;
    }
    return a.title.localeCompare(b.title) * multiplier;
  });
}

/**
 * Get blog posts server-side with ISR caching
 *
 * @param options - Filter options for blog posts
 * @returns Array of blog post DTOs
 */
export async function getBlogPosts(options?: BlogFilterOptions): Promise<BlogPostDTO[]> {
  const mockPosts = marketingPostsAsDtos();
  const publishedOnly = options?.published !== false;
  const filtered = publishedOnly ? mockPosts.filter((post) => post.published) : mockPosts;
  return sortPosts(filtered, options);
}
