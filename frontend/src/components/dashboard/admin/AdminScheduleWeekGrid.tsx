'use client';

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  UserPlus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  CalendarCheck,
  LayoutGrid,
  CalendarDays,
  List,
  Clock,
  RefreshCw,
  Activity,
} from 'lucide-react';
import {
  getMonday,
  getWeekEnd,
  getMonthStart,
  getMonthEnd,
  getDaysInMonth,
  getMonthKey,
  formatDateLabel,
  formatDayLabel,
  formatWeekRangeWithMonth,
  formatMonthLabel,
  getMonthCalendarGrid,
  getRangeFromPeriodAnchor,
} from '@/utils/calendarRangeUtils';
import type { CalendarPeriod } from '@/utils/calendarRangeUtils';
import { CalendarRangeToolbar } from '@/components/ui/CalendarRange';
import { useAdminBookings } from '@/interfaces/web/hooks/admin/useAdminBookings';
import { useAdminTrainers } from '@/interfaces/web/hooks/admin/useAdminTrainers';
import { useLiveRefresh, useLiveRefreshContext } from '@/core/liveRefresh/LiveRefreshContext';
import { LIVE_REFRESH_ENABLED } from '@/utils/liveRefreshConstants';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import type { AdminBookingDTO } from '@/core/application/admin/dto/AdminBookingDTO';

/** View mode for schedule tab. */
export type ScheduleViewMode = 'by_trainer' | 'by_day' | 'list';

/** Period filter: 1 day, 1 week, or 1 month. */
export type SchedulePeriod = CalendarPeriod;

/** Session time state for the viewed day: past, running now, or upcoming. */
function getSessionTimeState(
  dateStr: string,
  startTime: string,
  endTime: string
): 'past' | 'running' | 'upcoming' {
  const today = new Date();
  const viewDate = new Date(dateStr + 'T12:00:00');
  const viewDateOnly = dateStr;
  const todayOnly = today.toISOString().slice(0, 10);
  if (viewDateOnly < todayOnly) return 'past';
  if (viewDateOnly > todayOnly) return 'upcoming';
  const [sh, sm] = formatTimeTo24h(startTime).split(':').map((x) => parseInt(x, 10) || 0);
  const [eh, em] = formatTimeTo24h(endTime).split(':').map((x) => parseInt(x, 10) || 0);
  const startMs = sh * 60 * 60 * 1000 + sm * 60 * 1000;
  const endMs = eh * 60 * 60 * 1000 + em * 60 * 1000;
  const now = today;
  const nowMs = now.getHours() * 60 * 60 * 1000 + now.getMinutes() * 60 * 1000 + now.getSeconds() * 1000;
  if (nowMs < startMs) return 'upcoming';
  if (nowMs >= endMs) return 'past';
  return 'running';
}

/** Format time as 24-hour HH:mm (e.g. 14:30). Accepts "HH:mm", "HH:mm:ss", or "H:mm". */
function formatTimeTo24h(t: string): string {
  if (!t || typeof t !== 'string') return '00:00';
  const trimmed = t.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = match[2];
    const pm = (match[3] || '').toUpperCase() === 'PM';
    const am = (match[3] || '').toUpperCase() === 'AM';
    if (pm && h < 12) h += 12;
    if (am && h === 12) h = 0;
    if (!am && !pm && h >= 24) h = 0;
    return `${h.toString().padStart(2, '0')}:${m}`;
  }
  if (trimmed.length >= 5) return trimmed.slice(0, 5);
  return trimmed;
}

/** Format time as HH:mm (24-hour). */
function formatTime(t: string): string {
  return formatTimeTo24h(t);
}

/** Time string to decimal hours (e.g. "14:30" -> 14.5) for grid positioning. */
function timeToHours(t: string): number {
  const [h, m] = formatTimeTo24h(t).split(':').map((x) => parseInt(x, 10) || 0);
  return h + m / 60;
}

const ADD_TRAINER_ROW_ID = '__add_trainer__';

/** Max session cards shown per cell before "Show N more" portal. */
const MAX_SESSIONS_PER_CELL = 5;

/** Display status for calendar cells: combines time state (past/current/future) with session status and completion. */
export type SessionDisplayStatus =
  | 'completed'   // ✅ Green – past, completed
  | 'issues'      // ⚠️ Yellow – past, rescheduled etc.
  | 'cancelled'   // ❌ Gray – cancelled
  | 'no_show'    // 🔴 Red – no-show
  | 'incomplete' // ⏱️ Orange – past but no completion (missing check-out/report)
  | 'in_progress' // 🟢 In progress – trainer clocked in, session live
  | 'awaiting_clock_in' // ⏳ Time window now but trainer not yet clocked in
  | 'scheduled'   // 📅 Scheduled OK – future
  | 'needs_attention' // ⚠️ Future needs attention
  | 'unassigned'; // ❓ Unassigned – future

export function getSessionDisplayStatus(
  dateStr: string,
  session: ScheduleGridSession
): SessionDisplayStatus {
  const timeState = getSessionTimeState(dateStr, session.startTime, session.endTime);
  const status = (session.status ?? 'scheduled').toLowerCase();
  const unassigned = !session.trainerId;

  if (timeState === 'running') {
    if (unassigned) return 'unassigned';
    if (session.clockedInAt && !session.clockedOutAt) return 'in_progress';
    if (!session.clockedInAt) return 'awaiting_clock_in';
    return 'completed';
  }
  if (timeState === 'upcoming') {
    if (unassigned) return 'unassigned';
    if (status === 'cancelled') return 'cancelled';
    return 'scheduled';
  }
  // Past
  if (status === 'completed') return 'completed';
  if (status === 'cancelled') return 'cancelled';
  if (status === 'no_show') return 'no_show';
  if (status === 'rescheduled') return 'issues';
  const hasCompleted = !!(session.completedAt || session.clockedOutAt);
  if (!hasCompleted && status === 'scheduled') return 'incomplete';
  return status === 'scheduled' ? 'completed' : 'issues';
}

