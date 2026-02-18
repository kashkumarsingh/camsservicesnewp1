/**
 * API Blog Repository
 * 
 * Infrastructure implementation using remote backend API.
 * CMS-agnostic: Works with any backend that provides blog post endpoints.
 */

import { IBlogRepository } from '@/core/application/blog/ports/IBlogRepository';
import { BlogPost } from '@/core/domain/blog/entities/BlogPost';
import { BlogSlug } from '@/core/domain/blog/valueObjects/BlogSlug';
import { BlogAuthor, BlogCategory, BlogTag } from '@/core/domain/blog/entities/BlogPost';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';

/**
 * Remote API Response Format (CMS-agnostic)
 * Matches backend BlogPostController response structure
 */
interface RemoteBlogPostResponse {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  heroImage?: string;
  author: {
    name: string;
    role?: string;
    avatarUrl?: string;
  };
  category?: BlogCategory;
  tags: BlogTag[];
  isFeatured: boolean;
  publishedAt?: string;
  readingTime?: number;
  views: number;
  seo?: {
    title?: string;
    description?: string;
    og_image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export class ApiBlogRepository implements IBlogRepository {

  private toDomain(response: RemoteBlogPostResponse): BlogPost {
    const slug = BlogSlug.fromString(response.slug);
    
    // Map remote author structure to domain BlogAuthor
    const author: BlogAuthor = {
      id: response.author.name.toLowerCase().replace(/\s+/g, '-'), // Generate ID from name
      name: response.author.name,
      email: undefined, // Backend doesn't expose email in public API
      avatar: response.author.avatarUrl,
      bio: response.author.role,
    };
    
    // Map heroImage to featuredImage for domain entity
    const featuredImage = response.heroImage;
    
    // Determine published status from publishedAt
    const published = Boolean(response.publishedAt);
    
    return BlogPost.create(
      response.id,
      response.title,
      response.excerpt,
      response.content,
      author,
      slug,
      response.category,
      response.tags,
      featuredImage,
      published,
      response.seo
    );
  }

  private toApi(post: BlogPost): Partial<RemoteBlogPostResponse> {
    return {
      title: post.title,
      slug: post.slug.toString(),
      excerpt: post.excerpt,
      content: post.content,
      author: {
        name: post.author.name,
        role: post.author.bio,
        avatarUrl: post.author.avatar,
      },
      category: post.category,
      tags: post.tags,
      heroImage: post.featuredImage,
      isFeatured: false, // Would need to be added to domain entity if needed
      publishedAt: post.publishedAt?.toISOString(),
    };
  }

  async save(post: BlogPost): Promise<void> {
    const apiData = this.toApi(post);
    
    try {
      if (post.id.match(/^\d+$/)) {
        // Update existing post
        await apiClient.put<RemoteBlogPostResponse>(
          API_ENDPOINTS.BLOG_POST_BY_SLUG(post.slug.toString()),
          apiData
        );
      } else {
        // New post
        await apiClient.post<RemoteBlogPostResponse>(
          API_ENDPOINTS.BLOG_POSTS,
          apiData
        );
      }
    } catch (error) {
      throw new Error(`Failed to save blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<BlogPost | null> {
    // Backend doesn't expose findById, use findAll and filter
    try {
      const allPosts = await this.findAll();
      return allPosts.find(p => p.id === id) || null;
    } catch (error) {
      throw new Error(`Failed to find blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findBySlug(slug: string): Promise<BlogPost | null> {
    const isServerSide = typeof window === 'undefined';
    const requestOptions: RequestInit | undefined = isServerSide
      ? {
          next: {
            revalidate: 1800, // 30 minutes
            tags: ['blog-posts', `blog-post:${slug}`],
          },
        }
      : {
          cache: 'no-store',
        };

    try {
      const response = await apiClient.get<RemoteBlogPostResponse>(
        API_ENDPOINTS.BLOG_POST_BY_SLUG(slug),
        requestOptions
      );
      
      if (!response.data) {
        return null;
      }
      
      return this.toDomain(response.data);
    } catch (error: any) {
      // Handle 404 errors gracefully
      if (error?.status === 404 || error?.response?.status === 404) {
        return null;
      }
      throw new Error(`Failed to find blog post by slug: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(): Promise<BlogPost[]> {
    const isServerSide = typeof window === 'undefined';
    const requestOptions: RequestInit | undefined = isServerSide
      ? {
          next: {
            revalidate: 1800, // 30 minutes
            tags: ['blog-posts'],
          },
        }
      : {
          cache: 'no-store',
        };

    try {
      // ApiClient unwraps { success: true, data: [...] } to { data: [...] }
      // So response.data is already the array of posts
      const response = await apiClient.get<RemoteBlogPostResponse[]>(
        API_ENDPOINTS.BLOG_POSTS,
        requestOptions
      );
      
      const posts = Array.isArray(response.data) ? response.data : [];
      return posts.map(item => this.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to fetch blog posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findPublished(): Promise<BlogPost[]> {
    const isServerSide = typeof window === 'undefined';
    const requestOptions: RequestInit | undefined = isServerSide
      ? {
          next: {
            revalidate: 1800,
            tags: ['blog-posts'],
          },
        }
      : {
          cache: 'no-store',
        };

    try {
      // ApiClient unwraps { success: true, data: [...] } to { data: [...] }
      const response = await apiClient.get<RemoteBlogPostResponse[]>(
        `${API_ENDPOINTS.BLOG_POSTS}?published=true`,
        requestOptions
      );
      
      const posts = Array.isArray(response.data) ? response.data : [];
      return posts.map(item => this.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to fetch published posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByCategory(categoryId: string): Promise<BlogPost[]> {
    try {
      // ApiClient unwraps { success: true, data: [...] } to { data: [...] }
      const response = await apiClient.get<RemoteBlogPostResponse[]>(
        `${API_ENDPOINTS.BLOG_POSTS}?category_slug=${encodeURIComponent(categoryId)}`
      );
      
      const posts = Array.isArray(response.data) ? response.data : [];
      return posts.map(item => this.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to find posts by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByTag(tagId: string): Promise<BlogPost[]> {
    try {
      // ApiClient unwraps { success: true, data: [...] } to { data: [...] }
      const response = await apiClient.get<RemoteBlogPostResponse[]>(
        `${API_ENDPOINTS.BLOG_POSTS}?tag_slug=${encodeURIComponent(tagId)}`
      );
      
      const posts = Array.isArray(response.data) ? response.data : [];
      return posts.map(item => this.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to find posts by tag: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByAuthor(authorId: string): Promise<BlogPost[]> {
    try {
      // ApiClient unwraps { success: true, data: [...] } to { data: [...] }
      const response = await apiClient.get<RemoteBlogPostResponse[]>(
        `${API_ENDPOINTS.BLOG_POSTS}?author_id=${encodeURIComponent(authorId)}`
      );
      
      const posts = Array.isArray(response.data) ? response.data : [];
      return posts.map(item => this.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to find posts by author: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async search(query: string): Promise<BlogPost[]> {
    try {
      // ApiClient unwraps { success: true, data: [...] } to { data: [...] }
      const response = await apiClient.get<RemoteBlogPostResponse[]>(
        `${API_ENDPOINTS.BLOG_POSTS}?search=${encodeURIComponent(query)}`
      );
      
      const posts = Array.isArray(response.data) ? response.data : [];
      return posts.map(item => this.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to search posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Backend doesn't expose delete endpoint in public API
      throw new Error('Delete operation not supported via public API');
    } catch (error) {
      throw new Error(`Failed to delete post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}


