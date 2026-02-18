/**
 * Trainer Ranking Service
 *
 * Domain service for ranking trainers based on criteria.
 */

import { Trainer } from '../entities/Trainer';

export interface TrainerRankingCriteria {
  primaryCapability?: string;
  preferredSpecialties?: string[];
  minimumRating?: number;
  limit?: number;
}

export class TrainerRankingService {
  static rank(trainers: Trainer[], criteria: TrainerRankingCriteria = {}): Trainer[] {
    const { primaryCapability, preferredSpecialties = [], minimumRating = 0, limit } = criteria;

    const ranked = trainers
      .filter(trainer => trainer.ratingValue >= minimumRating)
      .map(trainer => {
        let score = trainer.ratingValue * 10; // Base score from rating

        if (primaryCapability && trainer.capabilities.includes(primaryCapability)) {
          score += 20;
        }

        if (preferredSpecialties.length > 0) {
          const matchCount = trainer.specialties.filter(specialty => preferredSpecialties.includes(specialty)).length;
          score += matchCount * 5;
        }

        score += trainer.specialties.length; // Slight boost for diverse specialties

        return { trainer, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(item => item.trainer);

    return typeof limit === 'number' ? ranked.slice(0, limit) : ranked;
  }
}

