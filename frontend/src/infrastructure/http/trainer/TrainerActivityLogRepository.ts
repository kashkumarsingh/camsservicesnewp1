/**
 * Trainer Activity Log Repository (Infrastructure Layer)
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: HTTP client for trainer activity log API calls
 * Location: frontend/src/infrastructure/http/trainer/TrainerActivityLogRepository.ts
 */

import { apiClient } from '../ApiClient';
import { API_ENDPOINTS } from '../apiEndpoints';
import type {
  ActivityLogsResponse,
  ChildActivityLogsResponse,
  CreateActivityLogRequest,
  CreateActivityLogResponse,
  UpdateActivityLogRequest,
  UpdateActivityLogResponse,
  ActivityLog,
} from '@/core/application/trainer/types';

export class TrainerActivityLogRepository {
  /**
   * Get all activity logs for authenticated trainer
   */
  async list(filters?: {
    child_id?: number;
    date_from?: string;
    date_to?: string;
    status?: string;
    milestone?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<ActivityLogsResponse> {
    const queryParams = new URLSearchParams();
    if (filters?.child_id) queryParams.append('child_id', filters.child_id.toString());
    if (filters?.date_from) queryParams.append('date_from', filters.date_from);
    if (filters?.date_to) queryParams.append('date_to', filters.date_to);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.milestone) queryParams.append('milestone', 'true');
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.per_page) queryParams.append('per_page', filters.per_page.toString());

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.TRAINER_ACTIVITY_LOGS}?${queryParams.toString()}`
      : API_ENDPOINTS.TRAINER_ACTIVITY_LOGS;

    const response = await apiClient.get<{ activity_logs: any[]; meta?: { pagination?: any } }>(url);

    return {
      activity_logs: response.data.activity_logs || [],
      pagination: response.data.meta?.pagination,
    };
  }

  /**
   * Get activity logs for a specific child
   */
  async getChildLogs(childId: number, filters?: {
    page?: number;
    per_page?: number;
  }): Promise<ChildActivityLogsResponse> {
    const queryParams = new URLSearchParams();
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.per_page) queryParams.append('per_page', filters.per_page.toString());

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.TRAINER_CHILD_ACTIVITY_LOGS(childId)}?${queryParams.toString()}`
      : API_ENDPOINTS.TRAINER_CHILD_ACTIVITY_LOGS(childId);

    const response = await apiClient.get<{ child: any; activity_logs: any[]; meta?: { pagination?: any } }>(url);

    return {
      child: response.data.child,
      activity_logs: response.data.activity_logs || [],
      pagination: response.data.meta?.pagination,
    };
  }

  /**
   * Get activity logs for a specific session (booking schedule)
   */
  async getSessionLogs(bookingScheduleId: number): Promise<ActivityLog[]> {
    const response = await apiClient.get<{ activity_logs: ActivityLog[] }>(
      API_ENDPOINTS.TRAINER_SCHEDULE_ACTIVITY_LOGS(bookingScheduleId)
    );

    return response.data.activity_logs || [];
  }

  /**
   * Get a specific activity log
   */
  async get(id: number): Promise<ActivityLog> {
    const response = await apiClient.get<{ activity_log: ActivityLog }>(
      API_ENDPOINTS.TRAINER_ACTIVITY_LOG_BY_ID(id)
    );

    return response.data.activity_log;
  }

  /**
   * Create a new activity log
   */
  async create(data: CreateActivityLogRequest): Promise<CreateActivityLogResponse> {
    const response = await apiClient.post<CreateActivityLogResponse>(
      API_ENDPOINTS.TRAINER_ACTIVITY_LOGS,
      data
    );

    return response.data;
  }

  /**
   * Update an activity log (only within 24 hours)
   */
  async update(id: number, data: UpdateActivityLogRequest): Promise<UpdateActivityLogResponse> {
    const response = await apiClient.put<UpdateActivityLogResponse>(
      API_ENDPOINTS.TRAINER_ACTIVITY_LOG_BY_ID(id),
      data
    );

    return response.data;
  }

  /**
   * Upload a photo for an activity log
   */
  async uploadPhoto(id: number, photoFile: File): Promise<{ photo_url: string; activity_log: ActivityLog }> {
    const formData = new FormData();
    formData.append('photo', photoFile);

    const response = await apiClient.post<{ photo_url: string; activity_log: ActivityLog }>(
      API_ENDPOINTS.TRAINER_ACTIVITY_LOG_UPLOAD_PHOTO(id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }
}

// Export singleton instance
export const trainerActivityLogRepository = new TrainerActivityLogRepository();

