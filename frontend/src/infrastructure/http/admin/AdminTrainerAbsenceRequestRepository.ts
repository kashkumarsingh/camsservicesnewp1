/**
 * Admin: list pending trainer absence requests, approve, reject.
 */

import { apiClient } from '../ApiClient';
import { API_ENDPOINTS } from '../apiEndpoints';

export interface AdminAbsenceRequestItem {
  id: number;
  trainer_id: number;
  trainer_name: string;
  date_from: string;
  date_to: string;
  reason: string | null;
  created_at: string;
}

export interface AdminAbsenceListResponse {
  requests: AdminAbsenceRequestItem[];
}

export class AdminTrainerAbsenceRequestRepository {
  async list(trainerId?: number): Promise<AdminAbsenceListResponse> {
    const params = trainerId != null ? { trainer_id: String(trainerId) } : undefined;
    const response = await apiClient.get<{ requests: AdminAbsenceRequestItem[] }>(
      API_ENDPOINTS.ADMIN_TRAINER_ABSENCE_REQUESTS,
      params ? { params: params as Record<string, string> } : undefined
    );
    const d = response.data;
    return { requests: d?.requests ?? [] };
  }

  async approve(id: number): Promise<void> {
    await apiClient.post(API_ENDPOINTS.ADMIN_TRAINER_ABSENCE_APPROVE(id), {});
  }

  async reject(id: number, reason?: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.ADMIN_TRAINER_ABSENCE_REJECT(id), reason != null ? { reason } : {});
  }
}

export const adminTrainerAbsenceRequestRepository = new AdminTrainerAbsenceRequestRepository();
