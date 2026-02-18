/**
 * Availability Policy
 * 
 * Business rules for package availability.
 */

import { Package } from '../entities/Package';

export class AvailabilityPolicy {
  /**
   * Check if package has spots available
   */
  static hasSpotsAvailable(pkg: Package): boolean {
    return pkg.hasSpotsRemaining();
  }

  /**
   * Check if package can accept new bookings
   */
  static canAcceptBookings(pkg: Package): boolean {
    return pkg.isAvailable() && pkg.hasSpotsRemaining();
  }

  /**
   * Get remaining spots
   */
  static getRemainingSpots(pkg: Package): number {
    return pkg.spotsRemaining ?? Infinity;
  }
}


