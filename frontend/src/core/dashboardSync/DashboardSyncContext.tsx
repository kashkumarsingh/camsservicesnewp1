'use client';

import React, { createContext, useContext } from 'react';

export interface DashboardSyncContextValue {
  /** When true, dashboard hooks use cache-first behaviour (show cache then silent refetch). */
  enabled: boolean;
}

const DashboardSyncContext = createContext<DashboardSyncContextValue | null>(null);

export function DashboardSyncProvider({
  children,
  enabled = true,
}: {
  children: React.ReactNode;
  enabled?: boolean;
}) {
  return (
    <DashboardSyncContext.Provider value={{ enabled }}>
      {children}
    </DashboardSyncContext.Provider>
  );
}

export function useDashboardSyncEnabled(): boolean {
  const ctx = useContext(DashboardSyncContext);
  return ctx?.enabled ?? false;
}
