import { CreateTrainerApplicationDTO } from '@/core/application/trainerApplications/dto/CreateTrainerApplicationDTO';
import { TrainerApplicationFactory } from '@/core/application/trainerApplications/factories/TrainerApplicationFactory';
import { ITrainerApplicationRepository } from '@/core/application/trainerApplications/ports/ITrainerApplicationRepository';
import { TrainerApplicationDTO } from '@/core/application/trainerApplications/dto/TrainerApplicationDTO';

export class SubmitTrainerApplicationUseCase {
  constructor(
    private readonly repository: ITrainerApplicationRepository,
    private readonly factory: TrainerApplicationFactory
  ) {}

  async execute(dto: CreateTrainerApplicationDTO): Promise<TrainerApplicationDTO> {
    const application = this.factory.create(dto);
    return this.repository.submit(application);
  }
}


