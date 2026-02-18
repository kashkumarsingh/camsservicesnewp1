/**
 * Create Package DTO
 * 
 * Input DTO for creating packages.
 */

import { PackageActivity } from '../../../domain/packages/entities/Package';

export interface CreatePackageDTO {
  name: string;
  description: string;
  hours: number;
  price: number;
  hoursPerWeek: number;
  totalWeeks: number;
  color: string;
  features: string[];
  activities: PackageActivity[];
  perks: string[];
  popular?: boolean;
  spotsRemaining?: number;
}


