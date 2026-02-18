# Live Updates on Dashboards – Implementation Summary

## Feature Name
Live updates (polling + visibility refetch) so trainer and parent dashboards reflect admin assignments and session changes without manual refresh. **Centralized** in a single hook used by both dashboards and the trainer bookings list.

## Files Modified/Created (In Order)

1. **Created:** `frontend/src/utils/liveUpdateConstants.ts`  
   - Purpose: Central interval for live-update polling (45s) and `MAX_CONSECUTIVE_POLL_ERRORS` (5) for error handling.

2. **Created:** `frontend/src/interfaces/web/hooks/useLiveUpdatePolling.ts`  
   - Layer: Interface (Web Hooks)  
   - Purpose: Shared hook for “refetch when tab visible” + “poll while visible”. Handles errors, stops after repeated failures, avoids concurrent refetches, cleans up intervals on unmount/hidden.

3. **Modified:** `frontend/src/interfaces/web/hooks/booking/useMyBookings.ts`  
   - Layer: Interface (Web Hooks)  
   - Purpose: `refetch(silent?: boolean)` so polling does not show loading.

4. **Modified:** `frontend/src/interfaces/web/hooks/dashboard/useDashboardStats.ts`  
   - Layer: Interface (Web Hooks)  
   - Purpose: `refetch(silent?: boolean)` for silent polling.

5. **Modified:** `frontend/src/app/(trainer)/trainer/dashboard/TrainerDashboardPageClient.tsx`  
   - Layer: Presentation  
   - Purpose: Uses `useLiveUpdatePolling(() => fetchBookings(true), { enabled: ... })`.

6. **Modified:** `frontend/src/app/(public)/dashboard/DashboardPageClient.tsx`  
   - Layer: Presentation  
   - Purpose: Uses `useLiveUpdatePolling` with a callback that returns `Promise.all([refetchBookings(true), refetchStats(true)])` for single-promise refetch and error handling.

7. **Modified:** `frontend/src/app/(trainer)/trainer/bookings/BookingsListPageClient.tsx`  
   - Layer: Presentation  
   - Purpose: Uses `useLiveUpdatePolling(() => fetchBookings(true), { enabled: ... })`.

## Plain English Explanation

**What:** Trainer and parent dashboards now refresh data automatically while the user has the tab open, so changes made by the admin (e.g. assigning a trainer) or by the trainer (e.g. session status) appear without the user clicking Refresh or reloading.

**How:** When the tab is visible, a timer runs every 45 seconds and triggers a silent refetch. When the user returns to the tab, an immediate refetch runs. Polling stops when the tab is hidden. After 5 consecutive refetch failures, polling stops and an optional `onPollError` callback is invoked. Only one refetch runs at a time when the callback returns a Promise. Intervals are always cleared on unmount and when the tab is hidden.

**Why:** Trainers see new assignments soon after an admin assigns them; parents see updated trainer/session info. Error handling and guards avoid hammering the API when offline and prevent race conditions. “liveness” of the app.

## Behaviour Summary

| Concern | Behaviour |
|--------|-----------|
| **Interval cleanup** | Effect cleanup calls `stopPolling()`; no timers left on unmount or when tab is hidden. |
| **Concurrent refetch** | `isRefetchingRef` ensures we do not start another refetch until the current one settles. For full protection, pass a refetch that returns a Promise. |
| **Errors** | Consecutive failures are counted; after `MAX_CONSECUTIVE_POLL_ERRORS` (5), polling stops and `onPollError(error, true)` is called. Optional `onPollError(error, false)` on each failure. |
| **Visibility** | Poll only when `document.visibilityState === 'visible'`; immediate refetch on becoming visible. |

## Summary of Changes

| Area        | Change |
|------------|--------|
| **Frontend** | `LIVE_UPDATE_POLL_INTERVAL_MS` (45s), `MAX_CONSECUTIVE_POLL_ERRORS` (5). `useLiveUpdatePolling` adds error handling, concurrent-refetch guard, and optional `onPollError`. Trainer/parent dashboards and trainer bookings list use the hook; parent dashboard refetch returns a single Promise for both bookings and stats. |
| **Backend**  | None. |
| **API**      | No new endpoints; existing list/bookings and stats endpoints are polled. |

## Clean Architecture Compliance

- **Centralized:** Polling, visibility, and error logic live in one hook; dashboards pass a refetch callback and options (`enabled`, optional `onPollError`).
- Data fetching stays in existing hooks and repositories.
- Constants in `liveUpdateConstants.ts`; easy to tune or feature-flag.

## Testing Checklist

- [ ] Hook does not poll when `enabled: false`.
- [ ] Polling stops when tab is hidden and resumes (with immediate refetch) when visible.
- [ ] Refetch is called with silent behaviour (no loading spinners during poll).
- [ ] Intervals are cleared on unmount (e.g. navigate away from dashboard).
- [ ] Refetch errors are caught; after 5 consecutive failures polling stops and `onPollError(_, true)` is called.
- [ ] No duplicate concurrent refetch when refetch returns a Promise (manual refresh and poll do not overlap).
- [ ] Parent dashboard: bookings and stats both refetch; single failure fails the poll cycle.

## Show data only after initial load (no partial/stale flash)

To avoid parents (or trainers) seeing partial or stale data that then "jumps" to the real data (e.g. "0 booked" then correct list), both dashboards now gate main content behind an explicit **initial load completed** flag:

- **Parents dashboard:** `hasInitialLoadCompleted` is set to `true` only when `!loading && !bookingsLoading && !statsLoading`. The skeleton is shown until then (`shouldShowSkeleton = !hasInitialLoadCompleted`). Polling and memory-leak guards are unchanged; only the first paint is delayed until all of auth, bookings, and stats have finished their first load.
- **Trainer dashboard:** `hasInitialLoadCompleted` is set to `true` only when `!loading && !bookingsLoading`. The skeleton is shown until then. Same idea: no content until the first full load has completed.

This ensures data is never shown "before everything has loaded".

## Next Steps

- Optional: add WebSockets or Server-Sent Events later for true push-based updates.
- Optional: "Last updated" indicator or user toggle for polling.
- Optional: configurable poll interval per environment or feature flag.
