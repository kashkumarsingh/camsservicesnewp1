/**
 * Service Repository Factory
 * 
 * Factory for creating service repository instances.
 * Allows switching between Static and API implementations.
 */

import { IServiceRepository } from '@/core/application/services/ports/IServiceRepository';
import { StaticServiceRepository } from './StaticServiceRepository';
import { ApiServiceRepository } from './ApiServiceRepository';

export type ServiceRepositoryType = 'static' | 'api';

/**
 * Create service repository based on type
 */
export function createServiceRepository(type?: ServiceRepositoryType): IServiceRepository {
  // Check environment variable for repository type
  const repoType = type || (process.env.NEXT_PUBLIC_SERVICE_REPOSITORY as ServiceRepositoryType) || 'api';

  switch (repoType) {
    case 'api':
      return new ApiServiceRepository();
    case 'static':
    default:
      return new StaticServiceRepository();
  }
}

/**
 * Default service repository instance
 * Uses environment variable or falls back to 'static'
 */
export const serviceRepository = createServiceRepository();


