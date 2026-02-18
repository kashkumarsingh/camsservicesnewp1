/**
 * Activity Repository Factory
 * 
 * Factory for creating activity repository instances.
 */

import { IActivityRepository } from '@/core/application/activities/ports/IActivityRepository';
import { StaticActivityRepository } from './StaticActivityRepository';
import { ApiActivityRepository } from './ApiActivityRepository';

export type ActivityRepositoryType = 'static' | 'api';

/**
 * Create activity repository based on type
 */
export function createActivityRepository(type?: ActivityRepositoryType): IActivityRepository {
  const repoType = type || (process.env.NEXT_PUBLIC_ACTIVITY_REPOSITORY as ActivityRepositoryType) || 'static';

  switch (repoType) {
    case 'api':
      return new ApiActivityRepository();
    case 'static':
    default:
      return new StaticActivityRepository();
  }
}

/**
 * Default activity repository instance
 */
export const activityRepository = createActivityRepository();


