/**
 * Blog Post Factory
 * 
 * Factory for creating blog posts.
 */

import { BlogPost } from '../../../domain/blog/entities/BlogPost';
import { BlogSlug } from '../../../domain/blog/valueObjects/BlogSlug';
import { CreateBlogPostDTO } from '../dto/CreateBlogPostDTO';
import { IIdGenerator } from '../../faq/ports/IIdGenerator';

export class BlogPostFactory {
  constructor(private readonly idGenerator: IIdGenerator) {}

  create(input: CreateBlogPostDTO): BlogPost {
    // Generate ID
    const id = this.idGenerator.generate();

    // Generate slug from title
    const slug = BlogSlug.fromTitle(input.title);

    // Create blog post with business rules enforced
    return BlogPost.create(
      id,
      input.title,
      input.excerpt,
      input.content,
      input.author,
      slug,
      input.category,
      input.tags || [],
      input.featuredImage,
      input.published || false
    );
  }
}


