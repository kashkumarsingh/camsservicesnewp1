/**
 * Increment Views Use Case
 * 
 * Orchestrates incrementing the view count for a package.
 */

import { Package } from '../../../domain/packages/entities/Package';
import { IPackageRepository } from '../ports/IPackageRepository';
import { PackageMapper } from '../mappers/PackageMapper';
import { PackageDTO } from '../dto/PackageDTO';

export class IncrementViewsUseCase {
  constructor(private readonly packageRepository: IPackageRepository) {}

  async execute(idOrSlug: string): Promise<PackageDTO | null> {
    // Find package
    let pkg = await this.packageRepository.findById(idOrSlug);
    if (!pkg) {
      pkg = await this.packageRepository.findBySlug(idOrSlug);
    }

    if (!pkg) {
      return null;
    }

    // Increment views
    pkg.incrementViews();

    // Save updated package
    await this.packageRepository.save(pkg);

    // Get API-specific fields if available
    const apiRepo = this.packageRepository as any;
    const apiFields = apiRepo?.getApiSpecificFields ? apiRepo.getApiSpecificFields(pkg.id) : undefined;
    
    return PackageMapper.toDTO(pkg, apiFields);
  }
}


