'use client';

import React from 'react';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';

interface FeaturedPackagePriceProps {
  price: number | string;
}

export default function FeaturedPackagePrice({ price }: FeaturedPackagePriceProps) {
  const { isApproved, loading } = useAuth();

  if (loading || !isApproved) {
    return null;
  }

  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-[#1E3A5F]">£{price}</div>
      <div className="text-xs text-gray-500">Complete Package</div>
    </div>
  );
}
