/**
 * Update Activity DTO
 * 
 * Input DTO for updating activities.
 * All fields are optional.
 */

import { ActivityTrainer } from '../../../domain/activities/entities/Activity';

export interface UpdateActivityDTO {
  name?: string;
  description?: string;
  imageUrl?: string;
  duration?: number;
  trainerIds?: number[];
  category?: string;
  ageRange?: string;
  trainers?: ActivityTrainer[];
  published?: boolean;
}


