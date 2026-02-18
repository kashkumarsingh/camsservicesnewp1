/**
 * FAQ Item Entity
 * 
 * Domain entity representing a FAQ item with business rules.
 */

import { BaseEntity } from '../../shared/BaseEntity';
import { FAQSlug } from '../valueObjects/FAQSlug';
import { FAQItemCreatedEvent, FAQItemUpdatedEvent, FAQItemViewedEvent } from '../events/FAQItemCreatedEvent';

export class FAQItem extends BaseEntity {
  private _title: string;
  private _content: string;
  private _slug: FAQSlug;
  private _views: number;
  private _category?: string;

  private constructor(
    id: string,
    title: string,
    content: string,
    slug: FAQSlug,
    views: number = 0,
    category?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._title = title;
    this._content = content;
    this._slug = slug;
    this._views = views;
    this._category = category;
  }

  static create(
    id: string,
    title: string,
    content: string,
    slug?: FAQSlug,
    category?: string
  ): FAQItem {
    // Business rules validation
    if (!title || title.trim().length === 0) {
      throw new Error('FAQ title is required');
    }

    if (title.length > 200) {
      throw new Error('FAQ title cannot exceed 200 characters');
    }

    if (!content || content.trim().length === 0) {
      throw new Error('FAQ content is required');
    }

    if (content.length > 5000) {
      throw new Error('FAQ content cannot exceed 5000 characters');
    }

    // Generate slug if not provided
    const faqSlug = slug || FAQSlug.fromTitle(title);

    return new FAQItem(id, title, content, faqSlug, 0, category);
  }

  get title(): string {
    return this._title;
  }

  get content(): string {
    return this._content;
  }

  get slug(): FAQSlug {
    return this._slug;
  }

  get views(): number {
    return this._views;
  }

  get category(): string | undefined {
    return this._category;
  }

  canBeEdited(): boolean {
    // Business rule: FAQ can always be edited
    return true;
  }

  updateTitle(newTitle: string): void {
    if (!newTitle || newTitle.trim().length === 0) {
      throw new Error('FAQ title is required');
    }

    if (newTitle.length > 200) {
      throw new Error('FAQ title cannot exceed 200 characters');
    }

    this._title = newTitle;
    this.markAsUpdated();
  }

  updateContent(newContent: string): void {
    if (!newContent || newContent.trim().length === 0) {
      throw new Error('FAQ content is required');
    }

    if (newContent.length > 5000) {
      throw new Error('FAQ content cannot exceed 5000 characters');
    }

    this._content = newContent;
    this.markAsUpdated();
  }

  updateCategory(category?: string): void {
    this._category = category;
    this.markAsUpdated();
  }

  incrementViews(): void {
    this._views += 1;
    this.markAsUpdated();
  }

  validate(): boolean {
    return (
      this._title.trim().length > 0 &&
      this._content.trim().length > 0 &&
      this._title.length <= 200 &&
      this._content.length <= 5000
    );
  }
}


