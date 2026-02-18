/**
 * Payment Repository Interface
 * 
 * Clean Architecture: Application Layer (Port)
 * Purpose: Defines contract for payment data access
 * Location: frontend/src/core/application/payment/ports/IPaymentRepository.ts
 * 
 * This interface:
 * - Defines payment data access methods
 * - Is independent of infrastructure
 * - Allows different implementations (API, Static, etc.)
 * - Matches backend IPaymentRepository interface
 */

import { PaymentDTO } from '../dto/PaymentDTO';
import { PaymentFilterOptions } from '../dto/PaymentFilterOptions';

export interface IPaymentRepository {
  /**
   * Find payment by ID.
   */
  findById(id: string): Promise<PaymentDTO | null>;

  /**
   * Find payment by transaction ID.
   */
  findByTransactionId(transactionId: string): Promise<PaymentDTO | null>;

  /**
   * Find payments for a payable entity (e.g., Booking).
   * 
   * @param payableType e.g., 'App\Models\Booking'
   * @param payableId e.g., booking ID
   */
  findByPayable(payableType: string, payableId: string): Promise<PaymentDTO[]>;

  /**
   * Find all payments with optional filters.
   */
  findAll(filterOptions?: PaymentFilterOptions): Promise<PaymentDTO[]>;
}

