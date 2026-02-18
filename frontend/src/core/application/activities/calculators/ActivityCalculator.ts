/**
 * Activity Calculator
 * 
 * Calculates activity-related metrics and validates selections.
 * Pure calculation logic - no filtering or ranking.
 */

import { Activity } from '../types/ActivityTypes';

export class ActivityCalculator {
  /**
   * Calculate total duration of selected activities
   * @param activities - All activities
   * @param selectedIds - Selected activity IDs
   * @returns Total duration in hours
   * @example
   * const total = ActivityCalculator.calculateTotalDuration(activities, [1, 2, 3]);
   * // Returns: 5.5
   */
  static calculateTotalDuration(activities: Activity[], selectedIds: number[]): number {
    return activities
      .filter(activity => selectedIds.includes(activity.id))
      .reduce((total, activity) => total + activity.duration, 0);
  }

  /**
   * Check if activity can be selected
   * @param activity - Activity to check
   * @param selectedActivityIds - Currently selected activity IDs
   * @param allActivities - All available activities
   * @param sessionDuration - Total session duration
   * @returns True if activity can be selected
   * @example
   * const canSelect = ActivityCalculator.canSelect(activity, [1, 2], allActivities, 5);
   */
  static canSelect(
    activity: Activity,
    selectedActivityIds: number[],
    allActivities: Activity[],
    sessionDuration: number
  ): boolean {
    const isSelected = selectedActivityIds.includes(activity.id);
    const currentTotal = this.calculateTotalDuration(allActivities, selectedActivityIds);

    // If already selected, can deselect
    if (isSelected) {
      return true;
    }

    // If adding would exceed duration, check if it's the first activity
    const newTotal = currentTotal + activity.duration;
    if (newTotal > sessionDuration) {
      // Allow if it's the first activity (user can adjust)
      return selectedActivityIds.length === 0;
    }

    return true;
  }

  /**
   * Get remaining duration capacity
   * @param activities - All activities
   * @param selectedIds - Selected activity IDs
   * @param sessionDuration - Total session duration
   * @returns Remaining duration in hours
   */
  static getRemainingCapacity(
    activities: Activity[],
    selectedIds: number[],
    sessionDuration: number
  ): number {
    const used = this.calculateTotalDuration(activities, selectedIds);
    return Math.max(0, sessionDuration - used);
  }

  /**
   * Check if selection exceeds duration
   * @param activities - All activities
   * @param selectedIds - Selected activity IDs
   * @param sessionDuration - Total session duration
   * @returns True if exceeds duration
   */
  static exceedsDuration(
    activities: Activity[],
    selectedIds: number[],
    sessionDuration: number
  ): boolean {
    const total = this.calculateTotalDuration(activities, selectedIds);
    return total > sessionDuration;
  }

  /**
   * Get duration color class for display
   * @param duration - Duration in hours
   * @returns Tailwind CSS class
   */
  static getDurationColor(duration: number): string {
    if (duration >= 2) return 'bg-purple-100 text-purple-800 border-purple-300';
    if (duration >= 1.5) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}

