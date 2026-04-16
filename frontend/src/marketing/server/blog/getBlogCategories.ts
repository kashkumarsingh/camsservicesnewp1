/**
 * Server-side utility for fetching blog categories
 * 
 * Fetches all active blog categories with post counts.
 */

import { getBlogPosts } from './getBlogPosts';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

/**
 * Get all blog categories with post counts
 * 
 * @returns Array of blog categories
 */
export async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    const allPosts = await getBlogPosts({
      published: true,
    });

    // Group posts by category
    const categoryMap = new Map<string, BlogCategory>();

    allPosts.forEach(post => {
      if (post.category) {
        const existing = categoryMap.get(post.category.id);
        if (existing) {
          existing.count++;
        } else {
          categoryMap.set(post.category.id, {
            id: post.category.id,
            name: post.category.name,
            slug: post.category.slug,
            count: 1,
          });
        }
      }
    });

    // Sort by count (descending) then by name
    return Array.from(categoryMap.values()).sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error('[getBlogCategories] Failed to fetch categories:', error);
    return [];
  }
}

