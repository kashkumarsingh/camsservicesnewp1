/**
 * Package Skeleton Component
 * 
 * Reusable skeleton loading component for package cards.
 */

import React from 'react';

interface PackageSkeletonProps {
  count?: number;
}

export default function PackageSkeleton({ count = 1 }: PackageSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={`package-skeleton-${i}`} className="relative rounded-card border-2 border-gray-200 shadow-md bg-white h-full overflow-hidden">
          {/* Image Skeleton */}
          <div className="relative w-full h-48 bg-gray-200 animate-pulse" />
          {/* Content Skeleton */}
          <div className="p-6 md:p-8 space-y-4">
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-1/2 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      ))}
    </>
  );
}

