import { Booking } from '../entities/Booking';
import { BookingStatus } from '../valueObjects/BookingStatus';

/**
 * Booking Policy
 * Encapsulates business rules for booking operations
 */
export class BookingPolicy {
  /**
   * Check if booking can be edited
   */
  static canEdit(booking: Booking): boolean {
    return (
      booking.getStatus().isDraft() ||
      booking.getStatus().isPending()
    );
  }

  /**
   * Check if booking can be deleted
   */
  static canDelete(booking: Booking): boolean {
    return booking.getStatus().isDraft();
  }

  /**
   * Check if booking requires payment
   */
  static requiresPayment(booking: Booking): boolean {
    return booking.getTotalPrice() > 0;
  }

  /**
   * Check if booking can be auto-confirmed
   */
  static canAutoConfirm(booking: Booking): boolean {
    return (
      booking.getStatus().isPending() &&
      booking.isFullyPaid() &&
      booking.getSchedules().length > 0
    );
  }

  /**
   * Check if booking allows modifications
   */
  static allowsModifications(booking: Booking): boolean {
    return (
      booking.getStatus().isDraft() ||
      booking.getStatus().isPending()
    );
  }

  /**
   * Check if booking can be refunded
   */
  static canBeRefunded(booking: Booking): boolean {
    return (
      booking.getPaymentStatus().isPaid() ||
      booking.getPaymentStatus().isPartial()
    ) && booking.canBeCancelled();
  }

  /**
   * Get maximum days before start date for cancellation without penalty
   */
  static getCancellationDeadlineDays(): number {
    return 7; // Business rule: 7 days notice required
  }

  /**
   * Check if cancellation is within deadline
   */
  static isWithinCancellationDeadline(booking: Booking): boolean {
    const startDate = booking.getStartDate();
    if (!startDate) {
      return false;
    }
    const deadline = new Date(startDate);
    deadline.setDate(deadline.getDate() - this.getCancellationDeadlineDays());
    return new Date() <= deadline;
  }
}


