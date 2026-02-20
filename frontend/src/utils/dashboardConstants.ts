/**
 * Dashboard constants — single source of truth for roles, approval status, and status strings.
 * Use these instead of hardcoding 'admin', 'trainer', 'confirmed', 'paid', etc. in dashboard code.
 * @see DASHBOARD_RULES.md
 */

/** User roles — use for role checks and redirects, never hardcode role strings. */
export const USER_ROLE = {
  PARENT: 'parent',
  TRAINER: 'trainer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  EDITOR: 'editor',
} as const;

export type UserRoleValue = (typeof USER_ROLE)[keyof typeof USER_ROLE];

/** Approval status for parents/trainers — use for banner/UI logic. */
export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type ApprovalStatusValue = (typeof APPROVAL_STATUS)[keyof typeof APPROVAL_STATUS];

/** Session/schedule status for schedule rows — use instead of hardcoding 'completed', 'cancelled', 'no_show'. */
export const SCHEDULE_SESSION_STATUS = {
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  SCHEDULED: 'scheduled',
} as const;

/** Timesheet cell status for trainer availability grid. */
export const TIMESHEET_CELL_STATUS = {
  APPROVED_ABSENCE: 'approved_absence',
  PENDING_ABSENCE: 'pending_absence',
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
  NONE: 'none',
} as const;

/** Booking status for admin bookings table and filters — use instead of hardcoding 'draft', 'pending', etc. */
export const BOOKING_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export type BookingStatusValue = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

/** Booking statuses considered "active" (buy-hours, unpaid checks). Type as string[] so .includes(b.status) type-checks. */
export const ACTIVE_BOOKING_STATUSES: string[] = [
  BOOKING_STATUS.DRAFT,
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
];

/** Booking statuses that are terminal (no further transitions). */
export const TERMINAL_BOOKING_STATUSES: string[] = [
  BOOKING_STATUS.CANCELLED,
  BOOKING_STATUS.COMPLETED,
];

/** Payment status for admin bookings table and filters — use instead of hardcoding 'pending', 'paid', etc. */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed',
} as const;

export type PaymentStatusValue = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

/** Payment statuses that indicate failure or reversal. */
export const FAILED_PAYMENT_STATUSES: string[] = [
  PAYMENT_STATUS.FAILED,
  PAYMENT_STATUS.REFUNDED,
];

/** Check if role is admin (admin or super_admin). */
export function isAdminRole(role: string | undefined): boolean {
  return role === USER_ROLE.ADMIN || role === USER_ROLE.SUPER_ADMIN;
}

/**
 * Default sort for admin DataTables — use as initial state so every table comes with sorting.
 * Use DEFAULT_TABLE_SORT for tables whose first sortable column is 'name' (trainers, children, parents, users, packages).
 */
export const DEFAULT_TABLE_SORT = {
  sortKey: 'name',
  sortDirection: 'asc',
} as const;

/**
 * Default sort for tables whose first sortable column is 'title' (services, public pages).
 */
export const DEFAULT_TABLE_SORT_BY_TITLE = {
  sortKey: 'title',
  sortDirection: 'asc',
} as const;
