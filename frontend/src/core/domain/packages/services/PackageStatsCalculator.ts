/**
 * Package Stats Calculator
 * 
 * Domain service for calculating package statistics.
 */

import { Package } from '../entities/Package';

export class PackageStatsCalculator {
  static calculateTotalPackages(packages: Package[]): number {
    return packages.length;
  }

  static calculateAvailablePackages(packages: Package[]): number {
    return packages.filter(p => p.isAvailable()).length;
  }

  static calculateTotalViews(packages: Package[]): number {
    return packages.reduce((total, pkg) => total + pkg.views, 0);
  }

  static calculateAverageViews(packages: Package[]): number {
    if (packages.length === 0) {
      return 0;
    }
    return this.calculateTotalViews(packages) / packages.length;
  }

  static findMostViewed(packages: Package[]): Package | null {
    if (packages.length === 0) {
      return null;
    }
    return packages.reduce((mostViewed, pkg) => 
      pkg.views > mostViewed.views ? pkg : mostViewed
    );
  }

  static calculateAveragePrice(packages: Package[]): number {
    if (packages.length === 0) {
      return 0;
    }
    const total = packages.reduce((sum, pkg) => sum + pkg.price.amount, 0);
    return total / packages.length;
  }

  static calculateAverageHours(packages: Package[]): number {
    if (packages.length === 0) {
      return 0;
    }
    const total = packages.reduce((sum, pkg) => sum + pkg.hours.value, 0);
    return total / packages.length;
  }
}


