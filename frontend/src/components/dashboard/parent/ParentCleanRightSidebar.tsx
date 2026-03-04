'use client';

import React, { useMemo, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import moment from 'moment';
import { AlertTriangle, CheckCircle, Calendar, ChevronRight, ChevronDown, Plus, UserPlus, Clock, Ban, Filter, LayoutGrid, List, BarChart3, MoreVertical, CalendarDays, X, ShieldAlert } from 'lucide-react';
import Button from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/Modal';
import { SideCanvas } from '@/components/ui/SideCanvas';
import { getChildColor } from '@/utils/childColorUtils';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';
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
  /** Optional: open the Report a concern (safeguarding) modal. */
  onReportConcern?: () => void;
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
  if (!packageName) return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
  const lower = packageName.toLowerCase();
  if (lower.includes('premium')) return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200';
  if (lower.includes('starter') || lower.includes('trial')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200';
  return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200';
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
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-l-4 border-rose-500',
    icon: '🔴',
    title: 'font-semibold text-rose-800 dark:text-rose-200',
    message: 'text-rose-700 dark:text-rose-300',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-l-4 border-amber-500',
    icon: '⚠️',
    title: 'font-semibold text-amber-800 dark:text-amber-200',
    message: 'text-amber-700 dark:text-amber-300',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-l-4 border-blue-500',
    icon: 'ℹ️',
    title: 'font-semibold text-blue-800 dark:text-blue-200',
    message: 'text-blue-700 dark:text-blue-300',
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-l-4 border-emerald-500',
    icon: '✓',
    title: 'font-semibold text-emerald-800 dark:text-emerald-200',
    message: 'text-emerald-700 dark:text-emerald-300',
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
      className={`rounded-xl border border-slate-200 p-4 ${style.bg} ${style.border} dark:border-slate-700/50`}
      role="alert"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base leading-none" aria-hidden>{style.icon}</span>
            <span className={`text-sm ${style.title}`}>{alert.title}</span>
          </div>
          <p className={`mt-1 text-sm ${style.message}`}>{alert.description}</p>
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="mt-1.5 cursor-pointer rounded text-sm font-medium text-primary-blue hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {actionLabel} →
            </button>
          )}
        </div>
        {alert.dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-full p-2 text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-600"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

const MENU_DROPDOWN_OFFSET_PX = 4;

function NextUpSection({ sessions, getCountdownLabel, onViewDetails, onCancel, onReschedule, compact = false }: NextUpSectionProps) {
  const [openMenuScheduleId, setOpenMenuScheduleId] = useState<string | null>(null);
  const [cancelConfirmScheduleId, setCancelConfirmScheduleId] = useState<string | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);

  const openSession = openMenuScheduleId != null ? sessions.find((s) => s.scheduleId === openMenuScheduleId) : null;

  useEffect(() => {
    if (openMenuScheduleId == null) {
      setDropdownPosition(null);
      return;
    }
    const el = menuTriggerRef.current;
    if (!el) {
      setDropdownPosition({ top: 16, right: 16 });
      return;
    }
    const update = () => {
      const rect = el.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + MENU_DROPDOWN_OFFSET_PX,
        right: typeof window !== 'undefined' ? window.innerWidth - rect.right : 0,
      });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [openMenuScheduleId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openMenuScheduleId != null) setOpenMenuScheduleId(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openMenuScheduleId]);

  const renderPortaledMenu = () => {
    if (openMenuScheduleId == null || openSession == null || typeof document === 'undefined') return null;
    if (dropdownPosition == null) return null;
    const overlayAndMenu = (
      <>
        <div className="fixed inset-0 z-overlay" aria-hidden onClick={() => setOpenMenuScheduleId(null)} />
        <div
          className="fixed z-overlay w-40 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
          role="menu"
          aria-label="Session actions"
          style={{ top: dropdownPosition.top, right: dropdownPosition.right }}
        >
          <button
            type="button"
            role="menuitem"
            className="w-full px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors duration-100 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => {
              onReschedule?.(openSession);
              setOpenMenuScheduleId(null);
            }}
          >
            Reschedule
          </button>
          <button
            type="button"
            role="menuitem"
            className="w-full px-3 py-2 text-left text-sm font-medium text-rose-700 transition-colors duration-100 hover:bg-rose-50 dark:text-rose-200 dark:hover:bg-rose-900/30"
            onClick={() => {
              setCancelConfirmScheduleId(openSession.scheduleId);
              setOpenMenuScheduleId(null);
            }}
          >
            Cancel
          </button>
        </div>
      </>
    );
    return createPortal(overlayAndMenu, document.body);
  };

  if (compact) {
    return (
      <>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
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
                  <div className="overflow-hidden rounded-lg border border-slate-100 bg-slate-50/50 transition-colors duration-100 hover:border-slate-200 hover:bg-blue-50/30 dark:border-slate-800 dark:bg-slate-800/30">
                    <div className="flex items-center gap-2 px-2.5 py-1.5">
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-900 dark:text-slate-100">{session.childName}</span>
                      <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200" aria-label={`Time until: ${countdown}`}>{countdown}</span>
                      <button type="button" onClick={() => onViewDetails?.({ scheduleId: session.scheduleId, childName: session.childName, childId: session.childId })} className="shrink-0 cursor-pointer rounded-full bg-primary-blue px-3 py-1 text-xs font-medium text-white transition-colors duration-150 hover:opacity-90">View</button>
                      {(onCancel || onReschedule) && (
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            ref={(el) => { if (isMenuOpen) menuTriggerRef.current = el; }}
                            onClick={(e) => { menuTriggerRef.current = e.currentTarget; setOpenMenuScheduleId(isMenuOpen ? null : session.scheduleId); }}
                            className="p-1 rounded text-primary-blue hover:bg-primary-blue/10 dark:hover:bg-primary-blue/20 cursor-pointer transition-colors"
                            aria-label="Session actions"
                            aria-expanded={isMenuOpen}
                          >
                            <MoreVertical className="w-3.5 h-3.5" aria-hidden />
                          </button>
                        </div>
                      )}
                    </div>
                  <div className="px-2.5 pb-1.5 text-2xs text-gray-500 dark:text-slate-400 truncate">{dateLabel}{timeLabel ? ` · ${timeLabel}` : ''}{session.trainerName ? ` · ${session.trainerName}` : ''}</div>
                  {isCancelConfirm && (
                    <div className="mx-2.5 mb-1.5 rounded-lg border border-rose-200 bg-rose-50 p-2 dark:border-rose-800 dark:bg-rose-950/30">
                      <p className="mb-1.5 text-xs font-medium text-slate-900 dark:text-slate-100">Cancel?</p>
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => { onCancel?.(session); setCancelConfirmScheduleId(null); }} className="cursor-pointer rounded-full bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:bg-rose-700">Yes</button>
                        <button type="button" onClick={() => setCancelConfirmScheduleId(null)} className="cursor-pointer rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">No</button>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      {renderPortaledMenu()}
    </>
    );
  }

  return (
    <>
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <Calendar className="h-4 w-4" aria-hidden />
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
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-150 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/30">
                {/* Top row: countdown badge top-right */}
                <div className="flex items-start justify-between gap-2 px-3 pt-2.5 pb-1">
                  <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{session.childName}</span>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                    aria-label={`Time until session: ${countdown}`}
                  >
                    {countdown}
                  </span>
                </div>
                <div className="space-y-1 px-3 pb-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
                    {dateLabel}
                  </div>
                  {timeLabel && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
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
                    className="inline-flex min-h-[44px] min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-primary-blue px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    View details
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  </button>
                  {(onCancel || onReschedule) && (
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={(e) => { menuTriggerRef.current = e.currentTarget; setOpenMenuScheduleId(isMenuOpen ? null : session.scheduleId); }}
                        className="rounded-full p-2 text-primary-blue transition-colors duration-150 hover:bg-primary-blue/10 hover:text-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue dark:hover:bg-primary-blue/20 dark:hover:text-primary-blue"
                        aria-label="Session actions"
                        aria-expanded={isMenuOpen}
                      >
                        <MoreVertical className="w-4 h-4" aria-hidden />
                      </button>
                    </div>
                  )}
                </div>
                {/* Inline cancel confirm */}
                {isCancelConfirm && (
                  <div className="mx-3 mb-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-950/30">
                    <p className="mb-2 text-sm font-medium text-slate-900 dark:text-slate-100">Cancel this session?</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onCancel?.(session);
                          setCancelConfirmScheduleId(null);
                        }}
                        className="cursor-pointer rounded-full bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-rose-700"
                      >
                        Yes, cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => setCancelConfirmScheduleId(null)}
                        className="cursor-pointer rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-700"
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
    {renderPortaledMenu()}
    </>
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
  onReportConcern,
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
  /** Filter popover open state (By child section: sort + low hours only). */
  const [breakdownFilterOpen, setBreakdownFilterOpen] = useState(false);
  const breakdownFilterTriggerRef = useRef<HTMLButtonElement>(null);
  const [breakdownFilterPanelRect, setBreakdownFilterPanelRect] = useState<{ top: number; right: number } | null>(null);

  useLayoutEffect(() => {
    if (!breakdownFilterOpen || !breakdownFilterTriggerRef.current) {
      setBreakdownFilterPanelRect(null);
      return;
    }
    const update = () => {
      const el = breakdownFilterTriggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setBreakdownFilterPanelRect({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [breakdownFilterOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (breakdownFilterTriggerRef.current && !breakdownFilterTriggerRef.current.contains(e.target as Node)) {
        const panel = document.getElementById('hours-breakdown-filter-panel');
        if (panel && panel.contains(e.target as Node)) return;
        setBreakdownFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
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
    : 'w-full bg-transparent lg:bg-white lg:border-l lg:border-gray-200 dark:lg:bg-slate-900 dark:lg:border-slate-700 p-4 md:p-4 lg:px-5 lg:pt-2 lg:pb-4 lg:min-w-0 space-y-4 lg:space-y-4 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto';

  const Wrapper = isStandalone ? 'div' : 'aside';

  /** Actions dropdown at top of right sidebar (Add child, Report a concern). */
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const createTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [createDropdownPosition, setCreateDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const showCreateButton = Boolean(onAddChild || onReportConcern);

  useEffect(() => {
    if (!createDropdownOpen || !showCreateButton) {
      setCreateDropdownPosition(null);
      return;
    }
    const el = createTriggerRef.current;
    if (!el) {
      setCreateDropdownPosition({ top: 48, left: 16 });
      return;
    }
    const update = () => {
      const rect = el.getBoundingClientRect();
      setCreateDropdownPosition({
        top: rect.bottom + MENU_DROPDOWN_OFFSET_PX,
        left: rect.left,
      });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [createDropdownOpen, showCreateButton]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && createDropdownOpen) setCreateDropdownOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [createDropdownOpen]);

  /** Child shown in the welcome banner (1a), if any – excluded from the NEW CHILD list (1b) to avoid duplicate. */
  const newRecent = useMemo(
    () => newChildren.filter((c) => isNewWithinDays(c.childId, 3) && !dismissedWelcomeChildIds.has(c.childId)),
    [newChildren, dismissedWelcomeChildIds],
  );
  const welcomeBannerChildId = newRecent.length > 0 ? newRecent[0].childId : null;
  const newChildrenForList = useMemo(
    () => (welcomeBannerChildId != null ? newChildren.filter((c) => c.childId !== welcomeBannerChildId) : newChildren),
    [newChildren, welcomeBannerChildId],
  );

  return (
    <>
      {/* Actions dropdown – individual, outside sidebar container */}
      {showCreateButton && (
        <div className="mb-3">
          <button
            ref={createTriggerRef}
            type="button"
            onClick={() => setCreateDropdownOpen((o) => !o)}
            className="flex items-center gap-2 w-full min-h-[44px] px-4 py-2 rounded-full border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            aria-expanded={createDropdownOpen}
            aria-haspopup="true"
            aria-label={`${EMPTY_STATE.PARENT_SIDEBAR.CREATE_BUTTON_LABEL} – add child or report a concern`}
          >
            <Plus className="w-5 h-5 shrink-0" aria-hidden />
            <span className="flex-1 text-left">{EMPTY_STATE.PARENT_SIDEBAR.CREATE_BUTTON_LABEL}</span>
            <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${createDropdownOpen ? 'rotate-180' : ''}`} aria-hidden />
          </button>
          {createDropdownOpen && createDropdownPosition != null && typeof document !== 'undefined' && createPortal(
            <>
              <div className="fixed inset-0 z-overlay" aria-hidden onClick={() => setCreateDropdownOpen(false)} />
              <div
                className="fixed z-overlay min-w-[200px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg py-1"
                role="menu"
                aria-label="Create options"
                style={{ top: createDropdownPosition.top, left: createDropdownPosition.left }}
              >
                {onAddChild && (
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-primary-blue hover:bg-primary-blue/10 dark:hover:bg-primary-blue/20 flex items-center gap-2 rounded-t-md"
                    onClick={() => {
                      onAddChild();
                      setCreateDropdownOpen(false);
                    }}
                  >
                    <UserPlus className="w-4 h-4 shrink-0 text-primary-blue" aria-hidden />
                    {EMPTY_STATE.PARENT_SIDEBAR.ADD_CHILD_LABEL}
                  </button>
                )}
                {onReportConcern && (
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full text-left px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 rounded-b-md"
                    onClick={() => {
                      onReportConcern();
                      setCreateDropdownOpen(false);
                    }}
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
                    {EMPTY_STATE.PARENT_SIDEBAR.REPORT_CONCERN_LABEL}
                  </button>
                )}
              </div>
            </>,
            document.body
          )}
        </div>
      )}

      <Wrapper className={wrapperClass}>
      {/* 1a. Welcome banner for new children (added in last 3 days, 0 hours) – dismissible */}
      {newRecent.length > 0 && (() => {
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
                    className="cursor-pointer rounded-full bg-primary-blue px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:opacity-90"
                  >
                    Buy Hours for {first.childName} →
                  </button>
                  <button
                    type="button"
                    onClick={onOpenGenericBuyHours}
                    className="cursor-pointer rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    View packages
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDismissedWelcomeChildIds((prev) => new Set(prev).add(first.childId))}
                className="shrink-0 p-1 rounded text-blue-700 hover:bg-blue-200/50 dark:hover:bg-blue-700/50 cursor-pointer"
                aria-label="Dismiss welcome banner"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
            </div>
          </div>
        );
      })()}

      {/* 1b. NEW CHILD – never had hours (first purchase); blue section. Excludes child shown in welcome banner (1a). */}
      {newChildrenForList.length > 0 && (
        <div
          className="rounded-xl border-2 border-blue-500 bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] dark:from-blue-900/30 dark:to-blue-800/20 p-3"
          role="region"
          aria-labelledby="sidebar-new-child-heading"
        >
          <h2 id="sidebar-new-child-heading" className="font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-2">
            <span aria-hidden>🆕</span> NEW CHILD – GET STARTED!
          </h2>
          {newChildrenForList.map((c) => (
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
                  className="cursor-pointer rounded-full bg-primary-blue px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:opacity-90"
                >
                  Buy Hours for {c.childName} →
                </button>
                <button
                  type="button"
                  onClick={onOpenGenericBuyHours}
                  className="cursor-pointer rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  View packages
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1c. No hours left – GCal-style: compact card, one-line summary, tappable rows like ACTIONS NEEDED */}
      {depletedChildren.length > 0 && (
        <div
          className="rounded-xl border border-red-200 bg-white dark:border-red-800 dark:bg-slate-900/50 p-3"
          role="region"
          aria-labelledby="sidebar-depleted-heading"
        >
          <h2 id="sidebar-depleted-heading" className="text-xs font-semibold text-red-700 dark:text-red-300 tracking-wide mb-1.5 flex items-center gap-2">
            <Ban className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" aria-hidden />
            No hours left
          </h2>
          <p className="text-2xs text-slate-600 dark:text-slate-400 mb-2">Top up to add more hours.</p>
          <ul className="space-y-1.5" role="list">
            {depletedChildren.map((c) => (
              <li key={c.childId}>
                <button
                  type="button"
                  onClick={() => (onTopUpChild ? onTopUpChild(c.childId) : onBuyHoursForChild(c.childId))}
                  className="flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-primary-blue transition-colors duration-150 hover:bg-primary-blue/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span className="min-w-0 truncate">
                    {c.childName}
                    {(c.packageName || c.bookedHours > 0) && (
                      <span className="text-slate-500 dark:text-slate-400 font-normal">
                        {' · '}{c.packageName ? `${c.packageName}: ` : ''}{c.bookedHours.toFixed(1)}h used
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 flex items-center gap-0.5">
                    Top up
                    <ChevronRight className="w-4 h-4" aria-hidden />
                  </span>
                </button>
              </li>
            ))}
          </ul>
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
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 cursor-pointer"
            >
              {useTopUp ? 'Top up' : 'Buy hours'}
            </button>
          </div>
        );
      })()}

      {/* 2. Actions needed – checklist, payment, low hours */}
      {actionItems.length > 0 && (
        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-amber-200 dark:border-amber-800 p-3">
          <h3 className="text-xs font-semibold text-amber-700 dark:text-amber-300 tracking-wide mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" aria-hidden />
            ACTIONS NEEDED
          </h3>
          <ul className="space-y-1.5" role="list">
            {actionItems.map((item) => (
              <li key={item.id}>
                {item.type === 'checklist' && item.childId && onCompleteChecklist && (
                  <button
                    type="button"
                    onClick={() => onCompleteChecklist(item.childId!)}
                    className="flex min-h-[44px] w-full cursor-pointer items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-primary-blue transition-colors duration-150 hover:bg-primary-blue/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {item.label} →
                  </button>
                )}
                {item.type === 'payment' && (
                  unpaidBookingReference ? (
                    <Link
                      href={`/bookings/${unpaidBookingReference}/payment`}
                      className="flex min-h-[44px] items-center rounded-lg px-3 py-2.5 text-sm font-medium text-primary-blue transition-colors duration-150 hover:bg-primary-blue/10"
                    >
                      {item.label} →
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard/parent/bookings"
                      className="flex min-h-[44px] items-center rounded-lg px-3 py-2.5 text-sm font-medium text-primary-blue transition-colors duration-150 hover:bg-primary-blue/10"
                    >
                      {item.label} →
                    </Link>
                  )
                )}
                {item.type === 'low_hours' && item.childId && (
                  <button
                    type="button"
                    onClick={() => onBuyHoursForChild(item.childId!)}
                    className="flex min-h-[44px] w-full cursor-pointer items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-primary-blue transition-colors duration-150 hover:bg-primary-blue/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
            <AlertTriangle className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden />
            ALERTS
            {visibleAlerts.length > 1 && (
              <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 px-1.5 text-2xs font-bold text-gray-700 dark:text-gray-300">
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
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-2xs font-medium text-slate-600 dark:text-slate-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" aria-hidden />
              {EMPTY_STATE.PARENT_SIDEBAR.ALL_CLEAR}
            </span>
          </div>
        ) : null;
      })()}

      {/* 5. Hours card – compact, calendar-style: number + thin bar + minimal list */}
      <div id="dashboard-hours-section" className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 shadow-sm p-4 transition-shadow duration-200 hover:shadow-md ${hasAlerts ? 'mt-6' : ''}`}>
        {hoursLoading ? (
          <div className="py-2" aria-busy="true" aria-label="Loading hours">
            <div className="h-10 w-20 rounded bg-slate-200 dark:bg-slate-600 animate-pulse" />
            <div className="mt-3 h-3 w-full rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
            <div className="mt-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-full rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
        <>
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span
            className={`text-3xl font-semibold tabular-nums tracking-tight ${
              hoursUrgency === 'critical'
                ? 'text-red-600 dark:text-red-400'
                : hoursUrgency === 'warning'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-900 dark:text-slate-100'
            }`}
            aria-label={`${totalRemainingHours.toFixed(1)} hours remaining`}
          >
            {totalRemainingHours.toFixed(1)}
          </span>
          <span className="text-lg font-medium text-slate-500 dark:text-slate-400">h</span>
          <span className="text-2xs text-slate-500 dark:text-slate-400 ml-1">{EMPTY_STATE.PARENT_SIDEBAR.HOURS_AVAILABLE}</span>
          {totalPackageHours > 0 && totalBookedHours > 0 && (
            <span className="text-2xs text-slate-500 dark:text-slate-400 ml-1.5" aria-label={`${totalBookedHours.toFixed(1)} hours booked`}>
              · {totalBookedHours.toFixed(1)}h {EMPTY_STATE.PARENT_SIDEBAR.HOURS_BOOKED}
            </span>
          )}
          {(hoursUrgency === 'warning' || hoursUrgency === 'critical') && (
            <span
              className={`w-1.5 h-1.5 rounded-full animate-pulse ml-1 ${
                hoursUrgency === 'critical' ? 'bg-red-500 dark:bg-red-400' : 'bg-amber-500 dark:bg-amber-400'
              }`}
              aria-hidden
            />
          )}
        </div>

        {totalPackageHours > 0 && (
          <div className="mt-3" role="progressbar" aria-valuenow={remainingPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Package hours remaining">
            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${
                  remainingPercent > 75
                    ? 'bg-emerald-500 dark:bg-emerald-600'
                    : remainingPercent > 25
                      ? 'bg-primary-blue'
                      : remainingPercent > 10
                        ? 'bg-amber-500 dark:bg-amber-600'
                        : 'bg-red-500 dark:bg-red-600'
                }`}
                style={{ width: `${remainingPercent}%` }}
              />
            </div>
          </div>
        )}

        {childHoursWithMeta.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-slate-100 dark:border-slate-800 pt-3" role="list" aria-label="Hours per child">
              {childHoursWithMeta.map((c) => {
                const needsBuyHours = c.totalHours === 0;
                const needsTopUp = c.totalHours > 0 && c.remainingHours <= 0;
                const label = needsBuyHours
                  ? `${c.childName} · 0h`
                  : `${c.childName} · ${c.remainingHours.toFixed(1)}h`;
                return (
                  <li
                    key={c.childId}
                    className={`text-2xs flex items-center gap-2 ${
                      needsBuyHours
                        ? 'text-blue-600 dark:text-blue-400'
                        : needsTopUp
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {needsBuyHours || needsTopUp ? null : (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" aria-hidden />
                    )}
                    <span>{label}</span>
                  </li>
                );
              })}
            </ul>
        )}

        <button
          type="button"
          onClick={() => setShowBreakdownPanel(true)}
          className="mt-3 text-2xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:underline transition-colors cursor-pointer"
          aria-haspopup="dialog"
          aria-expanded={false}
        >
          {EMPTY_STATE.PARENT_SIDEBAR.VIEW_BREAKDOWN}
        </button>

        <SideCanvas
          isOpen={showBreakdownPanel}
          onClose={() => setShowBreakdownPanel(false)}
          title={EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.TITLE}
          description={EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.DESCRIPTION}
          widthClassName="sm:w-[420px] md:w-[480px]"
          closeLabel={EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.CLOSE_LABEL}
        >
          <div className="space-y-6 pb-2">
            {childHours.length === 0 ? (
              (() => {
                const needsChecklist = (childrenNeedingChecklist?.length ?? 0) > 0;
                const awaitingReview = (childrenAwaitingChecklistReview?.length ?? 0) > 0;
                const pendingNoAction = (childrenPendingApproval?.length ?? 0) > 0 && (childrenNeedingChecklist?.length ?? 0) === 0;
                if (needsChecklist && childrenNeedingChecklist && onCompleteChecklist) {
                  const first = childrenNeedingChecklist[0];
                  return (
                    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-6 text-center" role="status">
                      <AlertTriangle className="w-10 h-10 text-amber-600 dark:text-amber-400 mx-auto mb-3" aria-hidden />
                      <p className="font-semibold text-amber-800 dark:text-amber-200">Complete {first.name}&apos;s checklist</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        Hours will appear here once the checklist is complete and approved.
                      </p>
                      <button
                        type="button"
                        onClick={closeBreakdownThen(() => onCompleteChecklist(first.id))}
                        className="mt-4 min-h-[44px] px-6 py-2.5 rounded-lg font-medium text-sm bg-amber-600 text-white hover:bg-amber-700 cursor-pointer"
                      >
                        Complete checklist
                      </button>
                    </div>
                  );
                }
                if (awaitingReview || pendingNoAction) {
                  const names = (childrenAwaitingChecklistReview ?? childrenPendingApproval ?? []);
                  const label = names.length === 1 ? `${names[0].name}'s` : 'your children\'s';
                  return (
                    <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-6 text-center" role="status">
                      <Clock className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mb-3" aria-hidden />
                      <p className="font-semibold text-blue-800 dark:text-blue-200">We&apos;re reviewing {label} details</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        You&apos;ll see hours here once we&apos;ve approved. No need to do anything – we&apos;ll email you when it&apos;s done.
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-6 text-center" role="status">
                    <UserPlus className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mb-3" aria-hidden />
                    <p className="font-semibold text-blue-800 dark:text-blue-200">Add a child to get started</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Add a child, then purchase a package to book sessions and see hours here.
                    </p>
                    {onAddChild && (
                      <Button
                        type="button"
                        onClick={closeBreakdownThen(onAddChild)}
                        variant="primary"
                        size="sm"
                        className="mt-4 min-h-[44px] rounded-full"
                      >
                        Add child
                      </Button>
                    )}
                  </div>
                );
              })()
            ) : (
              <>
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
                          className="cursor-pointer rounded-full bg-primary-blue px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:opacity-90"
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
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 cursor-pointer"
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
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 cursor-pointer"
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
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 cursor-pointer"
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
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 cursor-pointer"
                >
                  {warningChildren.length === 1 && warningChildren[0].totalHours > 0 && onTopUpChild ? 'Top up' : 'View packages'}
                </button>
              </>
            )}
          </div>
        )}

        {/* By child – Google Calendar–style section with filter popover */}
        <div className="mt-6">
          <div className="flex flex-col gap-3">
            {/* Header: section title + filter popover trigger + view mode */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.SECTION_HEADING}
              </h3>
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <button
                    ref={breakdownFilterTriggerRef}
                    type="button"
                    onClick={() => setBreakdownFilterOpen((o) => !o)}
                    className={`flex min-h-[36px] items-center gap-2 rounded-lg border px-3 py-2 text-2xs font-medium transition-colors ${
                      perChildSort !== 'hours_remaining' || perChildFilterLowOnly
                        ? 'border-primary-blue bg-primary-blue/10 text-primary-blue dark:bg-primary-blue/20 dark:text-primary-blue'
                        : 'border-slate-200 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                    aria-expanded={breakdownFilterOpen}
                    aria-haspopup="dialog"
                    aria-label={`${EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.SORT_LABEL}: ${perChildSort === 'name' ? EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.SORT_NAME : perChildSort === 'hours_remaining' ? EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.SORT_HOURS_LEFT : EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.SORT_USAGE_PCT}${perChildFilterLowOnly ? `, ${EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.FILTER_LOW_ONLY}` : ''}`}
                  >
                    <Filter className="w-3.5 h-3.5 shrink-0" aria-hidden />
                    <span className="truncate">
                      {perChildSort === 'name'
                        ? EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.SORT_NAME
                        : perChildSort === 'hours_remaining'
                          ? EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.SORT_HOURS_LEFT
                          : EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.SORT_USAGE_PCT}
                      {perChildFilterLowOnly ? ' · Low only' : ''}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${breakdownFilterOpen ? 'rotate-180' : ''}`} aria-hidden />
                  </button>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-600" aria-hidden />
                <div className="flex items-center gap-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5" role="group" aria-label="View mode">
                  <button
                    type="button"
                    onClick={() => setPerChildView('cards')}
                    className={`min-h-[32px] min-w-[32px] rounded-md p-1.5 flex items-center justify-center transition-colors ${perChildView === 'cards' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    title={EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.VIEW_CARDS}
                    aria-pressed={perChildView === 'cards'}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPerChildView('compact')}
                    className={`min-h-[32px] min-w-[32px] rounded-md p-1.5 flex items-center justify-center transition-colors ${perChildView === 'compact' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    title={EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.VIEW_LIST}
                    aria-pressed={perChildView === 'compact'}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPerChildView('comparison')}
                    className={`min-h-[32px] min-w-[32px] rounded-md p-1.5 flex items-center justify-center transition-colors ${perChildView === 'comparison' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    title={EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.VIEW_COMPARISON}
                    aria-pressed={perChildView === 'comparison'}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter popover – portaled, anchored to trigger */}
            {breakdownFilterOpen && typeof document !== 'undefined' && breakdownFilterPanelRect && createPortal(
              <>
                <div className="fixed inset-0 z-overlay" aria-hidden onClick={() => setBreakdownFilterOpen(false)} />
                <div
                  id="hours-breakdown-filter-panel"
                  role="dialog"
                  aria-label="Sort and filter hours by child"
                  className="fixed z-overlay min-w-[200px] max-w-[calc(100vw-1rem)] rounded-xl border border-slate-200 bg-white py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800"
                  style={{ top: breakdownFilterPanelRect.top, right: breakdownFilterPanelRect.right }}
                >
                  <p className="px-3 py-1.5 text-2xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.SORT_LABEL}
                  </p>
                  <div className="py-1">
                    {(['name', 'hours_remaining', 'usage_pct'] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setPerChildSort(value);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm min-h-[44px] sm:min-h-0 sm:py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                          perChildSort === value ? 'font-medium text-primary-blue dark:text-primary-blue' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {value === 'name'
                          ? EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.SORT_NAME
                          : value === 'hours_remaining'
                            ? EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.SORT_HOURS_LEFT
                            : EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.SORT_USAGE_PCT}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-700 my-2" />
                  <label className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer min-h-[44px] sm:min-h-0 sm:py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <input
                      type="checkbox"
                      checked={perChildFilterLowOnly}
                      onChange={(e) => setPerChildFilterLowOnly(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-primary-blue focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-700"
                    />
                    <span>{EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.FILTER_LOW_ONLY}</span>
                  </label>
                  {(perChildSort !== 'hours_remaining' || perChildFilterLowOnly) && (
                    <div className="border-t border-slate-100 dark:border-slate-700 pt-2 px-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPerChildSort('hours_remaining');
                          setPerChildFilterLowOnly(false);
                          setBreakdownFilterOpen(false);
                        }}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-2xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        {EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.CLEAR_FILTERS}
                      </button>
                    </div>
                  )}
                </div>
              </>,
              document.body
            )}

          </div>
          <div className="p-4 pt-3 space-y-3">
          {childHours.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add a child and purchase a package to get started.
              </p>
                    {onAddChild && (
                        <Button
                          type="button"
                          onClick={closeBreakdownThen(onAddChild)}
                          variant="primary"
                          size="sm"
                          className="w-full rounded-lg"
                        >
                          Add child
                        </Button>
                      )}
            </div>
          ) : (
            <>
              {perChildFilterLowOnly && displayedChildHours.length === 0 && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" aria-hidden />
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                    {EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.NO_LOW_HOURS_TITLE}
                  </p>
                  <p className="text-2xs text-emerald-700 dark:text-emerald-300 mt-1">
                    {EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.NO_LOW_HOURS_MESSAGE}
                  </p>
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
                                className={`h-full rounded-full transition-all duration-200 ${c.remainingPct > 25 ? 'bg-primary-blue' : c.remainingPct > 10 ? 'bg-amber-500' : 'bg-rose-500'}`}
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
                              className="min-h-[36px] px-2 py-1.5 text-2xs font-medium text-blue-600 dark:text-blue-400"
                            >
                              {EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.BUY_HOURS_LABEL}
                            </button>
                          )}
                          {onBookSession && c.remainingHours > 0 && (
                            <button
                              type="button"
                              onClick={closeBreakdownThen(() => onBookSession(c.childId))}
                              className="min-h-[36px] px-2 py-1.5 text-2xs font-medium text-primary-blue dark:text-primary-blue"
                            >
                              {EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.BOOK_SESSION_LABEL}
                            </button>
                          )}
                          {c.totalHours > 0 && c.remainingHours <= 0 && (
                            <button
                              type="button"
                              onClick={closeBreakdownThen(() => (onTopUpChild ? onTopUpChild(c.childId) : onBuyHoursForChild(c.childId)))}
                              className="min-h-[36px] px-2 py-1.5 text-2xs font-medium text-blue-600 dark:text-blue-400"
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
                <div className="grid grid-cols-1 gap-3 mt-4" role="list">
              {displayedChildHours.map((c) => {
                const childColor = getChildColor(c.childId);
                const hoursColor =
                  c.urgency === 'critical'
                    ? 'text-red-600 dark:text-red-400'
                    : c.urgency === 'low'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-900 dark:text-slate-100';
                return (
                  <div
                    key={c.childId}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 overflow-hidden flex"
                    role="article"
                    aria-label={`Hours for ${c.childName}: ${c.remainingHours.toFixed(1)} ${EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.REMAINING}`}
                  >
                    <div className="w-1 shrink-0 rounded-l-lg min-h-[1px]" style={{ backgroundColor: childColor }} aria-hidden />
                    <div className="flex-1 min-w-0 p-4">
                    {/* Header: avatar + name/package, warning badge – event-style */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
                          style={{ backgroundColor: childColor }}
                          aria-hidden
                        >
                          {c.childName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{c.childName}</p>
                          {c.packageName && (
                            <p className="text-2xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{c.packageName}</p>
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
                    {/* Middle: hours remaining + mini progress bar – Google Calendar–style */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className={`text-xl font-bold tabular-nums ${hoursColor}`}>
                          {c.remainingHours.toFixed(1)}h
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {c.totalHours > 0
                            ? `${EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.LEFT_OF} ${c.totalHours.toFixed(1)}h`
                            : EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.REMAINING}
                        </span>
                      </div>
                      {c.totalHours > 0 && (
                        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden" role="progressbar" aria-valuenow={c.remainingPct} aria-valuemin={0} aria-valuemax={100}>
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              c.remainingPct > 25 ? 'bg-primary-blue' : c.remainingPct > 10 ? 'bg-amber-500 dark:bg-amber-600' : 'bg-rose-500 dark:bg-rose-600'
                            }`}
                            style={{ width: `${c.remainingPct}%` }}
                          />
                        </div>
                      )}
                    </div>
                    {/* Footer: upcoming + expiry, then single primary action */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-slate-500 dark:text-slate-400">
                        {c.upcomingCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden />
                            {c.upcomingCount} {EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.UPCOMING}
                          </span>
                        )}
                        {c.expiringWithin30Days && c.expiresAt && (
                          <span className="text-amber-600 dark:text-amber-400">
                            {EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.EXPIRES} {c.expiresAt.format('D MMM')}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {/* No package yet: primary Buy hours */}
                        {c.totalHours === 0 && (
                          <button
                            type="button"
                            onClick={closeBreakdownThen(() => onBuyHoursForChild(c.childId))}
                            className="min-h-[44px] flex-1 px-4 py-2.5 rounded-full text-sm font-medium bg-primary-blue text-white hover:opacity-90 transition-all duration-150 cursor-pointer"
                          >
                            {EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.BUY_HOURS_LABEL}
                          </button>
                        )}
                        {/* Depleted package: Top up */}
                        {onTopUpChild && c.remainingHours <= 0 && c.totalHours > 0 && (
                          <button
                            type="button"
                            onClick={closeBreakdownThen(() => onTopUpChild(c.childId))}
                            className="min-h-[44px] flex-1 px-4 py-2.5 rounded-full text-sm font-medium text-primary-blue dark:text-primary-blue hover:bg-primary-blue/10 dark:hover:bg-primary-blue/20 transition-colors duration-150 cursor-pointer"
                          >
                            {EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.TOP_UP}
                          </button>
                        )}
                        {/* Has hours: Book session primary */}
                        {onBookSession && c.remainingHours > 0 && (
                          <button
                            type="button"
                            onClick={closeBreakdownThen(() => onBookSession(c.childId))}
                            className="min-h-[44px] flex-1 px-4 py-2.5 rounded-full text-sm font-medium bg-primary-blue text-white hover:opacity-90 transition-all duration-150 cursor-pointer"
                          >
                            {EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.BOOK_SESSION_LABEL}
                          </button>
                        )}
                        {!onBookSession && c.remainingHours > 0 && (
                          <span className="text-sm text-slate-500 dark:text-slate-400">{c.remainingHours.toFixed(1)}h left</span>
                        )}
                      </div>
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
                  className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary-blue py-3 text-sm font-medium text-white transition-all duration-150 hover:opacity-90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                      <Button
                        type="button"
                        onClick={closeBreakdownThen(onAddChild)}
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                      >
                        Add child
                      </Button>
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
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden />
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                    {EMPTY_STATE.PARENT_SIDEBAR.BREAKDOWN.ALL_SET_MESSAGE}
                  </p>
                </div>
              </div>
            )}
          </div>
            )}
              </>
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
        if (showReviewingCard) {
          const names = (childrenAwaitingChecklistReview ?? childrenPendingApproval ?? []);
          return (
            <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900/50 p-6">
              <h3 className="text-xs font-semibold text-blue-700 dark:text-blue-300 tracking-wide mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                {hasAwaitingReview ? 'CHECKLIST SUBMITTED' : 'UNDER REVIEW'}
              </h3>
              <p className="text-sm text-gray-700 dark:text-slate-300 mb-2">
                We&apos;re reviewing {names.length === 1 ? `${names[0].name}'s` : 'your children\'s'} details. You&apos;ll be able to book sessions once we&apos;ve approved.
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                No need to do anything – we&apos;ll email you when it&apos;s done.
              </p>
            </div>
          );
        }
        return null;
      })()}
      {/* Approved – book session (only when child is approved, no alerts, and they have hours to book) */}
      {(() => {
        const hasAwaitingReview = (childrenAwaitingChecklistReview?.length ?? 0) > 0;
        const hasPendingNoAction = (childrenPendingApproval?.length ?? 0) > 0 && (childrenNeedingChecklist?.length ?? 0) === 0;
        const showApprovedCard = !hasAlerts && approvedChildren.length > 0 && !hasAwaitingReview && !hasPendingNoAction;
        const canBook = totalRemainingHours > 0 && onBookSession && approvedChildren.length > 0;
        if (!showApprovedCard || !canBook) return null;
        return (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 shadow-sm p-4 transition-shadow duration-200 hover:shadow-md">
            <p className="text-2xs text-slate-500 dark:text-slate-400 mb-3">{EMPTY_STATE.PARENT_SIDEBAR.BOOK_SESSION_READY}</p>
            <button
              type="button"
              onClick={() => onBookSession(approvedChildren[0].id)}
              className="w-full min-h-[40px] px-4 py-2 rounded-full font-medium text-sm bg-primary-blue text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-150 cursor-pointer"
            >
              {EMPTY_STATE.PARENT_SIDEBAR.BOOK_SESSION}
            </button>
          </div>
        );
      })()}
      </Wrapper>
    </>
  );
}
