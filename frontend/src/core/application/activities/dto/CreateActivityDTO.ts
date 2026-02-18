/**
 * Create Activity DTO
 * 
 * Input DTO for creating activities.
 */

import { ActivityTrainer } from '../../../domain/activities/entities/Activity';

export interface CreateActivityDTO {
  name: string;
  description: string;
  imageUrl: string;
  duration: number; // hours
  trainerIds: number[];
  category?: string;
  ageRange?: string;
  trainers?: ActivityTrainer[];
  published?: boolean;
}


