import { Booking } from '../entities/Booking';
import { BookingStatus } from '../valueObjects/BookingStatus';
import { PaymentStatus } from '../valueObjects/PaymentStatus';

/**
 * Booking Statistics Calculator Service
 * Encapsulates business logic for calculating booking statistics
 */
export class BookingStatsCalculator {
  /**
   * Calculate total revenue from bookings
   */
  static calculateTotalRevenue(bookings: Booking[]): number {
    return bookings
      .filter((booking) => booking.getPaymentStatus().isPaid())
      .reduce((total, booking) => total + booking.getTotalPrice(), 0);
  }

  /**
   * Calculate pending revenue
   */
  static calculatePendingRevenue(bookings: Booking[]): number {
    return bookings
      .filter((booking) => booking.getPaymentStatus().isPending())
      .reduce((total, booking) => total + booking.getTotalPrice(), 0);
  }

  /**
   * Calculate average booking value
   */
  static calculateAverageBookingValue(bookings: Booking[]): number {
    if (bookings.length === 0) return 0;
    const total = bookings.reduce((sum, booking) => sum + booking.getTotalPrice(), 0);
    return total / bookings.length;
  }

  /**
   * Count bookings by status
   */
  static countByStatus(bookings: Booking[]): Record<BookingStatus, number> {
    const counts: Record<BookingStatus, number> = {
      [BookingStatus.DRAFT]: 0,
      [BookingStatus.PENDING]: 0,
      [BookingStatus.CONFIRMED]: 0,
      [BookingStatus.CANCELLED]: 0,
      [BookingStatus.COMPLETED]: 0,
    };

    bookings.forEach((booking) => {
      const status = booking.getStatus().getValue();
      counts[status]++;
    });

    return counts;
  }

  /**
   * Count bookings by payment status
   */
  static countByPaymentStatus(bookings: Booking[]): Record<PaymentStatus, number> {
    const counts: Record<PaymentStatus, number> = {
      [PaymentStatus.PENDING]: 0,
      [PaymentStatus.PARTIAL]: 0,
      [PaymentStatus.PAID]: 0,
      [PaymentStatus.REFUNDED]: 0,
      [PaymentStatus.FAILED]: 0,
    };

    bookings.forEach((booking) => {
      const status = booking.getPaymentStatus().getValue();
      counts[status]++;
    });

    return counts;
  }

  /**
   * Calculate total hours booked
   */
  static calculateTotalHoursBooked(bookings: Booking[]): number {
    return bookings.reduce((total, booking) => total + booking.getTotalHours(), 0);
  }

  /**
   * Calculate cancellation rate
   */
  static calculateCancellationRate(bookings: Booking[]): number {
    if (bookings.length === 0) return 0;
    const cancelled = bookings.filter((booking) =>
      booking.getStatus().isCancelled()
    ).length;
    return (cancelled / bookings.length) * 100;
  }

  /**
   * Get bookings by date range
   */
  static getBookingsByDateRange(
    bookings: Booking[],
    startDate: Date,
    endDate: Date
  ): Booking[] {
    return bookings.filter((booking) => {
      const bookingDate = booking.getStartDate() || booking.getCreatedAt();
      return bookingDate >= startDate && bookingDate <= endDate;
    });
  }
}


