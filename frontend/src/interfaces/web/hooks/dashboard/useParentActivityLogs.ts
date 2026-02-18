'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import type { ActivityLog } from '@/core/application/trainer/types';

interface ParentActivityLogsResponse {
  activity_logs: ActivityLog[];
}

/**
 * Hook: Parent Activity Logs
 *
 * Fetches activity logs for the authenticated parent's children (from their bookings).
 * Used by the Progress page to build the aggregated timeline with session notes.
 */
export function useParentActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ParentActivityLogsResponse>(API_ENDPOINTS.DASHBOARD_ACTIVITY_LOGS);
      const raw = response.data?.activity_logs ?? [];
      setLogs(Array.isArray(raw) ? raw : []);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to load activity logs';
      setError(message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { activityLogs: logs, loading, error, refetch: fetchLogs };
}
