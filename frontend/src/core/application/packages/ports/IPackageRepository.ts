/**
 * Package Repository Interface
 * 
 * Port (interface) for package repository.
 * Application layer depends on this, not implementation.
 */

import { Package } from '../../../domain/packages/entities/Package';

export interface PackageListMetrics {
  totalPackages: number;
  popularPackages: number;
  totalSpots: number;
  spotsRemaining: number;
  averageAvailability: number;
  averagePrice: number;
  averageHoursPerWeek: number;
  uniqueActivities: number;
  uniqueTrainers: number;
}

export interface PackageListResult {
  packages: Package[];
  metrics?: PackageListMetrics;
}

export interface IPackageRepository {
  save(pkg: Package): Promise<void>;
  findById(id: string): Promise<Package | null>;
  findBySlug(slug: string): Promise<Package | null>;
  findAllWithMeta(): Promise<PackageListResult>;
  findAll(): Promise<Package[]>;
  search(query: string): Promise<Package[]>;
  delete(id: string): Promise<void>;
}


