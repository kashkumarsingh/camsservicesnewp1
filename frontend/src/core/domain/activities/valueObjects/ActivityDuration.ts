/**
 * Activity Duration Value Object
 * 
 * Immutable duration value object for activities.
 * Represents duration in hours.
 */

import { ValueObject } from '../../shared/ValueObject';

export class ActivityDuration extends ValueObject {
  private readonly _hours: number;

  private constructor(hours: number) {
    super();
    this._hours = hours;
  }

  get hours(): number {
    return this._hours;
  }

  static create(hours: number): ActivityDuration {
    if (hours <= 0) {
      throw new Error('Activity duration must be greater than 0');
    }

    if (hours > 24) {
      throw new Error('Activity duration cannot exceed 24 hours');
    }

    return new ActivityDuration(hours);
  }

  toMinutes(): number {
    return this._hours * 60;
  }

  format(): string {
    if (this._hours < 1) {
      return `${Math.round(this._hours * 60)} minutes`;
    }
    if (this._hours === 1) {
      return '1 hour';
    }
    return `${this._hours} hours`;
  }

  protected valueEquals(other: ValueObject): boolean {
    if (!(other instanceof ActivityDuration)) {
      return false;
    }
    return this._hours === other._hours;
  }

  toString(): string {
    return this.format();
  }
}


