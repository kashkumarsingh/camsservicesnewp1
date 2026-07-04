/**
 * Blog Post DTO
 * 
 * Data transfer object for blog posts.
 */

import { BlogAuthor, BlogCategory, BlogTag } from '../../../domain/blog/entities/BlogPost';

export interface BlogPostDTO {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: BlogAuthor;
  category?: BlogCategory;
  tags: BlogTag[];
  featuredImage?: string;
  featuredImageAlt?: string;
  published: boolean;
  publishedAt?: string;
  views: number;
  readingTime?: number;
  faq?: Array<{ question: string; answer: string }>;
  seo?: {
    title?: string;
    description?: string;
    og_image?: string;
  };
  createdAt: string;
  updatedAt: string;
}


