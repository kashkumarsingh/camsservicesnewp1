/**
 * Service Entity
 * 
 * Domain entity representing a service with business rules.
 */

import { BaseEntity } from '../../shared/BaseEntity';
import { ServiceSlug } from '../valueObjects/ServiceSlug';

export class Service extends BaseEntity {
  private _title: string;
  private _summary?: string;
  private _description: string;
  private _body?: string;
  private _slug: ServiceSlug;
  private _icon?: string; // Icon name or component reference
  private _views: number;
  private _category?: string;
  private _published: boolean;
  private _publishAt?: Date;

  private constructor(
    id: string,
    title: string,
    description: string,
    slug: ServiceSlug,
    icon?: string,
    views: number = 0,
    category?: string,
    summary?: string,
    body?: string,
    published: boolean = true,
    publishAt?: Date,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._title = title;
    this._summary = summary;
    this._description = description;
    this._body = body;
    this._slug = slug;
    this._icon = icon;
    this._views = views;
    this._category = category;
    this._published = published;
    this._publishAt = publishAt;
  }

  static create(
    id: string,
    title: string,
    description: string,
    slug?: ServiceSlug,
    icon?: string,
    category?: string,
    summary?: string,
    body?: string,
    published: boolean = true,
    publishAt?: Date
  ): Service {
    // Business rules validation
    if (!title || title.trim().length === 0) {
      throw new Error('Service title is required');
    }

    if (title.length > 200) {
      throw new Error('Service title cannot exceed 200 characters');
    }

    if (!description || description.trim().length === 0) {
      throw new Error('Service description is required');
    }

    if (description.length > 1000) {
      throw new Error('Service description cannot exceed 1000 characters');
    }

    // Generate slug if not provided
    const serviceSlug = slug || ServiceSlug.fromTitle(title);

    return new Service(id, title, description, serviceSlug, icon, 0, category, summary, body, published, publishAt);
  }

  get title(): string {
    return this._title;
  }

  get summary(): string | undefined {
    return this._summary;
  }

  get description(): string {
    return this._description;
  }

  get body(): string | undefined {
    return this._body;
  }

  get slug(): ServiceSlug {
    return this._slug;
  }

  get icon(): string | undefined {
    return this._icon;
  }

  get views(): number {
    return this._views;
  }

  get category(): string | undefined {
    return this._category;
  }

  get published(): boolean {
    return this._published;
  }

  get publishAt(): Date | undefined {
    return this._publishAt;
  }

  canBeViewed(): boolean {
    // Business rule: Only published services can be viewed
    if (!this._published) {
      return false;
    }

    // If publishAt is set, check if it's in the past
    if (this._publishAt && this._publishAt > new Date()) {
      return false;
    }

    return true;
  }

  updateTitle(newTitle: string): void {
    if (!newTitle || newTitle.trim().length === 0) {
      throw new Error('Service title is required');
    }

    if (newTitle.length > 200) {
      throw new Error('Service title cannot exceed 200 characters');
    }

    this._title = newTitle;
    this.markAsUpdated();
  }

  updateDescription(newDescription: string): void {
    if (!newDescription || newDescription.trim().length === 0) {
      throw new Error('Service description is required');
    }

    if (newDescription.length > 1000) {
      throw new Error('Service description cannot exceed 1000 characters');
    }

    this._description = newDescription;
    this.markAsUpdated();
  }

  updateIcon(icon?: string): void {
    this._icon = icon;
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
      this._description.trim().length > 0 &&
      this._title.length <= 200 &&
      this._description.length <= 1000
    );
  }
}


