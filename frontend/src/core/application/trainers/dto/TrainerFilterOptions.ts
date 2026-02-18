/**
 * Trainer Filter Options
 */

export interface TrainerFilterOptions {
  search?: string;
  capability?: string;
  specialty?: string;
  minimumRating?: number;
  available?: boolean;
  sortBy?: 'name' | 'rating' | 'views' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

