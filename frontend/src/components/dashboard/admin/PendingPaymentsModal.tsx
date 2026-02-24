'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import type { PendingPaymentItem } from '@/interfaces/web/hooks/dashboard/useAdminDashboardStats';

interface PendingPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payments: PendingPaymentItem[];
}

export function PendingPaymentsModal({
  isOpen,
  onClose,
  payments,
}: PendingPaymentsModalProps) {
  const router = useRouter();
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-overlay flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pending-payments-title"
    >
      <div className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h2 id="pending-payments-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Pending payments ({payments.length})
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(85vh - 56px)' }}>
          {payments.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">No pending payments.</p>
          ) : (
            <ul className="space-y-4">
              {payments.map((item) => (
                <li
                  key={item.bookingId}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {item.reference} – £{item.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                    Parent: {item.parentName}
                  </p>
                  {item.overdueDays != null && item.overdueDays > 0 && (
                    <p className="mt-0.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                      Overdue: {item.overdueDays} day{item.overdueDays !== 1 ? 's' : ''}
                    </p>
                  )}
                  {item.nextPaymentDueAt && item.overdueDays === 0 && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">
                      Due: {new Date(item.nextPaymentDueAt + 'T12:00:00').toLocaleDateString('en-GB')}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">
                    Package: {item.packageName}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        router.push('/dashboard/admin/bookings');
                      }}
                      className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-300"
                    >
                      View booking
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-slate-200 px-4 py-2 dark:border-slate-700">
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push('/dashboard/admin/bookings?payment_status=pending');
            }}
            className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
          >
            View all in Bookings →
          </button>
        </div>
      </div>
    </div>
  );
}
