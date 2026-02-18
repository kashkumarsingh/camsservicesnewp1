'use client';

import React from 'react';
import { AlertTriangle, PoundSterling, UserX, Calendar, FileCheck } from 'lucide-react';
import type { AdminDashboardStats } from '@/interfaces/web/hooks/dashboard/useAdminDashboardStats';

interface AdminDashboardAlertBarProps {
  stats: AdminDashboardStats | null;
  onUnassignedClick: () => void;
  onPendingPaymentsClick: () => void;
  onZeroHoursClick: () => void;
  onTodayClick: () => void;
  /** When provided, show "Checklists to review" tile and call this when clicked. */
  onChecklistsToReviewClick?: () => void;
}

export function AdminDashboardAlertBar({
  stats,
  onUnassignedClick,
  onPendingPaymentsClick,
  onZeroHoursClick,
  onTodayClick,
  onChecklistsToReviewClick,
}: AdminDashboardAlertBarProps) {
  const unassigned = stats?.alerts?.sessionsAwaitingTrainer ?? 0;
  const pendingPayments = stats?.alerts?.pendingPaymentsCount ?? 0;
  const zeroHours = stats?.alerts?.childrenWithZeroHoursCount ?? 0;
  const todayCount = stats?.todaySessionsCount ?? 0;
  const pendingChecklists = stats?.alerts?.pendingChildChecklists ?? 0;

  return (
    <section
      className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-5"
      aria-label="Dashboard alerts"
    >
      <button
        type="button"
        onClick={onUnassignedClick}
        className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors ${
          unassigned > 0
            ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40'
            : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        aria-label={`${unassigned} unassigned sessions`}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">{unassigned} UNASSIGNED</span>
        </span>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Assign →</span>
      </button>
      <button
        type="button"
        onClick={onPendingPaymentsClick}
        className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors ${
          pendingPayments > 0
            ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40'
            : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        aria-label={`${pendingPayments} pending payments`}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
          <PoundSterling className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">{pendingPayments} PENDING PAYMENTS</span>
        </span>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Review →</span>
      </button>
      <button
        type="button"
        onClick={onZeroHoursClick}
        className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors ${
          zeroHours > 0
            ? 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40'
            : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        aria-label={`${zeroHours} children with 0 hours`}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
          <UserX className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">{zeroHours} CHILD 0 HOURS</span>
        </span>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Contact →</span>
      </button>
      {onChecklistsToReviewClick != null && (
        <button
          type="button"
          onClick={onChecklistsToReviewClick}
          className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors ${
            pendingChecklists > 0
              ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/40'
              : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          aria-label={`${pendingChecklists} child checklists awaiting review`}
        >
          <span className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
            <FileCheck className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{pendingChecklists} CHECKLISTS</span>
          </span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Review →</span>
        </button>
      )}
      <button
        type="button"
        onClick={onTodayClick}
        className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
        aria-label={`${todayCount} sessions today`}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
          <Calendar className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">TODAY: {todayCount} SESSIONS</span>
        </span>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">View →</span>
      </button>
    </section>
  );
}
