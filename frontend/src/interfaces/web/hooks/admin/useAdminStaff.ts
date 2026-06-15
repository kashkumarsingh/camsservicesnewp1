'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import type {
  AdminStaffDTO,
  CreateStaffDTO,
  UpdateStaffDTO,
  RemoteAdminStaffResponse,
} from '@/core/application/admin/dto/AdminStaffDTO';
import { mapRemoteStaffToDTO } from '@/core/application/admin/dto/AdminStaffDTO';
import { isAdminRole } from '@/dashboard/utils/dashboardConstants';

export type AdminStaffRow = AdminStaffDTO;

export interface UseAdminStaffFilters {
  employmentStatus?: string;
  visaStatus?: string;
  search?: string;
}

export function useAdminStaff(filters?: UseAdminStaffFilters) {
  const { user, loading: authLoading } = useAuth();
  const [staff, setStaff] = useState<AdminStaffRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef<boolean>(false);

  const employmentStatusFilter = filters?.employmentStatus;
  const visaStatusFilter = filters?.visaStatus;
  const searchFilter = filters?.search;

  const fetchStaff = useCallback(
    async (silent = false) => {
      if (fetchingRef.current || authLoading) {
        return;
      }

      if (!user || !isAdminRole(user.role)) {
        setLoading(false);
        setStaff([]);
        setError(null);
        return;
      }

      fetchingRef.current = true;
      if (!silent) {
        setLoading(true);
        setError(null);
      }

      try {
        const params: Record<string, string> = {};
        if (employmentStatusFilter) params.employment_status = employmentStatusFilter;
        if (visaStatusFilter) params.visa_status = visaStatusFilter;
        if (searchFilter) params.search = searchFilter;

        const query = new URLSearchParams(params).toString();
        const url = query ? `${API_ENDPOINTS.ADMIN_STAFF}?${query}` : API_ENDPOINTS.ADMIN_STAFF;

        const response = await apiClient.get<{
          data: RemoteAdminStaffResponse[];
          meta?: { total_count?: number };
        }>(url);

        const remoteStaff = Array.isArray(response.data?.data) ? response.data.data : [];
        setStaff(remoteStaff.map((remote) => mapRemoteStaffToDTO(remote)));
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err instanceof Error ? err.message : 'Failed to load staff');
        setError(message);
        setStaff([]);
      } finally {
        if (!silent) {
          setLoading(false);
        }
        fetchingRef.current = false;
      }
    },
    [authLoading, user, employmentStatusFilter, visaStatusFilter, searchFilter]
  );

  const getStaffById = useCallback(async (id: string): Promise<AdminStaffDTO | null> => {
    const response = await apiClient.get<RemoteAdminStaffResponse>(API_ENDPOINTS.ADMIN_STAFF_BY_ID(id));
    return mapRemoteStaffToDTO(response.data);
  }, []);

  const createStaff = useCallback(
    async (data: CreateStaffDTO): Promise<AdminStaffDTO> => {
      const response = await apiClient.post<RemoteAdminStaffResponse>(API_ENDPOINTS.ADMIN_STAFF, data);
      const created = mapRemoteStaffToDTO(response.data);
      setStaff((prev) => [created, ...prev]);
      fetchStaff(true);
      return created;
    },
    [fetchStaff]
  );

  const updateStaff = useCallback(
    async (id: string, data: UpdateStaffDTO): Promise<AdminStaffDTO> => {
      const response = await apiClient.put<RemoteAdminStaffResponse>(
        API_ENDPOINTS.ADMIN_STAFF_BY_ID(id),
        data
      );
      const updated = mapRemoteStaffToDTO(response.data);
      setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    },
    []
  );

  const deleteStaff = useCallback(async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.ADMIN_STAFF_BY_ID(id));
    setStaff((prev) => prev.filter((s) => s.id !== id));
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchStaff();
    }
  }, [authLoading, fetchStaff]);

  return {
    staff,
    loading,
    error,
    refetch: fetchStaff,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff,
  };
}
