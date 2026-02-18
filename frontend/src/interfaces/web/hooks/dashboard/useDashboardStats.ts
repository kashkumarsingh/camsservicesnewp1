'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { useDashboardSyncEnabled } from '@/core/dashboardSync/DashboardSyncContext';
import { dashboardSyncStore } from '@/core/dashboardSync/dashboardSyncStore';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { getApiErrorMessage } from '@/utils/errorUtils';

interface DashboardStats {
  approvedChildrenCount: number;
  totalChildren: number;
  pendingChildren: number;
  rejectedChildren: number;
  childrenNeedingChecklist: number;
  childrenWithPendingChecklist: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalBookedSessions: number;
  totalOutstanding: number;
  totalHoursPurchased: number;
  totalHoursBooked: number;
  activePackageNames: string[];
  activePackagesPerChild: Array<{
    childId?: number;
    packageName?: string;
    activePackages?: Array<{ remainingHours?: number }>;
    [key: string]: unknown;
  }>;
  totalActivePackages: number;
}

export function useDashboardStats() {
  const { user } = useAuth();
  const syncEnabled = useDashboardSyncEnabled();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastUserIdRef = useRef<string | number | null>(null);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const response = await apiClient.get<DashboardStats>(API_ENDPOINTS.DASHBOARD_STATS);
      setStats(response.data);
      if (syncEnabled && user) {
        lastUserIdRef.current = user.id;
        dashboardSyncStore.setParentStats(user.id, response.data);
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to fetch dashboard stats'));
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [syncEnabled, user]);

  useEffect(() => {
    if (syncEnabled && user) {
      const cached = dashboardSyncStore.getParentStats(user.id);
      if (cached?.stats != null) {
        setStats(cached.stats as DashboardStats);
        setLoading(false);
        lastUserIdRef.current = user.id;
        void fetchStats(true);
        return;
      }
    }
    // When sync is on, wait for user so we don't fetch twice (once without user, once with)
    if (syncEnabled && !user) return;
    void fetchStats();
  }, [syncEnabled, user?.id]);

  return { stats, loading, error, refetch: fetchStats };
}
