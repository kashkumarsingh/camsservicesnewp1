/**
 * Trainer Slug Value Object
 *
 * Immutable slug value object for trainers.
 * Ensures slug format and validation.
 */

import { ValueObject } from '../../shared/ValueObject';

export class TrainerSlug extends ValueObject {
  private readonly _value: string;

  private constructor(value: string) {
    super();
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  static fromString(value: string): TrainerSlug {
    if (!value || value.trim().length === 0) {
      throw new Error('Trainer slug cannot be empty');
    }

    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(value)) {
      throw new Error('Invalid trainer slug format. Must be lowercase alphanumeric with hyphens.');
    }

    if (value.length > 200) {
      throw new Error('Trainer slug cannot exceed 200 characters');
    }

    return new TrainerSlug(value);
  }

  static fromName(name: string): TrainerSlug {
    if (!name || name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (slug.length === 0) {
      throw new Error('Cannot generate slug from name');
    }

    return new TrainerSlug(slug);
  }

  protected valueEquals(other: ValueObject): boolean {
    if (!(other instanceof TrainerSlug)) {
      return false;
    }
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}

