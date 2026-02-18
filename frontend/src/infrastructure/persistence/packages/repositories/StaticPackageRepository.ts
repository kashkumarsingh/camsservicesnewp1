/**
 * Static Package Repository
 * 
 * Infrastructure implementation using static data.
 * Uses existing src/data/packagesData.tsx for now.
 */

import { IPackageRepository, PackageListResult } from '@/core/application/packages/ports/IPackageRepository';
import { Package } from '@/core/domain/packages/entities/Package';
import { PackageSlug } from '@/core/domain/packages/valueObjects/PackageSlug';
import { packages } from '@/data/packagesData';

export class StaticPackageRepository implements IPackageRepository {
  private packagesList: Package[] = [];

  constructor() {
    // Initialize from static data
    this.packagesList = packages.map((item) => {
      const slug = PackageSlug.fromString(item.slug);
      
      // Extract weeks from duration string (e.g., "3 hours per week for 6 weeks" -> 6)
      const weeksMatch = item.duration.match(/(\d+)\s+weeks?/);
      const totalWeeks = weeksMatch ? parseInt(weeksMatch[1]) : 6;
      
      return Package.create(
        item.id.toString(),
        item.name,
        item.description,
        item.hours,
        item.price,
        item.hoursPerWeek,
        totalWeeks,
        item.color,
        item.features,
        item.activities,
        item.perks,
        slug,
        item.popular || false,
        item.spotsRemaining
      );
    });
  }

  async save(pkg: Package): Promise<void> {
    const index = this.packagesList.findIndex(p => p.id === pkg.id);
    if (index >= 0) {
      this.packagesList[index] = pkg;
    } else {
      this.packagesList.push(pkg);
    }
  }

  async findById(id: string): Promise<Package | null> {
    return this.packagesList.find(p => p.id === id) || null;
  }

  async findBySlug(slug: string): Promise<Package | null> {
    return this.packagesList.find(p => p.slug.toString() === slug) || null;
  }

  async findAllWithMeta(): Promise<PackageListResult> {
    return {
      packages: [...this.packagesList],
    };
  }

  async findAll(): Promise<Package[]> {
    const { packages } = await this.findAllWithMeta();
    return packages;
  }

  async search(query: string): Promise<Package[]> {
    const queryLower = query.toLowerCase();
    return this.packagesList.filter(pkg =>
      pkg.name.toLowerCase().includes(queryLower) ||
      pkg.description.toLowerCase().includes(queryLower)
    );
  }

  async delete(id: string): Promise<void> {
    this.packagesList = this.packagesList.filter(p => p.id !== id);
  }
}


