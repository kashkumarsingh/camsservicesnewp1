'use client';

import React from 'react';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Shield } from 'lucide-react';
import type { PackageDTO } from '@/core/application/packages';

interface PackageBookingCardProps {
  pkg: PackageDTO;
}

export default function PackageBookingCard({ pkg }: PackageBookingCardProps) {
  const { isApproved, loading } = useAuth();
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');
  const buyPackageUrl = childId
    ? `/dashboard/parent?package=${encodeURIComponent(pkg.slug)}&childId=${childId}`
    : `/dashboard/parent?package=${encodeURIComponent(pkg.slug)}`;

  return (
    <div className="bg-gradient-to-br from-[#0080FF] to-[#00D4FF] rounded-2xl p-5 border-2 border-[#0080FF] shadow-xl text-white">
      <div className="text-center mb-4">
        {/* Conditionally show price only for approved parents */}
        {!loading && isApproved ? (
          <div className="text-3xl font-extrabold mb-1">£{pkg.price}</div>
        ) : null}
        <div className="text-sm opacity-90">{pkg.hours}h Complete Package</div>
        {pkg.calculatedActivities && (
          <div className="text-sm opacity-90 mt-1">
            {pkg.calculatedActivities} Activities Included
          </div>
        )}
      </div>
      <Button 
        href={buyPackageUrl} 
        variant="yellow" 
        size="lg" 
        className="w-full mb-3 shadow-lg font-bold" 
        withArrow
      >
        Buy package (go to dashboard)
      </Button>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-xs opacity-90 mb-2">
          <Shield size={14} />
          <span>Secure Payment</span>
          <span>•</span>
          <span>Instant Confirmation</span>
        </div>
        {pkg.spotsRemaining && pkg.spotsRemaining <= 5 && (
          <div className="bg-orange-500/20 border border-orange-300/50 text-orange-100 text-xs font-semibold px-3 py-1 rounded-full inline-block">
            ⚠️ Only {pkg.spotsRemaining} spots left
          </div>
        )}
      </div>
    </div>
  );
}
