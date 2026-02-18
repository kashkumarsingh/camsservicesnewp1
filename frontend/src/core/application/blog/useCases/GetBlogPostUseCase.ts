/**
 * Get Blog Post Use Case
 * 
 * Orchestrates getting a single blog post by ID or slug.
 */

import { BlogPost } from '../../../domain/blog/entities/BlogPost';
import { IBlogRepository } from '../ports/IBlogRepository';
import { BlogMapper } from '../mappers/BlogMapper';
import { BlogPostDTO } from '../dto/BlogPostDTO';

export class GetBlogPostUseCase {
  constructor(private readonly blogRepository: IBlogRepository) {}

  async execute(idOrSlug: string): Promise<BlogPostDTO | null> {
    // Try to find by ID first
    let post = await this.blogRepository.findById(idOrSlug);

    // If not found, try by slug
    if (!post) {
      post = await this.blogRepository.findBySlug(idOrSlug);
    }

    if (!post) {
      return null;
    }

    return BlogMapper.toDTO(post);
  }
}


