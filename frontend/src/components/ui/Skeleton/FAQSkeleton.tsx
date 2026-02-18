/**
 * FAQ Skeleton Component
 * 
 * Reusable skeleton loading component for FAQ items.
 */

import React from 'react';

interface FAQSkeletonProps {
  count?: number;
}

export default function FAQSkeleton({ count = 1 }: FAQSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={`faq-skeleton-${i}`} className="mb-6 p-6 rounded-lg shadow-md bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mx-auto" />
        </div>
      ))}
    </>
  );
}

