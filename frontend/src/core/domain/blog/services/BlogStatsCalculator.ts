/**
 * Blog Stats Calculator
 * 
 * Domain service for calculating blog statistics.
 */

import { BlogPost } from '../entities/BlogPost';

export class BlogStatsCalculator {
  static calculateTotalPosts(posts: BlogPost[]): number {
    return posts.length;
  }

  static calculatePublishedPosts(posts: BlogPost[]): number {
    return posts.filter(p => p.isPublished()).length;
  }

  static calculateTotalViews(posts: BlogPost[]): number {
    return posts.reduce((total, post) => total + post.views, 0);
  }

  static calculateAverageViews(posts: BlogPost[]): number {
    if (posts.length === 0) {
      return 0;
    }
    return this.calculateTotalViews(posts) / posts.length;
  }

  static findMostViewed(posts: BlogPost[]): BlogPost | null {
    if (posts.length === 0) {
      return null;
    }
    return posts.reduce((mostViewed, post) => 
      post.views > mostViewed.views ? post : mostViewed
    );
  }

  static findMostRecent(posts: BlogPost[]): BlogPost | null {
    if (posts.length === 0) {
      return null;
    }
    return posts.reduce((mostRecent, post) => {
      if (!post.publishedAt) return mostRecent;
      if (!mostRecent.publishedAt) return post;
      return post.publishedAt > mostRecent.publishedAt ? post : mostRecent;
    });
  }

  static calculateAverageReadingTime(posts: BlogPost[]): number {
    if (posts.length === 0) {
      return 0;
    }
    const totalTime = posts.reduce((sum, post) => sum + (post.readingTime || 0), 0);
    return Math.round(totalTime / posts.length);
  }
}


