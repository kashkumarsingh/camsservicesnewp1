import type { ITrainerApplicationRepository } from '@/core/application/trainerApplications/ports/ITrainerApplicationRepository';
import { ApiTrainerApplicationRepository } from './ApiTrainerApplicationRepository';

type DataSource = 'api';

export function createTrainerApplicationRepository(source: DataSource = 'api'): ITrainerApplicationRepository {
  switch (source) {
    default:
      return new ApiTrainerApplicationRepository();
  }
}

export const trainerApplicationRepository = createTrainerApplicationRepository();


