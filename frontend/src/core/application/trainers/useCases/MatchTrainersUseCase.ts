/**
 * Match Trainers Use Case
 */

import { ITrainerRepository } from '../ports/ITrainerRepository';
import { TrainerMapper } from '../mappers/TrainerMapper';
import { TrainerMatchingService } from '../../../domain/trainers/services/TrainerMatchingService';
import { TrainerRequirementsDTO } from '../dto/TrainerRequirements';
import { TrainerDTO } from '../dto/TrainerDTO';

export class MatchTrainersUseCase {
  constructor(private readonly trainerRepository: ITrainerRepository) {}

  async execute(requirements: TrainerRequirementsDTO): Promise<TrainerDTO[]> {
    const trainers = await this.trainerRepository.findAll();
    const matches = TrainerMatchingService.match(trainers, requirements);
    return TrainerMapper.toDTOs(matches);
  }
}

