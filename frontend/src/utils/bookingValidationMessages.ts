/**
 * Centralised Booking Validation Messages
 *
 * Clean Architecture: Infrastructure Layer (Utilities)
 * Location: frontend/src/utils/bookingValidationMessages.ts
 *
 * Purpose: Single source of truth for all booking-related validation and error messages.
 * Change the rule message in BOOKING_RULE_TOMORROW_6PM only; all other messages derive from it.
 *
 * INTELLIGENT DATE MESSAGE SYSTEM (no patchwork):
 * - All date-unavailability logic lives in bookingCutoffRules.ts (getDateBookingStatus).
 * - All date-unavailability messages go through getMessageForDateReason(reason, options).
 * - Components must never branch on reason or hardcode PAST_DATE/CURRENT_DATE/tomorrow_6pm;
 *   they pass the reason from getDateBookingStatus().reason and use getMessageForDateReason.
 * - To add a new rule: add the reason in bookingCutoffRules.getDateBookingStatus,
 *   add the message in DATE_REASON_MESSAGES below; optionally add context in getMessageForDateReason.
 *
 * Usage (toasts / UI):
 * const status = getDateBookingStatus(dateStr, now);
 * toastManager.error(getMessageForDateReason(status.reason, { now }));
 */

import type { Moment } from 'moment';
import moment from 'moment';
import { getDateBookingStatus, getEarliestBookableDate } from '@/utils/bookingCutoffRules';

/** New business rule: tomorrow only bookable until 6:00 PM today. Single source for this message. */
export const BOOKING_RULE_TOMORROW_6PM = 'Tomorrow is only bookable until 6:00 PM today.';

/** Shown when user selects today — same-day bookings are not allowed. */
export const SAME_DAY_NOT_ALLOWED = 'Same-day bookings are not allowed. Please select tomorrow or a future date.';

export const BOOKING_VALIDATION_MESSAGES = {
  // Date-related validation messages
  PAST_DATE: 'You cannot book sessions for past dates. Please select a future date.',
  /** Used for generic "current date" contexts (e.g. 24h check). For "user clicked today" use SAME_DAY_NOT_ALLOWED. */
  CURRENT_DATE: BOOKING_RULE_TOMORROW_6PM,
  /** After 6:00 PM today, booking for exactly tomorrow is no longer allowed. */
  TOMORROW_AFTER_CUTOFF: 'Booking for tomorrow is only available until 6:00 PM today. Please select the next day or later.',
  UNAVAILABLE_DATE: 'This date is not available for booking. Please select another date.',

  // Time-related validation messages
  PAST_TIME: 'This time slot has already passed. Please select a future time.',
  TIME_CONFLICT: 'This time slot conflicts with an existing session.',
  INSUFFICIENT_NOTICE: BOOKING_RULE_TOMORROW_6PM,
  /** No time slots available for selected date (e.g. after 6 PM for tomorrow). */
  NO_TIMES_AVAILABLE_FOR_DATE: `${BOOKING_RULE_TOMORROW_6PM} Please select a date further in the future.`,

  // Duration validation messages
  // Business Rule: Minimum 3 hours, Maximum until 11:59 PM (or 24 hours absolute max)
  SESSION_TOO_SHORT: 'Sessions must be at least 3 hours. Please select more activities or increase the duration.',
  SESSION_TOO_LONG: 'Session exceeds maximum available time. Please select an earlier start time or reduce the duration.',
  INVALID_DURATION: 'Session duration is invalid. Minimum 3 hours required.',
  
  // Dynamic duration messages (used by components for contextual feedback)
  DURATION_VALID: (hours: number) => `✓ Session Duration: ${hours} hour${hours !== 1 ? 's' : ''}`,
  DURATION_TOO_SHORT: (current: number, minimum: number) => 
    `⚠️ Session Too Short: ${current} hour${current !== 1 ? 's' : ''} (minimum ${minimum} hours required). Add ${(minimum - current).toFixed(1)} more hour${(minimum - current) !== 1 ? 's' : ''}.`,
  DURATION_TOO_LONG: (current: number, maximum: number, reason?: string) => 
    `⚠️ Session Too Long: ${current} hour${current !== 1 ? 's' : ''} exceeds ${maximum} hour${maximum !== 1 ? 's' : ''} maximum${reason ? ` (${reason})` : ''}.`,
  
  // Child-related validation messages
  NO_ACTIVE_PACKAGE: 'This child does not have an active package. Please purchase a package first.',
  CHILD_UNAVAILABLE: 'This child is not available for booking. Please ensure they have an approved profile.',
  
  // Hours-related validation messages
  INSUFFICIENT_HOURS: 'You do not have enough hours remaining to book this session.',
  NO_HOURS_REMAINING: 'You have no hours remaining. Please purchase more hours to continue booking.',
  
  // Session-related validation messages
  SESSION_OVERLAP: 'This session overlaps with an existing booking for this child.',
  TRAINER_UNAVAILABLE: 'The selected trainer is not available at this time.',
  MAX_SESSIONS_REACHED: 'You have reached the maximum number of sessions for this package.',
  
  // General validation messages
  INVALID_DATE: 'Please select a valid date.',
  INVALID_TIME: 'Please select a valid time.',
  REQUIRED_FIELDS: 'Please fill in all required fields.',
  BOOKING_FAILED: 'Failed to create booking. Please try again.',
  
  // Success messages
  BOOKING_SUCCESS: 'Session booked successfully!',
  BOOKING_UPDATED: 'Session updated successfully!',
  BOOKING_CANCELLED: 'Session cancelled successfully.',
} as const;

/**
 * Message for each date-unavailable reason from bookingCutoffRules.getDateBookingStatus().
 * When you add a new rule in bookingCutoffRules, add the reason and message here — no component changes needed.
 */
