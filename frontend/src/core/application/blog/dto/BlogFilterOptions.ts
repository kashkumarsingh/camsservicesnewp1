/**
 * Blog Filter Options
 * 
 * Filter options for listing blog posts.
 */

export interface BlogFilterOptions {
  search?: string;
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  published?: boolean;
  featured?: boolean;
  sortBy?: 'title' | 'publishedAt' | 'views' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}


