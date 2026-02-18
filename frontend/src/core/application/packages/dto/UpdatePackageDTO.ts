/**
 * Update Package DTO
 * 
 * Input DTO for updating packages.
 * All fields are optional.
 */

import { PackageActivity } from '../../../domain/packages/entities/Package';

export interface UpdatePackageDTO {
  name?: string;
  description?: string;
  hours?: number;
  price?: number;
  hoursPerWeek?: number;
  totalWeeks?: number;
  color?: string;
  features?: string[];
  activities?: PackageActivity[];
  perks?: string[];
  popular?: boolean;
  spotsRemaining?: number;
}


