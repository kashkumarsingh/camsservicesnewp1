/**
 * Update Trainer DTO
 *
 * Input DTO for updating trainers.
 */

export interface UpdateTrainerDTO {
  name?: string;
  role?: string;
  summary?: string;
  description?: string;
  rating?: number;
  image?: {
    src: string;
    alt: string;
  };
  certifications?: string[];
  specialties?: string[];
  capabilities?: string[];
  available?: boolean;
  experienceYears?: number;
}

