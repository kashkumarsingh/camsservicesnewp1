/**
 * Blog List Component
 * 
 * Displays a list of blog posts.
 * Can be used in both Server and Client Components.
 */

import BlogPostCard from './BlogPostCard';
import { BlogPostDTO } from '@/core/application/blog';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import { BlogPostSkeleton } from '@/components/ui/Skeleton';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';

interface BlogListProps {
  posts: BlogPostDTO[];
  loading?: boolean;
  error?: Error | null;
}

export default function BlogList({ posts, loading = false, error = null }: BlogListProps) {
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <BlogPostSkeleton count={SKELETON_COUNTS.BLOG_POSTS} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">{EMPTY_STATE.NO_BLOG_POSTS_FOUND.title}</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {posts.map((post) => (
        <BlogPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}


