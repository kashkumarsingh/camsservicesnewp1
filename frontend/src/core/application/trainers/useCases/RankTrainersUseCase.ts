/**
 * Rank Trainers Use Case
 */

import { ITrainerRepository } from '../ports/ITrainerRepository';
import { TrainerMapper } from '../mappers/TrainerMapper';
import { TrainerRankingService } from '../../../domain/trainers/services/TrainerRankingService';
import { TrainerRankingCriteriaDTO } from '../dto/TrainerRankingCriteria';
import { TrainerDTO } from '../dto/TrainerDTO';

export class RankTrainersUseCase {
  constructor(private readonly trainerRepository: ITrainerRepository) {}

  async execute(criteria: TrainerRankingCriteriaDTO): Promise<TrainerDTO[]> {
    const trainers = await this.trainerRepository.findAll();
    const ranked = TrainerRankingService.rank(trainers, criteria);
    return TrainerMapper.toDTOs(ranked);
  }
}
