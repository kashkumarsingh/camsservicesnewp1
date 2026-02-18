import { TrainerApplication } from '@/core/domain/trainerApplications/entities/TrainerApplication';
import { TrainerApplicationDTO } from '@/core/application/trainerApplications/dto/TrainerApplicationDTO';

export interface ITrainerApplicationRepository {
  submit(application: TrainerApplication): Promise<TrainerApplicationDTO>;
}


