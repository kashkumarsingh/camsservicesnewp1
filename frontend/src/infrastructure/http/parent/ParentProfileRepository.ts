import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { apiClient } from '@/infrastructure/http/ApiClient';
import type { User } from '@/core/application/auth/types';

export interface ParentProfile {
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  postcode?: string | null;
}

// ApiClient unwraps the response, so the type should be the unwrapped data structure
// Backend returns: { success: true, data: { profile: {...} } }
// ApiClient returns: { data: { profile: {...} } }
interface ParentProfileResponse {
  profile: ParentProfile;
}

interface UpdateParentProfileRequest {
  name: string;
  phone?: string;
  address?: string;
  postcode?: string;
}

class ParentProfileRepository {
  async getProfile(): Promise<ParentProfile> {
    const response = await apiClient.get<ParentProfileResponse>(API_ENDPOINTS.PARENT_PROFILE);
    return response.data.profile;
  }

  async updateProfile(payload: UpdateParentProfileRequest): Promise<ParentProfile> {
    const response = await apiClient.put<ParentProfileResponse>(API_ENDPOINTS.PARENT_PROFILE, payload);
    return response.data.profile;
  }
}

export const parentProfileRepository = new ParentProfileRepository();


