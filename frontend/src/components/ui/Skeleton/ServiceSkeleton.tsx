/**
 * Service Skeleton Component
 * 
 * Reusable skeleton loading component for service cards.
 */

import React from 'react';

interface ServiceSkeletonProps {
  count?: number;
}

export default function ServiceSkeleton({ count = 1 }: ServiceSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={`service-skeleton-${i}`} className="rounded-card border-2 border-gray-200 shadow-md bg-white p-6">
          {/* Icon Circle Skeleton */}
          <div className="w-16 h-16 bg-gray-200 rounded-full mb-4" />
          {/* Title Skeleton */}
          <div className="h-6 w-3/4 bg-gray-200 rounded mb-3" />
          {/* Description Skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-5/6 bg-gray-200 rounded" />
          </div>
          {/* Button Skeleton */}
          <div className="h-10 w-full bg-gray-200 rounded-lg" />
        </div>
      ))}
    </>
  );
}

