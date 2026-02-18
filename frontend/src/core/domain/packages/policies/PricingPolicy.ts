/**
 * Pricing Policy
 * 
 * Business rules for package pricing.
 */

import { Package } from '../entities/Package';

export class PricingPolicy {
  /**
   * Check if price is valid
   */
  static isValidPrice(pkg: Package): boolean {
    return pkg.price.amount > 0 && pkg.price.amount <= 100000;
  }

  /**
   * Check if price per hour is reasonable
   */
  static hasReasonablePricePerHour(pkg: Package, maxPricePerHour: number = 50): boolean {
    const pricePerHour = pkg.calculatePricePerHour();
    return pricePerHour <= maxPricePerHour;
  }

  /**
   * Check if package offers good value
   */
  static offersGoodValue(pkg: Package, averagePricePerHour: number): boolean {
    const pricePerHour = pkg.calculatePricePerHour();
    return pricePerHour <= averagePricePerHour;
  }
}


