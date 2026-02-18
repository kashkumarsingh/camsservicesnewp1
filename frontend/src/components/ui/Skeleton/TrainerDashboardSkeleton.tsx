/**
 * Trainer Dashboard Skeleton
 *
 * Matches TrainerDashboardPageClient layout: header (greeting + action bar)
 * plus main content area (schedule/timesheets/more). Renders inside DashboardShell.
 */

import React from 'react';

const PADDING = 'px-5 sm:px-6 md:px-8';

export default function TrainerDashboardSkeleton() {
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 lg:pb-0 animate-pulse`} aria-busy="true" aria-label="Loading dashboard">
      <div className={`w-full ${PADDING}`}>
        {/* Header – greeting + action buttons */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="h-7 w-44 sm:h-8 sm:w-52 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>

        {/* Main content block – schedule/tab area */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="flex gap-2">
                <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div className="h-64 sm:h-80 bg-gray-100 dark:bg-gray-700/50 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
