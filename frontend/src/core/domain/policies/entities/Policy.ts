/**
 * Policy Entity
 * 
 * Domain entity representing a policy document.
 */

import { BaseEntity } from '../../shared/BaseEntity';
import { PolicySlug } from '../valueObjects/PolicySlug';

export type PolicyType = 
  | 'privacy' 
  | 'safeguarding' 
  | 'cancellation' 
  | 'terms-of-service' 
  | 'cookie' 
  | 'payment-refund'
  | 'other';

export class Policy extends BaseEntity {
  private _title: string;
  private _slug: PolicySlug;
  private _type: PolicyType;
  private _content: string;
  private _summary?: string;
  private _lastUpdated: Date;
  private _effectiveDate: Date;
  private _version: string;
  private _views: number;
  private _published: boolean;

  private constructor(
    id: string,
    title: string,
    slug: PolicySlug,
    type: PolicyType,
    content: string,
    lastUpdated: Date,
    effectiveDate: Date,
    version: string,
    summary?: string,
    published: boolean = true,
    views: number = 0,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._title = title;
    this._slug = slug;
    this._type = type;
    this._content = content;
    this._summary = summary;
    this._lastUpdated = lastUpdated;
    this._effectiveDate = effectiveDate;
    this._version = version;
    this._views = views;
    this._published = published;
  }

  static create(
    id: string,
    title: string,
    type: PolicyType,
    content: string,
    effectiveDate: Date,
    version: string,
    slug?: PolicySlug,
    summary?: string,
    published: boolean = true
  ): Policy {
    // Business rules validation
    if (!title || title.trim().length === 0) {
      throw new Error('Policy title is required');
    }

    if (title.length > 200) {
      throw new Error('Policy title cannot exceed 200 characters');
    }

    if (!content || content.trim().length === 0) {
      throw new Error('Policy content is required');
    }

    if (content.length > 50000) {
      throw new Error('Policy content cannot exceed 50000 characters');
    }

    if (!version || version.trim().length === 0) {
      throw new Error('Policy version is required');
    }

    // Generate slug if not provided
    const policySlug = slug || PolicySlug.fromName(title);

    // Set last updated to now
    const lastUpdated = new Date();

    return new Policy(
      id,
      title.trim(),
      policySlug,
      type,
      content.trim(),
      lastUpdated,
      effectiveDate,
      version.trim(),
      summary?.trim(),
      published,
      0
    );
  }

  get title(): string {
    return this._title;
  }

  get slug(): PolicySlug {
    return this._slug;
  }

  get type(): PolicyType {
    return this._type;
  }

  get content(): string {
    return this._content;
  }

  get summary(): string | undefined {
    return this._summary;
  }

  get lastUpdated(): Date {
    return this._lastUpdated;
  }

  get effectiveDate(): Date {
    return this._effectiveDate;
  }

  get version(): string {
    return this._version;
  }

  get views(): number {
    return this._views;
  }

  get published(): boolean {
    return this._published;
  }

  isEffective(): boolean {
    return this._published && this._effectiveDate <= new Date();
  }

  updateContent(newContent: string, newVersion: string): void {
    if (!newContent || newContent.trim().length === 0) {
      throw new Error('Policy content cannot be empty');
    }

    if (newContent.length > 50000) {
      throw new Error('Policy content cannot exceed 50000 characters');
    }

    this._content = newContent.trim();
    this._version = newVersion.trim();
    this._lastUpdated = new Date();
    this.markAsUpdated();
  }

  updateEffectiveDate(date: Date): void {
    this._effectiveDate = date;
    this._lastUpdated = new Date();
    this.markAsUpdated();
  }

  publish(): void {
    this._published = true;
    this._lastUpdated = new Date();
    this.markAsUpdated();
  }

  unpublish(): void {
    this._published = false;
    this._lastUpdated = new Date();
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
      this._version.trim().length > 0 &&
      this._effectiveDate <= new Date()
    );
  }
}


