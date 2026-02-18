/**
 * Static Trainer Repository
 *
 * Infrastructure implementation using static data.
 */

import { ITrainerRepository } from '@/core/application/trainers/ports/ITrainerRepository';
import { Trainer } from '@/core/domain/trainers/entities/Trainer';
import { TrainerSlug } from '@/core/domain/trainers/valueObjects/TrainerSlug';
import { teamData } from '@/data/teamData';

export class StaticTrainerRepository implements ITrainerRepository {
  private trainers: Trainer[] = [];

  constructor() {
    this.trainers = teamData.map((item) => {
      const slug = TrainerSlug.fromString(item.slug);

      return Trainer.create(
        item.id.toString(),
        item.title,
        item.role,
        item.fullDescription,
        item.rating,
        { src: item.imageSrc, alt: item.imageAlt },
        {
          slug,
          description: item.fullDescription,
          certifications: item.certifications ?? [],
          specialties: item.specialties ?? [],
          capabilities: item.capabilities ?? [],
          available: true,
          experienceYears: undefined,
          views: 0,
        }
      );
    });
  }

  async save(trainer: Trainer): Promise<void> {
    const index = this.trainers.findIndex(t => t.id === trainer.id);
    if (index >= 0) {
      this.trainers[index] = trainer;
    } else {
      this.trainers.push(trainer);
    }
  }

  async findById(id: string): Promise<Trainer | null> {
    return this.trainers.find(trainer => trainer.id === id) || null;
  }

  async findBySlug(slug: string): Promise<Trainer | null> {
    return this.trainers.find(trainer => trainer.slug.toString() === slug) || null;
  }

  async findAll(): Promise<Trainer[]> {
    return [...this.trainers];
  }

  async findAvailable(): Promise<Trainer[]> {
    return this.trainers.filter(trainer => trainer.available);
  }

  async findByCapability(capability: string): Promise<Trainer[]> {
    return this.trainers.filter(trainer => trainer.capabilities.includes(capability));
  }

  async findBySpecialty(specialty: string): Promise<Trainer[]> {
    return this.trainers.filter(trainer => trainer.specialties.includes(specialty));
  }

  async search(query: string): Promise<Trainer[]> {
    const searchLower = query.toLowerCase();
    return this.trainers.filter(trainer =>
      trainer.name.toLowerCase().includes(searchLower) ||
      trainer.role.toLowerCase().includes(searchLower) ||
      trainer.specialties.some(specialty => specialty.toLowerCase().includes(searchLower))
    );
  }

  async delete(id: string): Promise<void> {
    this.trainers = this.trainers.filter(trainer => trainer.id !== id);
  }
}

