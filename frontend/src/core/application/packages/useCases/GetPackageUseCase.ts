/**
 * Get Package Use Case
 * 
 * Orchestrates getting a single package by ID or slug.
 */

import { Package } from '../../../domain/packages/entities/Package';
import { IPackageRepository } from '../ports/IPackageRepository';
import { PackageMapper } from '../mappers/PackageMapper';
import { PackageDTO } from '../dto/PackageDTO';

export class GetPackageUseCase {
  constructor(private readonly packageRepository: IPackageRepository) {}

  async execute(idOrSlug: string): Promise<PackageDTO | null> {
    // Check if input is numeric (likely an ID)
    const isNumericId = /^\d+$/.test(idOrSlug);
    
    let pkg: Package | null = null;

    // If numeric, try ID first, then slug as fallback
    // If not numeric, try slug first (more common for URLs)
    if (isNumericId) {
      pkg = await this.packageRepository.findById(idOrSlug);
      // If not found by ID, try slug (in case ID was actually a slug that looks numeric)
      if (!pkg) {
        pkg = await this.packageRepository.findBySlug(idOrSlug);
      }
    } else {
      // For non-numeric strings, try slug first (most common case)
      pkg = await this.packageRepository.findBySlug(idOrSlug);
      // If not found by slug and it might be an ID, try ID as fallback
      if (!pkg && idOrSlug.length <= 10) {
        pkg = await this.packageRepository.findById(idOrSlug);
      }
    }

    if (!pkg) {
      return null;
    }

    // Get API-specific fields if available
    const apiRepo = this.packageRepository as any;
    const apiFields = apiRepo?.getApiSpecificFields ? apiRepo.getApiSpecificFields(pkg.id) : undefined;
    
    return PackageMapper.toDTO(pkg, apiFields);
  }
}


