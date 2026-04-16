'use client';

import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import moment, { Moment } from 'moment';
import { Calendar, ChevronLeft, ChevronRight, Clock, Activity, User, FileText } from 'lucide-react';
import { BookingCalendar } from '@/components/ui/Calendar';
import { calendarUtils } from '@/components/ui/Calendar/useCalendarGrid';
import type { TrainerBooking } from '@/core/application/trainer/types';
import { getTrainerChildDisplayName } from '@/dashboard/utils/trainerPrivacy';
import { getChildColor } from '@/dashboard/utils/childColorUtils';
import {
  getCalendarLabelClasses,
  getCalendarStatusDotColor,
  type CalendarSessionTimeStatus,
} from '@/dashboard/utils/calendarLabelConstants';
import { CALENDAR_GRID_DAY_CELL_CLASSES } from '@/shared/utils/appConstants';
import type { CalendarPeriod } from '@/dashboard/utils/calendarRangeUtils';

const PENDING_CONFIRMATION = 'pending_trainer_confirmation';

/** Map trainer session to calendar label status (Google Calendar–style; shared with parent/admin). */
function getTrainerSessionCalendarStatus(session: TrainerSession): CalendarSessionTimeStatus {
  if (session.status === 'cancelled') return 'cancelled';
  if (session.trainerAssignmentStatus === PENDING_CONFIRMATION) return 'pending_confirmation';
  if (session.isOngoing) return 'live';
  if (session.isUpcoming) return 'upcoming';
  return 'past';
}

/** Status-based Tailwind classes for session blocks (includes dot for status indicator). */
function getSessionStatusStyle(session: TrainerSession): { bg: string; border: string; dot: string } {
  return getCalendarLabelClasses(getTrainerSessionCalendarStatus(session));
}

/** Google Calendar–style: child colour as primary label (left border + fill). Used for day/week view blocks and time-axis dots. */
function getSessionBlockInlineStyle(session: TrainerSession): { backgroundColor: string; borderLeft: string } {
  const childColor = getChildColor(session.childId);
  return {
    backgroundColor: `${childColor}20`,
    borderLeft: `3px solid ${childColor}`,
  };
}

/** Status dot colour for legend/dots (from shared calendar label constants). */
function getSessionStatusDotColor(session: TrainerSession): string {
  return getCalendarStatusDotColor(getTrainerSessionCalendarStatus(session));
}

interface TrainerSession {
  date: string;
  startTime: string;
  endTime: string;
  childName: string;
  childId: number;
  activities: string[];
  bookingId: number;
  scheduleId: number;
  bookingReference: string;
  isPast?: boolean;
  isOngoing?: boolean;
  isUpcoming?: boolean;
  status?: string;
  /** When pending_trainer_confirmation, session needs trainer to confirm or decline – click to open confirmation. */
  trainerAssignmentStatus?: string | null;
}

interface TrainerSessionsCalendarProps {
  bookings: TrainerBooking[];
  onDateClick?: (date: string, time?: string) => void;
  onSessionClick?: (session: TrainerSession) => void;
  /** Optional trainee visibility filter - only sessions for these trainee IDs are shown */
  visibleTraineeIds?: number[];
  /** Selected date from mini calendar (for syncing/highlighting) - triggers day view */
  selectedDate?: string;
  /** Whether selecting a date from mini calendar should force Day view (Google Calendar-style) */
  switchToDayView?: boolean;
  /** Callback when date changes (for syncing mini calendar) - called when navigating with arrows */
  onDateChange?: (date: string) => void; // YYYY-MM-DD
  /** Current month displayed (controlled) - YYYY-MM format */
  currentMonth?: string;
  /** Callback when month changes (for sync with mini calendar) */
  onMonthChange?: (month: string) => void;
  /** Callback when week range changes (for syncing mini calendar week highlighting) */
  onWeekRangeChange?: (weekRange: Set<string>) => void; // Set of YYYY-MM-DD
  /** When true, calendar is in "set my availability" mode: dropdown per date (Available / Not available) */
  availabilityMode?: boolean;
  /** Dates marked as available */
  availabilityDates?: Set<string>;
  /** Set a date as available or not (only for dates at least 24h ahead; no same day or past) */
  onAvailabilitySet?: (date: string, available: boolean) => void;
  /** When provided, clicking a date opens the availability side panel (instead of switching to day view) */
  onDateClickOpenAvailability?: (date: string) => void;
  /** Approved absence dates (synced with availability panel – show as absence on calendar) */
  approvedAbsenceDates?: Set<string>;
  /** Pending absence dates (waiting for admin approval) */
  pendingAbsenceDates?: Set<string>;
  /** Dates explicitly marked unavailable (red in panel); only these show as unavailable on calendar */
  unavailableDates?: Set<string>;
  /** When false, hide the "Filter by type" activity-type checkboxes (e.g. on overview to reduce clutter). Default false. */
  showSessionTypeFilter?: boolean;
  /** When provided with anchor, view is controlled by toolbar: no internal Day/Week/Month tabs, no duplicate nav. */
  period?: CalendarPeriod;
  /** Anchor date (YYYY-MM-DD): single day for 1_day, Monday for 1_week, 1st for 1_month. Syncs with CalendarRangeToolbar. */
  anchor?: string;
}

/**
 * Trainer Sessions Calendar Component
 * 
 * Google Calendar-style month view showing trainer's assigned sessions.
 * Similar to ChildrenActivitiesCalendar but for trainer perspective.
 */
