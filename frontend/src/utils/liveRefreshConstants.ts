/**
 * Centralised live-refresh via WebSocket (Reverb/Echo) only – no polling.
 *
 * Purpose: Parent, trainer, and admin dashboards update in real time (notification bell,
 * bookings, schedules) without the user pressing "Refresh" or reloading the page.
 *
 * How it works:
 * - Backend broadcasts LiveRefreshContextsUpdated to private channel live-refresh.{userId}
 *   (and live-refresh.admin for admins) with { contexts: ['notifications', 'bookings', ...] }.
 * - Frontend Echo subscribes to those channels; on event it calls notifyContext(ctx) so
 *   only refetches for that context run (e.g. notifications → bell refetch).
 * - Manual invalidate(context) after a user action still triggers immediate refetch.
 */
export const LIVE_REFRESH_ENABLED = true;

/** Context keys returned by the backend; must match LiveRefreshController. */
export const LIVE_REFRESH_CONTEXTS = [
  'notifications',
  'bookings',
  'children',
  'trainer_schedules',
  'trainer_availability',
] as const;
export type LiveRefreshContextType = (typeof LIVE_REFRESH_CONTEXTS)[number];

/**
 * WebSocket (Reverb/Pusher) for live-refresh. When true, Echo is the only live-update path.
 * When false, no live refresh (manual invalidate/refresh still works).
 */
export const LIVE_REFRESH_WEBSOCKET_ENABLED =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_LIVE_REFRESH_WEBSOCKET_ENABLED === 'true';

export const LIVE_REFRESH_WEBSOCKET_CONFIG = {
  key: (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_REVERB_APP_KEY) || '',
  wsHost: (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_REVERB_WS_HOST) || '',
  wsPort: (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_REVERB_WS_PORT) || '8080',
  wssPort: (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_REVERB_WS_PORT) || '443',
  scheme: (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_REVERB_SCHEME) || 'http',
};
