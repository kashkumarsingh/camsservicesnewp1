'use client';

import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import moment, { Moment } from 'moment';
import { Calendar, User, Plus, ChevronDown, ChevronUp, Settings, LogOut, HelpCircle, Clock as ClockIcon } from 'lucide-react';
import { BookingCalendar } from '@/components/ui/Calendar';
import type { TrainerBooking } from '@/core/application/trainer/types';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';

interface TrainerDashboardLeftSidebarProps {
  /** Current bookings */
  bookings: TrainerBooking[];
  /** Currently selected date on the main calendar */
  selectedDate?: string;
  /** Current month displayed on main calendar (for sync) - YYYY-MM format */
  currentMonth?: string;
  /** Dates in the current week range (for highlighting in mini calendar Week view) */
  datesInWeekRange?: Set<string>;
  /** Callback when user clicks a date on mini calendar */
  onDateSelect?: (date: string) => void;
  /** Callback when mini calendar month changes (for sync with main calendar) */
  onMonthChange?: (month: string) => void;
  /** Callback to open the add session modal */
  onAddSession?: () => void;
  /** Currently visible trainee IDs (for filtering) */
  visibleTraineeIds?: number[];
  /** Callback when user toggles trainee visibility */
  onToggleTraineeVisibility?: (traineeId: number) => void;
  /** Open trainer settings on a specific tab (e.g. profile, qualifications) */
  onOpenSettings?: (tab: 'profile' | 'qualifications') => void;
  /** Scroll to the weekly hours / capacity card on the right */
  onScrollToWeeklyHours?: () => void;
}

/**
 * Trainer Dashboard Left Sidebar Component
 * 
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Left sidebar with mini calendar, upcoming sessions, my trainees, and quick actions
 * Matches specification: 25% width, mini calendar, upcoming sessions list, trainee checkboxes, quick actions
 */
