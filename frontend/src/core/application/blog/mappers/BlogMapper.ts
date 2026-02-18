/**
 * Blog Mapper
 * 
 * Converts domain entities ↔ DTOs.
 */

import { BlogPost } from '../../../domain/blog/entities/BlogPost';
import { BlogPostDTO } from '../dto/BlogPostDTO';

export class BlogMapper {
  static toDTO(post: BlogPost): BlogPostDTO {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug.toString(),
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      category: post.category,
      tags: post.tags,
      featuredImage: post.featuredImage,
      published: post.published,
      publishedAt: post.publishedAt?.toISOString(),
      views: post.views,
      readingTime: post.readingTime,
      seo: post.seo,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }

  static toDTOs(posts: BlogPost[]): BlogPostDTO[] {
    return posts.map(post => this.toDTO(post));
  }

  static fromDTO(dto: BlogPostDTO): BlogPost {
    // Note: This is for reconstruction from persisted data
    // For new entities, use BlogPostFactory
    const { BlogSlug } = require('@/core/domain/blog/valueObjects/BlogSlug');
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
      dto.published
    );
  }
}


