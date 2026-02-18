/**
 * Activity Filter Options
 * 
 * Filter options for listing activities.
 */

export interface ActivityFilterOptions {
  search?: string;
  category?: string;
  trainerId?: number;
  ageRange?: string;
  published?: boolean;
  featured?: boolean;
  sortBy?: 'name' | 'duration' | 'views' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}


