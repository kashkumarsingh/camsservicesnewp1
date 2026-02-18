/**
 * Trainer Schedule Repository (Infrastructure Layer)
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: HTTP client for trainer schedule API calls
 * Location: frontend/src/infrastructure/http/trainer/TrainerScheduleRepository.ts
 */

import { apiClient } from '../ApiClient';
import { API_ENDPOINTS } from '../apiEndpoints';
import type {
  TrainerSchedulesResponse,
  TrainerScheduleDetail,
  MarkAttendanceRequest,
  MarkAttendanceResponse,
  TrainerNotesResponse,
  CreateNoteRequest,
  CreateNoteResponse,
} from '@/core/application/trainer/types';

export class TrainerScheduleRepository {
  /**
   * Get all schedules assigned to authenticated trainer
   */
  async list(filters?: {
    date_from?: string;
    date_to?: string;
    status?: string;
    month?: number;
    year?: number;
    page?: number;
    per_page?: number;
  }): Promise<TrainerSchedulesResponse> {
    const queryParams = new URLSearchParams();
    if (filters?.date_from) queryParams.append('date_from', filters.date_from);
    if (filters?.date_to) queryParams.append('date_to', filters.date_to);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.month) queryParams.append('month', filters.month.toString());
    if (filters?.year) queryParams.append('year', filters.year.toString());
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.per_page) queryParams.append('per_page', filters.per_page.toString());

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.TRAINER_SCHEDULES}?${queryParams.toString()}`
      : API_ENDPOINTS.TRAINER_SCHEDULES;

    const response = await apiClient.get<{ schedules: any[]; meta?: { pagination?: any } }>(url);

    return {
      schedules: response.data.schedules || [],
      pagination: response.data.meta?.pagination,
    };
  }

  /**
   * Get a single schedule by ID (for confirmation panel and detail views).
   */
  async getById(scheduleId: number): Promise<TrainerScheduleDetail> {
    const response = await apiClient.get<{ schedule: TrainerScheduleDetail }>(
      API_ENDPOINTS.TRAINER_SCHEDULE_BY_ID(scheduleId)
    );
    return response.data.schedule;
  }

  /**
   * Confirm an auto-assigned session (trainer accepts). After confirmation the session becomes scheduled.
   */
  async confirmAssignment(scheduleId: number): Promise<{ scheduleId: string }> {
    const response = await apiClient.put<{ scheduleId: string }>(
      API_ENDPOINTS.TRAINER_SCHEDULE_CONFIRM_ASSIGNMENT(scheduleId)
    );
    return response.data;
  }

  /**
   * Decline an auto-assigned session (optional reason). System may try next trainer.
   */
  async declineAssignment(scheduleId: number, reason?: string): Promise<{ scheduleId: string }> {
    const response = await apiClient.put<{ scheduleId: string }>(
      API_ENDPOINTS.TRAINER_SCHEDULE_DECLINE_ASSIGNMENT(scheduleId),
      reason != null && reason !== '' ? { reason } : undefined
    );
    return response.data;
  }

  /**
   * Mark attendance for participants in a schedule
   */
  async markAttendance(scheduleId: number, data: MarkAttendanceRequest): Promise<MarkAttendanceResponse> {
    const response = await apiClient.put<MarkAttendanceResponse>(
      API_ENDPOINTS.TRAINER_SCHEDULE_ATTENDANCE(scheduleId),
      data
    );

    return response.data;
  }

  /**
   * Get notes for a schedule
   */
  async getNotes(scheduleId: number): Promise<TrainerNotesResponse> {
    const response = await apiClient.get<{ notes: any[] }>(
      API_ENDPOINTS.TRAINER_SCHEDULE_NOTES(scheduleId)
    );

    return {
      notes: response.data.notes || [],
    };
  }

  /**
   * Create a note for a schedule
   */
  async createNote(scheduleId: number, data: CreateNoteRequest): Promise<CreateNoteResponse> {
    const response = await apiClient.post<CreateNoteResponse>(
      API_ENDPOINTS.TRAINER_SCHEDULE_NOTES(scheduleId),
      data
    );

    return response.data;
  }

  /**
   * Update "current activity" and/or location for this schedule (live status for admin/parent).
   * Shows as "Currently doing [e.g. Horse riding] at [location]" in Latest activity.
   * Pass current_activity_id (from list) or current_activity_custom_name (trainer types their own; saved to DB like parent custom activity).
   */
  async updateCurrentActivity(
    scheduleId: number,
    data: {
      current_activity_id?: number | null;
      current_activity_custom_name?: string | null;
      location?: string | null;
    }
  ): Promise<{ schedule: { id: number; current_activity_id: number | null; current_activity_name: string | null; location: string | null } }> {
    const response = await apiClient.put<{
      schedule: { id: number; current_activity_id: number | null; current_activity_name: string | null; location: string | null };
    }>(API_ENDPOINTS.TRAINER_SCHEDULE_CURRENT_ACTIVITY(scheduleId), data);
    return { schedule: response.data.schedule };
  }
}

// Export singleton instance
export const trainerScheduleRepository = new TrainerScheduleRepository();

