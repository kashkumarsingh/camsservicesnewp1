/**
 * Shared status badge CSS classes for dashboard — single source of truth.
 * Use these instead of inline badge classes. Font size is included (text-2xs).
 * @see DASHBOARD_RULES.md
 */

const BADGE_BASE = 'text-2xs font-medium';

/** Booking status: confirmed/paid → green, pending/draft → yellow, cancelled → red, completed → blue/grey. */
export function getStatusBadgeClasses(
  status: 'draft' | 'pending' | 'confirmed' | 'cancelled' | 'completed' | string
): string {
  switch (status) {
    case 'confirmed':
      return `${BADGE_BASE} bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300`;
    case 'pending':
    case 'draft':
      return `${BADGE_BASE} bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300`;
    case 'cancelled':
      return `${BADGE_BASE} bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300`;
    case 'completed':
      return `${BADGE_BASE} bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100`;
    default:
      return `${BADGE_BASE} bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200`;
  }
}

/** Payment status: paid → green, partial → blue, pending → yellow, refunded/failed → red. */
export function getPaymentStatusBadgeClasses(
  status: 'pending' | 'partial' | 'paid' | 'refunded' | 'failed' | string
): string {
  switch (status) {
    case 'paid':
      return `${BADGE_BASE} bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300`;
    case 'partial':
      return `${BADGE_BASE} bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300`;
    case 'pending':
      return `${BADGE_BASE} bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300`;
    case 'refunded':
    case 'failed':
      return `${BADGE_BASE} bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300`;
    default:
      return `${BADGE_BASE} bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200`;
  }
}

/** Active/inactive (e.g. trainer or package active flag) — green vs grey. */
export function getActiveBadgeClasses(isActive: boolean): string {
  return isActive
    ? `${BADGE_BASE} bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300`
    : `${BADGE_BASE} bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200`;
}

/** Published/unpublished (e.g. service or public page) — same as active, green vs grey. */
export function getPublishedBadgeClasses(published: boolean): string {
  return getActiveBadgeClasses(published);
}
