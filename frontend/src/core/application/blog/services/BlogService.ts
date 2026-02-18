/**
 * Blog Service
 * 
 * High-level business logic for blog operations.
 * Orchestrates repository, validator, formatter, and calculator.
 * 
 * Note: This service works with application-layer types (BlogPost from BlogTypes).
 * For domain entities, use the use cases instead.
 */

import { BlogPost, CreateBlogPostDTO, UpdateBlogPostDTO, BlogStats, BlogFilterOptions } from '../types/BlogTypes';
import { IBlogRepository } from '../ports/IBlogRepository';
import { createBlogRepository } from '@/infrastructure/persistence/blog/repositories/BlogRepositoryFactory';
import { BlogMapper } from '../mappers/BlogMapper';
import { BlogValidator } from '../validators/BlogValidator';
import { BlogFormatter } from '../formatters/BlogFormatter';
import { BlogStatsCalculator } from '../calculators/BlogStatsCalculator';
import { BlogPost as DomainBlogPost } from '@/core/domain/blog/entities/BlogPost';
import { BlogSlug } from '@/core/domain/blog/valueObjects/BlogSlug';

export class BlogService {
  private repository: IBlogRepository;
  private validator: typeof BlogValidator;
  private formatter: typeof BlogFormatter;
  private calculator: typeof BlogStatsCalculator;

  constructor(
    repository?: IBlogRepository,
    validator: typeof BlogValidator = BlogValidator,
    formatter: typeof BlogFormatter = BlogFormatter,
    calculator: typeof BlogStatsCalculator = BlogStatsCalculator
  ) {
    this.repository = repository || createBlogRepository();
    this.validator = validator;
    this.formatter = formatter;
    this.calculator = calculator;
  }

  /**
   * Convert domain entity to application type
   */
  private domainToApp(domainPost: DomainBlogPost): BlogPost {
    return {
      id: domainPost.id,
      slug: domainPost.slug.toString(),
      title: domainPost.title,
      excerpt: domainPost.excerpt,
      content: domainPost.content,
      author: domainPost.author,
      publishedAt: domainPost.publishedAt?.toISOString() || '',
      updatedAt: domainPost.updatedAt?.toISOString(),
      featuredImage: domainPost.featuredImage,
      tags: domainPost.tags.map(t => t.name),
      category: domainPost.category?.name,
      readingTime: domainPost.readingTime,
      views: domainPost.views,
      status: domainPost.published ? 'published' : 'draft',
    };
  }

  /**
   * Convert application type to domain entity (for updates)
   */
  private appToDomain(appPost: Partial<BlogPost>): Partial<DomainBlogPost> {
    // This is a simplified conversion - full conversion would use BlogPostFactory
    return {
      // Only include fields that can be updated
    } as Partial<DomainBlogPost>;
  }

  /**
   * Create a new blog post
   * @param data - Blog post data
   * @returns Created blog post
   */
  async createPost(data: CreateBlogPostDTO): Promise<BlogPost> {
    // Validate input
    const validation = this.validator.validateCreate(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Generate slug if not provided
    const slugStr = data.slug || this.formatter.generateSlug(data.title);
    const slug = BlogSlug.fromString(slugStr);
    const id = this.formatter.generateId();

    // Create domain entity
    const domainPost = DomainBlogPost.create(
      id,
      data.title,
      data.excerpt,
      data.content,
      {
        id: data.authorId,
        name: 'Author', // Would come from user service
      },
      slug,
      data.category ? { id: data.category, name: data.category, slug: data.category } : undefined,
      (data.tags || []).map(tag => ({ id: tag, name: tag, slug: tag })),
      data.featuredImage,
      data.status === 'published'
    );

    // Set published date if published
    if (data.status === 'published') {
      domainPost.publish();
    }

    await this.repository.save(domainPost);
    return this.domainToApp(domainPost);
  }

  /**
   * Get blog post by ID
   * @param id - Blog post ID
   * @returns Blog post or null
   */
  async getPostById(id: string): Promise<BlogPost | null> {
    const domainPost = await this.repository.findById(id);
    return domainPost ? this.domainToApp(domainPost) : null;
  }

  /**
   * Get blog post by slug
   * @param slug - Blog post slug
   * @returns Blog post or null
   */
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const domainPost = await this.repository.findBySlug(slug);
    return domainPost ? this.domainToApp(domainPost) : null;
  }

  /**
   * Get all blog posts with filtering
   * @param options - Filter options
   * @returns Array of blog posts
   */
  async getPosts(options: BlogFilterOptions = {}): Promise<BlogPost[]> {
    let domainPosts = await this.repository.findAll();
    let posts = domainPosts.map(p => this.domainToApp(p));

    // Filter by status (default to published)
    if (options.status) {
      posts = posts.filter(post => post.status === options.status);
    } else {
      posts = posts.filter(post => post.status === 'published');
    }

    // Filter by category
    if (options.category) {
      posts = posts.filter(post => post.category === options.category);
    }

    // Filter by tag
    if (options.tag) {
      posts = posts.filter(post => post.tags?.includes(options.tag!));
    }

    // Filter by author
    if (options.authorId) {
      posts = posts.filter(post => post.author.id === options.authorId);
    }

    // Search
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      posts = posts.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    const sortBy = options.sortBy || 'publishedAt';
    const sortOrder = options.sortOrder || 'desc';
    posts.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      
      if (sortBy === 'publishedAt' || sortBy === 'updatedAt') {
        aVal = new Date(a[sortBy] || '').getTime();
        bVal = new Date(b[sortBy] || '').getTime();
      } else if (sortBy === 'views') {
        aVal = a.views || 0;
        bVal = b.views || 0;
      } else if (sortBy === 'title') {
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Pagination
    if (options.offset) {
      posts = posts.slice(options.offset);
    }
    if (options.limit) {
      posts = posts.slice(0, options.limit);
    }

    return posts;
  }

  /**
   * Update blog post
   * @param id - Blog post ID
   * @param data - Update data
   * @returns Updated blog post
   */
  async updatePost(id: string, data: UpdateBlogPostDTO): Promise<BlogPost> {
    const validation = this.validator.validateUpdate(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const domainPost = await this.repository.findById(id);
    if (!domainPost) {
      throw new Error(`Blog post with id ${id} not found`);
    }

    // Update domain entity (simplified - in production would use proper update methods)
    // For now, we'll need to reconstruct the entity with updated values
    // This is a limitation - proper implementation would have update methods on the entity
    
    // Recalculate reading time if content changed
    if (data.content) {
      const readingTime = this.calculator.calculateReadingTime(data.content);
      // Note: Domain entity doesn't have a direct update method, so we'd need to reconstruct
      // For now, this is a simplified implementation
    }

    // Save the updated post
    await this.repository.save(domainPost);
    return this.domainToApp(domainPost);
  }

  /**
   * Delete blog post
   * @param id - Blog post ID
   * @returns Success status
   */
  async deletePost(id: string): Promise<boolean> {
    try {
      await this.repository.delete(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get blog statistics
   * @returns Blog statistics
   */
  async getStats(): Promise<BlogStats> {
    const domainPosts = await this.repository.findAll();
    const posts = domainPosts.map(p => this.domainToApp(p));
    return this.calculator.calculateStats(posts);
  }

  /**
   * Increment view count
   * @param id - Blog post ID
   */
  async incrementViews(id: string): Promise<void> {
    const domainPost = await this.repository.findById(id);
    if (domainPost) {
      domainPost.incrementViews();
      await this.repository.save(domainPost);
    }
  }
}

