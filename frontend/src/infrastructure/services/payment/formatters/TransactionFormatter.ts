/**
 * Transaction Formatter
 * 
 * Formats payment transactions and related data.
 */

import { PaymentMethod, PaymentStatus } from '../types';

export class TransactionFormatter {
  /**
   * Generate a transaction ID
   */
  static generateTransactionId(method: PaymentMethod): string {
    const prefix = method === 'paypal' ? 'PP' : 'PL';
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Format amount as currency
   */
  static formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  }

  /**
   * Get display name for payment method
   */
  static getMethodDisplayName(method: PaymentMethod | null): string {
    if (!method) return 'Unknown';
    
    const names: Record<PaymentMethod, string> = {
      paypal: 'PayPal',
      link: 'Payment Link',
      stripe: 'Stripe',
    };

    return names[method] || method;
  }

  /**
   * Get status message for payment
   */
  static getStatusMessage(status: PaymentStatus, method: PaymentMethod | null): string {
    switch (status) {
      case 'pending':
        return 'Payment pending';
      case 'processing':
        return `Processing ${this.getMethodDisplayName(method)} payment...`;
      case 'completed':
        return 'Payment completed successfully';
      case 'failed':
        return 'Payment failed. Please try again.';
      default:
        return 'Unknown status';
    }
  }
}

