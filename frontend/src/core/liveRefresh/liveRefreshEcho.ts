// WebSocket (Reverb) subscription for live-refresh – see REALTIME_LIVE_DATA_ARCHITECTURE.md

import { LIVE_REFRESH_CONTEXTS, type LiveRefreshContextType } from '@/utils/liveRefreshConstants';

export interface LiveRefreshEchoOptions {
  userId: number;
  userRole?: string;
  getToken: () => string | null;
  authEndpoint: string;
  wsConfig: { key: string; wsHost: string; wsPort: string; wssPort: string; scheme: string };
  onContexts: (contexts: LiveRefreshContextType[]) => void;
}

export async function subscribeLiveRefreshEcho(opts: LiveRefreshEchoOptions): Promise<() => void> {
  const { userId, userRole, getToken, authEndpoint, wsConfig, onContexts } = opts;
  if (!getToken()) return () => {};

  const [EchoModule, PusherModule] = await Promise.all([
    import('laravel-echo'),
    import('pusher-js'),
  ]);
  const Echo = EchoModule.default;
  const Pusher = (PusherModule as { default: unknown }).default;

  if (typeof window !== 'undefined') {
    (window as unknown as { Pusher: unknown }).Pusher = Pusher;
  }

  const echo = new Echo({
    broadcaster: 'reverb',
    key: wsConfig.key,
    wsHost: wsConfig.wsHost,
    wsPort: wsConfig.wsPort || '8080',
    wssPort: wsConfig.wssPort || '443',
    forceTLS: wsConfig.scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint,
    auth: {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        Accept: 'application/json',
      },
    },
  });

  const handle = (payload: { contexts?: string[] }) => {
    const list = (payload?.contexts ?? []).filter((c) =>
      LIVE_REFRESH_CONTEXTS.includes(c as LiveRefreshContextType)
    ) as LiveRefreshContextType[];
    if (list.length) onContexts(list);
  };

  echo.private(`live-refresh.${userId}`).listen('.LiveRefreshContextsUpdated', handle);
  if (userRole === 'admin' || userRole === 'super_admin') {
    echo.private('live-refresh.admin').listen('.LiveRefreshContextsUpdated', handle);
  }

  return () => {
    if (typeof echo.disconnect === 'function') echo.disconnect();
  };
}
