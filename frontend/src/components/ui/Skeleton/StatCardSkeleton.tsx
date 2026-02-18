/**
 * StatCard Skeleton Component
 * 
 * Reusable skeleton loading component for stat cards.
 * Matches the StatCard component structure exactly.
 */

import React from 'react';

interface StatCardSkeletonProps {
  count?: number;
  showProgress?: boolean;
}

export default function StatCardSkeleton({ count = 1, showProgress = false }: StatCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={`stat-card-skeleton-${i}`}
          className="rounded-xl border-2 border-gray-200 bg-white p-4 sm:p-6 min-h-[100px] relative animate-pulse"
        >
          {/* Title Skeleton */}
          <div className="flex items-center justify-between mb-1">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            {showProgress && <div className="h-4 w-16 bg-gray-200 rounded-full" />}
          </div>

          {/* Value Skeleton */}
          <div className="flex items-baseline gap-2 mb-1">
            <div className="h-8 w-20 bg-gray-200 rounded" />
          </div>

          {/* Progress Bar Skeleton (if showProgress) */}
          {showProgress && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="h-1.5 w-1/3 bg-gray-300 rounded-full" />
              </div>
            </div>
          )}

          {/* Icon Skeleton (top right) */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <div className="h-6 w-6 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </>
  );
}
