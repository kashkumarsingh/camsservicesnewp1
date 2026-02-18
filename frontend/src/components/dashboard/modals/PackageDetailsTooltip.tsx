'use client';

import React from 'react';
import { Package, Clock, CheckCircle, AlertCircle, XCircle, CreditCard } from 'lucide-react';
import moment from 'moment';
import type { BookingDTO } from '@/core/application/booking/dto/BookingDTO';

interface PackageDetailsTooltipProps {
  booking: BookingDTO | null;
  packageName: string;
  packageStatus: 'active' | 'expiring_soon' | 'expired' | 'payment_pending';
  totalHours: number;
  bookedHours: number;
  remainingHours: number;
  packageExpiresAt?: string;
  outstandingAmount?: number;
  pendingHours?: number;
  onClose: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Package Details Tooltip Component
 * 
 * Shows quick package information on hover/tap
 */
export default function PackageDetailsTooltip({
  booking,
  packageName,
  packageStatus,
  totalHours,
  bookedHours,
  remainingHours,
  packageExpiresAt,
  outstandingAmount,
  pendingHours,
  onClose,
  position = 'top',
}: PackageDetailsTooltipProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatExpiryLabel = (expiresAt: string) => {
    const daysUntilExpiry = moment(expiresAt).diff(moment(), 'days');
    const dateLabel = moment(expiresAt).format('DD MMM YYYY');

    if (daysUntilExpiry > 0) {
      return `Expires ${dateLabel} (${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} remaining)`;
    }
    if (daysUntilExpiry === 0) {
      return `Expires ${dateLabel} (expires today)`;
    }
    return `Expired ${dateLabel} (${Math.abs(daysUntilExpiry)} day${Math.abs(daysUntilExpiry) !== 1 ? 's' : ''} ago)`;
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className={`absolute z-50 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 ${positionClasses[position]}`}
      role="tooltip"
      aria-label="Package details"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
        <Package size={16} className="text-blue-600 dark:text-blue-400" />
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{packageName} Package</h4>
        {packageStatus === 'expired' ? (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 flex items-center gap-1 ml-auto">
            <XCircle size={10} />
            Expired
          </span>
        ) : packageStatus === 'expiring_soon' ? (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center gap-1 ml-auto">
            <AlertCircle size={10} />
            Expiring Soon
          </span>
        ) : packageStatus === 'payment_pending' ? (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 flex items-center gap-1 ml-auto">
            <CreditCard size={10} />
            Payment Pending
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 flex items-center gap-1 ml-auto">
            <CheckCircle size={10} />
            Active
          </span>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2 text-xs">
        {packageStatus === 'payment_pending' && outstandingAmount !== undefined && outstandingAmount > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Total Hours:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{pendingHours?.toFixed(1) || totalHours.toFixed(1)}h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Unpaid:</span>
              <span className="font-semibold text-red-600 dark:text-red-400">{pendingHours?.toFixed(1) || totalHours.toFixed(1)}h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Amount Due:</span>
              <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(outstandingAmount)}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Total Hours:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{totalHours.toFixed(1)}h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Booked:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{bookedHours.toFixed(1)}h ({Math.round((bookedHours / totalHours) * 100)}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Remaining:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{remainingHours.toFixed(1)}h</span>
            </div>
          </>
        )}

        {packageExpiresAt && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Clock size={12} className="text-gray-500 dark:text-gray-400" />
            <span className="text-gray-600 dark:text-gray-200">{formatExpiryLabel(packageExpiresAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
