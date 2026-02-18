/**
 * Package Calculator
 * 
 * Domain service for calculating package statistics and pricing.
 */

import { Package } from '../entities/Package';

export class PackageCalculator {
  static calculatePricePerHour(pkg: Package): number {
    return pkg.calculatePricePerHour();
  }

  static calculateTotalCost(pkg: Package): number {
    return pkg.price.amount;
  }

  static calculateSavings(pkg: Package, originalPrice: number): number {
    if (originalPrice <= pkg.price.amount) {
      return 0;
    }
    return originalPrice - pkg.price.amount;
  }

  static calculateSavingsPercentage(pkg: Package, originalPrice: number): number {
    if (originalPrice <= pkg.price.amount) {
      return 0;
    }
    return Math.round(((originalPrice - pkg.price.amount) / originalPrice) * 100);
  }

  static findMostPopular(packages: Package[]): Package | null {
    if (packages.length === 0) {
      return null;
    }
    return packages.find(p => p.popular) || packages[0];
  }

  static findBestValue(packages: Package[]): Package | null {
    if (packages.length === 0) {
      return null;
    }
    return packages.reduce((best, pkg) => {
      const bestValue = best.calculatePricePerHour();
      const currentValue = pkg.calculatePricePerHour();
      return currentValue < bestValue ? pkg : best;
    });
  }

  static findMostExpensive(packages: Package[]): Package | null {
    if (packages.length === 0) {
      return null;
    }
    return packages.reduce((mostExpensive, pkg) => 
      pkg.price.amount > mostExpensive.price.amount ? pkg : mostExpensive
    );
  }

  static findCheapest(packages: Package[]): Package | null {
    if (packages.length === 0) {
      return null;
    }
    return packages.reduce((cheapest, pkg) => 
      pkg.price.amount < cheapest.price.amount ? pkg : cheapest
    );
  }
}


