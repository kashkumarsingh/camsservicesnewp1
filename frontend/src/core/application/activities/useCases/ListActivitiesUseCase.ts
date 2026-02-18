/**
 * List Activities Use Case
 * 
 * Orchestrates listing activities with filters.
 */

import { Activity } from '../../../domain/activities/entities/Activity';
import { IActivityRepository } from '../ports/IActivityRepository';
import { ActivityMapper } from '../mappers/ActivityMapper';
import { ActivityFilterOptions } from '../dto/ActivityFilterOptions';
import { ActivityDTO } from '../dto/ActivityDTO';
import { ActivityPolicy } from '../../../domain/activities/policies/ActivityPolicy';

export class ListActivitiesUseCase {
  constructor(private readonly activityRepository: IActivityRepository) {}

  async execute(options?: ActivityFilterOptions): Promise<ActivityDTO[]> {
    // Get activities based on filters
    let activities: Activity[];

    if (options?.published !== undefined && options.published) {
      activities = await this.activityRepository.findPublished();
    } else if (options?.category) {
      activities = await this.activityRepository.findByCategory(options.category);
    } else if (options?.trainerId) {
      activities = await this.activityRepository.findByTrainer(options.trainerId);
    } else {
      activities = await this.activityRepository.findAll();
    }

    // Apply search filter
    if (options?.search) {
      const searchLower = options.search.toLowerCase();
      activities = activities.filter(activity => 
        activity.name.toLowerCase().includes(searchLower) ||
        activity.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply age range filter
    if (options?.ageRange) {
      // Parse age from range (e.g., "8" from "5-12")
      const age = parseInt(options.ageRange);
      if (!isNaN(age)) {
        activities = activities.filter(activity => 
          ActivityPolicy.isSuitableForAge(activity, age)
        );
      }
    }

    // Apply featured filter
    if (options?.featured !== undefined) {
      activities = activities.filter(activity => 
        options.featured ? ActivityPolicy.isFeatured(activity) : !ActivityPolicy.isFeatured(activity)
      );
    }

    // Apply published filter (if not already filtered)
    if (options?.published !== undefined && !options.published) {
      activities = activities.filter(activity => !activity.isPublished());
    }

    // Apply sorting
    if (options?.sortBy) {
      const sortOrder = options.sortOrder || 'asc';
      activities.sort((a, b) => {
        let comparison = 0;
        
        switch (options.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'duration':
            comparison = a.duration.hours - b.duration.hours;
            break;
          case 'views':
            comparison = a.views - b.views;
            break;
          case 'createdAt':
            comparison = a.createdAt.getTime() - b.createdAt.getTime();
            break;
          case 'updatedAt':
            comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
            break;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    // Apply pagination
    if (options?.offset !== undefined) {
      activities = activities.slice(options.offset);
    }
    if (options?.limit !== undefined) {
      activities = activities.slice(0, options.limit);
    }

    // Return DTOs
    return ActivityMapper.toDTOs(activities);
  }
}


