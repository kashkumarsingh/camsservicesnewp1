/**
 * Service Repository Interface
 * 
 * Port (interface) for service repository.
 * Application layer depends on this, not implementation.
 */

import { Service } from '../../../domain/services/entities/Service';

export interface IServiceRepository {
  save(service: Service): Promise<void>;
  findById(id: string): Promise<Service | null>;
  findBySlug(slug: string): Promise<Service | null>;
  findAll(): Promise<Service[]>;
  search(query: string): Promise<Service[]>;
  delete(id: string): Promise<void>;
}


