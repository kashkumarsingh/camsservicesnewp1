'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  PoundSterling,
  Users,
  ClipboardList,
  CalendarDays,
  UserCheck,
  UserCog,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { BaseModal } from '@/components/ui/Modal';
import { ROUTES } from '@/shared/utils/routes';

export interface NeedsAttentionItem {
  id: string;
  count: number;
  label: string;
  actionLabel: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  /** 'modal-unassigned' | 'modal-pending-payments' | 'modal-zero-hours' opens that modal; otherwise navigates to href */
  kind: 'modal-unassigned' | 'modal-pending-payments' | 'modal-zero-hours' | 'navigate';
  href?: string;
}

interface NeedsAttentionModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Total count of pending decisions (shown in title). */
  total: number;
  items: NeedsAttentionItem[];
  onOpenUnassigned: () => void;
  onOpenPendingPayments: () => void;
  onOpenZeroHours: () => void;
}

export function NeedsAttentionModal({
  isOpen,
  onClose,
  total,
  items,
  onOpenUnassigned,
  onOpenPendingPayments,
  onOpenZeroHours,
}: NeedsAttentionModalProps) {
  const router = useRouter();

  const handleItemClick = (item: NeedsAttentionItem) => {
    if (item.kind === 'modal-unassigned') {
      onClose();
      // Defer opening so this modal unmounts first and we avoid two backdrops / z-index stacking
      requestAnimationFrame(() => onOpenUnassigned());
    } else if (item.kind === 'modal-pending-payments') {
      onClose();
      requestAnimationFrame(() => onOpenPendingPayments());
    } else if (item.kind === 'modal-zero-hours') {
      onClose();
      requestAnimationFrame(() => onOpenZeroHours());
    } else if (item.href) {
      onClose();
      router.push(item.href);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pending decisions (${total})`}
      size="md"
    >
      {items.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">All clear — no pending decisions.</p>
      ) : (
        <ul className="space-y-2" role="list">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-amber-200/60 bg-amber-50/60 px-3 py-2.5 text-left text-sm transition-colors hover:bg-amber-100/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 dark:border-amber-800/60 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 dark:focus:ring-offset-slate-900"
                >
                  <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <Icon className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                    {item.label}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-amber-700 dark:text-amber-300">
                    {item.actionLabel}
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </BaseModal>
  );
}
