/**
 * App-wide constants for date formats, currency, pagination.
 * Single source of truth — use these instead of inline magic numbers or format strings.
 * @see .cursor/rules/constants-ownership.mdc
 */

/** Locale for date/number formatting (en-GB for UK) */
export const DATE_LOCALE = 'en-GB' as const;

/** Default Intl date format options for short dates (e.g. 01/02/2025) */
export const DATE_FORMAT_SHORT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
};

/** Default Intl date format options for date + time (e.g. 01 Feb 2025, 14:30) */
export const DATE_FORMAT_DATETIME: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

/** Default Intl date format options for long dates (e.g. 1 February 2025) */
export const DATE_FORMAT_LONG: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

/** Short display date (e.g. Jan 15) for lists/sidebars */
export const DATE_FORMAT_MONTH_DAY: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
};

/** Short display date with year (e.g. Jan 15, 2025) */
export const DATE_FORMAT_MONTH_DAY_YEAR: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

/** Currency code for display (GBP) */
export const CURRENCY_CODE = 'GBP' as const;

/** Currency symbol for display */
export const CURRENCY_SYMBOL = '£' as const;

/** Default page size for admin/dashboard tables when not in URL */
export const DEFAULT_PAGE_SIZE = 25;

/** Max page size for API list endpoints */
export const MAX_PAGE_SIZE = 200;

/** Query param for Meilisearch/Scout search on list endpoints (packages, services, trainers, faqs) */
export const SEARCH_QUERY_PARAM = 'q' as const;

/** Admin dashboard back link label (used in sub-pages for navigation) */
export const BACK_TO_ADMIN_DASHBOARD_LABEL = 'Back to dashboard';

/** Weekday labels Mon–Fri for admin week calendar / stats (matches backend weekDayCounts order) */
export const WEEKDAY_LABELS_MON_FRI = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

/** Fallback when assign-trainer API error has no message (e.g. non-Error throw) */
export const ASSIGN_TRAINER_ERROR_FALLBACK = 'Failed to assign trainer. Please try again or choose another trainer.';

/** Fallback when unassign-trainer API error has no message */
export const UNASSIGN_TRAINER_ERROR_FALLBACK = 'Failed to unassign trainer. Please try again.';

/** Success message shown after creating a trainer */
export const TRAINER_ADDED_SUCCESS_MESSAGE = 'Trainer added successfully.';

/**
 * Calendar grid — Google Calendar–style square day cells.
 * Use for month/week grids in admin, parent, and trainer dashboards so cells are square (aspect 1:1).
 */
export const CALENDAR_GRID_DAY_CELL_CLASSES = 'aspect-square min-w-0 min-h-0' as const;

/** Admin schedule (By Trainer) week view: square day column cells (min width = min height). */
export const ADMIN_SCHEDULE_WEEK_DAY_CELL_CLASSES = 'min-w-[140px] min-h-[140px]' as const;

/** Admin schedule (By Trainer) month view: square day column cells. */
export const ADMIN_SCHEDULE_MONTH_DAY_CELL_CLASSES = 'min-w-0 w-12 max-w-[4rem] min-h-[4rem]' as const;

/** Success toast after parent submits child checklist — sets expectation that Buy hours is available only after approval. */
export const CHECKLIST_SUBMIT_SUCCESS_MESSAGE =
  "Checklist submitted. We're reviewing it — you'll be able to buy hours once we've approved.";
