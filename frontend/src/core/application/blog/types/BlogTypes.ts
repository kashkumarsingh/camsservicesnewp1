/**
 * Blog Types
 * 
 * Type definitions for blog application layer.
 */

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: BlogAuthor;
  publishedAt: string;
  updatedAt?: string;
  featuredImage?: string;
  tags?: string[];
  category?: string;
  readingTime?: number; // in minutes
  views?: number;
  status: 'draft' | 'published' | 'archived';
}

export interface BlogAuthor {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount?: number;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
}

export interface CreateBlogPostDTO {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  authorId: string;
  featuredImage?: string;
  tags?: string[];
  category?: string;
  status?: BlogPost['status'];
}

export interface UpdateBlogPostDTO {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  tags?: string[];
  category?: string;
  status?: BlogPost['status'];
  views?: number;
  readingTime?: number;
}

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  averageReadingTime: number;
  categoriesCount: number;
  tagsCount: number;
}

export interface BlogFilterOptions {
  category?: string;
  tag?: string;
  authorId?: string;
  search?: string;
  status?: BlogPost['status'];
  limit?: number;
  offset?: number;
  sortBy?: 'publishedAt' | 'updatedAt' | 'views' | 'title';
  sortOrder?: 'asc' | 'desc';
}

