'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { useDashboardSyncEnabled } from '@/core/dashboardSync/DashboardSyncContext';
import { dashboardSyncStore } from '@/core/dashboardSync/dashboardSyncStore';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';

interface AdminDashboardBookingsStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  trendPercent?: number;
}

interface AdminDashboardUsersStats {
  total: number;
  parentsApproved: number;
  parentsPendingApproval: number;
  trendPercent?: number;
}

interface AdminDashboardTrainersStats {
  total: number;
  active: number;
  trendPercent?: number;
}

export interface SessionAwaitingTrainerItem {
  sessionId: string;
  bookingId: string;
  reference: string;
  parentName: string;
  childrenSummary: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface PendingPaymentItem {
  bookingId: string;
  reference: string;
  amount: number;
  parentName: string;
  nextPaymentDueAt: string | null;
  overdueDays: number | null;
  packageName: string;
}

export interface ChildWithZeroHoursItem {
  childId: string;
  childName: string;
  parentName: string;
  bookingId: string;
  reference: string;
  packageName: string;
  remainingHours: number;
}

interface AdminDashboardAlertsStats {
  pendingSafeguardingConcerns: number;
  pendingParentApprovals: number;
  pendingChildChecklists: number;
  pendingTrainerApplications: number;
  sessionsAwaitingTrainer: number;
  sessionsAwaitingTrainerList: SessionAwaitingTrainerItem[];
  pendingPaymentsCount?: number;
  pendingPaymentsList?: PendingPaymentItem[];
  childrenWithZeroHoursCount?: number;
  childrenWithZeroHoursList?: ChildWithZeroHoursItem[];
}

export interface AdminDashboardRevenueStats {
  thisMonth: number;
  lastMonth: number;
  trendPercent: number;
}

export interface AdminDashboardStats {
  bookings: AdminDashboardBookingsStats;
  users: AdminDashboardUsersStats;
  trainers: AdminDashboardTrainersStats;
  alerts: AdminDashboardAlertsStats;
  revenue?: AdminDashboardRevenueStats;
  upcomingSessionsCount?: number;
  sparklineCounts?: number[];
  /** Current week Mon–Fri session counts for mini calendar */
  weekDayCounts?: number[];
  /** Today's sessions count (for alert bar) */
  todaySessionsCount?: number;
}

export function useAdminDashboardStats() {
  const { user } = useAuth();
  const syncEnabled = useDashboardSyncEnabled();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastUserIdRef = useRef<string | number | null>(null);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const response = await apiClient.get<AdminDashboardStats>(
        API_ENDPOINTS.ADMIN_DASHBOARD_STATS
      );
      setStats(response.data);
      if (syncEnabled && user) {
        lastUserIdRef.current = user.id;
        dashboardSyncStore.setAdminStats(user.id, response.data);
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to fetch admin dashboard stats';
      setError(message);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [syncEnabled, user]);

  useEffect(() => {
    if (syncEnabled && user) {
      const cached = dashboardSyncStore.getAdminStats(user.id);
      if (cached?.stats != null) {
        setStats(cached.stats as AdminDashboardStats);
        setLoading(false);
        lastUserIdRef.current = user.id;
        void fetchStats(true);
        return;
      }
    }
    if (syncEnabled && !user) return;
    void fetchStats();
  }, [syncEnabled, user?.id]);

  return { stats, loading, error, refetch: fetchStats };
}

