import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { getApiErrorMessage } from '@/shared/utils/errorUtils';

export interface AdminAuditLogItem {
  id: string;
  action?: string;
  actorName?: string;
  actorEmail?: string;
  entityType?: string;
  entityId?: string | number;
  createdAt?: string;
  metadata?: Record<string, unknown> | null;
}

interface AdminAuditLogsResponse {
  data?: AdminAuditLogItem[];
}

export interface UseAdminAuditLogsOptions {
  page?: number;
  perPage?: number;
  search?: string;
  action?: string;
}

export function useAdminAuditLogs(options: UseAdminAuditLogsOptions = {}) {
  const [logs, setLogs] = useState<AdminAuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.page != null) params.append('page', String(options.page));
      if (options.perPage != null) params.append('per_page', String(options.perPage));
      if (options.search) params.append('search', options.search);
      if (options.action) params.append('action', options.action);

      const query = params.toString();
      const url = query ? `${API_ENDPOINTS.ADMIN_AUDIT_LOGS}?${query}` : API_ENDPOINTS.ADMIN_AUDIT_LOGS;
      const response = await apiClient.get<AdminAuditLogsResponse | AdminAuditLogItem[]>(url);
      const raw = response.data;
      const list = Array.isArray(raw) ? raw : raw?.data;
      setLogs(Array.isArray(list) ? list : []);
    } catch (err: unknown) {
      setLogs([]);
      setError(getApiErrorMessage(err, 'Failed to load audit logs'));
    } finally {
      setLoading(false);
    }
  }, [options.action, options.page, options.perPage, options.search]);

  useEffect(() => {
    void fetchAuditLogs();
  }, [fetchAuditLogs]);

  return {
    logs,
    loading,
    error,
    refetch: fetchAuditLogs,
  };
}

