/**
 * List Trainers Use Case
 */

import { Trainer } from '../../../domain/trainers/entities/Trainer';
import { ITrainerRepository } from '../ports/ITrainerRepository';
import { TrainerMapper } from '../mappers/TrainerMapper';
import { TrainerFilterOptions } from '../dto/TrainerFilterOptions';
import { TrainerDTO } from '../dto/TrainerDTO';

export class ListTrainersUseCase {
  constructor(private readonly trainerRepository: ITrainerRepository) {}

  async execute(options?: TrainerFilterOptions): Promise<TrainerDTO[]> {
    let trainers: Trainer[];

    if (options?.available !== undefined && options.available) {
      trainers = await this.trainerRepository.findAvailable();
    } else if (options?.capability) {
      trainers = await this.trainerRepository.findByCapability(options.capability);
    } else if (options?.specialty) {
      trainers = await this.trainerRepository.findBySpecialty(options.specialty);
    } else {
      trainers = await this.trainerRepository.findAll();
    }

    if (options?.search) {
      const searchLower = options.search.toLowerCase();
      trainers = trainers.filter(trainer =>
        trainer.name.toLowerCase().includes(searchLower) ||
        trainer.role.toLowerCase().includes(searchLower) ||
        trainer.specialties.some(specialty => specialty.toLowerCase().includes(searchLower))
      );
    }

    if (options?.minimumRating) {
      trainers = trainers.filter(trainer => trainer.ratingValue >= options.minimumRating!);
    }

    if (options?.available !== undefined && !options.available) {
      trainers = trainers.filter(trainer => !trainer.available);
    }

    if (options?.sortBy) {
      const sortOrder = options.sortOrder || 'desc';
      trainers.sort((a, b) => {
        let comparison = 0;

        switch (options.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'rating':
            comparison = a.ratingValue - b.ratingValue;
            break;
          case 'views':
            comparison = a.views - b.views;
            break;
          case 'createdAt':
            comparison = a.createdAt.getTime() - b.createdAt.getTime();
            break;
          case 'updatedAt':
            comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
            break;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    if (options?.offset !== undefined) {
      trainers = trainers.slice(options.offset);
    }
    if (options?.limit !== undefined) {
      trainers = trainers.slice(0, options.limit);
    }

    return TrainerMapper.toDTOs(trainers);
  }
}

