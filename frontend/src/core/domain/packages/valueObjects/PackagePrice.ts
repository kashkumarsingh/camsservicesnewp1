/**
 * Package Price Value Object
 * 
 * Immutable price value object for packages.
 * Ensures price is valid and provides calculations.
 */

import { ValueObject } from '../../shared/ValueObject';

export class PackagePrice extends ValueObject {
  private readonly _amount: number;
  private readonly _currency: string;

  private constructor(amount: number, currency: string = 'GBP') {
    super();
    this._amount = amount;
    this._currency = currency;
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  static create(amount: number, currency: string = 'GBP'): PackagePrice {
    if (amount < 0) {
      throw new Error('Package price cannot be negative');
    }

    if (amount > 100000) {
      throw new Error('Package price cannot exceed 100000');
    }

    return new PackagePrice(amount, currency);
  }

  calculatePerHour(totalHours: number): number {
    if (totalHours <= 0) {
      throw new Error('Total hours must be greater than 0');
    }
    return this._amount / totalHours;
  }

  format(): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: this._currency,
    }).format(this._amount);
  }

  protected valueEquals(other: ValueObject): boolean {
    if (!(other instanceof PackagePrice)) {
      return false;
    }
    return this._amount === other._amount && this._currency === other._currency;
  }

  toString(): string {
    return this.format();
  }
}


