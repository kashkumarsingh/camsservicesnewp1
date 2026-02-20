/**
 * Package Detail Component
 * 
 * Displays a single package in detail.
 */

'use client';

import { usePackage } from '../../hooks/packages/usePackage';
import { renderHtml } from '@/utils/htmlRenderer';

interface PackageDetailProps {
  slug: string;
  incrementViews?: boolean;
}

export default function PackageDetail({ slug, incrementViews = true }: PackageDetailProps) {
  const { package: pkg, loading, error } = usePackage(slug, incrementViews);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading package...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Package not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="prose lg:prose-xl mx-auto text-navy-blue">
        <div className="text-lg text-navy-blue mb-6">
          {renderHtml(pkg.description)}
        </div>
      </div>
    </div>
  );
}


