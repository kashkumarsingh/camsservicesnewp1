/**
 * Global feature flag for dashboard live polling.
 *
 * When true:
 * - Parent, trainer and admin dashboards (and related admin lists)
 *   poll in the background while the tab is visible, using
 *   `useLiveUpdatePolling` for silent refetches.
 *
 * When false:
 * - Tab-visibility refetch and interval polling are disabled wherever
 *   `enabled: LIVE_UPDATE_POLLING_ENABLED` is passed.
 */
export const LIVE_UPDATE_POLLING_ENABLED = true;

/**
 * Live-update polling interval for dashboards (ms).
 * Higher = fewer requests and less network use; lower = fresher data when tab is visible.
 * 45s balances freshness and network; increase (e.g. 60_000–90_000) to save more bandwidth.
 */
export const LIVE_UPDATE_POLL_INTERVAL_MS = 45_000;

/**
 * After this many consecutive refetch failures, polling stops and onPollError is called with stopPolling: true.
 * Prevents hammering the API when offline or when the backend is failing.
 */
export const MAX_CONSECUTIVE_POLL_ERRORS = 5;
