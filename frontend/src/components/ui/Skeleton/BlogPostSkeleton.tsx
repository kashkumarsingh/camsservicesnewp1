/**
 * Blog Post Skeleton Component
 * 
 * Reusable skeleton loading component for blog post cards.
 */

import React from 'react';

interface BlogPostSkeletonProps {
  count?: number;
}

export default function BlogPostSkeleton({ count = 1 }: BlogPostSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={`blog-skeleton-${i}`} className="bg-white rounded-card border-2 border-gray-200 shadow-md overflow-hidden h-full flex flex-col">
          {/* Image Skeleton */}
          <div className="relative w-full h-48 bg-gray-200 animate-pulse" />
          {/* Content Skeleton */}
          <div className="flex-1 p-6 flex flex-col space-y-4">
            <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
            <div className="flex items-center gap-4 mt-auto pt-4">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

