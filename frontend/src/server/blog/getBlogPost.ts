/**
 * Server-side utility for fetching a single blog post
 * 
 * Used in Server Components to fetch blog post details with ISR caching.
 * Resolves API_URL for server-side fetches within Docker network.
 */

import { GetBlogPostUseCase } from '@/core/application/blog/useCases/GetBlogPostUseCase';
import { BlogPostDTO } from '@/core/application/blog';
import { blogRepository } from '@/infrastructure/persistence/blog';

/**
 * Get a single blog post by slug server-side with ISR caching
 * 
 * @param slug - Blog post slug
 * @returns Blog post DTO or null if not found
 */
export async function getBlogPost(slug: string): Promise<BlogPostDTO | null> {
  try {
    const useCase = new GetBlogPostUseCase(blogRepository);
    const post = await useCase.execute(slug);
    return post;
  } catch (error) {
    console.error(`Failed to fetch blog post ${slug}:`, error);
    // Return null on error (graceful degradation)
    return null;
  }
}