/** Cell styles + icon config per display status (color-coded, easy to scan). */
export const SESSION_DISPLAY_STYLES: Record<
  SessionDisplayStatus,
  { label: string; cellClass: string; badgeClass: string; iconClass: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  completed: {
    label: 'Completed',
    cellClass: 'border-emerald-300 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/40',
    badgeClass: 'bg-emerald-500 text-white dark:bg-emerald-600',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  issues: {
    label: 'Issues',
    cellClass: 'border-amber-300 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/40',
    badgeClass: 'bg-amber-500 text-white dark:bg-amber-600',
    iconClass: 'text-amber-600 dark:text-amber-400',
    Icon: AlertCircle,
  },
  cancelled: {
    label: 'Cancelled',
    cellClass: 'border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-800/60 opacity-90',
    badgeClass: 'bg-slate-400 text-white dark:bg-slate-500',
    iconClass: 'text-slate-500 dark:text-slate-400',
    Icon: XCircle,
  },
  no_show: {
    label: 'No-show',
    cellClass: 'border-rose-300 bg-rose-50 dark:border-rose-600 dark:bg-rose-950/40',
    badgeClass: 'bg-rose-500 text-white dark:bg-rose-600',
    iconClass: 'text-rose-600 dark:text-rose-400',
    Icon: AlertTriangle,
  },
  incomplete: {
    label: 'Incomplete',
    cellClass: 'border-orange-300 bg-orange-50 dark:border-orange-600 dark:bg-orange-950/40',
    badgeClass: 'bg-orange-500 text-white dark:bg-orange-600',
    iconClass: 'text-orange-600 dark:text-orange-400',
    Icon: Clock,
  },
  in_progress: {
    label: 'In progress',
    cellClass: 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/50 ring-1 ring-emerald-400/50',
    badgeClass: 'bg-emerald-500 text-white dark:bg-emerald-600',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  scheduled: {
    label: 'Scheduled',
    cellClass: 'border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800/80',
    badgeClass: 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-200',
    iconClass: 'text-slate-500 dark:text-slate-400',
    Icon: CalendarCheck,
  },
  needs_attention: {
    label: 'Needs attention',
    cellClass: 'border-amber-200 bg-amber-50/80 dark:border-amber-700 dark:bg-amber-950/30',
    badgeClass: 'bg-amber-500 text-white dark:bg-amber-600',
    iconClass: 'text-amber-600 dark:text-amber-400',
    Icon: AlertCircle,
  },
  unassigned: {
    label: 'Unassigned',
    cellClass: 'border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/50',
    badgeClass: 'bg-slate-400 text-white dark:bg-slate-500',
    iconClass: 'text-slate-500 dark:text-slate-400',
    Icon: HelpCircle,
  },
  awaiting_clock_in: {
    label: 'Awaiting clock-in',
    cellClass: 'border-amber-300 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/40',
    badgeClass: 'bg-amber-500 text-white dark:bg-amber-600',
    iconClass: 'text-amber-600 dark:text-amber-400',
    Icon: Clock,
  },
};

/** Status icon + optional badge for a session (uses display status for color-coding). */
function SessionStatusBadge({
  session,
  dateStr,
  showLabel = true,
}: {
  session: ScheduleGridSession;
  dateStr: string;
  showLabel?: boolean;
}) {
  const displayStatus = getSessionDisplayStatus(dateStr, session);
  const config = SESSION_DISPLAY_STYLES[displayStatus];
  const Icon = config.Icon;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-semibold uppercase ${config.badgeClass}`}
      title={config.label}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

/** Icon-only for compact cells (color by display status). */
function SessionStatusIcon({ session, dateStr }: { session: ScheduleGridSession; dateStr: string }) {
  const displayStatus = getSessionDisplayStatus(dateStr, session);
  const config = SESSION_DISPLAY_STYLES[displayStatus];
  const Icon = config.Icon;
  return (
    <span className={`inline-flex items-center gap-0.5 ${config.iconClass}`} title={config.label}>
      <Icon className="h-4 w-4" aria-hidden />
    </span>
  );
}

/** When trainer_confirmed, drag-and-drop is disabled (trainer has committed to the session). */
export const TRAINER_ASSIGNMENT_CONFIRMED = 'trainer_confirmed';

export interface ScheduleGridSession {
  sessionId: string;
  bookingId: string;
  reference: string;
  date: string;
  startTime: string;
  endTime: string;
  trainerId: string | null;
  trainerName: string | null;
  status: string;
  /** If trainer_confirmed, session is not draggable (no reassign/unassign). */
  trainerAssignmentStatus?: string | null;
  parentName: string;
  childrenSummary: string;
  packageName: string | null;
  clockedInAt?: string | null;
  clockedOutAt?: string | null;
  completedAt?: string | null;
}

function flattenSessionsFromBookings(bookings: AdminBookingDTO[]): ScheduleGridSession[] {
  const out: ScheduleGridSession[] = [];
  for (const b of bookings) {
    const childrenSummary =
      b.children?.length
        ? b.children.map((c) => c.name).join(', ')
        : 'No children';
    for (const s of b.sessions ?? []) {
      if (!s.date || !s.startTime || !s.endTime) continue;
      out.push({
        sessionId: s.id,
        bookingId: b.id,
        reference: b.reference,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        trainerId: s.trainerId ?? null,
        trainerName: s.trainerName ?? null,
        status: s.status ?? 'scheduled',
        trainerAssignmentStatus: s.trainerAssignmentStatus ?? null,
        parentName: b.parentName,
        childrenSummary,
        packageName: b.packageName ?? null,
        clockedInAt: s.clockedInAt ?? null,
        clockedOutAt: s.clockedOutAt ?? null,
        completedAt: s.completedAt ?? null,
      });
    }
  }
  return out;
}

export interface ViewSessionOptions {
  /** When true, side panel scrolls to Timeline (clock-in, current activity, logs). */
  focusOnActivity?: boolean;
}

interface AdminScheduleWeekGridProps {
  onRefetchStats?: () => void | Promise<unknown>;
  /** When provided, "View booking" opens the session detail side panel instead of navigating. */
  onViewSession?: (sessionId: string, bookingId: string, options?: ViewSessionOptions) => void;
}

export function AdminScheduleWeekGrid({ onRefetchStats, onViewSession }: AdminScheduleWeekGridProps) {
  const router = useRouter();
  const today = new Date();
  const [period, setPeriod] = useState<SchedulePeriod>('1_week');
  const [anchor, setAnchor] = useState<string>(() => getMonday(today));
  const [viewMode, setViewMode] = useState<ScheduleViewMode>('by_trainer');

  /** When a cell has more than MAX_SESSIONS_PER_CELL, "Show N more" opens this portal. */
  const [overflowState, setOverflowState] = useState<{
    key: string;
    rowName: string;
    dateStr: string;
    sessions: ScheduleGridSession[];
  } | null>(null);

  /** Session card actions popover (chevron on by-trainer grid cards): anchor and session for View booking / activity. */
  const [sessionCardPopover, setSessionCardPopover] = useState<{
    sessionId: string;
    bookingId: string;
    displayStatus: SessionDisplayStatus;
    anchorRect: { top: number; left: number; width: number; height: number };
  } | null>(null);
  const sessionCardPopoverContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionCardPopover) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (sessionCardPopoverContentRef.current?.contains(target as Node)) return;
      if (target.closest?.('[data-session-card-popover-trigger]')) return;
      setSessionCardPopover(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sessionCardPopover]);

  const { dateFrom, dateTo, displayDates } = getRangeFromPeriodAnchor(period, anchor);

  const { bookings, loading, error, fetchBookings } = useAdminBookings({
    status: 'confirmed',
    session_date_from: dateFrom,
    session_date_to: dateTo,
    limit: 1000,
  });

  /** All trainers (active and inactive) so Schedule shows everyone; availability/absence still reflect active-only from their APIs */
  const { trainers } = useAdminTrainers({ limit: 100 });

  /** Trainer availability for the current range (admin sees who is free when) */
  const [trainerAvailability, setTrainerAvailability] = useState<{
    trainers: { id: string; name: string; slots: { date: string; startTime: string; endTime: string; isAvailable: boolean }[] }[];
  } | null>(null);

  /** Trainer absence (approved + pending) for the current range */
  const [trainerAbsence, setTrainerAbsence] = useState<{
    trainers: { id: string; name: string; approved_dates: string[]; pending_dates: string[] }[];
  } | null>(null);

  /** Centralized refresh: bump after assign/visibility/live-refresh so availability & absence refetch without full page reload */
  const [scheduleDataRefreshKey, setScheduleDataRefreshKey] = useState(0);

  const liveRefreshContext = useLiveRefreshContext();

  const scheduleRefetch = useCallback(() => {
    setScheduleDataRefreshKey((k) => k + 1);
    fetchBookings(
      { status: 'confirmed', session_date_from: dateFrom, session_date_to: dateTo, limit: 1000 },
      true
    );
  }, [dateFrom, dateTo, fetchBookings]);

  /** When a trainer updates availability, refetch so released sessions move to Unassigned */
  useLiveRefresh('trainer_availability', scheduleRefetch, { enabled: LIVE_REFRESH_ENABLED });

  /** When sessions change (clock-in, current activity, assign, etc.), refetch so calendar shows live session state */
  useLiveRefresh('trainer_schedules', scheduleRefetch, { enabled: LIVE_REFRESH_ENABLED });

  /** When bookings change (new, updated, cancelled, parent/trainer/admin), refetch so calendar stays in sync */
  useLiveRefresh('bookings', scheduleRefetch, { enabled: LIVE_REFRESH_ENABLED });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get<{
          trainers: { id: string; name: string; slots: { date: string; startTime: string; endTime: string; isAvailable: boolean }[] }[];
        }>(`${API_ENDPOINTS.ADMIN_TRAINERS_AVAILABILITY}?date_from=${dateFrom}&date_to=${dateTo}`, {
          timeout: 15000,
        });
        const trainers = res?.data?.trainers;
        if (!cancelled && Array.isArray(trainers)) {
          setTrainerAvailability({ trainers });
        }
      } catch {
        if (!cancelled) setTrainerAvailability(null);
      }
    })();
    return () => { cancelled = true; };
  }, [dateFrom, dateTo, scheduleDataRefreshKey]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get<{
          trainers: { id: string; name: string; approved_dates: string[]; pending_dates: string[] }[];
        }>(`${API_ENDPOINTS.ADMIN_TRAINERS_ABSENCE_DATES}?date_from=${dateFrom}&date_to=${dateTo}`, {
          timeout: 10000,
        });
        const trainers = res?.data?.trainers;
        if (!cancelled && Array.isArray(trainers)) {
          setTrainerAbsence({ trainers });
        }
      } catch {
        if (!cancelled) setTrainerAbsence(null);
      }
    })();
    return () => { cancelled = true; };
  }, [dateFrom, dateTo, scheduleDataRefreshKey]);

  useEffect(() => {
    fetchBookings(
      {
        status: 'confirmed',
        session_date_from: dateFrom,
        session_date_to: dateTo,
        limit: 1000,
      },
      false
    );
  }, [dateFrom, dateTo, fetchBookings]);

  /** Refetch when tab becomes visible so bookings + availability update without manual refresh */
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchBookings(
          { status: 'confirmed', session_date_from: dateFrom, session_date_to: dateTo, limit: 1000 },
          false
        );
        setScheduleDataRefreshKey((k) => k + 1);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [dateFrom, dateTo, fetchBookings]);

  const [assigningSessionId, setAssigningSessionId] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);

  /** Per-session list of trainers that pass conflict + availability + qualifications (for Assign dropdown) */
  const [availableTrainersBySessionId, setAvailableTrainersBySessionId] = useState<
    Record<string, { id: string; name: string }[]>
  >({});
  /** Increment to refetch available trainers for unassigned sessions (e.g. after trainer calendar updated). */
  const [availableTrainersRefreshKey, setAvailableTrainersRefreshKey] = useState(0);

  const allSessions = useMemo(
    () => flattenSessionsFromBookings(bookings),
    [bookings]
  );

  const unassignedSessionIds = useMemo(
    () =>
      allSessions
        .filter((s) => !s.trainerId)
        .map((s) => s.sessionId)
        .sort()
        .join(','),
    [allSessions]
  );

  /** Fetch available trainers for unassigned sessions (conflict + availability + qualified) */
  useEffect(() => {
    if (!unassignedSessionIds) return;
    const sessionIds = unassignedSessionIds.split(',').filter(Boolean);
    setAvailableTrainersBySessionId((prev) => {
      const next = { ...prev };
      sessionIds.forEach((id) => {
        delete next[id];
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
      setAvailableTrainersBySessionId((prev) => {
        const next = { ...prev };
        results.forEach(({ sessionId, list }) => {
          next[sessionId] = list;
        });
        return next;
      });
    });
    return () => { cancelled = true; };
  }, [unassignedSessionIds, availableTrainersRefreshKey]);

  const handleAssignTrainer = useCallback(
    async (sessionId: string, trainerId: string) => {
      if (!trainerId) return;
      setAssignError(null);
      setAssigningSessionId(sessionId);
      try {
        await apiClient.put(API_ENDPOINTS.ADMIN_BOOKING_ASSIGN_TRAINER(sessionId), {
          trainer_id: trainerId,
        });
        await fetchBookings(
          {
            status: 'confirmed',
            session_date_from: dateFrom,
            session_date_to: dateTo,
            limit: 1000,
          },
          true
        );
        setScheduleDataRefreshKey((k) => k + 1);
        onRefetchStats?.();
        liveRefreshContext?.invalidate('notifications');
        liveRefreshContext?.invalidate('bookings');
        liveRefreshContext?.invalidate('trainer_schedules');
      } catch (err) {
        setAssignError(
          err instanceof Error ? err.message : 'Failed to assign trainer'
        );
      } finally {
        setAssigningSessionId(null);
      }
    },
    [dateFrom, dateTo, fetchBookings, onRefetchStats, liveRefreshContext]
  );

  /** Unassign trainer (e.g. drag session to Unassigned row). Same endpoint with trainer_id: null. */
  const handleUnassignTrainer = useCallback(
    async (sessionId: string) => {
      setAssignError(null);
      setAssigningSessionId(sessionId);
      try {
        await apiClient.put(API_ENDPOINTS.ADMIN_BOOKING_ASSIGN_TRAINER(sessionId), {
          trainer_id: null,
        });
        await fetchBookings(
          {
            status: 'confirmed',
            session_date_from: dateFrom,
            session_date_to: dateTo,
            limit: 1000,
          },
          true
        );
        setScheduleDataRefreshKey((k) => k + 1);
        onRefetchStats?.();
        liveRefreshContext?.invalidate('bookings');
        liveRefreshContext?.invalidate('trainer_schedules');
      } catch (err) {
        setAssignError(
          err instanceof Error ? err.message : 'Failed to unassign trainer'
        );
      } finally {
        setAssigningSessionId(null);
      }
    },
    [dateFrom, dateTo, fetchBookings, onRefetchStats, liveRefreshContext]
  );

  /** Drag-and-drop: payload type and state for highlighting drop zones */
  const DRAG_TYPE = 'application/x-admin-session-assign';
  const [isDraggingSession, setIsDraggingSession] = useState(false);
  const [draggingPayload, setDraggingPayload] = useState<{
    sessionId: string;
    date: string;
    trainerId: string | null;
    startTime: string;
    endTime: string;
  } | null>(null);

  const weekDates = displayDates;

  const trainerRows = useMemo(() => {
    const unassigned = { id: '', name: 'Unassigned' };
    const rows: { id: string; name: string }[] = [unassigned];
    trainers.forEach((t) => rows.push({ id: t.id, name: t.name }));
    const sessionTrainerIds = new Set(
      allSessions
        .map((s) => s.trainerId)
        .filter((id): id is string => !!id)
    );
    const extra = Array.from(sessionTrainerIds)
      .filter((id) => !trainers.some((t) => t.id === id))
      .map((id) => {
        const s = allSessions.find((x) => x.trainerId === id);
        return { id, name: s?.trainerName ?? id };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    rows.push(...extra);
    rows.push({ id: ADD_TRAINER_ROW_ID, name: '+ Add Trainer' });
    return rows;
  }, [trainers, allSessions]);

  const sessionsByRowAndDay = useMemo(() => {
    const map = new Map<string, ScheduleGridSession[]>();
    for (const row of trainerRows) {
      if (row.id === ADD_TRAINER_ROW_ID) continue;
      for (const dateStr of weekDates) {
        map.set(`${row.id}|${dateStr}`, []);
      }
    }
    for (const s of allSessions) {
      const rowKey = s.trainerId ?? '';
      const key = `${rowKey}|${s.date}`;
      const list = map.get(key);
      if (list) list.push(s);
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          a.startTime.localeCompare(b.startTime) ||
          a.endTime.localeCompare(b.endTime)
      );
    }
    return map;
  }, [trainerRows, weekDates, allSessions]);

  const syncAvailableTrainers = useCallback(() => {
    setAvailableTrainersRefreshKey((k) => k + 1);
    setScheduleDataRefreshKey((k) => k + 1);
  }, []);

  /** Manual refresh: refetch bookings + availability so released sessions (e.g. after trainer marked unavailable) move to Unassigned */
  const refreshSchedule = useCallback(() => {
    fetchBookings(
      { status: 'confirmed', session_date_from: dateFrom, session_date_to: dateTo, limit: 1000 },
      true
    );
    setScheduleDataRefreshKey((k) => k + 1);
  }, [dateFrom, dateTo, fetchBookings]);

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, ScheduleGridSession[]>();
    for (const dateStr of weekDates) {
      map.set(dateStr, []);
    }
    for (const s of allSessions) {
      const list = map.get(s.date);
      if (list) list.push(s);
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          a.startTime.localeCompare(b.startTime) ||
          a.endTime.localeCompare(b.endTime)
      );
    }
    return map;
  }, [weekDates, allSessions]);

  const sortedSessionsForList = useMemo(() => {
    return [...allSessions].sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        a.startTime.localeCompare(b.startTime)
    );
  }, [allSessions]);

  /** Get availability slots for a trainer on a given date (for timeline hint). */
  /** Options for Assign dropdown: only trainers who pass conflict + availability + qualifications */
  const getAssignTrainerOptions = useCallback(
    (sessionId: string): { list: { id: string; name: string }[]; loading: boolean } => {
      const list = availableTrainersBySessionId[sessionId];
      const isUnassigned = unassignedSessionIds.includes(sessionId);
      if (isUnassigned && list === undefined) {
        return { list: [], loading: true };
      }
      return { list: list ?? [], loading: false };
    },
    [availableTrainersBySessionId, unassignedSessionIds]
  );

  const getAvailabilityForTrainerOnDate = useCallback(
    (trainerId: string, dateStr: string): { startTime: string; endTime: string }[] => {
      if (!trainerId || !trainerAvailability?.trainers) return [];
      const id = String(trainerId);
      const t = trainerAvailability.trainers.find((x) => String(x.id) === id);
      if (!t) return [];
      return t.slots
        .filter((s) => s.date === dateStr && s.isAvailable)
        .map((s) => ({ startTime: s.startTime, endTime: s.endTime }));
    },
    [trainerAvailability]
  );

  /** Per trainer per day: absence (approved/pending) takes precedence, then available/unavailable/none. Synced from trainer dashboard. */
  const getDayAvailabilityStatus = useCallback(
    (trainerId: string, dateStr: string): 'approved_absence' | 'pending_absence' | 'available' | 'unavailable' | 'none' => {
      const id = String(trainerId);
      if (trainerAbsence?.trainers) {
        const abs = trainerAbsence.trainers.find((x) => String(x.id) === id);
        if (abs?.approved_dates?.includes(dateStr)) return 'approved_absence';
        if (abs?.pending_dates?.includes(dateStr)) return 'pending_absence';
      }
      if (!trainerAvailability?.trainers) return 'none';
      const t = trainerAvailability.trainers.find((x) => String(x.id) === id);
      if (!t) return 'none';
      const daySlots = t.slots.filter((s) => s.date === dateStr);
      const hasAvailable = daySlots.some((s) => s.isAvailable);
      const hasUnavailable = daySlots.some((s) => !s.isAvailable);
      if (hasAvailable) return 'available';
      if (hasUnavailable) return 'unavailable';
      return 'none';
    },
    [trainerAvailability, trainerAbsence]
  );

  /** Check if session time [start, end] overlaps any available slot (times in HH:mm). */
  const sessionOverlapsSlots = useCallback(
    (sessionStart: string, sessionEnd: string, slots: { startTime: string; endTime: string }[]): boolean => {
      const s = (t: string) => (t || '').slice(0, 5);
      for (const slot of slots) {
        if (s(slot.startTime) < s(sessionEnd) && s(slot.endTime) > s(sessionStart)) return true;
      }
      return false;
    },
    []
  );

  const handleDropOnCell = useCallback(
    (
      targetRowId: string,
      targetDateStr: string,
      payload: { sessionId: string; date: string; trainerId: string | null; startTime?: string; endTime?: string }
    ) => {
      if (payload.date !== targetDateStr) return;
      if (targetRowId === ADD_TRAINER_ROW_ID) return;
      if (targetRowId === payload.trainerId || (targetRowId === '' && !payload.trainerId)) return;
      if (targetRowId === '') {
        handleUnassignTrainer(payload.sessionId);
        return;
      }
      // Assign to trainer: block absence; for "Available" day trust it and let backend validate; else require slot overlap
      const dayStatus = getDayAvailabilityStatus(targetRowId, targetDateStr);
      if (dayStatus === 'approved_absence' || dayStatus === 'pending_absence') {
        setAssignError('This trainer is on absence for this date. Drag to an available trainer or Unassigned.');
        return;
      }
      if (dayStatus === 'available') {
        handleAssignTrainer(payload.sessionId, targetRowId);
        return;
      }
      const slots = getAvailabilityForTrainerOnDate(targetRowId, targetDateStr);
      const startTime = payload.startTime ?? '';
      const endTime = payload.endTime ?? '';
      if (slots.length === 0 || !sessionOverlapsSlots(startTime, endTime, slots)) {
        setAssignError('This trainer is not available for this session time. Choose an available trainer or Unassigned.');
        return;
      }
      handleAssignTrainer(payload.sessionId, targetRowId);
    },
    [
      handleAssignTrainer,
      handleUnassignTrainer,
      getDayAvailabilityStatus,
      getAvailabilityForTrainerOnDate,
      sessionOverlapsSlots,
    ]
  );

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      aria-labelledby="schedule-week-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div className="flex flex-col gap-1">
          <h2
            id="schedule-week-title"
            className="text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            Schedule
          </h2>
          {viewMode === 'by_trainer' && (
            <p className="text-xs text-slate-500 dark:text-slate-400" role="status">
              <span className="inline-block w-3 h-3 rounded-sm bg-emerald-400/80 align-middle mr-0.5" aria-hidden /> Available
              {' · '}
              <span className="inline-block w-3 h-3 rounded-sm bg-rose-400/80 align-middle mr-0.5" aria-hidden /> Unavailable
              {' · '}
              <span className="inline-block w-3 h-3 rounded-sm bg-rose-300 align-middle mr-0.5" aria-hidden /> Absence
              {' · '}
              <span className="inline-block w-3 h-3 rounded-sm bg-amber-400/80 align-middle mr-0.5" aria-hidden /> Pending absence
              {' · '}
              <span className="inline-block w-3 h-3 rounded-sm bg-slate-300 dark:bg-slate-600 align-middle mr-0.5" aria-hidden /> Not set (synced from trainer dashboard)
              {' · '}
              <span className="text-indigo-600 dark:text-indigo-400">Drag session to Unassigned or another trainer to reassign</span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="sr-only">View:</span>
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800" role="group" aria-label="Schedule view">
            <button
              type="button"
              onClick={() => setViewMode('by_trainer')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium ${
                viewMode === 'by_trainer'
                  ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
              title="By Trainer"
            >
              <LayoutGrid className="h-4 w-4" aria-hidden />
              By Trainer
            </button>
            <button
              type="button"
              onClick={() => setViewMode('by_day')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium ${
                viewMode === 'by_day'
                  ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
              title="By Day"
            >
              <CalendarDays className="h-4 w-4" aria-hidden />
              By Day
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
              title="List"
            >
              <List className="h-4 w-4" aria-hidden />
              List
            </button>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-600" aria-hidden />
          <CalendarRangeToolbar
            period={period}
            setPeriod={setPeriod}
            anchor={anchor}
            setAnchor={setAnchor}
            periodSelectId="schedule-period"
            periodSelectLabel="Schedule period"
            showWeekShortcuts={true}
          >
          <button
            type="button"
            onClick={refreshSchedule}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Refresh schedule (e.g. after a trainer updated availability)"
            title="Refresh schedule so released sessions appear in Unassigned"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Refresh
          </button>
          {unassignedSessionIds && (
            <button
              type="button"
              onClick={syncAvailableTrainers}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              aria-label="Sync available trainers for unassigned sessions"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Sync availability
            </button>
          )}
          </CalendarRangeToolbar>
        </div>
      </div>

      {assignError && (
        <div className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {assignError}
        </div>
      )}

      <div className="overflow-x-auto p-4">
        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/50 overflow-hidden animate-pulse" aria-busy="true" aria-label="Loading schedule">
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="h-10 flex-1 min-w-[4rem] bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {Array.from({ length: 6 }, (_, row) => (
                <div key={row} className="flex gap-px">
                  {Array.from({ length: 7 }, (_, col) => (
                    <div key={col} className="h-14 flex-1 min-w-[4rem] bg-slate-100 dark:bg-slate-800/80" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
            {error}
          </div>
        ) : period === '1_day' ? (
          /* When filter is 1 day: always show horizontal timeline (trainer rows × 24h), regardless of By Trainer / By Day */
          (() => {
              const dateStr = displayDates[0];
              const daySessions = sessionsByDay.get(dateStr) ?? [];
              const dayTrainerRows = trainerRows.filter((r) => r.id !== ADD_TRAINER_ROW_ID);
              const ROW_HEIGHT = 56;
              return (
                <section aria-labelledby={`day-${dateStr}`} className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/50 overflow-hidden">
                  <h3 id={`day-${dateStr}`} className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200">
                    {formatDateLabel(dateStr)}
                  </h3>
                  <div className="overflow-x-auto">
                    <div
                      className="grid min-w-[800px] border-t border-slate-200 dark:border-slate-700"
                      style={{
                        gridTemplateColumns: '10rem repeat(24, minmax(2.5rem, 1fr))',
                        gridTemplateRows: `auto repeat(${dayTrainerRows.length}, ${ROW_HEIGHT}px)`,
                      }}
                    >
                      {/* Top row: 24-hour timeline */}
                      <div className="sticky top-0 z-10 border-b border-r border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80" style={{ gridColumn: 1, gridRow: 1 }} />
                      {Array.from({ length: 24 }, (_, hour) => (
                        <div
                          key={hour}
                          className="border-b border-r border-slate-200 bg-slate-50 px-0.5 py-1.5 text-center text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300"
                          style={{ gridColumn: hour + 2, gridRow: 1 }}
                        >
                          {hour.toString().padStart(2, '0')}:00
                        </div>
                      ))}
                      {/* Trainer rows with session blocks */}
                      {dayTrainerRows.map((row, rowIndex) => {
                        const rowSessions = daySessions.filter((s) => (s.trainerId ?? '') === row.id);
                        return (
                          <React.Fragment key={row.id || 'unassigned'}>
                            <div
                              className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-2 py-2 text-sm font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                              style={{ gridColumn: 1, gridRow: rowIndex + 2 }}
                            >
                              {row.id ? (
                                <button
                                  type="button"
                                  onClick={() => row.id && router.push(`/dashboard/admin/trainers?trainer=${row.id}`)}
                                  className="text-left text-indigo-600 hover:underline dark:text-indigo-300"
                                >
                                  {row.name}
                                </button>
                              ) : (
                                <span>{row.name}</span>
                              )}
                            </div>
                            <div
                              className="relative grid border-b border-slate-200 dark:border-slate-700"
                              style={{
                                gridColumn: '2 / -1',
                                gridRow: rowIndex + 2,
                                gridTemplateColumns: 'repeat(24, 1fr)',
                              }}
                            >
                              {rowSessions.map((session) => {
                                const startH = timeToHours(session.startTime);
                                const endH = timeToHours(session.endTime);
                                const displayStatus = getSessionDisplayStatus(dateStr, session);
                                const styleConfig = SESSION_DISPLAY_STYLES[displayStatus];
                                const assignOpts = getAssignTrainerOptions(session.sessionId);
                                return (
                                  <div
                                    key={session.sessionId}
                                    className={`absolute inset-y-0.5 flex min-w-0 flex-col rounded border shadow-sm overflow-hidden ${styleConfig.cellClass}`}
                                    style={{
                                      left: `${(startH / 24) * 100}%`,
                                      width: `${Math.max((endH - startH) / 24 * 100, 4)}%`,
                                      minWidth: '3.5rem',
                                    }}
                                    title={`${styleConfig.label} · ${formatTime(session.startTime)}–${formatTime(session.endTime)} · ${session.childrenSummary} · ${session.trainerName ?? 'Unassigned'}`}
                                  >
                                    <div className="flex items-center gap-1 px-1 pt-0.5">
                                      <SessionStatusBadge session={session} dateStr={dateStr} showLabel={true} />
                                    </div>
                                    <div className="flex items-start gap-1 p-1 flex-1 min-h-0 overflow-hidden">
                                      <SessionStatusIcon session={session} dateStr={dateStr} />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-medium tabular-nums text-slate-900 dark:text-slate-100 truncate">
                                          {formatTime(session.startTime)}–{formatTime(session.endTime)}
                                        </p>
                                        <p className="truncate text-[10px] text-slate-600 dark:text-slate-400">
                                          {session.childrenSummary}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-0.5 px-1 pb-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          onViewSession
                                            ? onViewSession(session.sessionId, session.bookingId)
                                            : router.push('/dashboard/admin/bookings')
                                        }
                                        className="text-[10px] font-medium text-indigo-600 hover:underline dark:text-indigo-300"
                                      >
                                        View
                                      </button>
                                      {!session.trainerId && (
                                        <select
                                          aria-label={`Assign trainer for ${session.reference}`}
                                          value=""
                                          onChange={(e) => {
                                            const id = e.target.value;
                                            if (id) handleAssignTrainer(session.sessionId, id);
                                            e.currentTarget.value = '';
                                          }}
                                          disabled={assigningSessionId === session.sessionId || assignOpts.loading || assignOpts.list.length === 0}
                                          className="rounded border border-slate-300 bg-white px-1 py-0.5 text-[10px] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                                        >
                                          <option value="">{assignOpts.loading ? 'Checking availability…' : assignOpts.list.length === 0 ? 'No available trainers' : 'Assign…'}</option>
                                          {assignOpts.list.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                          ))}
                                        </select>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </section>
              );
            })()
        ) : viewMode === 'by_day' ? (
            /* Multi-day By Day: time horizontal (columns = hours), days as rows; scroll horizontally through time */
            <div className="w-full max-w-full overflow-x-auto overflow-y-visible rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/50">
              <table
                className="border-collapse text-left text-sm"
                style={{
                  minWidth: 800,
                  width: 'max-content',
                }}
              >
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 w-24 border border-slate-200 bg-slate-50 px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Day
                    </th>
                    {Array.from({ length: 24 }, (_, hour) => (
                      <th
                        key={hour}
                        className="min-w-[4.5rem] border border-slate-200 bg-slate-50 px-0.5 py-2 text-center text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {hour.toString().padStart(2, '0')}:00
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weekDates.map((dateStr) => {
                    const daySessions = sessionsByDay.get(dateStr) ?? [];
                    return (
                      <tr key={dateStr} className="align-top">
                        <td className="sticky left-0 z-10 border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                          <span title={formatDateLabel(dateStr)}>
                            {period === '1_month'
                              ? new Date(dateStr + 'T12:00:00').getDate()
                              : formatDayLabel(dateStr)}
                          </span>
                        </td>
                        <td
                          colSpan={24}
                          className="border border-slate-200 bg-slate-50/50 p-0 dark:border-slate-700 dark:bg-slate-800/30"
                        >
                          <div
                            className="grid min-h-[3rem] w-full"
                            style={{
                              gridTemplateColumns: 'repeat(24, minmax(4.5rem, 1fr))',
                            }}
                          >
                            {daySessions.map((session) => {
                              const startH = timeToHours(session.startTime);
                              const endH = timeToHours(session.endTime);
                              const startCol = Math.floor(startH) + 1;
                              const endCol = Math.ceil(endH) + 1;
                              const displayStatus = getSessionDisplayStatus(dateStr, session);
                              const styleConfig = SESSION_DISPLAY_STYLES[displayStatus];
                              const assignOpts = getAssignTrainerOptions(session.sessionId);
                              return (
                                <div
                                  key={session.sessionId}
                                  className={`flex min-w-0 flex-col rounded border p-1.5 shadow-sm dark:bg-slate-900 ${styleConfig.cellClass}`}
                                  style={{
                                    gridColumn: `${startCol} / ${endCol}`,
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-0.5">
                                    <SessionStatusBadge session={session} dateStr={dateStr} showLabel={true} />
                                    <SessionStatusIcon session={session} dateStr={dateStr} />
                                  </div>
                                  <p className="mt-0.5 truncate text-[11px] font-medium tabular-nums text-slate-900 dark:text-slate-100">
                                    {formatTime(session.startTime)}–{formatTime(session.endTime)}
                                  </p>
                                  <p className="truncate text-[10px] text-slate-600 dark:text-slate-400">
                                    {session.trainerName ?? 'Unassigned'}
                                  </p>
                                  <p className="truncate text-[10px] text-slate-500 dark:text-slate-500">
                                    {session.childrenSummary}
                                  </p>
                                  <div className="mt-1 flex flex-wrap justify-end items-center gap-0.5">
                                    {!session.trainerId && (
                                      <select
                                        aria-label={`Assign trainer for ${session.reference}`}
                                        value=""
                                        onChange={(e) => {
                                          const id = e.target.value;
                                          if (id) handleAssignTrainer(session.sessionId, id);
                                          e.currentTarget.value = '';
                                        }}
                                        disabled={assigningSessionId === session.sessionId || assignOpts.loading || assignOpts.list.length === 0}
                                        className="rounded border border-slate-300 bg-white px-1 py-0.5 text-[10px] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                                      >
                                        <option value="">{assignOpts.loading ? 'Checking availability…' : assignOpts.list.length === 0 ? 'No available trainers' : 'Assign…'}</option>
                                        {assignOpts.list.map((t) => (
                                          <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                      </select>
                                    )}
                                    <span className="inline-flex w-full min-w-0 justify-between items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          onViewSession
                                            ? onViewSession(session.sessionId, session.bookingId)
                                            : router.push('/dashboard/admin/bookings')
                                        }
                                        className="text-[10px] font-medium text-indigo-600 hover:underline dark:text-indigo-300 shrink-0"
                                      >
                                        View
                                      </button>
                                      {(displayStatus === 'in_progress' || displayStatus === 'awaiting_clock_in' || displayStatus === 'completed') && onViewSession && (
                                        <button
                                          type="button"
                                          onClick={() => onViewSession(session.sessionId, session.bookingId, { focusOnActivity: true })}
                                          className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 hover:underline dark:text-emerald-400 shrink-0 ml-auto"
                                        >
                                          View activity
                                          <Activity className="h-3 w-3 shrink-0" aria-hidden />
                                        </button>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="border border-slate-200 bg-slate-50 px-2 py-1.5 text-left text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Date</th>
                  <th className="border border-slate-200 bg-slate-50 px-2 py-1.5 text-left text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Time</th>
                  <th className="border border-slate-200 bg-slate-50 px-2 py-1.5 text-left text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Trainer</th>
                  <th className="border border-slate-200 bg-slate-50 px-2 py-1.5 text-left text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Child / Ref</th>
                  <th className="border border-slate-200 bg-slate-50 px-2 py-1.5 text-center text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Status</th>
                  <th className="border border-slate-200 bg-slate-50 px-2 py-1.5 text-right text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedSessionsForList.map((session) => (
                  <tr key={session.sessionId} className="border-b border-slate-200 dark:border-slate-700">
                    <td className="px-2 py-1.5 text-slate-700 dark:text-slate-300">{formatDayLabel(session.date)}</td>
                    <td className="px-2 py-1.5 text-slate-700 dark:text-slate-300">{formatTime(session.startTime)} – {formatTime(session.endTime)}</td>
                    <td className="px-2 py-1.5 text-slate-700 dark:text-slate-300">{session.trainerName ?? '—'}</td>
                    <td className="px-2 py-1.5 text-slate-600 dark:text-slate-400">{session.childrenSummary} · Ref {session.reference}</td>
                    <td className="px-2 py-1.5 text-center">
                      <SessionStatusIcon session={session} dateStr={session.date} />
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      {(() => {
                        const displayStatus = getSessionDisplayStatus(session.date, session);
                        return (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                onViewSession
                                  ? onViewSession(session.sessionId, session.bookingId)
                                  : router.push('/dashboard/admin/bookings')
                              }
                              className="text-indigo-600 hover:underline dark:text-indigo-300"
                            >
                              View booking
                            </button>
                            {(displayStatus === 'in_progress' || displayStatus === 'awaiting_clock_in' || displayStatus === 'completed') && onViewSession && (
                              <button
                                type="button"
                                onClick={() => onViewSession(session.sessionId, session.bookingId, { focusOnActivity: true })}
                                className="ml-2 inline-flex items-center gap-1 text-emerald-600 hover:underline dark:text-emerald-400"
                              >
                                View activity
                                <Activity className="h-3.5 w-3.5 shrink-0" aria-hidden />
                              </button>
                            )}
                          </>
                        );
                      })()}
                      {!session.trainerId && (() => {
                        const assignOpts = getAssignTrainerOptions(session.sessionId);
                        return (
                          <select
                            aria-label={`Assign trainer for ${session.reference}`}
                            value=""
                            onChange={(e) => {
                              const id = e.target.value;
                              if (id) handleAssignTrainer(session.sessionId, id);
                              e.currentTarget.value = '';
                            }}
                            disabled={assigningSessionId === session.sessionId || assignOpts.loading || assignOpts.list.length === 0}
                            className="ml-1 rounded border border-slate-300 bg-white px-1 py-0.5 text-xs dark:border-slate-600 dark:bg-slate-800"
                          >
                            <option value="">{assignOpts.loading ? 'Checking availability…' : assignOpts.list.length === 0 ? 'No available trainers' : 'Assign'}</option>
                            {assignOpts.list.map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sortedSessionsForList.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {period === '1_week' ? 'No sessions this week.' : 'No sessions this month.'}
              </p>
            )}
          </div>
        ) : (
          <div className="w-full max-w-full overflow-x-auto overflow-y-visible">
            <table
              className="border-collapse text-left"
              style={{
                minWidth: period === '1_month' ? undefined : 800,
                width: period === '1_month' ? 'max-content' : '100%',
              }}
            >
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 w-36 border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Trainer
                  </th>
                  {weekDates.map((dateStr) => (
                    <th
                      key={dateStr}
                      className={`border border-slate-200 bg-slate-50 px-1 py-2 text-center text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 ${
                        period === '1_month' ? 'min-w-0 w-12 max-w-[4rem]' : 'min-w-[140px]'
                      }`}
                    >
                      <span className="block truncate" title={formatDayLabel(dateStr)}>
                        {period === '1_month'
                          ? new Date(dateStr + 'T12:00:00').getDate()
                          : formatDayLabel(dateStr)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trainerRows.map((row) => (
                  <tr key={row.id || 'unassigned'} className="align-top">
                    <td className="sticky left-0 z-10 border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                    {row.id === ADD_TRAINER_ROW_ID ? (
                      <button
                        type="button"
                        onClick={() => router.push('/dashboard/admin/trainers')}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-300"
                      >
                        <UserPlus className="h-4 w-4" aria-hidden />
                        {row.name}
                      </button>
                    ) : (
                      <>
                        <span className="block">{row.name}</span>
                        {row.id && (
                          <button
                            type="button"
                            onClick={() => router.push(`/dashboard/admin/trainers?trainer=${row.id}`)}
                            className="mt-1 block text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-300"
                          >
                            View schedule
                          </button>
                        )}
                      </>
                    )}
                  </td>
                  {weekDates.map((dateStr) => {
                    const key = `${row.id}|${dateStr}`;
                    const cellSessions = sessionsByRowAndDay.get(key) ?? [];
                    const availabilitySlots = row.id && row.id !== ADD_TRAINER_ROW_ID
                      ? getAvailabilityForTrainerOnDate(row.id, dateStr)
                      : [];
                    const dayStatus = row.id && row.id !== ADD_TRAINER_ROW_ID
                      ? getDayAvailabilityStatus(row.id, dateStr)
                      : 'none';
                    const cellBgClass =
                      dayStatus === 'approved_absence'
                        ? 'bg-rose-100/80 dark:bg-rose-950/40'
                        : dayStatus === 'pending_absence'
                          ? 'bg-amber-50/80 dark:bg-amber-950/30'
                          : dayStatus === 'available'
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/20'
                            : dayStatus === 'unavailable'
                              ? 'bg-rose-50/70 dark:bg-rose-950/20'
                              : 'bg-slate-50/50 dark:bg-slate-800/30';
                    const isDropTarget = (() => {
                      if (!isDraggingSession || !draggingPayload) return false;
                      if (draggingPayload.date !== dateStr) return false;
                      if (row.id === ADD_TRAINER_ROW_ID) return false;
                      if (row.id === '') return true;
                      if (row.id === draggingPayload.trainerId) return false;
                      if (dayStatus === 'approved_absence' || dayStatus === 'pending_absence') return false;
                      if (dayStatus === 'available') return true;
                      const startTime = draggingPayload.startTime ?? '';
                      const endTime = draggingPayload.endTime ?? '';
                      return availabilitySlots.length > 0 && sessionOverlapsSlots(startTime, endTime, availabilitySlots);
                    })();
                    const cellRowId = row.id;
                    const cellDateStr = dateStr;
                    const canDrop = cellRowId !== ADD_TRAINER_ROW_ID;
                    const handleCellDragOver = canDrop
                      ? (e: React.DragEvent) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                        }
                      : undefined;
                    const handleCellDrop = canDrop
                      ? (e: React.DragEvent) => {
                          e.preventDefault();
                          setIsDraggingSession(false);
                          setDraggingPayload(null);
                          const raw = e.dataTransfer.getData(DRAG_TYPE);
                          if (!raw) return;
                          try {
                            const payload = JSON.parse(raw) as {
                              sessionId: string;
                              date: string;
                              trainerId: string | null;
                              startTime?: string;
                              endTime?: string;
                            };
                            handleDropOnCell(cellRowId, cellDateStr, payload);
                          } catch {
                            // ignore invalid payload
                          }
                        }
                      : undefined;
                    return (
                      <td
                        key={key}
                        data-row-id={cellRowId}
                        data-date={cellDateStr}
                        className={`relative border border-slate-200 p-1 dark:border-slate-700 ${
                          period === '1_month' ? 'min-w-0 w-12 max-w-[4rem]' : 'min-w-[140px]'
                        } ${cellBgClass} ${isDropTarget ? 'ring-2 ring-indigo-400 ring-inset dark:ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30' : ''}`}
                        onDragOver={handleCellDragOver}
                        onDrop={handleCellDrop}
                      >
                        {dayStatus === 'approved_absence' && (
                          <p className="mb-1 text-[10px] font-medium text-rose-700 dark:text-rose-300" title="Trainer on approved absence">
                            Absence
                          </p>
                        )}
                        {dayStatus === 'pending_absence' && (
                          <p className="mb-1 text-[10px] font-medium text-amber-700 dark:text-amber-300" title="Trainer has pending absence request">
                            Pending absence
                          </p>
                        )}
                        {dayStatus === 'available' && (
                          <p className="mb-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400" title="Trainer available (from their dashboard)">
                            Available{availabilitySlots.length > 0 ? `: ${availabilitySlots.map((s) => `${(s.startTime || '').slice(0, 5)}–${(s.endTime || '').slice(0, 5)}`).join(', ')}` : ''}
                          </p>
                        )}
                        {dayStatus === 'unavailable' && (
                          <p className="mb-1 text-[10px] font-medium text-rose-700 dark:text-rose-400" title="Trainer unavailable (from their dashboard)">
                            Unavailable
                          </p>
                        )}
                        {dayStatus === 'none' && cellSessions.length === 0 && row.id && row.id !== ADD_TRAINER_ROW_ID && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 italic" title="Trainer has not set availability for this day">
                            Not set
                          </p>
                        )}
                        {row.id === '' && cellSessions.length === 0 && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">No unassigned sessions</p>
                        )}
                        {(() => {
                          const visibleSessions = cellSessions.slice(0, MAX_SESSIONS_PER_CELL);
                          const overflowSessions = cellSessions.slice(MAX_SESSIONS_PER_CELL);
                          const cellKey = `${row.id ?? ''}|${dateStr}`;
                          return (
                            <>
                        <ul className="space-y-1.5">
                          {visibleSessions.map((session) => {
                            const displayStatus = getSessionDisplayStatus(session.date, session);
                            const styleConfig = SESSION_DISPLAY_STYLES[displayStatus];
                            const assignOpts = getAssignTrainerOptions(session.sessionId);
                            const isTrainerConfirmed = session.trainerAssignmentStatus === TRAINER_ASSIGNMENT_CONFIRMED;
                            const canDrag = !isTrainerConfirmed;
                            return (
                            <li
                              key={session.sessionId}
                              draggable={canDrag}
                              role={canDrag ? 'button' : undefined}
                              tabIndex={canDrag ? 0 : undefined}
                              aria-label={canDrag
                                ? `Session ${session.reference}, ${session.date} ${session.startTime}. Drag to another trainer or Unassigned to reassign.`
                                : `Session ${session.reference}, ${session.date} ${session.startTime}. Trainer confirmed; cannot reassign.`}
                              className={`rounded-lg border p-2 shadow-sm dark:bg-slate-900 ${styleConfig.cellClass} ${canDrag ? 'cursor-grab active:cursor-grabbing select-none' : 'cursor-default'}`}
                              onDragStart={canDrag ? (e) => {
                                const payload = {
                                  sessionId: session.sessionId,
                                  date: session.date,
                                  trainerId: session.trainerId ?? null,
                                  startTime: session.startTime,
                                  endTime: session.endTime,
                                };
                                e.dataTransfer.setData(DRAG_TYPE, JSON.stringify(payload));
                                e.dataTransfer.effectAllowed = 'move';
                                setDraggingPayload(payload);
                                setIsDraggingSession(true);
                              } : undefined}
                              onDragEnd={canDrag ? () => {
                                setIsDraggingSession(false);
                                setDraggingPayload(null);
                              } : undefined}
                              onKeyDown={canDrag ? (e) => {
                                if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
                              } : undefined}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <SessionStatusBadge session={session} dateStr={session.date} showLabel={true} />
                                <div className="flex items-center gap-1">
                                  {isTrainerConfirmed && (
                                    <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap" title="Trainer confirmed; drag disabled">
                                      Confirmed
                                    </span>
                                  )}
                                  {!isTrainerConfirmed && session.trainerId && (
                                    <span className="text-[9px] font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap" title="Trainer not yet confirmed; you can reassign or unassign">
                                      Unconfirmed
                                    </span>
                                  )}
                                  {!session.trainerId && (
                                    <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap" title="No trainer assigned; drag to assign">
                                      Unassigned
                                    </span>
                                  )}
                                  <SessionStatusIcon session={session} dateStr={session.date} />
                                </div>
                              </div>
                              <div className="mt-0.5 flex items-start justify-between gap-1">
                                <p className="text-xs font-medium text-slate-900 dark:text-slate-100">
                                  {formatTime(session.startTime)} –{' '}
                                  {formatTime(session.endTime)}
                                </p>
                              </div>
                              <p className="mt-0.5 truncate text-[11px] text-slate-600 dark:text-slate-400">
                                {session.childrenSummary}
                              </p>
                              <div className="mt-1.5 flex flex-wrap justify-end items-center gap-1">
                                {!session.trainerId && (
                                  <select
                                    aria-label={`Assign trainer for ${session.reference}`}
                                    value=""
                                    onChange={(e) => {
                                      const id = e.target.value;
                                      if (id)
                                        handleAssignTrainer(
                                          session.sessionId,
                                          id
                                        );
                                      e.currentTarget.value = '';
                                    }}
                                    disabled={
                                      assigningSessionId === session.sessionId ||
                                      assignOpts.loading ||
                                      assignOpts.list.length === 0
                                    }
                                    className="max-w-full rounded border border-slate-300 bg-white px-1.5 py-1 text-[11px] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 disabled:opacity-50"
                                  >
                                    <option value="">
                                      {assigningSessionId === session.sessionId
                                        ? 'Assigning…'
                                        : assignOpts.loading
                                          ? 'Checking availability…'
                                          : assignOpts.list.length === 0
                                            ? 'No available trainers'
                                            : 'Assign…'}
                                    </option>
                                    {assignOpts.list.map((t) => (
                                      <option key={t.id} value={t.id}>
                                        {t.name}
                                      </option>
                                    ))}
                                  </select>
                                )}
                                <span className="inline-flex w-full min-w-0 justify-end items-center gap-1">
                                  <button
                                    type="button"
                                    data-session-card-popover-trigger
                                    aria-label="Session actions"
                                    aria-expanded={sessionCardPopover?.sessionId === session.sessionId}
                                    aria-haspopup="true"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                      if (sessionCardPopover?.sessionId === session.sessionId) {
                                        setSessionCardPopover(null);
                                      } else {
                                        setSessionCardPopover({
                                          sessionId: session.sessionId,
                                          bookingId: session.bookingId,
                                          displayStatus,
                                          anchorRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
                                        });
                                      }
                                    }}
                                    className="rounded p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-slate-200"
                                  >
                                    <ChevronRight className="h-4 w-4" aria-hidden />
                                  </button>
                                </span>
                              </div>
                            </li>
                            );
                          })}
                        </ul>
                        {overflowSessions.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setOverflowState({
                              key: cellKey,
                              rowName: row.name,
                              dateStr,
                              sessions: overflowSessions,
                            })}
                            className="mt-1 w-full rounded border border-slate-300 bg-white px-1.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            Show {overflowSessions.length} more
                          </button>
                        )}
                            </>
                          );
                        })()}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 px-4 py-2 dark:border-slate-700">
        <button
          type="button"
          onClick={() => router.push('/dashboard/admin/bookings')}
          className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
        >
          View all bookings →
        </button>
      </div>

      {sessionCardPopover
        ? createPortal(
            <div
              ref={sessionCardPopoverContentRef}
              role="menu"
              aria-label="Session actions"
              className="fixed z-dropdown min-w-[11rem] rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
              style={{
                top: sessionCardPopover.anchorRect.top + sessionCardPopover.anchorRect.height + 4,
                left: sessionCardPopover.anchorRect.left,
              }}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onViewSession
                    ? onViewSession(sessionCardPopover.sessionId, sessionCardPopover.bookingId)
                    : router.push('/dashboard/admin/bookings');
                  setSessionCardPopover(null);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ExternalLink className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" aria-hidden />
                View booking
              </button>
              {(sessionCardPopover.displayStatus === 'in_progress' || sessionCardPopover.displayStatus === 'completed') &&
                onViewSession &&
                (sessionCardPopover.displayStatus === 'in_progress' ? (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onViewSession(sessionCardPopover.sessionId, sessionCardPopover.bookingId, { focusOnActivity: true });
                      setSessionCardPopover(null);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
                  >
                    <Clock className="h-4 w-4 shrink-0" aria-hidden />
                    View latest activity
                  </button>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onViewSession(sessionCardPopover.sessionId, sessionCardPopover.bookingId, { focusOnActivity: true });
                      setSessionCardPopover(null);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Activity className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                    View activity
                  </button>
                ))}
            </div>,
            document.body
          )
        : null}

      {overflowState &&
        createPortal(
          <div
            className="fixed inset-0 z-overlay flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="overflow-sessions-title"
            onClick={() => setOverflowState(null)}
          >
            <div
              className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                <h2 id="overflow-sessions-title" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {overflowState.sessions.length} more session{overflowState.sessions.length !== 1 ? 's' : ''} · {overflowState.rowName} · {formatDayLabel(overflowState.dateStr)}
                </h2>
              </div>
              <ul className="max-h-[60vh] overflow-y-auto p-2 space-y-1.5">
                {overflowState.sessions.map((session) => {
                  const displayStatus = getSessionDisplayStatus(session.date, session);
                  const styleConfig = SESSION_DISPLAY_STYLES[displayStatus];
                  return (
                    <li
                      key={session.sessionId}
                      className={`rounded-lg border p-2 text-sm ${styleConfig.cellClass}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {formatTime(session.startTime)} – {formatTime(session.endTime)}
                          </p>
                          <p className="truncate text-xs text-slate-600 dark:text-slate-400">{session.childrenSummary}</p>
                        </div>
                        <div className="flex shrink-0 min-w-[8rem] justify-between items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onViewSession
                                ? onViewSession(session.sessionId, session.bookingId)
                                : router.push('/dashboard/admin/bookings');
                              setOverflowState(null);
                            }}
                            className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-300 shrink-0"
                          >
                            View booking
                          </button>
                          {(displayStatus === 'in_progress' || displayStatus === 'awaiting_clock_in' || displayStatus === 'completed') && onViewSession && (
                            <button
                              type="button"
                              onClick={() => {
                                onViewSession(session.sessionId, session.bookingId, { focusOnActivity: true });
                                setOverflowState(null);
                              }}
                              className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400 shrink-0 ml-auto"
                            >
                              View activity
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-slate-200 px-4 py-2 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setOverflowState(null)}
                  className="text-sm font-medium text-slate-600 hover:underline dark:text-slate-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
