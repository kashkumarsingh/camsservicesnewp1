import { getBlogPost } from '@/marketing/server/blog/getBlogPost';
import { getBlogPosts } from '@/marketing/server/blog/getBlogPosts';
import { withTimeoutFallback } from '@/marketing/utils/promiseUtils';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

type BlogPostHeadProps = {
  params: Promise<{ slug: string }>;
};

export default async function Head({ params }: BlogPostHeadProps) {
  const { slug } = await params;
  const post = await withTimeoutFallback(getBlogPost(slug), 3500, null);

  if (!post) {
    return null;
  }

  const orderedPosts = await withTimeoutFallback(
    getBlogPosts({
      published: true,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    }),
    3500,
    []
  );

  const currentIndex = orderedPosts.findIndex(candidate => candidate.slug === post.slug);
  const previousSlug =
    currentIndex >= 0 && currentIndex < orderedPosts.length - 1
      ? orderedPosts[currentIndex + 1].slug
      : null;
  const nextSlug = currentIndex > 0 ? orderedPosts[currentIndex - 1].slug : null;

  return (
    <>
      {previousSlug ? <link rel="prev" href={`${BASE_URL}/blog/${previousSlug}`} /> : null}
      {nextSlug ? <link rel="next" href={`${BASE_URL}/blog/${nextSlug}`} /> : null}
    </>
  );
}
