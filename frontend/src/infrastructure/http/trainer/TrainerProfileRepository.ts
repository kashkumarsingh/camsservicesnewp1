/**
 * Trainer Profile Repository (Infrastructure Layer)
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: HTTP client for trainer profile API calls
 * Location: frontend/src/infrastructure/http/trainer/TrainerProfileRepository.ts
 */

import { apiClient } from '../ApiClient';
import { API_ENDPOINTS } from '../apiEndpoints';
import type {
  TrainerProfile,
  TrainerProfileResponse,
  UpdateTrainerProfileRequest,
  UploadQualificationRequest,
  UploadQualificationResponse,
  UpdateAvailabilityRequest,
  TrainerEmergencyContact,
} from '@/core/application/trainer/types';

export class TrainerProfileRepository {
  /**
   * Get trainer profile
   */
  async get(): Promise<TrainerProfile> {
    const response = await apiClient.get<TrainerProfileResponse['data']>(
      API_ENDPOINTS.TRAINER_PROFILE
    );
    if (!response.data?.profile) {
      throw new Error('Invalid response: missing profile');
    }
    return response.data.profile;
  }

  /**
   * Update trainer profile
   */
  async update(data: UpdateTrainerProfileRequest): Promise<TrainerProfile> {
    const response = await apiClient.put<TrainerProfileResponse['data']>(
      API_ENDPOINTS.TRAINER_PROFILE,
      data
    );
    if (!response.data?.profile) {
      throw new Error('Invalid response: missing profile');
    }
    return response.data.profile;
  }

  /**
   * Upload profile image
   */
  async uploadImage(file: File): Promise<{ image: string; image_path: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    // Don't set Content-Type header - ApiClient will handle FormData correctly
    const response = await apiClient.post<{
      image: string;
      image_path: string;
    }>(
      API_ENDPOINTS.TRAINER_PROFILE_IMAGE,
      formData
    );
    return response.data;
  }

  /**
   * Upload qualification/certification
   */
  async uploadQualification(data: UploadQualificationRequest): Promise<UploadQualificationResponse['data']> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('name', data.name);
    if (data.year) formData.append('year', data.year.toString());
    if (data.issuer) formData.append('issuer', data.issuer);
    
    // Don't set Content-Type header - ApiClient will handle FormData correctly
    const response = await apiClient.post<UploadQualificationResponse['data']>(
      API_ENDPOINTS.TRAINER_PROFILE_QUALIFICATIONS,
      formData
    );
    return response.data;
  }

  /**
   * Delete qualification/certification
   */
  async deleteQualification(certificationId: string): Promise<void> {
    await apiClient.delete(
      API_ENDPOINTS.TRAINER_PROFILE_QUALIFICATION_DELETE(certificationId)
    );
  }

  /**
   * Update availability preferences
   */
  async updateAvailability(data: UpdateAvailabilityRequest): Promise<{
    availability_preferences: any[];
    availability_notes: string | null;
  }> {
    const response = await apiClient.put<{
      availability_preferences: any[];
      availability_notes: string | null;
    }>(
      API_ENDPOINTS.TRAINER_PROFILE_AVAILABILITY,
      data
    );
    return response.data;
  }

  /**
   * Emergency contacts – list
   */
  async getEmergencyContacts(): Promise<TrainerEmergencyContact[]> {
    const response = await apiClient.get<{
      emergencyContacts: TrainerEmergencyContact[];
    }>(API_ENDPOINTS.TRAINER_PROFILE_EMERGENCY_CONTACTS);
    return response.data.emergencyContacts ?? [];
  }

  /**
   * Emergency contacts – create
   */
  async createEmergencyContact(
    data: Pick<TrainerEmergencyContact, 'name' | 'phone'> & {
      relationship?: string | null;
      email?: string | null;
    }
  ): Promise<TrainerEmergencyContact> {
    const response = await apiClient.post<{
      emergencyContact: TrainerEmergencyContact;
    }>(API_ENDPOINTS.TRAINER_PROFILE_EMERGENCY_CONTACTS, data);
    return response.data.emergencyContact;
  }

  /**
   * Emergency contacts – update
   */
  async updateEmergencyContact(
    id: number,
    data: Partial<Pick<TrainerEmergencyContact, 'name' | 'relationship' | 'phone' | 'email'>>
  ): Promise<TrainerEmergencyContact> {
    const response = await apiClient.put<{
      emergencyContact: TrainerEmergencyContact;
    }>(API_ENDPOINTS.TRAINER_PROFILE_EMERGENCY_CONTACT_BY_ID(id), data);
    return response.data.emergencyContact;
  }

  /**
   * Emergency contacts – delete
   */
  async deleteEmergencyContact(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.TRAINER_PROFILE_EMERGENCY_CONTACT_BY_ID(id));
  }
}

// Export singleton instance
export const trainerProfileRepository = new TrainerProfileRepository();

