'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, User, Edit2, Trash2, Loader2, Activity as ActivityIcon, Hourglass, ListTodo, MapPin, FileText } from 'lucide-react';
import moment from 'moment';
import { BaseModal } from '@/components/ui/Modal';
import { SideCanvas } from '@/components/ui/SideCanvas';
import { detectActivitySelection, parseCustomActivityFromNotes } from '@/utils/activitySelectionUtils';
import { toastManager } from '@/utils/toast';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { useLiveRefresh } from '@/core/liveRefresh/LiveRefreshContext';
import { getGoogleMapsSearchUrl } from '@/utils/locationUtils';
import { LIVE_REFRESH_ENABLED } from '@/utils/liveRefreshConstants';
import ActivityLogTimeline from '@/components/trainer/activities/ActivityLogTimeline';
import type { ActivityLog } from '@/core/application/trainer/types';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';
import { ROUTES } from '@/utils/routes';

interface SessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    childName: string;
    childId: number;
    activities: string[];
    trainerName?: string;
    trainerAssignmentStatus?: string | null;
    trainerPreferenceLabel?: string;
    requiresAdminApproval?: boolean;
    bookingId: number;
    scheduleId: string;
    isPast?: boolean;
    isOngoing?: boolean;
    isUpcoming?: boolean;
    itineraryNotes?: string;
  } | null;
  onEdit: (session: NonNullable<SessionDetailModalProps['session']>) => void;
  onCancel: (sessionId: string) => Promise<void>;
  /** Total number of sessions this child has on the same day (including this one). Used to avoid confusion when there are multiple sessions. */
  otherSessionsOnDayCount?: number;
  /**
   * Optional: full list of sessions on the same calendar day (including this one),
   * for the same child. When provided, the modal shows a clear, ordered list of
   * that child's sessions on that date.
   */
  sessionsOnSameDay?: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    childName: string;
    childId: number;
  }>;
  /** Render as a slide-in side panel instead of a modal. Default: 'modal'. */
  variant?: 'modal' | 'sidepanel';
}

/**
 * Session Detail Modal Component
 * 
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Compact session details modal with Edit/Cancel actions (Google Calendar-style)
 * Location: frontend/src/components/dashboard/modals/SessionDetailModal.tsx
 * 
 * Features:
 * - Modal width: md (matches ->modalWidth('md') requirement)
 * - Shows basic session info
 * - [Edit] button - opens booking modal with existing values
 * - [Cancel Session] button - cancels session with confirmation
 * - [Close] button
 * - Stays on dashboard after actions (no navigation)
 */
