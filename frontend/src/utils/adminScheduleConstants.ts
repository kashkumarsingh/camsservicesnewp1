/**
 * Admin schedule (Trainer Schedule) — single source of truth for labels, legend, and title.
 * Used by AdminScheduleWeekGrid. Default view is week; title updates when period or trainer filter changes.
 *
 * Legend (By Trainer view):
 * - Available: Trainer has set themselves as available for that time (from trainer dashboard).
 * - Unavailable: Trainer has set themselves as unavailable for that time.
 * - Absence: Trainer has an approved absence (holiday/leave) for that date.
 * - Pending absence: Absence request submitted but not yet approved by admin.
 * - Not set (synced from trainer dashboard): No availability data set; data comes from trainer dashboard when they set it.
 * - Drag hint: Sessions can be dragged to the Unassigned row or to another trainer's row to reassign (unless trainer has confirmed).
 */

/** Base title for the admin schedule section (used with period range or trainer name). */
export const ADMIN_SCHEDULE_TITLE_BASE = 'Trainer Schedule' as const;

/** Legend labels for trainer availability/absence (By Trainer view). */
export const ADMIN_SCHEDULE_LEGEND = {
  available: 'Available',
  unavailable: 'Unavailable',
  absence: 'Absence',
  pendingAbsence: 'Pending absence',
  notSet: 'Not set (synced from trainer dashboard)',
  dragHint: 'Drag session to Unassigned or another trainer to reassign',
} as const;

/** Build the schedule section title: "Trainer Schedule · [range]" or "Trainer Schedule for [name]" when trainer filter is set. */
export function getAdminScheduleTitle(options: {
  rangeLabel: string;
  trainerName?: string | null;
}): string {
  const { rangeLabel, trainerName } = options;
  if (trainerName?.trim()) {
    return `${ADMIN_SCHEDULE_TITLE_BASE} for ${trainerName.trim()}`;
  }
  return `${ADMIN_SCHEDULE_TITLE_BASE} · ${rangeLabel}`;
}
