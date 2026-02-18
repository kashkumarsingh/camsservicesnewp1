/**
 * Get Package Stats Use Case
 * 
 * Orchestrates getting package statistics.
 */

import { PackageStatsCalculator } from '../../../domain/packages/services/PackageStatsCalculator';
import { IPackageRepository } from '../ports/IPackageRepository';
import { PackageStatsDTO } from '../dto/PackageStatsDTO';

export class GetPackageStatsUseCase {
  constructor(private readonly packageRepository: IPackageRepository) {}

  async execute(): Promise<PackageStatsDTO> {
    // Get all packages
    const packages = await this.packageRepository.findAll();

    // Calculate statistics
    const total = PackageStatsCalculator.calculateTotalPackages(packages);
    const available = PackageStatsCalculator.calculateAvailablePackages(packages);
    const mostViewed = PackageStatsCalculator.findMostViewed(packages);
    const averagePrice = PackageStatsCalculator.calculateAveragePrice(packages);
    const averageHours = PackageStatsCalculator.calculateAverageHours(packages);

    return {
      total,
      available,
      mostPopular: mostViewed ? {
        id: mostViewed.id,
        name: mostViewed.name,
        views: mostViewed.views,
      } : undefined,
      averagePrice,
      averageHours,
    };
  }
}


