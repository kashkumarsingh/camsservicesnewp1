'use client';

import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import PackageCheckout from '@/components/features/packages/PackageCheckout';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface CheckoutPageClientProps {
  packageName: string;
  packageSlug: string;
  packageId: number;
  packagePrice: number;
  totalHours: number;
  initialChildId?: number | null;
}

export default function CheckoutPageClient({
  packageName,
  packageSlug,
  packageId,
  packagePrice,
  totalHours,
  initialChildId = null,
}: CheckoutPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isApproved, hasApprovedChildren, loading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Preserve both package and childId parameters in redirect URL
      const childIdParam = searchParams.get('childId');
      const redirectUrl = childIdParam 
        ? `/checkout?package=${packageSlug}&childId=${childIdParam}`
        : `/checkout?package=${packageSlug}`;
      router.replace(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
    }
  }, [loading, isAuthenticated, router, packageSlug, searchParams]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary-blue mx-auto mb-4" size={32} />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  // Show pending approval message
  if (!isApproved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-card p-8 shadow-2xl border-2 border-yellow-200">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-navy-blue mb-4">Account Pending Approval</h1>
              <p className="text-lg text-navy-blue/80 mb-6">
                Your registration is pending admin approval. You'll be notified once approved.
              </p>
              <button
                onClick={() => router.push('/dashboard/parent')}
                className="bg-primary-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-blue/90 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show no approved children message
  if (!hasApprovedChildren) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-card p-8 shadow-2xl border-2 border-blue-200">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-navy-blue mb-4">No Approved Children</h1>
              <p className="text-lg text-navy-blue/80 mb-6">
                You need to add children and have them approved before purchasing packages.
              </p>
              <button
                onClick={() => router.push('/dashboard/parent')}
                className="bg-primary-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-blue/90 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PackageCheckout
      packageName={packageName}
      packageSlug={packageSlug}
      packageId={packageId}
      packagePrice={packagePrice}
      totalHours={totalHours}
      initialChildId={initialChildId}
    />
  );
}
