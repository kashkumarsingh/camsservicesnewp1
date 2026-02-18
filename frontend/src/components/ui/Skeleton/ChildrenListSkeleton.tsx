/**
 * Children List Skeleton Component
 * 
 * Reusable skeleton loading component for children list.
 * Matches the ChildrenList component structure.
 */

import React from 'react';

interface ChildrenListSkeletonProps {
  count?: number;
}

export default function ChildrenListSkeleton({ count = 3 }: ChildrenListSkeletonProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 animate-pulse overflow-hidden">
      {/* Section Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>

      {/* Children Cards */}
      <div className="space-y-4">
        {Array.from({ length: count }, (_, i) => (
          <div
            key={`children-list-skeleton-${i}`}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5"
          >
            {/* Child Header (Name + Status) */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div>
                  <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>

            {/* Package Information (for approved children) */}
            {i % 2 === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                  <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div>
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="sm:col-span-2">
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              {i % 2 === 0 && (
                <>
                  <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
