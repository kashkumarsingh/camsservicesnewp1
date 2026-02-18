/**
 * Activity Service
 * 
 * Business logic for activity operations.
 * Orchestrates filtering, ranking, and selection validation.
 */

import { Activity, LocationData, ActivityFilterOptions, ActivityValidationResult, ActivityStats } from '../types/ActivityTypes';
import { ActivityMatcher } from '../matchers/ActivityMatcher';
import { ActivityCalculator } from '../calculators/ActivityCalculator';
import { getBadgesFor, getInsightFor } from '@/interfaces/web/utils/activities';
import { formatHours } from '@/utils/formatHours';

export class ActivityService {
  /**
   * Filter activities based on multiple criteria
   * @param activities - Array of activities
   * @param options - Filter options
   * @returns Filtered array of activities
   * @example
   * const filtered = ActivityService.filterActivities(activities, {
   *   location: { region: 'Hertfordshire' },
   *   search: 'outdoor',
   *   durationFilter: 'long'
   * });
   */
  static filterActivities(activities: Activity[], options: ActivityFilterOptions): Activity[] {
    return ActivityMatcher.filter(activities, options);
  }

  /**
   * Rank activities by suggestions
   * @param activities - Array of activities
   * @param location - Optional location data
   * @returns Ranked array of activities
   * @example
   * const ranked = ActivityService.rankActivities(activities, { region: 'Hertfordshire' });
   */
  static rankActivities(activities: Activity[], location?: LocationData): Activity[] {
    return ActivityMatcher.rank(activities, location);
  }

  /**
   * Get badges associated with an activity
   */
  static getBadges(activityId: number): string[] {
    return getBadgesFor(activityId);
  }

  /**
   * Get insights associated with an activity
   */
  static getInsights(activityId: number) {
    return getInsightFor(activityId);
  }

  /**
   * Check if activity can be selected
   * @param activity - Activity to check
   * @param selectedActivityIds - Currently selected activity IDs
   * @param allActivities - All available activities
   * @param sessionDuration - Total session duration
   * @returns True if activity can be selected
   */
  static canSelectActivity(
    activity: Activity,
    selectedActivityIds: number[],
    allActivities: Activity[],
    sessionDuration: number
  ): boolean {
    return ActivityCalculator.canSelect(activity, selectedActivityIds, allActivities, sessionDuration);
  }

  /**
   * Get total duration of selected activities
   * @param activities - All activities
   * @param selectedIds - Selected activity IDs
   * @returns Total duration in hours
   */
  static getTotalDuration(activities: Activity[], selectedIds: number[]): number {
    return ActivityCalculator.calculateTotalDuration(activities, selectedIds);
  }

  /**
   * Validate a set of selected activities against session constraints
   */
  static validateSelection(
    selectedIds: number[],
    trainerChoice: boolean,
    allActivities: Activity[],
    sessionDuration: number
  ): ActivityValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (selectedIds.length === 0 && !trainerChoice) {
      errors.push("Please select at least one activity or choose Trainer's Choice");
    }

    if (selectedIds.length > 0) {
      const totalDuration = this.getTotalDuration(allActivities, selectedIds);
      if (totalDuration > sessionDuration) {
        errors.push(
          `Selected activities (${formatHours(totalDuration)}) exceed session duration (${formatHours(sessionDuration)})`
        );
      } else if (totalDuration < sessionDuration * 0.5) {
        warnings.push(
          `Selected activities (${formatHours(totalDuration)}) are less than 50% of session duration (${formatHours(sessionDuration)})`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get recommended activities for a booking mode
   * @param activities - All activities
   * @param modeKey - Booking mode key
   * @returns Array of recommended activities
   */
  static getRecommendedForMode(activities: Activity[], modeKey: string | null): Activity[] {
    return ActivityMatcher.filterByMode(activities, modeKey);
  }

  /**
   * Determine if a single activity is recommended for the current mode
   */
  static isRecommendedForMode(activity: Activity, modeKey: string | null): boolean {
    if (!modeKey || modeKey === 'single-day-event') {
      return false;
    }

    const recommended = ActivityMatcher.filterByMode([activity], modeKey);
    return recommended.some(item => item.id === activity.id);
  }

  /**
   * Get Tailwind classes describing the activity duration intensity
   */
  static getDurationColor(duration: number): string {
    return ActivityCalculator.getDurationColor(duration);
  }

  /**
   * Provide quick stats about filtered activities
   */
  static getStats(
    allActivities: Activity[],
    filteredActivities: Activity[],
    location?: LocationData
  ): ActivityStats {
    return {
      total: allActivities.length,
      available: filteredActivities.length,
      filtered: filteredActivities.length,
      region: location?.region,
    };
  }
}

