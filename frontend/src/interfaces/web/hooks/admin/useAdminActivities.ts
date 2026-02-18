/**
 * useAdminActivities Hook (Interface Layer)
 *
 * Clean Architecture Layer: Interface (Web Hook)
 * Purpose: Provides CRUD operations for admin activities management.
 * Location: frontend/src/interfaces/web/hooks/admin/useAdminActivities.ts
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  AdminActivityDTO,
  CreateActivityDTO,
  UpdateActivityDTO,
  RemoteAdminActivityResponse,
} from '@/core/application/admin/dto/AdminActivityDTO';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { mapRemoteActivityToDTO } from '@/core/application/admin/dto/AdminActivityDTO';
import { getApiErrorMessage } from '@/utils/errorUtils';

interface UseAdminActivitiesOptions {
  category?: string;
  isActive?: boolean;
  search?: string;
}

interface UseAdminActivitiesReturn {
  activities: AdminActivityDTO[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createActivity: (data: CreateActivityDTO) => Promise<AdminActivityDTO>;
  updateActivity: (id: string, data: UpdateActivityDTO) => Promise<AdminActivityDTO>;
  deleteActivity: (id: string) => Promise<void>;
  getActivityById: (id: string) => Promise<AdminActivityDTO>;
}

export function useAdminActivities(options: UseAdminActivitiesOptions = {}): UseAdminActivitiesReturn {
  const [activities, setActivities] = useState<AdminActivityDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.category) {
        params.append('category', options.category);
      }
      if (options.isActive !== undefined) {
        params.append('isActive', String(options.isActive));
      }
      if (options.search) {
        params.append('search', options.search);
      }

      const url = params.toString()
        ? `${API_ENDPOINTS.ADMIN_ACTIVITIES}?${params.toString()}`
        : API_ENDPOINTS.ADMIN_ACTIVITIES;

      // Admin activities API uses the standard collectionResponse shape: { success, data: [...], meta }
      const response = await apiClient.get<{ data: RemoteAdminActivityResponse[] }>(url);
      const payload = response.data;
      const raw: RemoteAdminActivityResponse[] = Array.isArray(payload)
        ? payload
        : payload && typeof payload === 'object' && 'data' in payload && Array.isArray((payload as { data: unknown }).data)
          ? (payload as { data: RemoteAdminActivityResponse[] }).data
          : [];

      setActivities(raw.map(mapRemoteActivityToDTO));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load activities'));
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [options.category, options.isActive, options.search]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const createActivity = useCallback(
    async (data: CreateActivityDTO): Promise<AdminActivityDTO> => {
      try {
        const response = await apiClient.post<RemoteAdminActivityResponse>(
          API_ENDPOINTS.ADMIN_ACTIVITIES,
          data,
        );

        if (!response.data) {
          throw new Error('Failed to create activity');
        }

        const dto = mapRemoteActivityToDTO(response.data);
        await fetchActivities();
        return dto;
      } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, 'Failed to create activity'));
      }
    },
    [fetchActivities],
  );

  const updateActivity = useCallback(
    async (id: string, data: UpdateActivityDTO): Promise<AdminActivityDTO> => {
      try {
        const response = await apiClient.put<RemoteAdminActivityResponse>(
          API_ENDPOINTS.ADMIN_ACTIVITY_BY_ID(id),
          data,
        );

        if (!response.data) {
          throw new Error('Failed to update activity');
        }

        const dto = mapRemoteActivityToDTO(response.data);
        await fetchActivities();
        return dto;
      } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, 'Failed to update activity'));
      }
    },
    [fetchActivities],
  );

  const deleteActivity = useCallback(
    async (id: string): Promise<void> => {
      try {
        await apiClient.delete(API_ENDPOINTS.ADMIN_ACTIVITY_BY_ID(id));
        await fetchActivities();
      } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, 'Failed to delete activity'));
      }
    },
    [fetchActivities],
  );

  const getActivityById = useCallback(async (id: string): Promise<AdminActivityDTO> => {
    try {
      const response = await apiClient.get<RemoteAdminActivityResponse>(
        API_ENDPOINTS.ADMIN_ACTIVITY_BY_ID(id),
      );

      if (!response.data) {
        throw new Error('Activity not found');
      }

      return mapRemoteActivityToDTO(response.data);
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, 'Failed to load activity'));
    }
  }, []);

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    getActivityById,
  };
}

