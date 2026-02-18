'use client';

import React from 'react';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';

interface ConditionalPriceTextProps {
  price: number | string;
  currency?: string;
  className?: string;
  label?: string;
}

/**
 * Conditionally displays price text only for approved parents.
 * Returns null for unapproved parents.
 */
export default function ConditionalPriceText({
  price,
  currency = '£',
  className = '',
  label,
}: ConditionalPriceTextProps) {
  const { isApproved, loading } = useAuth();

  if (loading || !isApproved) {
    return null;
  }

  return (
    <div className={className}>
      <div className="text-3xl md:text-4xl font-bold text-[#1E3A5F]">{currency}{price}</div>
      {label && <div className="text-xs text-gray-500">{label}</div>}
    </div>
  );
}
