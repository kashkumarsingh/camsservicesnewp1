/**
 * Policy Slug Value Object
 * 
 * Immutable slug value object for policies.
 * Ensures slug format and validation.
 */

import { ValueObject } from '../../shared/ValueObject';

export class PolicySlug extends ValueObject {
  private readonly _value: string;

  private constructor(value: string) {
    super();
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  static fromString(value: string): PolicySlug {
    if (!value || value.trim().length === 0) {
      throw new Error('Policy slug cannot be empty');
    }

    // Validate slug format: lowercase, alphanumeric, hyphens
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(value)) {
      throw new Error('Invalid policy slug format. Must be lowercase alphanumeric with hyphens.');
    }

    if (value.length > 100) {
      throw new Error('Policy slug cannot exceed 100 characters');
    }

    return new PolicySlug(value);
  }

  static fromName(name: string): PolicySlug {
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

    return new PolicySlug(slug);
  }

  protected valueEquals(other: ValueObject): boolean {
    if (!(other instanceof PolicySlug)) {
      return false;
    }
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}


