'use client';

/**
 * Dashboard notification bell: list + unread count for the current user.
 *
 * How the bell gets the latest data (no browser refresh needed):
 * 1. Initial load – fetch when user is set (useEffect with user?.id).
 * 2. Window focus – refetch when the tab regains focus (e.g. after switching back).
 * 3. Live refresh – when the backend broadcasts LiveRefreshContextsUpdated for
 *    "notifications", Echo receives it and the provider calls refetch(silent). The shell
 *    subscribes via useLiveRefresh("notifications", refetchNotifications).
 * 4. Open panel – when the user clicks the bell to open the dropdown, we refetch once
 *    so the list is fresh (DashboardShell onClick).
 */
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';

/** Category slugs returned by the API for grouping (booking, payment, session, child, account, trainer_application). */
export type NotificationCategory =
  | 'booking'
  | 'payment'
  | 'session'
  | 'child'
  | 'account'
  | 'trainer_application';

export interface DashboardNotification {
  id: string;
  type: string;
  category: NotificationCategory;
  categoryLabel: string;
  title: string;
  message: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
  /** Human-friendly relative time, e.g. "just now", "yesterday", "2 days ago", "1 week ago" */
  createdAtLabel?: string;
}

/** Raw API notification (category/categoryLabel optional for backwards compatibility). */
interface RawNotification extends Omit<DashboardNotification, 'category' | 'categoryLabel'> {
  category?: NotificationCategory;
  categoryLabel?: string;
}

interface NotificationsResponse {
  notifications: RawNotification[];
  unreadCount: number;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export function useDashboardNotifications(options?: { unreadOnly?: boolean }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('per_page', '20');
        if (options?.unreadOnly) params.set('unread_only', '1');
        // Cache-bust so refetches (live-refresh, open bell, focus) always get fresh list, not stale
        params.set('_t', String(Date.now()));
        const url = `${API_ENDPOINTS.NOTIFICATIONS}?${params.toString()}`;
        const res = await apiClient.get<NotificationsResponse>(url, { timeout: 20000 });
        // ApiClient normally unwraps to res.data = { notifications, unreadCount, meta }.
        // Support both direct payload and Laravel envelope { success, data: { ... } }.
        const raw = res.data as
          | NotificationsResponse
          | { data?: NotificationsResponse; success?: boolean }
          | undefined;
        let payload: NotificationsResponse | undefined;
        if (raw && typeof raw === 'object' && 'notifications' in raw && Array.isArray((raw as NotificationsResponse).notifications)) {
          payload = raw as NotificationsResponse;
        } else if (raw && typeof raw === 'object' && 'data' in raw && raw.data && typeof raw.data === 'object' && 'notifications' in raw.data) {
          payload = raw.data as NotificationsResponse;
        }
        const rawList = Array.isArray(payload?.notifications) ? payload.notifications : [];
        const count = typeof payload?.unreadCount === 'number' ? payload.unreadCount : 0;
        const list = rawList.map((n) => ({
          ...n,
          category: (n.category ?? 'session') as NotificationCategory,
          categoryLabel: n.categoryLabel ?? 'Notification',
        }));
        setNotifications(list);
        setUnreadCount(count);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [options?.unreadOnly]
  );

  // Single fetch when user is available. Deps use primitive user?.id only so we don't refetch when user object reference changes.
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    } else {
      setLoading(false);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?.id, fetchNotifications]);

  // Refetch when window regains focus so admins see new notifications (e.g. checklist submitted)
  useEffect(() => {
    const handleFocus = () => fetchNotifications(true);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchNotifications]);

  const markRead = useCallback(async (id: string) => {
    try {
      await apiClient.patch(API_ENDPOINTS.NOTIFICATION_MARK_READ(id), {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Optimistic update reverted on error could be added
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await apiClient.post(API_ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ, {});
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markRead,
    markAllRead,
  };
}
