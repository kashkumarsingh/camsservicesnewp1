/**
 * Dashboard Sidebar Skeleton Component
 * 
 * Reusable skeleton loading component for dashboard right sidebar.
 * Matches the DashboardRightSidebar component structure.
 * Theme-aware for light and dark mode.
 * Uses SKELETON_COUNTS for consistent list lengths (no hardcoded counts).
 */

import React from 'react';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';

export default function DashboardSidebarSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4 animate-pulse">
      {/* Hours Available Card - matches right sidebar card styling */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-b border-gray-200 dark:border-gray-700">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-baseline justify-between mb-2">
            <div className="h-7 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 space-y-2">
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          {Array.from({ length: SKELETON_COUNTS.DASHBOARD_CHILDREN }, (_, i) => i + 1).map((i) => (
            <div key={`child-hour-${i}`} className="py-1.5 sm:py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
                <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded ml-5" />
            </div>
          ))}
        </div>
      </div>

      {/* Pending Actions Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 space-y-2">
          {Array.from({ length: SKELETON_COUNTS.DASHBOARD_PENDING_ACTIONS }, (_, i) => i + 1).map((i) => (
            <div
              key={`pending-action-skeleton-${i}`}
              className="py-1.5 sm:py-2 px-2 rounded border-l-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30"
            >
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-600 rounded mb-1.5" />
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-600 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
