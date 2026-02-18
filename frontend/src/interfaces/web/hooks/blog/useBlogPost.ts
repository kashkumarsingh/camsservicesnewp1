/**
 * useBlogPost Hook
 * 
 * Hook for fetching a single blog post.
 */

'use client';

import { useState, useEffect } from 'react';
import { GetBlogPostUseCase } from '@/core/application/blog/useCases/GetBlogPostUseCase';
import { IncrementViewsUseCase } from '@/core/application/blog/useCases/IncrementViewsUseCase';
import { BlogPostDTO } from '@/core/application/blog';
import { blogRepository } from '@/infrastructure/persistence/blog';

export function useBlogPost(idOrSlug: string, incrementViews: boolean = false) {
  const [post, setPost] = useState<BlogPostDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const getUseCase = new GetBlogPostUseCase(blogRepository);
        const result = await getUseCase.execute(idOrSlug);
        
        if (!result) {
          setError(new Error('Blog post not found'));
          return;
        }

        setPost(result);

        // Increment views if requested
        if (incrementViews) {
          const incrementUseCase = new IncrementViewsUseCase(blogRepository);
          await incrementUseCase.execute(idOrSlug);
          // Reload to get updated view count
          const updated = await getUseCase.execute(idOrSlug);
          if (updated) {
            setPost(updated);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load blog post'));
      } finally {
        setLoading(false);
      }
    };

    if (idOrSlug) {
      loadPost();
    }
  }, [idOrSlug, incrementViews]);

  return { post, loading, error };
}


