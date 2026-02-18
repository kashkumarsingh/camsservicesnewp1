/**
 * Packages Application Layer - Barrel Exports
 */

// Use Cases
export { ListPackagesUseCase } from './useCases/ListPackagesUseCase';
export { ListPackagesWithMetricsUseCase } from './useCases/ListPackagesWithMetricsUseCase';
export { GetPackageUseCase } from './useCases/GetPackageUseCase';
export { IncrementViewsUseCase } from './useCases/IncrementViewsUseCase';
export { GetPackageAvailabilityUseCase, type PackageAvailabilityDTO } from './useCases/GetPackageAvailabilityUseCase';
export { GetPackageStatsUseCase } from './useCases/GetPackageStatsUseCase';

// Factories
export { PackageFactory } from './factories/PackageFactory';

// DTOs
export type { PackageDTO } from './dto/PackageDTO';
export type { CreatePackageDTO } from './dto/CreatePackageDTO';
export type { UpdatePackageDTO } from './dto/UpdatePackageDTO';
export type { PackageFilterOptions } from './dto/PackageFilterOptions';
export type { PackageStatsDTO } from './dto/PackageStatsDTO';
export type { PackageListWithMetaDTO } from './dto/PackageListWithMetaDTO';

// Mappers
export { PackageMapper } from './mappers/PackageMapper';

// Services
export { PackageRecommendationService } from './services/PackageRecommendationService';
export type { PackageRecommendation, PackageRecommendationInput } from './services/PackageRecommendationService';
export { SimilarPackagesService } from './services/SimilarPackagesService';
export type { SimilarPackage } from './services/SimilarPackagesService';

// Ports
export type { IPackageRepository } from './ports/IPackageRepository';


