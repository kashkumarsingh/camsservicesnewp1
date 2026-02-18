/**
 * Payment Service
 * 
 * Business logic for payment processing.
 * Orchestrates payment validation, processing, and state management.
 */

import { PaymentMethod, PaymentStatus, PaymentState, PaymentResult } from './types';
import { PaymentValidator } from './validators/PaymentValidator';
import { TransactionFormatter } from './formatters/TransactionFormatter';

const PAYMENT_DELAY_RANGE: Record<PaymentMethod, { min: number; max: number }> = {
  paypal: { min: 2000, max: 3500 },
  link: { min: 1500, max: 2500 },
  stripe: { min: 1000, max: 2000 },
};

export class PaymentService {
  private static async simulateDelay(method: PaymentMethod): Promise<void> {
    const range = PAYMENT_DELAY_RANGE[method];
    const delay = range.min + Math.random() * (range.max - range.min);
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private static async processPayPal(amount: number): Promise<PaymentResult> {
    const validation = PaymentValidator.validateAmount(amount);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
        method: 'paypal',
        amount,
        status: 'failed',
      };
    }

    await this.simulateDelay('paypal');
    const success = Math.random() > 0.1; // 90% success rate for prototype

    if (!success) {
      return {
        success: false,
        error: 'Payment processing failed. Please try again or use a different payment method.',
        method: 'paypal',
        amount,
        status: 'failed',
      };
    }

    const transactionId = TransactionFormatter.generateTransactionId('paypal');
    return {
      success: true,
      method: 'paypal',
      amount,
      status: 'completed',
      transactionId,
    };
  }

  private static async processPaymentLinkInternal(amount: number): Promise<PaymentResult> {
    const validation = PaymentValidator.validateAmount(amount);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
        method: 'link',
        amount,
        status: 'failed',
      };
    }

    await this.simulateDelay('link');
    const success = Math.random() > 0.1;

    if (!success) {
      return {
        success: false,
        error: 'Payment was not completed. Please try again.',
        method: 'link',
        amount,
        status: 'failed',
      };
    }

    const transactionId = TransactionFormatter.generateTransactionId('link');
    return {
      success: true,
      method: 'link',
      amount,
      status: 'completed',
      transactionId,
    };
  }

  static async processPayment(method: PaymentMethod, amount: number): Promise<PaymentResult> {
    const validation = PaymentValidator.validate(method, amount);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
        method,
        amount,
        status: 'failed',
      };
    }

    if (method === 'paypal') {
      return this.processPayPal(amount);
    }

    if (method === 'link') {
      return this.processPaymentLinkInternal(amount);
    }

    return {
      success: false,
      error: 'Invalid payment method',
      method,
      amount,
      status: 'failed',
    };
  }

  static async processPaymentLink(amount: number): Promise<PaymentResult> {
    return this.processPayment('link', amount);
  }

  static canProcess(currentStatus: PaymentStatus, isDisabled?: boolean): boolean {
    return !isDisabled && currentStatus !== 'processing' && currentStatus !== 'completed';
  }

  static resetState(): PaymentState {
    return {
      status: 'pending',
      method: null,
      transactionId: null,
      error: null,
      amount: 0,
    };
  }

  static formatAmount(amount: number): string {
    return TransactionFormatter.formatAmount(amount);
  }

  static getMethodDisplayName(method: PaymentMethod | null): string {
    if (!method) return 'Unknown';
    return TransactionFormatter.getMethodDisplayName(method);
  }

  static getStatusMessage(status: PaymentStatus, method?: PaymentMethod | null): string {
    return TransactionFormatter.getStatusMessage(status, method ?? null);
  }
}

