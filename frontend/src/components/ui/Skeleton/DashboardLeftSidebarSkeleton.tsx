/**
 * Dashboard Left Sidebar Skeleton Component
 *
 * Reusable skeleton loading component for dashboard left sidebar.
 * Matches DashboardLeftSidebar structure: Actions button, mini calendar,
 * Upcoming Sessions, My Children.
 */

import React from 'react';

export default function DashboardLeftSidebarSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Actions Button */}
      <div className="h-12 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full" />

      {/* Mini Calendar Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-3">
        {/* Mini calendar header */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="flex gap-1">
            <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
        {/* Weekday row */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={`weekday-${i}`} className="h-3 w-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
          ))}
        </div>
        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: 35 }, (_, i) => (
            <div
              key={`day-${i}`}
              className="aspect-square max-w-8 max-h-8 bg-gray-100 dark:bg-gray-700/80 rounded"
            />
          ))}
        </div>
        <div className="mt-2 flex justify-center">
          <div className="h-6 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>

      {/* Upcoming Sessions Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-3 py-2.5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="px-3 pb-3 pt-2 space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={`upcoming-${i}`}
              className="p-2 rounded-lg border border-gray-100 dark:border-gray-600"
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-10 text-center space-y-1">
                  <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
                  <div className="h-5 w-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Children Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-3 py-2.5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="px-3 pb-3 pt-2 space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={`child-${i}`} className="flex items-center gap-2 p-2">
              <div className="h-4 w-4 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700" />
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-2 py-2 flex flex-wrap gap-x-4 gap-y-1">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}
