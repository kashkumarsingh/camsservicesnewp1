/**
 * useAdminTrainerSchedules Hook (Interface Layer)
 *
 * Clean Architecture: Interface Layer
 * Purpose: Fetch booking schedules for a trainer (admin view)
 * Location: frontend/src/interfaces/web/hooks/admin/useAdminTrainerSchedules.ts
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import type {
  RemoteAdminTrainerSchedulesResponse,
  RemoteAdminTrainerScheduleDetailResponse,
  RemoteAdminScheduleItem,
  RemoteAdminScheduleDetail,
  AdminTrainerSchedulesFilters,
} from '@/core/application/admin/dto/AdminTrainerScheduleDTO';

export function useAdminTrainerSchedules(
  trainerId: string,
  filters?: AdminTrainerSchedulesFilters
) {
  const [schedules, setSchedules] = useState<RemoteAdminScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  } | null>(null);

  const fetchSchedules = useCallback(
    async (customFilters?: AdminTrainerSchedulesFilters) => {
      if (!trainerId) {
        setSchedules([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const active = customFilters ?? filters ?? {};
        const params = new URLSearchParams();
        if (active.date_from) params.append('date_from', active.date_from);
        if (active.date_to) params.append('date_to', active.date_to);
        if (active.status) params.append('status', active.status);
        if (active.month != null) params.append('month', String(active.month));
        if (active.year != null) params.append('year', String(active.year));
        if (active.per_page != null) params.append('per_page', String(active.per_page));
        const query = params.toString();
        const url = query
          ? `${API_ENDPOINTS.ADMIN_TRAINER_SCHEDULES(trainerId)}?${query}`
          : API_ENDPOINTS.ADMIN_TRAINER_SCHEDULES(trainerId);

        const response = await apiClient.get<RemoteAdminTrainerSchedulesResponse>(url);

        // ApiClient unwraps backend { data, meta } so response.data is { schedules } (and possibly meta)
        const schedules =
          response.data?.data?.schedules ??
          (response.data as { schedules?: RemoteAdminScheduleItem[] })?.schedules;
        if (!Array.isArray(schedules)) {
          throw new Error('Invalid response format');
        }
        setSchedules(schedules);
        setPagination(
          (response.data as { meta?: { pagination?: { current_page: number; per_page: number; total: number; last_page: number; from: number | null; to: number | null } } })?.meta?.pagination ??
            null
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load schedules');
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    },
    [trainerId, filters]
  );

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return {
    schedules,
    loading,
    error,
    pagination,
    refetch: () => fetchSchedules(),
  };
}

/**
 * Fetch a single trainer schedule (admin view). Use for shift detail page.
 */
export function useAdminTrainerScheduleDetail(
  trainerId: string,
  scheduleId: string
) {
  const [schedule, setSchedule] = useState<RemoteAdminScheduleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    if (!trainerId || !scheduleId) {
      setSchedule(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<RemoteAdminTrainerScheduleDetailResponse>(
        API_ENDPOINTS.ADMIN_TRAINER_SCHEDULE_BY_ID(trainerId, scheduleId)
      );
      // ApiClient unwraps backend { data } so response.data may be { schedule } or { data: { schedule } }
      const schedule =
        response.data?.data?.schedule ??
        (response.data as { schedule?: RemoteAdminScheduleDetail })?.schedule;
      if (!schedule) {
        throw new Error('Invalid response format');
      }
      setSchedule(schedule);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedule');
      setSchedule(null);
    } finally {
      setLoading(false);
    }
  }, [trainerId, scheduleId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return { schedule, loading, error, refetch: fetchSchedule };
}
