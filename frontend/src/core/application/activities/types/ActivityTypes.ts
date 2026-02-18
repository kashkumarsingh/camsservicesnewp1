/**
 * Activity Types
 * 
 * Type definitions for activity application layer.
 */

export interface Activity {
  id: number;
  name: string;
  imageUrl?: string;
  duration: number;
  description: string;
  available_in_regions?: string[];
  available_postcodes?: string[];
  service_radius_km?: number;
  [key: string]: unknown;
}

export interface LocationData {
  postcode?: string;
  region?: string;
  city?: string;
}

export interface ActivityFilterOptions {
  location?: LocationData;
  search?: string;
  durationFilter?: 'all' | 'short' | 'medium' | 'long';
  selectedPresetKey?: string | null;
}

export interface ActivityValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ActivityStats {
  total: number;
  available: number;
  filtered: number;
  region?: string;
}

export interface ActivitySelectionState {
  selectedIds: number[];
  trainerChoice: boolean;
  totalDuration: number;
}

