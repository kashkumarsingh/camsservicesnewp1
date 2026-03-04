'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BaseModal } from '@/components/ui/Modal';
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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pending payments (${payments.length})`}
      size="lg"
      footer={
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
      }
    >
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
    </BaseModal>
  );
}
