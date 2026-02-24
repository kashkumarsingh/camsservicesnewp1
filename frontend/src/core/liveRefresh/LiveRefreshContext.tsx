'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { getAuthToken } from '@/infrastructure/http/auth/authTokenProvider';
import { getApiBaseUrl } from '@/infrastructure/http/apiBaseUrl';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import {
  LIVE_REFRESH_CONTEXTS_LIST,
  LIVE_REFRESH_HAS_WEBSOCKET_CONFIG,
  LIVE_REFRESH_POLL_FALLBACK_INTERVAL_MS,
  LIVE_REFRESH_WEBSOCKET_CONFIG,
  LIVE_REFRESH_WEBSOCKET_ENABLED,
  type LiveRefreshContextType,
} from '@/utils/liveRefreshConstants';
import { isAdminRole } from '@/utils/dashboardConstants';

type RefetchFn = () => void | Promise<void>;

interface LiveRefreshContextValue {
  /** Register a refetch for a context; returns unregister. */
  subscribe: (context: LiveRefreshContextType, refetch: RefetchFn) => () => void;
  /** Manually trigger refetch for a context (e.g. after local mutation). */
  invalidate: (context: LiveRefreshContextType) => void;
  /** Manually trigger refetch for all contexts (dashboard-level refresh button). */
  refreshAll: () => void;
}

const LiveRefreshContext = createContext<LiveRefreshContextValue | null>(null);

/** Map context -> Set of refetch callbacks. */
const refetchRegistry = new Map<LiveRefreshContextType, Set<RefetchFn>>();

function notifyContext(context: LiveRefreshContextType): void {
  const fns = refetchRegistry.get(context);
  if (!fns) return;
  fns.forEach((fn) => {
    try {
      void Promise.resolve(fn());
    } catch (e) {
      // avoid one subscriber breaking others
    }
  });
}

/** Echo instance type for private channels and disconnect. */
type EchoInstance = {
  private: (ch: string) => {
    listen: (ev: string, cb: (payload: { contexts?: string[] }) => void) => void;
  };
  disconnect: () => void;
};

/** Pusher connection from Echo connector (internal API; optional). */
type PusherConnection = { bind: (ev: string, cb: (states?: { current?: string }) => void) => void };
type EchoWithConnector = EchoInstance & {
  connector?: { pusher?: { connection?: PusherConnection } };
};

