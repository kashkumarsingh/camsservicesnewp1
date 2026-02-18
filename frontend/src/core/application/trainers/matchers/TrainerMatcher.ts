/**
 * Trainer Matcher
 * 
 * Filters and ranks trainers based on various criteria.
 * Pure matching/filtering logic - no data access.
 */

import { Trainer, Location, RankingCriteria, TrainerRequirements } from '../types/TrainerTypes';
import { CapabilityMatcher } from './CapabilityMatcher';

export class TrainerMatcher {
  /**
   * Match trainers by capability
   * @param trainers - Array of trainers
   * @param required - Array of required capabilities
   * @returns Filtered array of trainers with all required capabilities
   * @example
   * const matched = TrainerMatcher.matchByCapability(trainers, ['travel_escort', 'overnight']);
   */
  static matchByCapability(trainers: Trainer[], required: string[]): Trainer[] {
    if (!required.length) {
      return trainers;
    }

    return trainers.filter(trainer => 
      CapabilityMatcher.hasAllCapabilities(trainer, required)
    );
  }

  /**
   * Match trainers by location
   * @param trainers - Array of trainers
   * @param location - Location to match against
   * @param maxDistance - Maximum distance in km (optional, for future use)
   * @returns Filtered array of trainers serving the location
   * @example
   * const matched = TrainerMatcher.matchByLocation(trainers, { region: 'Hertfordshire' });
   */
  static matchByLocation(
    trainers: Trainer[],
    location: Location,
    maxDistance?: number
  ): Trainer[] {
    if (!location || (!location.region && !location.postcode)) {
      return trainers;
    }

    const targetRegion = location.region;

    return trainers.filter(trainer => {
      const serviceRegions = (trainer as any)?.serviceRegions;
      if (!serviceRegions || !Array.isArray(serviceRegions)) {
        return true; // If no location restrictions, include
      }

      if (targetRegion) {
        return serviceRegions.includes(targetRegion);
      }

      return true; // If no region specified, include all
    });
  }

  /**
   * Match trainers by activity support
   * @param trainers - Array of trainers
   * @param activityId - Activity ID to check
   * @param packageActivities - Array of package activities with trainer IDs
   * @returns Filtered array of trainers supporting the activity
   * @example
   * const matched = TrainerMatcher.matchByActivity(trainers, 1, packageActivities);
   */
  static matchByActivity(
    trainers: Trainer[],
    activityId: number,
    packageActivities: Array<{ id: number; trainerIds: number[] }>
  ): Trainer[] {
    const activity = packageActivities.find(a => a.id === activityId);
    if (!activity) {
      return trainers; // If activity not found, return all
    }

    return trainers.filter(trainer => 
      activity.trainerIds.includes(trainer.id)
    );
  }

  /**
   * Match trainers by multiple activities
   * @param trainers - Array of trainers
   * @param activityIds - Array of activity IDs
   * @param packageActivities - Array of package activities with trainer IDs
   * @returns Filtered array of trainers supporting at least one activity
   */
  static matchByActivities(
    trainers: Trainer[],
    activityIds: number[],
    packageActivities: Array<{ id: number; trainerIds: number[] }>
  ): Trainer[] {
    if (!activityIds.length || !packageActivities.length) {
      return trainers;
    }

    const trainerIds = new Set<number>();
    activityIds.forEach(activityId => {
      const activity = packageActivities.find(a => a.id === activityId);
      if (activity) {
        activity.trainerIds.forEach(id => trainerIds.add(id));
      }
    });

    return trainers.filter(trainer => trainerIds.has(trainer.id));
  }

  /**
   * Rank trainers by criteria
   * @param trainers - Array of trainers to rank
   * @param criteria - Ranking criteria
   * @param packageActivities - Optional package activities for activity-based ranking
   * @returns Ranked array of trainers (best match first)
   * @example
   * const ranked = TrainerMatcher.rankTrainers(trainers, {
   *   location: { region: 'Hertfordshire' },
   *   capabilities: ['travel_escort']
   * });
   */
  static rankTrainers(
    trainers: Trainer[],
    criteria: RankingCriteria,
    packageActivities?: Array<{ id: number; trainerIds: number[] }>
  ): Trainer[] {
    const weights = criteria.weights || {
      rating: 0.4,
      experience: 0.3,
      distance: 0.3,
    };

    const scored = trainers.map(trainer => {
      let score = 0;

      // Score based on capability match
      if (criteria.capabilities && criteria.capabilities.length > 0) {
        const capabilityScore = CapabilityMatcher.getCapabilityScore(trainer, criteria.capabilities);
        score += capabilityScore * 0.4; // 40% weight for capabilities
      }

      // Score based on activity support
      if (criteria.activities && packageActivities) {
        const activityIds = criteria.activities
          .filter((a): a is number => typeof a === 'number')
          .filter(id => packageActivities.some(pa => pa.id === id));
        
        if (activityIds.length > 0) {
          const activityCount = this.getActivitySupportCount(trainer, activityIds, packageActivities);
          score += (activityCount / activityIds.length) * 100 * 0.3; // 30% weight for activities
        }
      }

      // Score based on rating
      const rating = (trainer as any)?.rating || 0;
      score += rating * 20 * weights.rating; // Convert 0-5 rating to 0-100

      // Score based on experience (if available)
      const experience = (trainer as any)?.experience || 0;
      score += Math.min(experience / 10, 1) * 100 * weights.experience; // Normalize to 0-100

      return { trainer, score };
    });

    // Sort by score (highest first)
    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.trainer);
  }

  /**
   * Get best matching trainer
   * @param trainers - Array of trainers
   * @param requirements - Trainer requirements
   * @param packageActivities - Optional package activities
   * @returns Best matching trainer or null
   * @example
   * const best = TrainerMatcher.getBestMatch(trainers, {
   *   capabilities: ['travel_escort'],
   *   location: { region: 'Hertfordshire' },
   *   date: new Date(),
   *   duration: 5
   * });
   */
  static getBestMatch(
    trainers: Trainer[],
    requirements: TrainerRequirements,
    packageActivities?: Array<{ id: number; trainerIds: number[] }>
  ): Trainer | null {
    // Filter by capabilities
    let filtered = this.matchByCapability(trainers, requirements.capabilities);

    // Filter by location
    filtered = this.matchByLocation(filtered, requirements.location);

    // Filter by activity if specified
    if (requirements.activity && packageActivities) {
      const activityId = typeof requirements.activity === 'number' 
        ? requirements.activity 
        : parseInt(requirements.activity, 10);
      
      if (!isNaN(activityId)) {
        const activity = packageActivities.find(a => a.id === activityId);
        if (activity) {
          filtered = this.matchByActivity(filtered, activity.id, packageActivities);
        }
      }
    }

    if (filtered.length === 0) {
      return null;
    }

    // Rank and return best match
    const ranked = this.rankTrainers(
      filtered,
      {
        capabilities: requirements.capabilities,
        location: requirements.location,
        activities: requirements.activity ? [requirements.activity] : undefined,
      },
      packageActivities
    );

    return ranked[0] || null;
  }

  /**
   * Get activity support count for a trainer
   * @param trainer - Trainer to check
   * @param activityIds - Array of activity IDs
   * @param packageActivities - Package activities
   * @returns Number of activities supported
   */
  private static getActivitySupportCount(
    trainer: Trainer,
    activityIds: number[],
    packageActivities: Array<{ id: number; trainerIds: number[] }>
  ): number {
    return activityIds.filter(activityId => {
      const activity = packageActivities.find(a => a.id === activityId);
      return activity?.trainerIds.includes(trainer.id);
    }).length;
  }
}

