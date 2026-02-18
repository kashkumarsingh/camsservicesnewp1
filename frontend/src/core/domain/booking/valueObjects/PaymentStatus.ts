/**
 * Payment Status Value Object
 * Represents the payment state of a booking
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export class PaymentStatusVO {
  private constructor(private readonly value: PaymentStatus) {
    if (!Object.values(PaymentStatus).includes(value)) {
      throw new Error(`Invalid payment status: ${value}`);
    }
  }

  static create(status: PaymentStatus): PaymentStatusVO {
    return new PaymentStatusVO(status);
  }

  getValue(): PaymentStatus {
    return this.value;
  }

  isPending(): boolean {
    return this.value === PaymentStatus.PENDING;
  }

  isPaid(): boolean {
    return this.value === PaymentStatus.PAID;
  }

  isPartial(): boolean {
    return this.value === PaymentStatus.PARTIAL;
  }

  isRefunded(): boolean {
    return this.value === PaymentStatus.REFUNDED;
  }

  isFailed(): boolean {
    return this.value === PaymentStatus.FAILED;
  }

  canProcessPayment(): boolean {
    return this.value === PaymentStatus.PENDING || this.value === PaymentStatus.PARTIAL;
  }

  equals(other: PaymentStatusVO): boolean {
    return this.value === other.value;
  }
}


