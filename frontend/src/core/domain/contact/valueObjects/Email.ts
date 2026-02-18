/**
 * Email Value Object
 * 
 * Immutable email value object with validation.
 */

import { ValueObject } from '../../shared/ValueObject';

export class Email extends ValueObject {
  private readonly _value: string;

  private constructor(value: string) {
    super();
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  static fromString(value: string): Email {
    if (!value || value.trim().length === 0) {
      throw new Error('Email cannot be empty');
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      throw new Error('Invalid email format');
    }

    // Normalize email (lowercase, trim)
    const normalized = value.toLowerCase().trim();

    if (normalized.length > 255) {
      throw new Error('Email cannot exceed 255 characters');
    }

    return new Email(normalized);
  }

  getDomain(): string {
    const parts = this._value.split('@');
    return parts.length > 1 ? parts[1] : '';
  }

  protected valueEquals(other: ValueObject): boolean {
    if (!(other instanceof Email)) {
      return false;
    }
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}


