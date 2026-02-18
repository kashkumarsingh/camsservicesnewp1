/**
 * Payment Data Transfer Object
 * 
 * Clean Architecture: Application Layer (DTO)
 * Purpose: Data transfer object for Payment domain
 * Location: frontend/src/core/application/payment/dto/PaymentDTO.ts
 * 
 * Matches backend Payment entity structure from BookingController formatBookingResponse
 * Backend returns payments as part of booking response (polymorphic payments table)
 */

export interface PaymentDTO {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string; // e.g., 'stripe', 'paypal', 'bank_transfer', 'cash', 'other'
  paymentProvider: string | null; // e.g., 'Stripe', 'PayPal'
  transactionId: string | null; // External transaction ID (e.g., Stripe payment_intent_id)
  status: string; // 'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'
  processedAt?: string | null; // ISO 8601 timestamp
  createdAt: string; // ISO 8601 timestamp
  updatedAt?: string; // ISO 8601 timestamp
  failureReason?: string | null;
  failedAt?: string | null;
  refundedAt?: string | null;
  retryCount?: number;
  lastRetryAt?: string | null;
  metadata?: Record<string, any> | null;
  // Polymorphic relationship fields (from backend payments table)
  payableType?: string | null; // e.g., 'App\Models\Booking'
  payableId?: string | null; // e.g., booking ID
}

