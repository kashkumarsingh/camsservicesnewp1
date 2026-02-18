/**
 * Activity Repository Interface
 * 
 * Port (interface) for activity repository.
 */

import { Activity } from '../../../domain/activities/entities/Activity';

export interface IActivityRepository {
  save(activity: Activity): Promise<void>;
  findById(id: string): Promise<Activity | null>;
  findBySlug(slug: string): Promise<Activity | null>;
  findAll(): Promise<Activity[]>;
  findPublished(): Promise<Activity[]>;
  findByCategory(category: string): Promise<Activity[]>;
  findByTrainer(trainerId: number): Promise<Activity[]>;
  search(query: string): Promise<Activity[]>;
  delete(id: string): Promise<void>;
}


