/**
 * Package Duration Value Object
 * 
 * Immutable duration value object for packages.
 * Represents hours per week and total weeks.
 */

import { ValueObject } from '../../shared/ValueObject';

export class PackageDuration extends ValueObject {
  private readonly _hoursPerWeek: number;
  private readonly _totalWeeks: number;

  private constructor(hoursPerWeek: number, totalWeeks: number) {
    super();
    this._hoursPerWeek = hoursPerWeek;
    this._totalWeeks = totalWeeks;
  }

  get hoursPerWeek(): number {
    return this._hoursPerWeek;
  }

  get totalWeeks(): number {
    return this._totalWeeks;
  }

  static create(hoursPerWeek: number, totalWeeks: number): PackageDuration {
    if (hoursPerWeek <= 0) {
      throw new Error('Hours per week must be greater than 0');
    }

    if (totalWeeks <= 0) {
      throw new Error('Total weeks must be greater than 0');
    }

    if (hoursPerWeek > 50) {
      throw new Error('Hours per week cannot exceed 50');
    }

    if (totalWeeks > 52) {
      throw new Error('Total weeks cannot exceed 52');
    }

    return new PackageDuration(hoursPerWeek, totalWeeks);
  }

  calculateTotalHours(): number {
    return this._hoursPerWeek * this._totalWeeks;
  }

  format(): string {
    return `${this._hoursPerWeek} hours per week for ${this._totalWeeks} weeks`;
  }

  protected valueEquals(other: ValueObject): boolean {
    if (!(other instanceof PackageDuration)) {
      return false;
    }
    return this._hoursPerWeek === other._hoursPerWeek && this._totalWeeks === other._totalWeeks;
  }

  toString(): string {
    return this.format();
  }
}


