/**
 * Trainer Factory
 *
 * Factory for creating trainers.
 */

import { Trainer } from '../../../domain/trainers/entities/Trainer';
import { TrainerSlug } from '../../../domain/trainers/valueObjects/TrainerSlug';
import { CreateTrainerDTO } from '../dto/CreateTrainerDTO';
import { IIdGenerator } from '../../faq/ports/IIdGenerator';

export class TrainerFactory {
  constructor(private readonly idGenerator: IIdGenerator) {}

  create(input: CreateTrainerDTO): Trainer {
    const id = this.idGenerator.generate();
    const slug = TrainerSlug.fromName(input.name);

    return Trainer.create(
      id,
      input.name,
      input.role,
      input.summary,
      input.rating,
      input.image,
      {
        slug,
        description: input.description,
        certifications: input.certifications,
        specialties: input.specialties,
        capabilities: input.capabilities,
        available: input.available,
        experienceYears: input.experienceYears,
      }
    );
  }
}

