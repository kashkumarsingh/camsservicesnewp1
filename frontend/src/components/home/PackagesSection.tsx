'use client';

import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import { PackageCard } from '@/interfaces/web/components/packages';
import { PackageSkeleton } from '@/components/ui/Skeleton';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import type { PackageDTO } from '@/core/application/packages/dto/PackageDTO';

export interface PackagesSectionConfig {
  title: string;
  subtitle?: string;
  viewAllLabel: string;
  viewAllHref: string;
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
  const hasData = packages.length > 0;

  return (
    <Section className="py-16 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <video className="w-full h-full object-cover" src="/videos/space-bg-2.mp4" loop autoPlay muted playsInline />
      </div>
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy-blue mb-3">{config.title}</h2>
          {config.subtitle && <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">{config.subtitle}</p>}
        </div>
        {showSkeleton && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-12">
            <PackageSkeleton count={SKELETON_COUNTS.PACKAGES} />
          </div>
        )}
        {showError && (
          <div className="text-center py-12 mb-12">
            <p className="text-gray-600 mb-4">{error?.message ?? 'Unable to load packages right now.'}</p>
            <Button href={config.viewAllHref} variant="secondary" size="lg" withArrow>
              View packages page
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
          <Button href={config.viewAllHref} variant="secondary" size="lg" withArrow>
            {config.viewAllLabel}
          </Button>
        </div>
      </div>
    </Section>
  );
}
