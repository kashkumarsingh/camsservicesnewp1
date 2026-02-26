'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { X, RefreshCw } from 'lucide-react';
import type { SessionAwaitingTrainerItem } from '@/interfaces/web/hooks/dashboard/useAdminDashboardStats';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { useLiveRefreshContext } from '@/core/liveRefresh/LiveRefreshContext';

interface UnassignedSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SessionAwaitingTrainerItem[];
  onAssigned: () => void;
}

export function UnassignedSessionsModal({
  isOpen,
  onClose,
  sessions,
  onAssigned,
}: UnassignedSessionsModalProps) {
  const router = useRouter();
  const liveRefreshContext = useLiveRefreshContext();
  const [assigningSessionId, setAssigningSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Increment to refetch available trainers (e.g. after trainer calendar updated). */
  const [syncKey, setSyncKey] = useState(0);

  /** Per-session available trainers (same API as timeline & Bookings – conflict, availability, qualified) */
  const [availableBySessionId, setAvailableBySessionId] = useState<
    Record<string, { list: { id: string; name: string }[]; loading: boolean }>
  >({});

  const sessionIdsKey = useMemo(
    () => (isOpen && sessions.length ? sessions.map((s) => s.sessionId).sort().join(',') : ''),
    [isOpen, sessions]
  );

  useEffect(() => {
    if (!sessionIdsKey) {
      setAvailableBySessionId({});
      return;
    }
    const sessionIds = sessionIdsKey.split(',').filter(Boolean);
    setAvailableBySessionId((prev) => {
      const next = { ...prev };
      sessionIds.forEach((id) => {
        next[id] = { list: [], loading: true };
      });
      return next;
    });
    let cancelled = false;
    Promise.all(
      sessionIds.map(async (sessionId) => {
        try {
          const res = await apiClient.get<{
            trainers?: { id: string; name: string }[];
          }>(API_ENDPOINTS.ADMIN_BOOKING_AVAILABLE_TRAINERS(sessionId));
          const list = res?.data?.trainers ?? [];
          return { sessionId, list };
        } catch {
          return { sessionId, list: [] as { id: string; name: string }[] };
        }
      })
    ).then((results) => {
      if (cancelled) return;
      setAvailableBySessionId((prev) => {
        const next = { ...prev };
        results.forEach(({ sessionId, list }) => {
          next[sessionId] = { list, loading: false };
        });
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [sessionIdsKey, syncKey]);

  const handleSyncAvailability = useCallback(() => {
    setSyncKey((k) => k + 1);
  }, []);

  if (!isOpen) return null;

  const handleAssign = async (sessionId: string, trainerId: string) => {
    if (!trainerId) return;
    setError(null);
    setAssigningSessionId(sessionId);
    try {
      await apiClient.put(API_ENDPOINTS.ADMIN_BOOKING_ASSIGN_TRAINER(sessionId), {
        trainer_id: trainerId,
      });
      liveRefreshContext?.invalidate('notifications');
      liveRefreshContext?.invalidate('bookings');
      liveRefreshContext?.invalidate('trainer_schedules');
      onAssigned();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign trainer');
    } finally {
      setAssigningSessionId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  const formatTime = (start?: string, end?: string) =>
    start && end ? `${start.slice(0, 5)} – ${end.slice(0, 5)}` : '';

  const modal = (
    <div
      className="fixed inset-0 z-overlay flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unassigned-sessions-title"
    >
      <div className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h2 id="unassigned-sessions-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Unassigned sessions ({sessions.length})
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleSyncAvailability}
              className="inline-flex items-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Sync available trainers"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Sync
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(85vh - 56px)' }}>
          {error && (
            <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:bg-rose-950/50 dark:text-rose-200">
              {error}
            </p>
          )}
          {sessions.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">No unassigned sessions.</p>
          ) : (
            <ul className="space-y-4">
              {sessions.map((item) => {
                const isAssigning = assigningSessionId === item.sessionId;
                const dateLabel = formatDate(item.date);
                const timeLabel = formatTime(item.startTime, item.endTime);
                return (
                  <li
                    key={item.sessionId}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50"
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {item.childrenSummary}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                      {dateLabel}
                      {timeLabel && ` · ${timeLabel}`}
                      {item.reference && (
                        <span className="text-slate-400 dark:text-slate-500"> · Ref {item.reference}</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">
                      Parent: {item.parentName}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {(() => {
                        const entry = availableBySessionId[item.sessionId];
                        const loading = !entry || entry.loading;
                        const list = entry?.list ?? [];
                        if (loading) {
                          return (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Checking availability…
                            </span>
                          );
                        }
                        if (list.length === 0) {
                          return (
                            <span className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              No available trainers
                              <button
                                type="button"
                                onClick={handleSyncAvailability}
                                className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline dark:text-indigo-300"
                                aria-label="Sync available trainers for this session"
                              >
                                <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                                Sync
                              </button>
                            </span>
                          );
                        }
                        return (
                          <select
                            aria-label={`Assign trainer for ${item.childrenSummary}`}
                            value=""
                            onChange={(e) => {
                              const id = e.target.value;
                              if (id) handleAssign(item.sessionId, id);
                              e.currentTarget.value = '';
                            }}
                            disabled={isAssigning}
                            className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 disabled:opacity-50"
                          >
                            <option value="">
                              {isAssigning ? 'Assigning…' : 'Select trainer…'}
                            </option>
                            {list.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        );
                      })()}
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          router.push('/dashboard/admin/bookings');
                        }}
                        className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-300"
                      >
                        View booking
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="border-t border-slate-200 px-4 py-2 dark:border-slate-700">
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push('/dashboard/admin/bookings?needs_trainer=1');
            }}
            className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
          >
            View all in Bookings →
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal;
}
