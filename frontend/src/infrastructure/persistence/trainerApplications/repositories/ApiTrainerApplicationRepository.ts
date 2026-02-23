import { ITrainerApplicationRepository } from '@/core/application/trainerApplications/ports/ITrainerApplicationRepository';
import { TrainerApplication } from '@/core/domain/trainerApplications/entities/TrainerApplication';
import { TrainerApplicationDTO } from '@/core/application/trainerApplications/dto/TrainerApplicationDTO';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';

interface RemoteTrainerApplicationResponse {
  id: number | string;
  status: string;
  created_at: string;
}

interface RemoteTrainerApplicationRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  postcode: string;
  address_line_one?: string | null;
  address_line_two?: string | null;
  city?: string | null;
  county?: string | null;
  travel_radius_km: number;
  availability_preferences?: string[] | null;
  excluded_activity_ids?: string[] | null; // Activity IDs that trainer CANNOT facilitate
  exclusion_reason?: string | null;        // Reason for activity limitations
  preferred_age_groups?: string[] | null;
  experience_years: number;
  bio?: string | null;
  certifications?: string[] | null;
  has_dbs_check: boolean;
  dbs_issued_at?: string | null;
  dbs_expires_at?: string | null;
  insurance_provider?: string | null;
  insurance_expires_at?: string | null;
  desired_hourly_rate?: number | null;
  attachments?: string[] | null;
}

export class ApiTrainerApplicationRepository implements ITrainerApplicationRepository {
  private toApi(application: TrainerApplication): RemoteTrainerApplicationRequest {
    return {
      first_name: application.firstName,
      last_name: application.lastName,
      email: application.email,
      phone: application.phone,
      postcode: application.postcode,
      address_line_one: application.addressLineOne ?? undefined,
      address_line_two: application.addressLineTwo ?? undefined,
      city: application.city ?? undefined,
      county: application.county ?? undefined,
      travel_radius_km: application.travelRadiusKm,
      availability_preferences: application.availabilityPreferences ?? undefined,
      excluded_activity_ids: application.excludedActivityIds ?? undefined, // Activity IDs trainer cannot facilitate
      exclusion_reason: application.exclusionReason ?? undefined,
      preferred_age_groups: application.preferredAgeGroups ?? undefined,
      experience_years: application.experienceYears,
      bio: application.bio ?? undefined,
      certifications: application.certifications ?? undefined,
      has_dbs_check: application.hasDbsCheck,
      dbs_issued_at: application.dbsIssuedAt ?? undefined,
      dbs_expires_at: application.dbsExpiresAt ?? undefined,
      insurance_provider: application.insuranceProvider ?? undefined,
      insurance_expires_at: application.insuranceExpiresAt ?? undefined,
      desired_hourly_rate: application.desiredHourlyRate ?? undefined,
      attachments: application.attachments ?? undefined,
    };
  }

  private toDTO(response: RemoteTrainerApplicationResponse): TrainerApplicationDTO {
    return {
      id: String(response.id),
      status: response.status as TrainerApplicationDTO['status'],
      createdAt: (response as { createdAt?: string }).createdAt ?? response.created_at,
    };
  }

  async submit(application: TrainerApplication): Promise<TrainerApplicationDTO> {
    try {
      const payload = this.toApi(application);
      const response = await apiClient.post<RemoteTrainerApplicationResponse>(
        API_ENDPOINTS.TRAINER_APPLICATIONS,
        payload
      );

      return this.toDTO(response.data);
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        error?.message ??
        'Failed to submit trainer application';

      const finalError = new Error(apiMessage);
      if (error?.response?.status) {
        (finalError as any).status = error.response.status;
      }
      throw finalError;
    }
  }
}


