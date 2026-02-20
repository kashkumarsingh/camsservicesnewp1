import { useMemo } from 'react';
import moment, { Moment } from 'moment';

/**
 * useCalendarGrid Hook
 * 
 * Shared hook for generating calendar grid days for month view.
 * Used by both dashboard and booking session calendars.
 * 
 * @param currentMonth - The month to generate calendar for
 * @returns Array of Moment dates for the calendar grid
 */
export function useCalendarGrid(currentMonth: Moment): Moment[] {
  return useMemo(() => {
    const startOfMonth = currentMonth.clone().startOf('month');
    const endOfMonth = currentMonth.clone().endOf('month');
    const startDate = startOfMonth.clone().startOf('week');
    const endDate = endOfMonth.clone().endOf('week');

    const days: Moment[] = [];
    const day = startDate.clone();

    while (day.isSameOrBefore(endDate)) {
      days.push(day.clone());
      day.add(1, 'day');
    }

    return days;
  }, [currentMonth]);
}

/**
 * Calendar utility functions
 */
export const calendarUtils = {
  /**
   * Check if date is today
   */
  isToday: (date: Moment): boolean => {
    return date.isSame(moment(), 'day');
  },

  /**
   * Check if date is in current month
   */
  isCurrentMonth: (date: Moment, currentMonth: Moment): boolean => {
    return date.isSame(currentMonth, 'month');
  },

  /**
   * Check if date is in the past
   */
  isPast: (date: Moment): boolean => {
    return date.isBefore(moment(), 'day');
  },
};
