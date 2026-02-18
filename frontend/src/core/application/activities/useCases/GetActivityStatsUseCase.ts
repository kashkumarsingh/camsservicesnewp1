/**
 * Get Activity Stats Use Case
 * 
 * Orchestrates getting activity statistics.
 */

import { ActivityStatsCalculator } from '../../../domain/activities/services/ActivityStatsCalculator';
import { IActivityRepository } from '../ports/IActivityRepository';
import { ActivityStatsDTO } from '../dto/ActivityStatsDTO';

export class GetActivityStatsUseCase {
  constructor(private readonly activityRepository: IActivityRepository) {}

  async execute(): Promise<ActivityStatsDTO> {
    // Get all activities
    const activities = await this.activityRepository.findAll();

    // Calculate statistics
    const total = ActivityStatsCalculator.calculateTotalActivities(activities);
    const published = ActivityStatsCalculator.calculatePublishedActivities(activities);
    const mostViewed = ActivityStatsCalculator.findMostViewed(activities);
    const totalViews = ActivityStatsCalculator.calculateTotalViews(activities);
    const averageViews = ActivityStatsCalculator.calculateAverageViews(activities);
    const averageDuration = ActivityStatsCalculator.calculateAverageDuration(activities);

    return {
      total,
      published,
      mostViewed: mostViewed ? {
        id: mostViewed.id,
        name: mostViewed.name,
        views: mostViewed.views,
      } : undefined,
      totalViews,
      averageViews,
      averageDuration,
    };
  }
}


