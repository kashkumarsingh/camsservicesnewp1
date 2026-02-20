'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
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

export function LiveRefreshProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

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

  // WebSocket (Echo) when Reverb is configured – real-time live refresh
  useEffect(() => {
    if (!LIVE_REFRESH_HAS_WEBSOCKET_CONFIG || !user?.id) {
      if (typeof window !== 'undefined' && user?.id && process.env.NODE_ENV === 'development') {
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

    let echo: {
      private: (ch: string) => {
        listen: (ev: string, cb: (payload: { contexts?: string[] }) => void) => void;
      };
      disconnect: () => void;
    } | null = null;

    const connect = async () => {
      const token =
        typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
      if (!token) return;

      const [EchoModule, PusherModule] = await Promise.all([
        import('laravel-echo'),
        import('pusher-js'),
      ]);
      const Echo = EchoModule.default;
      const PusherConstructor =
        (PusherModule as unknown as { default: typeof import('pusher-js') }).default ?? PusherModule;

      const baseUrl =
        typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
          ? String(process.env.NEXT_PUBLIC_API_URL).replace(/\/api\/v1\/?$/, '')
          : '';
      const authEndpoint = baseUrl ? `${baseUrl}/api/v1/broadcasting/auth` : '';

      (window as unknown as { Pusher: typeof PusherConstructor }).Pusher = PusherConstructor;

      echo = new Echo({
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
      });

      const channelName = `live-refresh.${user.id}`;
      echo.private(channelName).listen('.LiveRefreshContextsUpdated', (payload: { contexts?: string[] }) => {
        const contexts = payload?.contexts ?? [];
        contexts.forEach((ctx) => {
          if (LIVE_REFRESH_CONTEXTS_LIST.includes(ctx)) {
            notifyContext(ctx as LiveRefreshContextType);
          }
        });
      });

      const isAdmin = isAdminRole(user.role);
      if (isAdmin) {
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
      if (echo && typeof echo.disconnect === 'function') {
        echo.disconnect();
      }
    };
  }, [user?.id, user?.role]);

  // Polling fallback when WebSocket/Reverb is not available (e.g. Render) – same refetch behaviour
  const refreshAllRef = useRef(refreshAll);
  refreshAllRef.current = refreshAll;
  useEffect(() => {
    if (!user?.id || LIVE_REFRESH_HAS_WEBSOCKET_CONFIG) return;

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
  }, [user?.id]);

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
