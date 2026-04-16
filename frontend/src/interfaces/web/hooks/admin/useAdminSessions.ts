import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { getApiErrorMessage } from '@/shared/utils/errorUtils';

export interface AdminSessionItem {
  id: string;
  bookingId?: string | number;
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  trainerId?: string | number | null;
  notes?: string | null;
}

interface AdminSessionsResponse {
  data?: AdminSessionItem[];
}

export interface UseAdminSessionsOptions {
  page?: number;
  perPage?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  search?: string;
}

export function useAdminSessions(options: UseAdminSessionsOptions = {}) {
  const [sessions, setSessions] = useState<AdminSessionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.page != null) params.append('page', String(options.page));
      if (options.perPage != null) params.append('per_page', String(options.perPage));
      if (options.dateFrom) params.append('date_from', options.dateFrom);
      if (options.dateTo) params.append('date_to', options.dateTo);
      if (options.status) params.append('status', options.status);
      if (options.search) params.append('search', options.search);
      const query = params.toString();
      const url = query ? `${API_ENDPOINTS.ADMIN_SESSIONS}?${query}` : API_ENDPOINTS.ADMIN_SESSIONS;

      const response = await apiClient.get<AdminSessionsResponse | AdminSessionItem[]>(url);
      const raw = response.data;
      const list = Array.isArray(raw) ? raw : raw?.data;
      setSessions(Array.isArray(list) ? list : []);
    } catch (err: unknown) {
      setSessions([]);
      setError(getApiErrorMessage(err, 'Failed to load sessions'));
    } finally {
      setLoading(false);
    }
  }, [options.dateFrom, options.dateTo, options.page, options.perPage, options.search, options.status]);

  const updateSession = useCallback(
    async (sessionId: string | number, payload: Record<string, unknown>): Promise<void> => {
      await apiClient.patch(API_ENDPOINTS.ADMIN_SESSION_BY_ID(sessionId), payload);
      await fetchSessions();
    },
    [fetchSessions]
  );

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions,
    updateSession,
  };
}

