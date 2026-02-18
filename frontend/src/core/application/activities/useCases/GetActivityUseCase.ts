/**
 * Get Activity Use Case
 * 
 * Orchestrates getting a single activity by ID or slug.
 */

import { Activity } from '../../../domain/activities/entities/Activity';
import { IActivityRepository } from '../ports/IActivityRepository';
import { ActivityMapper } from '../mappers/ActivityMapper';
import { ActivityDTO } from '../dto/ActivityDTO';

export class GetActivityUseCase {
  constructor(private readonly activityRepository: IActivityRepository) {}

  async execute(idOrSlug: string): Promise<ActivityDTO | null> {
    // Try to find by ID first
    let activity = await this.activityRepository.findById(idOrSlug);

    // If not found, try by slug
    if (!activity) {
      activity = await this.activityRepository.findBySlug(idOrSlug);
    }

    if (!activity) {
      return null;
    }

    return ActivityMapper.toDTO(activity);
  }
}


