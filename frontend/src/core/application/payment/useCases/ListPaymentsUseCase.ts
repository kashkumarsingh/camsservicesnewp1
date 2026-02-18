/**
 * List Payments Use Case
 * Orchestrates listing and filtering of payments
 * 
 * Clean Architecture: Application Layer (Use Case)
 */

import { IPaymentRepository } from '../ports/IPaymentRepository';
import { PaymentDTO } from '../dto/PaymentDTO';
import { PaymentFilterOptions } from '../dto/PaymentFilterOptions';

export class ListPaymentsUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(filterOptions?: PaymentFilterOptions): Promise<PaymentDTO[]> {
    // If filtering by payable, use findByPayable
    if (filterOptions?.payableType && filterOptions?.payableId) {
      return await this.paymentRepository.findByPayable(
        filterOptions.payableType,
        filterOptions.payableId
      );
    }

    // Otherwise, use findAll with filters
    return await this.paymentRepository.findAll(filterOptions);
  }

  /**
   * Find payments for a booking.
   */
  async executeForBooking(bookingId: string): Promise<PaymentDTO[]> {
    return await this.paymentRepository.findByPayable('App\\Models\\Booking', bookingId);
  }
}

