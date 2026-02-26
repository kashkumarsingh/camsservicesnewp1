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

/** Admin dashboard back link label (used in sub-pages for navigation) */
export const BACK_TO_ADMIN_DASHBOARD_LABEL = 'Back to dashboard';
