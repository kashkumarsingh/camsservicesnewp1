/**
 * Package DTO
 * 
 * Data transfer object for packages.
 * Simple data container for API/UI communication.
 */

import {
  PackageActivity,
  PackagePerformanceMetrics,
  PackageTrainerSummary,
  PackageTestimonialSummary,
  PackageTrustIndicator,
} from '../../../domain/packages/entities/Package';

export interface PackageDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  hours: number;
  hoursPerActivity?: number;
  calculatedActivities?: number;
  allowActivityOverride?: boolean;
  price: number;
  duration: string;
  color: string;
  features: string[];
  activities: PackageActivity[];
  trainers: PackageTrainerSummary[];
  testimonials?: PackageTestimonialSummary[];
  trustIndicators?: PackageTrustIndicator[];
  perks: string[];
  popular: boolean;
  hoursPerWeek: number;
  totalWeeks: number;
  spotsRemaining?: number;
  views: number;
  metrics?: PackagePerformanceMetrics;
  canBeBooked?: boolean; // Whether package can be booked (default: true)
  createdAt: string;
  updatedAt: string;
}


