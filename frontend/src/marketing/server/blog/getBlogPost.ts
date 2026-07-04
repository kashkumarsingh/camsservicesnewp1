/**
 * Server-side utility for fetching a single blog post
 *
 * Used in Server Components to fetch blog post details with ISR caching.
 * Resolves API_URL for server-side fetches within Docker network.
 */

import { BlogPostDTO } from '@/core/application/blog';
import { getBlogPostBySlug } from '@/marketing/mock/blog-posts';
import { marketingBlogPostToDto } from '@/marketing/content/blog/seo-blog-helpers';
import { isPublicSeoBlogSlug } from '@/marketing/content/blog';

/**
 * Get a single blog post by slug server-side with ISR caching
 *
 * @param slug - Blog post slug
 * @returns Blog post DTO or null if not found
 */
export async function getBlogPost(slug: string): Promise<BlogPostDTO | null> {
  if (!isPublicSeoBlogSlug(slug)) {
    return null;
  }

  const mock = getBlogPostBySlug(slug);
  if (!mock) {
    return null;
  }

  return marketingBlogPostToDto(mock);
}
