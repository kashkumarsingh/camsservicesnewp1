'use client';

import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import { PackageCard } from '@/interfaces/web/components/packages';
import { PackageSkeleton } from '@/components/ui/Skeleton';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import type { PackageDTO } from '@/core/application/packages/dto/PackageDTO';
import { DEFAULT_HOME_STRINGS } from '@/components/home/constants';

export interface PackagesSectionConfig {
  title: string;
  subtitle?: string;
  viewAllLabel: string;
  viewAllHref: string;
  /** Optional background video URL (e.g. from home defaults). */
  backgroundVideoUrl?: string;
}

export interface PackagesSectionProps {
  config: PackagesSectionConfig;
  packages: PackageDTO[];
  allPackages: PackageDTO[];
  isLoading: boolean;
  error: Error | null;
}

export function PackagesSection({ config, packages, allPackages, isLoading, error }: PackagesSectionProps) {
  const showSkeleton = isLoading && packages.length === 0;
  const showError = !isLoading && error != null && packages.length === 0;
  const showEmpty = !isLoading && error == null && packages.length === 0;
  const hasData = packages.length > 0;

  return (
    <Section className="py-16 bg-gradient-to-br from-sky-50 via-white to-purple-50 relative overflow-hidden">
      {config.backgroundVideoUrl && (
        <>
          <div className="absolute inset-0 z-0">
            <video
              className="w-full h-full object-cover"
              src={config.backgroundVideoUrl}
              loop
              autoPlay
              playsInline
              muted
              aria-hidden
            />
          </div>
          <div className="absolute inset-0 z-[5] bg-white/92 pointer-events-none" aria-hidden />
        </>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy-blue mb-3">{config.title}</h2>
          {config.subtitle && <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">{config.subtitle}</p>}
        </div>
        {showSkeleton && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-12">
            <PackageSkeleton count={SKELETON_COUNTS.PACKAGES} />
          </div>
        )}
        {showError && (
          <div className="text-center py-12 mb-12">
            <p className="text-gray-600 mb-4">{error?.message ?? DEFAULT_HOME_STRINGS.PACKAGES_LOAD_ERROR_FALLBACK}</p>
            <Button href={config.viewAllHref} variant="primary" size="lg" className="rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300" withArrow>
              View packages page
            </Button>
          </div>
        )}
        {showEmpty && (
          <div className="text-center py-12 mb-12">
            <p className="text-gray-600 mb-4">{DEFAULT_HOME_STRINGS.PACKAGES_EMPTY_MESSAGE}</p>
            <Button href={config.viewAllHref} variant="primary" size="lg" className="rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300" withArrow>
              {config.viewAllLabel}
            </Button>
          </div>
        )}
        {hasData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-12">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} package={pkg} allPackages={allPackages} />
            ))}
          </div>
        )}
        <div className="text-center">
          <Button href={config.viewAllHref} variant="primary" size="lg" className="rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300" withArrow>
            {config.viewAllLabel}
          </Button>
        </div>
      </div>
    </Section>
  );
}
