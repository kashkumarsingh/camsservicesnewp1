/**
 * Package Filter Options
 * 
 * Filter options for listing packages.
 */

export interface PackageFilterOptions {
  search?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  hoursRange?: {
    min?: number;
    max?: number;
  };
  available?: boolean;
  popular?: boolean;
  sortBy?: 'name' | 'price' | 'hours' | 'views' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}