export function LiveRefreshProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const echoRef = useRef<EchoInstance | null>(null);
  /** When Reverb is configured but connection fails, we fall back to polling. */
  const [reverbConnectionFailed, setReverbConnectionFailed] = useState(false);

  const subscribe = useCallback(
    (context: LiveRefreshContextType, refetch: RefetchFn) => {
      if (!refetchRegistry.has(context)) {
        refetchRegistry.set(context, new Set());
      }
      refetchRegistry.get(context)!.add(refetch);
      return () => {
        refetchRegistry.get(context)?.delete(refetch);
      };
    },
    []
  );

  const invalidate = useCallback((context: LiveRefreshContextType) => {
    notifyContext(context);
  }, []);

  const refreshAll = useCallback(() => {
    LIVE_REFRESH_CONTEXTS_LIST.forEach((ctx) => notifyContext(ctx as LiveRefreshContextType));
  }, []);

  // WebSocket (Echo) when Reverb is configured – one connection per user, stored in ref.
  // Deps are primitives only (user?.id, user?.role) so we don't reconnect when user object reference changes.
  const userId = user?.id;
  const userRole = user?.role;

  useEffect(() => {
    if (!LIVE_REFRESH_HAS_WEBSOCKET_CONFIG || userId == null) {
      setReverbConnectionFailed(false);
      if (echoRef.current) {
        try {
          echoRef.current.disconnect();
        } catch {
          // ignore
        }
        echoRef.current = null;
      }
      if (typeof window !== 'undefined' && userId != null && process.env.NODE_ENV === 'development') {
        const missing = [
          !LIVE_REFRESH_WEBSOCKET_ENABLED && 'NEXT_PUBLIC_LIVE_REFRESH_WEBSOCKET_ENABLED=true',
          !LIVE_REFRESH_WEBSOCKET_CONFIG.key && 'NEXT_PUBLIC_REVERB_APP_KEY',
          !LIVE_REFRESH_WEBSOCKET_CONFIG.wsHost && 'NEXT_PUBLIC_REVERB_WS_HOST',
        ].filter(Boolean);
        if (missing.length > 0) {
          console.info(
            '[Live refresh] WebSocket not configured – using polling fallback. For real-time, add:',
            missing.join(', ')
          );
        }
      }
      return;
    }

    // Disconnect any existing instance so we only ever have one Echo per effect run.
    if (echoRef.current) {
      try {
        echoRef.current.disconnect();
      } catch {
        // ignore
      }
      echoRef.current = null;
    }

    let cancelled = false;
    setReverbConnectionFailed(false);

    const connect = async () => {
      const token = getAuthToken();
      if (!token || cancelled) return;

      const [EchoModule, PusherModule] = await Promise.all([
        import('laravel-echo'),
        import('pusher-js'),
      ]);
      const Echo = EchoModule.default;
      const PusherConstructor =
        (PusherModule as unknown as { default: typeof import('pusher-js') }).default ?? PusherModule;

      const apiBase = getApiBaseUrl({ serverSide: false });
      const authEndpoint = apiBase ? `${apiBase}/broadcasting/auth` : '';

      (window as unknown as { Pusher: typeof PusherConstructor }).Pusher = PusherConstructor;

      const echo = new Echo({
        broadcaster: 'reverb',
        key: LIVE_REFRESH_WEBSOCKET_CONFIG.key,
        wsHost: LIVE_REFRESH_WEBSOCKET_CONFIG.wsHost,
        wsPort: LIVE_REFRESH_WEBSOCKET_CONFIG.wsPort ?? '8080',
        wssPort: LIVE_REFRESH_WEBSOCKET_CONFIG.wssPort ?? '443',
        forceTLS: LIVE_REFRESH_WEBSOCKET_CONFIG.scheme === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      }) as EchoInstance;

      // If effect was cleaned up while we were creating Echo, disconnect the new instance so we don't leave a ghost connection.
      if (cancelled) {
        echo.disconnect();
        return;
      }
      echoRef.current = echo;

      // When Reverb is not running, Pusher connection fails and logs errors. Detect failure and fall back to polling.
      const pusherConnection = (echo as EchoWithConnector).connector?.pusher?.connection;
      if (pusherConnection && typeof pusherConnection.bind === 'function') {
        const onFailed = () => {
          if (!cancelled) {
            setReverbConnectionFailed(true);
            console.info(
              '[Live refresh] Reverb connection failed (is Reverb running?). Using polling fallback. Start with: php artisan reverb:start'
            );
          }
        };
        pusherConnection.bind('failed', onFailed);
        pusherConnection.bind('state_change', (states: { current?: string }) => {
          if (states?.current === 'failed' || states?.current === 'unavailable') onFailed();
        });
      }

      const channelName = `live-refresh.${userId}`;
      echo.private(channelName).listen('.LiveRefreshContextsUpdated', (payload: { contexts?: string[] }) => {
        const contexts = payload?.contexts ?? [];
        contexts.forEach((ctx) => {
          if (LIVE_REFRESH_CONTEXTS_LIST.includes(ctx)) {
            notifyContext(ctx as LiveRefreshContextType);
          }
        });
      });

      if (isAdminRole(userRole)) {
        echo.private('live-refresh.admin').listen('.LiveRefreshContextsUpdated', (payload: { contexts?: string[] }) => {
          const contexts = payload?.contexts ?? [];
          contexts.forEach((ctx) => {
            if (LIVE_REFRESH_CONTEXTS_LIST.includes(ctx)) {
              notifyContext(ctx as LiveRefreshContextType);
            }
          });
        });
      }
    };

    void connect();

    return () => {
      cancelled = true;
      if (echoRef.current) {
        try {
          echoRef.current.disconnect();
        } catch {
          // ignore
        }
        echoRef.current = null;
      }
    };
  }, [userId, userRole]);

  // Polling fallback when WebSocket/Reverb is not available or connection failed – same refetch behaviour
  const refreshAllRef = useRef(refreshAll);
  refreshAllRef.current = refreshAll;
  useEffect(() => {
    const useWebSocket = LIVE_REFRESH_HAS_WEBSOCKET_CONFIG && !reverbConnectionFailed;
    if (userId == null || useWebSocket) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshAllRef.current();
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tick();
        intervalId = setInterval(tick, LIVE_REFRESH_POLL_FALLBACK_INTERVAL_MS);
      } else {
        if (intervalId !== null) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    };

    if (document.visibilityState === 'visible') {
      intervalId = setInterval(tick, LIVE_REFRESH_POLL_FALLBACK_INTERVAL_MS);
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, [userId, reverbConnectionFailed]);

  const value: LiveRefreshContextValue = { subscribe, invalidate, refreshAll };

  return (
    <LiveRefreshContext.Provider value={value}>
      {children}
    </LiveRefreshContext.Provider>
  );
}

export function useLiveRefreshContext(): LiveRefreshContextValue | null {
  return useContext(LiveRefreshContext);
}

export interface UseLiveRefreshOptions {
  enabled?: boolean;
}

/**
 * Subscribe to centralised live-refresh for a given context. When the backend
 * reports a change for that context, refetch is called (silent refetch).
 * Use for bookings, notifications, children, trainer_schedules so parent,
 * admin, and trainer dashboards update without browser refresh.
 */
export function useLiveRefresh(
  context: LiveRefreshContextType,
  refetch: RefetchFn,
  options: UseLiveRefreshOptions = {}
): void {
  const ctx = useLiveRefreshContext();
  const { enabled = true } = options;
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  useEffect(() => {
    if (!ctx || !enabled) return;
    const unsub = ctx.subscribe(context, () => Promise.resolve(refetchRef.current()));
    return unsub;
  }, [ctx, context, enabled]);
}
