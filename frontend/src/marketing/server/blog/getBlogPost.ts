/**
 * Server-side utility for fetching a single blog post
 * 
 * Used in Server Components to fetch blog post details with ISR caching.
 * Resolves API_URL for server-side fetches within Docker network.
 */

import { GetBlogPostUseCase } from '@/core/application/blog/useCases/GetBlogPostUseCase';
import { BlogPostDTO } from '@/core/application/blog';
import { blogRepository } from '@/infrastructure/persistence/blog';
import { getBlogPostBySlug } from '@/marketing/mock/blog-posts';

/**
 * Get a single blog post by slug server-side with ISR caching
 * 
 * @param slug - Blog post slug
 * @returns Blog post DTO or null if not found
 */
export async function getBlogPost(slug: string): Promise<BlogPostDTO | null> {
  const toDtoFromMarketingMock = (targetSlug: string): BlogPostDTO | null => {
    const mock = getBlogPostBySlug(targetSlug);
    if (!mock) return null;

    const nowIso = new Date().toISOString();
    return {
      id: `mock-${mock.slug}`,
      title: mock.title,
      slug: mock.slug.replace(/^blog\//, ''),
      excerpt: mock.excerpt,
      content: mock.body.join('\n\n'),
      author: {
        id: 'cams-team',
        name: 'CAMS Team',
        email: undefined,
        avatar: undefined,
        bio: 'CAMS editorial team',
      },
      category: mock.category
        ? {
            id: mock.category.toLowerCase().replace(/\s+/g, '-'),
            name: mock.category,
            slug: mock.category.toLowerCase().replace(/\s+/g, '-'),
          }
        : undefined,
      tags: [],
      featuredImage: mock.coverImageUrl,
      published: true,
      publishedAt: nowIso,
      views: 0,
      readingTime: Number.parseInt(mock.readTimeLabel, 10) || undefined,
      seo: {
        title: mock.metaTitle,
        description: mock.excerpt,
      },
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  };

  try {
    const useCase = new GetBlogPostUseCase(blogRepository);
    const post = await useCase.execute(slug);
    if (post) {
      return post;
    }

    // Fallback for design/content mocks while backend blog data catches up.
    return toDtoFromMarketingMock(slug) ?? toDtoFromMarketingMock(`blog/${slug}`);
  } catch (error) {
    console.error(`Failed to fetch blog post ${slug}:`, error);
    return toDtoFromMarketingMock(slug) ?? toDtoFromMarketingMock(`blog/${slug}`);
  }
}

