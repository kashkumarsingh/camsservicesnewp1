/**
 * Activity Stats Calculator
 * 
 * Domain service for calculating activity statistics.
 */

import { Activity } from '../entities/Activity';

export class ActivityStatsCalculator {
  static calculateTotalActivities(activities: Activity[]): number {
    return activities.length;
  }

  static calculatePublishedActivities(activities: Activity[]): number {
    return activities.filter(a => a.isPublished()).length;
  }

  static calculateTotalViews(activities: Activity[]): number {
    return activities.reduce((total, activity) => total + activity.views, 0);
  }

  static calculateAverageViews(activities: Activity[]): number {
    if (activities.length === 0) {
      return 0;
    }
    return this.calculateTotalViews(activities) / activities.length;
  }

  static findMostViewed(activities: Activity[]): Activity | null {
    if (activities.length === 0) {
      return null;
    }
    return activities.reduce((mostViewed, activity) => 
      activity.views > mostViewed.views ? activity : mostViewed
    );
  }

  static calculateAverageDuration(activities: Activity[]): number {
    if (activities.length === 0) {
      return 0;
    }
    const totalHours = activities.reduce((sum, activity) => sum + activity.duration.hours, 0);
    return totalHours / activities.length;
  }

  static findActivitiesByCategory(activities: Activity[], category: string): Activity[] {
    return activities.filter(a => a.category === category);
  }

  static findActivitiesByTrainer(activities: Activity[], trainerId: number): Activity[] {
    return activities.filter(a => a.trainerIds.includes(trainerId));
  }
}