export default function TrainerDashboardLeftSidebar({
  bookings,
  selectedDate,
  currentMonth,
  datesInWeekRange,
  onDateSelect,
  onMonthChange,
  onAddSession,
  visibleTraineeIds = [],
  onToggleTraineeVisibility,
  onOpenSettings,
  onScrollToWeeklyHours,
}: TrainerDashboardLeftSidebarProps) {
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [showTrainees, setShowTrainees] = useState(true);

  // Actions dropdown (mirrors parents DashboardLeftSidebar)
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const actionsDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionsDropdownRef.current &&
        !actionsDropdownRef.current.contains(event.target as Node)
      ) {
        setShowActionsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Use controlled month from parent, fallback to current month
  const miniCalendarMonth = useMemo(() => {
    return currentMonth ? moment(currentMonth, 'YYYY-MM') : moment();
  }, [currentMonth]);

  // Handle month change for mini calendar
  const handleMiniCalendarMonthChange = useCallback((month: Moment) => {
    onMonthChange?.(month.format('YYYY-MM'));
  }, [onMonthChange]);

  // Extract all unique trainees (children) from bookings
  const trainees = useMemo(() => {
    const traineeMap = new Map<number, { id: number; name: string; upcomingCount: number }>();
    
    bookings.forEach((booking) => {
      booking.participants?.forEach((participant) => {
        const traineeId = participant.childId ?? participant.child_id;
        if (traineeId != null && !traineeMap.has(traineeId)) {
          traineeMap.set(traineeId, {
            id: traineeId,
            name: participant.name,
            upcomingCount: 0,
          });
        }
      });
    });

    // Count upcoming sessions per trainee
    const now = moment();
    bookings.forEach((booking) => {
      booking.schedules?.forEach((schedule) => {
        if (schedule.status !== 'cancelled') {
          const sessionDate = moment(`${schedule.date} ${schedule.start_time}`, 'YYYY-MM-DD HH:mm');
          if (sessionDate.isAfter(now)) {
            booking.participants?.forEach((participant) => {
              const id = participant.childId ?? participant.child_id;
              if (id != null) {
                const trainee = traineeMap.get(id);
                if (trainee) {
                  trainee.upcomingCount++;
                }
              }
            });
          }
        }
      });
    });

    return Array.from(traineeMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [bookings]);

  // Get dates that have upcoming sessions (for mini calendar indicators)
  const { datesWithSessions, datesWithPastSessions } = useMemo(() => {
    const upcomingDates = new Set<string>();
    const pastDates = new Set<string>();
    const today = moment().startOf('day');
    
    bookings.forEach((booking) => {
      booking.schedules?.forEach((schedule) => {
        if (schedule.status !== 'cancelled') {
          const sessionDate = moment(schedule.date).startOf('day');
          if (sessionDate.isSameOrAfter(today)) {
            upcomingDates.add(schedule.date);
          } else {
            pastDates.add(schedule.date);
          }
        }
      });
    });
    
    return { datesWithSessions: upcomingDates, datesWithPastSessions: pastDates };
  }, [bookings]);

  // Get upcoming sessions (next 7 days)
  const upcomingSessions = useMemo(() => {
    const now = moment();
    const nextWeek = moment().add(7, 'days');
    const sessions: Array<{
      date: string;
      startTime: string;
      endTime: string;
      traineeName: string;
      traineeId: number;
      activities: string[];
      bookingReference: string;
    }> = [];

    bookings.forEach((booking) => {
      booking.schedules?.forEach((schedule) => {
        if (schedule.status === 'cancelled') return;
        
        const sessionDate = moment(`${schedule.date} ${schedule.start_time}`, 'YYYY-MM-DD HH:mm');
        if (sessionDate.isAfter(now) && sessionDate.isBefore(nextWeek)) {
          const traineeName = booking.participants?.[0]?.name || 'Trainee';
          const traineeId = (booking.participants?.[0]?.childId ?? booking.participants?.[0]?.child_id) ?? 0;

          // Respect trainee visibility filter: if specific trainees are
          // selected in "My Trainees", only show upcoming sessions for those
          // trainees. When no filter is active, show all.
          if (
            Array.isArray(visibleTraineeIds) &&
            visibleTraineeIds.length > 0 &&
            (!traineeId || !visibleTraineeIds.includes(traineeId))
          ) {
            return;
          }
          const activities = schedule.activities?.map((a: { name: string }) => a.name) || [];
          
          sessions.push({
            date: schedule.date,
            startTime: schedule.start_time ?? schedule.startTime ?? '',
            endTime: schedule.end_time ?? schedule.endTime ?? '',
            traineeName,
            traineeId,
            activities,
            bookingReference: booking.reference,
          });
        }
      });
    });

    return sessions.sort((a, b) => {
      const dateA = moment(`${a.date} ${a.startTime}`, 'YYYY-MM-DD HH:mm');
      const dateB = moment(`${b.date} ${b.startTime}`, 'YYYY-MM-DD HH:mm');
      return dateA.diff(dateB);
    }).slice(0, 5); // Show next 5 sessions
  }, [bookings, visibleTraineeIds]);

  // Color palette for session types (matching specification)
  const sessionTypeColors: Record<string, string> = {
    'strength': '#4A90E2', // Blue
    'cardio': '#7ED321', // Green
    'hiit': '#F5A623', // Orange
    'flexibility': '#9013FE', // Purple
    'nutrition': '#FFD700', // Yellow
    'assessment': '#D0021B', // Red
  };

  const getSessionTypeColor = (activities: string[]): string => {
    // Try to match activity name to session type
    const activityName = activities[0]?.toLowerCase() || '';
    for (const [type, color] of Object.entries(sessionTypeColors)) {
      if (activityName.includes(type)) {
        return color;
      }
    }
    return '#4A90E2'; // Default blue
  };

  return (
    <div className="w-full lg:w-64 xl:w-72 space-y-4">
      {/* Actions dropdown (Google Calendar-style, above mini calendar) */}
      <div className="relative" ref={actionsDropdownRef}>
        <button
          type="button"
          onClick={() => setShowActionsDropdown((prev) => !prev)}
          className="w-full flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-150 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <Plus size={18} className="text-gcal-primary" />
          <span>Actions</span>
          <ChevronDown
            size={16}
            className={`text-slate-500 transition-transform duration-200 dark:text-slate-400 ${
              showActionsDropdown ? 'rotate-180' : ''
            }`}
          />
        </button>
        {showActionsDropdown && (
          <div className="absolute top-full left-0 right-0 z-dropdown mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
            {/* View This Week's Hours */}
            <button
              type="button"
              className="w-full flex items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors duration-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
              onClick={() => {
                setShowActionsDropdown(false);
                onScrollToWeeklyHours?.();
              }}
            >
              <ClockIcon size={18} className="text-slate-600 dark:text-slate-300" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">View this week&apos;s hours</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Booked hours, capacity, and any over-capacity
                </p>
              </div>
            </button>

            {/* Manage Profile */}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              onClick={() => {
                setShowActionsDropdown(false);
                onOpenSettings?.('profile');
              }}
            >
              <User size={18} className="text-slate-600 dark:text-slate-300" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Manage profile</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update your trainer details and service area
                </p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Mini Calendar Widget */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
        <BookingCalendar
          size="small"
          currentMonth={miniCalendarMonth}
          onMonthChange={handleMiniCalendarMonthChange}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          datesWithSessions={datesWithSessions}
          datesWithPastSessions={datesWithPastSessions}
          datesInWeekRange={datesInWeekRange}
          showTodayButton={false}
        />
      </div>

      {/* Upcoming Sessions Section */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setShowUpcoming(!showUpcoming)}
          className="flex w-full items-center justify-between border-b border-slate-200 px-4 py-3 transition-colors duration-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
          aria-label={showUpcoming ? 'Hide upcoming sessions' : 'Show upcoming sessions'}
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <Calendar size={16} className="text-slate-600 dark:text-slate-400" />
            Upcoming Sessions
            <span
              className="ml-0.5 cursor-help text-slate-400 hover:text-slate-600 dark:text-slate-400"
              title="Shows your next 5 assigned sessions. Click a session to jump to that day in the calendar."
              onClick={(e) => e.stopPropagation()}
            >
              <HelpCircle size={12} />
            </span>
          </span>
          {showUpcoming ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </button>
        
        {showUpcoming && (
          <div className="max-h-[300px] space-y-3 overflow-y-auto px-4 py-3">
            {upcomingSessions.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">No upcoming sessions</p>
            ) : (
              upcomingSessions.map((session, index) => {
                const sessionDate = moment(`${session.date} ${session.startTime}`, 'YYYY-MM-DD HH:mm');
                const isToday = sessionDate.isSame(moment(), 'day');
                const isTomorrow = sessionDate.isSame(moment().add(1, 'day'), 'day');
                const sessionColor = getSessionTypeColor(session.activities);
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => onDateSelect?.(session.date)}
                    title={`${session.traineeName} – ${sessionDate.format('dddd, D MMMM YYYY')}\nTime: ${moment(session.startTime, 'HH:mm').format('h:mm A')} – ${moment(session.endTime, 'HH:mm').format('h:mm A')}${session.activities[0] ? `\nActivity: ${session.activities[0]}` : ''}\n\nClick to jump to this day in the calendar.`}
                    className="group flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors duration-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    {/* Date Badge */}
                    <div className="min-w-[50px] flex-shrink-0 text-center">
                      <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {sessionDate.format('D')}
                      </div>
                      <div className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400">
                        {sessionDate.format('MMM')}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {sessionDate.format('ddd')}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <div
                          className="h-2 w-2 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: sessionColor }}
                        />
                        <p className="truncate text-xs font-medium text-slate-900 dark:text-slate-100">
                          {session.traineeName}
                        </p>
                      </div>
                      <p className="mb-1 flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                        <ClockIcon size={10} className="text-slate-500 dark:text-slate-400" />
                        <span>
                          {moment(session.startTime, 'HH:mm').format('h:mm A')} - {moment(session.endTime, 'HH:mm').format('h:mm A')}
                        </span>
                      </p>
                      {session.activities.length > 0 && (
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {session.activities[0]}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : sessionDate.format('MMM D')}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* My Trainees Section */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setShowTrainees(!showTrainees)}
          className="flex w-full items-center justify-between border-b border-slate-200 px-4 py-3 transition-colors duration-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
          aria-label={showTrainees ? 'Hide trainees list' : 'Show trainees list'}
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <User size={16} className="text-slate-600 dark:text-slate-400" />
            My Trainees
          </span>
          {showTrainees ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </button>
        
        {showTrainees && (
          <div className="max-h-[300px] space-y-2 overflow-y-auto px-4 py-3">
            {trainees.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">{EMPTY_STATE.NO_TRAINEES_YET.title}</p>
            ) : (
              trainees.map((trainee) => {
                const isVisible =
                  visibleTraineeIds.length === 0 || visibleTraineeIds.includes(trainee.id);

                const initials = trainee.name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part.charAt(0).toUpperCase())
                  .join('');

                return (
                  <label
                    key={trainee.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors duration-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => onToggleTraineeVisibility?.(trainee.id)}
                      className="h-4 w-4 rounded border-slate-300 text-gcal-primary focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    />
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gcal-primary text-xs font-medium text-white">
                        {initials || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center gap-1">
                          <p className="truncate text-xs font-medium text-slate-900 dark:text-slate-100">
                            {trainee.name}
                          </p>
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        </div>
                        {trainee.upcomingCount > 0 && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {trainee.upcomingCount} upcoming session
                            {trainee.upcomingCount !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>

    </div>
  );
}