export default function SessionDetailModal({
  isOpen,
  onClose,
  session,
  onEdit,
  onCancel,
  otherSessionsOnDayCount,
  sessionsOnSameDay,
  variant = 'modal',
}: SessionDetailModalProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  type SessionTab = 'overview' | 'activity_log' | 'session_activity' | 'trainer_notes';
  const [activeTab, setActiveTab] = useState<SessionTab>('overview');
  const [sessionDetail, setSessionDetail] = useState<{
    activityLogs: ActivityLog[];
    schedule: { currentActivityName?: string | null; location?: string | null; currentActivityUpdates?: Array<{ id: number; activityName: string; location: string | null; at: string }> };
    timeEntries: Array<{ id: number; type: string; recordedAt?: string; createdAt?: string }>;
    notes: Array<{ id: number; note: string; type: string; createdAt?: string }>;
  } | null>(null);
  const [sessionDetailLoading, setSessionDetailLoading] = useState(false);

  const loadSessionDetail = useCallback(
    (silent = false) => {
      if (!session?.scheduleId) return;
      if (!silent) setSessionDetailLoading(true);
      apiClient
        .get<{
          activityLogs: ActivityLog[];
          schedule: { currentActivityName?: string | null; location?: string | null; currentActivityUpdates?: Array<{ id: number; activityName: string; location: string | null; at: string }> };
          timeEntries: Array<{ id: number; type: string; recordedAt?: string; createdAt?: string }>;
          notes?: Array<{ id: number; note: string; type: string; createdAt?: string }>;
        }>(API_ENDPOINTS.DASHBOARD_SCHEDULE_DETAIL(session.scheduleId))
        .then((res) => {
          const data = res.data;
          if (data) setSessionDetail({
            activityLogs: data.activityLogs ?? [],
            schedule: data.schedule ?? { currentActivityUpdates: [] },
            timeEntries: data.timeEntries ?? [],
            notes: data.notes ?? [],
          });
        })
        .catch(() => setSessionDetail(null))
        .finally(() => setSessionDetailLoading(false));
    },
    [session?.scheduleId]
  );

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('overview');
      setSessionDetail(null);
      return;
    }
    if (!session?.scheduleId) return;
    loadSessionDetail(false);
  }, [isOpen, session?.scheduleId, loadSessionDetail]);

  useLiveRefresh('bookings', () => loadSessionDetail(true), {
    enabled: LIVE_REFRESH_ENABLED && isOpen && !!session?.scheduleId,
  });
  useLiveRefresh('trainer_schedules', () => loadSessionDetail(true), {
    enabled: LIVE_REFRESH_ENABLED && isOpen && !!session?.scheduleId,
  });

  // All hooks must be called before any conditional returns
  const activitySelection = useMemo(() => {
    if (!session) {
      return { type: 'trainer_choice' as const, activities: [], customFromNotes: undefined };
    }
    const detected = detectActivitySelection(session.activities, session.itineraryNotes);
    const customFromNotes = parseCustomActivityFromNotes(session.itineraryNotes);
    return { ...detected, customFromNotes };
  }, [session?.activities, session?.itineraryNotes]);

  // When we know all sessions on this day, build an ordered list for the header summary.
  const sameDaySessions = useMemo(() => {
    if (!session || !sessionsOnSameDay || sessionsOnSameDay.length === 0) {
      return [] as Array<{
        id: string;
        date: string;
        startTime: string;
        endTime: string;
        childName: string;
        childId: number;
      }>;
    }

    // Only keep sessions that share the same normalised date AND the same child
    const targetDate = session.date;
    const targetChildId = session.childId;
    const filtered = sessionsOnSameDay.filter(
      (s) => s.date === targetDate && s.childId === targetChildId,
    );

    // Sort by start time for a clear, chronological list
    return filtered.sort((a, b) =>
      moment(a.startTime, 'HH:mm').diff(moment(b.startTime, 'HH:mm')),
    );
  }, [session, sessionsOnSameDay]);

  // Early return AFTER all hooks have been called
  if (!isOpen || !session) return null;

  // Calculate temporal state for 24-hour cancellation policy
  const now = moment();
  const startDateTime = moment(`${session.date} ${session.startTime}`, 'YYYY-MM-DD HH:mm');
  const endDateTime = moment(`${session.date} ${session.endTime}`, 'YYYY-MM-DD HH:mm');
  const hasEnded = now.isSameOrAfter(endDateTime);
  const hasStarted = now.isSameOrAfter(startDateTime) && now.isBefore(endDateTime);
  const hoursUntilStart = startDateTime.diff(now, 'hours', true);

  type LockState = 'CAN_CANCEL' | 'LOCKED_24H' | 'IN_PROGRESS' | 'PAST';
  let lockState: LockState = 'CAN_CANCEL';
  let cancelReason: string | null = null;

  if (hasEnded) {
    lockState = 'PAST';
    cancelReason = 'This session has already completed and cannot be cancelled.';
  } else if (hasStarted) {
    lockState = 'IN_PROGRESS';
    cancelReason = 'This session is currently in progress and cannot be cancelled.';
  } else if (hoursUntilStart < 24) {
    lockState = 'LOCKED_24H';
    cancelReason = 'Cancellation requires 24 hours’ notice.';
  }

  const canEdit = lockState === 'CAN_CANCEL';
  const canCancel = lockState === 'CAN_CANCEL';

  // Clear status labels: Past | Today | Live | Upcoming (with distinct colours)
  const isSessionToday = startDateTime.isSame(now, 'day');
  const statusBadge = (() => {
    if (hasEnded) {
      return { label: 'Past', className: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600' };
    }
    if (hasStarted) {
      return { label: 'Live', className: 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700' };
    }
    if (isSessionToday) {
      return { label: 'Today', className: 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700' };
    }
    return { label: 'Upcoming', className: 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-700' };
  })();

  const handleCancel = async () => {
    const friendlyDate = moment(session.date).format('dddd, MMMM D, YYYY');
    const friendlyTime = moment(session.startTime, 'HH:mm').format('h:mm A');

    if (!canCancel) {
      if (cancelReason) {
        toastManager.warning(cancelReason);
      }
      return;
    }

    if (!confirm(
      `Are you sure you want to cancel this session for ${session.childName} on ${friendlyDate} at ${friendlyTime}? This action cannot be undone and is only allowed more than 24 hours before the start time.`
    )) {
      return;
    }

    setIsCancelling(true);
    try {
      await onCancel(session.scheduleId);
      onClose();
    } catch (error: unknown) {
      console.error('Failed to cancel session:', error);
      toastManager.error(error instanceof Error ? error.message : 'Failed to cancel session. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleEdit = () => {
    onEdit(session);
    onClose();
  };

  // Calculate human-friendly time range and duration once so we can re-use it in the header.
  const { timeDisplay, hoursLabel } = (() => {
    const startDateTime = moment(`${session.date} ${session.startTime}`, 'YYYY-MM-DD HH:mm');
    const endSameDay = moment(`${session.date} ${session.endTime}`, 'YYYY-MM-DD HH:mm');
    let durationHours: number;
    let display: React.ReactNode;

    if (endSameDay.isBefore(startDateTime) || endSameDay.isSame(startDateTime)) {
      const endNextDay = endSameDay.clone().add(1, 'day');
      durationHours = endNextDay.diff(startDateTime, 'hours', true);
      const actualEndDateTime =
        durationHours <= 0 ? startDateTime.clone().add(24, 'hours') : endNextDay;
      const isNextDay = !actualEndDateTime.isSame(startDateTime, 'day');
      display = (
        <>
          {startDateTime.format('h:mm A')} – {actualEndDateTime.format('h:mm A')}
          {isNextDay && <span className="text-blue-600 font-medium"> (next day)</span>}
        </>
      );
      if (durationHours <= 0) durationHours = 24;
    } else {
      durationHours = endSameDay.diff(startDateTime, 'hours', true);
      const isNextDay = !endSameDay.isSame(startDateTime, 'day');
      display = (
        <>
          {startDateTime.format('h:mm A')} – {endSameDay.format('h:mm A')}
          {isNextDay && <span className="text-blue-600 font-medium"> (next day)</span>}
        </>
      );
    }

    const label =
      durationHours === 1 ? '1 hour' : `${Math.round(durationHours * 10) / 10} hours`;

    return { timeDisplay: display, hoursLabel: label };
  })();

  const sessionFooter = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
      <button
        type="button"
        onClick={onClose}
        disabled={isCancelling}
        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Close
      </button>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleEdit}
          disabled={isCancelling || !canEdit}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition-all shadow-sm hover:shadow"
        >
          <Edit2 size={16} />
          Edit
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isCancelling || !canCancel}
          title={!canCancel && cancelReason ? cancelReason : undefined}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-sm hover:shadow"
        >
          {isCancelling ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Cancelling...
            </>
          ) : (
            <>
              <Trash2 size={16} />
              Cancel Session
            </>
          )}
        </button>
      </div>
    </div>
  );

  const sessionContent = (
    <div className="space-y-4">
        {/* Card 1: Session overview (status, child, trainer, time, rules) */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}
              >
                {statusBadge.label}
              </span>
              <div className="flex items-center gap-1">
                <User size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-900">
                  {session.childName}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar size={16} className="text-gray-500" />
              <span>{moment(session.date).format('dddd, MMMM D, YYYY')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock size={16} className="text-gray-500" />
              <span>
                {timeDisplay}
                <span className="ml-1 text-gray-500">· {hoursLabel} booked</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <User size={16} className="text-gray-500" />
              <div className="min-w-0">
                <div className="text-sm text-gray-700">
                  {session.trainerName
                    ? (session.trainerAssignmentStatus === 'trainer_confirmed'
                        ? session.trainerName
                        : `${session.trainerName} available – wait for his confirmation`)
                    : 'Trainer to be confirmed'}
                </div>
                {session.trainerPreferenceLabel && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    Trainer preference: {session.trainerPreferenceLabel}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sessions today – explicit list when multiple sessions exist on this date */}
          {sameDaySessions.length > 1 && (
            <div className="pt-3 mt-1 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                Sessions today
              </p>
              <ul className="space-y-1">
                {sameDaySessions.map((daySession) => {
                  const isCurrent = daySession.id === session.id;
                  const startLabel = moment(daySession.startTime, 'HH:mm').format(
                    'h:mm A',
                  );
                  const endLabel = moment(daySession.endTime, 'HH:mm').format(
                    'h:mm A',
                  );
                  return (
                    <li
                      key={daySession.id}
                      className={`rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] ${
                        isCurrent ? 'border-blue-300 bg-blue-50' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-800 truncate">
                        {daySession.childName}
                      </div>
                      <div className="mt-0.5 text-gray-600">
                        {startLabel} – {endLabel}
                        {isCurrent && (
                          <span className="ml-1 text-[10px] font-semibold text-blue-700">
                            (this session)
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {sameDaySessions.length === 0 &&
            otherSessionsOnDayCount &&
            otherSessionsOnDayCount > 1 && (
              <div className="pt-3 mt-1 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-700">
                  {otherSessionsOnDayCount} sessions today
                </p>
              </div>
            )}

          {/* Status / cancellation rules */}
          {!session.trainerName && (
            <div className="flex items-center gap-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
              <Hourglass size={20} className="text-amber-600 flex-shrink-0" aria-hidden />
              <div>
                <p className="text-sm font-medium text-amber-900">
                  Waiting for trainer approval
                </p>
                <p className="text-xs text-amber-800 mt-0.5">
                  A trainer will be assigned for this session. You’ll be notified once
                  confirmed.
                </p>
              </div>
            </div>
          )}
          {lockState === 'PAST' && (
            <div className="rounded-lg bg-gray-100 border border-gray-200 p-2">
              <p className="text-xs text-gray-700">
                This session has already completed and cannot be edited or cancelled.
              </p>
            </div>
          )}
          {lockState === 'IN_PROGRESS' && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-2">
              <p className="text-xs text-red-800 font-medium">
                Session in progress. This session can no longer be edited or cancelled.
              </p>
            </div>
          )}
          {lockState === 'LOCKED_24H' && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 p-2">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Cannot cancel: this session starts within 24 hours. Sessions must be
                cancelled at least 24 hours before the start time.
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-200 mt-1.5">
                For exceptional circumstances, please{' '}
                <a
                  href={ROUTES.CONTACT}
                  className="font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
                >
                  contact us
                </a>
                .
              </p>
            </div>
          )}
        </div>

        {/* Tabs: one line, no scroll */}
        <nav className="border-b border-gray-200 dark:border-gray-600 -mx-1 px-1" aria-label="Session tabs">
          <div className="grid grid-cols-4">
            {[
              { id: 'overview' as SessionTab, label: 'Overview', icon: Calendar },
              { id: 'activity_log' as SessionTab, label: 'Activity logs', icon: ListTodo },
              { id: 'session_activity' as SessionTab, label: 'Session activity', icon: ActivityIcon },
              { id: 'trainer_notes' as SessionTab, label: 'Trainer notes', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  className={`
                    min-w-0 py-2.5 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 transition-colors truncate
                    ${activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <Icon size={14} className="shrink-0 sm:w-4 sm:h-4" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="min-h-[120px]">
          {activeTab === 'overview' && (
            <>
        {/* Card 2: Activities only */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <ActivityIcon size={14} className="text-gray-500" />
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Activities
            </p>
          </div>

          {activitySelection.type === 'standard' && activitySelection.activities.length > 0 ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {activitySelection.activities.map((activity, index) => (
                  <span
                    key={`${activity}-${index}`}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    {activity}
                  </span>
                ))}
              </div>
              {activitySelection.customFromNotes && (
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                  {activitySelection.customFromNotes}
                </span>
              )}
            </div>
          ) : activitySelection.type === 'custom' ? (
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                {activitySelection.customActivityDescription}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-blue-800 text-sm font-semibold">Trainer’s Choice</span>
              <span className="text-blue-700 text-xs">
                The trainer will choose activities for this session.
              </span>
            </div>
          )}
        </div>
            </>
          )}

          {activeTab === 'activity_log' && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30 p-4">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                Session history from your trainer (newest → oldest).
              </p>
              {sessionDetailLoading ? (
                <div className="space-y-2 animate-pulse" aria-busy="true" aria-label="Loading activity logs">
                  <div className="h-3 w-[85%] bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-[70%] bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-[60%] bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ) : sessionDetail?.activityLogs && sessionDetail.activityLogs.length > 0 ? (
                <ActivityLogTimeline
                  logs={sessionDetail.activityLogs}
                  className="max-h-52 overflow-y-auto"
                />
              ) : (
                <p className="text-2xs text-gray-500 py-2">{EMPTY_STATE.NO_ACTIVITY_LOGS_YET.message}</p>
              )}
            </div>
          )}

          {activeTab === 'session_activity' && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30 p-4">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                {hasEnded
                  ? 'What the trainer recorded during the session (activities and location).'
                  : 'What the trainer is doing right now (live during the session).'}
              </p>
              {sessionDetailLoading ? (
                <div className="animate-pulse space-y-2" aria-busy="true" aria-label="Loading session activity">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ) : (
                <div className="space-y-2">
                  {sessionDetail?.schedule?.currentActivityName || sessionDetail?.schedule?.location ? (
                    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${
                      hasEnded
                        ? 'border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-800/50'
                        : 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
                    }`}>
                      {!hasEnded && (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-700 dark:bg-emerald-300">Live</span>
                      )}
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        <span className="font-medium">
                          {hasEnded ? 'Last activity: ' : 'Currently doing '}
                          {sessionDetail?.schedule?.currentActivityName ?? '—'}
                        </span>
                        {sessionDetail?.schedule?.location && (
                          <span className="text-gray-600 dark:text-gray-400">
                            {' at '}
                            <a
                              href={getGoogleMapsSearchUrl(sessionDetail.schedule.location)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline dark:text-indigo-300"
                            >
                              {sessionDetail.schedule.location}
                            </a>
                          </span>
                        )}
                      </p>
                    </div>
                  ) : null}
                  {(() => {
                    const updates = sessionDetail?.schedule?.currentActivityUpdates ?? [];
                    // When session is live, exclude the current (first = newest) from History so it only appears under Live
                    const historyUpdates = hasEnded ? updates : (updates.length > 1 ? updates.slice(1) : []);
                    if (historyUpdates.length === 0) return null;
                    return (
                      <div className="mt-2">
                        <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                          {hasEnded ? 'Session activity (chronological)' : 'History'}
                        </p>
                        <ul className="space-y-1.5">
                          {historyUpdates.map((u) => (
                            <li key={u.id} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                              <MapPin size={12} className="text-gray-400 shrink-0" />
                              {u.activityName}
                              {u.location ? (
                                <>
                                  {' at '}
                                  <a
                                    href={getGoogleMapsSearchUrl(u.location)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:underline dark:text-indigo-300"
                                  >
                                    {u.location}
                                  </a>
                                </>
                              ) : null}
                              <span className="text-gray-400">{u.at ? moment(u.at).format('h:mm A') : ''}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}
                  {!sessionDetail?.schedule?.currentActivityName && !sessionDetail?.schedule?.location && (!sessionDetail?.schedule?.currentActivityUpdates?.length) && !sessionDetailLoading && (
                    <p className="text-2xs text-gray-500 py-2">
                      {hasEnded ? EMPTY_STATE.NO_ACTIVITY_RECORDED.message : EMPTY_STATE.NO_LIVE_UPDATES_YET.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'trainer_notes' && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30 p-4">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                Summary notes from the trainer for this session (non-private only).
              </p>
              {sessionDetailLoading ? (
                <div className="space-y-2 animate-pulse" aria-busy="true" aria-label="Loading trainer notes">
                  <div className="h-3 w-[90%] bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-[70%] bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ) : sessionDetail?.notes && sessionDetail.notes.length > 0 ? (
                <ul className="space-y-3">
                  {sessionDetail.notes.map((n) => (
                    <li key={n.id} className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-3">
                      <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{n.note}</p>
                      {n.createdAt && (
                        <p className="text-2xs text-gray-500 dark:text-gray-400 mt-1.5">{moment(n.createdAt).format('DD MMM YYYY, h:mm A')}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-2xs text-gray-500 py-2">{EMPTY_STATE.NO_TRAINER_NOTES_YET.message}</p>
              )}
            </div>
          )}
        </div>
      </div>
  );

  return variant === 'sidepanel' ? (
    <SideCanvas
      isOpen={isOpen}
      onClose={onClose}
      title="Session Details"
      footer={sessionFooter}
      widthClassName="sm:max-w-md"
    >
      {sessionContent}
    </SideCanvas>
  ) : (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Session Details"
      size="md"
      footer={sessionFooter}
    >
      {sessionContent}
    </BaseModal>
  );
}
