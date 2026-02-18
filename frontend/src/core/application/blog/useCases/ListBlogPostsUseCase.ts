/**
 * List Blog Posts Use Case
 * 
 * Orchestrates listing blog posts with filters.
 */

import { BlogPost } from '../../../domain/blog/entities/BlogPost';
import { IBlogRepository } from '../ports/IBlogRepository';
import { BlogMapper } from '../mappers/BlogMapper';
import { BlogFilterOptions } from '../dto/BlogFilterOptions';
import { BlogPostDTO } from '../dto/BlogPostDTO';
import { BlogPolicy } from '../../../domain/blog/policies/BlogPolicy';

export class ListBlogPostsUseCase {
  constructor(private readonly blogRepository: IBlogRepository) {}

  async execute(options?: BlogFilterOptions): Promise<BlogPostDTO[]> {
    // Get posts based on filters
    let posts: BlogPost[];

    if (options?.published !== undefined && options.published) {
      posts = await this.blogRepository.findPublished();
    } else if (options?.categoryId) {
      posts = await this.blogRepository.findByCategory(options.categoryId);
    } else if (options?.tagId) {
      posts = await this.blogRepository.findByTag(options.tagId);
    } else if (options?.authorId) {
      posts = await this.blogRepository.findByAuthor(options.authorId);
    } else {
      posts = await this.blogRepository.findAll();
    }

    // Apply search filter
    if (options?.search) {
      const searchLower = options.search.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower)
      );
    }

    // Apply featured filter
    if (options?.featured !== undefined) {
      posts = posts.filter(post => 
        options.featured ? BlogPolicy.isFeatured(post) : !BlogPolicy.isFeatured(post)
      );
    }

    // Apply published filter (if not already filtered)
    if (options?.published !== undefined && !options.published) {
      posts = posts.filter(post => !post.isPublished());
    }

    // Apply sorting
    if (options?.sortBy) {
      const sortOrder = options.sortOrder || 'desc';
      posts.sort((a, b) => {
        let comparison = 0;
        
        switch (options.sortBy) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'publishedAt':
            const aDate = a.publishedAt?.getTime() || 0;
            const bDate = b.publishedAt?.getTime() || 0;
            comparison = aDate - bDate;
            break;
          case 'views':
            comparison = a.views - b.views;
            break;
          case 'createdAt':
            comparison = a.createdAt.getTime() - b.createdAt.getTime();
            break;
          case 'updatedAt':
            comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
            break;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    // Apply pagination
    if (options?.offset !== undefined) {
      posts = posts.slice(options.offset);
    }
    if (options?.limit !== undefined) {
      posts = posts.slice(0, options.limit);
    }

    // Return DTOs
    return BlogMapper.toDTOs(posts);
  }
}


