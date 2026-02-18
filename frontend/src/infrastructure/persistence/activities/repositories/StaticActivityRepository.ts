/**
 * Static Activity Repository
 * 
 * Infrastructure implementation using static data.
 */

import { IActivityRepository } from '@/core/application/activities/ports/IActivityRepository';
import { Activity } from '@/core/domain/activities/entities/Activity';
import { ActivitySlug } from '@/core/domain/activities/valueObjects/ActivitySlug';
import { activitiesData } from '@/data/activitiesData';

export class StaticActivityRepository implements IActivityRepository {
  private activitiesList: Activity[] = [];

  constructor() {
    // Initialize from static data
    this.activitiesList = activitiesData.map((item) => {
      const slug = ActivitySlug.fromString(item.slug);
      
      return Activity.create(
        item.id,
        item.name,
        item.description,
        item.imageUrl,
        item.duration,
        item.trainerIds,
        slug,
        item.category,
        item.ageRange,
        item.trainers,
        item.published
      );
    });
  }

  async save(activity: Activity): Promise<void> {
    const index = this.activitiesList.findIndex(a => a.id === activity.id);
    if (index >= 0) {
      this.activitiesList[index] = activity;
    } else {
      this.activitiesList.push(activity);
    }
  }

  async findById(id: string): Promise<Activity | null> {
    return this.activitiesList.find(a => a.id === id) || null;
  }

  async findBySlug(slug: string): Promise<Activity | null> {
    return this.activitiesList.find(a => a.slug.toString() === slug) || null;
  }

  async findAll(): Promise<Activity[]> {
    return [...this.activitiesList];
  }

  async findPublished(): Promise<Activity[]> {
    return this.activitiesList.filter(a => a.isPublished());
  }

  async findByCategory(category: string): Promise<Activity[]> {
    return this.activitiesList.filter(a => a.category === category);
  }

  async findByTrainer(trainerId: number): Promise<Activity[]> {
    return this.activitiesList.filter(a => a.trainerIds.includes(trainerId));
  }

  async search(query: string): Promise<Activity[]> {
    const queryLower = query.toLowerCase();
    return this.activitiesList.filter(activity =>
      activity.name.toLowerCase().includes(queryLower) ||
      activity.description.toLowerCase().includes(queryLower)
    );
  }

  async delete(id: string): Promise<void> {
    this.activitiesList = this.activitiesList.filter(a => a.id !== id);
  }
}


