import type { MarketingBlogPostDTO } from '@/marketing/types/blog';
import type { BlogPostDTO } from '@/core/application/blog';
import { camsUnsplashPhotoUrl } from '@/marketing/mock/cams-unsplash';

const WORDS_PER_MINUTE = 200;

export function estimateReadingTimeMinutes(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(5, Math.ceil(words / WORDS_PER_MINUTE));
}

export function formatReadTimeLabel(content: string): string {
  return `${estimateReadingTimeMinutes(content)} min read`;
}

export function resolveBlogCoverImage(post: MarketingBlogPostDTO): string {
  return post.coverImageUrl ?? camsUnsplashPhotoUrl(post.coverPhotoId, 1600, 720);
}

export function marketingBlogPostToDto(post: MarketingBlogPostDTO): BlogPostDTO {
  const publicSlug = post.slug.replace(/^blog\//, '');
  const readingTime = estimateReadingTimeMinutes(post.content);
  const coverImage = resolveBlogCoverImage(post);

  return {
    id: `seo-${publicSlug}`,
    title: post.title,
    slug: publicSlug,
    excerpt: post.excerpt,
    content: post.content,
    author: {
      id: 'cams-team',
      name: 'CAMS services Team',
      email: undefined,
      avatar: undefined,
      bio: 'Safeguarding-first practitioners across chaperone, transport and mentoring services UK-wide.',
    },
    category: {
      id: post.category.toLowerCase().replace(/\s+/g, '-'),
      name: post.category,
      slug: post.category.toLowerCase().replace(/\s+/g, '-'),
    },
    tags: post.tags.map((name) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    })),
    featuredImage: coverImage,
    featuredImageAlt: post.coverImageAlt,
    published: true,
    publishedAt: post.publishedAt,
    views: 0,
    readingTime,
    faq: post.faq,
    seo: {
      title: post.metaTitle,
      description: post.metaDescription,
      og_image: coverImage,
    },
    createdAt: post.publishedAt,
    updatedAt: post.publishedAt,
  };
}
