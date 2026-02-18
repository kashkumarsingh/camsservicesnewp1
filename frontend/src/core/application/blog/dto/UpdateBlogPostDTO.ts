/**
 * Update Blog Post DTO
 * 
 * Input DTO for updating blog posts.
 * All fields are optional.
 */

import { BlogCategory, BlogTag } from '../../../domain/blog/entities/BlogPost';

export interface UpdateBlogPostDTO {
  title?: string;
  excerpt?: string;
  content?: string;
  category?: BlogCategory;
  tags?: BlogTag[];
  featuredImage?: string;
  published?: boolean;
}


