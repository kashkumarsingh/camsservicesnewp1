'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  X,
  Clock,
  MapPin,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Activity,
  Circle,
  CircleCheck,
  Play,
  Timer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { useLiveRefresh } from '@/core/liveRefresh/LiveRefreshContext';
import { LIVE_REFRESH_ENABLED } from '@/utils/liveRefreshConstants';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';
import { SCHEDULE_SESSION_STATUS } from '@/utils/dashboardConstants';
import { getGoogleMapsSearchUrl, getGoogleMapsUrlForCoordinates } from '@/utils/locationUtils';
import type { AdminBookingDTO } from '@/core/application/admin/dto/AdminBookingDTO';
import type { RemoteBookingSession } from '@/core/application/admin/dto/AdminBookingDTO';

function formatTime(t: string): string {
  if (!t || t.length < 5) return '';
  return t.slice(0, 5);
}

function formatTimeFromIso(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

function formatDateLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/** Session is in progress: not completed/cancelled and current time within start–end. */
function isSessionInProgress(session: RemoteBookingSession): boolean {
  if (!session?.date || !session?.startTime || !session?.endTime) return false;
  const status = session.status ?? 'scheduled';
  if (status === SCHEDULE_SESSION_STATUS.COMPLETED || status === SCHEDULE_SESSION_STATUS.CANCELLED || status === SCHEDULE_SESSION_STATUS.NO_SHOW) return false;
  const start = new Date(session.date + 'T' + session.startTime).getTime();
  const end = new Date(session.date + 'T' + session.endTime).getTime();
  const now = Date.now();
  return now >= start && now <= end;
}

export interface RemoteActivityLogItem {
  id: string;
  activityName: string;
  description?: string | null;
  notes?: string | null;
  behavioralObservations?: string | null;
  achievements?: string | null;
  challenges?: string | null;
  status: string;
  activityDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  durationMinutes?: number | null;
  actualHoursUsed?: number | null;
  activityCompletedAt?: string | null;
  milestoneAchieved?: boolean;
  milestoneName?: string | null;
  milestoneDescription?: string | null;
  childName?: string | null;
  createdAt?: string | null;
}

/** Sorted activity logs (oldest first) and id of the "current" log if any. */
function useSortedActivityLogs(
  logs: RemoteActivityLogItem[],
  currentActivityId: string | null | undefined,
  currentActivityName: string | null | undefined
) {
  return useMemo(() => {
    const sorted = [...logs].sort((a, b) => {
      const aTime = a.startTime || a.activityDate || a.createdAt || '';
      const bTime = b.startTime || b.activityDate || b.createdAt || '';
      return String(aTime).localeCompare(String(bTime), undefined, { numeric: true });
    });
    const currentLogId =
      currentActivityId && sorted.some((l) => l.id === currentActivityId)
        ? currentActivityId
        : currentActivityName && sorted.length > 0
          ? (sorted.find((l) => (l.activityName || '').trim() === (currentActivityName || '').trim())?.id ?? null)
          : null;
    return { sorted, currentLogId };
  }, [logs, currentActivityId, currentActivityName]);
}

interface SessionActivityContentProps {
  session: RemoteBookingSession;
  sessionId: string;
  bookingId: string;
  childrenSummary: string;
  activityLogs: RemoteActivityLogItem[];
  onViewFullBooking?: (sessionId: string, bookingId: string) => void;
}

const INITIAL_ACTIVITY_LOGS_COUNT = 3;

type LatestActivityTab = 'session' | 'logs';

function SessionActivityContent({
  session,
  sessionId,
  bookingId,
  childrenSummary,
  activityLogs,
  onViewFullBooking,
}: SessionActivityContentProps) {
  const inProgress = isSessionInProgress(session);
  const [activeTab, setActiveTab] = useState<LatestActivityTab>('session');
  const [logsExpanded, setLogsExpanded] = useState(false);
  const { sorted: sortedLogs, currentLogId } = useSortedActivityLogs(
    activityLogs,
    session.currentActivityId,
    session.currentActivityName
  );
  const visibleLogs = logsExpanded
    ? sortedLogs
    : sortedLogs.slice(-INITIAL_ACTIVITY_LOGS_COUNT);
  const hasMoreLogs = sortedLogs.length > INITIAL_ACTIVITY_LOGS_COUNT;
  const hiddenCount = sortedLogs.length - INITIAL_ACTIVITY_LOGS_COUNT;

  const tabs: { id: LatestActivityTab; label: string }[] = [
    { id: 'session', label: 'Session' },
    { id: 'logs', label: 'Activity logs' },
  ];

  return (
    <div className="flex flex-col gap-0">
      {/* Tabs */}
      <nav
        className="flex shrink-0 border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30 rounded-t-lg"
        aria-label="Session activity tabs"
      >
        <div className="flex gap-0 overflow-x-auto px-2" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="mt-4 space-y-5">
      {activeTab === 'session' && (
        <>
      {/* Session context with optional Live badge */}
      <section className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/30">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {childrenSummary}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {formatDateLabel(session.date)} · {formatTime(session.startTime)} –{' '}
              {formatTime(session.endTime)}
            </p>
            {session.trainerName && (
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                Trainer: {session.trainerName}
              </p>
            )}
          </div>
          {inProgress && (
            <span
              className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
              aria-label="Session in progress"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
              Live
            </span>
          )}
        </div>
        {onViewFullBooking && bookingId && (
          <button
            type="button"
            onClick={() => onViewFullBooking(sessionId, bookingId)}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
          >
            View full booking
            <ExternalLink className="h-4 w-4" />
          </button>
        )}
      </section>

      {/* Timeline: trainer clock-in → session activities (start–end) → location → clock-out → link to Activity logs */}
      <section
        className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/30"
        aria-label="Session activity timeline"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Timeline
        </h3>
        <p className="mt-0.5 text-2xs text-slate-500 dark:text-slate-400">
          From trainer clock-in to clock-out
        </p>
        <ul className="mt-3 space-y-0">
          {/* Clock-in */}
          <li className="relative flex gap-3 pb-3">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
              aria-hidden
            >
              {session.clockedInAt ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Clock className="h-4 w-4 text-slate-400" />
              )}
            </span>
            <span className="absolute left-[11px] top-8 bottom-0 w-px bg-slate-200 dark:bg-slate-600" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {session.clockedInAt ? (
                  <>
                    <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                      {formatTimeFromIso(session.clockedInAt)}
                    </span>
                    {' · '}
                    {session.trainerName ?? 'Trainer'} clocked in
                  </>
                ) : (
                  <>
                    {session.trainerName ?? 'Trainer'} clocked in
                    <span className="ml-1.5 font-normal text-slate-400 dark:text-slate-500">—</span>
                  </>
                )}
              </p>
            </div>
          </li>

          {/* Session activities: past = completed (CircleCheck); current = in progress (Play) */}
          {(session.currentActivityUpdates ?? []).map((update, index) => {
            const updates = session.currentActivityUpdates ?? [];
            const isLastUpdate = updates.length > 0 && index === updates.length - 1;
            const isCurrentActivity = isLastUpdate && !session.clockedOutAt;
            const statusLabel = isCurrentActivity ? 'in progress' : 'logged';
            const verb = isCurrentActivity ? 'is performing' : 'completed';
            return (
              <li key={update.id} className="relative flex gap-3 pb-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${isCurrentActivity ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300'}`}
                  aria-hidden
                >
                  {isCurrentActivity ? (
                    <Play className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    <CircleCheck className="h-3.5 w-3.5" aria-hidden />
                  )}
                </span>
                <span className="absolute left-[11px] top-8 bottom-0 w-px bg-slate-200 dark:bg-slate-600" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {update.at && (
                      <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-300 mr-1.5">
                        {formatTimeFromIso(update.at)}
                      </span>
                    )}
                    {session.trainerName ?? 'Trainer'} {verb} {update.activityName}
                    {update.location ? (
                      <> at{' '}
                        <a
                          href={getGoogleMapsSearchUrl(update.location)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline dark:text-indigo-300"
                        >
                          {update.location}
                        </a>
                      </>
                    ) : null}
                    <span className="ml-1 text-slate-500 dark:text-slate-400">({statusLabel})</span>
                  </p>
                </div>
              </li>
            );
          })}

          {/* Trainer location on map (optional GPS) */}
          {session.clockedInLatitude != null && session.clockedInLongitude != null && (
            <li className="relative flex gap-3 pb-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden>
                <MapPin className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              </span>
              <span className="absolute left-[11px] top-8 bottom-0 w-px bg-slate-200 dark:bg-slate-600" aria-hidden />
              <div className="min-w-0 flex-1 pt-0.5">
                <a
                  href={getGoogleMapsUrlForCoordinates(session.clockedInLatitude, session.clockedInLongitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
                >
                  View trainer location on map
                </a>
              </div>
            </li>
          )}

          {/* Session location */}
          <li className="relative flex gap-3 pb-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden>
              <MapPin className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </span>
            <span className="absolute left-[11px] top-8 bottom-0 w-px bg-slate-200 dark:bg-slate-600" aria-hidden />
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <span className="font-medium text-slate-900 dark:text-slate-100">Current location:</span>{' '}
                {session.location ? (
                  <a
                    href={getGoogleMapsSearchUrl(session.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline dark:text-indigo-300"
                  >
                    {session.location}
                  </a>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">Not set</span>
                )}
              </p>
            </div>
          </li>

          {/* Clock-out */}
          <li className="relative flex gap-3">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
              aria-hidden
            >
              {session.clockedOutAt ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Clock className="h-4 w-4 text-slate-400" />
              )}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {session.clockedOutAt ? (
                  <>
                    <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                      {formatTimeFromIso(session.clockedOutAt)}
                    </span>
                    {' · '}
                    {session.trainerName ?? 'Trainer'} clocked out
                  </>
                ) : (
                  <>
                    {session.trainerName ?? 'Trainer'} clocked out
                    <span className="ml-1.5 font-normal text-slate-400 dark:text-slate-500">
                      {' '}{inProgress ? '—' : 'Not recorded'}
                    </span>
                  </>
                )}
              </p>
            </div>
          </li>
        </ul>

        {/* Link to Activity logs tab */}
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
          >
            <ClipboardList className="h-4 w-4 shrink-0" aria-hidden />
            View activity logs
            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </button>
          <p className="mt-0.5 text-2xs text-slate-500 dark:text-slate-400">
            Full logs with notes, achievements and challenges
          </p>
        </div>
      </section>
        </>
      )}

      {activeTab === 'logs' && (
      <>
      <section
        className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/30"
        aria-label="Activity log timeline"
      >
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <ClipboardList className="h-3.5 w-3.5" aria-hidden />
          Activity logs
        </h3>
        <p className="mt-0.5 text-2xs text-slate-500 dark:text-slate-400">
          {sortedLogs.length === 0
            ? EMPTY_STATE.NO_LOGS_YET.title
            : logsExpanded
              ? `Showing all ${sortedLogs.length} log${sortedLogs.length === 1 ? '' : 's'}`
              : `Latest ${visibleLogs.length} of ${sortedLogs.length}`}
        </p>
        {sortedLogs.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {EMPTY_STATE.NO_ACTIVITY_LOGS_YET.message}
          </p>
        ) : (
          <>
            <ul className="mt-3 space-y-0">
              {visibleLogs.map((log, idx) => {
              const isCurrent = log.id === currentLogId;
              const timeRange =
                log.startTime || log.endTime
                  ? `${log.startTime ?? '—'} – ${log.endTime ?? '—'}${log.durationMinutes != null ? ` · ${Number(log.durationMinutes)} min` : ''}`
                  : null;
              return (
                <li key={log.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {idx > 0 && (
                    <span
                      className="absolute left-[11px] top-6 bottom-0 w-px bg-slate-200 dark:bg-slate-600"
                      aria-hidden
                    />
                  )}
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                      isCurrent
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300'
                    }`}
                    aria-hidden
                  >
                    {isCurrent ? (
                      <Activity className="h-3.5 w-3.5" />
                    ) : (
                      <Circle className="h-2 w-2 fill-current" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className={`rounded-lg border p-2.5 text-sm ${
                        isCurrent
                          ? 'border-indigo-200 bg-indigo-50/80 dark:border-indigo-800 dark:bg-indigo-950/40'
                          : 'border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {log.activityName}
                        </p>
                        {isCurrent && (
                          <span
                            className="inline-flex items-center rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200"
                            aria-label="Currently running"
                          >
                            Current
                          </span>
                        )}
                      </div>
                      {timeRange && (
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {timeRange}
                        </p>
                      )}
                      {log.description && (
                        <p className="mt-1 text-slate-600 dark:text-slate-300 line-clamp-3">
                          {log.description}
                        </p>
                      )}
                      {log.notes && (
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 italic">
                          {log.notes}
                        </p>
                      )}
                      {(log.achievements || log.challenges) && (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {log.achievements && (
                            <span className="inline-block max-w-full rounded bg-amber-100 px-1.5 py-0.5 text-2xs text-amber-800 line-clamp-2 dark:bg-amber-900/50 dark:text-amber-200">
                              Achievements: {log.achievements}
                            </span>
                          )}
                          {log.challenges && (
                            <span className="inline-block max-w-full rounded bg-slate-100 px-1.5 py-0.5 text-2xs text-slate-700 line-clamp-2 dark:bg-slate-700 dark:text-slate-300">
                              Challenges: {log.challenges}
                            </span>
                          )}
                        </div>
                      )}
                      {log.createdAt && (
                        <p className="mt-1.5 text-2xs text-slate-400 dark:text-slate-500">
                          Logged {formatTimeFromIso(log.createdAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
            </ul>
            {hasMoreLogs && (
              <div className="mt-3 flex justify-center border-t border-slate-200 pt-3 dark:border-slate-600">
                <button
                  type="button"
                  onClick={() => setLogsExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  aria-expanded={logsExpanded}
                >
                  {logsExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" aria-hidden />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" aria-hidden />
                      See more{hiddenCount > 0 ? ` (${hiddenCount} more)` : ''}
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>
      </>
      )}
      </div>
    </div>
  );
}

export interface SessionLatestActivityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null;
  bookingId: string | null;
  getBooking: (bookingId: string) => Promise<AdminBookingDTO>;
  /** When provided, "View full booking" opens the full session detail panel. */
  onViewFullBooking?: (sessionId: string, bookingId: string) => void;
}

export function SessionLatestActivityPanel({
  isOpen,
  onClose,
  sessionId,
  bookingId,
  getBooking,
  onViewFullBooking,
}: SessionLatestActivityPanelProps) {
  const [session, setSession] = useState<RemoteBookingSession | null>(null);
  const [childrenSummary, setChildrenSummary] = useState<string>('');
  const [activityLogs, setActivityLogs] = useState<RemoteActivityLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  const loadData = useCallback(
    (silent = false) => {
      if (!bookingId || !sessionId) return;
      cancelledRef.current = false;
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      Promise.all([
        getBooking(bookingId),
        apiClient.get<{ activityLogs: RemoteActivityLogItem[] }>(
          API_ENDPOINTS.ADMIN_BOOKING_SESSION_ACTIVITY_LOGS(sessionId)
        ),
      ])
        .then(([booking, logsResponse]) => {
          if (cancelledRef.current) return;
          const s = booking.sessions?.find((x) => x.id === sessionId) ?? null;
          setSession(s);
          setChildrenSummary(
            booking.children?.length
              ? booking.children.map((c) => c.name).join(', ')
              : '—'
          );
          const logs = logsResponse.data?.activityLogs ?? [];
          setActivityLogs(Array.isArray(logs) ? logs : []);
        })
        .catch((err) => {
          if (!cancelledRef.current && !silent) {
            setError(err instanceof Error ? err.message : 'Failed to load activity details');
          }
        })
        .finally(() => {
          if (!cancelledRef.current) setLoading(false);
        });
    },
    [bookingId, sessionId, getBooking]
  );

  useEffect(() => {
    if (!isOpen || !bookingId || !sessionId) {
      setSession(null);
      setChildrenSummary('');
      setActivityLogs([]);
      setError(null);
      cancelledRef.current = true;
      return;
    }
    cancelledRef.current = false;
    loadData(false);
    return () => {
      cancelledRef.current = true;
    };
  }, [isOpen, bookingId, sessionId, loadData]);

  useLiveRefresh('bookings', () => loadData(true), {
    enabled: LIVE_REFRESH_ENABLED && isOpen && !!bookingId && !!sessionId,
  });
  useLiveRefresh('trainer_schedules', () => loadData(true), {
    enabled: LIVE_REFRESH_ENABLED && isOpen && !!bookingId && !!sessionId,
  });

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[999] bg-slate-900/30 transition-opacity duration-300 ease-out"
        aria-hidden
        onClick={handleClose}
      />
      <aside
        className="fixed right-0 top-0 z-[1000] flex h-full w-full flex-col bg-white shadow-xl dark:bg-slate-900 sm:w-[420px] md:max-w-[32%]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="latest-activity-title"
        style={{ animation: 'sessionPanelSlideIn 0.3s ease-out' }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: '@keyframes sessionPanelSlideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}',
          }}
        />

        <div className="flex h-full flex-col overflow-hidden">
          <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <h2
              id="latest-activity-title"
              className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
              Session activity
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              aria-label="Close panel"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4">
            {loading && (
              <div className="space-y-2 animate-pulse" aria-busy="true" aria-label="Loading activity details">
                <div className="h-4 w-[80%] bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-[80%] bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                {error}
              </div>
            )}
            {!loading && !error && session && sessionId != null && bookingId != null && (
              <SessionActivityContent
                session={session}
                sessionId={sessionId}
                bookingId={bookingId}
                childrenSummary={childrenSummary}
                activityLogs={activityLogs}
                onViewFullBooking={onViewFullBooking}
              />
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
