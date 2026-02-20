/**
 * Trainer Time Entry Repository (Infrastructure Layer)
 *
 * Clean Architecture: Infrastructure Layer
 * Purpose: HTTP client for trainer time tracking (clock-in/out + history).
 */

import { apiClient } from '../ApiClient';
import { API_ENDPOINTS } from '../apiEndpoints';
import type { TimeEntriesResponse, TimeEntry } from '@/core/application/trainer/types';

export class TrainerTimeEntryRepository {
  /**
   * Get time entries for the authenticated trainer.
   */
  async list(filters?: {
    date_from?: string;
    date_to?: string;
    booking_schedule_id?: number;
    page?: number;
    per_page?: number;
  }): Promise<TimeEntriesResponse> {
    const queryParams = new URLSearchParams();
    if (filters?.date_from) queryParams.append('date_from', filters.date_from);
    if (filters?.date_to) queryParams.append('date_to', filters.date_to);
    if (filters?.booking_schedule_id) {
      queryParams.append('booking_schedule_id', filters.booking_schedule_id.toString());
    }
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.per_page) queryParams.append('per_page', filters.per_page.toString());

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.TRAINER_TIME_ENTRIES}?${queryParams.toString()}`
      : API_ENDPOINTS.TRAINER_TIME_ENTRIES;

    const response = await apiClient.get<{
      timeEntries: TimeEntry[];
      meta?: { pagination?: TimeEntriesResponse['pagination'] };
    }>(url);

    return {
      timeEntries: response.data.timeEntries ?? [],
      pagination: response.data.meta?.pagination,
    };
  }

  /**
   * Clock in for a schedule. Pass latitude/longitude from device geolocation to show trainer on map (admin).
   */
  async clockIn(
    scheduleId: number,
    data?: {
      recorded_at?: string;
      source?: string;
      notes?: string;
      latitude?: number;
      longitude?: number;
    }
  ): Promise<TimeEntry> {
    const response = await apiClient.post<{ timeEntry: TimeEntry }>(
      API_ENDPOINTS.TRAINER_SCHEDULE_CLOCK_IN(scheduleId),
      data ?? {}
    );
    return response.data.timeEntry;
  }

  /**
   * Clock out for a schedule.
   */
  async clockOut(scheduleId: number, data?: { recorded_at?: string; source?: string; notes?: string }): Promise<TimeEntry> {
    const response = await apiClient.post<{ timeEntry: TimeEntry }>(
      API_ENDPOINTS.TRAINER_SCHEDULE_CLOCK_OUT(scheduleId),
      data ?? {}
    );
    return response.data.timeEntry;
  }
}

export const trainerTimeEntryRepository = new TrainerTimeEntryRepository();

