/**
 * Activity DTO
 * 
 * Data transfer object for activities.
 */

import { ActivityTrainer } from '../../../domain/activities/entities/Activity';

export interface ActivityDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  duration: number; // hours
  trainerIds: number[];
  trainers?: ActivityTrainer[];
  category?: string;
  ageRange?: string;
  views: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}


