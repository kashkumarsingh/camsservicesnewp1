'use client';

import React from 'react';
import Link from 'next/link';
import PackageCheckout from '@/components/features/packages/PackageCheckout';
import { ROUTES } from '@/utils/routes';

// Import types for compatibility
import { Package, OriginalTrainer } from '@/components/features/booking/types';

interface PackageBookingFlowProps {
  packageData?: Package;
  packageSlug?: string;
  rawTrainers?: OriginalTrainer[];
  allActivities?: Array<{ id: number; name: string; imageUrl: string; duration: number; description: string; available_in_regions?: string[] }>;
  initialBookingReference?: string | null;
  initialChildId?: number | null;
}

/**
 * Package Booking Flow Component
 * 
 * This component provides a simplified single-page checkout for package purchases.
 * Replaces the multi-step wizard with a streamlined checkout experience.
 */
const PackageBookingFlow: React.FC<PackageBookingFlowProps> = ({
  packageData,
  packageSlug,
  rawTrainers = [],
  allActivities: apiActivities = [],
  initialBookingReference = null,
  initialChildId = null,
}) => {
  // If packageSlug is provided but packageData is not, find it from packages
  const resolvedPackage = packageData || (packageSlug ? (() => {
    const { packages } = require('@/data/packagesData');
    return packages.find((p: Package) => p.slug === packageSlug);
  })() : null);

  if (!resolvedPackage) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl border-2 border-gray-200 p-6">
          <p className="text-center text-gray-600">Package not found. Please <Link href={ROUTES.PACKAGES} className="text-primary-blue underline">select a package</Link> to continue.</p>
        </div>
      </div>
    );
  }

  // Convert package ID to number if it's a string
  const packageId = typeof resolvedPackage.id === 'string' 
    ? parseInt(resolvedPackage.id, 10) 
    : resolvedPackage.id;

  if (!packageId || isNaN(packageId)) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl border-2 border-gray-200 p-6">
          <p className="text-center text-gray-600">Invalid package. Please <Link href={ROUTES.PACKAGES} className="text-primary-blue underline">select a package</Link> to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <PackageCheckout
      packageName={resolvedPackage.name}
      packageSlug={resolvedPackage.slug}
      packageId={packageId}
      packagePrice={resolvedPackage.price as unknown as number}
      totalHours={resolvedPackage.hours}
      initialChildId={initialChildId}
    />
  );
};

export default PackageBookingFlow;


