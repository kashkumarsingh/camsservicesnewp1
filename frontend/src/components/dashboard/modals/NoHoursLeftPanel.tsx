'use client';

import React from 'react';
import { X, CreditCard } from 'lucide-react';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';

export interface NoHoursLeftPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** First child ID to offer top-up for (has package, 0 remaining hours). */
  childIdForTopUp: number | null;
  /** Open the Top-up flow for this child. */
  onTopUp: (childId: number) => void;
}

/**
 * Side panel shown when the parent clicks a calendar date but has no hours left.
 * Same pattern as NoApprovedChildrenPanel: show message and single CTA (Top up) instead of opening the booking modal.
 */
export default function NoHoursLeftPanel({
  isOpen,
  onClose,
  childIdForTopUp,
  onTopUp,
}: NoHoursLeftPanelProps) {
  if (!isOpen) return null;

  const { title, message, actionLabel } = EMPTY_STATE.NO_HOURS_LEFT_PANEL;
  const canTopUp = childIdForTopUp != null;

  const handleTopUp = () => {
    onClose();
    if (childIdForTopUp != null) onTopUp(childIdForTopUp);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-overlay bg-black/30 transition-opacity"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-md z-overlay bg-white dark:bg-gray-800 shadow-xl flex flex-col border-l border-gray-200 dark:border-gray-700"
        role="dialog"
        aria-modal="true"
        aria-labelledby="no-hours-left-panel-title"
        aria-describedby="no-hours-left-panel-desc"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h2
            id="no-hours-left-panel-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"
          >
            <CreditCard className="h-5 w-5 text-primary-blue shrink-0" aria-hidden />
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </div>
        <div id="no-hours-left-panel-desc" className="flex-1 overflow-y-auto p-5">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {message}
            </p>
            {canTopUp && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleTopUp}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-blue px-4 py-3 text-sm font-medium text-white hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2"
                >
                  <CreditCard className="h-4 w-4 shrink-0" aria-hidden />
                  {actionLabel}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
