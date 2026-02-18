/**
 * Service Factory
 * 
 * Factory for creating services.
 * Handles complex creation logic and validation.
 */

import { Service } from '../../../domain/services/entities/Service';
import { ServiceSlug } from '../../../domain/services/valueObjects/ServiceSlug';
import { CreateServiceDTO } from '../dto/CreateServiceDTO';
import { IIdGenerator } from '../../faq/ports/IIdGenerator';

export class ServiceFactory {
  constructor(private readonly idGenerator: IIdGenerator) {}

  create(input: CreateServiceDTO): Service {
    // Generate ID
    const id = this.idGenerator.generate();

    // Generate slug from title
    const slug = ServiceSlug.fromTitle(input.title);

    // Create service with business rules enforced
    return Service.create(
      id,
      input.title,
      input.description,
      slug,
      input.icon,
      input.category
    );
  }
}


