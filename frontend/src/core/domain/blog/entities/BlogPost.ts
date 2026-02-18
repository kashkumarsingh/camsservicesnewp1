/**
 * Blog Post Entity
 * 
 * Domain entity representing a blog post with business rules.
 */

import { BaseEntity } from '../../shared/BaseEntity';
import { BlogSlug } from '../valueObjects/BlogSlug';

export interface BlogAuthor {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export class BlogPost extends BaseEntity {
  private _title: string;
  private _slug: BlogSlug;
  private _excerpt: string;
  private _content: string;
  private _author: BlogAuthor;
  private _category?: BlogCategory;
  private _tags: BlogTag[];
  private _featuredImage?: string;
  private _published: boolean;
  private _publishedAt?: Date;
  private _views: number;
  private _readingTime?: number; // in minutes
  private _seo?: {
    title?: string;
    description?: string;
    og_image?: string;
  };

  private constructor(
    id: string,
    title: string,
    slug: BlogSlug,
    excerpt: string,
    content: string,
    author: BlogAuthor,
    published: boolean = false,
    category?: BlogCategory,
    tags: BlogTag[] = [],
    featuredImage?: string,
    publishedAt?: Date,
    views: number = 0,
    readingTime?: number,
    seo?: {
      title?: string;
      description?: string;
      og_image?: string;
    },
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._title = title;
    this._slug = slug;
    this._excerpt = excerpt;
    this._content = content;
    this._author = author;
    this._category = category;
    this._tags = tags;
    this._featuredImage = featuredImage;
    this._published = published;
    this._publishedAt = publishedAt;
    this._views = views;
    this._readingTime = readingTime;
    this._seo = seo;
  }

  static create(
    id: string,
    title: string,
    excerpt: string,
    content: string,
    author: BlogAuthor,
    slug?: BlogSlug,
    category?: BlogCategory,
    tags: BlogTag[] = [],
    featuredImage?: string,
    published: boolean = false,
    seo?: {
      title?: string;
      description?: string;
      og_image?: string;
    }
  ): BlogPost {
    // Business rules validation
    if (!title || title.trim().length === 0) {
      throw new Error('Blog post title is required');
    }

    if (title.length > 200) {
      throw new Error('Blog post title cannot exceed 200 characters');
    }

    if (!excerpt || excerpt.trim().length === 0) {
      throw new Error('Blog post excerpt is required');
    }

    if (excerpt.length > 500) {
      throw new Error('Blog post excerpt cannot exceed 500 characters');
    }

    if (!content || content.trim().length === 0) {
      throw new Error('Blog post content is required');
    }

    if (content.length > 100000) {
      throw new Error('Blog post content cannot exceed 100000 characters');
    }

    if (!author || !author.id || !author.name) {
      throw new Error('Blog post author is required');
    }

    // Generate slug if not provided
    const blogSlug = slug || BlogSlug.fromTitle(title);

    // Calculate reading time (average reading speed: 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Set published date if publishing
    const publishedAt = published ? new Date() : undefined;

    return new BlogPost(
      id,
      title.trim(),
      blogSlug,
      excerpt.trim(),
      content.trim(),
      author,
      published,
      category,
      tags,
      featuredImage,
      publishedAt,
      0,
      readingTime,
      seo
    );
  }

  get title(): string {
    return this._title;
  }

  get slug(): BlogSlug {
    return this._slug;
  }

  get excerpt(): string {
    return this._excerpt;
  }

  get content(): string {
    return this._content;
  }

  get author(): BlogAuthor {
    return { ...this._author };
  }

  get category(): BlogCategory | undefined {
    return this._category ? { ...this._category } : undefined;
  }

  get tags(): BlogTag[] {
    return [...this._tags];
  }

  get featuredImage(): string | undefined {
    return this._featuredImage;
  }

  get published(): boolean {
    return this._published;
  }

  get publishedAt(): Date | undefined {
    return this._publishedAt;
  }

  get views(): number {
    return this._views;
  }

  get readingTime(): number | undefined {
    return this._readingTime;
  }

  get seo(): { title?: string; description?: string; og_image?: string } | undefined {
    return this._seo;
  }

  isPublished(): boolean {
    return Boolean(this._published) && this._publishedAt !== undefined;
  }

  canBePublished(): boolean {
    const hasTitle = this._title.trim().length > 0;
    const hasExcerpt = this._excerpt.trim().length > 0;
    const hasContent = this._content.trim().length > 0;
    const hasAuthorId = Boolean(this._author?.id && this._author.id.trim().length > 0);
    const hasAuthorName = Boolean(this._author?.name && this._author.name.trim().length > 0);

    return hasTitle && hasExcerpt && hasContent && hasAuthorId && hasAuthorName;
  }

  publish(): void {
    if (!this.canBePublished()) {
      throw new Error('Cannot publish blog post: missing required fields');
    }

    this._published = true;
    this._publishedAt = new Date();
    this.markAsUpdated();
  }

  unpublish(): void {
    this._published = false;
    this._publishedAt = undefined;
    this.markAsUpdated();
  }

  incrementViews(): void {
    this._views += 1;
    this.markAsUpdated();
  }

  updateContent(newContent: string): void {
    if (!newContent || newContent.trim().length === 0) {
      throw new Error('Blog post content cannot be empty');
    }

    if (newContent.length > 100000) {
      throw new Error('Blog post content cannot exceed 100000 characters');
    }

    this._content = newContent.trim();
    
    // Recalculate reading time
    const wordCount = this._content.split(/\s+/).length;
    this._readingTime = Math.ceil(wordCount / 200);

    this.markAsUpdated();
  }

  addTag(tag: BlogTag): void {
    if (!this._tags.find(t => t.id === tag.id)) {
      this._tags.push(tag);
      this.markAsUpdated();
    }
  }

  removeTag(tagId: string): void {
    this._tags = this._tags.filter(t => t.id !== tagId);
    this.markAsUpdated();
  }

  validate(): boolean {
    const hasTitle = this._title.trim().length > 0;
    const hasExcerpt = this._excerpt.trim().length > 0;
    const hasContent = this._content.trim().length > 0;
    const hasAuthorId = Boolean(this._author?.id && this._author.id.trim().length > 0);
    const hasAuthorName = Boolean(this._author?.name && this._author.name.trim().length > 0);

    return hasTitle && hasExcerpt && hasContent && hasAuthorId && hasAuthorName;
  }
}


