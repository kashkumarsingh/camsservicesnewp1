/**
 * Server-side utility for fetching a single blog post
 *
 * Used in Server Components to fetch blog post details with ISR caching.
 * Resolves API_URL for server-side fetches within Docker network.
 */

import { GetBlogPostUseCase } from '@/core/application/blog/useCases/GetBlogPostUseCase';
import { BlogPostDTO } from '@/core/application/blog';
import { blogRepository } from '@/infrastructure/persistence/blog';
import { getBlogPostBySlug } from '@/marketing/mock/blog-posts';
import { marketingBlogPostToDto } from '@/marketing/content/blog/seo-blog-helpers';

/**
 * Get a single blog post by slug server-side with ISR caching
 *
 * @param slug - Blog post slug
 * @returns Blog post DTO or null if not found
 */
export async function getBlogPost(slug: string): Promise<BlogPostDTO | null> {
  const toDtoFromMarketingMock = (targetSlug: string): BlogPostDTO | null => {
    const mock = getBlogPostBySlug(targetSlug);
    if (!mock) return null;
    return marketingBlogPostToDto(mock);
  };

  try {
    const useCase = new GetBlogPostUseCase(blogRepository);
    const post = await useCase.execute(slug);
    if (post) {
      return post;
    }

    return toDtoFromMarketingMock(slug) ?? toDtoFromMarketingMock(`blog/${slug}`);
  } catch (error) {
    console.error(`Failed to fetch blog post ${slug}:`, error);
    return toDtoFromMarketingMock(slug) ?? toDtoFromMarketingMock(`blog/${slug}`);
  }
}
