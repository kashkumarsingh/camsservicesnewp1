/**
 * Increment Views Use Case
 * 
 * Orchestrates incrementing the view count for an activity.
 */

import { Activity } from '../../../domain/activities/entities/Activity';
import { IActivityRepository } from '../ports/IActivityRepository';
import { ActivityMapper } from '../mappers/ActivityMapper';
import { ActivityDTO } from '../dto/ActivityDTO';

export class IncrementViewsUseCase {
  constructor(private readonly activityRepository: IActivityRepository) {}

  async execute(idOrSlug: string): Promise<ActivityDTO | null> {
    // Find activity
    let activity = await this.activityRepository.findById(idOrSlug);
    if (!activity) {
      activity = await this.activityRepository.findBySlug(idOrSlug);
    }

    if (!activity) {
      return null;
    }

    // Increment views
    activity.incrementViews();

    // Save updated activity
    await this.activityRepository.save(activity);

    return ActivityMapper.toDTO(activity);
  }
}


