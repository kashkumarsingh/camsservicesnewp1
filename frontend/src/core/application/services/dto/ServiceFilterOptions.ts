/**
 * Service Filter Options
 * 
 * Filter options for listing services.
 */

export interface ServiceFilterOptions {
  search?: string;
  category?: string;
  sortBy?: 'title' | 'views' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}


