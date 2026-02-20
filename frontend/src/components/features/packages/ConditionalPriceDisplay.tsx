'use client';

import React from 'react';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { formatCurrency, formatCurrencyWhole } from '@/utils/currencyFormatter';

interface ConditionalPriceDisplayProps {
  price: number;
  showSavings?: boolean;
  savingsMultiplier?: number;
}

export default function ConditionalPriceDisplay({ 
  price, 
  showSavings = true,
  savingsMultiplier = 1.3 
}: ConditionalPriceDisplayProps) {
  const { isApproved, loading } = useAuth();

  if (loading || !isApproved) {
    return null;
  }

  const originalPrice = Math.floor(price * savingsMultiplier);
  const savings = Math.floor(price * (savingsMultiplier - 1));

  return (
    <div>
      <div className="text-3xl font-extrabold bg-gradient-to-r from-primary-blue to-light-blue-cyan bg-clip-text text-transparent">
        {formatCurrency(price)}
      </div>
      {showSavings && (
        <div className="text-xs text-gray-600">
          <span className="line-through opacity-50">{formatCurrencyWhole(originalPrice)}</span>
          <span className="ml-2 text-green-600 font-semibold">Save {formatCurrencyWhole(savings)}</span>
        </div>
      )}
    </div>
  );
}
