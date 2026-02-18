/**
 * Create Trainer DTO
 *
 * Input DTO for creating trainers.
 */

export interface CreateTrainerDTO {
  name: string;
  role: string;
  summary: string;
  description?: string;
  rating: number;
  image: {
    src: string;
    alt: string;
  };
  certifications?: string[];
  specialties?: string[];
  capabilities?: string[];
  available?: boolean;
  experienceYears?: number;
}

