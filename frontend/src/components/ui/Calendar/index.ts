/**
 * Centralized Calendar Components
 * 
 * All calendar-related UI components exported from one place.
 * These components maintain consistent styling and behavior across
 * the entire application.
 * 
 * Usage:
 * ```tsx
 * import { HorizontalCalendar, BookingCalendar } from '@/components/ui/Calendar';
 * ```
 */

export { default as HorizontalCalendar } from './HorizontalCalendar';
export type { HorizontalCalendarProps, CalendarDate } from './HorizontalCalendar';

export { default as BookingCalendar } from './BookingCalendar';
export type { BookingCalendarProps } from './BookingCalendar';
