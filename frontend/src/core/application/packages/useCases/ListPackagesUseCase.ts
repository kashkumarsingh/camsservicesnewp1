/**
 * List Packages Use Case
 * 
 * Orchestrates listing packages with filters.
 */

import { Package } from '../../../domain/packages/entities/Package';
import { IPackageRepository } from '../ports/IPackageRepository';
import { PackageMapper } from '../mappers/PackageMapper';
import { PackageFilterOptions } from '../dto/PackageFilterOptions';
import { PackageDTO } from '../dto/PackageDTO';

export class ListPackagesUseCase {
  constructor(private readonly packageRepository: IPackageRepository) {}

  async execute(options?: PackageFilterOptions): Promise<PackageDTO[]> {
    // Get all packages
    let packages = await this.packageRepository.findAll();

    // Apply search filter
    if (options?.search) {
      const searchLower = options.search.toLowerCase();
      packages = packages.filter(pkg => 
        pkg.name.toLowerCase().includes(searchLower) ||
        pkg.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply price range filter
    if (options?.priceRange) {
      packages = packages.filter(pkg => {
        const price = pkg.price.amount;
        const min = options.priceRange!.min ?? 0;
        const max = options.priceRange!.max ?? Infinity;
        return price >= min && price <= max;
      });
    }

    // Apply hours range filter
    if (options?.hoursRange) {
      packages = packages.filter(pkg => {
        const hours = pkg.hours.value;
        const min = options.hoursRange!.min ?? 0;
        const max = options.hoursRange!.max ?? Infinity;
        return hours >= min && hours <= max;
      });
    }

    // Apply availability filter
    if (options?.available !== undefined) {
      packages = packages.filter(pkg => 
        options.available ? pkg.isAvailable() : !pkg.isAvailable()
      );
    }

    // Apply popular filter
    if (options?.popular !== undefined) {
      packages = packages.filter(pkg => pkg.popular === options.popular);
    }

    // Apply sorting
    if (options?.sortBy) {
      const sortOrder = options.sortOrder || 'asc';
      packages.sort((a, b) => {
        let comparison = 0;
        
        switch (options.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'price':
            comparison = a.price.amount - b.price.amount;
            break;
          case 'hours':
            comparison = a.hours.value - b.hours.value;
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
      packages = packages.slice(options.offset);
    }
    if (options?.limit !== undefined) {
      packages = packages.slice(0, options.limit);
    }

    // Return DTOs with API-specific fields if available
    const apiRepo = this.packageRepository as any;
    if (apiRepo?.getApiSpecificFields) {
      return packages.map(pkg => {
        const apiFields = apiRepo.getApiSpecificFields(pkg.id);
        return PackageMapper.toDTO(pkg, apiFields);
      });
    }
    return PackageMapper.toDTOs(packages);
  }
}


