/**
 * Package List Component
 * 
 * Displays a list of packages.
 */

'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePackages } from '../../hooks/packages/usePackages';
import PackageCard from './PackageCard';
import { PackageFilterOptions } from '@/core/application/packages';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import { PackageSkeleton } from '@/components/ui/Skeleton';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';
import { usePackageRecommendations } from '@/interfaces/web/hooks/packages/usePackageRecommendations';

interface PackageListProps {
  filterOptions?: PackageFilterOptions;
}

export default function PackageList({ filterOptions }: PackageListProps) {
  const { packages, loading, error } = usePackages(filterOptions);
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');

  // Get recommendations and sort packages
  const { recommendations, getRecommendation, isRecommended } = usePackageRecommendations({
    childId: childId ? parseInt(childId, 10) : null,
    packages,
  });

  // Sort packages: recommended first, then by recommendation score
  const sortedPackages = useMemo(() => {
    if (recommendations.length === 0) return packages;

    const recommendationMap = new Map(recommendations.map(r => [r.packageId, r]));
    
    return [...packages].sort((a, b) => {
      const recA = recommendationMap.get(a.id);
      const recB = recommendationMap.get(b.id);
      
      // Recommended packages first
      if (recA && !recB) return -1;
      if (!recA && recB) return 1;
      if (recA && recB) {
        // Sort by score (higher first)
        return recB.score - recA.score;
      }
      
      // Non-recommended packages maintain original order
      return 0;
    });
  }, [packages, recommendations]);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        <PackageSkeleton count={SKELETON_COUNTS.PACKAGES} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <div className="max-w-md mx-auto bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Unable to Load Packages</h3>
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 text-sm">{EMPTY_STATE.NO_PACKAGES_FOUND.title}</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
      {sortedPackages.map((pkg) => (
        <PackageCard 
          key={pkg.id} 
          package={pkg} 
          allPackages={packages}
          recommendation={getRecommendation(pkg.id)}
          isRecommended={isRecommended(pkg.id, 20)}
        />
      ))}
    </div>
  );
}


