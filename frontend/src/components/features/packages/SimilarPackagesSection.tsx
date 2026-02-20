'use client';

/**
 * Similar Packages Section
 * 
 * Displays packages similar to the current package
 */

import React, { useMemo } from 'react';
import Link from 'next/link';
import { PackageDTO } from '@/core/application/packages';
import { SimilarPackagesService } from '@/core/application/packages';
import { PackageCard } from '@/interfaces/web/components/packages';
import { usePackages } from '@/interfaces/web/hooks/packages';
import { Sparkles } from 'lucide-react';
import { ROUTES } from '@/utils/routes';

interface SimilarPackagesSectionProps {
  currentPackage: PackageDTO;
}

export default function SimilarPackagesSection({ currentPackage }: SimilarPackagesSectionProps) {
  const { packages, loading } = usePackages();

  const similarPackages = useMemo(() => {
    if (!packages || packages.length === 0) return [];
    return SimilarPackagesService.findSimilar(currentPackage, packages, 3);
  }, [currentPackage, packages]);

  if (loading) {
    return null; // Don't show loading state - just hide section
  }

  if (similarPackages.length === 0) {
    return null; // Don't show section if no similar packages
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-primary-blue" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy-blue">
              Similar Packages
            </h2>
          </div>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Explore other packages that might interest you
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {similarPackages.map((similar) => (
            <PackageCard
              key={similar.package.id}
              package={similar.package}
              allPackages={packages}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href={ROUTES.PACKAGES}>
            <button className="px-6 py-3 bg-gradient-to-r from-primary-blue to-light-blue-cyan text-white font-semibold rounded-full hover:from-primary-blue/90 hover:to-light-blue-cyan/90 transition-all duration-300 shadow-md hover:shadow-lg">
              View All Packages →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
