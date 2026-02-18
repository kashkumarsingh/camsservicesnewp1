'use client';

import React, { useState, useMemo } from 'react';
import moment, { Moment } from 'moment';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Represents a date with optional metadata
 */
export interface CalendarDate {
  date: string; // YYYY-MM-DD format
  label?: string; // Optional label/badge (e.g., "3h", "Booked")
  metadata?: any; // Any additional data
}

export interface HorizontalCalendarProps {
  /**
   * Currently selected date (YYYY-MM-DD)
   */
  selectedDate: string;
  
  /**
   * Dates with special styling (e.g., booked sessions)
   */
  highlightedDates?: CalendarDate[];
  
  /**
   * Dates that should be disabled/grayed out
   */
  disabledDates?: string[];
  
  /**
   * Callback when a date is clicked
   */
  onDateClick?: (date: string, metadata?: any) => void;
  
  /**
   * Initial week to display (defaults to selected date's week)
   */
  initialWeekStart?: Moment;
  
  /**
   * Minimum selectable date
   */
  minDate?: Moment;
  
  /**
   * Maximum selectable date
   */
  maxDate?: Moment;
  
  /**
   * Style variant
   * @default 'default'
   */
  variant?: 'default' | 'compact' | 'large';
  
  /**
   * Color scheme for highlighted dates
   * @default 'orange'
   */
  highlightColor?: 'orange' | 'blue' | 'green' | 'purple' | 'red';
  
  /**
   * Whether to show navigation arrows
   * @default true
   */
  showNavigation?: boolean;
  
  /**
   * Whether to show week range label
   * @default true
   */
  showWeekLabel?: boolean;
  
  /**
   * Custom class name
   */
  className?: string;
}

/**
 * HorizontalCalendar Component (CENTRALIZED & REUSABLE!)
 * 
 * A Facebook-style horizontal calendar strip that shows a week of dates
 * with easy navigation and customizable styling.
 * 
 * **Usage Examples:**
 * 
 * 1. **Session Detail Modal** (current use):
 * ```tsx
 * <HorizontalCalendar
 *   selectedDate="2026-01-13"
 *   highlightedDates={bookedDates}
 *   onDateClick={(date) => loadSession(date)}
 *   highlightColor="orange"
 * />
 * ```
 * 
 * 2. **Trainer Dashboard** (availability view):
 * ```tsx
 * <HorizontalCalendar
 *   selectedDate={today}
 *   highlightedDates={availableDates}
 *   onDateClick={(date) => showSchedule(date)}
 *   highlightColor="green"
 *   variant="compact"
 * />
 * ```
 * 
 * 3. **Admin Dashboard** (booking overview):
 * ```tsx
 * <HorizontalCalendar
 *   selectedDate={today}
 *   highlightedDates={bookingDates}
 *   disabledDates={unavailableDates}
 *   onDateClick={(date) => showBookings(date)}
 *   highlightColor="blue"
 * />
 * ```
 * 
 * @component
 */
