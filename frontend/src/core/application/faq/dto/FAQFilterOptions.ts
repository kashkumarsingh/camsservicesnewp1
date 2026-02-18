/**
 * FAQ Filter Options
 * 
 * Filter options for listing FAQ items.
 */

export interface FAQFilterOptions {
  search?: string;
  category?: string;
  sortBy?: 'title' | 'views' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}


