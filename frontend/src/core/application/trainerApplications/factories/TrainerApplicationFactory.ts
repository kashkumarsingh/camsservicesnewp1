import { TrainerApplication, TrainerApplicationProps } from '@/core/domain/trainerApplications/entities/TrainerApplication';
import { CreateTrainerApplicationDTO } from '@/core/application/trainerApplications/dto/CreateTrainerApplicationDTO';
import { IIdGenerator } from '@/core/application/faq/ports/IIdGenerator';

export class TrainerApplicationFactory {
  constructor(private readonly idGenerator: IIdGenerator) {}

  create(dto: CreateTrainerApplicationDTO): TrainerApplication {
    const id = this.idGenerator.generate();

    const props: TrainerApplicationProps = {
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email.trim(),
      phone: dto.phone.trim(),
      postcode: dto.postcode.trim().toUpperCase(),
      addressLineOne: dto.addressLineOne?.trim(),
      addressLineTwo: dto.addressLineTwo?.trim(),
      city: dto.city?.trim(),
      county: dto.county?.trim(),
      travelRadiusKm: dto.travelRadiusKm,
      availabilityPreferences: dto.availabilityPreferences?.map((slot) => slot.trim()),
      excludedActivityIds: dto.excludedActivityIds?.map((id) => id.trim()), // Activity IDs trainer cannot facilitate
      exclusionReason: dto.exclusionReason?.trim(),
      preferredAgeGroups: dto.preferredAgeGroups?.map((age) => age.trim()),
      experienceYears: dto.experienceYears,
      bio: dto.bio,
      certifications: dto.certifications,
      hasDbsCheck: dto.hasDbsCheck,
      dbsIssuedAt: dto.dbsIssuedAt,
      dbsExpiresAt: dto.dbsExpiresAt,
      insuranceProvider: dto.insuranceProvider,
      insuranceExpiresAt: dto.insuranceExpiresAt,
      desiredHourlyRate: dto.desiredHourlyRate,
      attachments: dto.attachments,
    };

    return TrainerApplication.create(id, props);
  }
}


