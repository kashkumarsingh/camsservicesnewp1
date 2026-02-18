/**
 * Activity Slug Value Object
 * 
 * Immutable slug value object for activities.
 * Ensures slug format and validation.
 */

import { ValueObject } from '../../shared/ValueObject';

export class ActivitySlug extends ValueObject {
  private readonly _value: string;

  private constructor(value: string) {
    super();
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  static fromString(value: string): ActivitySlug {
    if (!value || value.trim().length === 0) {
      throw new Error('Activity slug cannot be empty');
    }

    // Validate slug format: lowercase, alphanumeric, hyphens
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(value)) {
      throw new Error('Invalid activity slug format. Must be lowercase alphanumeric with hyphens.');
    }

    if (value.length > 200) {
      throw new Error('Activity slug cannot exceed 200 characters');
    }

    return new ActivitySlug(value);
  }

  static fromName(name: string): ActivitySlug {
    if (!name || name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }

    // Convert name to slug: lowercase, replace spaces with hyphens, remove special chars
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    if (slug.length === 0) {
      throw new Error('Cannot generate slug from name');
    }

    return new ActivitySlug(slug);
  }

  protected valueEquals(other: ValueObject): boolean {
    if (!(other instanceof ActivitySlug)) {
      return false;
    }
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}


