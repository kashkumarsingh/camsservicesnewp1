/**
 * Trainer Stats Calculator
 *
 * Domain service for calculating trainer statistics.
 */

import { Trainer } from '../entities/Trainer';

export class TrainerStatsCalculator {
  static calculateTotalTrainers(trainers: Trainer[]): number {
    return trainers.length;
  }

  static calculateAvailableTrainers(trainers: Trainer[]): number {
    return trainers.filter(trainer => trainer.available).length;
  }

  static calculateAverageRating(trainers: Trainer[]): number {
    if (trainers.length === 0) {
      return 0;
    }
    const total = trainers.reduce((sum, trainer) => sum + trainer.ratingValue, 0);
    return Math.round((total / trainers.length) * 10) / 10;
  }

  static findTopRated(trainers: Trainer[], limit: number = 3): Trainer[] {
    return [...trainers]
      .sort((a, b) => b.ratingValue - a.ratingValue)
      .slice(0, limit);
  }

  static calculateCapabilityFrequency(trainers: Trainer[]): Record<string, number> {
    return trainers.reduce<Record<string, number>>((acc, trainer) => {
      trainer.capabilities.forEach((capability) => {
        acc[capability] = (acc[capability] || 0) + 1;
      });
      return acc;
    }, {});
  }
}

