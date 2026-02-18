/**
 * List Rows Skeleton Component
 *
 * Reusable skeleton for list loading states (notifications, today's sessions,
 * activities list, etc.). Uses centralized counts from skeletonConstants.
 */

import React from 'react';

interface ListRowsSkeletonProps {
  count?: number;
  /** Optional class for the container */
  className?: string;
}

export default function ListRowsSkeleton({ count = 4, className = '' }: ListRowsSkeletonProps) {
  return (
    <div className={`space-y-2 animate-pulse ${className}`.trim()} aria-busy="true" aria-label="Loading list">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={`list-row-skeleton-${i}`}
          className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2"
        >
          <div className="h-3 flex-1 max-w-[80%] bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded shrink-0" />
        </div>
      ))}
    </div>
  );
}
