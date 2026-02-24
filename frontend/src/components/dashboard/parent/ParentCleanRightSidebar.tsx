'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import moment from 'moment';
import { AlertTriangle, CheckCircle, Calendar, ChevronRight, ChevronDown, Plus, UserPlus, Clock, Ban, Filter, LayoutGrid, List, BarChart3, MoreVertical, CalendarDays, X } from 'lucide-react';
import { BaseModal } from '@/components/ui/Modal';
import { SideCanvas } from '@/components/ui/SideCanvas';
import { getChildColor } from '@/utils/childColorUtils';
import type { Child } from '@/core/application/auth/types';
import type { BookingDTO } from '@/core/application/booking/dto/BookingDTO';

/** Single upcoming session for "Next up" strip (from parent dashboard). */
export interface UpcomingSessionItem {
  scheduleId: string;
  date: string;
  startTime: string;
  endTime: string;
  childName: string;
  childId: number;
  trainerName?: string;
  location?: string | null;
  activities?: string[];
  /** Optional package name for session type badge (e.g. "Starter Package", "Premium Package"). */
  packageName?: string | null;
}

/** Countdown display: &lt;1h "In Xm", 1–24h "In Xh Ym", &gt;24h "MMM d, h:mma", or "In progress" if session has started. */
function getCountdownLabel(date: string, startTime: string, endTime: string): string {
  const dateStr = normaliseScheduleDate(date);
  const startM = moment(`${dateStr} ${startTime}`, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss']);
  const endM = endTime ? moment(`${dateStr} ${endTime}`, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss']) : startM.clone().add(1, 'hour');
  const now = moment();
  if (now.isSameOrAfter(startM) && now.isBefore(endM)) return 'In progress';
  if (!startM.isValid() || startM.isSameOrBefore(now)) return '—';
  const diffMs = startM.diff(now);
  const totalMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours < 1) return `In ${mins}m`;
  if (hours < 24) return mins > 0 ? `In ${hours}h ${mins}m` : `In ${hours}h`;
  return startM.format('MMM D, h:mma');
}

interface ParentCleanRightSidebarProps {
  approvedChildren: Child[];
  bookings: BookingDTO[];
  /** Child IDs currently selected in the calendar filter (empty = all children). */
  visibleChildIds?: number[];
  /** Child IDs that already have an active package (draft/pending/confirmed, not expired). Used to prevent duplicate active packages. */
  childIdsWithActivePackage?: Set<number>;
  /** When true, every approved child already has an active package (mirrors header Buy Hours CTA disabling). */
  allChildrenHaveActivePackages?: boolean;
  /** When true, at least one of those packages is still draft/unpaid (show "Complete payment" message instead of generic). */
  hasDraftOrUnpaidActivePackage?: boolean;
  /** Reference of first unpaid booking (e.g. CAMS-XXX). When set with hasDraftOrUnpaidActivePackage, "Complete payment" links to that booking's payment page. */
  unpaidBookingReference?: string | null;
  /** Children who need to complete their checklist (pending approval). Shown in overview so parent can act without going to My children. */
  childrenNeedingChecklist?: { id: number; name: string }[];
  /** Children who have submitted the checklist but are still awaiting admin review. Show "We're reviewing" so parents don't see "ALL CLEAR" and get confused. */
  childrenAwaitingChecklistReview?: { id: number; name: string }[];
  /** All children still pending approval (any reason). When set and no checklist action needed, show "We're reviewing" so we never show "ALL CLEAR" while a child is still pending. */
  childrenPendingApproval?: { id: number; name: string }[];
  /** Next 5 upcoming sessions for "Next up" strip. Click opens session detail modal. */
  upcomingSessions?: UpcomingSessionItem[];
  /** Called when parent clicks an item in the "Next up" list (open session detail). */
  onUpcomingSessionClick?: (session: { scheduleId: string; childName: string; childId: number }) => void;
  /** Optional: called when parent chooses to cancel an upcoming session (confirm before calling). */
  onCancelUpcomingSession?: (session: UpcomingSessionItem) => void;
  /** Optional: called when parent chooses to reschedule an upcoming session. */
  onRescheduleUpcomingSession?: (session: UpcomingSessionItem) => void;
  /** Open the Complete Checklist modal for a specific child. */
  onCompleteChecklist?: (childId: number) => void;
  /** Open the generic Buy Hours modal (no preselected child). */
  onOpenGenericBuyHours: () => void;
  /** Buy hours for a specific child. */
  onBuyHoursForChild: (childId: number) => void;
  /** Optional: open the Book Session modal for a specific child. */
  onBookSession?: (childId: number) => void;
  /** Optional: open the Top-Up flow for a specific child (add hours to existing package). */
  onTopUpChild?: (childId: number) => void;
  /** Optional: open the Add Child modal (for empty state when parent has no children). */
  onAddChild?: () => void;
  /** When true, show skeleton placeholders in the hours section instead of "0h" to avoid flicker. */
  hoursLoading?: boolean;
  /** When "standalone", renders as main content (no sidebar border/sticky/bg). Use on Overview when this is the only column. */
  variant?: 'sidebar' | 'standalone';
  /** When false, hide the "Next up" / Upcoming Sessions block (e.g. when shown in left column of three-column layout). */
  showNextUp?: boolean;
}

interface ChildHoursSummary {
  childId: number;
  childName: string;
  remainingHours: number;
  /** Total hours in the package (so parents see "Xh left of Yh"). */
  totalHours: number;
  /** Hours already booked/used (so parents see how much of the package is used). */
  bookedHours: number;
  /** Optional: latest active package name for this child (for clearer sidebar context). */
  packageName?: string | null;
  /** Optional: latest active package expiry for this child. */
  packageExpiresAt?: string | null;
}

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';

interface SidebarAlert {
  id: string;
  title: string;
  description: string;
  kind: 'session' | 'hours';
  childId?: number;
  severity: AlertSeverity;
  /** If false, show confirm before dismissing (critical). */
  dismissible: boolean;
}

function normaliseScheduleDate(date: string | undefined): string {
  if (!date || typeof date !== 'string') return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const parsed = moment(date, moment.ISO_8601);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : date;
}

/** Session type badge colour by package name (optional). */
function getSessionTypeBadgeClass(packageName: string | null | undefined): string {
  if (!packageName) return 'bg-gray-100 text-gray-700';
  const lower = packageName.toLowerCase();
  if (lower.includes('premium')) return 'bg-violet-100 text-violet-700';
  if (lower.includes('starter') || lower.includes('trial')) return 'bg-emerald-100 text-emerald-700';
  return 'bg-blue-100 text-blue-700';
}

interface NextUpSectionProps {
  sessions: UpcomingSessionItem[];
  getCountdownLabel: (date: string, startTime: string, endTime: string) => string;
  onViewDetails?: (session: { scheduleId: string; childName: string; childId: number }) => void;
  onCancel?: (session: UpcomingSessionItem) => void;
  onReschedule?: (session: UpcomingSessionItem) => void;
  /** When true, single-line per session and smaller padding for 1366x768. */
  compact?: boolean;
}

const ALERT_STYLES: Record<
  AlertSeverity,
  { bg: string; border: string; icon: string; title: string; message: string }
> = {
  critical: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-l-4 border-red-500',
    icon: '🔴',
    title: 'text-red-800 dark:text-red-200 font-bold',
    message: 'text-red-700 dark:text-red-300',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-l-4 border-yellow-500',
    icon: '⚠️',
    title: 'text-yellow-800 dark:text-yellow-200 font-bold',
    message: 'text-yellow-700 dark:text-yellow-300',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-l-4 border-blue-500',
    icon: 'ℹ️',
    title: 'text-blue-800 dark:text-blue-200 font-bold',
    message: 'text-blue-700 dark:text-blue-300',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-l-4 border-green-500',
    icon: '✓',
    title: 'text-green-800 dark:text-green-200 font-bold',
    message: 'text-green-700 dark:text-green-300',
  },
};

