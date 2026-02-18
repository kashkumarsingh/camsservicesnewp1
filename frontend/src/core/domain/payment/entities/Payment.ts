/**
 * Payment Entity
 * 
 * Clean Architecture: Domain Layer (Entity)
 * Purpose: Represents a payment transaction in the system
 * Location: frontend/src/core/domain/payment/entities/Payment.ts
 * 
 * This entity:
 * - Is independent of Booking domain
 * - Can be used for any payable entity (Booking, Subscription, etc.)
 * - Contains payment business logic
 * - Is immutable (value objects for status/method)
 * - Matches backend Payment entity structure
 */

import { PaymentMethodVO } from '../valueObjects/PaymentMethod';
import { PaymentStatusVO } from '../valueObjects/PaymentStatus';

export class Payment {
  private constructor(
    private readonly id: string,
    private readonly amount: number,
    private readonly currency: string,
    private readonly method: PaymentMethodVO,
    private readonly status: PaymentStatusVO,
    private readonly paymentProvider: string | null,
    private readonly transactionId: string | null,
    private readonly payableType: string | null, // e.g., 'App\Models\Booking'
    private readonly payableId: string | null, // e.g., booking ID
    private readonly metadata: string | null,
    private readonly failureReason: string | null,
    private readonly processedAt: string | null,
    private readonly failedAt: string | null,
    private readonly refundedAt: string | null,
    private readonly retryCount: number,
    private readonly lastRetryAt: string | null,
    private readonly createdAt: string,
    private readonly updatedAt: string,
  ) {
    this.validate();
  }

  static create(
    id: string,
    amount: number,
    currency: string,
    method: PaymentMethodVO,
    status: PaymentStatusVO,
    paymentProvider: string | null = null,
    transactionId: string | null = null,
    payableType: string | null = null,
    payableId: string | null = null,
    metadata: string | null = null,
    failureReason: string | null = null,
    processedAt: string | null = null,
    failedAt: string | null = null,
    refundedAt: string | null = null,
    retryCount: number = 0,
    lastRetryAt: string | null = null,
    createdAt: string | null = null,
    updatedAt: string | null = null,
  ): Payment {
    const now = new Date().toISOString();
    return new Payment(
      id,
      amount,
      currency,
      method,
      status,
      paymentProvider,
      transactionId,
      payableType,
      payableId,
      metadata,
      failureReason,
      processedAt,
      failedAt,
      refundedAt,
      retryCount,
      lastRetryAt,
      createdAt ?? now,
      updatedAt ?? now,
    );
  }

  static restore(data: {
    id: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    paymentProvider?: string | null;
    transactionId?: string | null;
    payableType?: string | null;
    payableId?: string | null;
    metadata?: string | null;
    failureReason?: string | null;
    processedAt?: string | null;
    failedAt?: string | null;
    refundedAt?: string | null;
    retryCount?: number;
    lastRetryAt?: string | null;
    createdAt: string;
    updatedAt: string;
  }): Payment {
    return new Payment(
      data.id,
      data.amount,
      data.currency,
      PaymentMethodVO.fromString(data.method),
      PaymentStatusVO.fromString(data.status),
      data.paymentProvider ?? null,
      data.transactionId ?? null,
      data.payableType ?? null,
      data.payableId ?? null,
      data.metadata ?? null,
      data.failureReason ?? null,
      data.processedAt ?? null,
      data.failedAt ?? null,
      data.refundedAt ?? null,
      data.retryCount ?? 0,
      data.lastRetryAt ?? null,
      data.createdAt,
      data.updatedAt,
    );
  }

  private validate(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error('Payment ID is required');
    }
    if (this.amount === 0) {
      throw new Error('Payment amount cannot be zero');
    }
    if (!this.currency || this.currency.trim().length === 0) {
      throw new Error('Payment currency is required');
    }
  }

  getId(): string {
    return this.id;
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  getMethod(): PaymentMethodVO {
    return this.method;
  }

  getStatus(): PaymentStatusVO {
    return this.status;
  }

  getPaymentProvider(): string | null {
    return this.paymentProvider;
  }

  getTransactionId(): string | null {
    return this.transactionId;
  }

  getPayableType(): string | null {
    return this.payableType;
  }

  getPayableId(): string | null {
    return this.payableId;
  }

  getMetadata(): string | null {
    return this.metadata;
  }

  getFailureReason(): string | null {
    return this.failureReason;
  }

  getProcessedAt(): string | null {
    return this.processedAt;
  }

  getFailedAt(): string | null {
    return this.failedAt;
  }

  getRefundedAt(): string | null {
    return this.refundedAt;
  }

  getRetryCount(): number {
    return this.retryCount;
  }

  getLastRetryAt(): string | null {
    return this.lastRetryAt;
  }

  getCreatedAt(): string {
    return this.createdAt;
  }

  getUpdatedAt(): string {
    return this.updatedAt;
  }

  /**
   * Check if payment is completed.
   */
  isCompleted(): boolean {
    return this.status.isCompleted();
  }

  /**
   * Check if payment is pending.
   */
  isPending(): boolean {
    return this.status.isPending();
  }

  /**
   * Check if payment is failed.
   */
  isFailed(): boolean {
    return this.status.isFailed();
  }

  /**
   * Check if payment is refunded.
   */
  isRefunded(): boolean {
    return this.status.isRefunded();
  }

  /**
   * Check if payment can be retried.
   */
  canBeRetried(maxRetries: number = 3): boolean {
    return this.isFailed() && this.retryCount < maxRetries;
  }

  /**
   * Check if payment is a refund (negative amount).
   */
  isRefund(): boolean {
    return this.amount < 0;
  }

  /**
   * Check if payment is for a booking.
   */
  isForBooking(): boolean {
    return this.payableType === 'App\\Models\\Booking' || this.payableType === 'App\Models\Booking';
  }
}

