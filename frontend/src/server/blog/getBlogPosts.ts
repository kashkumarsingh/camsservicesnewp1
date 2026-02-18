/**
 * Server-side utility for fetching blog posts
 * 
 * Used in Server Components to fetch blog posts with ISR caching.
 * Resolves API_URL for server-side fetches within Docker network.
 */

import { ListBlogPostsUseCase } from '@/core/application/blog/useCases/ListBlogPostsUseCase';
import { BlogFilterOptions, BlogPostDTO } from '@/core/application/blog';
import { blogRepository } from '@/infrastructure/persistence/blog';

/**
 * Get blog posts server-side with ISR caching
 * 
 * @param options - Filter options for blog posts
 * @returns Array of blog post DTOs
 */
export async function getBlogPosts(options?: BlogFilterOptions): Promise<BlogPostDTO[]> {
  try {
    console.log('[getBlogPosts] Fetching blog posts with options:', options);
    const useCase = new ListBlogPostsUseCase(blogRepository);
    const posts = await useCase.execute(options);
    console.log('[getBlogPosts] Successfully fetched', posts.length, 'posts');
    return posts;
  } catch (error) {
    console.error('[getBlogPosts] Failed to fetch blog posts:', error);
    if (error instanceof Error) {
      console.error('[getBlogPosts] Error message:', error.message);
      console.error('[getBlogPosts] Error stack:', error.stack);
    }
    // Return empty array on error (graceful degradation)
    return [];
  }
}

