/**
 * Increment Views Use Case
 * 
 * Orchestrates incrementing the view count for a service.
 */

import { Service } from '../../../domain/services/entities/Service';
import { IServiceRepository } from '../ports/IServiceRepository';
import { ServiceMapper } from '../mappers/ServiceMapper';
import { ServiceDTO } from '../dto/ServiceDTO';

export class IncrementViewsUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(idOrSlug: string): Promise<ServiceDTO | null> {
    // Find service
    let service = await this.serviceRepository.findById(idOrSlug);
    if (!service) {
      service = await this.serviceRepository.findBySlug(idOrSlug);
    }

    if (!service) {
      return null;
    }

    // Increment views
    service.incrementViews();

    // Save updated service
    await this.serviceRepository.save(service);

    return ServiceMapper.toDTO(service);
  }
}


