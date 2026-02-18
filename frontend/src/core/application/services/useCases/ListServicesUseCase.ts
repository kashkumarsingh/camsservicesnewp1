/**
 * List Services Use Case
 * 
 * Orchestrates listing services with filters.
 */

import { Service } from '../../../domain/services/entities/Service';
import { IServiceRepository } from '../ports/IServiceRepository';
import { ServiceMapper } from '../mappers/ServiceMapper';
import { ServiceFilterOptions } from '../dto/ServiceFilterOptions';
import { ServiceDTO } from '../dto/ServiceDTO';

export class ListServicesUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(options?: ServiceFilterOptions): Promise<ServiceDTO[]> {
    // Get all services
    let services = await this.serviceRepository.findAll();

    // Apply search filter
    if (options?.search) {
      const searchLower = options.search.toLowerCase();
      services = services.filter(service => 
        service.title.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (options?.category) {
      services = services.filter(service => service.category === options.category);
    }

    // Apply sorting
    if (options?.sortBy) {
      const sortOrder = options.sortOrder || 'asc';
      services.sort((a, b) => {
        let comparison = 0;
        
        switch (options.sortBy) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
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

    // Apply pagination
    if (options?.offset !== undefined) {
      services = services.slice(options.offset);
    }
    if (options?.limit !== undefined) {
      services = services.slice(0, options.limit);
    }

    // Return DTOs
    return ServiceMapper.toDTOs(services);
  }
}


