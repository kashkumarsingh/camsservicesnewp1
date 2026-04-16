'use client';

import React from 'react';
import Link from 'next/link';
import { X, AlertCircle, UserPlus, ClipboardList } from 'lucide-react';
import { BOOKING_VALIDATION_MESSAGES } from '@/dashboard/utils/bookingValidationMessages';
import { ROUTES } from '@/shared/utils/routes';

export interface NoApprovedChildrenPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Children who need to complete their checklist. First is used for the CTA. */
  childrenNeedingChecklist?: { id: number; name: string }[];
  /** Children whose checklist is submitted and awaiting admin review. */
  childrenAwaitingChecklistReview?: { id: number; name: string }[];
  /** All children still pending approval (any reason). When set with no checklist action needed, show "We're reviewing". */
  childrenPendingApproval?: { id: number; name: string }[];
  /** Open the Complete Checklist flow for a specific child. */
  onCompleteChecklist?: (childId: number) => void;
  /** Open the Add Child flow (e.g. dashboard Add Child modal). When not provided, link to dashboard. */
  onAddChild?: () => void;
}

/**
 * Sidepanel shown when the parent tries to book a session but has no approved children.
 * Shows a single message with CTAs: Complete checklist and/or Add child.
 * Do not open the Book Session form in this case — open this panel instead.
 */
export default function NoApprovedChildrenPanel({
  isOpen,
  onClose,
  childrenNeedingChecklist = [],
  childrenAwaitingChecklistReview = [],
  childrenPendingApproval = [],
  onCompleteChecklist,
  onAddChild,
}: NoApprovedChildrenPanelProps) {
  if (!isOpen) return null;

  const needsChecklist = childrenNeedingChecklist.length > 0;
  const awaitingReview =
    (childrenAwaitingChecklistReview?.length ?? 0) > 0 ||
    ((childrenPendingApproval?.length ?? 0) > 0 && childrenNeedingChecklist.length === 0);
  const first = childrenNeedingChecklist[0];
  const checklistLabel = first?.name?.trim()
    ? `${first.name}'s checklist`
    : BOOKING_VALIDATION_MESSAGES.YOUR_CHILD_CHECKLIST;

  const content =
    needsChecklist && first && onCompleteChecklist ? (
      <div className="space-y-4">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {BOOKING_VALIDATION_MESSAGES.NO_APPROVED_CHILDREN_TO_BOOK} Complete{' '}
          <span className="font-medium text-amber-800 dark:text-amber-200">{checklistLabel}</span>
          {BOOKING_VALIDATION_MESSAGES.CREATE_CHILD_PROFILE_BEFORE_BOOKING}
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onCompleteChecklist(first.id);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-3 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            <ClipboardList className="h-4 w-4 shrink-0" aria-hidden />
            Complete {checklistLabel}
          </button>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {BOOKING_VALIDATION_MESSAGES.OR_ADD_ANOTHER_CHILD}.
          </p>
          {onAddChild ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onAddChild();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <UserPlus className="h-4 w-4 shrink-0" aria-hidden />
              {BOOKING_VALIDATION_MESSAGES.ADD_CHILD_LABEL}
            </button>
          ) : (
            <Link
              href={ROUTES.DASHBOARD_PARENT}
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <UserPlus className="h-4 w-4 shrink-0" aria-hidden />
              {BOOKING_VALIDATION_MESSAGES.GO_TO_DASHBOARD_TO_ADD_CHILD}
            </Link>
          )}
        </div>
      </div>
    ) : awaitingReview ? (
      <div className="space-y-4">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          We&apos;re reviewing{' '}
          {(() => {
            const names = childrenAwaitingChecklistReview?.length
              ? childrenAwaitingChecklistReview
              : childrenPendingApproval ?? [];
            return names.length === 1 ? `${names[0].name}'s` : 'your children\'s';
          })()}{' '}
          details. You&apos;ll be able to book sessions once we&apos;ve approved. No need to do anything – we&apos;ll email you when it&apos;s done.
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {BOOKING_VALIDATION_MESSAGES.NO_APPROVED_CHILDREN_TO_BOOK}
          {BOOKING_VALIDATION_MESSAGES.CREATE_CHILD_PROFILE_BEFORE_BOOKING}
        </p>
        <div className="flex flex-col gap-3">
          {onAddChild ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onAddChild();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-blue px-4 py-3 text-sm font-medium text-white hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2"
            >
              <UserPlus className="h-4 w-4 shrink-0" aria-hidden />
              {BOOKING_VALIDATION_MESSAGES.ADD_CHILD_LABEL}
            </button>
          ) : (
            <Link
              href={ROUTES.DASHBOARD_PARENT}
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-blue px-4 py-3 text-sm font-medium text-white hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2"
            >
              <UserPlus className="h-4 w-4 shrink-0" aria-hidden />
              {BOOKING_VALIDATION_MESSAGES.GO_TO_DASHBOARD_TO_ADD_CHILD}
            </Link>
          )}
        </div>
      </div>
    );

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
        aria-labelledby="no-approved-children-panel-title"
        aria-describedby="no-approved-children-panel-desc"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h2
            id="no-approved-children-panel-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"
          >
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden />
            Before you book
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
        <div id="no-approved-children-panel-desc" className="flex-1 overflow-y-auto p-5">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
            {content}
          </div>
        </div>
      </div>
    </>
  );
}
