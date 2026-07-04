/**
 * Legacy static blog data — deprecated.
 * SEO articles live in `@/marketing/content/blog`.
 */

import { BlogAuthor, BlogCategory, BlogTag } from '@/core/domain/blog/entities/BlogPost';

export interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: BlogAuthor;
  category?: BlogCategory;
  tags: BlogTag[];
  featuredImage?: string;
  published: boolean;
  publishedAt?: string;
  views: number;
  readingTime?: number;
}

/** @deprecated Use SEO_BLOG_ARTICLES from @/marketing/content/blog */
export const blogPostsData: BlogPostData[] = [];

export const blogPosts = blogPostsData;
