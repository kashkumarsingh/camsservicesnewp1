/**
 * Payment Service Interface
 * Defines the contract for payment processing
 */
export interface IPaymentService {
  /**
   * Process payment
   */
  processPayment(
    amount: number,
    currency: string,
    paymentMethod: string,
    metadata?: Record<string, any>
  ): Promise<PaymentResult>;

  /**
   * Refund payment
   */
  refundPayment(
    paymentId: string,
    amount?: number
  ): Promise<RefundResult>;

  /**
   * Get payment status
   */
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  transactionId?: string;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  error?: string;
}

export interface PaymentStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  paidAt?: Date;
}


