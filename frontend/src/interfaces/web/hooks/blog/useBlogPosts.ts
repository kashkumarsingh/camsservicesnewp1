/**
 * useBlogPosts Hook
 * 
 * Hook for listing blog posts.
 */

'use client';

import { useState, useEffect } from 'react';
import { ListBlogPostsUseCase } from '@/core/application/blog/useCases/ListBlogPostsUseCase';
import { BlogPostDTO, BlogFilterOptions } from '@/core/application/blog';
import { blogRepository } from '@/infrastructure/persistence/blog';

export function useBlogPosts(options?: BlogFilterOptions) {
  const [posts, setPosts] = useState<BlogPostDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const useCase = new ListBlogPostsUseCase(blogRepository);
        const result = await useCase.execute(options);
        
        setPosts(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load blog posts'));
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [
    options?.search,
    options?.categoryId,
    options?.tagId,
    options?.authorId,
    options?.published,
    options?.featured,
    options?.sortBy,
    options?.sortOrder
  ]);

  return { posts, loading, error };
}


