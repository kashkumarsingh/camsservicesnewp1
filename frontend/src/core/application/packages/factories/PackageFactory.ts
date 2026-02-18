/**
 * Package Factory
 * 
 * Factory for creating packages.
 * Handles complex creation logic and validation.
 */

import { Package } from '../../../domain/packages/entities/Package';
import { PackageSlug } from '../../../domain/packages/valueObjects/PackageSlug';
import { CreatePackageDTO } from '../dto/CreatePackageDTO';
import { IIdGenerator } from '../../faq/ports/IIdGenerator';

export class PackageFactory {
  constructor(private readonly idGenerator: IIdGenerator) {}

  create(input: CreatePackageDTO): Package {
    // Generate ID
    const id = this.idGenerator.generate();

    // Generate slug from name
    const slug = PackageSlug.fromName(input.name);

    // Create package with business rules enforced
    return Package.create(
      id,
      input.name,
      input.description,
      input.hours,
      input.price,
      input.hoursPerWeek,
      input.totalWeeks,
      input.color,
      input.features,
      input.activities,
      input.perks,
      slug,
      input.popular || false,
      input.spotsRemaining
    );
  }
}


