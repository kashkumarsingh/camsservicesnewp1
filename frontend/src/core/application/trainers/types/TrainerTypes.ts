/**
 * Trainer Types
 * 
 * Type definitions for trainer application layer.
 */

import { OriginalTrainer } from '@/components/features/booking/types';

export interface Trainer extends Omit<OriginalTrainer, 'rating'> {
  capabilities?: string[];
  serviceRegions?: string[];
  rating?: number; // Override to make optional
  experience?: number;
}

export interface Location {
  postcode?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface RankingCriteria {
  location?: Location;
  capabilities?: string[];
  activities?: (string | number)[]; // Can be activity names or IDs
  date?: Date;
  weights?: {
    rating: number;
    experience: number;
    distance: number;
  };
}

export interface TrainerRequirements {
  capabilities: string[];
  activity?: string;
  location: Location;
  date: Date;
  duration: number;
}

export interface TrainerStats {
  total: number;
  filtered: number;
  available: number;
}

export interface TrainerFilterOptions {
  capability?: string;
  location?: string;
  activityIds?: number[];
}

