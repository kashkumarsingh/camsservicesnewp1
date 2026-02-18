/**
 * Get Package Availability Use Case
 * 
 * Orchestrates getting package availability information.
 */

import { Package } from '../../../domain/packages/entities/Package';
import { IPackageRepository } from '../ports/IPackageRepository';
import { AvailabilityPolicy } from '../../../domain/packages/policies/AvailabilityPolicy';

export interface PackageAvailabilityDTO {
  isAvailable: boolean;
  spotsRemaining: number | null;
  canBeBooked: boolean;
}

export class GetPackageAvailabilityUseCase {
  constructor(private readonly packageRepository: IPackageRepository) {}

  async execute(idOrSlug: string): Promise<PackageAvailabilityDTO | null> {
    // Find package
    let pkg = await this.packageRepository.findById(idOrSlug);
    if (!pkg) {
      pkg = await this.packageRepository.findBySlug(idOrSlug);
    }

    if (!pkg) {
      return null;
    }

    return {
      isAvailable: pkg.isAvailable(),
      spotsRemaining: pkg.spotsRemaining ?? null,
      canBeBooked: AvailabilityPolicy.canAcceptBookings(pkg),
    };
  }
}


