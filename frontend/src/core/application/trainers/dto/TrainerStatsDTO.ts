/**
 * Trainer Statistics DTO
 */

export interface TrainerStatsDTO {
  total: number;
  available: number;
  averageRating: number;
  topTrainers: Array<{
    id: string;
    name: string;
    rating: number;
  }>;
}

