'use client';

import React, { useCallback } from 'react';
import { useParentSessionNotes } from '@/interfaces/web/hooks/dashboard/useParentSessionNotes';
import { useParentActivityLogs } from '@/interfaces/web/hooks/dashboard/useParentActivityLogs';
import ParentProgressTimeline from '@/components/dashboard/ParentProgressTimeline';
import { EmptyState } from '@/components/dashboard/universal';
import { useLiveRefresh } from '@/core/liveRefresh/LiveRefreshContext';
import { LIVE_REFRESH_ENABLED } from '@/utils/liveRefreshConstants';

export default function ParentProgressPageClient() {
  const { sessionNotesItems, loading: notesLoading, error: notesError, refetch: refetchSessionNotes } = useParentSessionNotes();
  const { activityLogs, loading: logsLoading, error: logsError, refetch: refetchActivityLogs } = useParentActivityLogs();

  const progressRefetch = useCallback(() => {
    void Promise.all([Promise.resolve(refetchSessionNotes(true)), Promise.resolve(refetchActivityLogs())]);
  }, [refetchSessionNotes, refetchActivityLogs]);
  useLiveRefresh('bookings', progressRefetch, { enabled: LIVE_REFRESH_ENABLED });
  useLiveRefresh('trainer_schedules', progressRefetch, { enabled: LIVE_REFRESH_ENABLED });

  const loading = notesLoading || logsLoading;
  const hasNotes = sessionNotesItems.length > 0;
  const hasLogs = activityLogs.length > 0;
  const hasData = hasNotes || hasLogs;
  const error = notesError || logsError;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-full max-w-xl rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load progress"
        message={error}
      />
    );
  }

  if (!hasData) {
    return (
      <EmptyState
        title="No progress data yet"
        message="Session notes and activity logs from your children's sessions will appear here once trainers add notes and log activities."
      />
    );
  }

  return <ParentProgressTimeline sessionNotes={sessionNotesItems} activityLogs={activityLogs} />;
}
