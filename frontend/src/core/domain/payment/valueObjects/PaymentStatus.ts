/**
 * Payment Status Value Object
 * 
 * Clean Architecture: Domain Layer (Value Object)
 * Purpose: Immutable payment status value object
 * Location: frontend/src/core/domain/payment/valueObjects/PaymentStatus.ts
 * 
 * This value object:
 * - Validates payment status values
 * - Provides status constants
 * - Ensures immutability
 * - Matches backend PaymentStatus value object
 */

export const PaymentStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatusValue = typeof PaymentStatus[keyof typeof PaymentStatus];

const VALID_STATUSES: PaymentStatusValue[] = [
  PaymentStatus.PENDING,
  PaymentStatus.PROCESSING,
  PaymentStatus.COMPLETED,
  PaymentStatus.FAILED,
  PaymentStatus.CANCELLED,
  PaymentStatus.REFUNDED,
];

export class PaymentStatusVO {
  private constructor(private readonly value: PaymentStatusValue) {
    this.validate();
  }

  /**
   * Create a payment status from a string.
   */
  static fromString(value: string): PaymentStatusVO {
    return new PaymentStatusVO(value as PaymentStatusValue);
  }

  static pending(): PaymentStatusVO {
    return new PaymentStatusVO(PaymentStatus.PENDING);
  }

  static processing(): PaymentStatusVO {
    return new PaymentStatusVO(PaymentStatus.PROCESSING);
  }

  static completed(): PaymentStatusVO {
    return new PaymentStatusVO(PaymentStatus.COMPLETED);
  }

  static failed(): PaymentStatusVO {
    return new PaymentStatusVO(PaymentStatus.FAILED);
  }

  static cancelled(): PaymentStatusVO {
    return new PaymentStatusVO(PaymentStatus.CANCELLED);
  }

  static refunded(): PaymentStatusVO {
    return new PaymentStatusVO(PaymentStatus.REFUNDED);
  }

  getValue(): PaymentStatusValue {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  isPending(): boolean {
    return this.value === PaymentStatus.PENDING;
  }

  isProcessing(): boolean {
    return this.value === PaymentStatus.PROCESSING;
  }

  isCompleted(): boolean {
    return this.value === PaymentStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this.value === PaymentStatus.FAILED;
  }

  isCancelled(): boolean {
    return this.value === PaymentStatus.CANCELLED;
  }

  isRefunded(): boolean {
    return this.value === PaymentStatus.REFUNDED;
  }

  static all(): PaymentStatusValue[] {
    return [...VALID_STATUSES];
  }

  private validate(): void {
    if (!VALID_STATUSES.includes(this.value)) {
      throw new Error(
        `Invalid payment status: ${this.value}. Valid statuses: ${VALID_STATUSES.join(', ')}`
      );
    }
  }

  equals(other: PaymentStatusVO): boolean {
    return this.value === other.value;
  }
}

