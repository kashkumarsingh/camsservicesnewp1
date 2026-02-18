/**
 * Blog Repository Factory
 * 
 * Factory for creating blog repository instances.
 */

import { IBlogRepository } from '@/core/application/blog/ports/IBlogRepository';
import { StaticBlogRepository } from './StaticBlogRepository';
import { ApiBlogRepository } from './ApiBlogRepository';

export type BlogRepositoryType = 'static' | 'api';

/**
 * Create blog repository based on type
 */
export function createBlogRepository(type?: BlogRepositoryType): IBlogRepository {
  const repoType = type || (process.env.NEXT_PUBLIC_BLOG_REPOSITORY as BlogRepositoryType) || 'api';

  switch (repoType) {
    case 'api':
      return new ApiBlogRepository();
    case 'static':
    default:
      return new StaticBlogRepository();
  }
}

/**
 * Default blog repository instance
 */
export const blogRepository = createBlogRepository();


