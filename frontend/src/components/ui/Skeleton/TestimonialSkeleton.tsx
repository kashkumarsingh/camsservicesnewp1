/**
 * Testimonial Skeleton Component
 */

import React from 'react';

interface TestimonialSkeletonProps {
  count?: number;
}

export default function TestimonialSkeleton({ count = 3 }: TestimonialSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={`testimonial-skeleton-${index}`}
          className="relative flex flex-col rounded-card border-2 border-gray-200 shadow-md p-6 sm:p-8 bg-white h-full animate-pulse"
        >
          <div className="flex items-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, starIndex) => (
              <div key={starIndex} className="w-4 h-4 bg-gray-200 rounded-full" />
            ))}
          </div>

          <div className="space-y-3 mb-6">
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-4/5" />
          </div>

          <div className="flex items-center gap-4 mt-auto">
            <div className="w-12 h-12 rounded-full bg-gray-200" />
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}


