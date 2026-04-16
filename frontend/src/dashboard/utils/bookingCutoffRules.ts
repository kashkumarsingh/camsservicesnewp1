/**
 * Booking Cutoff Rules (CENTRALISED)
 *
 * Single source of truth for ALL business rules that restrict when parents can book.
 * Dashboard, modals, calendar, and time pickers should ONLY call the helpers below;
 * they must NOT re-implement rule logic.
 *
 * Time behaviour: all comparisons use the given moment (default now), i.e. user's local time.
 * When the user is in the UK, this is UK time; no separate timezone config required.
 *
 * To add or change a rule in the future (e.g. cutoff time, blackout days, no Sundays):
 * 1. Edit only this file (add/change the rule in getDateBookingStatus and/or helpers).
 * 2. Add the message in bookingValidationMessages.DATE_REASON_MESSAGES for the reason.
 * No component files need to change — they already use isDateBookable / getDateBookingStatus.
 */

import moment, { Moment } from 'moment';

/** Hour (0–23) after which booking for exactly tomorrow is no longer allowed. 18 = 6:00 PM. */
export const TOMORROW_BOOKING_CUTOFF_HOUR = 18;

/** Minute component of the cutoff (0 = :00). */
export const TOMORROW_BOOKING_CUTOFF_MINUTE = 0;

/** Reason a date is not bookable (used for toast/messages). Add new keys here when adding rules. */
export type DateBookingUnavailableReason = 'past' | 'today' | 'tomorrow_after_cutoff';

export interface DateBookingStatus {
  bookable: boolean;
  reason?: DateBookingUnavailableReason;
}

/**
 * Single central check: is this date bookable? All UI and validation should use this (or isDateBookable).
 * To add a new rule (e.g. no Sundays), add the check here and a new reason; add the message in bookingValidationMessages.
 *
 * @param dateStr - Date in YYYY-MM-DD format
 * @param now - Current moment (defaults to moment() if not provided)
 */
export function getDateBookingStatus(dateStr: string, now: Moment = moment()): DateBookingStatus {
  const dateMoment = moment(dateStr, 'YYYY-MM-DD').startOf('day');
  const today = now.clone().startOf('day');

  if (dateMoment.isBefore(today, 'day')) {
    return { bookable: false, reason: 'past' };
  }
  if (dateMoment.isSame(today, 'day')) {
    return { bookable: false, reason: 'today' };
  }
  const tomorrow = today.clone().add(1, 'day');
  if (dateMoment.isSame(tomorrow, 'day') && !isTomorrowBookable(now)) {
    return { bookable: false, reason: 'tomorrow_after_cutoff' };
  }
  return { bookable: true };
}

/**
 * Whether this date is bookable (convenience for components that only need true/false).
 * Use getDateBookingStatus when you need the reason for messaging.
 */
export function isDateBookable(dateStr: string, now: Moment = moment()): boolean {
  return getDateBookingStatus(dateStr, now).bookable;
}

/**
 * Whether parents can still book for tomorrow.
 * Booking for tomorrow is only allowed until 6:00 PM today; after that, the next bookable day is the day after tomorrow.
 *
 * @param now - Current moment (defaults to moment() if not provided)
 * @returns true if tomorrow is still bookable (now is before today 6:00 PM), false otherwise
 */
export function isTomorrowBookable(now: Moment = moment()): boolean {
  const cutoffToday = now.clone().startOf('day').hour(TOMORROW_BOOKING_CUTOFF_HOUR).minute(TOMORROW_BOOKING_CUTOFF_MINUTE);
  return now.isBefore(cutoffToday);
}

/**
 * Earliest bookable date (YYYY-MM-DD) from today.
 * - Before 6:00 PM today: tomorrow is allowed.
 * - From 6:00 PM today: day after tomorrow is the earliest.
 *
 * @param now - Current moment (defaults to moment() if not provided)
 * @returns Earliest date string that can be chosen for a new booking
 */
export function getEarliestBookableDate(now: Moment = moment()): string {
  if (isTomorrowBookable(now)) {
    return now.clone().add(1, 'day').format('YYYY-MM-DD');
  }
  return now.clone().add(2, 'days').format('YYYY-MM-DD');
}
