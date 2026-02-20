/**
 * Centralised live-refresh: WebSocket (Reverb) when available, polling fallback otherwise.
 *
 * Purpose: Parent, trainer, and admin dashboards update (notification bell, bookings,
 * schedules) without the user pressing "Refresh" or reloading the page.
 *
 * Strategy (works locally with Reverb and on Render without Reverb):
 * - When Reverb is configured (NEXT_PUBLIC_LIVE_REFRESH_WEBSOCKET_ENABLED + key + wsHost):
 *   Echo subscribes to live-refresh.{userId} / live-refresh.admin; backend broadcasts
 *   trigger refetch per context (real-time).
 * - When Reverb is NOT configured (e.g. Render without a Reverb service):
 *   Polling fallback runs: all live-refresh contexts are invalidated on an interval
 *   while the tab is visible, so notification bell and dashboards still update.
 * - Manual invalidate(context) and refreshAll() always work.
 */
export const LIVE_REFRESH_ENABLED = true;

/**
 * Polling fallback interval (ms) when WebSocket/Reverb is not available (e.g. Render).
 * Only runs while the tab is visible. Same order as LIVE_UPDATE_POLL_INTERVAL_MS.
 */
export const LIVE_REFRESH_POLL_FALLBACK_INTERVAL_MS = 45_000;

/** Context keys returned by the backend; must match LiveRefreshController. */
export const LIVE_REFRESH_CONTEXTS = [
  'notifications',
  'bookings',
  'children',
  'trainer_schedules',
  'trainer_availability',
] as const;
export type LiveRefreshContextType = (typeof LIVE_REFRESH_CONTEXTS)[number];

/** For .includes(ctx) checks — use this so string from payload type-checks (see typescript-status-includes). */
export const LIVE_REFRESH_CONTEXTS_LIST: string[] = [...LIVE_REFRESH_CONTEXTS];

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

/** True when WebSocket live refresh is configured and will be used (no polling fallback). */
export const LIVE_REFRESH_HAS_WEBSOCKET_CONFIG =
  LIVE_REFRESH_WEBSOCKET_ENABLED &&
  !!LIVE_REFRESH_WEBSOCKET_CONFIG.key &&
  !!LIVE_REFRESH_WEBSOCKET_CONFIG.wsHost;
