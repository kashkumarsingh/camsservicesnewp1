/**
 * Pricing Policy
 * Encapsulates business rules for booking pricing
 */
export class PricingPolicy {
  /**
   * Early bird discount percentage
   */
  static getEarlyBirdDiscountPercentage(): number {
    return 10; // 10% discount
  }

  /**
   * Early bird deadline days before start date
   */
  static getEarlyBirdDeadlineDays(): number {
    return 30; // 30 days before start
  }

  /**
   * Multi-child discount percentage per additional child
   */
  static getMultiChildDiscountPercentage(): number {
    return 5; // 5% per additional child
  }

  /**
   * Bulk hours discount thresholds
   */
  static getBulkHoursDiscounts(): Array<{ hours: number; discount: number }> {
    return [
      { hours: 10, discount: 5 }, // 5% for 10+ hours
      { hours: 20, discount: 10 }, // 10% for 20+ hours
      { hours: 30, discount: 15 }, // 15% for 30+ hours
    ];
  }

  /**
   * Check if booking qualifies for early bird discount
   */
  static qualifiesForEarlyBird(startDate: Date, bookingDate: Date): boolean {
    const daysUntilStart =
      (startDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilStart >= this.getEarlyBirdDeadlineDays();
  }

  /**
   * Calculate multi-child discount
   */
  static calculateMultiChildDiscount(
    basePrice: number,
    numberOfChildren: number
  ): number {
    if (numberOfChildren <= 1) {
      return 0;
    }
    const additionalChildren = numberOfChildren - 1;
    const discountPercentage = additionalChildren * this.getMultiChildDiscountPercentage();
    return (basePrice * discountPercentage) / 100;
  }

  /**
   * Calculate bulk hours discount
   */
  static calculateBulkHoursDiscount(totalHours: number, basePrice: number): number {
    const discounts = this.getBulkHoursDiscounts()
      .sort((a, b) => b.hours - a.hours) // Sort descending
      .find((threshold) => totalHours >= threshold.hours);

    if (!discounts) {
      return 0;
    }

    return (basePrice * discounts.discount) / 100;
  }

  /**
   * Calculate total discount for a booking
   */
  static calculateTotalDiscount(
    basePrice: number,
    totalHours: number,
    numberOfChildren: number,
    startDate?: Date,
    bookingDate?: Date
  ): number {
    let totalDiscount = 0;

    // Early bird discount
    if (startDate && bookingDate && this.qualifiesForEarlyBird(startDate, bookingDate)) {
      totalDiscount += (basePrice * this.getEarlyBirdDiscountPercentage()) / 100;
    }

    // Multi-child discount
    totalDiscount += this.calculateMultiChildDiscount(basePrice, numberOfChildren);

    // Bulk hours discount
    totalDiscount += this.calculateBulkHoursDiscount(totalHours, basePrice);

    // Cap discount at 50% of base price
    return Math.min(totalDiscount, basePrice * 0.5);
  }
}


