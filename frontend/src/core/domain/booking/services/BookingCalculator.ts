import { BookingSchedule } from '../valueObjects/BookingSchedule';

/**
 * Booking Calculator Service
 * Encapsulates business logic for calculating booking-related values
 */
export class BookingCalculator {
  /**
   * Calculate total hours from schedules
   */
  static calculateTotalHours(schedules: BookingSchedule[]): number {
    return schedules.reduce((total, schedule) => {
      return total + schedule.getDuration() / 60; // Convert minutes to hours
    }, 0);
  }

  /**
   * Calculate total price based on package price and hours
   */
  static calculateTotalPrice(
    packageBasePrice: number,
    totalHours: number,
    hourlyRate?: number
  ): number {
    if (hourlyRate) {
      return totalHours * hourlyRate;
    }
    return packageBasePrice;
  }

  /**
   * Calculate discount amount
   */
  static calculateDiscount(totalPrice: number, discountPercentage: number): number {
    if (discountPercentage < 0 || discountPercentage > 100) {
      throw new Error('Discount percentage must be between 0 and 100');
    }
    return (totalPrice * discountPercentage) / 100;
  }

  /**
   * Calculate price after discount
   */
  static calculatePriceAfterDiscount(
    totalPrice: number,
    discountPercentage: number
  ): number {
    const discount = this.calculateDiscount(totalPrice, discountPercentage);
    return totalPrice - discount;
  }

  /**
   * Calculate tax amount
   */
  static calculateTax(totalPrice: number, taxRate: number): number {
    if (taxRate < 0 || taxRate > 100) {
      throw new Error('Tax rate must be between 0 and 100');
    }
    return (totalPrice * taxRate) / 100;
  }

  /**
   * Calculate final price including tax
   */
  static calculateFinalPrice(totalPrice: number, taxRate: number): number {
    const tax = this.calculateTax(totalPrice, taxRate);
    return totalPrice + tax;
  }

  /**
   * Calculate refund amount based on cancellation policy
   */
  static calculateRefundAmount(
    totalPrice: number,
    paidAmount: number,
    cancellationFeePercentage: number
  ): number {
    if (cancellationFeePercentage < 0 || cancellationFeePercentage > 100) {
      throw new Error('Cancellation fee percentage must be between 0 and 100');
    }
    const cancellationFee = (totalPrice * cancellationFeePercentage) / 100;
    const refundAmount = paidAmount - cancellationFee;
    return Math.max(0, refundAmount);
  }
}


