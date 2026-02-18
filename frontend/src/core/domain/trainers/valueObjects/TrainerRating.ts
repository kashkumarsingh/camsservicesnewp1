/**
 * Trainer Rating Value Object
 *
 * Represents trainer rating between 0 and 5 (inclusive) with half-star precision.
 */

import { ValueObject } from '../../shared/ValueObject';

export class TrainerRating extends ValueObject {
  private readonly _value: number;

  private constructor(value: number) {
    super();
    this._value = value;
  }

  get value(): number {
    return this._value;
  }

  static create(value: number): TrainerRating {
    if (value < 0 || value > 5) {
      throw new Error('Trainer rating must be between 0 and 5');
    }

    const rounded = Math.round(value * 2) / 2; // Allow half-star increments
    return new TrainerRating(rounded);
  }

  increase(by: number = 0.5): TrainerRating {
    return TrainerRating.create(Math.min(this._value + by, 5));
  }

  decrease(by: number = 0.5): TrainerRating {
    return TrainerRating.create(Math.max(this._value - by, 0));
  }

  protected valueEquals(other: ValueObject): boolean {
    if (!(other instanceof TrainerRating)) {
      return false;
    }
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toFixed(1);
  }
}

