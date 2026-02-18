/**
 * Admin Package DTO (Application Layer)
 *
 * Clean Architecture Layer: Application (DTO)
 * Purpose: Defines the shape of Package data for admin dashboard
 * Location: frontend/src/core/application/admin/dto/AdminPackageDTO.ts
 *
 * This DTO is used exclusively for admin operations (listing, creating, editing packages)
 */

export interface AdminPackageDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  hours: number;
  durationWeeks: number | null;
  hoursPerWeek: number | null;
  hoursPerActivity: number;
  calculatedActivities: number | null;
  allowActivityOverride: boolean;
  ageGroup: string | null;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | null;
  maxParticipants: number | null;
  spotsRemaining: number | null;
  totalSpots: number | null;
  features: string[];
  perks: string[];
  whatToExpect: string | null;
  requirements: string[];
  image: string | null;
  color: string | null;
  trustIndicators: string[];
  isActive: boolean;
  isPopular: boolean;
  views: number;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * DTO for creating/updating packages (request payload)
 */
export interface CreatePackageDTO {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  hours: number;
  durationWeeks?: number;
  hoursPerWeek?: number;
  hoursPerActivity?: number;
  calculatedActivities?: number;
  allowActivityOverride?: boolean;
  ageGroup?: string;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  maxParticipants?: number;
  spotsRemaining?: number;
  totalSpots?: number;
  features?: string[];
  perks?: string[];
  whatToExpect?: string;
  requirements?: string[];
  image?: string;
  color?: string;
  trustIndicators?: string[];
  isActive?: boolean;
  isPopular?: boolean;
}

export interface UpdatePackageDTO extends Partial<CreatePackageDTO> {}
