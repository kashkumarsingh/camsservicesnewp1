import {
  IPaymentService,
  PaymentResult,
  RefundResult,
  PaymentStatus,
} from '@/core/application/booking/ports/IPaymentService';

/**
 * Mock Payment Service
 * Implements IPaymentService for development/testing
 */
export class MockPaymentService implements IPaymentService {
  async processPayment(
    amount: number,
    currency: string,
    paymentMethod: string,
    metadata?: Record<string, any>
  ): Promise<PaymentResult> {
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate success (90% success rate)
    const success = Math.random() > 0.1;

    if (success) {
      return {
        success: true,
        paymentId: `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      };
    } else {
      return {
        success: false,
        paymentId: '',
        error: 'Payment processing failed',
      };
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<RefundResult> {
    // Simulate refund processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      refundId: `refund_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      amount: amount || 0,
    };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      status: 'completed',
      amount: 0,
      currency: 'GBP',
      paidAt: new Date(),
    };
  }
}

export const mockPaymentService = new MockPaymentService();


