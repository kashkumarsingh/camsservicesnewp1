'use client';

import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import { BlogPostCard } from '@/interfaces/web/components/blog';
import { BlogPostSkeleton } from '@/components/ui/Skeleton';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import { ROUTES } from '@/utils/routes';
import type { BlogPostDTO } from '@/core/application/blog';

export interface BlogSectionConfig {
  title: string;
  subtitle?: string;
  limit: number;
}

export interface BlogSectionProps {
  config: BlogSectionConfig;
  posts: BlogPostDTO[];
  isLoading: boolean;
}

export function BlogSection({ config, posts, isLoading }: BlogSectionProps) {
  const skeletonCount = Math.min(config.limit, SKELETON_COUNTS.BLOG_POSTS);

  return (
    <Section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy-blue mb-3">{config.title}</h2>
          {config.subtitle && (
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">{config.subtitle}</p>
          )}
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-10">
            <BlogPostSkeleton count={skeletonCount} />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-10">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <div className="text-center">
          <Button href={ROUTES.BLOG} variant="secondary" size="lg" withArrow>
            Read More Articles
          </Button>
        </div>
      </div>
    </Section>
  );
}
