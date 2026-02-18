'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { useDashboardSyncEnabled } from '@/core/dashboardSync/DashboardSyncContext';
import { dashboardSyncStore } from '@/core/dashboardSync/dashboardSyncStore';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import type { SessionNoteItem } from '@/components/dashboard/SessionNotesCard';

interface RemoteSessionNote {
  scheduleId: string;
  date: string;
  childId: number;
  childName: string;
  noteSnippet?: string;
  noteBody?: string;
}

interface SessionNotesResponse {
  sessionNotes: RemoteSessionNote[];
}

/**
 * Hook: Parent Session Notes
 *
 * Fetches trainer notes for completed sessions (parent dashboard session-notes API).
 * When used inside dashboard: cache-first so returning to tab/route shows last-known data, then refetches in background.
 */
export function useParentSessionNotes() {
  const { user } = useAuth();
  const syncEnabled = useDashboardSyncEnabled();
  const [items, setItems] = useState<SessionNoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const response = await apiClient.get<SessionNotesResponse>(API_ENDPOINTS.DASHBOARD_SESSION_NOTES);
      const raw = response.data?.sessionNotes ?? [];
      const mapped: SessionNoteItem[] = raw.map((n) => ({
        scheduleId: String(n.scheduleId),
        date: n.date,
        childName: n.childName ?? '',
        childId: Number(n.childId),
        noteSnippet: n.noteSnippet,
        noteBody: n.noteBody,
      }));
      setItems(mapped);
      if (syncEnabled && user) {
        dashboardSyncStore.setParentSessionNotes(user.id, mapped);
      }
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Failed to load session notes';
      setError(message);
      setItems([]);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [syncEnabled, user]);

  useEffect(() => {
    if (syncEnabled && user) {
      const cached = dashboardSyncStore.getParentSessionNotes(user.id);
      if (cached?.items != null) {
        setItems(cached.items as SessionNoteItem[]);
        setLoading(false);
        void fetchNotes(true);
        return;
      }
    }
    // When sync is on, wait for user so we don't fetch twice (once without user, once with)
    if (syncEnabled && !user) return;
    void fetchNotes();
  }, [syncEnabled, user?.id]);

  return { sessionNotesItems: items, loading, error, refetch: fetchNotes };
}
