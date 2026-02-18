/**
 * Process Payment Data Transfer Object
 * 
 * Clean Architecture: Application Layer (DTO)
 * Purpose: DTO for processing a new payment (not for representing existing payments)
 * Location: frontend/src/core/application/booking/dto/ProcessPaymentDTO.ts
 * 
 * Note: This is different from PaymentDTO (in payment domain) which represents
 * an existing payment entity. This DTO is used for payment processing requests.
 */

export interface ProcessPaymentDTO {
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  metadata?: Record<string, any>;
}

