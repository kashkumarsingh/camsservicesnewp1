/**
 * Get Service Use Case
 * 
 * Orchestrates getting a single service by ID or slug.
 */

import { Service } from '../../../domain/services/entities/Service';
import { IServiceRepository } from '../ports/IServiceRepository';
import { ServiceMapper } from '../mappers/ServiceMapper';
import { ServiceDTO } from '../dto/ServiceDTO';

export class GetServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(idOrSlug: string): Promise<ServiceDTO | null> {
    // Slug first: public API and URLs use slugs; static repo still resolves id on second lookup.
    let service = await this.serviceRepository.findBySlug(idOrSlug);
    if (!service) {
      service = await this.serviceRepository.findById(idOrSlug);
    }

    if (!service) {
      return null;
    }

    return ServiceMapper.toDTO(service);
  }
}


