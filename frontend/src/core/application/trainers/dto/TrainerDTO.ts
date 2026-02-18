/**
 * Trainer DTO
 *
 * Data transfer object for trainers.
 */

export interface TrainerImageDTO {
  src: string;
  alt: string;
}

export interface TrainerDTO {
  id: string;
  name: string;
  slug: string;
  role: string;
  summary: string;
  description?: string;
  rating: number;
  image: TrainerImageDTO;
  certifications: string[];
  specialties: string[];
  capabilities: string[];
  available: boolean;
  experienceYears?: number;
  views: number;
  // Location data for filtering
  homePostcode?: string | null;
  travelRadiusKm?: number | null;
  serviceAreaPostcodes?: string[];
  serviceRegions?: string[];
  createdAt: string;
  updatedAt: string;
}

