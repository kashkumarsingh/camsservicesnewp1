/**
 * Activity Mapper
 * 
 * Converts domain entities ↔ DTOs.
 */

import { Activity } from '../../../domain/activities/entities/Activity';
import { ActivityDTO } from '../dto/ActivityDTO';

export class ActivityMapper {
  static toDTO(activity: Activity): ActivityDTO {
    return {
      id: activity.id,
      name: activity.name,
      slug: activity.slug.toString(),
      description: activity.description,
      imageUrl: activity.imageUrl,
      duration: activity.duration.hours,
      trainerIds: activity.trainerIds,
      trainers: activity.trainers,
      category: activity.category,
      ageRange: activity.ageRange,
      views: activity.views,
      published: activity.published,
      createdAt: activity.createdAt.toISOString(),
      updatedAt: activity.updatedAt.toISOString(),
    };
  }

  static toDTOs(activities: Activity[]): ActivityDTO[] {
    return activities.map(activity => this.toDTO(activity));
  }

  static fromDTO(dto: ActivityDTO): Activity {
    // Note: This is for reconstruction from persisted data
    // For new entities, use ActivityFactory
    const { ActivitySlug } = require('@/core/domain/activities/valueObjects/ActivitySlug');
    const slug = ActivitySlug.fromString(dto.slug);
    
    return Activity.create(
      dto.id,
      dto.name,
      dto.description,
      dto.imageUrl,
      dto.duration,
      dto.trainerIds,
      slug,
      dto.category,
      dto.ageRange,
      dto.trainers,
      dto.published
    );
  }
}


