/**
 * Increment Trainer Views Use Case
 */

import { ITrainerRepository } from '../ports/ITrainerRepository';
import { TrainerMapper } from '../mappers/TrainerMapper';
import { TrainerDTO } from '../dto/TrainerDTO';

export class IncrementTrainerViewsUseCase {
  constructor(private readonly trainerRepository: ITrainerRepository) {}

  async execute(idOrSlug: string): Promise<TrainerDTO | null> {
    let trainer = await this.trainerRepository.findById(idOrSlug);

    if (!trainer) {
      trainer = await this.trainerRepository.findBySlug(idOrSlug);
    }

    if (!trainer) {
      return null;
    }

    trainer.incrementViews();
    await this.trainerRepository.save(trainer);

    return TrainerMapper.toDTO(trainer);
  }
}

