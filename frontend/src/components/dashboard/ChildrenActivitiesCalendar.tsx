'use client';

import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import moment, { Moment } from 'moment';
import { Activity, Calendar, Users, Clock, CheckCircle, X, ChevronLeft, ChevronRight, MapPin, User, FileText, Package, Circle, Square, CheckSquare, GripVertical, XCircle } from 'lucide-react';
import { BookingCalendar } from '@/components/ui/Calendar';
import { calendarUtils } from '@/components/ui/Calendar/useCalendarGrid';
import { BookingDTO } from '@/core/application/booking';
import { isDateBookable, getDateBookingStatus } from '@/utils/bookingCutoffRules';
import { BOOKING_VALIDATION_MESSAGES, getMessageForDateReason } from '@/utils/bookingValidationMessages';
import { getChildColor } from '@/utils/childColorUtils';
import { formatDurationMinutesForDisplay } from '@/utils/activitySelectionUtils';
import type { CalendarPeriod } from '@/utils/calendarRangeUtils';
import { getMonthKey } from '@/utils/calendarRangeUtils';

/** Normalise schedule date to YYYY-MM-DD (handles ISO strings from API). */
function normaliseScheduleDate(date: string | undefined): string {
  if (!date || typeof date !== 'string') return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const parsed = moment(date, moment.ISO_8601);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : date;
}

/** Duration in minutes from start/end time strings. */
function sessionDurationMinutes(startTime: string, endTime: string): number {
  const start = moment(startTime, ['HH:mm', 'HH:mm:ss']);
  const end = moment(endTime, ['HH:mm', 'HH:mm:ss']);
  return end.diff(start, 'minutes');
}

export interface ChildActivitySession {
  id: string; // Schedule ID
  date: string;
  startTime: string;
  endTime: string;
  childName: string;
  childId: number;
  activities: string[];
  bookingId: number;
  scheduleId: string; // Same as id (for backward compatibility)
  isPast?: boolean;
  isOngoing?: boolean;
  isUpcoming?: boolean;
  // Additional info
  trainerName?: string;
  trainerPreferenceLabel?: string;
  requiresAdminApproval?: boolean;
  venue?: string;
  venueAddress?: string;
  hoursCost?: number;
  parentNotes?: string;
  trainerNotes?: string;
  itineraryNotes?: string; // Itinerary notes (includes Custom Activity info)
}

interface ChildrenActivitiesCalendarProps {
  bookings: BookingDTO[];
  onDateClick?: (date: string, time?: string) => void; // YYYY-MM-DD format, optional HH:mm for day view - for booking new session
  onSessionClick?: (session: ChildActivitySession) => void; // For edit/cancel existing session
  onUnavailableDateClick?: (date: string, reason?: string) => void; // Callback with date and reason (past | today | tomorrow_after_cutoff) for intelligent toast
  /** Selected date from mini calendar (for syncing/highlighting) - triggers day view */
  selectedDate?: string;
  /** Callback when date changes (for syncing mini calendar) - called when navigating with arrows */
  onDateChange?: (date: string) => void; // YYYY-MM-DD format - for syncing without opening modal
  /** Whether to switch to day view when selectedDate changes (from mini calendar click) */
  switchToDayView?: boolean;
  /** Current month displayed (controlled) - YYYY-MM format */
  currentMonth?: string;
  /** Callback when month changes (for sync with mini calendar) */
  onMonthChange?: (month: string) => void;
  /** Callback when week range changes (for syncing mini calendar week highlighting) */
  onWeekRangeChange?: (weekRange: Set<string>) => void; // Set of YYYY-MM-DD dates in current week
  /** Child IDs to show (filter) - if empty/undefined, show all */
  visibleChildIds?: number[];
  /** Optional list of children for filter UI (id + name) */
  filterableChildren?: { id: number; name: string }[];
  /** Callback when visible child filter changes */
  onFilterChange?: (ids: number[]) => void;
  /** Whether to use compact view */
  showCompactView?: boolean;
  /** Spacing mode: compact, normal, or comfortable */
  spacing?: 'compact' | 'normal' | 'comfortable';
  /** Bulk cancel: called with schedule IDs when user confirms bulk cancel */
  onBulkCancel?: (scheduleIds: string[]) => Promise<void>;
  /** Reschedule: called with session and new date/time when user confirms drag-to-reschedule */
  onRescheduleRequest?: (session: ChildActivitySession, newDate: string, newStartTime: string, newEndTime: string) => Promise<void>;
  /** Child IDs with no hours (new – first purchase). Show 🆕 and Buy Hours on their sessions. */
  newChildIds?: number[];
  /** Called when parent clicks Buy Hours for a specific child from a session card. */
  onBuyHoursForChild?: (childId: number) => void;
  /** When set with calendarAnchor, syncs view and range from parent toolbar (e.g. Last week / This week). */
  calendarPeriod?: CalendarPeriod;
  /** Anchor date from toolbar: single day (1_day), Monday of week (1_week), or 1st of month (1_month). */
  calendarAnchor?: string;
}

/**
 * Children Activities Calendar Component
 * 
 * Google Calendar-style month view showing which child has which activity on which day.
 * Quick view for parents to see all their children's sessions at a glance.
 * 
 * Features:
 * - Month view with navigation
 * - Color-coded by child
 * - Shows activities per day
 * - Click to view session details
 * - Mobile-friendly
 */
