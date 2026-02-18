/**
 * Create Blog Post DTO
 * 
 * Input DTO for creating blog posts.
 */

import { BlogAuthor, BlogCategory, BlogTag } from '../../../domain/blog/entities/BlogPost';

export interface CreateBlogPostDTO {
  title: string;
  excerpt: string;
  content: string;
  author: BlogAuthor;
  category?: BlogCategory;
  tags?: BlogTag[];
  featuredImage?: string;
  published?: boolean;
}


