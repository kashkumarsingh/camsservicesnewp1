/**
 * Similar Packages Service
 * 
 * Clean Architecture Layer: Application (Services)
 * Purpose: Finds packages similar to a given package based on hours, price, activities, and features
 */

import { PackageDTO } from '../dto/PackageDTO';

export interface SimilarPackage {
  package: PackageDTO;
  similarityScore: number; // 0-100
  reasons: string[];
}

export class SimilarPackagesService {
  /**
   * Find packages similar to the given package
   */
  static findSimilar(
    targetPackage: PackageDTO,
    allPackages: PackageDTO[],
    limit: number = 3
  ): SimilarPackage[] {
    // Exclude the target package itself
    const otherPackages = allPackages.filter(pkg => pkg.id !== targetPackage.id);

    if (otherPackages.length === 0) {
      return [];
    }

    // Score each package for similarity
    const similarPackages = otherPackages.map(pkg => {
      return this.calculateSimilarity(targetPackage, pkg);
    });

    // Sort by similarity score (highest first)
    const sorted = similarPackages.sort((a, b) => b.similarityScore - a.similarityScore);

    // Return top N
    return sorted.slice(0, limit);
  }

  /**
   * Calculate similarity score between two packages
   */
  private static calculateSimilarity(
    target: PackageDTO,
    candidate: PackageDTO
  ): SimilarPackage {
    let score = 0;
    const reasons: string[] = [];

    // 1. Hours similarity (30 points max)
    const hoursDiff = Math.abs(target.hours - candidate.hours);
    const hoursSimilarity = Math.max(0, 30 - (hoursDiff / target.hours) * 30);
    score += hoursSimilarity;
    if (hoursSimilarity > 20) {
      reasons.push(`Similar hours (${candidate.hours}h vs ${target.hours}h)`);
    }

    // 2. Price similarity (25 points max)
    const priceDiff = Math.abs(target.price - candidate.price);
    const priceSimilarity = Math.max(0, 25 - (priceDiff / target.price) * 25);
    score += priceSimilarity;
    if (priceSimilarity > 15) {
      reasons.push(`Similar price (£${candidate.price} vs £${target.price})`);
    }

    // 3. Duration similarity (20 points max)
    if (target.totalWeeks && candidate.totalWeeks) {
      const weeksDiff = Math.abs(target.totalWeeks - candidate.totalWeeks);
      const weeksSimilarity = Math.max(0, 20 - (weeksDiff / target.totalWeeks) * 20);
      score += weeksSimilarity;
      if (weeksSimilarity > 10) {
        reasons.push(`Similar duration (${candidate.totalWeeks} weeks vs ${target.totalWeeks} weeks)`);
      }
    }

    // 4. Activities overlap (15 points max)
    const activitiesOverlap = this.calculateActivitiesOverlap(
      target.activities,
      candidate.activities
    );
    score += activitiesOverlap * 15;
    if (activitiesOverlap > 0.3) {
      reasons.push('Similar activities');
    }

    // 5. Features overlap (10 points max)
    const featuresOverlap = this.calculateFeaturesOverlap(
      target.features,
      candidate.features
    );
    score += featuresOverlap * 10;
    if (featuresOverlap > 0.3) {
      reasons.push('Similar features');
    }

    return {
      package: candidate,
      similarityScore: Math.min(100, Math.round(score)),
      reasons: reasons.length > 0 ? reasons : ['Similar package'],
    };
  }

  /**
   * Calculate activities overlap (0-1)
   */
  private static calculateActivitiesOverlap(
    targetActivities: PackageDTO['activities'],
    candidateActivities: PackageDTO['activities']
  ): number {
    if (!targetActivities || targetActivities.length === 0) return 0;
    if (!candidateActivities || candidateActivities.length === 0) return 0;

    const targetNames = new Set(
      targetActivities.map(a => a.name.toLowerCase().trim())
    );
    const candidateNames = new Set(
      candidateActivities.map(a => a.name.toLowerCase().trim())
    );

    // Count matches
    let matches = 0;
    targetNames.forEach(name => {
      if (candidateNames.has(name)) {
        matches++;
      }
    });

    // Return Jaccard similarity
    const union = new Set([...targetNames, ...candidateNames]);
    return union.size > 0 ? matches / union.size : 0;
  }

  /**
   * Calculate features overlap (0-1)
   */
  private static calculateFeaturesOverlap(
    targetFeatures: string[],
    candidateFeatures: string[]
  ): number {
    if (!targetFeatures || targetFeatures.length === 0) return 0;
    if (!candidateFeatures || candidateFeatures.length === 0) return 0;

    const targetSet = new Set(
      targetFeatures.map(f => f.toLowerCase().trim())
    );
    const candidateSet = new Set(
      candidateFeatures.map(f => f.toLowerCase().trim())
    );

    // Count matches
    let matches = 0;
    targetSet.forEach(feature => {
      if (candidateSet.has(feature)) {
        matches++;
      }
    });

    // Return Jaccard similarity
    const union = new Set([...targetSet, ...candidateSet]);
    return union.size > 0 ? matches / union.size : 0;
  }
}
