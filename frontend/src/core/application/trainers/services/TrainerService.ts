/**
 * Trainer Service
 *
 * Business logic for composing trainer-related operations. Coordinates matcher,
 * repository, and calculates statistics.
 */

import { Trainer, TrainerFilterOptions, TrainerStats, RankingCriteria, TrainerRequirements } from '../types/TrainerTypes';
import { TrainerMatcher } from '../matchers/TrainerMatcher';
import { CapabilityMatcher } from '../matchers/CapabilityMatcher';

export class TrainerService {
  /**
   * Filter trainers using provided options
   */
  static filter(
    trainers: Trainer[],
    options: TrainerFilterOptions,
    packageActivities?: Array<{ id: number; trainerIds: number[] }>
  ): Trainer[] {
    let filtered = [...trainers];

    if (options.capability) {
      filtered = TrainerMatcher.matchByCapability(filtered, [options.capability]);
    }

    if (options.location) {
      filtered = TrainerMatcher.matchByLocation(filtered, { region: options.location });
    }

    if (options.activityIds && packageActivities) {
      filtered = TrainerMatcher.matchByActivities(filtered, options.activityIds, packageActivities);
    }

    return filtered;
  }

  /**
   * Rank trainers using multi-criteria scoring
   */
  static rank(
    trainers: Trainer[],
    criteria: RankingCriteria,
    packageActivities?: Array<{ id: number; trainerIds: number[] }>
  ): Trainer[] {
    return TrainerMatcher.rankTrainers(trainers, criteria, packageActivities);
  }

  /**
   * Find the best match according to requirements
   */
  static getBestMatch(
    trainers: Trainer[],
    requirements: TrainerRequirements,
    packageActivities?: Array<{ id: number; trainerIds: number[] }>
  ): Trainer | null {
    return TrainerMatcher.getBestMatch(trainers, requirements, packageActivities);
  }

  /**
   * Provides quick stats for filtered trainer list
   */
  static getStats(allTrainers: Trainer[], filteredTrainers: Trainer[]): TrainerStats {
    return {
      total: allTrainers.length,
      filtered: filteredTrainers.length,
      available: filteredTrainers.length,
    };
  }

  /**
   * Determine how many package activities a trainer supports
   */
  static getActivityCount(
    trainerId: number,
    packageActivities: Array<{ id: number; trainerIds: number[] }>
  ): number {
    return packageActivities.filter(activity => activity.trainerIds.includes(trainerId)).length;
  }

  /**
   * Build a friendly capability label
   */
  static getCapabilityDisplayName(capability: string): string {
    const friendlyLabels: Record<string, string> = {
      travel_escort: 'Travel escort',
      school_run: 'School run',
      respite: 'Weekend respite',
      escort: 'Club/Class escort',
      therapy_companion: 'Therapy companion',
      exam_support: 'Exam support',
      hospital_support: 'Hospital support',
    };

    return friendlyLabels[capability] || capability;
  }

  /**
   * Aggregate all capabilities available across trainers
   */
  static getAvailableCapabilities(trainers: Trainer[]): string[] {
    const capabilitySet = new Set<string>();

    trainers.forEach(trainer => {
      const caps = (trainer as any)?.capabilities;
      if (Array.isArray(caps)) {
        caps.forEach(cap => capabilitySet.add(cap));
      }
    });

    return Array.from(capabilitySet).sort();
  }

  /**
   * Determine if trainer satisfies required capabilities
   */
  static matchesRequiredCapabilities(trainer: Trainer, required: string[]): boolean {
    if (!required.length) {
      return true;
    }

    return CapabilityMatcher.hasAllCapabilities(trainer, required);
  }
}

