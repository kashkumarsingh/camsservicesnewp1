/**
 * Activity Policy
 * 
 * Business rules for activities.
 */

import { Activity } from '../entities/Activity';

export class ActivityPolicy {
  /**
   * Check if activity can be published
   */
  static canBePublished(activity: Activity): boolean {
    return activity.validate() && activity.trainerIds.length > 0;
  }

  /**
   * Check if activity requires moderation
   */
  static requiresModeration(activity: Activity): boolean {
    // Business rule: All activities require moderation before publishing
    return true;
  }

  /**
   * Check if activity is featured
   */
  static isFeatured(activity: Activity): boolean {
    // Business rule: Activities with high views or specific categories are featured
    return activity.views > 50 || activity.category === 'popular';
  }

  /**
   * Check if activity can be edited
   */
  static canBeEdited(activity: Activity): boolean {
    return activity.published || !activity.published;
  }

  /**
   * Check if activity is suitable for age range
   */
  static isSuitableForAge(activity: Activity, age: number): boolean {
    if (!activity.ageRange) {
      return true; // No age restriction
    }

    // Parse age range (e.g., "5-12", "13+", "All ages")
    const range = activity.ageRange.toLowerCase();
    
    if (range.includes('all')) {
      return true;
    }

    if (range.includes('+')) {
      const minAge = parseInt(range);
      return age >= minAge;
    }

    if (range.includes('-')) {
      const [min, max] = range.split('-').map(n => parseInt(n));
      return age >= min && age <= max;
    }

    return true;
  }
}


