/**
 * Increment Views Use Case
 * 
 * Orchestrates incrementing the view count for a blog post.
 */

import { BlogPost } from '../../../domain/blog/entities/BlogPost';
import { IBlogRepository } from '../ports/IBlogRepository';
import { BlogMapper } from '../mappers/BlogMapper';
import { BlogPostDTO } from '../dto/BlogPostDTO';

export class IncrementViewsUseCase {
  constructor(private readonly blogRepository: IBlogRepository) {}

  async execute(idOrSlug: string): Promise<BlogPostDTO | null> {
    // Find post
    let post = await this.blogRepository.findById(idOrSlug);
    if (!post) {
      post = await this.blogRepository.findBySlug(idOrSlug);
    }

    if (!post) {
      return null;
    }

    // Increment views
    post.incrementViews();

    // Save updated post
    await this.blogRepository.save(post);

    return BlogMapper.toDTO(post);
  }
}


