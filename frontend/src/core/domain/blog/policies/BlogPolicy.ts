/**
 * Blog Policy
 * 
 * Business rules for blog posts.
 */

import { BlogPost } from '../entities/BlogPost';

export class BlogPolicy {
  /**
   * Check if blog post can be published
   */
  static canBePublished(post: BlogPost): boolean {
    return post.canBePublished() && post.validate();
  }

  /**
   * Check if blog post requires moderation
   */
  static requiresModeration(post: BlogPost): boolean {
    // Business rule: All posts require moderation before publishing
    return true;
  }

  /**
   * Check if blog post is featured
   */
  static isFeatured(post: BlogPost): boolean {
    // Business rule: Posts with high views or recent publication are featured
    return post.views > 100 || Boolean(post.publishedAt && this.isRecent(post.publishedAt));
  }

  /**
   * Check if date is recent (within last 30 days)
   */
  private static isRecent(date: Date): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date > thirtyDaysAgo;
  }

  /**
   * Check if blog post can be edited
   */
  static canBeEdited(post: BlogPost): boolean {
    return !post.published || Boolean(post.publishedAt && this.isRecent(post.publishedAt));
  }
}


