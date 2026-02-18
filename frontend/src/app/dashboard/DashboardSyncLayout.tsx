'use client';

import React from 'react';
import { DashboardShell } from '@/components/dashboard/layout/DashboardShell';
import { ParentDashboardHeaderProvider } from '@/components/dashboard/layout/ParentDashboardHeaderContext';
import { DashboardSyncProvider } from '@/core/dashboardSync/DashboardSyncContext';
import { LiveRefreshProvider } from '@/core/liveRefresh/LiveRefreshContext';

/**
 * Client wrapper for dashboard layout: enables centralised dashboard sync
 * (cache-first when returning to tab/route) and centralised live-refresh
 * (single poll, context invalidation for parent, admin, trainer) without browser refresh.
 */
export function DashboardSyncLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardSyncProvider enabled>
      <LiveRefreshProvider>
        <ParentDashboardHeaderProvider>
          <DashboardShell>{children}</DashboardShell>
        </ParentDashboardHeaderProvider>
      </LiveRefreshProvider>
    </DashboardSyncProvider>
  );
}
