/**
 * Blog Stats Calculator
 * 
 * Calculates blog-related statistics.
 */

import { BlogPost, BlogStats } from '../types/BlogTypes';

export class BlogStatsCalculator {
  /**
   * Calculate reading time from content
   * @param content - Blog post content
   * @returns Reading time in minutes
   */
  static calculateReadingTime(content: string): number {
    // Remove HTML tags
    const text = content.replace(/<[^>]*>/g, '');
    
    // Average reading speed: 200 words per minute
    const words = text.split(/\s+/).filter(word => word.length > 0).length;
    const minutes = Math.ceil(words / 200);
    
    return Math.max(1, minutes); // Minimum 1 minute
  }

  /**
   * Calculate blog statistics
   * @param posts - Array of blog posts
   * @returns Blog statistics
   */
  static calculateStats(posts: BlogPost[]): BlogStats {
    const publishedPosts = posts.filter(post => post.status === 'published');
    const draftPosts = posts.filter(post => post.status === 'draft');
    
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
    const totalReadingTime = posts.reduce((sum, post) => sum + (post.readingTime || 0), 0);
    const averageReadingTime = publishedPosts.length > 0 
      ? totalReadingTime / publishedPosts.length 
      : 0;
    
    // Get unique categories and tags
    const categories = new Set(posts.map(post => post.category).filter(Boolean));
    const tags = new Set(posts.flatMap(post => post.tags || []));
    
    return {
      totalPosts: posts.length,
      publishedPosts: publishedPosts.length,
      draftPosts: draftPosts.length,
      totalViews,
      averageReadingTime: Math.round(averageReadingTime * 10) / 10,
      categoriesCount: categories.size,
      tagsCount: tags.size,
    };
  }

  /**
   * Get most popular posts
   * @param posts - Array of blog posts
   * @param limit - Number of posts to return
   * @returns Array of popular posts
   */
  static getPopularPosts(posts: BlogPost[], limit: number = 5): BlogPost[] {
    return posts
      .filter(post => post.status === 'published')
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  }

  /**
   * Get recent posts
   * @param posts - Array of blog posts
   * @param limit - Number of posts to return
   * @returns Array of recent posts
   */
  static getRecentPosts(posts: BlogPost[], limit: number = 5): BlogPost[] {
    return posts
      .filter(post => post.status === 'published')
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }
}

