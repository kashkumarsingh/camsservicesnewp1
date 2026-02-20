'use client';

import React, { useMemo } from 'react';
import moment, { Moment } from 'moment';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarGrid } from './useCalendarGrid';
import { isDateBookable, getDateBookingStatus } from '@/utils/bookingCutoffRules';

export interface BookingCalendarProps {
  /** Size of the calendar: 'small' for mini calendar, 'large' for main calendar */
  size: 'small' | 'large';
  /** Currently selected date (YYYY-MM-DD format) */
  selectedDate?: string;
  /** Current month being displayed (Moment object) */
  currentMonth: Moment;
  /** Callback when month changes */
  onMonthChange: (month: Moment) => void;
  /** Callback when a date is clicked */
  onDateSelect?: (date: string) => void; // YYYY-MM-DD format
  /** Called when user clicks an unbookable date (e.g. today, tomorrow after 6 PM). Use for toast. */
  onUnavailableDateClick?: (dateStr: string, reason?: string) => void;
  /** Set of dates that have upcoming sessions (for blue indicator dots) */
  datesWithSessions?: Set<string>; // YYYY-MM-DD format
  /** Set of dates that have past sessions (for gray indicator dots) */
  datesWithPastSessions?: Set<string>; // YYYY-MM-DD format
  /** Set of dates in the current week range (for highlighting week view in mini calendar) */
  datesInWeekRange?: Set<string>; // YYYY-MM-DD format
  /** Optional className for the container */
  className?: string;
  /** Whether to show "Today" button (for small calendar) */
  showTodayButton?: boolean;
  /** Custom render function for day cells (for large calendar with complex content) */
  renderDayCell?: (date: Moment, index: number) => React.ReactNode;
  /** When set, mini calendar is in "availability" mode: show these dates as available and toggle on click */
  datesWithAvailability?: Set<string>;
  /** When set, clicking a date in the mini calendar toggles it as available (single/multi select) */
  onAvailabilityToggle?: (date: string) => void;
}

/**
 * BookingCalendar Component
 * 
 * Reusable calendar component that supports both mini (small) and main (large) calendar views.
 * Consolidates calendar logic to avoid syncing issues between separate components.
 * 
 * Features:
 * - Small size: Compact mini calendar for sidebars (like DashboardLeftSidebar)
 * - Large size: Full-featured calendar for main views (like ChildrenActivitiesCalendar)
 * - Session indicators (dots on dates with sessions)
 * - Month navigation
 * - Date selection
 * - Responsive design
 * 
 * Usage:
 * ```tsx
 * // Mini calendar
 * <BookingCalendar
 *   size="small"
 *   currentMonth={currentMonth}
 *   onMonthChange={handleMonthChange}
 *   selectedDate={selectedDate}
 *   onDateSelect={handleDateSelect}
 *   datesWithSessions={datesWithSessions}
 * />
 * 
 * // Main calendar
 * <BookingCalendar
 *   size="large"
 *   currentMonth={currentMonth}
 *   onMonthChange={handleMonthChange}
 *   selectedDate={selectedDate}
 *   onDateSelect={handleDateSelect}
 *   datesWithSessions={datesWithSessions}
 *   renderDayCell={renderCustomDayCell}
 * />
 * ```
 */
