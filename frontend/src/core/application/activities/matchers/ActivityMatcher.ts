/**
 * Activity Matcher
 * 
 * Filters and ranks activities based on various criteria.
 * Pure matching/filtering logic - no calculations.
 */

import { Activity, LocationData, ActivityFilterOptions } from '../types/ActivityTypes';
import { filterActivitiesByLocation, rankActivitiesBySuggestion } from '@/interfaces/web/utils/activities';

export class ActivityMatcher {
  /**
   * Filter activities by multiple criteria
   * @param activities - Array of activities
   * @param options - Filter options
   * @returns Filtered array of activities
   */
  static filter(activities: Activity[], options: ActivityFilterOptions): Activity[] {
    let filtered = activities;

    // Filter by location
    if (options.location) {
      filtered = this.filterByLocation(filtered, options.location);
    }

    // Filter by search query
    if (options.search) {
      filtered = this.filterBySearch(filtered, options.search);
    }

    // Filter by duration
    if (options.durationFilter && options.durationFilter !== 'all') {
      filtered = this.filterByDuration(filtered, options.durationFilter);
    }

    return filtered;
  }

  /**
   * Filter activities by location
   * @param activities - Array of activities
   * @param location - Location data
   * @returns Filtered activities
   */
  static filterByLocation(activities: Activity[], location: LocationData): Activity[] {
    if (!location) return activities;
    return filterActivitiesByLocation(activities as any, location) as Activity[];
  }

  /**
   * Filter activities by search query
   * @param activities - Array of activities
   * @param search - Search query
   * @returns Filtered activities
   */
  static filterBySearch(activities: Activity[], search: string): Activity[] {
    if (!search) return activities;
    const query = search.toLowerCase();
    return activities.filter(activity =>
      activity.name.toLowerCase().includes(query) ||
      activity.description.toLowerCase().includes(query)
    );
  }

  /**
   * Filter activities by duration
   * @param activities - Array of activities
   * @param durationFilter - Duration filter type
   * @returns Filtered activities
   */
  static filterByDuration(activities: Activity[], durationFilter: 'short' | 'medium' | 'long'): Activity[] {
    return activities.filter(activity => {
      const duration = activity.duration;
      switch (durationFilter) {
        case 'short':
          return duration <= 1;
        case 'medium':
          return duration > 1 && duration <= 3;
        case 'long':
          return duration > 3;
        default:
          return true;
      }
    });
  }

  /**
   * Rank activities by suggestions
   * @param activities - Array of activities
   * @param location - Optional location data
   * @returns Ranked array of activities
   */
  static rank(activities: Activity[], location?: LocationData): Activity[] {
    return rankActivitiesBySuggestion(activities, location);
  }

  /**
   * Filter activities by booking mode
   * @param activities - Array of activities
   * @param modeKey - Booking mode key
   * @returns Recommended activities for the mode
   */
  static filterByMode(activities: Activity[], modeKey: string | null): Activity[] {
    if (!modeKey || modeKey === 'single-day-event') return [];

    return activities.filter(activity => {
      const name = activity.name.toLowerCase();
      
      if (modeKey === 'school-run-after') {
        return activity.duration <= 2 || name.includes('homework');
      }
      if (modeKey === 'weekend-respite') {
        return activity.duration > 2 || name.includes('outdoor');
      }
      if (modeKey === 'therapy-companion') {
        return name.includes('sensory') || name.includes('mindful') || name.includes('regulation');
      }
      if (modeKey === 'exam-support') {
        return name.includes('mindful') || name.includes('calm');
      }
      if (modeKey === 'holiday-day-trip') {
        return activity.duration > 2 || name.includes('outdoor');
      }
      
      return false;
    });
  }
}