interface AlertCardProps {
  alert: SidebarAlert;
  onDismiss: () => void;
  /** For hours alerts: "Top up" when child has a package (totalHours > 0), "Buy hours" when first purchase. */
  actionLabel?: 'Buy hours' | 'Top up';
  onAction?: () => void;
}

function AlertCard({ alert, onDismiss, actionLabel, onAction }: AlertCardProps) {
  const style = ALERT_STYLES[alert.severity];
  return (
    <div
      className={`rounded-lg p-3 ${style.bg} ${style.border} border-r border-t border-b border-gray-200/50 dark:border-gray-700/50`}
      role="alert"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base leading-none" aria-hidden>{style.icon}</span>
            <span className={`text-sm ${style.title}`}>{alert.title}</span>
          </div>
          <p className={`text-xs mt-1 ${style.message}`}>{alert.description}</p>
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1.5 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
            >
              {actionLabel} →
            </button>
          )}
        </div>
        {alert.dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200/80 dark:hover:bg-gray-600"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

function NextUpSection({ sessions, getCountdownLabel, onViewDetails, onCancel, onReschedule, compact = false }: NextUpSectionProps) {
  const [openMenuScheduleId, setOpenMenuScheduleId] = useState<string | null>(null);
  const [cancelConfirmScheduleId, setCancelConfirmScheduleId] = useState<string | null>(null);

  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-2.5">
        <h3 className="text-xs font-semibold text-gray-500 tracking-wide mb-2 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-gray-500" aria-hidden />
          NEXT UP
        </h3>
        <ul className="space-y-1.5" role="list" aria-label="Upcoming sessions">
          {sessions.map((session) => {
            const dateLabel = moment(session.date).format('ddd D');
            const timeLabel = session.startTime ? moment(session.startTime, ['HH:mm', 'HH:mm:ss']).format('h:mma') : '';
            const countdown = getCountdownLabel(session.date, session.startTime, session.endTime);
            const isMenuOpen = openMenuScheduleId === session.scheduleId;
            const isCancelConfirm = cancelConfirmScheduleId === session.scheduleId;
            return (
              <li key={session.scheduleId} className="relative">
                <div className="rounded-lg border border-gray-100 bg-gray-50/50 hover:border-blue-200 hover:bg-blue-50/30 overflow-hidden">
                  <div className="flex items-center gap-2 px-2.5 py-1.5">
                    <span className="text-xs font-bold text-gray-900 truncate flex-1 min-w-0">{session.childName}</span>
                    <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700" aria-label={`Time until: ${countdown}`}>{countdown}</span>
                    <button type="button" onClick={() => onViewDetails?.({ scheduleId: session.scheduleId, childName: session.childName, childId: session.childId })} className="shrink-0 py-1 px-2 rounded text-[10px] font-semibold bg-blue-600 text-white hover:bg-blue-700">View</button>
                    {(onCancel || onReschedule) && (
                      <div className="relative shrink-0">
                        <button type="button" onClick={() => setOpenMenuScheduleId(isMenuOpen ? null : session.scheduleId)} className="p-1 rounded text-gray-500 hover:bg-gray-200" aria-label="Session actions" aria-expanded={isMenuOpen}><MoreVertical className="w-3.5 h-3.5" aria-hidden /></button>
                        {isMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-10" aria-hidden onClick={() => setOpenMenuScheduleId(null)} />
                            <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-gray-200 bg-white shadow-lg py-1">
                              <button type="button" className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50" onClick={() => { onReschedule?.(session); setOpenMenuScheduleId(null); }}>Reschedule</button>
                              <button type="button" className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50" onClick={() => { setCancelConfirmScheduleId(session.scheduleId); setOpenMenuScheduleId(null); }}>Cancel</button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="px-2.5 pb-1.5 text-[10px] text-gray-500 truncate">{dateLabel}{timeLabel ? ` · ${timeLabel}` : ''}{session.trainerName ? ` · ${session.trainerName}` : ''}</div>
                  {isCancelConfirm && (
                    <div className="mx-2.5 mb-1.5 p-2 rounded bg-red-50 border border-red-200">
                      <p className="text-[10px] text-red-800 mb-1.5">Cancel?</p>
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => { onCancel?.(session); setCancelConfirmScheduleId(null); }} className="px-2 py-1 text-[10px] font-semibold bg-red-600 text-white rounded">Yes</button>
                        <button type="button" onClick={() => setCancelConfirmScheduleId(null)} className="px-2 py-1 text-[10px] font-medium text-gray-700 bg-gray-200 rounded">No</button>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
      <h3 className="text-xs font-semibold text-gray-500 tracking-wide mb-3 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" aria-hidden />
        NEXT UP
      </h3>
      <ul className="space-y-2" role="list" aria-label="Upcoming sessions">
        {sessions.map((session) => {
          const dateLabel = moment(session.date).format('ddd, MMM D');
          const timeLabel = session.startTime
            ? moment(session.startTime, ['HH:mm', 'HH:mm:ss']).format('h:mma')
            : '';
          const countdown = getCountdownLabel(session.date, session.startTime, session.endTime);
          const isMenuOpen = openMenuScheduleId === session.scheduleId;
          const isCancelConfirm = cancelConfirmScheduleId === session.scheduleId;
          return (
            <li key={session.scheduleId} className="relative">
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 hover:border-blue-200 hover:bg-blue-50/30 transition-colors overflow-hidden">
                {/* Top row: countdown badge top-right */}
                <div className="flex items-start justify-between gap-2 pt-2.5 px-3 pb-1">
                  <span className="text-sm font-bold text-gray-900 truncate">{session.childName}</span>
                  <span
                    className="shrink-0 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700"
                    aria-label={`Time until session: ${countdown}`}
                  >
                    {countdown}
                  </span>
                </div>
                <div className="px-3 pb-2 space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-gray-500 shrink-0" aria-hidden />
                    {dateLabel}
                  </div>
                  {timeLabel && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" aria-hidden />
                      {timeLabel}
                    </div>
                  )}
                  {session.trainerName && (
                    <div className="flex items-center gap-1.5">
                      <span className="shrink-0" aria-hidden>👨‍🏫</span>
                      <span>{session.trainerName}</span>
                    </div>
                  )}
                </div>
                {/* Session type badge (optional) */}
                {session.packageName && (
                  <div className="px-3 pb-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getSessionTypeBadgeClass(session.packageName)}`}
                    >
                      {session.packageName}
                    </span>
                  </div>
                )}
                {/* Actions: View details (primary) + menu (secondary) */}
                <div className="flex items-center gap-1 px-3 pb-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => onViewDetails?.({ scheduleId: session.scheduleId, childName: session.childName, childId: session.childId })}
                    className="flex-1 min-w-0 min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  >
                    View details
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  </button>
                  {(onCancel || onReschedule) && (
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setOpenMenuScheduleId(isMenuOpen ? null : session.scheduleId)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Session actions"
                        aria-expanded={isMenuOpen}
                      >
                        <MoreVertical className="w-4 h-4" aria-hidden />
                      </button>
                      {isMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-10" aria-hidden onClick={() => setOpenMenuScheduleId(null)} />
                          <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white shadow-lg py-1">
                            <button
                              type="button"
                              className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                              onClick={() => {
                                onReschedule?.(session);
                                setOpenMenuScheduleId(null);
                              }}
                            >
                              Reschedule
                            </button>
                            <button
                              type="button"
                              className="w-full text-left px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setCancelConfirmScheduleId(session.scheduleId);
                                setOpenMenuScheduleId(null);
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {/* Inline cancel confirm */}
                {isCancelConfirm && (
                  <div className="mx-3 mb-2.5 p-2 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-xs text-red-800 mb-2">Cancel this session?</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onCancel?.(session);
                          setCancelConfirmScheduleId(null);
                        }}
                        className="px-2 py-1 text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Yes, cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => setCancelConfirmScheduleId(null)}
                        className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function ParentCleanRightSidebar({
  approvedChildren,
  bookings,
  visibleChildIds,
  childIdsWithActivePackage,
  allChildrenHaveActivePackages,
  hasDraftOrUnpaidActivePackage,
  unpaidBookingReference,
  childrenNeedingChecklist,
  childrenAwaitingChecklistReview,
  childrenPendingApproval,
  upcomingSessions = [],
  onUpcomingSessionClick,
  onCancelUpcomingSession,
  onRescheduleUpcomingSession,
  onCompleteChecklist,
  onOpenGenericBuyHours,
  onBuyHoursForChild,
  onBookSession,
  onTopUpChild,
  onAddChild,
  hoursLoading = false,
  variant = 'sidebar',
  showNextUp = true,
}: ParentCleanRightSidebarProps) {
  const filteredChildIds = useMemo(() => {
    if (!visibleChildIds || visibleChildIds.length === 0) {
      return approvedChildren.map((c) => c.id);
    }
    return visibleChildIds;
  }, [approvedChildren, visibleChildIds]);

  const childHours: ChildHoursSummary[] = useMemo(() => {
    if (approvedChildren.length === 0) return [];

    // Only confirmed & paid bookings count towards remaining hours
    const confirmedPaid = bookings.filter(
      (b) => b.status === 'confirmed' && b.paymentStatus === 'paid',
    );

    const summaries: ChildHoursSummary[] = [];

    approvedChildren.forEach((child) => {
      if (!filteredChildIds.includes(child.id)) {
        return;
      }

      const childBookings = confirmedPaid.filter((b) =>
        (b.participants ?? []).some((p) => p.childId === child.id),
      );

      if (childBookings.length === 0) {
        summaries.push({
          childId: child.id,
          childName: child.name,
          remainingHours: 0,
          totalHours: 0,
          bookedHours: 0,
          packageName: null,
          packageExpiresAt: null,
        });
        return;
      }

      // Use the most recent active booking for remaining hours
      const latest = [...childBookings].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];

      const totalHours = latest.totalHours ?? 0;
      const bookedHours = latest.bookedHours ?? 0;
      const remainingHours = Math.max(0, totalHours - bookedHours);

      summaries.push({
        childId: child.id,
        childName: child.name,
        remainingHours,
        totalHours,
        bookedHours,
        packageName: latest.package?.name ?? null,
        packageExpiresAt: latest.packageExpiresAt ?? null,
      });
    });

    return summaries;
  }, [approvedChildren, bookings, filteredChildIds]);

  const totalRemainingHours = useMemo(
    () => childHours.reduce((sum, c) => sum + c.remainingHours, 0),
    [childHours],
  );

  const totalPackageHours = useMemo(
    () => childHours.reduce((sum, c) => sum + c.totalHours, 0),
    [childHours],
  );

  const totalBookedHours = useMemo(
    () => childHours.reduce((sum, c) => sum + c.bookedHours, 0),
    [childHours],
  );

  /** Remaining percentage (0-100); 100 when no package. */
  const remainingPercent = useMemo(() => {
    if (totalPackageHours <= 0) return 100;
    return Math.round((totalRemainingHours / totalPackageHours) * 100);
  }, [totalPackageHours, totalRemainingHours]);

  /** Urgency: normal (>25%), warning (10-25%), critical (<10%). */
  const hoursUrgency = useMemo(() => {
    if (totalPackageHours <= 0) return 'normal' as const;
    if (remainingPercent < 10) return 'critical' as const;
    if (remainingPercent < 25) return 'warning' as const;
    return 'normal' as const;
  }, [totalPackageHours, remainingPercent]);

  /** Per-child: remaining %, urgency, upcoming session count, expiry within 30 days. */
  const childHoursWithMeta = useMemo(() => {
    return childHours.map((c) => {
      const remainingPct = c.totalHours > 0 ? Math.round((c.remainingHours / c.totalHours) * 100) : 100;
      const urgency: 'normal' | 'low' | 'critical' =
        c.totalHours <= 0 ? 'normal' : remainingPct < 10 ? 'critical' : remainingPct < 25 ? 'low' : 'normal';
      const upcomingCount = upcomingSessions.filter((s) => s.childId === c.childId).length;
      const expiresAt = c.packageExpiresAt ? moment(c.packageExpiresAt) : null;
      const expiringWithin30Days = expiresAt ? expiresAt.isBefore(moment().add(30, 'days')) && expiresAt.isSameOrAfter(moment(), 'day') : false;
      return { ...c, remainingPct, urgency, upcomingCount, expiringWithin30Days, expiresAt };
    });
  }, [childHours, upcomingSessions]);

  /** Children who have never had a package (0 total hours) – need first-time "Buy Hours". */
  const newChildren = useMemo(() => childHoursWithMeta.filter((c) => c.totalHours === 0), [childHoursWithMeta]);
  /** Children who had a package but ran out (expired) – need "Top up". */
  const depletedChildren = useMemo(() => childHoursWithMeta.filter((c) => c.totalHours > 0 && c.remainingHours <= 0), [childHoursWithMeta]);
  /** Children with ≤5% remaining (critical). */
  const criticalChildren = useMemo(() => childHoursWithMeta.filter((c) => c.totalHours > 0 && c.remainingHours > 0 && c.remainingPct <= 5), [childHoursWithMeta]);
  /** Children with ≤10% remaining (urgent). */
  const urgentChildren = useMemo(() => childHoursWithMeta.filter((c) => c.totalHours > 0 && c.remainingPct > 5 && c.remainingPct <= 10), [childHoursWithMeta]);
  /** Children with ≤25% remaining (warning). */
  const warningChildren = useMemo(() => childHoursWithMeta.filter((c) => c.totalHours > 0 && c.remainingPct > 10 && c.remainingPct <= 25), [childHoursWithMeta]);

  /** Sort: name | hours_remaining | usage_pct. Filter: low hours only. View: cards | compact | comparison. */
  type PerChildSort = 'name' | 'hours_remaining' | 'usage_pct';
  type PerChildView = 'cards' | 'compact' | 'comparison';
  const [perChildSort, setPerChildSort] = useState<PerChildSort>('hours_remaining');
  const [perChildFilterLowOnly, setPerChildFilterLowOnly] = useState(false);
  const [perChildView, setPerChildView] = useState<PerChildView>('cards');
  /** Hours-per-child breakdown shown in a side panel so parents can see the full view. */
  const [showBreakdownPanel, setShowBreakdownPanel] = useState(false);
  /** Close breakdown panel then run action (e.g. open Buy Hours). */
  const closeBreakdownThen = (fn: () => void) => () => {
    setShowBreakdownPanel(false);
    fn();
  };

  /** Tick every 60s so NEXT UP countdown badges update and session-today alerts disappear after end time. */
  const [countdownTick, setCountdownTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setCountdownTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  /** Dismissed alert IDs (session-only; alerts reappear on refresh). */
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());
  /** Dismissed welcome banner child IDs (show again next login if no purchase). */
  const [dismissedWelcomeChildIds, setDismissedWelcomeChildIds] = useState<Set<number>>(new Set());

  /** Child created_at for "Added today" / "new" labelling. */
  const getChildCreatedAt = (childId: number) => {
    const c = approvedChildren.find((x) => x.id === childId);
    const raw = c?.createdAt ?? (c as { created_at?: string })?.created_at;
    return raw ? moment(raw) : null;
  };
  const isNewWithinDays = (childId: number, days: number) => {
    const created = getChildCreatedAt(childId);
    return created ? created.isAfter(moment().subtract(days, 'days')) : false;
  };

  /** Filtered and sorted list for per-child section (low-only = urgency not normal). */
  const displayedChildHours = useMemo(() => {
    let list = childHoursWithMeta;
    if (perChildFilterLowOnly) {
      list = list.filter((c) => c.urgency !== 'normal');
    }
    const sorted = [...list].sort((a, b) => {
      if (perChildSort === 'name') return a.childName.localeCompare(b.childName);
      if (perChildSort === 'hours_remaining') return a.remainingHours - b.remainingHours;
      return a.remainingPct - b.remainingPct;
    });
    return sorted;
  }, [childHoursWithMeta, perChildFilterLowOnly, perChildSort]);

  // Determine whether any of the currently filtered children are eligible to buy a NEW package.
  // Business rule: each child can only have ONE active package at a time.
  const canAnyFilteredChildBuyNewHours = useMemo(() => {
    if (!approvedChildren.length) return false;
    if (!childIdsWithActivePackage || childIdsWithActivePackage.size === 0) {
      // If we do not have active-package data, fall back to allowing the CTA.
      return true;
    }
    return filteredChildIds.some((id) => !childIdsWithActivePackage.has(id));
  }, [approvedChildren.length, childIdsWithActivePackage, filteredChildIds]);

  const alerts: SidebarAlert[] = useMemo(() => {
    const today = moment().format('YYYY-MM-DD');
    const result: SidebarAlert[] = [];

    // Session alerts for today
    bookings.forEach((booking) => {
      if (booking.status !== 'confirmed' || booking.paymentStatus !== 'paid') {
        return;
      }

      if (!booking.schedules || booking.schedules.length === 0) {
        return;
      }

      const participant = booking.participants?.[0];
      const childId = participant?.childId;
      if (!childId || !filteredChildIds.includes(childId)) {
        return;
      }

      const childName = participant
        ? `${participant.firstName ?? ''} ${participant.lastName ?? ''}`.trim() ||
          'Child'
        : 'Child';

      booking.schedules.forEach((schedule) => {
        if (schedule.status === 'cancelled') {
          return;
        }

        const dateStr = normaliseScheduleDate(
          typeof schedule.date === 'string'
            ? schedule.date
            : (schedule as { date?: string }).date,
        );
        if (dateStr !== today) {
          return;
        }

        const start =
          (schedule as { startTime?: string; start_time?: string }).startTime ??
          (schedule as { start_time?: string }).start_time ??
          '';
        const end =
          (schedule as { endTime?: string; end_time?: string }).endTime ??
          (schedule as { end_time?: string }).end_time ??
          '';

        // Only show alert if session hasn't ended yet (end time still in the future)
        const endTimeStr = end || start;
        if (endTimeStr) {
          const sessionEnd = moment(
            `${dateStr} ${endTimeStr}`,
            ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss']
          );
          if (sessionEnd.isValid() && sessionEnd.isBefore(moment())) {
            return; // Session has already ended – don't show alert
          }
        }

        const startLabel = start
          ? moment(start, ['HH:mm', 'HH:mm:ss']).format('h:mm A')
          : 'Today';

        const activityName =
          schedule.activities && schedule.activities.length > 0
            ? schedule.activities[0]?.name
            : booking.package?.name ?? 'Session';

        result.push({
          id: `session-${booking.id}-${schedule.id}`,
          kind: 'session',
          childId,
          title: `Session today at ${startLabel}`,
          description: `${childName} – ${activityName}`,
          severity: 'warning',
          dismissible: true,
        });
      });
    });

    // Low-hours alerts (e.g. under 3 hours remaining)
    childHours.forEach((summary) => {
      if (summary.remainingHours > 0 && summary.remainingHours < 3) {
        result.push({
          id: `hours-${summary.childId}`,
          kind: 'hours',
          childId: summary.childId,
          title: `${summary.childName} needs more hours`,
          description: `${summary.remainingHours.toFixed(1)}h remaining`,
          severity: 'warning',
          dismissible: true,
        });
      }
    });

    // Show only a small number to keep things clean
    return result.slice(0, 5);
  }, [bookings, childHours, filteredChildIds, countdownTick]);

  const visibleAlerts = useMemo(
    () => alerts.filter((a) => !dismissedAlertIds.has(a.id)),
    [alerts, dismissedAlertIds],
  );
  const hasAlerts = visibleAlerts.length > 0;

  // Single "Actions needed" list (checklist + payment only; low hours stay in ALERTS to avoid duplicate)
  const actionItems = useMemo(() => {
    const items: Array<{ id: string; label: string; type: 'checklist' | 'payment' | 'low_hours'; childId?: number }> = [];
    (childrenNeedingChecklist ?? []).forEach((c) => {
      items.push({ id: `checklist-${c.id}`, label: `Complete ${c.name}'s checklist`, type: 'checklist', childId: c.id });
    });
    if (hasDraftOrUnpaidActivePackage) {
      items.push({ id: 'payment', label: 'Complete payment for your package', type: 'payment' });
    }
    return items.slice(0, 5);
  }, [childrenNeedingChecklist, hasDraftOrUnpaidActivePackage]);

  const handleBuyMoreHoursClick = () => {
    // If every visible child already has an active package, do not open the Buy Hours flow.
    if (!canAnyFilteredChildBuyNewHours || allChildrenHaveActivePackages) {
      return;
    }

    if (filteredChildIds.length === 1) {
      onBuyHoursForChild(filteredChildIds[0]);
      return;
    }
    // Multiple / all children selected – open generic Buy Hours so parent can choose
    onOpenGenericBuyHours();
  };

  const isStandalone = variant === 'standalone';
  const wrapperClass = isStandalone
    ? 'w-full space-y-6 sm:space-y-8 p-0'
    : 'w-full bg-transparent lg:bg-white lg:border-l lg:border-gray-200 p-4 md:p-4 lg:px-5 lg:py-4 lg:min-w-0 space-y-4 lg:space-y-4 lg:sticky lg:top-14 lg:self-start lg:max-h-[calc(100vh-4.5rem)] lg:overflow-y-auto';

  const Wrapper = isStandalone ? 'div' : 'aside';

  return (
    <Wrapper className={wrapperClass}>
      {/* 1a. Welcome banner for new children (added in last 3 days, 0 hours) – dismissible */}
      {(() => {
        const newRecent = newChildren.filter((c) => isNewWithinDays(c.childId, 3) && !dismissedWelcomeChildIds.has(c.childId));
        if (newRecent.length === 0) return null;
        const first = newRecent[0];
        return (
          <div
            className="rounded-xl border-2 border-blue-500 bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] dark:from-blue-900/30 dark:to-blue-800/20 p-4"
            role="alert"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <span aria-hidden>🎉</span> Welcome {first.childName}!
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  {first.childName} has been added to your account and is ready to start. Purchase hours to book their first session.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => onBuyHoursForChild(first.childId)}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Buy Hours for {first.childName} →
                  </button>
                  <button
                    type="button"
                    onClick={onOpenGenericBuyHours}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border-2 border-blue-600 text-blue-700 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >
                    View packages
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDismissedWelcomeChildIds((prev) => new Set(prev).add(first.childId))}
                className="shrink-0 p-1 rounded text-blue-700 hover:bg-blue-200/50 dark:hover:bg-blue-700/50"
                aria-label="Dismiss welcome banner"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
            </div>
          </div>
        );
      })()}

      {/* 1b. NEW CHILD – never had hours (first purchase); blue section */}
      {newChildren.length > 0 && (
        <div
          className="rounded-xl border-2 border-blue-500 bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] dark:from-blue-900/30 dark:to-blue-800/20 p-3"
          role="region"
          aria-labelledby="sidebar-new-child-heading"
        >
          <h2 id="sidebar-new-child-heading" className="font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-2">
            <span aria-hidden>🆕</span> NEW CHILD – GET STARTED!
          </h2>
          {newChildren.map((c) => (
            <div key={c.childId} className="mb-3 last:mb-0">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center gap-1.5">
                <span aria-hidden>👶</span> {c.childName}
                {isNewWithinDays(c.childId, 7) && (
                  <span className="text-xs font-normal text-blue-600 dark:text-blue-300">
                    ({getChildCreatedAt(c.childId)?.isSame(moment(), 'day') ? 'Added today' : 'Added recently'})
                  </span>
                )}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                {c.childName} is ready to start! Purchase hours to book their first session.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => onBuyHoursForChild(c.childId)}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700"
                >
                  Buy Hours for {c.childName} →
                </button>
                <button
                  type="button"
                  onClick={onOpenGenericBuyHours}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-600 text-blue-700 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                >
                  View packages
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1c. NO HOURS LEFT – had package, ran out; red section. "Top up" = buy more hours for this child. */}
      {depletedChildren.length > 0 && (
        <div
          className="rounded-xl border-2 border-red-500 bg-[#FEF2F2] dark:bg-red-900/30 p-3"
          role="region"
          aria-labelledby="sidebar-depleted-heading"
        >
          <h2 id="sidebar-depleted-heading" className="font-bold text-red-800 dark:text-red-200 flex items-center gap-2 mb-2">
            <Ban className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" aria-hidden />
            NO HOURS LEFT
          </h2>
          <p className="text-2xs text-red-700 dark:text-red-300 mb-2">These children have used all their package hours. Top up to buy more.</p>
          {depletedChildren.map((c) => (
            <div key={c.childId} className="mb-3 last:mb-0">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 flex items-center gap-1.5">
                <span aria-hidden>👶</span> {c.childName}
              </p>
              {(c.packageName || c.bookedHours > 0) && (
                <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                  {c.packageName ? `${c.packageName}: ` : ''}{c.bookedHours.toFixed(1)}h used
                </p>
              )}
              <button
                type="button"
                onClick={() => (onTopUpChild ? onTopUpChild(c.childId) : onBuyHoursForChild(c.childId))}
                className="mt-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700"
              >
                Top up for {c.childName} →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 1d. Legacy: single red banner only when no hours at all and no new/expired split (e.g. all children depleted) */}
      {newChildren.length === 0 && depletedChildren.length === 0 && totalPackageHours > 0 && totalRemainingHours <= 0 && (() => {
        const firstWithPackageNoHours = childHoursWithMeta.find((c) => c.totalHours > 0 && c.remainingHours <= 0);
        const useTopUp = firstWithPackageNoHours && onTopUpChild;
        return (
          <div className="rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-900/30 p-3" role="alert">
            <div className="flex items-center gap-2 mb-1">
              <Ban className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" aria-hidden />
              <span className="font-bold text-red-800 dark:text-red-200">No hours remaining</span>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300 mb-2">You have no hours left to book.</p>
            <button
              type="button"
              onClick={() => (useTopUp ? onTopUpChild!(firstWithPackageNoHours!.childId) : onOpenGenericBuyHours())}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700"
            >
              {useTopUp ? 'Top up' : 'Buy hours'}
            </button>
          </div>
        );
      })()}

      {/* 2. Actions needed – checklist, payment, low hours */}
      {actionItems.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 p-3">
          <h3 className="text-xs font-semibold text-amber-700 tracking-wide mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" aria-hidden />
            ACTIONS NEEDED
          </h3>
          <ul className="space-y-1.5" role="list">
            {actionItems.map((item) => (
              <li key={item.id}>
                {item.type === 'checklist' && item.childId && onCompleteChecklist && (
                  <button
                    type="button"
                    onClick={() => onCompleteChecklist(item.childId!)}
                    className="w-full text-left min-h-[44px] py-2.5 px-3 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex items-center"
                  >
                    {item.label} →
                  </button>
                )}
                {item.type === 'payment' && (
                  unpaidBookingReference ? (
                    <Link
                      href={`/bookings/${unpaidBookingReference}/payment`}
                      className="block min-h-[44px] py-2.5 px-3 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center"
                    >
                      {item.label} →
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard/parent/bookings"
                      className="block min-h-[44px] py-2.5 px-3 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center"
                    >
                      {item.label} →
                    </Link>
                  )
                )}
                {item.type === 'low_hours' && item.childId && (
                  <button
                    type="button"
                    onClick={() => onBuyHoursForChild(item.childId!)}
                    className="w-full text-left min-h-[44px] py-2.5 px-3 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex items-center"
                  >
                    {item.label} → Buy hours
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 3. Next up – compact so critical info fits without scrolling (1366x768); hidden when showNextUp false (e.g. three-column layout left column) */}
      {showNextUp && upcomingSessions.length > 0 && (
        <NextUpSection
          sessions={upcomingSessions}
          getCountdownLabel={getCountdownLabel}
          onViewDetails={onUpcomingSessionClick}
          onCancel={onCancelUpcomingSession}
          onReschedule={onRescheduleUpcomingSession}
          compact
        />
      )}

      {/* 4. Alerts – separate card so it reads clearly apart from the Hours card below */}
      {hasAlerts ? (
        <div className="rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 shadow-sm p-3">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-gray-500" aria-hidden />
            ALERTS
            {visibleAlerts.length > 1 && (
              <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 px-1.5 text-[10px] font-bold text-gray-700 dark:text-gray-300">
                {visibleAlerts.length}
              </span>
            )}
          </h3>
          <div className="space-y-2">
            {visibleAlerts.map((alert) => {
              const hoursSummary = alert.kind === 'hours' && alert.childId ? childHours.find((c) => c.childId === alert.childId) : undefined;
              const useTopUp = hoursSummary && hoursSummary.totalHours > 0 && onTopUpChild;
              const actionLabel = alert.kind === 'hours' && alert.childId
                ? (useTopUp ? 'Top up' : 'Buy hours')
                : undefined;
              const onAction = alert.kind === 'hours' && alert.childId
                ? (useTopUp ? () => onTopUpChild!(alert.childId!) : () => onBuyHoursForChild(alert.childId!))
                : undefined;
              return (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onDismiss={() => setDismissedAlertIds((prev) => new Set(prev).add(alert.id))}
                  actionLabel={actionLabel}
                  onAction={onAction}
                />
              );
            })}
          </div>
        </div>
      ) : (() => {
        const hasAwaitingReview = (childrenAwaitingChecklistReview?.length ?? 0) > 0;
        const hasPendingNoAction = (childrenPendingApproval?.length ?? 0) > 0 && (childrenNeedingChecklist?.length ?? 0) === 0;
        const showAllClear = !hasAwaitingReview && !hasPendingNoAction;
        return showAllClear ? (
          <div className="bg-white rounded-xl border border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10 px-3 py-2.5">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" aria-hidden />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                All clear – no sessions today, hours available.
              </p>
            </div>
          </div>
        ) : null;
      })()}

      {/* 5. Hours card – clearly separate box: 8.0h, left to book sessions, etc. */}
      <div id="dashboard-hours-section" className={`bg-white rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 lg:p-5 ${hasAlerts ? 'mt-6' : ''}`}>
        {hoursLoading ? (
          <div className="py-2" aria-busy="true" aria-label="Loading hours">
            <div className="h-12 w-24 rounded bg-gray-200 dark:bg-gray-600 animate-pulse" />
            <div className="mt-3 h-4 w-48 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
            <div className="mt-4 h-2 w-full rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
            <div className="mt-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between gap-2 py-2">
                  <div className="h-4 w-28 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
                  <div className="h-4 w-16 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : (
        <>
        <div className="mb-0">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-4xl sm:text-5xl xl:text-6xl font-extrabold tabular-nums transition-colors duration-300 ${
                hoursUrgency === 'critical'
                  ? 'text-red-600 dark:text-red-400'
                  : hoursUrgency === 'warning'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-gray-900 dark:text-gray-100'
              }`}
              aria-label={`${totalRemainingHours.toFixed(1)} hours remaining`}
            >
              {totalRemainingHours.toFixed(1)}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-gray-500 dark:text-gray-400">h</span>
            {(hoursUrgency === 'warning' || hoursUrgency === 'critical') && (
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  hoursUrgency === 'critical' ? 'bg-red-600 dark:bg-red-400' : 'bg-yellow-600 dark:bg-yellow-400'
                }`}
                aria-hidden
              />
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">left to book sessions</p>
          {totalPackageHours > 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {totalBookedHours.toFixed(1)}h used of {totalPackageHours.toFixed(1)}h total
            </p>
          )}
        </div>

        {totalPackageHours > 0 && (
          <div className="mt-4" role="progressbar" aria-valuenow={remainingPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Package hours remaining">
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  remainingPercent > 75
                    ? 'bg-green-500 dark:bg-green-600'
                    : remainingPercent > 25
                      ? 'bg-blue-500 dark:bg-blue-600'
                      : remainingPercent > 10
                        ? 'bg-yellow-500 dark:bg-yellow-600'
                        : 'bg-red-500 dark:bg-red-600'
                }`}
                style={{ width: `${remainingPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              {remainingPercent}% remaining
            </p>
          </div>
        )}

        {/* By child – same card, below the big number */}
        {childHoursWithMeta.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">By child</p>
              <ul className="space-y-1.5" role="list" aria-label="Hours per child">
                {childHoursWithMeta.map((c) => {
                  const needsBuyHours = c.totalHours === 0;
                  const needsTopUp = c.totalHours > 0 && c.remainingHours <= 0;
                  const status = needsBuyHours ? '🆕' : needsTopUp ? '🔴' : '✓';
                  const actionHint = needsBuyHours ? ' – Buy hours' : needsTopUp ? ' – Top up' : '';
                  const label = needsBuyHours
                    ? `${c.childName}: 0.0h left (new)${actionHint}`
                    : needsTopUp
                      ? `${c.childName}: 0.0h / ${c.totalHours.toFixed(1)}h${actionHint}`
                      : `${c.childName}: ${c.remainingHours.toFixed(1)}h / ${c.totalHours.toFixed(1)}h`;
                  return (
                    <li
                      key={c.childId}
                      className={`text-sm flex items-center gap-2 ${
                        needsBuyHours
                          ? 'text-blue-700 dark:text-blue-300'
                          : needsTopUp
                            ? 'text-red-700 dark:text-red-300'
                            : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span aria-hidden>👶</span>
                      <span>{label}</span>
                      <span className="shrink-0" aria-hidden>{status}</span>
                    </li>
                  );
                })}
              </ul>
              {(newChildren.length > 0 || depletedChildren.length > 0) && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-2">
                  {depletedChildren.length > 0 && (
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      <span className="font-semibold text-red-700 dark:text-red-300">Need to top up:</span>{' '}
                      {depletedChildren.map((c) => c.childName).join(', ')}
                    </p>
                  )}
                  {newChildren.length > 0 && (
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      <span className="font-semibold text-blue-700 dark:text-blue-300">Need to buy hours:</span>{' '}
                      {newChildren.map((c) => c.childName).join(', ')}
                    </p>
                  )}
                </div>
              )}
              {totalRemainingHours > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Total: {totalRemainingHours.toFixed(1)}h active of {totalPackageHours.toFixed(1)}h purchased
                </p>
              )}
            </>
          )}

        {/* Per-child breakdown – open in side panel so parents can see the full view */}
        <div className={childHoursWithMeta.length > 0 ? 'mt-4' : ''}>
          <button
            type="button"
            onClick={() => setShowBreakdownPanel(true)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
            aria-haspopup="dialog"
            aria-expanded={false}
          >
            View breakdown <ChevronDown className="w-4 h-4" aria-hidden />
          </button>
        </div>

        <SideCanvas
          isOpen={showBreakdownPanel}
          onClose={() => setShowBreakdownPanel(false)}
          title="Hours per child"
          description="Per-child hours, low-hours warnings and quick actions"
          widthClassName="sm:w-[420px] md:w-[480px]"
          closeLabel="Close breakdown panel"
        >
          <div className="space-y-6 pb-2">
        {/* Low Hours Warning – inside breakdown only when not already shown at top (0h banner) */}
        {childHoursWithMeta.length > 0 && (depletedChildren.length > 0 || newChildren.length > 0 || criticalChildren.length > 0 || urgentChildren.length > 0 || warningChildren.length > 0) && (
          <div
            className={`mb-6 rounded-xl border p-4 ${
              newChildren.length > 0 && depletedChildren.length === 0
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                : depletedChildren.length > 0
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : criticalChildren.length > 0
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : urgentChildren.length > 0
                    ? 'bg-red-50/80 dark:bg-red-900/15 border-red-200 dark:border-red-800'
                    : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
            }`}
            role="alert"
          >
            {depletedChildren.length > 0 || newChildren.length > 0 ? (
              <>
                {newChildren.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-blue-800 dark:text-blue-200">🆕 New child – get started</span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                      {newChildren.map((c) => c.childName).join(', ')} need a first purchase to book sessions.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {newChildren.map((c) => (
                        <button
                          key={c.childId}
                          type="button"
                          onClick={closeBreakdownThen(() => onBuyHoursForChild(c.childId))}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Buy Hours for {c.childName}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {depletedChildren.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Ban className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" aria-hidden />
                      <span className="font-semibold text-red-800 dark:text-red-200">No hours left</span>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                      {depletedChildren.map((c) => c.childName).join(', ')} have used all their package hours. Top up to buy more.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {depletedChildren.map((c) => (
                        <button
                          key={c.childId}
                          type="button"
                          onClick={closeBreakdownThen(() => (onTopUpChild ? onTopUpChild(c.childId) : onBuyHoursForChild(c.childId)))}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                        >
                          Top up for {c.childName}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : criticalChildren.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden />
                  <span className="font-semibold text-red-800 dark:text-red-200">Critical – only a little left</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  {criticalChildren.length === 1
                    ? `Only ${criticalChildren[0].remainingHours.toFixed(1)}h left for ${criticalChildren[0].childName} – may not be enough for next session.`
                    : 'Some children have very few hours left.'}
                </p>
                <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 mb-3">
                  {criticalChildren.map((c) => (
                    <li key={c.childId}>
                      {c.childName}: {c.remainingHours.toFixed(1)}h left
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={closeBreakdownThen(() =>
                    criticalChildren.length === 1
                      ? (criticalChildren[0].totalHours > 0 && onTopUpChild ? onTopUpChild(criticalChildren[0].childId) : onBuyHoursForChild(criticalChildren[0].childId))
                      : onOpenGenericBuyHours()
                  )}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                >
                  {criticalChildren.length === 1 && criticalChildren[0].totalHours > 0 && onTopUpChild ? 'Top up' : 'Buy hours'}
                </button>
              </>
            ) : urgentChildren.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" aria-hidden />
                  <span className="font-semibold text-red-800 dark:text-red-200">Low hours</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  {urgentChildren.length === 1
                    ? `${urgentChildren[0].childName}: ${urgentChildren[0].remainingHours.toFixed(1)}h remaining (${urgentChildren[0].remainingPct}% of package).`
                    : 'Some children have low hours remaining.'}
                </p>
                <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 mb-3">
                  {urgentChildren.map((c) => (
                    <li key={c.childId}>
                      {c.childName}: {c.remainingHours.toFixed(1)}h ({c.remainingPct}%)
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={closeBreakdownThen(() =>
                    urgentChildren.length === 1
                      ? (urgentChildren[0].totalHours > 0 && onTopUpChild ? onTopUpChild(urgentChildren[0].childId) : onBuyHoursForChild(urgentChildren[0].childId))
                      : onOpenGenericBuyHours()
                  )}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                >
                  {urgentChildren.length === 1 && urgentChildren[0].totalHours > 0 && onTopUpChild ? 'Top up' : 'Buy more hours'}
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden />
                  <span className="font-semibold text-amber-800 dark:text-amber-200">Consider topping up soon</span>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                  {warningChildren.length === 1
                    ? `${warningChildren[0].childName}: ${warningChildren[0].remainingHours.toFixed(1)}h remaining. Consider purchasing more soon.`
                    : 'Some children have under 25% of their package left.'}
                </p>
                <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-300 mb-3">
                  {warningChildren.map((c) => (
                    <li key={c.childId}>
                      {c.childName}: {c.remainingHours.toFixed(1)}h ({c.remainingPct}%)
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={closeBreakdownThen(() =>
                    warningChildren.length === 1
                      ? (warningChildren[0].totalHours > 0 && onTopUpChild ? onTopUpChild(warningChildren[0].childId) : onBuyHoursForChild(warningChildren[0].childId))
                      : onOpenGenericBuyHours()
                  )}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-700"
                >
                  {warningChildren.length === 1 && warningChildren[0].totalHours > 0 && onTopUpChild ? 'Top up' : 'View packages'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Per child – clearly separated from total hours above */}
        <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide shrink-0">Per child</h3>
              <div className="flex items-center gap-0.5" role="group" aria-label="View mode">
                <button
                  type="button"
                  onClick={() => setPerChildView('cards')}
                  className={`min-h-[36px] min-w-[36px] p-1.5 rounded-md flex items-center justify-center ${perChildView === 'cards' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-600' : 'text-gray-500 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}
                  title="Cards"
                  aria-pressed={perChildView === 'cards'}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPerChildView('compact')}
                  className={`min-h-[36px] min-w-[36px] p-1.5 rounded-md flex items-center justify-center ${perChildView === 'compact' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-600' : 'text-gray-500 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}
                  title="Compact list"
                  aria-pressed={perChildView === 'compact'}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPerChildView('comparison')}
                  className={`min-h-[36px] min-w-[36px] p-1.5 rounded-md flex items-center justify-center ${perChildView === 'comparison' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-600' : 'text-gray-500 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}
                  title="Comparison"
                  aria-pressed={perChildView === 'comparison'}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <select
                value={perChildSort}
                onChange={(e) => setPerChildSort(e.target.value as PerChildSort)}
                className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1.5 min-w-0"
                aria-label="Sort by"
              >
                <option value="name">Name</option>
                <option value="hours_remaining">Hours remaining</option>
                <option value="usage_pct">Usage %</option>
              </select>
              <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={perChildFilterLowOnly}
                  onChange={(e) => setPerChildFilterLowOnly(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <Filter className="w-3.5 h-3.5 shrink-0" />
                Low hours only
              </label>
            </div>
          </div>
          <div className="p-4 pt-3 space-y-3">
          {childHours.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add a child and purchase a package to get started.
              </p>
              {onAddChild && (
                <button
                  type="button"
                  onClick={closeBreakdownThen(onAddChild)}
                  className="w-full py-2.5 rounded-lg font-medium text-sm bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                >
                  Add child
                </button>
              )}
            </div>
          ) : (
            <>
              {perChildFilterLowOnly && displayedChildHours.length === 0 && (
                <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" aria-hidden />
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">No children with low hours</p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">All children have more than 25% of their package remaining.</p>
                </div>
              )}
              {!(perChildFilterLowOnly && displayedChildHours.length === 0) && perChildView === 'comparison' && (
                <div className="space-y-2" role="list">
                  {displayedChildHours.map((c) => {
                    const childColor = getChildColor(c.childId);
                    const usedPct = c.totalHours > 0 ? 100 - c.remainingPct : 0;
                    return (
                      <div key={c.childId} className="text-xs">
                        <div className="flex justify-between gap-2 mb-0.5">
                          <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{c.childName}</span>
                          <span className="text-gray-500 dark:text-gray-400 shrink-0">{c.remainingPct}% left</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${c.remainingPct}%`,
                              backgroundColor: childColor,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {!(perChildFilterLowOnly && displayedChildHours.length === 0) && perChildView === 'compact' && (
                <div className="space-y-2" role="list">
                  {displayedChildHours.map((c) => {
                    const childColor = getChildColor(c.childId);
                    const cardBorderBg = c.urgency === 'critical' ? 'border-red-200 dark:border-red-800' : c.urgency === 'low' ? 'border-amber-200 dark:border-amber-800' : 'border-gray-200 dark:border-gray-700';
                    const hoursColor = c.urgency === 'critical' ? 'text-red-600 dark:text-red-400' : c.urgency === 'low' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-gray-100';
                    return (
                      <div
                        key={c.childId}
                        className={`flex items-center gap-2 rounded-lg border p-2 ${cardBorderBg} bg-white dark:bg-gray-800/50`}
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: `linear-gradient(135deg, ${childColor}, ${childColor}99)` }}
                          aria-hidden
                        >
                          {c.childName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">{c.childName}</p>
                          {c.totalHours > 0 && (
                            <div className="mt-1 h-1 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${c.remainingPct > 25 ? 'bg-blue-500' : c.remainingPct > 10 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${c.remainingPct}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 text-right flex flex-col items-end gap-0.5">
                          <span className={`font-bold tabular-nums ${hoursColor}`}>{c.remainingHours.toFixed(1)}h</span>
                          {c.totalHours === 0 && (
                            <button
                              type="button"
                              onClick={closeBreakdownThen(() => onBuyHoursForChild(c.childId))}
                              className="min-h-[36px] px-2 py-1.5 text-[11px] font-medium text-blue-600 dark:text-blue-400"
                            >
                              Buy hours
                            </button>
                          )}
                          {onBookSession && c.remainingHours > 0 && (
                            <button
                              type="button"
                              onClick={closeBreakdownThen(() => onBookSession(c.childId))}
                              className="min-h-[36px] px-2 py-1.5 text-[11px] font-medium text-blue-600 dark:text-blue-400"
                            >
                              Book
                            </button>
                          )}
                          {c.totalHours > 0 && c.remainingHours <= 0 && (
                            <button
                              type="button"
                              onClick={closeBreakdownThen(() => (onTopUpChild ? onTopUpChild(c.childId) : onBuyHoursForChild(c.childId)))}
                              className="min-h-[36px] px-2 py-1.5 text-[11px] font-medium text-blue-600 dark:text-blue-400"
                            >
                              {onTopUpChild ? 'Top up' : 'Buy hours'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {!(perChildFilterLowOnly && displayedChildHours.length === 0) && perChildView === 'cards' && (
                <div className="grid grid-cols-1 gap-3" role="list">
              {displayedChildHours.map((c) => {
                const childColor = getChildColor(c.childId);
                const cardBorderBg =
                  c.urgency === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : c.urgency === 'low'
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                      : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
                const hoursColor =
                  c.urgency === 'critical'
                    ? 'text-red-600 dark:text-red-400'
                    : c.urgency === 'low'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-900 dark:text-gray-100';
                return (
                  <div
                    key={c.childId}
                    className={`rounded-xl border p-4 sm:p-5 ${cardBorderBg}`}
                    role="article"
                    aria-label={`Hours for ${c.childName}: ${c.remainingHours.toFixed(1)} remaining`}
                  >
                    {/* Header: avatar + name/package, warning badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                          style={{ background: `linear-gradient(135deg, ${childColor}, ${childColor}99)` }}
                          aria-hidden
                        >
                          {c.childName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{c.childName}</p>
                          {c.packageName && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{c.packageName}</p>
                          )}
                        </div>
                      </div>
                      {c.urgency === 'critical' && (
                        <span className="shrink-0 px-2 py-0.5 rounded text-xs font-semibold bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200">
                          Critical
                        </span>
                      )}
                      {c.urgency === 'low' && (
                        <span className="shrink-0 px-2 py-0.5 rounded text-xs font-semibold bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
                          Low
                        </span>
                      )}
                    </div>
                    {/* Middle: hours remaining + mini progress bar */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className={`text-xl font-bold tabular-nums ${hoursColor}`}>
                          {c.remainingHours.toFixed(1)}h
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {c.totalHours > 0 ? `left of ${c.totalHours.toFixed(1)}h` : 'remaining'}
                        </span>
                      </div>
                      {c.totalHours > 0 && (
                        <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden" role="progressbar" aria-valuenow={c.remainingPct} aria-valuemin={0} aria-valuemax={100}>
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              c.remainingPct > 25 ? 'bg-blue-500 dark:bg-blue-600' : c.remainingPct > 10 ? 'bg-amber-500 dark:bg-amber-600' : 'bg-red-500 dark:bg-red-600'
                            }`}
                            style={{ width: `${c.remainingPct}%` }}
                          />
                        </div>
                      )}
                    </div>
                    {/* Footer: upcoming + expiry, then full-width action button */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        {c.upcomingCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            {c.upcomingCount} upcoming
                          </span>
                        )}
                        {c.expiringWithin30Days && c.expiresAt && (
                          <span className="text-amber-600 dark:text-amber-400">
                            Expires {c.expiresAt.format('D MMM')}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {/* No package yet: primary Buy hours */}
                        {c.totalHours === 0 && (
                          <button
                            type="button"
                            onClick={closeBreakdownThen(() => onBuyHoursForChild(c.childId))}
                            className="min-h-[44px] flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Buy hours
                          </button>
                        )}
                        {/* Depleted package: Top up */}
                        {onTopUpChild && c.remainingHours <= 0 && c.totalHours > 0 && (
                          <button
                            type="button"
                            onClick={closeBreakdownThen(() => onTopUpChild(c.childId))}
                            className="min-h-[44px] flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          >
                            Top up
                          </button>
                        )}
                        {/* Has hours: Book session primary */}
                        {onBookSession && c.remainingHours > 0 && (
                          <button
                            type="button"
                            onClick={closeBreakdownThen(() => onBookSession(c.childId))}
                            className="min-h-[44px] flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Book session
                          </button>
                        )}
                        {!onBookSession && c.remainingHours > 0 && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">{c.remainingHours.toFixed(1)}h left</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
                </div>
              )}
            </>
          )}
          </div>
        </div>

        {/* 7. Quick actions – always visible */}
        {canAnyFilteredChildBuyNewHours && !allChildrenHaveActivePackages ? (
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={closeBreakdownThen(handleBuyMoreHoursClick)}
              className="w-full min-h-[44px] py-3 rounded-lg font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Plus className="w-5 h-5" aria-hidden />
              Buy more hours
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {approvedChildren.length === 0 ? (
              <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
                <div className="flex items-start gap-3">
                  <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-200">Add a child first</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Add a child before purchasing hours.
                    </p>
                    {onAddChild && (
                      <button
                        type="button"
                        onClick={closeBreakdownThen(onAddChild)}
                        className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Add child
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : hasDraftOrUnpaidActivePackage ? (
              <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <p className="font-semibold text-amber-800 dark:text-amber-200">Payment processing</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Payment is usually confirmed within a few minutes.
                    </p>
                    {unpaidBookingReference ? (
                      <Link
                        href={`/bookings/${unpaidBookingReference}/payment`}
                        className="mt-2 inline-block text-sm font-medium text-amber-700 dark:text-amber-200 hover:underline"
                      >
                        View status
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard/parent/bookings"
                        className="mt-2 inline-block text-sm font-medium text-amber-700 dark:text-amber-200 hover:underline"
                      >
                        View bookings
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" aria-hidden />
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    All set – all children have active packages.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
          </div>
        </SideCanvas>
        </>
        )}
      </div>

      {/* Checklist submitted or profile under review (so parent doesn't see "ALL CLEAR" and get confused) */}
      {(() => {
        const hasAwaitingReview = (childrenAwaitingChecklistReview?.length ?? 0) > 0;
        const hasPendingNoAction = (childrenPendingApproval?.length ?? 0) > 0 && (childrenNeedingChecklist?.length ?? 0) === 0;
        const showReviewingCard = !hasAlerts && (hasAwaitingReview || hasPendingNoAction);
        if (!showReviewingCard) return null;
        const names = (childrenAwaitingChecklistReview ?? childrenPendingApproval ?? []);
        return (
          <div className="bg-white rounded-xl border border-blue-200 p-6">
            <h3 className="text-xs font-semibold text-blue-700 tracking-wide mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              {hasAwaitingReview ? 'CHECKLIST SUBMITTED' : 'UNDER REVIEW'}
            </h3>
            <p className="text-sm text-gray-700 mb-2">
              We&apos;re reviewing {names.length === 1 ? `${names[0].name}'s` : 'your children\'s'} details. You&apos;ll be able to book sessions once we&apos;ve approved.
            </p>
            <p className="text-xs text-gray-500">
              No need to do anything – we&apos;ll email you when it&apos;s done.
            </p>
          </div>
        );
      })()}
    </Wrapper>
  );
}
