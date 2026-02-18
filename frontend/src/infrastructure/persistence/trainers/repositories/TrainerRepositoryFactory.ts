/**
 * Trainer Repository Factory
 */

import { ITrainerRepository } from '@/core/application/trainers/ports/ITrainerRepository';
import { StaticTrainerRepository } from './StaticTrainerRepository';
import { ApiTrainerRepository } from './ApiTrainerRepository';

export type TrainerRepositoryType = 'static' | 'api';

export function createTrainerRepository(type?: TrainerRepositoryType): ITrainerRepository {
  const repoType = type || (process.env.NEXT_PUBLIC_TRAINER_REPOSITORY as TrainerRepositoryType) || 'api';

  switch (repoType) {
    case 'api':
      return new ApiTrainerRepository();
    case 'static':
    default:
      return new StaticTrainerRepository();
  }
}

export const trainerRepository = createTrainerRepository();

