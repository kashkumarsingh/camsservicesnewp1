/**
 * Google Calendar–inspired design system colours.
 * Single source of truth for status, surface, text, and brand tokens.
 * Use via Tailwind theme (e.g. bg-gcal-primary, text-status-confirmed) — never raw hex in className.
 * For inline styles (e.g. third-party calendar), use these constants so values stay in sync with Tailwind.
 *
 * @see tailwind.config.js theme.extend.colors for Tailwind class names
 */

/** Status colours — same across entire app (booking/session/payment status). */
export const STATUS_COLORS = {
  /** confirmed / approved / paid */
  confirmed: '#10b981',
  /** pending / awaiting */
  pending: '#3b82f6',
  /** action needed / draft */
  actionNeeded: '#f59e0b',
  /** cancelled / rejected / failed */
  cancelled: '#f43f5e',
  /** info / neutral */
  neutral: '#64748b',
} as const;

/** Surface colours — page, cards, borders. */
export const SURFACE_COLORS = {
  pageBg: '#f8fafc',
  card: '#ffffff',
  borderSubtle: '#e2e8f0',
  inputBorder: '#cbd5e1',
  inputFocus: '#3b82f6',
} as const;

/** Text colours. */
export const TEXT_COLORS = {
  primary: '#0f172a',
  secondary: '#475569',
  muted: '#94a3b8',
  onColor: '#ffffff',
} as const;

/** Brand / interactive — primary action, destructive (Google Calendar spec). */
export const BRAND_COLORS = {
  primary: '#1a73e8',
  primaryHover: '#1557b0',
  primaryLightBg: '#e8f0fe',
  destructive: '#d93025',
  destructiveHover: '#b31412',
} as const;

/** Surface colour tokens for Tailwind (slate-50, white, etc. — use theme, not raw hex). */
export const SURFACE_TAILWIND = {
  pageBg: 'slate-50',
  card: 'white',
  borderSubtle: 'slate-200',
  inputBorder: 'slate-300',
  inputFocus: 'blue-500',
} as const;

/** All design tokens in one object for Tailwind or inline use. */
export const designColors = {
  status: STATUS_COLORS,
  surface: SURFACE_COLORS,
  text: TEXT_COLORS,
  brand: BRAND_COLORS,
} as const;
