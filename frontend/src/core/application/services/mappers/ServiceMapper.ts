/**
 * Service Mapper
 * 
 * Converts domain entities ↔ DTOs.
 */

import { Service } from '../../../domain/services/entities/Service';
import { ServiceDTO } from '../dto/ServiceDTO';
import { CreateServiceDTO } from '../dto/CreateServiceDTO';

export class ServiceMapper {
  static toDTO(service: Service): ServiceDTO {
    return {
      id: service.id,
      title: service.title,
      summary: service.summary,
      description: service.description,
      body: service.body,
      slug: service.slug.toString(),
      icon: service.icon,
      views: service.views,
      category: service.category,
      published: service.published,
      publishAt: service.publishAt?.toISOString(),
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    };
  }

  static toDTOs(services: Service[]): ServiceDTO[] {
    return services.map(service => this.toDTO(service));
  }

  static fromDTO(dto: ServiceDTO): Service {
    // Note: This is for reconstruction from persisted data
    // For new entities, use ServiceFactory
    const { ServiceSlug } = require('@/core/domain/services/valueObjects/ServiceSlug');
    const slug = ServiceSlug.fromString(dto.slug);
    
    return Service.create(
      dto.id,
      dto.title,
      dto.description,
      slug,
      dto.icon,
      dto.category
    );
  }
}