export default function BookingCalendar({
  size,
  selectedDate,
  currentMonth,
  onMonthChange,
  onDateSelect,
  onUnavailableDateClick,
  datesWithSessions = new Set(),
  datesWithPastSessions = new Set(),
  datesInWeekRange = new Set(),
  className = '',
  showTodayButton = false,
  renderDayCell,
  datesWithAvailability,
  onAvailabilityToggle,
}: BookingCalendarProps) {
  const calendarDays = useCalendarGrid(currentMonth);

  const handlePrevMonth = () => {
    onMonthChange(currentMonth.clone().subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    onMonthChange(currentMonth.clone().add(1, 'month'));
  };

  const handleToday = () => {
    const now = moment();
    onMonthChange(now);
    const todayStr = now.format('YYYY-MM-DD');
    // Same rule as mini calendar: only select today if it's bookable (it never is; tomorrow only until 6 PM)
    if (size === 'small' && !isDateBookable(todayStr, now)) {
      onUnavailableDateClick?.(todayStr, getDateBookingStatus(todayStr, now).reason);
      return;
    }
    onDateSelect?.(todayStr);
  };

  // Generate day data for small calendar (includes isBookable for mini calendar rule)
  const dayData = useMemo(() => {
    // Find week range start and end dates for range indicator
    const weekRangeDatesArray = Array.from(datesInWeekRange).sort();
    const weekRangeStart = weekRangeDatesArray.length > 0 ? weekRangeDatesArray[0] : null;
    const weekRangeEnd = weekRangeDatesArray.length > 0 ? weekRangeDatesArray[weekRangeDatesArray.length - 1] : null;

    const today = moment().startOf('day');

    return calendarDays.map((date) => {
      const dateStr = date.format('YYYY-MM-DD');
      const isInWeekRange = datesInWeekRange.has(dateStr);
      const isWeekRangeStart = dateStr === weekRangeStart;
      const isWeekRangeEnd = dateStr === weekRangeEnd;
      const isWeekRangeMiddle = isInWeekRange && !isWeekRangeStart && !isWeekRangeEnd;
      const isPast = date.isBefore(today, 'day');
      const isBookable = isDateBookable(dateStr);

      return {
        date,
        isCurrentMonth: date.month() === currentMonth.month(),
        isToday: date.isSame(today, 'day'),
        // Past dates: non-interactive unless they have a past session (so parents can view past bookings)
        isPast,
        isBookable,
        isSelected: selectedDate ? date.isSame(moment(selectedDate), 'day') : false,
        isInWeekRange,
        isWeekRangeStart,
        isWeekRangeEnd,
        isWeekRangeMiddle,
        hasSession: datesWithSessions.has(dateStr),
        hasPastSession: datesWithPastSessions.has(dateStr),
        hasAvailability: datesWithAvailability?.has(dateStr) ?? false,
      };
    });
  }, [calendarDays, currentMonth, selectedDate, datesInWeekRange, datesWithSessions, datesWithPastSessions, datesWithAvailability]);

  // Small calendar (mini calendar for sidebar)
  if (size === 'small') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
        {/* Month Navigation */}
        <div className="px-3 py-2 flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
          {showTodayButton ? (
            <button
              onClick={handleToday}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
            >
              {currentMonth.format('MMMM YYYY')}
            </button>
          ) : (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {currentMonth.format('MMMM YYYY')}
            </span>
          )}
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 px-2 pb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 px-2 pb-2" style={{ gap: 0 }}>
          {dayData.map((day, i) => {
            // Determine if this day is at the start/end of a row for range indicator styling
            const prevDay = i > 0 ? dayData[i - 1] : null;
            const nextDay = i < dayData.length - 1 ? dayData[i + 1] : null;
            const isRangeStart = day.isWeekRangeStart || (day.isInWeekRange && (!prevDay || !prevDay.isInWeekRange));
            const isRangeEnd = day.isWeekRangeEnd || (day.isInWeekRange && (!nextDay || !nextDay.isInWeekRange));
            const isRangeMiddle = day.isInWeekRange && !isRangeStart && !isRangeEnd;

            // Build base classes - ensure no gaps for continuous background
            let baseClasses = 'relative w-8 h-8 flex items-center justify-center text-xs transition-colors';
            
            // Remove mx-auto to prevent horizontal gaps that break continuity
            // Use negative margins to ensure background connects seamlessly
            if (isRangeMiddle) {
              baseClasses += ' -mx-px';
            } else if (isRangeStart) {
              baseClasses += ' -mr-px';
            } else if (isRangeEnd) {
              baseClasses += ' -ml-px';
            } else {
              baseClasses += ' mx-auto';
            }
            
            // Text colour (dark mode: blue/yellow families readable on dark bg)
            if (!day.isCurrentMonth) {
              baseClasses += ' text-gray-300 dark:text-gray-500';
            } else if (day.isInWeekRange && !day.isToday && !day.isSelected) {
              baseClasses += ' text-blue-700 dark:text-blue-300';
            } else if (day.isToday || day.isSelected) {
              baseClasses += ' text-white';
            } else {
              baseClasses += ' text-gray-700 dark:text-gray-300';
            }

            // Background and shape - prioritize range indicator for continuous background (dark: blue family)
            if (day.isInWeekRange) {
              if (day.isToday && !day.isSelected) {
                // Today in range - use darker blue
                if (isRangeStart) {
                  baseClasses += ' bg-blue-600 dark:bg-blue-500 rounded-l-full';
                } else if (isRangeEnd) {
                  baseClasses += ' bg-blue-600 dark:bg-blue-500 rounded-r-full';
                } else {
                  baseClasses += ' bg-blue-600 dark:bg-blue-500';
                }
                baseClasses += ' font-semibold';
              } else if (!day.isSelected) {
                // Range indicator - continuous background with no gaps
                if (isRangeStart) {
                  baseClasses += ' bg-blue-100 dark:bg-blue-900/50 rounded-l-full';
                } else if (isRangeEnd) {
                  baseClasses += ' bg-blue-100 dark:bg-blue-900/50 rounded-r-full';
                } else {
                  baseClasses += ' bg-blue-100 dark:bg-blue-900/50';
                }
                baseClasses += ' font-medium';
              }
            } else {
              // Not in range - normal styling
              if (day.isToday && !day.isSelected) {
                baseClasses += ' bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-full';
              } else if (day.isSelected) {
                baseClasses += ' bg-gray-200 dark:bg-gray-500 text-gray-900 dark:text-white font-medium rounded-full';
              } else {
                baseClasses += ' rounded-full';
              }
            }

            // In availability mode: any date is clickable to toggle. Otherwise: bookable or past with session.
            const availabilityMode = typeof onAvailabilityToggle === 'function';
            const canSelect = availabilityMode
              ? true
              : ((!day.isPast && day.isBookable) || (day.isPast && day.hasPastSession));
            if (!canSelect) {
              baseClasses += ' cursor-not-allowed';
            } else {
              baseClasses += ' cursor-pointer';
              if (!day.isInWeekRange && !day.isToday && !day.isSelected && day.isCurrentMonth) {
                baseClasses += ' hover:bg-gray-100 dark:hover:bg-gray-700';
              } else if (day.isInWeekRange && !day.isSelected && !day.isToday) {
                baseClasses += ' hover:bg-blue-200 dark:hover:bg-blue-800';
              }
              if (day.isPast && day.hasPastSession && !availabilityMode) {
                baseClasses += ' hover:bg-gray-100 dark:hover:bg-gray-700';
              }
              if (availabilityMode) {
                baseClasses += ' hover:bg-emerald-100 dark:hover:bg-emerald-900/40';
              }
            }

            const titleText = availabilityMode
              ? (day.hasAvailability ? 'Click to mark unavailable' : 'Click to mark available')
              : day.isPast && day.hasPastSession
                ? 'View past sessions on this day'
                : !canSelect && !day.isPast
                  ? 'This date is not available for new bookings'
                  : undefined;

            return (
              <button
                key={i}
                onClick={() => {
                  if (availabilityMode) {
                    onAvailabilityToggle?.(day.date.format('YYYY-MM-DD'));
                    return;
                  }
                  if (day.isPast) {
                    if (day.hasPastSession) {
                      onDateSelect?.(day.date.format('YYYY-MM-DD'));
                    }
                    return;
                  }
                  if (!day.isBookable) {
                    const dateStr = day.date.format('YYYY-MM-DD');
                    const status = getDateBookingStatus(dateStr);
                    onUnavailableDateClick?.(dateStr, status.reason);
                    return;
                  }
                  onDateSelect?.(day.date.format('YYYY-MM-DD'));
                }}
                className={baseClasses}
                aria-disabled={!canSelect}
                title={titleText}
              >
                {day.date.date()}
                {/* Availability indicator (green dot when in availability mode or when showing availability) */}
                {day.hasAvailability && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full ring-1 ring-white/30 dark:ring-gray-800/50" aria-hidden />
                )}
                {/* Session indicator dots (when not in availability mode) */}
                {!availabilityMode && day.hasSession && !day.isSelected && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 dark:bg-blue-300 rounded-full ring-1 ring-white/30 dark:ring-gray-800/50" />
                )}
                {!availabilityMode && day.hasPastSession && !day.isSelected && !day.hasSession && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gray-400 dark:bg-gray-400 rounded-full ring-1 ring-white/30 dark:ring-gray-800/50" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Large calendar (main calendar for dashboard)
  // If custom renderDayCell is provided, use it; otherwise use default rendering
  if (renderDayCell) {
    return (
      <div className={className}>
        {/* Month Header with Navigation */}
        <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 sm:p-2 md:p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
          </button>
          
          <button
            type="button"
            onClick={handleToday}
            className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-navy-blue dark:text-gray-100 px-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Go to current month"
          >
            {currentMonth.format('MMMM YYYY')}
          </button>
          
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 sm:p-2 md:p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 py-1 sm:py-1.5 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid with Custom Day Cells – role="grid" for screen readers */}
        <div
          className="grid grid-cols-7 border-l border-t border-gray-200 dark:border-gray-700"
          role="grid"
          aria-label="Calendar month view"
        >
          {calendarDays.map((date, index) => (
            <React.Fragment key={`day-${date.format('YYYY-MM-DD')}-${index}`}>
              {renderDayCell(date, index)}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // Default large calendar (simple day cells)
  return (
    <div className={className}>
      {/* Month Header with Navigation */}
      <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 sm:p-2 md:p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
        </button>
        
        <button
          type="button"
          onClick={handleToday}
          className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-navy-blue dark:text-gray-100 px-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          aria-label="Go to current month"
        >
          {currentMonth.format('MMMM YYYY')}
        </button>
        
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 sm:p-2 md:p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 py-1 sm:py-1.5 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid - Default Day Cells */}
      <div className="grid grid-cols-7 border-l border-t border-gray-200 dark:border-gray-700">
        {dayData.map((day, index) => (
          <button
            key={index}
            onClick={() => onDateSelect?.(day.date.format('YYYY-MM-DD'))}
            className={`
              min-h-[60px] sm:min-h-[70px] md:min-h-[100px] border-r border-b border-gray-200 dark:border-gray-700 p-1 sm:p-1.5
              ${!day.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
              ${day.isToday ? 'bg-blue-50 dark:bg-blue-900/30 border-l-2 border-l-blue-400 dark:border-l-blue-500' : ''}
              ${day.isSelected ? 'bg-blue-100 dark:bg-blue-900/50 border-l-2 border-l-blue-500 dark:border-l-blue-400' : ''}
              ${day.isCurrentMonth && !day.isToday && !day.isSelected ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700' : ''}
            `}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs sm:text-sm ${!day.isCurrentMonth ? 'text-gray-300 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                {day.date.date()}
              </span>
              {day.hasSession && (
                <span className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
