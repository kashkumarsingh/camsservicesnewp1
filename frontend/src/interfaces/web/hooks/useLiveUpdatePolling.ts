'use client';

import { useEffect, useRef } from 'react';
import {
  LIVE_UPDATE_POLL_INTERVAL_MS,
  MAX_CONSECUTIVE_POLL_ERRORS,
} from '@/utils/liveUpdateConstants';

export interface UseLiveUpdatePollingOptions {
  /** Polling interval in ms. Defaults to LIVE_UPDATE_POLL_INTERVAL_MS. */
  intervalMs?: number;
  /** When false, no refetch or polling runs. Defaults to true. */
  enabled?: boolean;
  /**
   * Called when a poll refetch fails. If polling is stopped after too many failures,
   * second argument is true (e.g. show "Connection lost, please refresh").
   */
  onPollError?: (error: unknown, stopPolling: boolean) => void;
}

/**
 * Centralized live-update behaviour for dashboards: refetch when tab becomes
 * visible and poll while the tab is visible. Used by both parent and trainer
 * dashboards (and trainer bookings list) so admin assignments and session
 * changes appear without manual refresh.
 *
 * - The refetch callback should perform a silent refresh (no loading UI) so
 *   polling does not cause spinners (e.g. refetchBookings(true)).
 * - For race-condition protection and error handling, refetch should return a
 *   Promise that settles when the refetch is done (e.g. a single async call or
 *   Promise.all). If it returns void, overlapping poll cycles may still run.
 * - Intervals are cleared on unmount and when the tab is hidden (no timer leaks).
 * - After MAX_CONSECUTIVE_POLL_ERRORS failures, polling stops and onPollError is
 *   called with stopPolling: true.
 */
export function useLiveUpdatePolling(
  refetch: () => void | Promise<void>,
  options: UseLiveUpdatePollingOptions = {}
): void {
  const {
    intervalMs = LIVE_UPDATE_POLL_INTERVAL_MS,
    enabled = true,
    onPollError,
  } = options;
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;
  const onPollErrorRef = useRef(onPollError);
  onPollErrorRef.current = onPollError;
  const isRefetchingRef = useRef(false);
  const consecutiveErrorsRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const stopPolling = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const runRefetch = async () => {
      if (document.visibilityState !== 'visible') return;
      if (isRefetchingRef.current) return;

      isRefetchingRef.current = true;
      try {
        await Promise.resolve(refetchRef.current());
        consecutiveErrorsRef.current = 0;
      } catch (error) {
        consecutiveErrorsRef.current += 1;
        const stopPollingDueToErrors =
          consecutiveErrorsRef.current >= MAX_CONSECUTIVE_POLL_ERRORS;
        if (stopPollingDueToErrors) {
          stopPolling();
        }
        onPollErrorRef.current?.(error, stopPollingDueToErrors);
      } finally {
        isRefetchingRef.current = false;
      }
    };

    const startPolling = () => {
      if (intervalId !== null) return;
      void runRefetch(); // Refetch once when becoming visible
      intervalId = setInterval(() => void runRefetch(), intervalMs);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startPolling();
      } else {
        stopPolling();
      }
    };

    if (document.visibilityState === 'visible') {
      startPolling();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopPolling();
    };
  }, [enabled, intervalMs]);
}
