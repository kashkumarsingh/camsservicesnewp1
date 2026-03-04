'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BaseModal } from '@/components/ui/Modal';
import type { ChildWithZeroHoursItem } from '@/interfaces/web/hooks/dashboard/useAdminDashboardStats';

interface ZeroHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  zeroHoursList: ChildWithZeroHoursItem[];
}

const TEMPLATE_MESSAGE =
  'Hi, your child has 0 hours remaining. Please purchase more hours to continue sessions.';

export function ZeroHoursModal({ isOpen, onClose, zeroHoursList: list }: ZeroHoursModalProps) {
  const router = useRouter();

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Children with 0 hours (${list.length})`}
      size="lg"
      footer={
        <div className="space-y-2">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Contact these parents (email/phone) to encourage them to buy more hours.
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push('/dashboard/admin/children?hours=0');
            }}
            className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
          >
            View full list & parent contacts →
          </button>
        </div>
      }
    >
      {list.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">No children with 0 hours.</p>
      ) : (
        <div className="space-y-4">
          <ul className="space-y-4">
            {list.map((item) => (
              <li
                key={item.childId}
                className="rounded-lg border border-rose-200 bg-rose-50/50 p-3 dark:border-rose-800 dark:bg-rose-950/30"
              >
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {item.childName}
                </p>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                  Parent: {item.parentName}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">
                  Package: {item.packageName} · Hours remaining: {item.remainingHours}h
                </p>
                <p className="mt-1 text-xs font-medium text-rose-700 dark:text-rose-300">
                  Cannot attend session without hours.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push(`/dashboard/admin/children/${item.childId}`);
                    }}
                    className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-300"
                  >
                    View child
                  </button>
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
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Template message:
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 italic">
              &ldquo;{TEMPLATE_MESSAGE}&rdquo;
            </p>
          </div>
        </div>
      )}
    </BaseModal>
  );
}
