/**
 * Search Trainers Use Case
 */

import { ITrainerRepository } from '../ports/ITrainerRepository';
import { TrainerMapper } from '../mappers/TrainerMapper';
import { TrainerDTO } from '../dto/TrainerDTO';

export class SearchTrainersUseCase {
  constructor(private readonly trainerRepository: ITrainerRepository) {}

  async execute(query: string): Promise<TrainerDTO[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const trainers = await this.trainerRepository.search(query);
    return TrainerMapper.toDTOs(trainers);
  }
}

