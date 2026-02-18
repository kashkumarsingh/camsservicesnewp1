/**
 * Payment Types
 * 
 * Type definitions for payment system.
 */

export type PaymentMethod = 'paypal' | 'link' | 'stripe';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface PaymentState {
  status: PaymentStatus;
  method: PaymentMethod | null;
  transactionId: string | null;
  error: string | null;
  amount: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  error?: string;
}

