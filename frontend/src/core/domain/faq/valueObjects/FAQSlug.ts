/**
 * FAQ Slug Value Object
 * 
 * Immutable slug value object for FAQ items.
 * Ensures slug format and validation.
 */

import { ValueObject } from '../../shared/ValueObject';

export class FAQSlug extends ValueObject {
  private readonly _value: string;

  private constructor(value: string) {
    super();
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  static fromString(value: string): FAQSlug {
    if (!value || value.trim().length === 0) {
      throw new Error('FAQ slug cannot be empty');
    }

    // Validate slug format: lowercase, alphanumeric, hyphens
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(value)) {
      throw new Error('Invalid FAQ slug format. Must be lowercase alphanumeric with hyphens.');
    }

    if (value.length > 100) {
      throw new Error('FAQ slug cannot exceed 100 characters');
    }

    return new FAQSlug(value);
  }

  static fromTitle(title: string): FAQSlug {
    if (!title || title.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }

    // Convert title to slug: lowercase, replace spaces with hyphens, remove special chars
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    if (slug.length === 0) {
      throw new Error('Cannot generate slug from title');
    }

    return new FAQSlug(slug);
  }

  protected valueEquals(other: ValueObject): boolean {
    if (!(other instanceof FAQSlug)) {
      return false;
    }
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}


