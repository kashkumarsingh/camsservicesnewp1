/**
 * Package Repository Factory
 * 
 * Factory for creating package repository instances.
 * Allows switching between Static and API implementations.
 */

import { IPackageRepository } from '@/core/application/packages/ports/IPackageRepository';
import { StaticPackageRepository } from './StaticPackageRepository';
import { ApiPackageRepository } from './ApiPackageRepository';

export type PackageRepositoryType = 'static' | 'api';

/**
 * Create package repository based on type
 */
export function createPackageRepository(type?: PackageRepositoryType): IPackageRepository {
  const envRepo = process.env.NEXT_PUBLIC_PACKAGE_REPOSITORY as PackageRepositoryType | undefined;
  const repoType = type ?? (envRepo === 'static' ? 'static' : 'api');

  if (repoType === 'static') {
    return new StaticPackageRepository();
  }
  return new ApiPackageRepository();
}

/**
 * Default package repository instance
 * Uses environment variable or falls back to 'api'
 */
export const packageRepository = createPackageRepository();


