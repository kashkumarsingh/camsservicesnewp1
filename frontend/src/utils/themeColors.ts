/**
 * Theme colour values for use in inline styles (e.g. third-party calendar, style={{}}).
 * Must match frontend/tailwind.config.js theme.extend.colors — single source of truth for hex.
 * For Tailwind classes, use tokens directly: text-primary-blue, border-navy-blue, etc.
 *
 * Calendar label colours (Google Calendar–style): used for session status in Parent/Trainer/Admin
 * dashboards so inline styles (borderLeft, backgroundColor) stay consistent and themeable.
 */
export const themeColors = {
  primaryBlue: '#0080FF',
  primaryBlueAlpha20: '#0080FF20',
  navyBlue: '#1E3A5F',
  lightBlueCyan: '#00D4FF',

  /** Calendar label: cancelled / no-show — red */
  calendarStatusCancelled: '#DC2626',
  calendarStatusCancelledAlpha20: '#DC262620',
  /** Calendar label: pending confirmation / awaiting action — amber */
  calendarStatusPending: '#D97706',
  calendarStatusPendingAlpha20: '#D9770620',
  /** Calendar label: live / in progress — green */
  calendarStatusLive: '#16A34A',
  calendarStatusLiveAlpha20: '#16A34A20',
  /** Calendar label: upcoming / scheduled — blue */
  calendarStatusUpcoming: '#2563EB',
  calendarStatusUpcomingAlpha20: '#2563EB20',
  /** Calendar label: past / completed — slate */
  calendarStatusPast: '#64748B',
  calendarStatusPastAlpha20: '#64748B20',
} as const;