export default function ChildrenActivitiesCalendar({ 
  bookings,
  onDateClick,
  onSessionClick,
  onUnavailableDateClick,
  selectedDate,
  onDateChange,
  switchToDayView = false,
  currentMonth: controlledMonth,
  onMonthChange,
  onWeekRangeChange,
  visibleChildIds,
  showCompactView = false,
  spacing = 'normal',
  onBulkCancel,
  onRescheduleRequest,
  newChildIds = [],
  onBuyHoursForChild,
  calendarPeriod,
  calendarAnchor,
}: ChildrenActivitiesCalendarProps) {
  const newChildIdSet = useMemo(() => new Set(newChildIds), [newChildIds]);
  const isNewChild = useCallback((childId: number) => newChildIdSet.has(childId), [newChildIdSet]);
  const [viewMode, setViewMode] = useState<'month' | 'day' | 'week'>('month');
  const [selectedDay, setSelectedDay] = useState<Moment | null>(null);
  const dayTimelineRef = useRef<HTMLDivElement | null>(null);
  /** Multi-select: schedule IDs selected for bulk actions (only upcoming sessions are selectable) */
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<Set<string>>(new Set());
  /** Drag-to-reschedule: pending confirm { session, newDate, newStartTime, newEndTime } */
  const [reschedulePending, setReschedulePending] = useState<{
    session: ChildActivitySession;
    newDate: string;
    newStartTime: string;
    newEndTime: string;
  } | null>(null);
  const [bulkCancelLoading, setBulkCancelLoading] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  /** True while user is dragging a session (highlights drop zones) */
  const [isDraggingSession, setIsDraggingSession] = useState(false);
  // UK-based: Week starts on Monday (isoWeekday(1))
  const [currentWeek, setCurrentWeek] = useState<Moment>(moment().isoWeekday(1).startOf('day'));

  // Sync view and range from parent toolbar when calendarPeriod + calendarAnchor are provided (e.g. Last week / This week)
  const isToolbarControlled = Boolean(calendarPeriod && calendarAnchor);
  useEffect(() => {
    if (!isToolbarControlled) return;
    const anchor = calendarAnchor!;
    const period = calendarPeriod!;
    if (period === '1_week') {
      const monday = moment(anchor).isoWeekday(1).startOf('day');
      setCurrentWeek(monday);
      setViewMode('week');
      if (onMonthChange) onMonthChange(monday.format('YYYY-MM'));
      if (onDateChange) onDateChange(anchor);
    } else if (period === '1_day') {
      const day = moment(anchor).startOf('day');
      setSelectedDay(day);
      setViewMode('day');
      if (onMonthChange) onMonthChange(day.format('YYYY-MM'));
      if (onDateChange) onDateChange(anchor);
    } else {
      setViewMode('month');
      if (onMonthChange) onMonthChange(getMonthKey(anchor));
      if (onDateChange) onDateChange(anchor);
    }
  }, [isToolbarControlled, calendarAnchor, calendarPeriod, onMonthChange, onDateChange]);
  
  // Use controlled month from parent, or internal state if not controlled
  const [internalMonth, setInternalMonth] = useState<Moment>(moment());
  const currentMonth = useMemo(() => {
    return controlledMonth ? moment(controlledMonth, 'YYYY-MM') : internalMonth;
  }, [controlledMonth, internalMonth]);
  
  // Handle month change - notify parent if controlled
  const handleMonthChange = useCallback((newMonth: Moment) => {
    if (onMonthChange) {
      onMonthChange(newMonth.format('YYYY-MM'));
    } else {
      setInternalMonth(newMonth);
    }
  }, [onMonthChange]);

  // Generate week days (Monday-Sunday) - UK standard
  const weekDays = useMemo(() => {
    const days: Moment[] = [];
    // UK-based: Explicitly start on Monday (isoWeekday(1))
    const startOfWeek = currentWeek.clone().isoWeekday(1).startOf('day');
    for (let i = 0; i < 7; i++) {
      days.push(startOfWeek.clone().add(i, 'days'));
    }
    return days;
  }, [currentWeek]);

  // Generate week range dates for mini calendar sync
  const weekRangeDates = useMemo(() => {
    if (viewMode !== 'week') {
      return new Set<string>();
    }
    const dates = new Set<string>();
    weekDays.forEach((day) => {
      dates.add(day.format('YYYY-MM-DD'));
    });
    return dates;
  }, [viewMode, weekDays]);

  // Notify parent of week range changes
  React.useEffect(() => {
    if (onWeekRangeChange) {
      onWeekRangeChange(weekRangeDates);
    }
  }, [weekRangeDates, onWeekRangeChange]);

  // Handle week navigation - UK-based: Week starts on Monday
  const handlePrevWeek = useCallback(() => {
    const newWeek = currentWeek.clone().subtract(1, 'week').isoWeekday(1).startOf('day');
    setCurrentWeek(newWeek);
    // Update month if week spans into previous month
    if (!newWeek.isSame(currentMonth, 'month')) {
      handleMonthChange(newWeek);
    }
  }, [currentWeek, currentMonth, handleMonthChange]);

  const handleNextWeek = useCallback(() => {
    const newWeek = currentWeek.clone().add(1, 'week').isoWeekday(1).startOf('day');
    setCurrentWeek(newWeek);
    // Update month if week spans into next month
    if (!newWeek.isSame(currentMonth, 'month')) {
      handleMonthChange(newWeek);
    }
  }, [currentWeek, currentMonth, handleMonthChange]);

  const handleTodayWeek = useCallback(() => {
    // UK-based: Week starts on Monday (isoWeekday(1))
    const today = moment().isoWeekday(1).startOf('day');
    setCurrentWeek(today);
    handleMonthChange(today);
  }, [handleMonthChange]);
  
  // Sync with selectedDate from mini calendar - switch to day view (Google Calendar behaviour)
  React.useEffect(() => {
    if (selectedDate && switchToDayView) {
      const newDate = moment(selectedDate);
      // Update month if needed
      if (!currentMonth.isSame(newDate, 'month')) {
        handleMonthChange(newDate);
      }
      // Update week if in week view - UK-based: Week starts on Monday
      if (viewMode === 'week') {
        setCurrentWeek(newDate.clone().isoWeekday(1).startOf('day'));
      }
      // Switch to day view with the selected date (Google Calendar-style)
      setSelectedDay(newDate);
      setViewMode('day');
    }
  }, [selectedDate, switchToDayView, viewMode, currentMonth, handleMonthChange]); // eslint-disable-line react-hooks/exhaustive-deps
  // Real-time clock state - updates every minute for accurate status
  const [currentTime, setCurrentTime] = useState(moment());

  // Update time every minute for real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Extract all sessions with child and activity information (with deduplication)
  const allSessions = useMemo(() => {
    const sessions: ChildActivitySession[] = [];
    // Track seen sessions to prevent duplicates (in case backend returns duplicate schedules)
    const seenKeys = new Set<string>();
    // Also track seen booking IDs to prevent processing same booking twice
    const seenBookingIds = new Set<string | number>();

    bookings.forEach((booking) => {
      // Skip if we've already processed this booking (prevents duplicate bookings in array)
      if (seenBookingIds.has(booking.id)) {
        return;
      }
      seenBookingIds.add(booking.id);

      // Only show sessions from confirmed, paid bookings
      if (booking.status !== 'confirmed' || booking.paymentStatus !== 'paid') {
        return;
      }

      if (!booking.schedules || booking.schedules.length === 0) {
        return;
      }

      // Get child name from participants
      const childName = booking.participants?.[0]
        ? `${booking.participants[0].firstName} ${booking.participants[0].lastName}`
        : 'Child';

      const childId = booking.participants?.[0]?.childId || 0;

      booking.schedules.forEach((schedule: BookingDTO['schedules'][0]) => {
        // Get activity names
        const activities = schedule.activities?.map((a: { name: string }) => a.name) || [];
        
        // Skip cancelled sessions
        if (schedule.status === 'cancelled') {
          return;
        }

        // Support both camelCase and snake_case from API (startTime/start_time, endTime/end_time)
        const startTime = (schedule as { startTime?: string; start_time?: string }).startTime ?? (schedule as { start_time?: string }).start_time ?? '';
        const endTime = (schedule as { endTime?: string; end_time?: string }).endTime ?? (schedule as { end_time?: string }).end_time ?? '';

        // Create unique key for deduplication (schedule.id + date + time + childId)
        const uniqueKey = `${schedule.id || ''}-${schedule.date}-${startTime}-${childId}`;
        
        // Skip if we've already seen this session (deduplication)
        if (seenKeys.has(uniqueKey)) {
          return;
        }
        seenKeys.add(uniqueKey);

        // Calculate session status (past, ongoing, upcoming)
        const startMoment = moment(`${schedule.date} ${startTime}`, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss'], false);
        const endMoment = moment(`${schedule.date} ${endTime}`, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss'], false);
        const now = currentTime.clone();

        const isPast = now.isAfter(endMoment);
        const isOngoing = now.isAfter(startMoment) && now.isBefore(endMoment);
        const isUpcoming = now.isBefore(startMoment);

        // Get IDs as strings
        const bookingIdNum = typeof booking.id === 'string' ? parseInt(booking.id, 10) : (typeof booking.id === 'number' ? booking.id : 0);
        const scheduleIdStr = schedule.id || '';

        // Extract trainer info
        const trainerName = schedule.trainer?.name || undefined;
        const requiresAdminApproval = schedule.requiresAdminApproval === true;
        const trainerPreferenceLabel = (() => {
          // If an admin confirmation is required, make that explicit to reduce confusion.
          if (requiresAdminApproval) {
            return 'No preference (awaiting admin confirmation)';
          }

          // If a trainer was auto-assigned, the parent effectively chose "No preference".
          if (schedule.autoAssigned === true) {
            return 'No preference (auto-matched)';
          }

          // If a trainer is present and it was not auto-assigned, treat it as a chosen preference.
          if (trainerName) {
            return 'Preferred trainer selected';
          }

          return 'No preference selected';
        })();

        // Extract venue info (from booking or schedule - adjust as needed)
        const venue = undefined; // TODO: Add venue to BookingScheduleDTO
        const venueAddress = undefined; // TODO: Add venue to BookingScheduleDTO

        // Calculate hours cost (duration in hours)
        const hoursCost = endMoment.diff(startMoment, 'hours', true);

        // Extract notes - use itineraryNotes (preferred) or legacy notes field
        const parentNotes = schedule.notes;
        const trainerNotes = undefined; // TODO: Add trainerNotes to BookingScheduleDTO
        const itineraryNotes = schedule.itineraryNotes || schedule.notes;

        sessions.push({
          id: scheduleIdStr,
          date: normaliseScheduleDate(schedule.date),
          startTime,
          endTime,
          childName,
          childId,
          activities,
          bookingId: bookingIdNum || 0,
          scheduleId: scheduleIdStr,
          isPast,
          isOngoing,
          isUpcoming,
          trainerName,
          trainerPreferenceLabel,
          requiresAdminApproval,
          venue,
          venueAddress,
          hoursCost,
          parentNotes,
          trainerNotes,
          itineraryNotes,
        });
      });
    });

    return sessions;
  }, [bookings, currentTime]); // Include currentTime for real-time updates

  // Filter sessions based on visible children (from sidebar filter)
  const filteredSessions = useMemo(() => {
    if (!visibleChildIds || visibleChildIds.length === 0) {
      return allSessions; // Show all if no filter specified
    }
    return allSessions.filter(session => visibleChildIds.includes(session.childId));
  }, [allSessions, visibleChildIds]);

  // Group sessions by date (using filtered sessions)
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, ChildActivitySession[]>();
    filteredSessions.forEach((session) => {
      const existing = map.get(session.date) || [];
      existing.push(session);
      map.set(session.date, existing);
    });
    return map;
  }, [filteredSessions]);

  // Get unique children for color coding
  const uniqueChildren = useMemo(() => {
    const children = new Map<number, string>();
    allSessions.forEach((session) => {
      if (!children.has(session.childId)) {
        children.set(session.childId, session.childName);
      }
    });
    return Array.from(children.entries()).map(([id, name]) => ({ id, name }));
  }, [allSessions]);

  // When showing Day view, scroll the time grid so the first session of the day is visible
  // (same behaviour as trainer dashboard when clicking a booked date from mini calendar)
  const ROW_HEIGHT = 50;
  useEffect(() => {
    if (viewMode !== 'day') return;

    const container = dayTimelineRef.current;
    if (!container) return;

    const dayDate = selectedDay || (selectedDate ? moment(selectedDate, 'YYYY-MM-DD') : moment());
    if (!dayDate.isValid()) return;

    const dateStr = dayDate.format('YYYY-MM-DD');
    const daySessions = allSessions.filter((s) => normaliseScheduleDate(s.date) === dateStr);
    if (daySessions.length === 0) return;

    // Find earliest session start (same parsing as day view positioning)
    const getStartTop = (session: ChildActivitySession): number => {
      const normalisedDate = normaliseScheduleDate(session.date) || dateStr;
      let m = moment(`${normalisedDate} ${session.startTime}`, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss'], false);
      if (!m.isValid() && session.startTime) {
        const t = moment(session.startTime.trim(), ['HH:mm', 'HH:mm:ss', 'h:mm A', 'h:mm:ss A'], false);
        if (t.isValid()) return t.hours() * ROW_HEIGHT + (t.minutes() / 60) * ROW_HEIGHT;
        const match = session.startTime.trim().match(/^(\d{1,2}):(\d{2})/);
        if (match) {
          const h = parseInt(match[1], 10);
          const min = parseInt(match[2], 10);
          if (h >= 0 && h <= 23 && min >= 0 && min <= 59) return h * ROW_HEIGHT + (min / 60) * ROW_HEIGHT;
        }
      }
      if (!m.isValid()) return 0;
      return m.hours() * ROW_HEIGHT + (m.minutes() / 60) * ROW_HEIGHT;
    };

    const earliestStartTop = Math.min(...daySessions.map(getStartTop));
    let targetTop = earliestStartTop - 2 * ROW_HEIGHT;
    if (targetTop < 0) targetTop = 0;

    container.scrollTo({ top: targetTop, behavior: 'smooth' });
  }, [viewMode, selectedDay, selectedDate, allSessions]);

  // Get sessions for a date
  const getDateSessions = (date: Moment): ChildActivitySession[] => {
    const dateStr = date.format('YYYY-MM-DD');
    return sessionsByDate.get(dateStr) || [];
  };

  // Note: handleMonthChange is defined earlier as a useCallback

  // Handle date click
  // - If date is unavailable → delegate to onUnavailableDateClick (toast) with reason for intelligent message
  // - If date has sessions → switch to Day view so sessions are listed below the calendar (mobile-friendly)
  // - If date is empty and bookable → open booking flow via onDateClick
  const handleDateClick = (date: Moment, sessions: ChildActivitySession[], isUnavailable: boolean, reason?: string) => {
    if (isUnavailable) {
      if (onUnavailableDateClick) {
        onUnavailableDateClick(date.format('YYYY-MM-DD'), reason);
      }
      return;
    }

    const dateStr = date.format('YYYY-MM-DD');

    // If there are one or more sessions on this date, switch to Day view so parents
    // see the full list of that day's sessions directly below the calendar.
    if (sessions.length > 0) {
      setSelectedDay(date);
      setViewMode('day');
      // Keep the visible month in sync with the selected date (especially when jumping across months)
      handleMonthChange(date);
      // Inform parent so any external mini calendar or state can stay in sync
      onDateChange?.(dateStr);
      return;
    }

    // No sessions on this date – open booking flow (ParentBookingModal) via onDateClick.
    if (onDateClick) {
      onDateClick(dateStr);
    }
  };

  // Handle session click - open edit/cancel modal (Google Calendar style)
  const handleSessionClick = (e: React.MouseEvent, session: ChildActivitySession) => {
    e.stopPropagation(); // Prevent date click
    // ✅ Google Calendar Style: Clicking session opens THAT session's detail modal
    if (onSessionClick) {
      onSessionClick(session);
    }
  };

  const toggleSessionSelection = useCallback((e: React.MouseEvent, scheduleId: string) => {
    e.stopPropagation();
    setSelectedScheduleIds((prev) => {
      const next = new Set(prev);
      if (next.has(scheduleId)) next.delete(scheduleId);
      else next.add(scheduleId);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedScheduleIds(new Set());
  }, []);

  const handleBulkCancel = useCallback(async () => {
    if (!onBulkCancel || selectedScheduleIds.size === 0) return;
    setBulkCancelLoading(true);
    try {
      await onBulkCancel(Array.from(selectedScheduleIds));
      setSelectedScheduleIds(new Set());
    } finally {
      setBulkCancelLoading(false);
    }
  }, [onBulkCancel, selectedScheduleIds]);

  const handleRescheduleConfirm = useCallback(async () => {
    if (!onRescheduleRequest || !reschedulePending) return;
    setRescheduleLoading(true);
    try {
      await onRescheduleRequest(
        reschedulePending.session,
        reschedulePending.newDate,
        reschedulePending.newStartTime,
        reschedulePending.newEndTime,
      );
      setReschedulePending(null);
    } finally {
      setRescheduleLoading(false);
    }
  }, [onRescheduleRequest, reschedulePending]);

  const handleRescheduleCancel = useCallback(() => {
    setReschedulePending(null);
  }, []);

  /** Duration in minutes for a session (for reschedule: keep same duration) */
  const getSessionDurationMinutes = useCallback((session: ChildActivitySession): number => {
    return sessionDurationMinutes(session.startTime, session.endTime);
  }, []);


  // Debug logging
  useEffect(() => {
    if (allSessions.length === 0 && bookings.length > 0) {
      console.log('[ChildrenActivitiesCalendar] No sessions found but bookings exist:', {
        totalBookings: bookings.length,
        bookingsWithSchedules: bookings.filter(b => b.schedules && b.schedules.length > 0).length,
        bookings: bookings.map(b => ({
          id: b.id,
          reference: b.reference,
          status: b.status,
          paymentStatus: b.paymentStatus,
          scheduleCount: b.schedules?.length || 0,
        })),
      });
    }
  }, [allSessions.length, bookings]);

  // Always show calendar for better UX, even if no sessions yet
  // Users can click dates to book sessions directly
  // if (allSessions.length === 0) {
  //   return null; // Don't show calendar if no sessions
  // }

  // Adaptive padding based on spacing mode (mobile compact, desktop comfortable)
  const paddingClass = {
    compact: 'p-2 sm:p-3 md:p-4',
    normal: 'p-3 sm:p-4 md:p-5',
    comfortable: 'p-4 sm:p-5 md:p-6',
  }[spacing];

  // Day cell min-height: compact on mobile for more visible weeks, taller on large screens
  const dayCellMinHeight = showCompactView
    ? 'min-h-[52px] sm:min-h-[58px] md:min-h-[65px]'
    : spacing === 'comfortable'
      ? 'min-h-[65px] sm:min-h-[72px] md:min-h-[80px]'
      : 'min-h-[60px] sm:min-h-[65px] md:min-h-[75px]';

  return (
    <div id="children-activities-calendar" className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${paddingClass}`}>
      {/* Header - Clear and Helpful - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              Scheduled Sessions
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 hidden sm:block">
              {onRescheduleRequest
                ? 'Click any date to book. Drag a session to another date or time to reschedule.'
                : 'Click any date to book a session'}
            </p>
          </div>
        </div>
        {/* View Mode Toggle - Google Calendar style - Responsive */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 sm:p-1">
          <button
            type="button"
            onClick={() => {
              setViewMode('month');
              // If switching from day view, update currentMonth to match the selected day's month
              // This preserves the user's navigation context when switching views
              if (selectedDay && !selectedDay.isSame(currentMonth, 'month')) {
                handleMonthChange(selectedDay.clone().startOf('month'));
              }
              setSelectedDay(null);
            }}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
              viewMode === 'month'
                ? 'bg-white text-gray-900 dark:bg-gray-600 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => {
              // When switching to week view, always jump to the current running week
              // so that both the main calendar and mini calendar stay in sync.
              const today = moment().startOf('day');
              const weekStart = today.clone().isoWeekday(1).startOf('day');
              setViewMode('week');
              setCurrentWeek(weekStart);
              handleMonthChange(today);
              onDateChange?.(today.format('YYYY-MM-DD'));
            }}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
              viewMode === 'week'
                ? 'bg-white text-gray-900 dark:bg-gray-600 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => {
              // When switching to day view, always jump straight to today
              // and keep the mini calendar selection in sync.
              const today = moment();
              setViewMode('day');
              setSelectedDay(today);
              handleMonthChange(today);
              onDateChange?.(today.format('YYYY-MM-DD'));
            }}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
              viewMode === 'day'
                ? 'bg-white text-gray-900 dark:bg-gray-600 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Day
          </button>
        </div>
      </div>

      {/* Legend - Balanced - Responsive (only show child names when 2+ children) */}
      <div className="mb-2 sm:mb-3 flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1.5 sm:gap-y-2 text-[10px] sm:text-xs pb-2 sm:pb-3 border-b border-gray-200 dark:border-gray-700">
        {/* Children - inline: only when 2+ children to avoid redundant label */}
        {uniqueChildren.length >= 2 && (
          <>
            {uniqueChildren.map((child) => (
              <div key={child.id} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getChildColor(child.id) }}
                />
                <span className="text-xs text-gray-700 dark:text-gray-300">{child.name}</span>
              </div>
            ))}
            {filteredSessions.length > 0 && (
              <div className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
            )}
          </>
        )}

        {/* Status legend: only when there are sessions (past, live, or upcoming) */}
        {filteredSessions.length > 0 && (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-400 opacity-60" />
              <span className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">Past</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 relative">
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              </div>
              <span className="text-xs text-green-700 dark:text-green-400">Live</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-blue-400" />
              <span className="text-xs text-blue-700 dark:text-blue-300">Upcoming</span>
            </div>
          </>
        )}
      </div>

      {/* Bulk action bar (multi-select) */}
      {onBulkCancel && selectedScheduleIds.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 px-3 py-2">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {selectedScheduleIds.size} session{selectedScheduleIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearSelection}
              className="text-sm text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 underline"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleBulkCancel}
              disabled={bulkCancelLoading}
              className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" aria-hidden />
              Cancel selected
            </button>
          </div>
        </div>
      )}

      {/* Reschedule confirm modal (drag-to-reschedule) */}
      {reschedulePending && onRescheduleRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="reschedule-confirm-title">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <h2 id="reschedule-confirm-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Reschedule session?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {reschedulePending.session.childName} – move to{' '}
              <strong>
                {moment(reschedulePending.newDate).format('ddd, D MMM YYYY')} at{' '}
                {moment(reschedulePending.newStartTime, ['HH:mm', 'HH:mm:ss']).format('h:mm A')} –{' '}
                {moment(reschedulePending.newEndTime, ['HH:mm', 'HH:mm:ss']).format('h:mm A')}
              </strong>
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleRescheduleCancel}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRescheduleConfirm}
                disabled={rescheduleLoading}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {rescheduleLoading ? 'Rescheduling…' : 'Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Day View - Balanced */}
      {viewMode === 'day' && (
        <div className="mb-4">
          {/* Day Navigation */}
          <div className="flex items-center justify-between mb-3 py-2">
            <button
              type="button"
              onClick={() => {
                const newDay = (selectedDay || moment()).clone().subtract(1, 'day');
                setSelectedDay(newDay);
                handleMonthChange(newDay);
                // Sync with mini calendar
                onDateChange?.(newDay.format('YYYY-MM-DD'));
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
            </button>
            <div className="text-center" aria-label={(selectedDay || moment()).isSame(moment(), 'day') ? 'Today' : undefined}>
              <div className="flex flex-col items-center gap-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {(selectedDay || moment()).format('dddd, MMMM D, YYYY')}
                </h3>
                {(selectedDay || moment()).isSame(moment(), 'day') ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                    <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" />
                    Today
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const today = moment();
                      setSelectedDay(today);
                      handleMonthChange(today);
                      // Sync with mini calendar
                      onDateChange?.(today.format('YYYY-MM-DD'));
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                  >
                    Go to Today
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const newDay = (selectedDay || moment()).clone().add(1, 'day');
                setSelectedDay(newDay);
                handleMonthChange(newDay);
                // Sync with mini calendar
                onDateChange?.(newDay.format('YYYY-MM-DD'));
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Next day"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
            </button>
          </div>

          {/* Check date status and show appropriate empty states */}
          {(() => {
            const dayDate = selectedDay || moment();
            const isToday = dayDate.isSame(moment(), 'day');
            const isTomorrow = dayDate.isSame(moment().add(1, 'day'), 'day');
            const isPast = dayDate.isBefore(moment(), 'day');
            const dateStr = dayDate.format('YYYY-MM-DD');
            const daySessions = allSessions.filter((s) => normaliseScheduleDate(s.date) === dateStr);
            const currentTime = moment();

            // PAST DATES: Show past sessions if any, otherwise empty state
            if (isPast) {
              if (daySessions.length > 0) {
                return (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-1">
                        <div className="text-lg">📅</div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          Past Sessions on This Day ({daySessions.length})
                        </h3>
                      </div>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                        {daySessions.map((session, idx) => {
                          const childColor = getChildColor(session.childId);
                          const showChildLabel = uniqueChildren.length >= 2;
                          const startTime = moment(session.startTime, ['HH:mm', 'HH:mm:ss']).format('h:mm A');
                          const endTime = moment(session.endTime, ['HH:mm', 'HH:mm:ss']).format('h:mm A');
                          const isTrainersChoice = session.activities.length === 0;
                          const hasCustomActivity = session.itineraryNotes &&
                            (session.itineraryNotes.includes('Custom Activity:') ||
                              session.itineraryNotes.includes('custom activity'));

                        const canSelect = onBulkCancel && session.isUpcoming;
                        const isSelected = selectedScheduleIds.has(session.scheduleId);
                        return (
                            <div
                              key={idx}
                              onClick={(e) => !(e.target as HTMLElement).closest('[data-checkbox]') && handleSessionClick(e, session)}
                              className={`px-3 py-2.5 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 cursor-pointer transition-colors flex items-start gap-2 ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
                            >
                              {canSelect && (
                                <button
                                  type="button"
                                  data-checkbox
                                  onClick={(e) => toggleSessionSelection(e, session.scheduleId)}
                                  className="flex-shrink-0 mt-1 p-0.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  aria-label={isSelected ? `Deselect ${session.childName}` : `Select ${session.childName}`}
                                >
                                  {isSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                                </button>
                              )}
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <div
                                  className="w-1 min-h-[40px] h-full rounded-full flex-shrink-0 bg-gray-300 dark:bg-gray-600"
                                  style={showChildLabel ? { backgroundColor: childColor } : undefined}
                                  aria-hidden
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    {showChildLabel && (
                                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {session.childName}
                                      </p>
                                    )}
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                      Past
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    <span>{startTime} – {endTime}</span>
                                  </div>
                                  {session.trainerName && (
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
                                      <User className="w-3 h-3" />
                                      <span>{session.trainerName}</span>
                                    </div>
                                  )}
                                  <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    <Activity className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                      {isTrainersChoice ? (
                                        <span className="italic text-gray-500 dark:text-gray-400">Trainer&apos;s Choice</span>
                                      ) : (
                                        <span>{session.activities.join(', ')}</span>
                                      )}
                                    </div>
                                  </div>
                                  {hasCustomActivity && session.itineraryNotes && (
                                    <div className="flex items-start gap-2 text-xs text-purple-600 mt-1">
                                      <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                      <div className="flex-1">
                                        <span className="font-medium">Custom: </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                          {session.itineraryNotes.replace(/Custom Activity:\s*/i, '').split('\n')[0]}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Click a session to view details.
                    </p>
                  </div>
                );
              }
              return (
                <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="text-4xl mb-3">📅</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Available Times</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 text-center max-w-md">
                    This date has passed. Please select a future date.
                  </p>
                </div>
              );
            }

            // TODAY: Show existing sessions first, then booking availability message
            if (isToday) {
              const sessionCount = daySessions.length;
              
              return (
                <div className="space-y-4">
                  {/* Today's Scheduled Sessions (if any) - Show FIRST */}
                  {daySessions.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-1">
                        <div className="text-lg">📅</div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          Your Scheduled Sessions Today ({sessionCount})
                        </h3>
                      </div>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                      {daySessions.map((session, idx) => {
                        const childColor = getChildColor(session.childId);
                        const showChildLabel = uniqueChildren.length >= 2;
                        const startTime = moment(session.startTime, ['HH:mm', 'HH:mm:ss']).format('h:mm A');
                        const endTime = moment(session.endTime, ['HH:mm', 'HH:mm:ss']).format('h:mm A');
                        
                        // Check if trainer's choice (no activities selected)
                        const isTrainersChoice = session.activities.length === 0;
                        // Parse custom activities from itineraryNotes if present
                        const hasCustomActivity = session.itineraryNotes && 
                          (session.itineraryNotes.includes('Custom Activity:') || 
                           session.itineraryNotes.includes('custom activity'));
                        
                        const canSelectToday = onBulkCancel && session.isUpcoming;
                        const isSelectedToday = selectedScheduleIds.has(session.scheduleId);
                        return (
                          <div
                            key={idx}
                            onClick={(e) => !(e.target as HTMLElement).closest('[data-checkbox]') && handleSessionClick(e, session)}
                            className={`px-3 py-2.5 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 cursor-pointer transition-colors flex items-start gap-2 ${isSelectedToday ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
                          >
                            {canSelectToday && (
                              <button
                                type="button"
                                data-checkbox
                                onClick={(e) => toggleSessionSelection(e, session.scheduleId)}
                                className="flex-shrink-0 mt-1 p-0.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                aria-label={isSelectedToday ? `Deselect ${session.childName}` : `Select ${session.childName}`}
                              >
                                {isSelectedToday ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                              </button>
                            )}
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              <div
                                className="w-1 min-h-[40px] h-full rounded-full flex-shrink-0 bg-gray-300 dark:bg-gray-600"
                                style={showChildLabel ? { backgroundColor: childColor } : undefined}
                                aria-hidden
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {showChildLabel && (
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate flex items-center gap-1.5">
                                      {session.childName}
                                      {isNewChild(session.childId) && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shrink-0" aria-hidden>🆕</span>
                                      )}
                                    </p>
                                  )}
                                  {session.isOngoing && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                                      LIVE
                                    </span>
                                  )}
                                </div>
                                {isNewChild(session.childId) && onBuyHoursForChild && (
                                  <div className="text-xs mt-1 flex items-center gap-2">
                                    <span className="text-amber-600 dark:text-amber-400">No hours purchased yet</span>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); onBuyHoursForChild(session.childId); }}
                                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                      Buy Hours →
                                    </button>
                                  </div>
                                )}
                                {/* Time */}
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  <span>{startTime} - {endTime}</span>
                                </div>
                                {/* Trainer */}
                                {session.trainerName && (
                                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">
                                    <User className="w-3 h-3" />
                                    <span>{session.trainerName}</span>
                                  </div>
                                )}
                                {/* Activities */}
                                <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">
                                  <Activity className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    {isTrainersChoice ? (
                                      <span className="italic text-gray-500 dark:text-gray-400 dark:text-gray-500">Trainer's Choice</span>
                                    ) : (
                                      <span>{session.activities.join(', ')}</span>
                                    )}
                                  </div>
                                </div>
                                {/* Custom Activity from itineraryNotes */}
                                {hasCustomActivity && session.itineraryNotes && (
                                  <div className="flex items-start gap-2 text-xs text-purple-600 mt-1">
                                    <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                      <span className="font-medium">Custom: </span>
                                      <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                                        {session.itineraryNotes.replace(/Custom Activity:\s*/i, '').split('\n')[0]}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    </div>
                  )}

                  {/* Booking Availability Message - Show below sessions */}
                  <div className="flex flex-col items-center justify-center py-8 px-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <div className="text-3xl mb-2">ℹ️</div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {sessionCount > 0 
                        ? 'New Bookings Unavailable Today' 
                        : 'No New Bookings Available Today'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 text-center max-w-md mb-4">
                      {sessionCount > 0 ? (
                        <>
                          You have {sessionCount} session{sessionCount !== 1 ? 's' : ''} scheduled today (see above).
                          <br />
                          {getMessageForDateReason('today')}
                        </>
                      ) : (
                        getMessageForDateReason('today')
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const tomorrow = moment().add(1, 'day');
                        setSelectedDay(tomorrow);
                        handleMonthChange(tomorrow);
                        onDateChange?.(tomorrow.format('YYYY-MM-DD'));
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      {sessionCount > 0 ? 'Book for Tomorrow →' : 'View Tomorrow'}
                    </button>
                  </div>
                </div>
              );
            }

            // For future dates (including tomorrow), show the normal timeline
            // daySessions is already defined above at line 551
            
            // Calculate available times for tomorrow
            const minBookingTime = currentTime.clone().add(24, 'hours');
            const availableTimes: string[] = [];
            if (isTomorrow) {
              for (let hour = 0; hour < 24; hour++) {
                const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                const hourMoment = moment(`${dateStr} ${timeStr}`, 'YYYY-MM-DD HH:mm');
                if (hourMoment.isAfter(minBookingTime)) {
                  availableTimes.push(moment(timeStr, 'HH:mm').format('h:mm A'));
                }
              }
            }
            
            // Calculate session positions using simple time-based calculation
            // Row height: 50px per hour (matches min-h-[50px] on time slots)
            const ROW_HEIGHT = 50;

            /**
             * Parse session datetime for day-view positioning.
             * Always derives hours/minutes from the time string and applies to the normalised date
             * so positioning is correct regardless of API date/time format (ISO, HH:mm, etc.).
             */
            const parseSessionMoment = (datePart: string, timePart: string): Moment => {
              const normalisedDate = normaliseScheduleDate(datePart) || dateStr;
              const base = moment(normalisedDate).startOf('day');
              if (!timePart || typeof timePart !== 'string') return base;

              const trimmed = timePart.trim();
              // ISO datetime (e.g. "2026-01-31T19:30:00.000Z") – use moment and take time part
              if (trimmed.includes('T')) {
                const parsed = moment(trimmed, moment.ISO_8601);
                if (parsed.isValid()) {
                  return moment(normalisedDate).hour(parsed.hours()).minute(parsed.minutes()).second(0).millisecond(0);
                }
              }
              // Time-only formats: HH:mm, HH:mm:ss, h:mm A
              const timeFormats = ['HH:mm', 'HH:mm:ss', 'h:mm A', 'h:mm:ss A'];
              for (const fmt of timeFormats) {
                const timeOnly = moment(trimmed, fmt, false);
                if (timeOnly.isValid()) {
                  return base.clone().hour(timeOnly.hours()).minute(timeOnly.minutes()).second(0).millisecond(0);
                }
              }
              // Combined "date time" string (non-strict)
              const combined = `${normalisedDate} ${trimmed}`;
              const combinedM = moment(combined, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD h:mm A', 'YYYY-MM-DD h:mm:ss A'], false);
              if (combinedM.isValid()) return combinedM;

              // Last resort: regex for H(H):mm or H(H):mm:ss (24h) so we never default to midnight with valid-looking time
              const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?/);
              if (timeMatch) {
                const hours = parseInt(timeMatch[1], 10);
                const minutes = parseInt(timeMatch[2], 10);
                if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                  return base.clone().hour(hours).minute(minutes).second(0).millisecond(0);
                }
              }
              return base;
            };

            const sessionsWithPosition = daySessions.map((session) => {
              const sessionStart = parseSessionMoment(session.date, session.startTime);
              const sessionEnd = parseSessionMoment(session.date, session.endTime);
              
              // Handle multi-day sessions (if end is before start, it's next day)
              let actualEnd = sessionEnd;
              if (sessionEnd.isBefore(sessionStart) || sessionEnd.isSame(sessionStart)) {
                // Calculate duration - if end equals start, it's likely a 24-hour session
                const durationHours = moment.duration(sessionEnd.diff(sessionStart)).asHours();
                const actualDuration = durationHours <= 0 ? 24 : durationHours;
                actualEnd = sessionStart.clone().add(actualDuration, 'hours');
              }
              
              // Calculate positions based on time only (simple and maintainable)
              // Position = (hours * ROW_HEIGHT) + (minutes / 60 * ROW_HEIGHT)
              const startHour = sessionStart.hours();
              const startMinutes = sessionStart.minutes();
              const startTop = (startHour * ROW_HEIGHT) + (startMinutes / 60 * ROW_HEIGHT);
              
              const endHour = actualEnd.hours();
              const endMinutes = actualEnd.minutes();
              let endTop = (endHour * ROW_HEIGHT) + (endMinutes / 60 * ROW_HEIGHT);
              
              // If session spans to next day, add 24 hours worth of pixels
              const isNextDay = !actualEnd.isSame(sessionStart, 'day');
              if (isNextDay) {
                endTop += (24 * ROW_HEIGHT);
              }
              
              // Calculate height: difference between end and start positions
              const height = Math.max(ROW_HEIGHT, endTop - startTop);
              
              return {
                ...session,
                startTop,
                endTop,
                height,
                actualEndTime: actualEnd.format('HH:mm'),
                isNextDay,
              };
            });

            return (
              <>
                {/* Tomorrow Banner - Show available times */}
                {isTomorrow && availableTimes.length > 0 && (
                  <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 text-lg">ℹ️</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                          Only times after {availableTimes[0]} are available (24+ hours from now)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hourly Time Slots - Google Calendar Style with Absolute Positioning */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                  <div
                    ref={dayTimelineRef}
                    className="grid grid-cols-[55px_1fr] divide-y divide-gray-100 dark:divide-gray-700 max-h-[500px] overflow-y-auto relative"
                  >
                    {/* Time column + Hour slots */}
                    {Array.from({ length: 24 }, (_, hour) => {
                      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                      const hourMoment = moment(`${dateStr} ${timeStr}`, 'YYYY-MM-DD HH:mm');
                      
                      const isPast = hourMoment.isBefore(currentTime, 'hour');
                      const isNow = hourMoment.isSame(currentTime, 'hour');
                      
                      // Check if this time slot is available for booking (at least 24 hours away)
                      const minBookingTime = currentTime.clone().add(24, 'hours');
                      const isAvailableForBooking = !isPast && hourMoment.isAfter(minBookingTime);
                      const isWithin24Hours = !isPast && !isAvailableForBooking;
                      
                      // Only show time slot if it has sessions, is available, or is past/within 24h
                      const shouldShowSlot = daySessions.length > 0 || isAvailableForBooking || isPast || isWithin24Hours;
                      
                      if (!shouldShowSlot) {
                        return null;
                      }

                      return (
                        <React.Fragment key={hour}>
                          {/* Time label */}
                          <div className={`px-2 py-2 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 border-r border-gray-200 dark:border-gray-700 flex items-start ${
                            isNow ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                          }`}>
                            {moment(timeStr, 'HH:mm').format('ha')}
                          </div>
                          {/* Time slot content - relative container for absolute positioned sessions; drop target for reschedule */}
                          <div
                            className={`min-h-[50px] relative border-r border-gray-200 dark:border-gray-700 transition-colors ${
                              isPast ? 'bg-gray-50 dark:bg-gray-800' : 
                              isNow ? 'bg-blue-50/30 dark:bg-blue-900/30' : 
                              isAvailableForBooking ? 'bg-white dark:bg-gray-800 hover:bg-blue-50/20 dark:hover:bg-blue-900/20 cursor-pointer' : 'bg-gray-50 dark:bg-gray-800'
                            } ${onRescheduleRequest && isAvailableForBooking && isDraggingSession ? 'ring-2 ring-dashed ring-blue-400 dark:ring-blue-500 bg-blue-50/50 dark:bg-blue-900/30' : ''}`}
                            onClick={() => {
                              if (isAvailableForBooking && onDateClick) {
                                onDateClick(dateStr, timeStr);
                              }
                            }}
                            {...(onRescheduleRequest && isAvailableForBooking && {
                              onDragOver: (e: React.DragEvent) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                              },
                              onDrop: (e: React.DragEvent) => {
                                e.preventDefault();
                                const raw = e.dataTransfer.getData('application/x-session-reschedule');
                                if (!raw) return;
                                try {
                                  const payload = JSON.parse(raw) as { scheduleId: string; durationMinutes: number; startTime?: string; endTime?: string };
                                  const session = daySessions.find((s) => s.scheduleId === payload.scheduleId) ?? allSessions.find((s) => s.scheduleId === payload.scheduleId);
                                  if (!session || !session.isUpcoming) return;
                                  const newStartTime = `${hour.toString().padStart(2, '0')}:00`;
                                  const durationMins = payload.durationMinutes ?? getSessionDurationMinutes(session);
                                  const endMoment = moment(`${dateStr} ${newStartTime}`, 'YYYY-MM-DD HH:mm').add(durationMins, 'minutes');
                                  const newEndTime = endMoment.format('HH:mm');
                                  setReschedulePending({ session, newDate: dateStr, newStartTime, newEndTime });
                                } catch {
                                  // ignore invalid payload
                                }
                              },
                            })}
                          >
                            {/* "Not available" text overlay for grayed times */}
                            {!isAvailableForBooking && !isPast && daySessions.length === 0 && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-xs text-gray-400 dark:text-gray-400 font-medium">Not available</span>
                              </div>
                            )}
                            {/* Drop hint when dragging */}
                            {onRescheduleRequest && isAvailableForBooking && isDraggingSession && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-white/90 dark:bg-gray-800/90 px-1.5 py-0.5 rounded">
                                  Drop to reschedule
                                </span>
                              </div>
                            )}
                            {/* Sessions will be absolutely positioned here */}
                          </div>
                        </React.Fragment>
                      );
                    }).filter(Boolean)}
                    
                    {/* Session blocks with start/end dots on time labels */}
                    {/* Dots positioned on time label column (right edge at 55px) */}
                    <div className="absolute inset-0 pointer-events-none">
                      {sessionsWithPosition.map((session, idx) => {
                        const childColor = getChildColor(session.childId);
                        const startTime = moment(session.startTime, ['HH:mm', 'HH:mm:ss']).format('h:mm A');
                        const endTimeDisplay = session.isNextDay 
                          ? `${moment(session.actualEndTime, 'HH:mm').format('h:mm A')} (next day)`
                          : moment(session.actualEndTime, 'HH:mm').format('h:mm A');
                        
                        return (
                          <React.Fragment key={idx}>
                            {/* Start dot - positioned on time label at session start time */}
                            <div
                              className="absolute pointer-events-auto z-20"
                              style={{
                                left: '55px', // Right edge of time column (border between time labels and session area)
                                top: `${session.startTop}px`,
                                transform: 'translate(-50%, -50%)', // Center dot on grid line and border
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSessionClick(e, session);
                              }}
                              title={`${session.childName} - Start: ${startTime}`}
                            >
                              <div
                                className="w-2 h-2 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: childColor }}
                              />
                            </div>
                            
                            {/* End dot - positioned on time label at session end time */}
                            <div
                              className="absolute pointer-events-auto z-20"
                              style={{
                                left: '55px', // Right edge of time column (border between time labels and session area)
                                top: `${session.endTop}px`,
                                transform: 'translate(-50%, -50%)', // Center dot on grid line and border
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSessionClick(e, session);
                              }}
                              title={`${session.childName} - End: ${endTimeDisplay}`}
                            >
                              <div
                                className="w-2 h-2 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: childColor }}
                              />
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                    
                    {/* Session blocks - positioned in session area (starts after time column) */}
                    <div className="absolute inset-0 pointer-events-none" style={{ marginLeft: '55px' }}>
                      {sessionsWithPosition.map((session, idx) => {
                        const childColor = getChildColor(session.childId);
                        const showChildLabel = uniqueChildren.length >= 2;
                        const startTime = moment(session.startTime, ['HH:mm', 'HH:mm:ss']).format('h:mm A');
                        const endTimeDisplay = session.isNextDay 
                          ? `${moment(session.actualEndTime, 'HH:mm').format('h:mm A')} (next day)`
                          : moment(session.actualEndTime, 'HH:mm').format('h:mm A');
                        
                        // Check if trainer's choice (no activities selected)
                        const isTrainersChoice = session.activities.length === 0;
                        // Parse custom activities from itineraryNotes if present
                        const hasCustomActivity = session.itineraryNotes && 
                          (session.itineraryNotes.includes('Custom Activity:') || 
                           session.itineraryNotes.includes('custom activity'));
                        // Calculate if we have enough height for detailed view
                        const isCompactView = session.height < 70;
                        
                        const statusDotClass = session.isOngoing
                          ? 'bg-green-500 animate-pulse'
                          : session.isPast
                            ? 'bg-gray-400'
                            : 'bg-blue-500';

                        const canDrag = onRescheduleRequest && session.isUpcoming;
                        const canSelectBlock = onBulkCancel && session.isUpcoming;
                        const isSelectedBlock = selectedScheduleIds.has(session.scheduleId);
                        const durationMins = getSessionDurationMinutes(session);

                        return (
                          <div
                            key={idx}
                            draggable={canDrag}
                            onDragStart={(e) => {
                              if (!canDrag) return;
                              setIsDraggingSession(true);
                              e.dataTransfer.setData('application/x-session-reschedule', JSON.stringify({
                                scheduleId: session.scheduleId,
                                durationMinutes: durationMins,
                                startTime: session.startTime,
                                endTime: session.endTime,
                              }));
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragEnd={() => setIsDraggingSession(false)}
                            onClick={(e) => {
                              if ((e.target as HTMLElement).closest('[data-checkbox]')) return;
                              e.stopPropagation();
                              handleSessionClick(e, session);
                            }}
                            className={`absolute left-0 right-0 px-2 py-1.5 rounded text-xs cursor-pointer hover:opacity-90 transition-opacity pointer-events-auto z-10 overflow-hidden text-gray-900 dark:text-gray-100 flex items-start gap-1 ${isSelectedBlock ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
                            style={{
                              top: `${session.startTop}px`,
                              height: `${session.height}px`,
                              backgroundColor: `${childColor}20`,
                              borderLeft: `3px solid ${childColor}`,
                              minHeight: '50px',
                            }}
                            title={`${session.childName}${session.trainerName ? ` with ${session.trainerName}` : ''} - ${startTime} to ${endTimeDisplay}${session.activities.length > 0 ? ` - ${session.activities.join(', ')}` : " - Trainer's Choice"}${hasCustomActivity ? ' (has custom activity)' : ''}${canDrag ? ' – Drag to another time or date to reschedule' : ''}`}
                            aria-label={canDrag ? `Session: ${session.childName}. Drag to another time or date to reschedule.` : undefined}
                          >
                            {canSelectBlock && (
                              <button
                                type="button"
                                data-checkbox
                                className="flex-shrink-0 p-0.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-white/50 dark:hover:bg-black/20"
                                onClick={(e) => { e.stopPropagation(); toggleSessionSelection(e, session.scheduleId); }}
                                aria-label={isSelectedBlock ? `Deselect ${session.childName}` : `Select ${session.childName}`}
                              >
                                {isSelectedBlock ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> : <Square className="w-3.5 h-3.5 text-gray-400" />}
                              </button>
                            )}
                            {canDrag && (
                              <span className="flex-shrink-0 text-gray-400 cursor-grab active:cursor-grabbing" aria-hidden>
                                <GripVertical className="w-3.5 h-3.5" />
                              </span>
                            )}
                            <div className="flex-1 min-w-0 overflow-hidden">
                            {/* Child Name + Status */}
                            <div className="font-semibold text-gray-900 dark:text-gray-100 truncate flex items-center gap-1.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${statusDotClass}`}
                                aria-hidden
                              />
                              {showChildLabel && <span className="truncate">{session.childName}</span>}
                              {showChildLabel && isNewChild(session.childId) && (
                                <span className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[9px] rounded font-medium shrink-0" aria-hidden>🆕</span>
                              )}
                              {session.isOngoing && (
                                <span className="px-1 py-0.5 bg-green-500 text-white text-[9px] rounded animate-pulse">
                                  LIVE
                                </span>
                              )}
                            </div>
                            {isNewChild(session.childId) && onBuyHoursForChild && (
                              <div className="text-[10px] mt-0.5 flex items-center gap-1.5 flex-wrap">
                                <span className="text-amber-600 dark:text-amber-400">No hours purchased yet</span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); onBuyHoursForChild(session.childId); }}
                                  className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  Buy Hours →
                                </button>
                              </div>
                            )}
                            
                            {/* Compact view: Time + first activity */}
                            {isCompactView ? (
                              <div className="text-[10px] text-gray-600 dark:text-gray-400 dark:text-gray-500 truncate mt-0.5">
                                {startTime} - {endTimeDisplay}
                                {session.trainerName && ` • ${session.trainerName}`}
                              </div>
                            ) : (
                              <>
                                {/* Detailed view: Time */}
                                <div className="text-[10px] text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>{startTime} - {endTimeDisplay}</span>
                                </div>
                                
                                {/* Trainer */}
                                {session.trainerName && (
                                  <div className="text-[10px] text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                                    <User className="w-2.5 h-2.5 flex-shrink-0" />
                                    <span className="truncate">{session.trainerName}</span>
                                  </div>
                                )}
                                
                                {/* Activities */}
                                <div className="text-[10px] text-gray-700 dark:text-gray-300 mt-0.5 flex items-start gap-1">
                                  <Activity className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />
                                  <span className="truncate">
                                    {isTrainersChoice ? (
                                      <span className="italic text-gray-500 dark:text-gray-400 dark:text-gray-500">Trainer's Choice</span>
                                    ) : (
                                      session.activities.join(', ')
                                    )}
                                  </span>
                                </div>
                                
                                {/* Custom Activity indicator */}
                                {hasCustomActivity && (
                                  <div className="text-[10px] text-purple-600 mt-0.5 flex items-center gap-1 truncate">
                                    <FileText className="w-2.5 h-2.5 flex-shrink-0" />
                                    <span className="font-medium truncate">Custom Activity</span>
                                  </div>
                                )}
                              </>
                            )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Helper Text - Context-aware for the selected day (uses cutoff rules, single message source) */}
                <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 text-center flex items-center justify-center gap-1">
                    <span>💡</span>
                    <span>
                      {selectedDay
                        ? (() => {
                            const dayStr = selectedDay.format('YYYY-MM-DD');
                            const dayStatus = getDateBookingStatus(dayStr);
                            return dayStatus.bookable
                              ? 'You can book sessions on this day.'
                              : getMessageForDateReason(dayStatus.reason, { now: moment() });
                          })()
                        : getMessageForDateReason('today')}
                    </span>
                  </p>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Week View - 7-day grid with session blocks */}
      {viewMode === 'week' && (
        <div className="mb-4">
          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-3 py-2">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
            </button>
            <div className="text-center">
              <div className="flex flex-col items-center gap-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {weekDays[0].format('MMM D')} - {weekDays[6].format('MMM D, YYYY')}
                </h3>
                {weekDays[0].isSame(moment().isoWeekday(1).startOf('day'), 'day') ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                    <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" />
                    This Week
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleTodayWeek}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                  >
                    Go to This Week
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleNextWeek}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
            </button>
          </div>

          {/* Week Grid - 7 columns */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            {/* Weekday Headers - today: ring, pulse, TODAY badge */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              {weekDays.map((day) => {
                const isToday = day.isSame(moment(), 'day');
                return (
                  <div
                    key={day.format('YYYY-MM-DD')}
                    className={`relative text-center py-2 border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${
                      isToday ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500 ring-inset z-10' : ''
                    }`}
                    aria-label={isToday ? `Today, ${day.format('dddd D MMMM')}` : undefined}
                  >
                    {isToday && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" aria-hidden />
                    )}
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {day.format('ddd')}
                    </div>
                    <div
                      className={`text-sm mt-1 ${
                        isToday
                          ? 'font-bold text-blue-700 dark:text-blue-300'
                          : 'font-semibold text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {day.format('D')}
                    </div>
                    {isToday && (
                      <div className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mt-0.5">
                        Today
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Week Days Grid with Sessions */}
            <div className="grid grid-cols-7 divide-x divide-gray-200 dark:divide-gray-700 min-h-[400px]">
              {weekDays.map((day) => {
                const now = moment();
                const dateStr = day.format('YYYY-MM-DD');
                const daySessions = getDateSessions(day);
                const isToday = day.isSame(now, 'day');
                const isPast = day.isBefore(now, 'day');
                const isUnavailable = !isDateBookable(dateStr, now);

                // Group sessions by child
                const sessionsByChild = new Map<string, ChildActivitySession[]>();
                daySessions.forEach((session) => {
                  const key = `${session.childId}-${session.childName}`;
                  const existing = sessionsByChild.get(key) || [];
                  existing.push(session);
                  sessionsByChild.set(key, existing);
                });

                return (
                  <div
                    key={dateStr}
                    className={`relative border-b border-gray-200 dark:border-gray-700 p-1 sm:p-2 min-h-[100px] ${
                      isToday ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500 ring-inset z-10' : isPast ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-800'
                    } ${
                      isUnavailable && daySessions.length === 0
                        ? 'opacity-60 cursor-not-allowed'
                        : !isUnavailable
                          ? 'cursor-pointer hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'
                          : ''
                    }`}
                    aria-label={isToday ? `Today, ${dateStr}` : undefined}
                    onClick={() => {
                      // Only switch to day view if clicking empty space (not on a session)
                      setSelectedDay(day);
                      setViewMode('day');
                      handleMonthChange(day);
                      onDateChange?.(dateStr);
                    }}
                  >
                    {/* Sessions List */}
                    <div className="relative z-10 space-y-1">
                      {Array.from(sessionsByChild.entries()).map(([key, childSessions]) => {
                        const firstSession = childSessions[0];
                        const childColor = getChildColor(firstSession.childId);
                        const showChildLabel = uniqueChildren.length >= 2;
                        const uniqueActivities = Array.from(
                          new Set(childSessions.flatMap((s) => s.activities || []))
                        );

                        // Determine overall status
                        const hasOngoing = childSessions.some(s => s.isOngoing);
                        const hasUpcoming = childSessions.some(s => s.isUpcoming);
                        const allPast = childSessions.every(s => s.isPast);

                        const isOngoing = hasOngoing;
                        const isPast = allPast && !hasOngoing && !hasUpcoming;
                        const sessionCount = childSessions.length;

                        // Format time – show explicit count when multiple sessions so parents aren't confused
                        const startTime = moment(firstSession.startTime, 'HH:mm').format('h:mm A');
                        const timeLabel =
                          sessionCount > 1 ? `${sessionCount} sessions` : startTime;
                        const activityDisplay = uniqueActivities.length > 0 
                          ? uniqueActivities.slice(0, 1).join(', ') + (uniqueActivities.length > 1 ? '…' : '')
                          : "Trainer's Choice";
                        const durationMins = sessionDurationMinutes(firstSession.startTime, firstSession.endTime);

                        const statusBorder = isOngoing
                          ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
                          : isPast
                            ? 'border-l-gray-400 bg-gray-100 dark:bg-gray-700/50'
                            : 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';

                        const statusDotClass = isOngoing
                          ? 'bg-green-500 animate-pulse'
                          : isPast
                            ? 'bg-gray-400'
                            : 'bg-blue-500';

                        const titleParts = [
                          firstSession.childName,
                          startTime,
                          durationMins ? formatDurationMinutesForDisplay(durationMins) : '',
                          firstSession.trainerName || '',
                          activityDisplay,
                        ].filter(Boolean);

                        const upcomingInGroup = childSessions.filter((s) => s.isUpcoming);
                        const canSelectWeek = onBulkCancel && upcomingInGroup.length > 0;
                        const scheduleIdsInGroup = childSessions.map((s) => s.scheduleId);
                        const selectedCount = scheduleIdsInGroup.filter((id) => selectedScheduleIds.has(id)).length;
                        const allSelected = upcomingInGroup.length > 0 && upcomingInGroup.every((s) => selectedScheduleIds.has(s.scheduleId));

                        return (
                          <div
                            key={key}
                            onClick={(e) => {
                              if ((e.target as HTMLElement).closest('[data-checkbox]')) return;
                              e.stopPropagation();
                              handleSessionClick(e, firstSession);
                            }}
                            className={`
                              min-h-[44px] text-[13px] sm:text-sm px-2 py-1.5 rounded border-l-4 truncate transition-opacity text-gray-900 dark:text-gray-100 flex items-start gap-1.5
                              ${statusBorder}
                              ${isPast ? 'opacity-70' : ''}
                              ${isOngoing ? 'ring-1 ring-green-500' : ''}
                              ${selectedCount > 0 ? 'ring-2 ring-blue-500 ring-inset' : ''}
                              ${onSessionClick ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}
                            `}
                            title={titleParts.join(' · ')}
                          >
                            {canSelectWeek && (
                              <button
                                type="button"
                                data-checkbox
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedScheduleIds((prev) => {
                                    const next = new Set(prev);
                                    if (allSelected) {
                                      scheduleIdsInGroup.forEach((id) => next.delete(id));
                                    } else {
                                      upcomingInGroup.forEach((s) => next.add(s.scheduleId));
                                    }
                                    return next;
                                  });
                                }}
                                className="flex-shrink-0 mt-0.5 p-0.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                aria-label={allSelected ? `Deselect ${firstSession.childName}` : `Select ${firstSession.childName}`}
                              >
                                {allSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                              </button>
                            )}
                            <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span
                                className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${statusDotClass}`}
                                aria-hidden
                              />
                              {showChildLabel && (
                                <span className="font-semibold truncate">
                                  {firstSession.childName}
                                </span>
                              )}
                            </div>
                            <div className="font-bold text-gray-800 dark:text-gray-200 truncate mt-0.5">
                              {timeLabel}
                              {durationMins > 0 && (
                                <span className="font-normal text-gray-500 dark:text-gray-400 ml-1">
                                  {formatDurationMinutesForDisplay(durationMins)}
                                </span>
                              )}
                            </div>
                            {activityDisplay && (
                              <div className="text-xs text-gray-700 dark:text-gray-200 truncate font-medium mt-0.5">
                                {activityDisplay}
                                {firstSession.trainerName && (
                                  <span className="text-gray-500 dark:text-gray-400"> · {firstSession.trainerName}</span>
                                )}
                              </div>
                            )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Empty state */}
                      {daySessions.length === 0 && (
                        <div className="text-xs text-gray-400 dark:text-gray-300 text-center py-2">
                          No sessions
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Month View - Using Reusable BookingCalendar Component */}
      {viewMode === 'month' && (
      <BookingCalendar
        size="large"
        currentMonth={currentMonth}
        onMonthChange={handleMonthChange}
        selectedDate={selectedDate}
        datesWithSessions={new Set(Array.from(sessionsByDate.keys()))}
        renderDayCell={(date, index) => {
          const dateSessions = getDateSessions(date);
          const isTodayDate = calendarUtils.isToday(date);
          const isCurrentMonthDate = calendarUtils.isCurrentMonth(date, currentMonth);
          
          // Check if date is available for booking (all rules from bookingCutoffRules)
          const now = moment();
          const dateStr = date.format('YYYY-MM-DD');
          const dateStatus = getDateBookingStatus(dateStr, now);
          const isUnavailable = !dateStatus.bookable;

          const canDropReschedule = onRescheduleRequest && dateStatus.bookable;

          return (
            <div
              key={index}
              role="gridcell"
              aria-label={
                isTodayDate
                  ? `Today, ${date.format('D MMMM YYYY')}${dateSessions.length > 0 ? `, ${dateSessions.length} session(s)` : ', no sessions'}`
                  : `${date.format('D MMMM YYYY')}${dateSessions.length > 0 ? `, ${dateSessions.length} session(s)` : ', no sessions'}`
              }
              onClick={() => {
                handleDateClick(date, dateSessions, isUnavailable, dateStatus.reason);
              }}
              className={`
                ${dayCellMinHeight} border-r border-b border-gray-200 dark:border-gray-700 relative p-0.5 sm:p-1 transition-colors
                ${!isCurrentMonthDate ? 'bg-gray-50 dark:bg-gray-800' : 
                  isTodayDate ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500 ring-inset z-10' :
                  'bg-white dark:bg-gray-800'
                }
                ${
                  isUnavailable
                    ? 'bg-gray-50 dark:bg-gray-800 opacity-60 cursor-not-allowed'
                    : (onDateClick || dateSessions.length > 0)
                      ? 'cursor-pointer hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'
                      : ''
                }
                ${canDropReschedule && isDraggingSession ? 'ring-2 ring-dashed ring-blue-400 dark:ring-blue-500 bg-blue-50 dark:bg-blue-900/30' : ''}
                ${canDropReschedule && !isDraggingSession ? 'hover:bg-blue-50/50 dark:hover:bg-blue-900/20' : ''}
              `}
              {...(canDropReschedule && {
                onDragOver: (e: React.DragEvent) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                },
                onDrop: (e: React.DragEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const raw = e.dataTransfer.getData('application/x-session-reschedule');
                  if (!raw) return;
                  try {
                    const payload = JSON.parse(raw) as { scheduleId: string; startTime?: string; endTime?: string };
                    const session = allSessions.find((s) => s.scheduleId === payload.scheduleId);
                    if (!session || !session.isUpcoming) return;
                    const newDate = dateStr;
                    const newStartTime = payload.startTime ?? session.startTime;
                    const newEndTime = payload.endTime ?? session.endTime;
                    setReschedulePending({ session, newDate, newStartTime, newEndTime });
                  } catch {
                    // ignore invalid payload
                  }
                },
              })}
            >
              {/* Today: pulse dot top-right */}
              {isTodayDate && (
                <span
                  className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"
                  aria-hidden
                />
              )}
              {/* Drop hint when dragging over a bookable date */}
              {canDropReschedule && isDraggingSession && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <span className="text-[9px] font-medium text-blue-600 dark:text-blue-400 bg-white/95 dark:bg-gray-800/95 px-1 py-0.5 rounded shadow-sm">
                    Drop here
                  </span>
                </div>
              )}
              {/* Date number - Balanced; today: bold blue-700 + optional TODAY badge */}
              <div className="flex flex-col items-center justify-center mb-1 w-full">
                {isTodayDate ? (
                  <>
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                      {date.format('D')}
                    </span>
                    <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mt-0.5">
                      Today
                    </span>
                  </>
                ) : (
                  <span className={`
                    text-xs font-medium
                    ${!isCurrentMonthDate ? 'text-gray-400 dark:text-gray-500' : isUnavailable ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}
                  `}>
                    {date.format('D')}
                  </span>
                )}
              </div>

              {/* Sessions for this date - compact, child + activities */}
              <div className="space-y-0.5">
                {(() => {
                  // Group sessions by child
                  const sessionsByChild = new Map<string, ChildActivitySession[]>();
                  dateSessions.forEach((session) => {
                    const key = `${session.childId}-${session.childName}`;
                    const existing = sessionsByChild.get(key) || [];
                    existing.push(session);
                    sessionsByChild.set(key, existing);
                  });

                  const childGroups = Array.from(sessionsByChild.entries());
                  const maxToShow = 3; // Show up to 3 event cards per day (by child group)
                  const displayedGroups = childGroups.slice(0, maxToShow);
                  const hasMoreGroups = childGroups.length > maxToShow;
                  const hasMoreSessions = dateSessions.length > 3;

                  return (
                    <>
                      {displayedGroups.map(([key, childSessions], groupIndex) => {
                        const firstSession = childSessions[0];
                        const childColor = getChildColor(firstSession.childId);
                        const showChildLabel = uniqueChildren.length >= 2;
                        const uniqueActivities = Array.from(
                          new Set(
                            childSessions.flatMap((s) => s.activities || []),
                          ),
                        );
                        
                        // Determine overall status for this child (prioritize ongoing > upcoming > past)
                        const hasOngoing = childSessions.some(s => s.isOngoing);
                        const hasUpcoming = childSessions.some(s => s.isUpcoming);
                        const allPast = childSessions.every(s => s.isPast);
                        
                        const isOngoing = hasOngoing;
                        const isPast = allPast && !hasOngoing && !hasUpcoming;
                        const sessionCount = childSessions.length;
                        const durationMins = sessionDurationMinutes(firstSession.startTime, firstSession.endTime);

                        // Status-based left border and icon: past=gray, live=green, upcoming=blue
                        const statusBorder = isOngoing
                          ? 'border-l-green-500'
                          : isPast
                            ? 'border-l-gray-400'
                            : 'border-l-blue-500';
                        const statusBg = isOngoing
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : isPast
                            ? 'bg-gray-100 dark:bg-gray-700/50'
                            : 'bg-blue-50 dark:bg-blue-900/20';

                        // Format time (bold) and activities - compact month view min 11px
                        const startTime = moment(firstSession.startTime, 'HH:mm').format('h:mm a');
                        const timeLabel =
                          sessionCount > 1 ? `${sessionCount} sessions` : startTime;
                        const activityDisplay = uniqueActivities.length > 0 
                          ? uniqueActivities.slice(0, 2).join(', ') + (uniqueActivities.length > 2 ? '…' : '')
                          : "Trainer's Choice";

                        const statusDotClass = isOngoing
                          ? 'bg-green-500 animate-pulse'
                          : isPast
                            ? 'bg-gray-400'
                            : 'bg-blue-500';
                        const statusText = isOngoing ? 'Live' : isPast ? 'Past' : 'Upcoming';

                        const titleParts = [
                          firstSession.childName,
                          startTime,
                          durationMins ? formatDurationMinutesForDisplay(durationMins) : '',
                          firstSession.trainerName || '',
                          activityDisplay,
                          isPast ? 'Past' : isOngoing ? 'Live now' : 'Upcoming',
                        ].filter(Boolean);

                        const canDragMonth = onRescheduleRequest && (firstSession.isUpcoming || childSessions.some((s) => s.isUpcoming));

                        return (
                          <div
                            key={key}
                            draggable={canDragMonth}
                            onDragStart={(e) => {
                              if (!canDragMonth) return;
                              e.stopPropagation();
                              setIsDraggingSession(true);
                              const start = firstSession.startTime;
                              const end = firstSession.endTime;
                              e.dataTransfer.setData('application/x-session-reschedule', JSON.stringify({
                                scheduleId: firstSession.scheduleId,
                                durationMinutes: sessionDurationMinutes(start, end),
                                startTime: start,
                                endTime: end,
                              }));
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragEnd={() => setIsDraggingSession(false)}
                            onClick={(e) => handleSessionClick(e, firstSession)}
                            className={`
                              min-h-[44px] min-w-[44px] text-xs rounded border-l-4 truncate relative mb-0.5 transition-opacity text-gray-900 dark:text-gray-100 flex items-start gap-1
                              ${showCompactView ? 'px-1 py-0.5' : 'px-1.5 py-1'}
                              ${statusBorder} ${statusBg}
                              ${isPast ? 'opacity-70' : ''}
                              ${isOngoing ? 'ring-1 ring-green-500' : ''}
                              ${onSessionClick ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}
                              ${canDragMonth ? 'cursor-grab active:cursor-grabbing' : ''}
                            `}
                            title={[...titleParts, canDragMonth ? 'Drag to another date or time to reschedule' : ''].filter(Boolean).join(' · ')}
                            aria-label={canDragMonth ? `${firstSession.childName}, ${startTime}. Drag to another date or time to reschedule.` : undefined}
                          >
                            {canDragMonth && (
                              <span className="flex-shrink-0 text-gray-400" aria-hidden>
                                <GripVertical className="w-3 h-3" />
                              </span>
                            )}
                            <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center gap-1 flex-1 min-w-0">
                              <span
                                className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${statusDotClass}`}
                                aria-hidden
                              />
                              <span className="sr-only">{statusText}. </span>
                              {showChildLabel && (
                                <>
                                  <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                    {firstSession.childName}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400 mx-0.5">·</span>
                                </>
                              )}
                              <span className="font-bold text-gray-800 dark:text-gray-200 truncate">
                                {timeLabel}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-700 dark:text-gray-300 truncate font-medium mt-0.5">
                              {activityDisplay}
                              {durationMins > 0 && (
                                <span className="text-gray-500 dark:text-gray-400 ml-1">
                                  {formatDurationMinutesForDisplay(durationMins)}
                                </span>
                              )}
                            </div>
                            </div>
                          </div>
                        );
                      })}
                      {hasMoreGroups && (
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium px-1">
                          +{childGroups.length - maxToShow} more
                        </div>
                      )}
                      {hasMoreSessions && !hasMoreGroups && (
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium px-1">
                          +{dateSessions.length - 3} more
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          );
        }}
      />
      )}
    </div>
  );
}
