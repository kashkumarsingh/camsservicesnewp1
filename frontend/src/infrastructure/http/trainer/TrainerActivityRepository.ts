/**
 * Trainer Activity Repository (Infrastructure Layer)
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: HTTP client for trainer activity assignment API calls
 * Location: frontend/src/infrastructure/http/trainer/TrainerActivityRepository.ts
 */

import { apiClient } from '../ApiClient';
import { API_ENDPOINTS } from '../apiEndpoints';
import type {
  SessionActivitiesResponse,
  AssignActivityRequest,
  AssignActivityResponse,
  ConfirmActivitiesRequest,
  ConfirmActivitiesResponse,
  OverrideActivityCountRequest,
  OverrideActivityCountResponse,
} from '@/core/application/trainer/types';

export class TrainerActivityRepository {
  /**
   * Get session activities with calculation info
   */
  async getSessionActivities(scheduleId: number): Promise<SessionActivitiesResponse> {
    const response = await apiClient.get<SessionActivitiesResponse>(
      API_ENDPOINTS.TRAINER_SCHEDULE_ACTIVITIES(scheduleId)
    );

    if (!response.data?.schedule) {
      throw new Error('Invalid response: missing data');
    }
    return response.data;
  }

  /**
   * Assign activity to session
   */
  async assignActivity(scheduleId: number, data: AssignActivityRequest): Promise<AssignActivityResponse> {
    const response = await apiClient.post<{ data: AssignActivityResponse }>(
      API_ENDPOINTS.TRAINER_SCHEDULE_ACTIVITIES(scheduleId),
      data
    );

    if (!response.data?.data) {
      throw new Error('Invalid response: missing data');
    }
    return response.data.data;
  }

  /**
   * Confirm activity assignment (triggers parent notification)
   */
  async confirmActivities(scheduleId: number, data?: ConfirmActivitiesRequest): Promise<ConfirmActivitiesResponse> {
    const response = await apiClient.post<{ data: ConfirmActivitiesResponse }>(
      API_ENDPOINTS.TRAINER_SCHEDULE_ACTIVITIES_CONFIRM(scheduleId),
      data || {}
    );

    if (!response.data?.data) {
      throw new Error('Invalid response: missing data');
    }
    return response.data.data;
  }

  /**
   * Override activity count for session
   */
  async overrideActivityCount(scheduleId: number, data: OverrideActivityCountRequest): Promise<OverrideActivityCountResponse> {
    const response = await apiClient.put<{ data: OverrideActivityCountResponse }>(
      API_ENDPOINTS.TRAINER_SCHEDULE_ACTIVITIES_OVERRIDE(scheduleId),
      data
    );

    if (!response.data?.data) {
      throw new Error('Invalid response: missing data');
    }
    return response.data.data;
  }

  /**
   * Remove activity override (reset to calculated)
   */
  async removeOverride(scheduleId: number): Promise<{ schedule: { id: number; activity_count: number; is_activity_override: boolean } }> {
    const response = await apiClient.delete<{ data: { schedule: any } }>(
      API_ENDPOINTS.TRAINER_SCHEDULE_ACTIVITIES_OVERRIDE(scheduleId)
    );

    if (!response.data?.data) {
      throw new Error('Invalid response: missing data');
    }
    return response.data.data;
  }

  /**
   * Remove activity from session
   */
  async removeActivity(scheduleId: number, activityId: number): Promise<void> {
    await apiClient.delete(
      API_ENDPOINTS.TRAINER_SCHEDULE_ACTIVITY_REMOVE(scheduleId, activityId)
    );
  }
}

// Export singleton instance
export const trainerActivityRepository = new TrainerActivityRepository();