export default function HorizontalCalendar({
  selectedDate,
  highlightedDates = [],
  disabledDates = [],
  onDateClick,
  initialWeekStart,
  minDate,
  maxDate,
  variant = 'default',
  highlightColor = 'orange',
  showNavigation = true,
  showWeekLabel = true,
  className = '',
}: HorizontalCalendarProps) {
  
  const selectedMoment = moment(selectedDate);
  const [currentWeekStart, setCurrentWeekStart] = useState<Moment>(
    initialWeekStart || selectedMoment.clone().startOf('week')
  );

  // Generate week days (7 days starting from currentWeekStart)
  const weekDays = useMemo(() => {
    const days: Moment[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(currentWeekStart.clone().add(i, 'days'));
    }
    return days;
  }, [currentWeekStart]);

  // Check if a date is highlighted
  const getHighlightedDate = (date: Moment): CalendarDate | undefined => {
    return highlightedDates.find(h => h.date === date.format('YYYY-MM-DD'));
  };

  // Check if a date is disabled
  const isDisabled = (date: Moment): boolean => {
    const dateStr = date.format('YYYY-MM-DD');
    
    // Check explicit disabled dates
    if (disabledDates.includes(dateStr)) return true;
    
    // Check min/max date constraints
    if (minDate && date.isBefore(minDate, 'day')) return true;
    if (maxDate && date.isAfter(maxDate, 'day')) return true;
    
    return false;
  };

  // Handle date click
  const handleDateClick = (date: Moment) => {
    const highlighted = getHighlightedDate(date);
    // Allow clicking on highlighted dates (booked sessions) even if outside min/max range
    // Also allow clicking on non-disabled dates
    if (onDateClick && (highlighted || !isDisabled(date))) {
      onDateClick(date.format('YYYY-MM-DD'), highlighted?.metadata);
    }
  };

  // Navigate to previous week
  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => prev.clone().subtract(7, 'days'));
  };

  // Navigate to next week
  const handleNextWeek = () => {
    setCurrentWeekStart(prev => prev.clone().add(7, 'days'));
  };

  // Color mapping for highlighted dates
  const highlightColorMap = {
    orange: {
      bg: 'from-orange-100 to-yellow-50',
      border: 'border-orange-300',
      text: 'text-orange-700',
      dot: 'bg-orange-500',
      label: 'bg-orange-200 text-orange-800',
    },
    blue: {
      bg: 'from-blue-100 to-cyan-50',
      border: 'border-blue-300',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
      label: 'bg-blue-200 text-blue-800',
    },
    green: {
      bg: 'from-green-100 to-emerald-50',
      border: 'border-green-300',
      text: 'text-green-700',
      dot: 'bg-green-500',
      label: 'bg-green-200 text-green-800',
    },
    purple: {
      bg: 'from-purple-100 to-pink-50',
      border: 'border-purple-300',
      text: 'text-purple-700',
      dot: 'bg-purple-500',
      label: 'bg-purple-200 text-purple-800',
    },
    red: {
      bg: 'from-red-100 to-rose-50',
      border: 'border-red-300',
      text: 'text-red-700',
      dot: 'bg-red-500',
      label: 'bg-red-200 text-red-800',
    },
  };

  const colors = highlightColorMap[highlightColor];

  // Variant sizing
  const sizeMap = {
    compact: { padding: 'p-2', textDay: 'text-[9px]', textDate: 'text-base', badge: 'text-[8px]' },
    default: { padding: 'p-3', textDay: 'text-xs', textDate: 'text-xl', badge: 'text-[9px]' },
    large: { padding: 'p-4', textDay: 'text-sm', textDate: 'text-2xl', badge: 'text-[10px]' },
  };

  const sizes = sizeMap[variant];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header with navigation - Minimal Google Calendar style */}
      {(showNavigation || showWeekLabel) && (
        <div className="flex items-center justify-between mb-3 px-1">
          {showNavigation ? (
            <button
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          ) : (
            <div />
          )}
          
          {showWeekLabel && (
            <p className="text-xs font-medium text-gray-600">
              {currentWeekStart.format('MMM D')} - {currentWeekStart.clone().add(6, 'days').format('MMM D, YYYY')}
            </p>
          )}
          
          {showNavigation ? (
            <button
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          ) : (
            <div />
          )}
        </div>
      )}

      {/* Week Days Strip - Google Calendar minimal style */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, index) => {
          const isToday = day.isSame(moment(), 'day');
          const isSelected = day.isSame(selectedMoment, 'day');
          const highlighted = getHighlightedDate(day);
          const disabled = isDisabled(day);
          const isPast = day.isBefore(moment(), 'day') && !highlighted;
          const canClick = highlighted || !disabled;

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              disabled={!canClick}
              className={`
                ${sizes.padding} rounded-lg text-center transition-all relative
                ${isSelected
                  ? 'bg-blue-600 text-white shadow-md'
                  : highlighted
                    ? `bg-blue-50 border border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400 ${canClick ? 'cursor-pointer' : 'cursor-not-allowed'}`
                    : isPast
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      : disabled
                        ? 'bg-white text-gray-300 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 cursor-pointer border border-transparent'
                }
                ${canClick && !isSelected && !isPast ? 'border border-gray-200' : ''}
              `}
            >
              {/* Day name */}
              <p className={`${sizes.textDay} font-medium ${
                isSelected ? 'text-white/90' : 
                highlighted ? 'text-blue-700' : 
                isPast ? 'text-gray-400' :
                'text-gray-500'
              }`}>
                {day.format('ddd')}
              </p>
              
              {/* Date number */}
              <p className={`${sizes.textDate} font-semibold mt-0.5 ${
                isSelected ? 'text-white' : 
                highlighted ? 'text-blue-700' : 
                isPast ? 'text-gray-400' : 
                'text-gray-900'
              }`}>
                {day.format('D')}
              </p>
              
              {/* Today indicator - subtle underline */}
              {isToday && !isSelected && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
              )}
              
              {/* Highlighted badge/label */}
              {highlighted && highlighted.label && !isSelected && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 px-1.5 py-0.5 bg-blue-200 text-blue-800 rounded-full">
                  <p className={`${sizes.badge} font-semibold`}>
                    {highlighted.label}
                  </p>
                </div>
              )}
              
              {/* Highlighted dot indicator - minimal */}
              {highlighted && !highlighted.label && !isSelected && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
