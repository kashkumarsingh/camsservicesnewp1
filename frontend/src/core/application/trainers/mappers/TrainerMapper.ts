/**
 * Trainer Mapper
 *
 * Converts domain entities ↔ DTOs.
 */

import { Trainer } from '../../../domain/trainers/entities/Trainer';
import { TrainerDTO } from '../dto/TrainerDTO';

export class TrainerMapper {
  static toDTO(trainer: Trainer): TrainerDTO {
    return {
      id: trainer.id,
      name: trainer.name,
      slug: trainer.slug.toString(),
      role: trainer.role,
      summary: trainer.summary,
      description: trainer.description,
      rating: trainer.ratingValue,
      image: trainer.image,
      certifications: trainer.certifications,
      specialties: trainer.specialties,
      capabilities: trainer.capabilities,
      available: trainer.available,
      experienceYears: trainer.experienceYears,
      views: trainer.views,
      createdAt: trainer.createdAt.toISOString(),
      updatedAt: trainer.updatedAt.toISOString(),
    };
  }

  static toDTOs(trainers: Trainer[]): TrainerDTO[] {
    return trainers.map(trainer => this.toDTO(trainer));
  }

  static fromDTO(dto: TrainerDTO): Trainer {
    const { TrainerSlug } = require('@/core/domain/trainers/valueObjects/TrainerSlug');
    const slug = TrainerSlug.fromString(dto.slug);

    return Trainer.create(
      dto.id,
      dto.name,
      dto.role,
      dto.summary,
      dto.rating,
      dto.image,
      {
        slug,
        description: dto.description,
        certifications: dto.certifications,
        specialties: dto.specialties,
        capabilities: dto.capabilities,
        available: dto.available,
        experienceYears: dto.experienceYears,
        views: dto.views,
      }
    );
  }
}