export default function TrainerSessionsCalendar({
  bookings,
  onDateClick,
  onSessionClick,
  visibleTraineeIds,
  selectedDate,
  switchToDayView = false,
  onDateChange,
  currentMonth: controlledMonth,
  onMonthChange,
  onWeekRangeChange,
  availabilityMode = false,
  availabilityDates,
  onAvailabilitySet,
  onDateClickOpenAvailability,
  approvedAbsenceDates,
  pendingAbsenceDates,
  unavailableDates,
  showSessionTypeFilter = false,
  period: controlledPeriod,
  anchor: controlledAnchor,
}: TrainerSessionsCalendarProps) {
  const isControlled = controlledPeriod != null && controlledAnchor != null;

  const [internalViewMode, setInternalViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [internalMonth, setInternalMonth] = useState<Moment>(moment());
  const [internalSelectedDay, setInternalSelectedDay] = useState<Moment | null>(null);
  const [internalCurrentWeek, setInternalCurrentWeek] = useState<Moment>(moment().isoWeekday(1).startOf('day'));

  const viewMode = isControlled
    ? (controlledPeriod === '1_day' ? 'day' : controlledPeriod === '1_week' ? 'week' : 'month')
    : internalViewMode;
  const anchorMoment = controlledAnchor ? moment(controlledAnchor, 'YYYY-MM-DD') : null;
  const currentMonth = useMemo(() => {
    if (isControlled && anchorMoment) {
      if (controlledPeriod === '1_month') return anchorMoment.clone().startOf('month');
      if (controlledPeriod === '1_week') return anchorMoment.clone().isoWeekday(1).startOf('month');
      return anchorMoment.clone().startOf('month');
    }
    return controlledMonth ? moment(controlledMonth, 'YYYY-MM') : internalMonth;
  }, [isControlled, controlledPeriod, controlledMonth, internalMonth, anchorMoment]);
  const currentWeek = useMemo(() => {
    if (isControlled && controlledPeriod === '1_week' && anchorMoment)
      return anchorMoment.clone().isoWeekday(1).startOf('day');
    return internalCurrentWeek;
  }, [isControlled, controlledPeriod, anchorMoment, internalCurrentWeek]);
  const selectedDay = isControlled && controlledPeriod === '1_day' && anchorMoment
    ? anchorMoment
    : internalSelectedDay;

  const [currentTime, setCurrentTime] = useState(moment());
  const dayTimelineRef = useRef<HTMLDivElement | null>(null);

  // Update time every minute for real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Extract all sessions from bookings
  const allSessions = useMemo(() => {
    const sessions: TrainerSession[] = [];

    bookings.forEach((booking) => {
      if (!booking.schedules || booking.schedules.length === 0) {
        return;
      }

      // Get child display name from participants (first participant used as primary trainee).
      // Business rule: trainers must never see the full legal name.
      const childName = getTrainerChildDisplayName(booking.participants?.[0]?.name);
      const childId = (booking.participants?.[0]?.childId ?? booking.participants?.[0]?.child_id) ?? 0;

      // If a trainee visibility filter is active, skip bookings that do not
      // involve any of the visible trainees. This mirrors the "My Trainees"
      // checkbox behaviour in the left sidebar so the main calendar and
      // summary widgets stay in sync.
      if (
        Array.isArray(visibleTraineeIds) &&
        visibleTraineeIds.length > 0 &&
        (!childId || !visibleTraineeIds.includes(childId))
      ) {
        return;
      }

      booking.schedules.forEach((schedule) => {
        // Get activity names (include cancelled so they show with CANCELLED label)
        const activities = schedule.activities?.map((a: { name: string }) => a.name) || [];

        // Calculate session status
        const startMoment = moment(`${schedule.date} ${schedule.start_time}`, 'YYYY-MM-DD HH:mm');
        const endMoment = moment(`${schedule.date} ${schedule.end_time}`, 'YYYY-MM-DD HH:mm');
        const now = currentTime.clone();

        const isPast = now.isAfter(endMoment);
        const isOngoing = now.isAfter(startMoment) && now.isBefore(endMoment);
        const isUpcoming = now.isBefore(startMoment);

        sessions.push({
          date: schedule.date,
          startTime: schedule.start_time ?? schedule.startTime ?? '',
          endTime: schedule.end_time ?? schedule.endTime ?? '',
          childName,
          childId,
          activities,
          bookingId: booking.id,
          scheduleId: schedule.id,
          bookingReference: booking.reference,
          isPast,
          isOngoing,
          isUpcoming,
          status: schedule.status,
          trainerAssignmentStatus: schedule.trainerAssignmentStatus ?? (schedule as { trainer_assignment_status?: string | null }).trainer_assignment_status ?? null,
        });
      });
    });

    return sessions;
  }, [bookings, currentTime, visibleTraineeIds]);

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, TrainerSession[]>();
    allSessions.forEach((session) => {
      const existing = map.get(session.date) || [];
      existing.push(session);
      map.set(session.date, existing);
    });
    return map;
  }, [allSessions]);

  // Get sessions for a date
  const getDateSessions = (date: Moment): TrainerSession[] => {
    const dateStr = date.format('YYYY-MM-DD');
    return sessionsByDate.get(dateStr) || [];
  };

  // Unique trainees for "by child" legend (Google Calendar–style; only when 2+)
  const uniqueTrainees = useMemo(() => {
    const map = new Map<number, string>();
    allSessions.forEach((session) => {
      if (!map.has(session.childId)) {
        map.set(session.childId, session.childName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allSessions]);

  // Handle month change (controlled/uncontrolled)
  const handleMonthChange = useCallback(
    (month: Moment) => {
      if (onMonthChange) {
        onMonthChange(month.format('YYYY-MM'));
      } else {
        setInternalMonth(month);
      }
    },
    [onMonthChange],
  );

  // Handle date click: open availability panel if handler provided, else day view
  const handleDateClick = (date: Moment, sessions: TrainerSession[]) => {
    if (onDateClickOpenAvailability) {
      onDateClickOpenAvailability(date.format('YYYY-MM-DD'));
      return;
    }
    if (onDateClick) {
      onDateClick(date.format('YYYY-MM-DD'));
      return;
    }
    const dateStr = date.format('YYYY-MM-DD');
    onDateChange?.(dateStr);
    if (!isControlled) {
      setInternalSelectedDay(date);
      handleMonthChange(date);
    }
  };

  // Handle session click
  const handleSessionClick = (e: React.MouseEvent, session: TrainerSession) => {
    e.stopPropagation();
    if (onSessionClick) {
      onSessionClick(session);
    }
  };

  // Get unique session types/activities for filtering
  const sessionTypes = useMemo(() => {
    const types = new Set<string>();
    allSessions.forEach((session) => {
      session.activities.forEach((activity) => {
        types.add(activity);
      });
    });
    return Array.from(types).sort();
  }, [allSessions]);

  // When showing Day view, automatically scroll the time grid so that the first
  // session of the day is visible, reducing cognitive load after jumping from
  // the Upcoming Sessions list.
  useEffect(() => {
    if (viewMode !== 'day') {
      return;
    }

    const container = dayTimelineRef.current;
    if (!container) {
      return;
    }

    const dayDate =
      selectedDay ||
      (selectedDate ? moment(selectedDate, 'YYYY-MM-DD') : moment());
    if (!dayDate.isValid()) {
      return;
    }

    const dateStr = dayDate.format('YYYY-MM-DD');
    const daySessions = allSessions.filter((s) => s.date === dateStr);
    if (daySessions.length === 0) {
      return;
    }

    // Find earliest session start time
    const earliest = daySessions.reduce((earliestSession, current) => {
      const earliestStart = moment(
        `${earliestSession.date} ${earliestSession.startTime}`,
        ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss'],
      );
      const currentStart = moment(
        `${current.date} ${current.startTime}`,
        ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss'],
      );
      return currentStart.isBefore(earliestStart) ? current : earliestSession;
    }, daySessions[0]);

    const startMoment = moment(
      `${earliest.date} ${earliest.startTime}`,
      ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss'],
    );
    if (!startMoment.isValid()) {
      return;
    }

    const ROW_HEIGHT = 50; // Must stay in sync with grid row height
    const hour = startMoment.hours();
    const minutes = startMoment.minutes();

    let targetTop = hour * ROW_HEIGHT + (minutes / 60) * ROW_HEIGHT - 2 * ROW_HEIGHT;
    if (targetTop < 0) {
      targetTop = 0;
    }

    container.scrollTo({
      top: targetTop,
      behavior: 'smooth',
    });
  }, [viewMode, selectedDay, selectedDate, allSessions]);

  // Filter state for session types
  const [filteredTypes, setFilteredTypes] = useState<Set<string>>(new Set(sessionTypes));

  // Update filtered types when session types change
  useEffect(() => {
    setFilteredTypes(new Set(sessionTypes));
  }, [sessionTypes]);

  // Toggle session type filter
  const toggleSessionType = (type: string) => {
    setFilteredTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  // Calculate session statistics
  const sessionStats = useMemo(() => {
    const total = allSessions.length;
    const completed = allSessions.filter((s) => s.isPast && s.status === 'completed').length;
    const scheduled = allSessions.filter((s) => s.isUpcoming && s.status === 'scheduled').length;
    const ongoing = allSessions.filter((s) => s.isOngoing).length;
    
    return { total, completed, scheduled, ongoing };
  }, [allSessions]);

  // Color palette for session types (matching specification)
  const sessionTypeColors: Record<string, string> = {
    'strength': '#4A90E2', // Blue
    'cardio': '#7ED321', // Green
    'hiit': '#F5A623', // Orange
    'flexibility': '#9013FE', // Purple
    'nutrition': '#FFD700', // Yellow
    'assessment': '#D0021B', // Red
  };

  const getSessionTypeColor = (activity: string): string => {
    const activityLower = activity.toLowerCase();
    for (const [type, color] of Object.entries(sessionTypeColors)) {
      if (activityLower.includes(type)) {
        return color;
      }
    }
    return '#4A90E2'; // Default blue
  };

  // Handle week navigation (for week view)
  const handlePrevWeek = useCallback(() => {
    const newWeek = currentWeek.clone().subtract(1, 'week').isoWeekday(1).startOf('day');
    setInternalCurrentWeek(newWeek);
    if (!newWeek.isSame(currentMonth, 'month')) {
      handleMonthChange(newWeek);
    }
  }, [currentWeek, currentMonth, handleMonthChange]);

  const handleNextWeek = useCallback(() => {
    const newWeek = currentWeek.clone().add(1, 'week').isoWeekday(1).startOf('day');
    setInternalCurrentWeek(newWeek);
    if (!newWeek.isSame(currentMonth, 'month')) {
      handleMonthChange(newWeek);
    }
  }, [currentWeek, currentMonth, handleMonthChange]);

  const handleTodayWeek = useCallback(() => {
    const today = moment().isoWeekday(1).startOf('day');
    setInternalCurrentWeek(today);
    handleMonthChange(today);
  }, [handleMonthChange]);

  const weekDays = useMemo(() => {
    const days: Moment[] = [];
    const startOfWeek = currentWeek.clone().isoWeekday(1).startOf('day');
    for (let i = 0; i < 7; i++) {
      days.push(startOfWeek.clone().add(i, 'days'));
    }
    return days;
  }, [currentWeek]);

  // Week range dates for mini calendar highlighting (YYYY-MM-DD for current week)
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

  // Notify parent when the visible week range changes (for mini calendar highlighting)
  useEffect(() => {
    if (onWeekRangeChange) {
      onWeekRangeChange(weekRangeDates);
    }
  }, [weekRangeDates, onWeekRangeChange]);

  // Sync from mini calendar: when selectedDate changes, optionally jump to that day and switch to Day view.
  // When controlled (period+anchor from toolbar), parent updates anchor/period so we do nothing here.
  useEffect(() => {
    if (!selectedDate || isControlled) {
      return;
    }
    const newDate = moment(selectedDate, 'YYYY-MM-DD');
    if (!newDate.isValid()) {
      return;
    }
    if (switchToDayView) {
      if (!currentMonth.isSame(newDate, 'month')) {
        handleMonthChange(newDate.clone().startOf('month'));
      }
      setInternalCurrentWeek(newDate.clone().isoWeekday(1).startOf('day'));
      setInternalSelectedDay(newDate);
      setInternalViewMode('day');
    } else {
      setInternalSelectedDay((prev) => prev ?? newDate);
    }
  }, [selectedDate, currentMonth, handleMonthChange, switchToDayView, isControlled]);

  return (
    <div id="trainer-sessions-calendar" className="min-w-0 bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-5">
      {/* Session Type Filters (top of calendar) – optional to avoid long activity lists on overview */}
      {showSessionTypeFilter && sessionTypes.length > 0 && (
        <div className="mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Filter by type:</span>
          {sessionTypes.map((type) => {
            const isChecked = filteredTypes.has(type);
            const color = getSessionTypeColor(type);
            
            return (
              <label
                key={type}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleSessionType(type)}
                  className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-primary-blue"
                  style={{ accentColor: color }}
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-medium text-gray-700">{type}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* Header - Title + helper text; view mode toggle only when not controlled by toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
            Scheduled Sessions
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
            Click any date to review your schedule. Sessions marked <span className="font-medium text-amber-600 dark:text-amber-400">Confirm</span> need your response – click to confirm or decline.
          </p>
        </div>
        {!isControlled && (
          <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 sm:p-1 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                setInternalViewMode('month');
                if (internalSelectedDay && !internalSelectedDay.isSame(currentMonth, 'month')) {
                  handleMonthChange(internalSelectedDay.clone().startOf('month'));
                }
                setInternalSelectedDay(null);
              }}
              className={`px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm font-medium rounded-md transition-colors ${
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
                const today = moment().startOf('day');
                const weekStart = today.clone().isoWeekday(1).startOf('day');
                setInternalViewMode('week');
                setInternalCurrentWeek(weekStart);
                handleMonthChange(today);
                onDateChange?.(today.format('YYYY-MM-DD'));
              }}
              className={`px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm font-medium rounded-md transition-colors ${
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
                const today = moment();
                setInternalViewMode('day');
                setInternalSelectedDay(today);
                handleMonthChange(today);
                onDateChange?.(today.format('YYYY-MM-DD'));
              }}
              className={`px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm font-medium rounded-md transition-colors ${
                viewMode === 'day'
                  ? 'bg-white text-gray-900 dark:bg-gray-600 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Day
            </button>
          </div>
        )}
      </div>

      {/* Legend: by trainee (when 2+) then status – Google Calendar–style */}
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs pb-3 border-b border-gray-200 dark:border-gray-700">
        {uniqueTrainees.length >= 2 && (
          <>
            {uniqueTrainees.map((trainee) => (
              <div key={trainee.id} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getChildColor(trainee.id) }}
                  aria-hidden
                />
                <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                  {trainee.name}
                </span>
              </div>
            ))}
            <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 flex-shrink-0" aria-hidden />
          </>
        )}
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-gray-400 opacity-50" />
          <span className="text-xs text-gray-600 dark:text-gray-400">Past</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-green-500 relative">
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          </div>
          <span className="text-xs text-green-700 dark:text-green-400">Live</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
          <span className="text-xs text-blue-700 dark:text-blue-300">Upcoming</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
          <span className="text-xs text-amber-700 dark:text-amber-400">Needs confirmation</span>
        </div>
      </div>

      {/* Day View - Google Calendar-style time grid (aligned with parent dashboard) */}
      {viewMode === 'day' && (
        <div className="mb-4 min-w-0">
          {/* Day navigation: only when not controlled (toolbar has Prev/Next) */}
          <div className="flex items-center justify-between gap-2 mb-3 py-2">
            {!isControlled ? (
              <button
                type="button"
                onClick={() => {
                  const newDay = (selectedDay || moment()).clone().subtract(1, 'day');
                  setInternalSelectedDay(newDay);
                  handleMonthChange(newDay);
                  onDateChange?.(newDay.format('YYYY-MM-DD'));
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Previous day"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            ) : (
              <div aria-hidden />
            )}
            <div className="text-center min-w-0 flex-1 px-1">
              <div className="flex flex-col items-center gap-1">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate w-full">
                  {(selectedDay || moment()).format('dddd, MMMM D, YYYY')}
                </h3>
                {(selectedDay || moment()).isSame(moment(), 'day') ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                    Today
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const today = moment();
                      onDateChange?.(today.format('YYYY-MM-DD'));
                      if (!isControlled) {
                        setInternalSelectedDay(today);
                        handleMonthChange(today);
                      }
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Go to Today
                  </button>
                )}
              </div>
            </div>
            {!isControlled ? (
              <button
                type="button"
                onClick={() => {
                  const newDay = (selectedDay || moment()).clone().add(1, 'day');
                  setInternalSelectedDay(newDay);
                  handleMonthChange(newDay);
                  onDateChange?.(newDay.format('YYYY-MM-DD'));
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Next day"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            ) : (
              <div aria-hidden />
            )}
          </div>

          {/* Day Timeline - hour-by-hour grid with sessions (no booking slots for trainers) */}
          {(() => {
            const dayDate = selectedDay || moment();
            const dateStr = dayDate.format('YYYY-MM-DD');
            const daySessions = allSessions.filter((s) => s.date === dateStr);

            // If no sessions, show a simple empty state
            if (daySessions.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-10 px-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-4xl mb-3">📅</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sessions Scheduled</h3>
                  <p className="text-sm text-gray-600 text-center max-w-md">
                    You do not have any sessions assigned for this day.
                  </p>
                </div>
              );
            }

            // Calculate absolute positions for sessions in the time grid
            const ROW_HEIGHT = 50; // px per hour (matches parent dashboard)

            const sessionsWithPosition = daySessions.map((session) => {
              const sessionStart = moment(
                `${session.date} ${session.startTime}`,
                ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss'],
              );
              const sessionEnd = moment(
                `${session.date} ${session.endTime}`,
                ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss'],
              );

              let actualEnd = sessionEnd;
              if (sessionEnd.isBefore(sessionStart) || sessionEnd.isSame(sessionStart)) {
                const durationHours = moment.duration(sessionEnd.diff(sessionStart)).asHours();
                const actualDuration = durationHours <= 0 ? 24 : durationHours;
                actualEnd = sessionStart.clone().add(actualDuration, 'hours');
              }

              const startHour = sessionStart.hours();
              const startMinutes = sessionStart.minutes();
              const startTop = startHour * ROW_HEIGHT + (startMinutes / 60) * ROW_HEIGHT;

              const endHour = actualEnd.hours();
              const endMinutes = actualEnd.minutes();
              let endTop = endHour * ROW_HEIGHT + (endMinutes / 60) * ROW_HEIGHT;

              const isNextDay = !actualEnd.isSame(sessionStart, 'day');
              if (isNextDay) {
                endTop += 24 * ROW_HEIGHT;
              }

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
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                  <div
                    ref={dayTimelineRef}
                    className="grid grid-cols-[55px_1fr] divide-y divide-gray-100 dark:divide-gray-700 max-h-[70vh] sm:max-h-[500px] overflow-y-auto overflow-x-hidden relative"
                    style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
                  >
                    {/* Time column + hour slots */}
                    {Array.from({ length: 24 }, (_, hour) => {
                      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                      const hourMoment = moment(`${dateStr} ${timeStr}`, 'YYYY-MM-DD HH:mm');

                      const isPastHour = hourMoment.isBefore(currentTime, 'hour');
                      const isNowHour = hourMoment.isSame(currentTime, 'hour');

                      return (
                        <React.Fragment key={hour}>
                          {/* Time label */}
                          <div
                            className={`px-2 py-2 text-xs text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 flex items-start ${
                              isNowHour ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                            }`}
                          >
                            {moment(timeStr, 'HH:mm').format('ha')}
                          </div>
                          {/* Time slot content */}
                          <div
                            className={`min-h-[50px] relative border-r border-gray-200 dark:border-gray-700 transition-colors ${
                              isPastHour
                                ? 'bg-gray-50 dark:bg-gray-800'
                                : isNowHour
                                  ? 'bg-blue-50/30 dark:bg-blue-900/20'
                                  : 'bg-white dark:bg-gray-800'
                            }`}
                          />
                        </React.Fragment>
                      );
                    })}

                    {/* Start/end dots aligned to time labels (status colour, not per-child) */}
                    <div className="absolute inset-0 pointer-events-none">
                      {sessionsWithPosition.map((session, idx) => {
                        const dotColor = getSessionStatusDotColor(session);
                        const startTime = moment(session.startTime, ['HH:mm', 'HH:mm:ss']).format(
                          'h:mm A',
                        );
                        const endTimeDisplay = session.isNextDay
                          ? `${moment(session.actualEndTime, 'HH:mm').format('h:mm A')} (next day)`
                          : moment(session.actualEndTime, 'HH:mm').format('h:mm A');

                        return (
                          <React.Fragment key={idx}>
                            {/* Start dot */}
                            <div
                              className="absolute pointer-events-auto z-dropdown"
                              style={{
                                left: '55px',
                                top: `${session.startTop}px`,
                                transform: 'translate(-50%, -50%)',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSessionClick(e, session);
                              }}
                              title={`${session.childName} – Start: ${startTime}`}
                            >
                              <div
                                className="w-2 h-2 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: dotColor }}
                              />
                            </div>

                            {/* End dot */}
                            <div
                              className="absolute pointer-events-auto z-dropdown"
                              style={{
                                left: '55px',
                                top: `${session.endTop}px`,
                                transform: 'translate(-50%, -50%)',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSessionClick(e, session);
                              }}
                              title={`${session.childName} – End: ${endTimeDisplay}`}
                            >
                              <div
                                className="w-2 h-2 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: dotColor }}
                              />
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Session blocks in main column (status colour, not per-child) */}
                    <div className="absolute inset-0 pointer-events-none" style={{ marginLeft: '55px' }}>
                      {sessionsWithPosition.map((session, idx) => {
                        const blockStyle = getSessionBlockInlineStyle(session);
                        const startTime = moment(session.startTime, ['HH:mm', 'HH:mm:ss']).format(
                          'h:mm A',
                        );
                        const endTimeDisplay = session.isNextDay
                          ? `${moment(session.actualEndTime, 'HH:mm').format('h:mm A')} (next day)`
                          : moment(session.actualEndTime, 'HH:mm').format('h:mm A');

                        const isCompactView = session.height < 70;

                        return (
                          <div
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSessionClick(e, session);
                            }}
                            className="absolute left-0 right-0 px-2 py-1.5 rounded text-xs cursor-pointer hover:opacity-90 transition-opacity pointer-events-auto z-sidebar overflow-hidden"
                            style={{
                              top: `${session.startTop}px`,
                              height: `${session.height}px`,
                              ...blockStyle,
                              minHeight: '50px',
                            }}
                            title={`${session.childName} – ${startTime} to ${endTimeDisplay}${
                              session.activities.length > 0
                                ? ` – ${session.activities.join(', ')}`
                                : ''
                            }`}
                          >
                            <div className="font-semibold truncate flex items-center gap-1 flex-wrap">
                              {session.childName}
                              {session.trainerAssignmentStatus === PENDING_CONFIRMATION && (
                                <span className="px-1 py-0.5 bg-amber-500 text-white text-[9px] rounded font-medium" title="Click to confirm or decline this session">
                                  Confirm
                                </span>
                              )}
                              {session.isOngoing && (
                                <span className="px-1 py-0.5 bg-green-500 text-white text-[9px] rounded animate-pulse">
                                  LIVE
                                </span>
                              )}
                            </div>

                            {session.status === 'cancelled' && (
                              <div className="text-[9px] font-medium text-red-600 dark:text-red-400 mt-0.5">
                                CANCELLED – Charge / Pay
                              </div>
                            )}
                            {isCompactView ? (
                              <div className="text-[10px] text-gray-600 dark:text-gray-400 truncate mt-0.5">
                                {startTime} – {endTimeDisplay}
                              </div>
                            ) : (
                              <>
                                <div className="text-[10px] text-gray-600 mt-0.5 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>
                                    {startTime} – {endTimeDisplay}
                                  </span>
                                </div>

                                {session.activities.length > 0 && (
                                  <div className="text-[10px] text-gray-700 mt-0.5 flex items-start gap-1">
                                    <Activity className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />
                                    <span className="truncate">
                                      {session.activities.join(', ')}
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Week View - horizontal scroll on narrow screens */}
      {viewMode === 'week' && (
        <div className="mb-4 min-w-0">
          {!isControlled && (
            <div className="flex items-center justify-between gap-2 mb-3 py-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={handlePrevWeek}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Previous week"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="text-center min-w-0 px-1">
                <div className="flex flex-col items-center gap-1">
                  <h3 className="text-xs sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate w-full">
                    {weekDays[0].format('MMM D')} – {weekDays[6].format('MMM D, YYYY')}
                  </h3>
                  {weekDays[0].isSame(moment().isoWeekday(1).startOf('day'), 'day') ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                      This Week
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleTodayWeek}
                      className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Go to This Week
                    </button>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleNextWeek}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Next week"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}

          {/* Week Grid - scroll horizontally on narrow screens */}
          <div className="overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
            <div className="min-w-[320px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              {weekDays.map((day) => {
                const isToday = day.isSame(moment(), 'day');
                return (
                  <div
                    key={day.format('YYYY-MM-DD')}
                    className={`text-center py-2 border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${
                      isToday ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                    }`}
                  >
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {day.format('ddd')}
                    </div>
                    <div
                      className={`text-sm font-semibold mt-1 ${
                        isToday
                          ? 'w-7 h-7 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {day.format('D')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Week Days Grid with Sessions — Google Calendar–style square cells */}
            <div className="grid grid-cols-7 divide-x divide-gray-200 dark:divide-gray-700">
              {weekDays.map((day) => {
                const dateStr = day.format('YYYY-MM-DD');
                const daySessions = getDateSessions(day);
                const isToday = day.isSame(moment(), 'day');
                const isPast = day.isBefore(moment(), 'day');

                // Group sessions by child
                const sessionsByChild = new Map<string, TrainerSession[]>();
                daySessions.forEach((session) => {
                  const key = `${session.childId}-${session.childName}`;
                  const existing = sessionsByChild.get(key) || [];
                  existing.push(session);
                  sessionsByChild.set(key, existing);
                });

                const isAvailableSync = availabilityDates?.has(dateStr);
                const isApprovedAbsence = approvedAbsenceDates?.has(dateStr);
                const isPendingAbsence = pendingAbsenceDates?.has(dateStr);
                const isUnavailable = unavailableDates?.has(dateStr) ?? false;

                return (
                  <div
                    key={dateStr}
                    className={`relative border-b border-gray-200 dark:border-gray-700 p-1 sm:p-2 ${CALENDAR_GRID_DAY_CELL_CLASSES} ${
                      isToday ? 'bg-blue-50 dark:bg-blue-900/30' : isPast ? 'bg-gray-50 dark:bg-gray-800' : isApprovedAbsence ? 'bg-rose-100 dark:bg-rose-900/30 border-l border-dashed border-rose-400' : isPendingAbsence ? 'bg-amber-50 dark:bg-amber-900/20 border-l border-dashed border-amber-400' : isAvailableSync ? 'bg-emerald-50/70 dark:bg-emerald-900/20' : isUnavailable ? 'bg-rose-50/80 dark:bg-rose-900/10' : 'bg-white dark:bg-gray-800'
                    } ${
                      isPast
                        ? 'opacity-60 cursor-not-allowed'
                        : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => {
                      if (onDateClickOpenAvailability) {
                        onDateClickOpenAvailability(dateStr);
                        return;
                      }
                      onDateChange?.(dateStr);
                      if (!isControlled) {
                        const dayMoment = day.clone();
                        setInternalSelectedDay(dayMoment);
                        setInternalViewMode('day');
                        handleMonthChange(dayMoment);
                      }
                    }}
                  >
                    {isApprovedAbsence && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" aria-label="Absence" title="Absence" />}
                    {isPendingAbsence && !isApprovedAbsence && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" aria-label="Pending absence" title="Pending approval" />}
                    {isUnavailable && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-400 dark:bg-rose-500" aria-label="Unavailable" title="Unavailable" />}
                    {isAvailableSync && !isApprovedAbsence && !isPendingAbsence && !isUnavailable && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" aria-label="Available" title="Available" />}
                    <div className="relative z-sidebar space-y-1">
                      {Array.from(sessionsByChild.entries()).map(([key, childSessions]) => {
                        const firstSession = childSessions[0];
                        const blockStyle = getSessionBlockInlineStyle(firstSession);
                        const uniqueActivities = Array.from(
                          new Set(childSessions.flatMap((s) => s.activities || [])),
                        );
                        const hasOngoing = childSessions.some((s) => s.isOngoing);
                        const hasUpcoming = childSessions.some((s) => s.isUpcoming);
                        const allPast = childSessions.every((s) => s.isPast);
                        const hasPendingConfirmation = childSessions.some((s) => s.trainerAssignmentStatus === PENDING_CONFIRMATION);

                        const isOngoing = hasOngoing;
                        const isPastChild = allPast && !hasOngoing && !hasUpcoming;
                        const sessionCount = childSessions.length;

                        const startTime = moment(firstSession.startTime, ['HH:mm', 'HH:mm:ss']).format(
                          'ha',
                        );
                        const activityDisplay =
                          uniqueActivities.length > 0
                            ? uniqueActivities.slice(0, 2).join(', ') +
                              (uniqueActivities.length > 2 ? '...' : '')
                            : 'Activity';

                        return (
                          <div
                            key={key}
                            onClick={(e) => handleSessionClick(e, firstSession)}
                            className={`
                              text-[10px] px-1 py-0.5 rounded truncate relative mb-0.5 transition-opacity text-gray-900 dark:text-gray-100
                              ${isPastChild ? 'opacity-50' : ''}
                              ${isOngoing ? 'ring-1 ring-green-500' : ''}
                              ${onSessionClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
                            `}
                            style={blockStyle}
                            title={`${firstSession.childName} - ${startTime}${
                              sessionCount > 1 ? ` (${sessionCount} session${sessionCount > 1 ? 's' : ''})` : ''
                            } - ${activityDisplay}${isPastChild ? ' - past' : isOngoing ? ' - live now' : ''}`}
                          >
                            <div className="flex items-center gap-0.5 flex-wrap">
                              {isOngoing && (
                                <span
                                  className="flex-shrink-0 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"
                                  title="Live now"
                                />
                              )}
                              {hasPendingConfirmation && (
                                <span className="px-0.5 py-0.25 bg-amber-500 text-white text-[8px] rounded font-medium flex-shrink-0" title="Click to confirm or decline">
                                  Confirm
                                </span>
                              )}
                              <span className="font-semibold truncate text-[10px]">
                                {firstSession.childName}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 mx-0.5">•</span>
                              <span className="text-gray-600 dark:text-gray-200 text-[9px]">{startTime}</span>
                            </div>
                            <div className="text-[9px] text-gray-700 dark:text-gray-200 truncate font-medium mt-0.5">
                              {activityDisplay}
                            </div>
                          </div>
                        );
                      })}

                      {daySessions.length === 0 && (
                        <div className="text-[10px] text-gray-400 dark:text-gray-300 text-center py-2">
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
        </div>
      )}

      {/* Month View - scroll horizontally on narrow screens */}
      {viewMode === 'month' && (
        <div className="overflow-x-auto min-w-0 -mx-1 px-1 sm:mx-0 sm:px-0" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        <BookingCalendar
          size="large"
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
          selectedDate={selectedDate}
          // Mark any date that has one or more sessions for dot indicators
          datesWithSessions={new Set(Array.from(sessionsByDate.keys()))}
          renderDayCell={(date, index) => {
            const dateStr = date.format('YYYY-MM-DD');
            const dateSessions = getDateSessions(date);
            const isTodayDate = calendarUtils.isToday(date);
            const isCurrentMonthDate = calendarUtils.isCurrentMonth(date, currentMonth);
            const isPastDate = date.isBefore(moment(), 'day');
            const isAvailable = availabilityMode && availabilityDates?.has(dateStr);
            // Only allow setting availability for dates at least 24 hours ahead (no same day, no past)
            const dayStart = date.clone().startOf('day');
            const isEditableForAvailability = availabilityMode && dayStart.isAfter(moment().add(24, 'hours'));

            // In availability mode: click day to toggle, or use dropdown (only for tomorrow and future)
            if (availabilityMode) {
              const handleCellClick = (e: React.MouseEvent) => {
                if ((e.target as HTMLElement).closest('select')) return;
                if (!isEditableForAvailability) return;
                onAvailabilitySet?.(dateStr, !isAvailable);
              };
              return (
                <div
                  key={index}
                  role={isEditableForAvailability ? 'button' : undefined}
                  tabIndex={isEditableForAvailability ? 0 : undefined}
                  onClick={handleCellClick}
                  onKeyDown={isEditableForAvailability ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAvailabilitySet?.(dateStr, !isAvailable); } } : undefined}
                  className={`
                    ${CALENDAR_GRID_DAY_CELL_CLASSES} border-r border-b border-gray-200 dark:border-gray-700 relative p-1 transition-colors
                    ${!isCurrentMonthDate ? 'bg-gray-50 dark:bg-gray-800 opacity-60' : 
                      !isEditableForAvailability ? 'bg-gray-50 dark:bg-gray-800/80' :
                      isAvailable ? 'bg-emerald-50 dark:bg-emerald-900/30' :
                      'bg-white dark:bg-gray-800'
                    }
                    ${isEditableForAvailability ? 'cursor-pointer hover:ring-1 hover:ring-emerald-400 dark:hover:ring-emerald-500' : ''}
                  `}
                  aria-label={isEditableForAvailability ? `${date.format('D MMM YYYY')}: ${isAvailable ? 'Available' : 'Not available'} (click to toggle)` : undefined}
                >
                  <div className="flex items-center justify-center mb-0.5 w-full">
                    {isTodayDate ? (
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-blue-600 text-white">
                        {date.format('D')}
                      </span>
                    ) : (
                      <span className={`text-xs font-medium ${!isCurrentMonthDate ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {date.format('D')}
                      </span>
                    )}
                  </div>
                  {isEditableForAvailability ? (
                    <select
                      value={isAvailable ? 'available' : 'not_available'}
                      onChange={(e) => {
                        const v = e.target.value;
                        onAvailabilitySet?.(dateStr, v === 'available');
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-[10px] rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-0.5 px-1 cursor-pointer focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      aria-label={`Set availability for ${date.format('D MMM YYYY')}`}
                    >
                      <option value="not_available">Not available</option>
                      <option value="available">Available</option>
                    </select>
                  ) : (
                    <div className="text-[10px] text-center text-gray-400 dark:text-gray-500 px-0.5">
                      {isPastDate ? 'Past' : dayStart.isAfter(moment(), 'day') ? 'Within 24h' : 'Today'}
                    </div>
                  )}
                </div>
              );
            }

            // Availability sync (matches My availability panel): available, unavailable, absence
            const isAvailableSync = !availabilityMode && availabilityDates?.has(dateStr);
            const isApprovedAbsence = !availabilityMode && approvedAbsenceDates?.has(dateStr);
            const isPendingAbsence = !availabilityMode && pendingAbsenceDates?.has(dateStr);
            const isUnavailable = !availabilityMode && unavailableDates?.has(dateStr);

            return (
              <div
                key={index}
                onClick={() => handleDateClick(date, dateSessions)}
                className={`
                  ${CALENDAR_GRID_DAY_CELL_CLASSES} border-r border-b border-gray-200 dark:border-gray-700 relative p-1 transition-colors
                  ${!isCurrentMonthDate ? 'bg-gray-50 dark:bg-gray-800' : 
                    isTodayDate ? 'bg-blue-50 dark:bg-blue-900/30' :
                    isApprovedAbsence ? 'bg-rose-100 dark:bg-rose-900/30 border border-dashed border-rose-400 dark:border-rose-500' :
                    isPendingAbsence ? 'bg-amber-50 dark:bg-amber-900/20 border border-dashed border-amber-400 dark:border-amber-500' :
                    isAvailableSync ? 'bg-emerald-50/70 dark:bg-emerald-900/20' :
                    isUnavailable ? 'bg-rose-50/80 dark:bg-rose-900/10' :
                    'bg-white dark:bg-gray-800'
                  }
                  ${
                    isPastDate && dateSessions.length === 0
                      ? 'opacity-60 cursor-not-allowed'
                      : dateSessions.length > 0 || onDateClickOpenAvailability
                        ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'
                        : ''
                  }
                `}
              >
                {/* Single dot per date: availability/absence only when no sessions; when date has sessions we show session-status dot under the number only */}
                {dateSessions.length === 0 && (
                  <>
                    {isApprovedAbsence && (
                      <span className="absolute top-0.5 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" aria-label="Absence" title="Absence" />
                    )}
                    {isPendingAbsence && !isApprovedAbsence && (
                      <span className="absolute top-0.5 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" aria-label="Pending absence" title="Pending approval" />
                    )}
                    {isUnavailable && (
                      <span className="absolute top-0.5 right-1 w-1.5 h-1.5 rounded-full bg-rose-400 dark:bg-rose-500" aria-label="Unavailable" title="Unavailable" />
                    )}
                    {isAvailableSync && !isApprovedAbsence && !isPendingAbsence && !isUnavailable && (
                      <span className="absolute top-0.5 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" aria-label="Available" title="Available" />
                    )}
                  </>
                )}
                {/* Date number */}
                <div className="flex flex-col items-center gap-0.5 w-full">
                  <div className="flex items-center justify-center w-full">
                    {isTodayDate ? (
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-blue-600 text-white">
                        {date.format('D')}
                      </span>
                    ) : (
                      <span className={`
                        text-xs font-medium
                        ${!isCurrentMonthDate ? 'text-gray-400' : 'text-gray-700'}
                      `}>
                        {date.format('D')}
                      </span>
                    )}
                  </div>
                  {/* Session indicator dot under date (reference: green/orange dot = has session / status) */}
                  {dateSessions.length > 0 && (() => {
                    const hasLive = dateSessions.some((s) => s.isOngoing);
                    const hasUpcoming = dateSessions.some((s) => s.isUpcoming);
                    const hasPendingConfirmation = dateSessions.some((s) => s.trainerAssignmentStatus === PENDING_CONFIRMATION);
                    const allPast = dateSessions.every((s) => s.isPast);
                    const hasCancelled = dateSessions.some((s) => s.status === 'cancelled');
                    let dotColor = 'bg-slate-400'; // past
                    if (hasCancelled && dateSessions.every((s) => s.status === 'cancelled')) dotColor = 'bg-red-500';
                    else if (hasLive) dotColor = 'bg-green-500';
                    else if (hasPendingConfirmation) dotColor = 'bg-amber-500';
                    else if (hasUpcoming) dotColor = 'bg-emerald-500';
                    else if (allPast) dotColor = 'bg-slate-400';
                    return (
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`}
                        aria-label="Has sessions"
                        title={dateSessions.length === 1 ? '1 session' : `${dateSessions.length} sessions`}
                      />
                    );
                  })()}
                </div>

                {/* Sessions for this date */}
                <div className="space-y-0.5">
                  {(() => {
                    // Group sessions by child
                    const sessionsByChild = new Map<string, TrainerSession[]>();
                    dateSessions.forEach((session) => {
                      const key = `${session.childId}-${session.childName}`;
                      const existing = sessionsByChild.get(key) || [];
                      existing.push(session);
                      sessionsByChild.set(key, existing);
                    });

                    const childGroups = Array.from(sessionsByChild.entries());
                    const maxToShow = 3;
                    const displayedGroups = childGroups.slice(0, maxToShow);
                    const hasMore = childGroups.length > maxToShow;

                    return (
                      <>
                        {displayedGroups.map(([key, childSessions]) => {
                          const firstSession = childSessions[0];
                          const statusStyle = getSessionStatusStyle(firstSession);
                          const childColor = getChildColor(firstSession.childId);
                          const uniqueActivities = Array.from(
                            new Set(
                              childSessions.flatMap((s) => s.activities || []),
                            ),
                          );
                          
                          const hasOngoing = childSessions.some(s => s.isOngoing);
                          const hasUpcoming = childSessions.some(s => s.isUpcoming);
                          const allPast = childSessions.every(s => s.isPast);
                          
                          const isOngoing = hasOngoing;
                          const isPast = allPast && !hasOngoing && !hasUpcoming;
                          const sessionCount = childSessions.length;

                          const startTime = moment(firstSession.startTime, 'HH:mm').format('ha');
                          const activityDisplay = uniqueActivities.length > 0 
                            ? uniqueActivities.slice(0, 2).join(', ') + (uniqueActivities.length > 2 ? '...' : '')
                            : 'Activity';

                          return (
                            <div
                              key={key}
                              onClick={(e) => handleSessionClick(e, firstSession)}
                              className={`
                                text-[10px] px-1 py-0.5 rounded truncate relative mb-0.5 transition-opacity border-l-4
                                ${isPast ? 'opacity-50' : ''}
                                ${isOngoing ? 'ring-1 ring-green-500' : ''}
                                ${onSessionClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
                              `}
                              style={{
                                borderLeftColor: childColor,
                                backgroundColor: `${childColor}20`,
                              }}
                              title={`${firstSession.childName} - ${startTime}${sessionCount > 1 ? ` (${sessionCount} session${sessionCount > 1 ? 's' : ''})` : ''} - ${activityDisplay}${isPast ? ' - past' : isOngoing ? ' - live now' : ''}`}
                            >
                              <div className="flex items-center gap-0.5">
                                <span
                                  className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                                  aria-hidden
                                />
                                <span className="font-semibold text-gray-900 dark:text-gray-100 truncate text-[10px]">
                                  {firstSession.childName}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 mx-0.5">•</span>
                                <span className="text-gray-600 dark:text-gray-300 text-[9px]">{startTime}</span>
                              </div>
                              <div className="text-[9px] text-gray-700 dark:text-gray-200 truncate font-medium mt-0.5">
                                {activityDisplay}
                              </div>
                              {firstSession.status === 'cancelled' && (
                                <div className="text-[9px] font-medium text-red-600 dark:text-red-400 mt-0.5">
                                  CANCELLED – Charge / Pay
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {hasMore && (
                          <div className="text-[9px] text-gray-500 font-medium px-1">
                            +{childGroups.length - maxToShow} more
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
        </div>
      )}
    </div>
  );
}
