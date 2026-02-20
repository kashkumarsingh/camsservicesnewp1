/**
 * Trainer Skeleton Component
 * 
 * Reusable skeleton loading component for trainer cards.
 */

import React from 'react';

interface TrainerSkeletonProps {
  count?: number;
}

export default function TrainerSkeleton({ count = 1 }: TrainerSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={`trainer-skeleton-${i}`} className="rounded-card border-2 border-gray-200 overflow-hidden bg-white shadow-md">
          {/* Image Skeleton */}
          <div className="relative w-full aspect-[4/3] bg-gray-200 animate-pulse" />
          {/* Content Skeleton */}
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-7 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </>
  );
}

