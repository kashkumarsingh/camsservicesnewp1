/**
 * Payment Method Value Object
 * 
 * Clean Architecture: Domain Layer (Value Object)
 * Purpose: Immutable payment method value object
 * Location: frontend/src/core/domain/payment/valueObjects/PaymentMethod.ts
 * 
 * This value object:
 * - Validates payment method values
 * - Provides method constants
 * - Ensures immutability
 * - Matches backend PaymentMethod value object
 */

export const PaymentMethod = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash',
  OTHER: 'other',
} as const;

export type PaymentMethodValue = typeof PaymentMethod[keyof typeof PaymentMethod];

const VALID_METHODS: PaymentMethodValue[] = [
  PaymentMethod.STRIPE,
  PaymentMethod.PAYPAL,
  PaymentMethod.BANK_TRANSFER,
  PaymentMethod.CASH,
  PaymentMethod.OTHER,
];

export class PaymentMethodVO {
  private constructor(private readonly value: PaymentMethodValue) {
    this.validate();
  }

  /**
   * Create a payment method from a string.
   */
  static fromString(value: string): PaymentMethodVO {
    return new PaymentMethodVO(value as PaymentMethodValue);
  }

  static stripe(): PaymentMethodVO {
    return new PaymentMethodVO(PaymentMethod.STRIPE);
  }

  static paypal(): PaymentMethodVO {
    return new PaymentMethodVO(PaymentMethod.PAYPAL);
  }

  static bankTransfer(): PaymentMethodVO {
    return new PaymentMethodVO(PaymentMethod.BANK_TRANSFER);
  }

  static cash(): PaymentMethodVO {
    return new PaymentMethodVO(PaymentMethod.CASH);
  }

  static other(): PaymentMethodVO {
    return new PaymentMethodVO(PaymentMethod.OTHER);
  }

  getValue(): PaymentMethodValue {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  isStripe(): boolean {
    return this.value === PaymentMethod.STRIPE;
  }

  isPaypal(): boolean {
    return this.value === PaymentMethod.PAYPAL;
  }

  isBankTransfer(): boolean {
    return this.value === PaymentMethod.BANK_TRANSFER;
  }

  isCash(): boolean {
    return this.value === PaymentMethod.CASH;
  }

  static all(): PaymentMethodValue[] {
    return [...VALID_METHODS];
  }

  private validate(): void {
    if (!VALID_METHODS.includes(this.value)) {
      throw new Error(
        `Invalid payment method: ${this.value}. Valid methods: ${VALID_METHODS.join(', ')}`
      );
    }
  }

  equals(other: PaymentMethodVO): boolean {
    return this.value === other.value;
  }
}

