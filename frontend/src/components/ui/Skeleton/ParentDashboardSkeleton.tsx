/**
 * Parent Dashboard Skeleton
 *
 * Matches ParentDashboardPageClient layout: content is inside DashboardShell.
 * Mobile: sidebar on top (order-1), calendar below (order-2).
 * Desktop: calendar left, right sidebar 320px, sticky.
 */

import React from 'react';
import CalendarSkeleton from './CalendarSkeleton';
import DashboardSidebarSkeleton from './DashboardSidebarSkeleton';

const CONTENT_PADDING = 'px-6 sm:px-8 md:px-10 py-6 sm:py-8 md:py-10';
const SPACING = 'gap-4 sm:gap-6 md:gap-8 lg:gap-10 2xl:gap-12';

export default function ParentDashboardSkeleton() {
  return (
    <section className={`space-y-10 ${CONTENT_PADDING} animate-pulse`} aria-busy="true" aria-label="Loading dashboard">
      {/* Header – matches parent dashboard: greeting + action buttons */}
      <header className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-7 w-40 sm:h-8 sm:w-48 bg-slate-200 dark:bg-slate-700 rounded" aria-hidden />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-8 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </header>

      {/* Main: mobile = sidebar (order-1) then calendar (order-2); lg = calendar (order-1) then sidebar (order-2) */}
      <div className={`mb-8 flex flex-col lg:flex-row ${SPACING}`}>
        <div className="order-1 flex-shrink-0 w-full lg:order-2 lg:w-80 xl:w-96 lg:pl-8 pt-2 lg:pt-0 lg:px-0">
          <DashboardSidebarSkeleton />
        </div>
        <div className="order-2 min-w-0 flex-1 lg:order-1">
          <CalendarSkeleton />
        </div>
      </div>
    </section>
  );
}