export const DATE_REASON_MESSAGES: Record<string, string> = {
  past: 'You cannot book sessions for past dates.',
  today: SAME_DAY_NOT_ALLOWED,
  tomorrow_after_cutoff: BOOKING_VALIDATION_MESSAGES.TOMORROW_AFTER_CUTOFF,
};

export interface GetMessageForDateReasonOptions {
  /** When provided, messages can include context (e.g. earliest bookable date for tomorrow_after_cutoff). Uses local time (e.g. UK). */
  now?: Moment;
}

/**
 * Single entry point for date-unavailability messages. Context-aware: e.g. for tomorrow_after_cutoff
 * includes the actual earliest bookable date when options.now is provided.
 * Use with getDateBookingStatus().reason — do not branch on reason in components.
 */
export function getMessageForDateReason(reason: string | undefined, options?: GetMessageForDateReasonOptions): string {
  if (!reason) return BOOKING_VALIDATION_MESSAGES.UNAVAILABLE_DATE;
  const base = DATE_REASON_MESSAGES[reason] ?? BOOKING_VALIDATION_MESSAGES.UNAVAILABLE_DATE;
  if (reason === 'tomorrow_after_cutoff' && options?.now) {
    const earliest = getEarliestBookableDate(options.now);
    const formatted = moment(earliest, 'YYYY-MM-DD').format('dddd, D MMMM YYYY');
    return `${base} The earliest you can book is ${formatted}.`;
  }
  return base;
}

/** Normalise date to YYYY-MM-DD for cutoff rules. */
function toDateStr(date: Date | string): string {
  if (typeof date === 'string') {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : moment(date).format('YYYY-MM-DD');
  }
  return moment(date).format('YYYY-MM-DD');
}

/**
 * Validation message for a given date. Uses bookingCutoffRules (single source of truth);
 * no duplicate 24h/cutoff logic. Returns empty string when date is bookable.
 * @param date - The date being checked
 * @param now - Optional current moment (defaults to now; use for tests or explicit UK/local time)
 */
export function getDateValidationMessage(date: Date | string, now: Moment = moment()): string {
  const dateStr = toDateStr(date);
  const status = getDateBookingStatus(dateStr, now);
  if (status.bookable) return '';
  return getMessageForDateReason(status.reason, { now });
}

/**
 * Whether the date is available for booking. Uses bookingCutoffRules only (no duplicate logic).
 * @param date - The date to check
 * @param now - Optional current moment (defaults to now)
 */
export function isDateAvailableForBooking(date: Date | string, now: Moment = moment()): boolean {
  const dateStr = toDateStr(date);
  return getDateBookingStatus(dateStr, now).bookable;
}

/**
 * Check if session duration meets minimum requirement (3 hours)
 * Business Rule: Sessions must be at least 3 hours, no hard maximum (except 11:59 PM cutoff)
 * @param durationHours - The session duration in hours
 * @param maxDuration - Optional maximum duration (e.g., time until 11:59 PM or remaining package hours)
 * @returns true if duration is valid, false otherwise
 */
export const isSessionDurationValid = (durationHours: number, maxDuration?: number): boolean => {
  // Minimum: 3 hours (business rule)
  if (durationHours < 3) return false;
  
  // Maximum: If provided, check against it; otherwise, allow up to 24 hours
  const effectiveMax = maxDuration ?? 24;
  return durationHours <= effectiveMax;
};

/**
 * Check if session duration meets minimum requirement only (ignores maximum)
 * Use this when you only want to validate the minimum 3-hour rule
 * @param durationHours - The session duration in hours
 * @returns true if duration meets minimum, false otherwise
 */
export const meetsMinimumDuration = (durationHours: number): boolean => {
  return durationHours >= 3;
};

/**
 * Get duration validation message with context
 * @param durationHours - The session duration in hours
 * @param maxDuration - Optional maximum duration for contextual messages
 * @param reason - Optional reason for maximum (e.g., "until 11:59 PM")
 * @returns Appropriate validation message
 */
export const getDurationValidationMessage = (
  durationHours: number, 
  maxDuration?: number,
  reason?: string
): string => {
  const minDuration = 3;
  const effectiveMax = maxDuration ?? 24;
  
  if (durationHours < minDuration) {
    return BOOKING_VALIDATION_MESSAGES.DURATION_TOO_SHORT(durationHours, minDuration);
  }
  if (durationHours > effectiveMax) {
    return BOOKING_VALIDATION_MESSAGES.DURATION_TOO_LONG(durationHours, effectiveMax, reason);
  }
  return BOOKING_VALIDATION_MESSAGES.DURATION_VALID(durationHours);
};

/**
 * Booking validation error types (static messages only)
 */
export type BookingValidationError = keyof Omit<typeof BOOKING_VALIDATION_MESSAGES, 'DURATION_VALID' | 'DURATION_TOO_SHORT' | 'DURATION_TOO_LONG'>;

/**
 * Format duration for display (e.g., "3h" or "3.5h")
 * @param hours - Duration in hours
 * @returns Formatted string
 */
export const formatDurationDisplay = (hours: number): string => {
  if (Number.isInteger(hours)) {
    return `${hours}h`;
  }
  return `${hours.toFixed(1)}h`;
};

/**
 * Calculate hours needed to reach minimum duration
 * @param currentHours - Current session duration
 * @returns Hours needed to reach 3-hour minimum, or 0 if already met
 */
export const getHoursNeededForMinimum = (currentHours: number): number => {
  const minimum = 3;
  if (currentHours >= minimum) return 0;
  return Math.round((minimum - currentHours) * 10) / 10; // Round to 1 decimal
};
