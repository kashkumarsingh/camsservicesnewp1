/**
 * Package Policy
 * 
 * Business rules for packages.
 * Can be swapped for different policies.
 */

import { Package } from '../entities/Package';

export class PackagePolicy {
  /**
   * Check if package can be published
   */
  static canBePublished(pkg: Package): boolean {
    return pkg.validate() && pkg.name.trim().length > 0 && pkg.description.trim().length > 0;
  }

  /**
   * Check if package can be booked
   */
  static canBeBooked(pkg: Package): boolean {
    return pkg.canBeBooked() && pkg.isAvailable();
  }

  /**
   * Check if package requires moderation
   */
  static requiresModeration(pkg: Package): boolean {
    // Business rule: All packages require moderation (can be customized)
    return true;
  }

  /**
   * Check if package is popular
   */
  static isPopular(pkg: Package): boolean {
    return pkg.popular;
  }
}


