/**
 * Package Mapper
 * 
 * Converts domain entities ↔ DTOs.
 */

import { Package } from '../../../domain/packages/entities/Package';
import { PackageDTO } from '../dto/PackageDTO';
import { CreatePackageDTO } from '../dto/CreatePackageDTO';

export class PackageMapper {
  static toDTO(
    pkg: Package,
    apiSpecificFields?: {
      hoursPerActivity?: number;
      calculatedActivities?: number;
      allowActivityOverride?: boolean;
    }
  ): PackageDTO {
    return {
      id: pkg.id,
      name: pkg.name,
      slug: pkg.slug.toString(),
      description: pkg.description,
      hours: pkg.hours.value,
      price: pkg.price.amount,
      duration: pkg.duration.format(),
      color: pkg.color,
      features: pkg.features,
      activities: pkg.activities,
      trainers: pkg.trainers,
      testimonials: pkg.testimonials,
      trustIndicators: pkg.trustIndicators,
      perks: pkg.perks,
      popular: pkg.popular,
      hoursPerWeek: pkg.duration.hoursPerWeek,
      totalWeeks: pkg.duration.totalWeeks,
      spotsRemaining: pkg.spotsRemaining,
      views: pkg.views,
      metrics: pkg.metrics,
      createdAt: pkg.createdAt.toISOString(),
      updatedAt: pkg.updatedAt.toISOString(),
      // Include API-specific fields if provided
      hoursPerActivity: apiSpecificFields?.hoursPerActivity,
      calculatedActivities: apiSpecificFields?.calculatedActivities,
      allowActivityOverride: apiSpecificFields?.allowActivityOverride,
    };
  }

  static toDTOs(packages: Package[]): PackageDTO[] {
    return packages.map(pkg => this.toDTO(pkg));
  }

  static fromDTO(dto: PackageDTO): Package {
    // Note: This is for reconstruction from persisted data
    // For new entities, use PackageFactory
    const { PackageSlug } = require('@/core/domain/packages/valueObjects/PackageSlug');
    const slug = PackageSlug.fromString(dto.slug);
    
    return Package.create(
      dto.id,
      dto.name,
      dto.description,
      dto.hours,
      dto.price,
      dto.hoursPerWeek,
      dto.totalWeeks ?? parseInt(dto.duration.split(' ')[4] || '6'), // Extract weeks from duration string if missing
      dto.color,
      dto.features,
      dto.activities,
      dto.perks,
      slug,
      dto.popular,
      dto.spotsRemaining,
      dto.trainers,
      dto.metrics,
      dto.testimonials,
      dto.trustIndicators
    );
  }
}


