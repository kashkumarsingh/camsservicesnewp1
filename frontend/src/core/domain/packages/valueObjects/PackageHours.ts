/**
 * Package Hours Value Object
 * 
 * Immutable hours value object for packages.
 * Ensures hours are within valid range.
 */

import { ValueObject } from '../../shared/ValueObject';

export class PackageHours extends ValueObject {
  private readonly _value: number;

  private constructor(value: number) {
    super();
    this._value = value;
  }

  get value(): number {
    return this._value;
  }

  static create(value: number): PackageHours {
    if (value < 0) {
      throw new Error('Package hours cannot be negative');
    }

    if (value > 1000) {
      throw new Error('Package hours cannot exceed 1000');
    }

    return new PackageHours(value);
  }

  toWeeks(hoursPerWeek: number): number {
    if (hoursPerWeek <= 0) {
      throw new Error('Hours per week must be greater than 0');
    }
    return Math.ceil(this._value / hoursPerWeek);
  }

  calculateHoursPerWeek(totalWeeks: number): number {
    if (totalWeeks <= 0) {
      throw new Error('Total weeks must be greater than 0');
    }
    return this._value / totalWeeks;
  }

  protected valueEquals(other: ValueObject): boolean {
    if (!(other instanceof PackageHours)) {
      return false;
    }
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toString();
  }
}


