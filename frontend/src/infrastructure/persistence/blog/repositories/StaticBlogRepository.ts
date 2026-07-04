/**
 * Static Blog Repository
 *
 * Infrastructure implementation using published SEO articles when static mode is enabled.
 */

import { IBlogRepository } from '@/core/application/blog/ports/IBlogRepository';
import { BlogPost } from '@/core/domain/blog/entities/BlogPost';
import { BlogSlug } from '@/core/domain/blog/valueObjects/BlogSlug';
import { BLOG_POST_DTOS } from '@/marketing/mock/blog-posts';
import { marketingBlogPostToDto } from '@/marketing/content/blog/seo-blog-helpers';

export class StaticBlogRepository implements IBlogRepository {
  private postsList: BlogPost[] = [];

  constructor() {
    this.postsList = BLOG_POST_DTOS.map((item) => {
      const dto = marketingBlogPostToDto(item);
      const slug = BlogSlug.fromString(dto.slug);

      return BlogPost.create(
        dto.id,
        dto.title,
        dto.excerpt,
        dto.content,
        dto.author,
        slug,
        dto.category,
        dto.tags,
        dto.featuredImage,
        dto.published,
        dto.seo
      );
    });
  }

  async save(post: BlogPost): Promise<void> {
    const index = this.postsList.findIndex(p => p.id === post.id);
    if (index >= 0) {
      this.postsList[index] = post;
    } else {
      this.postsList.push(post);
    }
  }

  async findById(id: string): Promise<BlogPost | null> {
    return this.postsList.find(p => p.id === id) || null;
  }

  async findBySlug(slug: string): Promise<BlogPost | null> {
    return this.postsList.find(p => p.slug.toString() === slug) || null;
  }

  async findAll(): Promise<BlogPost[]> {
    return [...this.postsList];
  }

  async findPublished(): Promise<BlogPost[]> {
    return this.postsList.filter(p => p.isPublished());
  }

  async findByCategory(categoryId: string): Promise<BlogPost[]> {
    return this.postsList.filter(p => p.category?.id === categoryId);
  }

  async findByTag(tagId: string): Promise<BlogPost[]> {
    return this.postsList.filter(p => p.tags.some(t => t.id === tagId));
  }

  async findByAuthor(authorId: string): Promise<BlogPost[]> {
    return this.postsList.filter(p => p.author.id === authorId);
  }

  async search(query: string): Promise<BlogPost[]> {
    const queryLower = query.toLowerCase();
    return this.postsList.filter(post =>
      post.title.toLowerCase().includes(queryLower) ||
      post.excerpt.toLowerCase().includes(queryLower) ||
      post.content.toLowerCase().includes(queryLower)
    );
  }

  async delete(id: string): Promise<void> {
    this.postsList = this.postsList.filter(p => p.id !== id);
  }
}
