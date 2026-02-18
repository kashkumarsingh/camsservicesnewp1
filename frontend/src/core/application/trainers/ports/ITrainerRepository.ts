/**
 * Trainer Repository Interface
 *
 * Port (interface) for trainer repository.
 */

import { Trainer } from '../../../domain/trainers/entities/Trainer';

export interface ITrainerRepository {
  save(trainer: Trainer): Promise<void>;
  findById(id: string): Promise<Trainer | null>;
  findBySlug(slug: string): Promise<Trainer | null>;
  findAll(): Promise<Trainer[]>;
  findAvailable(): Promise<Trainer[]>;
  findByCapability(capability: string): Promise<Trainer[]>;
  findBySpecialty(specialty: string): Promise<Trainer[]>;
  search(query: string): Promise<Trainer[]>;
  delete(id: string): Promise<void>;
}

