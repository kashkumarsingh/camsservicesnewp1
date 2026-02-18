/**
 * Blog Formatter
 * 
 * Formats blog-related data for display and storage.
 * Handles slug generation, ID generation, and text formatting.
 */

export class BlogFormatter {
  /**
   * Generate a unique ID for blog post
   * @returns Generated ID
   */
  static generateId(): string {
    return `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate slug from title
   * @param title - Blog post title
   * @returns Generated slug
   */
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Format excerpt (truncate if too long)
   * @param content - Full content
   * @param maxLength - Maximum length (default: 150)
   * @returns Formatted excerpt
   */
  static formatExcerpt(content: string, maxLength: number = 150): string {
    // Remove HTML tags
    const text = content.replace(/<[^>]*>/g, '');
    
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * Format date for display
   * @param date - Date string or Date object
   * @param format - Format style ('short' | 'long' | 'relative')
   * @returns Formatted date string
   */
  static formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (format === 'relative') {
      const now = new Date();
      const diff = now.getTime() - dateObj.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) return 'Today';
      if (days === 1) return 'Yesterday';
      if (days < 7) return `${days} days ago`;
      if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
      if (days < 365) return `${Math.floor(days / 30)} months ago`;
      return `${Math.floor(days / 365)} years ago`;
    }
    
    if (format === 'long') {
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    
    // Short format (default)
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Format reading time
   * @param minutes - Reading time in minutes
   * @returns Formatted reading time string
   */
  static formatReadingTime(minutes: number): string {
    if (minutes < 1) {
      return 'Less than 1 min read';
    }
    if (minutes === 1) {
      return '1 min read';
    }
    return `${Math.ceil(minutes)} min read`;
  }
}

