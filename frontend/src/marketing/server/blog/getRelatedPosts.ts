/**
 * Server-side utility for fetching related blog posts
 * 
 * Fetches posts from the same category or with similar tags.
 */

import { getBlogPosts } from './getBlogPosts';
import { BlogPostDTO } from '@/core/application/blog';

/**
 * Get related blog posts (same category or similar tags)
 * 
 * @param currentPost - The current blog post
 * @param limit - Maximum number of related posts to return
 * @returns Array of related blog post DTOs
 */
export async function getRelatedPosts(
  currentPost: BlogPostDTO,
  limit: number = 3
): Promise<BlogPostDTO[]> {
  try {
    const allPosts = await getBlogPosts({
      published: true,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    });

    // Filter out the current post
    const otherPosts = allPosts.filter(post => post.id !== currentPost.id);

    // Prioritize posts with same category
    const sameCategoryPosts = currentPost.category
      ? otherPosts.filter(post => post.category?.id === currentPost.category?.id)
      : [];

    // Then posts with similar tags
    const currentTagIds = new Set(currentPost.tags.map(tag => tag.id));
    const similarTagPosts = otherPosts.filter(post =>
      post.tags.some(tag => currentTagIds.has(tag.id))
    );

    // Combine and deduplicate
    const related = [
      ...sameCategoryPosts,
      ...similarTagPosts.filter(post => !sameCategoryPosts.find(p => p.id === post.id)),
    ];

    // If not enough related posts, add recent posts
    if (related.length < limit) {
      const recentPosts = otherPosts
        .filter(post => !related.find(p => p.id === post.id))
        .slice(0, limit - related.length);
      related.push(...recentPosts);
    }

    return related.slice(0, limit);
  } catch (error) {
    console.error('[getRelatedPosts] Failed to fetch related posts:', error);
    return [];
  }
}

