/**
 * Blog Repository Interface
 * 
 * Port (interface) for blog repository.
 */

import { BlogPost } from '../../../domain/blog/entities/BlogPost';

export interface IBlogRepository {
  save(post: BlogPost): Promise<void>;
  findById(id: string): Promise<BlogPost | null>;
  findBySlug(slug: string): Promise<BlogPost | null>;
  findAll(): Promise<BlogPost[]>;
  findPublished(): Promise<BlogPost[]>;
  findByCategory(categoryId: string): Promise<BlogPost[]>;
  findByTag(tagId: string): Promise<BlogPost[]>;
  findByAuthor(authorId: string): Promise<BlogPost[]>;
  search(query: string): Promise<BlogPost[]>;
  delete(id: string): Promise<void>;
}


