/**
 * Trainer absence requests: submit and list (approved + pending dates for calendar).
 * Admin must approve; once approved, dates show as red scribble on trainer calendar.
 */

import { apiClient } from '../ApiClient';
import { API_ENDPOINTS } from '../apiEndpoints';

export interface TrainerAbsenceListResponse {
  approved_dates: string[];
  pending_dates: string[];
  requests: Array<{
    id: number;
    date_from: string;
    date_to: string;
    status: string;
    reason: string | null;
    approved_at: string | null;
    created_at: string;
  }>;
}

export class TrainerAbsenceRequestRepository {
  async list(dateFrom: string, dateTo: string): Promise<TrainerAbsenceListResponse> {
    const response = await apiClient.get<{ requests: TrainerAbsenceListResponse['requests']; approved_dates: string[]; pending_dates: string[] }>(
      API_ENDPOINTS.TRAINER_ABSENCE_REQUESTS,
      { params: { date_from: dateFrom, date_to: dateTo } }
    );
    const d = response.data;
    return {
      approved_dates: d?.approved_dates ?? [],
      pending_dates: d?.pending_dates ?? [],
      requests: d?.requests ?? [],
    };
  }

  async create(dateFrom: string, dateTo: string, reason?: string): Promise<{ id: number; status: string }> {
    const response = await apiClient.post<{ id: number; status: string }>(
      API_ENDPOINTS.TRAINER_ABSENCE_REQUESTS,
      { date_from: dateFrom, date_to: dateTo, reason: reason ?? null }
    );
    return response.data ?? { id: 0, status: 'pending' };
  }
}

export const trainerAbsenceRequestRepository = new TrainerAbsenceRequestRepository();
