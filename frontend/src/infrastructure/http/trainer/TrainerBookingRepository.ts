/**
 * Trainer Booking Repository (Infrastructure Layer)
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: HTTP client for trainer booking API calls
 * Location: frontend/src/infrastructure/http/trainer/TrainerBookingRepository.ts
 */

import { apiClient } from '../ApiClient';
import { API_ENDPOINTS } from '../apiEndpoints';
import type {
  TrainerBooking,
  TrainerBookingsResponse,
  TrainerBookingDetailResponse,
  UpdateScheduleStatusRequest,
  UpdateScheduleStatusResponse,
  TrainerDashboardStatsResponse,
  TrainerDashboardStats,
} from '@/core/application/trainer/types';

export class TrainerBookingRepository {
  /**
   * Get all bookings assigned to authenticated trainer
   */
  async list(filters?: {
    status?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  }): Promise<TrainerBookingsResponse> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.date_from) queryParams.append('date_from', filters.date_from);
    if (filters?.date_to) queryParams.append('date_to', filters.date_to);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.per_page) queryParams.append('per_page', filters.per_page.toString());

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.TRAINER_BOOKINGS}?${queryParams.toString()}`
      : API_ENDPOINTS.TRAINER_BOOKINGS;

    // ApiClient unwraps the response, so response.data is the actual data object
    // Backend returns: { success: true, data: { bookings: [...] }, meta: { pagination: {...} } }
    // ApiClient returns: { data: { bookings: [...] } }
    const response = await apiClient.get<{ bookings: TrainerBooking[]; meta?: { pagination?: any } }>(url);

    return {
      bookings: response.data?.bookings ?? [],
      pagination: response.data?.meta?.pagination,
    };
  }

  /**
   * Get detailed booking information
   */
  async get(id: number): Promise<TrainerBooking> {
    // ApiClient unwraps the response, so response.data is the actual data object
    // Backend returns: { success: true, data: { booking: {...} } }
    // ApiClient returns: { data: { booking: {...} } }
    const response = await apiClient.get<TrainerBookingDetailResponse>(
      API_ENDPOINTS.TRAINER_BOOKING_BY_ID(id)
    );

    if (!response.data?.booking) {
      throw new Error('Invalid response: missing booking');
    }
    return response.data.booking;
  }

  /**
   * Update schedule status
   */
  async updateScheduleStatus(
    bookingId: number,
    scheduleId: number,
    data: UpdateScheduleStatusRequest
  ): Promise<UpdateScheduleStatusResponse> {
    // ApiClient unwraps the response, so response.data is the actual data object
    // Backend returns: { success: true, data: { schedule: {...} } }
    // ApiClient returns: { data: { schedule: {...} } }
    const response = await apiClient.put<UpdateScheduleStatusResponse>(
      API_ENDPOINTS.TRAINER_UPDATE_SCHEDULE_STATUS(bookingId, scheduleId),
      data
    );

    return response.data;
  }

  /**
   * Get trainer dashboard statistics
   */
  async getStats(): Promise<{
    stats: TrainerDashboardStats;
    recentBookings: TrainerDashboardStatsResponse['data']['recentBookings'];
  }> {
    // ApiClient unwraps the response, so response.data is the actual data object
    // Backend returns camelCase (ApiResponseHelper)
    const response = await apiClient.get<TrainerDashboardStatsResponse['data']>(
      API_ENDPOINTS.TRAINER_BOOKINGS_STATS
    );

    return {
      stats: response.data.stats,
      recentBookings: response.data.recentBookings ?? [],
    };
  }
}

// Export singleton instance
export const trainerBookingRepository = new TrainerBookingRepository();

