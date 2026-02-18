/**
 * Get Trainer Stats Use Case
 */

import { TrainerStatsCalculator } from '../../../domain/trainers/services/TrainerStatsCalculator';
import { ITrainerRepository } from '../ports/ITrainerRepository';
import { TrainerStatsDTO } from '../dto/TrainerStatsDTO';

export class GetTrainerStatsUseCase {
  constructor(private readonly trainerRepository: ITrainerRepository) {}

  async execute(): Promise<TrainerStatsDTO> {
    const trainers = await this.trainerRepository.findAll();

    const total = TrainerStatsCalculator.calculateTotalTrainers(trainers);
    const available = TrainerStatsCalculator.calculateAvailableTrainers(trainers);
    const averageRating = TrainerStatsCalculator.calculateAverageRating(trainers);
    const topTrainers = TrainerStatsCalculator.findTopRated(trainers).map(trainer => ({
      id: trainer.id,
      name: trainer.name,
      rating: trainer.ratingValue,
    }));

    return {
      total,
      available,
      averageRating,
      topTrainers,
    };
  }
}

