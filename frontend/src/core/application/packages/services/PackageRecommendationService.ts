/**
 * Package Recommendation Service
 * 
 * Clean Architecture Layer: Application (Services)
 * Purpose: Provides intelligent package recommendations based on child age, location, previous bookings, and package characteristics
 */

import { PackageDTO } from '../dto/PackageDTO';
import { BookingDTO } from '../../booking/dto/BookingDTO';
import { Child } from '../../auth/types';

export interface PackageRecommendation {
  packageId: string;
  confidence: 'high' | 'medium' | 'low';
  reasons: string[]; // Multiple reasons why this package is recommended
  explanation: string; // Human-readable explanation
  score: number; // Numerical score for ranking (0-100)
}

export interface PackageRecommendationInput {
  child?: Child | null; // Child information (age, location, etc.)
  childId?: number | null; // Child ID for history lookup
  previousBookings?: BookingDTO[]; // Previous bookings for this child/user
  packages: PackageDTO[]; // All available packages to rank
  location?: {
    postcode?: string;
    region?: string;
    city?: string;
  };
}

export class PackageRecommendationService {
  /**
   * Recommend packages for a child based on multiple factors
   * Returns recommendations sorted by score (highest first)
   */
  static recommend(input: PackageRecommendationInput): PackageRecommendation[] {
    const { child, previousBookings, packages, location } = input;

    if (!packages || packages.length === 0) {
      return [];
    }

    // Score each package
    const recommendations = packages.map(pkg => {
      const recommendation = this.scorePackage(pkg, {
        child,
        previousBookings,
        location,
      });
      return recommendation;
    });

    // Sort by score (highest first), then by confidence
    return recommendations.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      const confidenceOrder = { high: 3, medium: 2, low: 1 };
      return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
    });
  }

  /**
   * Score a single package based on context
   */
  private static scorePackage(
    pkg: PackageDTO,
    context: {
      child?: Child | null;
      previousBookings?: BookingDTO[];
      location?: { postcode?: string; region?: string; city?: string };
    }
  ): PackageRecommendation {
    const { child, previousBookings, location } = context;
    let score = 0;
    const reasons: string[] = [];
    let confidence: 'high' | 'medium' | 'low' = 'low';

    // Strategy 1: Previous Booking History (High Weight: +30 points)
    if (previousBookings && previousBookings.length > 0) {
      const previousPackageIds = previousBookings
        .map(b => b.packageId)
        .filter((id): id is string => !!id);
      
      if (previousPackageIds.includes(pkg.id)) {
        score += 30;
        reasons.push('You\'ve purchased this package before');
        confidence = 'high';
      }

      // Similar packages (same hours range, similar price)
      const similarPackages = previousBookings
        .filter(b => {
          const prevPkg = previousBookings.find(b2 => b2.packageId === pkg.id);
          if (!prevPkg) return false;
          // Find similar by hours (±5 hours) or price (±20%)
          return Math.abs((b.totalHours || 0) - pkg.hours) <= 5 ||
                 Math.abs((b.totalPrice || 0) - pkg.price) / (b.totalPrice || 1) <= 0.2;
        });
      
      if (similarPackages.length > 0) {
        score += 20;
        reasons.push('Similar to packages you\'ve purchased');
        if (confidence === 'low') confidence = 'medium';
      }
    }

    // Strategy 2: Child Age Suitability (Medium Weight: +15-25 points)
    if (child?.age) {
      const age = child.age;
      
      // Younger children (5-8): Prefer smaller packages (fewer hours, shorter duration)
      if (age >= 5 && age <= 8) {
        if (pkg.hours <= 15 && pkg.totalWeeks <= 4) {
          score += 25;
          reasons.push(`Perfect for ${age}-year-olds (smaller, focused package)`);
          if (confidence === 'low') confidence = 'medium';
        } else if (pkg.hours <= 20) {
          score += 15;
          reasons.push(`Suitable for ${age}-year-olds`);
        }
      }
      
      // Middle children (9-12): Medium packages work well
      if (age >= 9 && age <= 12) {
        if (pkg.hours >= 15 && pkg.hours <= 25 && pkg.totalWeeks >= 4 && pkg.totalWeeks <= 8) {
          score += 20;
          reasons.push(`Great fit for ${age}-year-olds`);
          if (confidence === 'low') confidence = 'medium';
        }
      }
      
      // Older children (13+): Can handle larger packages
      if (age >= 13) {
        if (pkg.hours >= 20) {
          score += 15;
          reasons.push(`Suitable for ${age}-year-olds (larger package)`);
          if (confidence === 'low') confidence = 'medium';
        }
      }
    }

    // Strategy 3: Location Match (Medium Weight: +20 points)
    if (location?.region && child?.region) {
      // If package trainers serve this region (we'll need to check trainer service areas)
      // For now, we'll use a simple heuristic: if child region matches, boost score
      // TODO: Enhance with actual trainer service area matching
      score += 20;
      reasons.push(`Available in ${location.region}`);
      if (confidence === 'low') confidence = 'medium';
    }

    // Strategy 4: Package Popularity (Low Weight: +10 points)
    if (pkg.popular) {
      score += 10;
      reasons.push('Most popular choice');
    }

    // Strategy 5: Availability (Medium Weight: +15 points if limited spots)
    if (pkg.spotsRemaining !== undefined && pkg.spotsRemaining > 0 && pkg.spotsRemaining <= 5) {
      score += 15;
      reasons.push(`Limited availability (${pkg.spotsRemaining} spots left)`);
      if (confidence === 'low') confidence = 'medium';
    }

    // Strategy 6: Package Value (Low Weight: +5-10 points)
    // Calculate value score: hours per pound
    const valueScore = pkg.hours / pkg.price;
    if (valueScore > 0.15) { // More than 0.15 hours per pound
      score += 10;
      reasons.push('Great value');
    } else if (valueScore > 0.1) {
      score += 5;
    }

    // Generate explanation
    const explanation = this.generateExplanation(reasons, child);

    return {
      packageId: pkg.id,
      confidence,
      reasons,
      explanation,
      score: Math.min(100, score), // Cap at 100
    };
  }

  /**
   * Generate human-readable explanation for recommendation
   */
  private static generateExplanation(reasons: string[], child?: Child | null): string {
    if (reasons.length === 0) {
      return 'This package is available for booking.';
    }

    if (reasons.length === 1) {
      return reasons[0] + '.';
    }

    const primaryReason = reasons[0];
    const otherReasons = reasons.slice(1);

    if (child) {
      return `Recommended for ${child.name}: ${primaryReason}. ${otherReasons.join(', ')}.`;
    }

    return `${primaryReason}. ${otherReasons.join(', ')}.`;
  }

  /**
   * Get top N recommendations
   */
  static getTopRecommendations(
    input: PackageRecommendationInput,
    limit: number = 3
  ): PackageRecommendation[] {
    const recommendations = this.recommend(input);
    return recommendations.slice(0, limit);
  }

  /**
   * Check if a package is recommended (score >= threshold)
   */
  static isRecommended(
    packageId: string,
    input: PackageRecommendationInput,
    threshold: number = 20
  ): boolean {
    const recommendations = this.recommend(input);
    const recommendation = recommendations.find(r => r.packageId === packageId);
    return recommendation ? recommendation.score >= threshold : false;
  }

  /**
   * Get recommendation for a specific package
   */
  static getRecommendationForPackage(
    packageId: string,
    input: PackageRecommendationInput
  ): PackageRecommendation | null {
    const recommendations = this.recommend(input);
    return recommendations.find(r => r.packageId === packageId) || null;
  }
}
