/**
 * Google Calendar–style label system for all dashboards (Parent, Trainer, Admin).
 * Single source of truth for session/time status colours so calendar events and
 * list cards use consistent, meaningful labels (cancelled, pending, live, upcoming, past).
 *
 * Use themeColors for inline styles (borderLeft, backgroundColor); use the Tailwind
 * class pairs where components use className.
 * @see themeColors.ts for hex values
 */

import { themeColors } from '@/utils/themeColors';

export type CalendarSessionTimeStatus =
  | 'cancelled'
  | 'pending_confirmation'
  | 'live'
  | 'upcoming'
  | 'past';

export interface CalendarLabelInlineStyle {
  backgroundColor: string;
  borderLeft: string;
}

export interface CalendarLabelClasses {
  bg: string;
  border: string;
  dot: string;
}

/** Inline styles for calendar event blocks (e.g. day view, drag preview). Use when style={{}} is required. */
export function getCalendarLabelInlineStyle(
  status: CalendarSessionTimeStatus
): CalendarLabelInlineStyle {
  switch (status) {
    case 'cancelled':
      return {
        backgroundColor: themeColors.calendarStatusCancelledAlpha20,
        borderLeft: `3px solid ${themeColors.calendarStatusCancelled}`,
      };
    case 'pending_confirmation':
      return {
        backgroundColor: themeColors.calendarStatusPendingAlpha20,
        borderLeft: `3px solid ${themeColors.calendarStatusPending}`,
      };
    case 'live':
      return {
        backgroundColor: themeColors.calendarStatusLiveAlpha20,
        borderLeft: `3px solid ${themeColors.calendarStatusLive}`,
      };
    case 'upcoming':
      return {
        backgroundColor: themeColors.calendarStatusUpcomingAlpha20,
        borderLeft: `3px solid ${themeColors.calendarStatusUpcoming}`,
      };
    case 'past':
    default:
      return {
        backgroundColor: themeColors.calendarStatusPastAlpha20,
        borderLeft: `3px solid ${themeColors.calendarStatusPast}`,
      };
  }
}

/** Tailwind class pairs for calendar event blocks and status dots. */
export function getCalendarLabelClasses(
  status: CalendarSessionTimeStatus
): CalendarLabelClasses {
  switch (status) {
    case 'cancelled':
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-l-red-600 dark:border-l-red-500',
        dot: 'bg-red-500',
      };
    case 'pending_confirmation':
      return {
        bg: 'bg-amber-50 dark:bg-amber-900/30',
        border: 'border-l-amber-500',
        dot: 'bg-amber-500',
      };
    case 'live':
      return {
        bg: 'bg-green-50 dark:bg-green-900/30',
        border: 'border-l-green-500',
        dot: 'bg-green-500 animate-pulse',
      };
    case 'upcoming':
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-l-blue-500 dark:border-l-blue-400',
        dot: 'bg-blue-500 dark:bg-blue-400',
      };
    case 'past':
    default:
      return {
        bg: 'bg-slate-100 dark:bg-slate-800/50',
        border: 'border-l-slate-400',
        dot: 'bg-slate-400',
      };
  }
}

/** Border colour hex for status dot (e.g. in legend). */
export function getCalendarStatusDotColor(status: CalendarSessionTimeStatus): string {
  switch (status) {
    case 'cancelled':
      return themeColors.calendarStatusCancelled;
    case 'pending_confirmation':
      return themeColors.calendarStatusPending;
    case 'live':
      return themeColors.calendarStatusLive;
    case 'upcoming':
      return themeColors.calendarStatusUpcoming;
    case 'past':
    default:
      return themeColors.calendarStatusPast;
  }
}
