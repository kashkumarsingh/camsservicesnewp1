'use client';

import React from 'react';
import { Clock, AlertCircle, CheckCircle, Package, CreditCard, XCircle, Info, ExternalLink, Trash2, Hourglass } from 'lucide-react';
import moment from 'moment';
import Button from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/Modal';
import { getChildColor } from '@/utils/childColorUtils';
import type { Child } from '@/core/application/auth/types';
import { getChildChecklistFlags, childNeedsChecklistCta } from '@/core/application/auth/types';
import type { BookingDTO } from '@/core/application/booking/dto/BookingDTO';

interface DashboardRightSidebarProps {
  children: Child[];
  approvedChildren: Child[];
  /** Rejected children (not approved) – shown at top of sidebar when present */
  rejectedChildren?: Child[];
  bookings: BookingDTO[];
  /** Child IDs that already have an active package (one per child). Used to hide "Buy hours" when the child cannot purchase another package yet. */
  childIdsWithActivePackage?: Set<number>;
  /**
   * Optional callback to open the Buy Hours modal.
   * If not provided, the sidebar will fall back to link navigation.
   */
  onBuyHours?: (childId: number) => void;
  /**
   * Optional callback to open the Complete Checklist modal.
   * If not provided, the sidebar will fall back to link navigation.
   */
  onCompleteChecklist?: (childId: number) => void;
  /**
   * Optional callback to open the Complete Payment modal.
   * If not provided, the sidebar will fall back to link navigation.
   */
  onCompletePayment?: (booking: BookingDTO) => void;
  /** When true, show priority content only (responsive narrow layout). */
  showPriorityContent?: boolean;
  /** Whether to use compact view */
  showCompactView?: boolean;
  /** Spacing mode: compact, normal, or comfortable */
  spacing?: 'compact' | 'normal' | 'comfortable';
  onBookSession?: (childId: number, date?: string) => void;
  onCancelDraftBooking?: (bookingId: string) => void;
  onRemoveChild?: (childId: number) => void;
  /** Open Booked Sessions modal for a child (shows which days are booked – Session Details). */
  onOpenBookedSessions?: (childId: number) => void;
  /** Child IDs currently shown on the calendar (for filter checkboxes). */
  visibleChildIds?: number[];
  /** Toggle whether a child appears on the calendar. */
  onToggleChildVisibility?: (childId: number) => void;
  /** Children to list in the calendar filter (e.g. children with bookings). */
  filterableChildren?: Child[];
}

/**
 * Dashboard Right Sidebar Component
 * 
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Hours summary and pending actions sidebar (Google Calendar-style)
 * Location: frontend/src/components/dashboard/DashboardRightSidebar.tsx
 * 
 * Features:
 * - Hours summary (total remaining, per child)
 * - Action needed (checklist, payment due, low hours)
 * - Compact, scannable design
 */
export default function DashboardRightSidebar({
  children,
  approvedChildren,
  rejectedChildren = [],
  bookings,
  childIdsWithActivePackage,
  onBuyHours,
  onCompleteChecklist,
  onCompletePayment,
  showCompactView = false,
  spacing = 'normal',
  onBookSession,
  onCancelDraftBooking,
  onRemoveChild,
  onOpenBookedSessions,
  showPriorityContent,
  visibleChildIds,
  onToggleChildVisibility,
  filterableChildren = [],
}: DashboardRightSidebarProps) {
  const isChildVisible = (childId: number) => {
    if (!visibleChildIds || visibleChildIds.length === 0) return true;
    return visibleChildIds.includes(childId);
  };
  const formatCurrency = React.useCallback((amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  }, []);

  const formatExpiryLabel = React.useCallback((expiresAtIso: string) => {
    const daysUntilExpiry = moment(expiresAtIso).diff(moment(), 'days');
    const dateLabel = moment(expiresAtIso).format('DD MMM YYYY');

    if (daysUntilExpiry > 0) {
      return `Expires ${dateLabel} (${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} remaining)`;
    }
    if (daysUntilExpiry === 0) {
      return `Expires ${dateLabel} (expires today)`;
    }
    return `Expired ${dateLabel} (${Math.abs(daysUntilExpiry)} day${Math.abs(daysUntilExpiry) !== 1 ? 's' : ''} ago)`;
  }, []);

  // Tooltip and modal state
  const [tooltipChildId, setTooltipChildId] = React.useState<number | null>(null);
  const [modalChildId, setModalChildId] = React.useState<number | null>(null);
  const [removeConfirmChildId, setRemoveConfirmChildId] = React.useState<number | null>(null);
  const [isRemoving, setIsRemoving] = React.useState(false);
  const tooltipTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Close tooltip on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipChildId && !(e.target as HTMLElement).closest('.tooltip-container')) {
        setTooltipChildId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [tooltipChildId]);

  // Calculate hours summary (including draft bookings)
  const hoursSummary = React.useMemo(() => {
    const confirmedPaidBookings = bookings.filter(
      b => b.status === 'confirmed' && b.paymentStatus === 'paid'
    );

    // Get draft bookings (payment pending)
    const draftBookings = bookings.filter(
      b => b.status === 'draft' && (b.paymentStatus === 'pending' || b.paymentStatus === 'failed')
    );

    // Get active bookings (one per child - most recent)
    const activeBookings: typeof bookings = [];
    approvedChildren.forEach(child => {
      const childBookings = confirmedPaidBookings.filter(b => {
        if (!b.participants) return false;
        return b.participants.some(p => p.childId === child.id);
      });

      if (childBookings.length > 0) {
        const sorted = [...childBookings].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        activeBookings.push(sorted[0]);
      }
    });

    // Get draft bookings per child (one per child - most recent)
    const draftBookingsPerChild: typeof bookings = [];
    approvedChildren.forEach(child => {
      const childDraftBookings = draftBookings.filter(b => {
        if (!b.participants) return false;
        return b.participants.some(p => p.childId === child.id);
      });

      if (childDraftBookings.length > 0) {
        const sorted = [...childDraftBookings].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        draftBookingsPerChild.push(sorted[0]);
      }
    });

    const totalHoursPurchased = activeBookings.reduce((sum, b) => sum + (b.totalHours || 0), 0);
    const totalHoursBooked = activeBookings.reduce((sum, b) => sum + (b.bookedHours || 0), 0);
    const totalHoursRemaining = totalHoursPurchased - totalHoursBooked;
    
    // Calculate pending hours from draft bookings
    const totalPendingHours = draftBookingsPerChild.reduce((sum, b) => sum + (b.totalHours || 0), 0);

    // Per-child hours (including pending)
    const childHours = approvedChildren.map(child => {
      const activeBooking = activeBookings.find(b => {
        if (!b.participants) return false;
        return b.participants.some(p => p.childId === child.id);
      });

      const draftBooking = draftBookingsPerChild.find(b => {
        if (!b.participants) return false;
        return b.participants.some(p => p.childId === child.id);
      });

      return {
        childId: child.id,
        childName: child.name,
        packageName: activeBooking?.package?.name || null,
        totalHours: activeBooking?.totalHours || 0,
        bookedHours: activeBooking?.bookedHours || 0,
        remainingHours: (activeBooking?.totalHours || 0) - (activeBooking?.bookedHours || 0),
        packageExpiresAt: activeBooking?.packageExpiresAt,
        // Draft booking info
        pendingHours: draftBooking?.totalHours || 0,
        draftBooking: draftBooking || null,
      };
    });

    return {
      totalHoursPurchased,
      totalHoursBooked,
      totalHoursRemaining,
      totalPendingHours,
      childHours,
    };
  }, [children, approvedChildren, bookings]);

  // Submitted checklists awaiting admin review (informational, not an action the parent can complete)
  const awaitingChecklistReview = React.useMemo(() => {
    return children
      .filter(child => getChildChecklistFlags(child).approvalStatus === 'pending')
      .filter(child => {
        const { hasChecklist, checklistCompleted } = getChildChecklistFlags(child);
        return hasChecklist === true && checklistCompleted !== true;
      })
      .map(child => ({
        childId: child.id,
        childName: child.name,
      }));
  }, [children]);

  // Tooltip open in "Your hours" vs "Action needed" – use overflow-visible on that card so tooltip is not clipped
  const isTooltipInYourHours = Boolean(
    tooltipChildId && hoursSummary.childHours.some(ch => ch.childId === tooltipChildId && ch.pendingHours === 0 && ch.remainingHours > 0)
  );
  const isTooltipInActionNeeded = Boolean(
    tooltipChildId && hoursSummary.childHours.some(ch => ch.childId === tooltipChildId && (ch.pendingHours > 0 || (ch.totalHours === 0 && ch.pendingHours === 0)))
  );

  return (
    <div className="space-y-8">
      {/* Rejected children – Google Calendar style card */}
      {rejectedChildren.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#dadce0] dark:border-gray-600 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e8eaed] dark:border-gray-700">
            <h3 className="text-[11px] font-medium uppercase tracking-wide text-[#5f6368] dark:text-gray-400 flex items-center gap-2">
              <XCircle size={14} className="text-amber-500 dark:text-amber-400 shrink-0" aria-hidden />
              {rejectedChildren.length === 1 ? '1 child not approved' : `${rejectedChildren.length} children not approved`}
            </h3>
            <p className="text-xs text-[#5f6368] dark:text-gray-400 mt-1">
              Update each checklist, then contact us for a new review.
            </p>
          </div>
          <div className="px-4 py-2 space-y-1">
            {rejectedChildren.map((c) => (
              <div
                key={c.id}
                className="py-2 px-3 rounded-r-md border-l-4 border-l-amber-500 dark:border-l-amber-500 bg-[#f8f9fa] dark:bg-amber-900/20 hover:bg-[#f1f3f4] dark:hover:bg-amber-900/30 flex flex-wrap items-center gap-x-2 gap-y-0.5 transition-colors"
              >
                <span className="text-sm font-medium text-[#202124] dark:text-gray-100 truncate min-w-0">
                  {c.name}
                </span>
                <span className="text-xs text-[#5f6368] dark:text-gray-400 truncate max-w-[60%]">
                  {c.rejectionReason || 'No reason provided.'}
                </span>
                {onCompleteChecklist && (
                  <button
                    type="button"
                    onClick={() => onCompleteChecklist(c.id)}
                    className="text-xs font-medium text-[#1a73e8] dark:text-blue-400 hover:text-[#1557b0] hover:underline focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:ring-offset-1 rounded ml-auto shrink-0 transition-colors"
                  >
                    Update checklist
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Your hours – consolidated card: title, booked prominent, stats grid, full-width CTA */}
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-[#dadce0] dark:border-gray-600 ${isTooltipInYourHours ? 'overflow-visible' : 'overflow-hidden'}`}>
        <div className="px-8 py-6 border-b border-[#e8eaed] dark:border-gray-700">
          <h3 className="text-[11px] font-medium uppercase tracking-wide text-[#5f6368] dark:text-gray-400 flex items-center gap-2 mb-4">
            <Clock size={14} className="text-[#5f6368] dark:text-gray-400" aria-hidden />
            Your hours
          </h3>
          <p className="text-2xl font-semibold tabular-nums text-[#202124] dark:text-gray-100 mb-5">
            {hoursSummary.totalHoursBooked.toFixed(1)} hours booked
          </p>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="rounded-lg bg-[#f8f9fa] dark:bg-gray-700/50 px-4 py-3 text-center">
              <div className="text-lg font-semibold tabular-nums text-[#202124] dark:text-gray-100">{hoursSummary.totalHoursRemaining.toFixed(1)}h</div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-[#5f6368] dark:text-gray-400">Available</div>
            </div>
            <div className="rounded-lg bg-[#f8f9fa] dark:bg-gray-700/50 px-4 py-3 text-center">
              <div className="text-lg font-semibold tabular-nums text-[#202124] dark:text-gray-100">{hoursSummary.totalHoursPurchased.toFixed(1)}h</div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-[#5f6368] dark:text-gray-400">Purchased</div>
            </div>
          </div>
          {onBuyHours && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-full justify-center py-3.5 font-medium"
              icon={<Package size={14} />}
              onClick={() => {
                const childId = hoursSummary.childHours[0]?.childId ?? approvedChildren[0]?.id;
                if (childId != null) onBuyHours(childId);
              }}
            >
              Buy Hours →
            </Button>
          )}
          {hoursSummary.totalHoursBooked > 0 && onOpenBookedSessions && (
            <button
              type="button"
              onClick={() => {
                const firstWithBooked = hoursSummary.childHours.find(ch => ch.bookedHours > 0);
                if (firstWithBooked) onOpenBookedSessions(firstWithBooked.childId);
              }}
              className="mt-3 w-full text-center text-sm font-medium text-[#1a73e8] dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:ring-offset-1 rounded"
              aria-label="View session details – which days are booked"
            >
              View session details →
            </button>
          )}
        </div>

        {(() => {
          const withActivePackage = hoursSummary.childHours.filter(
            ch => ch.totalHours > 0 && (!ch.packageExpiresAt || moment(ch.packageExpiresAt).isSameOrAfter(moment(), 'day'))
          );
          if (withActivePackage.length === 0) return null;
          return (
            <div
              className={`px-4 py-2 space-y-1 ${isTooltipInYourHours ? 'overflow-visible' : withActivePackage.length >= 5 ? 'overflow-y-scroll overscroll-contain pr-1 -mr-0.5 sidebar-list-scroll' : ''}`}
              style={withActivePackage.length >= 5 && !isTooltipInYourHours ? { maxHeight: 'min(220px, 35vh)' } : undefined}
              aria-label={`Hours for ${withActivePackage.length} child${withActivePackage.length !== 1 ? 'ren' : ''} with active package`}
            >
              {withActivePackage.map((childHour) => {
                    const isCritical = childHour.remainingHours < 1;
                    const isPending = childHour.remainingHours >= 1 && childHour.remainingHours < 2;
                    const daysUntilExpiry = childHour.packageExpiresAt ? moment(childHour.packageExpiresAt).diff(moment(), 'days') : null;
                    const packageStatus: 'active' | 'expiring_soon' | 'expired' | 'none' = !childHour.packageExpiresAt ? (childHour.totalHours > 0 ? 'active' : 'none') : (daysUntilExpiry !== null && daysUntilExpiry < 0) ? 'expired' : (daysUntilExpiry !== null && daysUntilExpiry <= 7) ? 'expiring_soon' : 'active';
                    const child = children.find(c => c.id === childHour.childId) || approvedChildren.find(c => c.id === childHour.childId);
                    const childColor = getChildColor(childHour.childId);
                    const showCalendarCheckbox = onToggleChildVisibility && filterableChildren.some(c => c.id === childHour.childId);
                    return (
                      <div key={childHour.childId} className={`rounded-r-md border-l-4 px-3 py-2 relative tooltip-container dark:bg-gray-800/50 hover:bg-[#f1f3f4] dark:hover:bg-gray-700/50 transition-colors ${tooltipChildId === childHour.childId ? 'z-[100]' : ''}`} style={{ borderLeftColor: childColor, backgroundColor: `${childColor}15` }} role="article" aria-label={`Hours for ${childHour.childName}`}>
                        <div className="flex items-center gap-2 flex-wrap">
                          {showCalendarCheckbox && (
                            <label className="flex items-center shrink-0 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isChildVisible(childHour.childId)}
                                onChange={() => onToggleChildVisibility(childHour.childId)}
                                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                                aria-label={`Show ${childHour.childName} on calendar`}
                              />
                            </label>
                          )}
                          <span className="text-sm font-medium text-[#202124] dark:text-gray-100 min-w-0 truncate flex-1" title={childHour.childName}>{childHour.childName}</span>
                          {childHour.bookedHours > 0 && onOpenBookedSessions ? (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onOpenBookedSessions(childHour.childId); }}
                              className="text-xs font-medium tabular-nums shrink-0 text-[#1a73e8] dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:ring-offset-1 rounded"
                              aria-label={`View session details for ${childHour.childName} – which days are booked`}
                            >
                              {childHour.bookedHours.toFixed(1)}h booked
                            </button>
                          ) : (
                            <span className={`text-xs font-medium tabular-nums shrink-0 ${isCritical ? 'text-[#d93025] dark:text-red-400' : 'text-[#5f6368] dark:text-gray-300'}`}>{childHour.bookedHours.toFixed(1)}h booked</span>
                          )}
                          <span className="text-xs font-medium tabular-nums shrink-0 text-[#5f6368] dark:text-gray-400">{childHour.remainingHours.toFixed(1)}h left</span>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setTooltipChildId(tooltipChildId === childHour.childId ? null : childHour.childId); }} onMouseEnter={() => { if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current); setTooltipChildId(childHour.childId); }} onMouseLeave={() => { tooltipTimeoutRef.current = setTimeout(() => setTooltipChildId(null), 200); }} className="p-1 hover:bg-[#e8eaed] dark:hover:bg-gray-600 rounded-full text-[#5f6368] hover:text-[#202124] dark:hover:text-gray-200 transition-colors" aria-label="View package details (tooltip)"><Info size={12} /></button>
                          {child?.canDelete && onRemoveChild && <button type="button" onClick={(e) => { e.stopPropagation(); setRemoveConfirmChildId(childHour.childId); }} disabled={isRemoving} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full text-[#5f6368] hover:text-[#d93025] flex-shrink-0 disabled:opacity-50 transition-colors" aria-label={`Remove ${childHour.childName}`} title="Remove child"><Trash2 size={12} /></button>}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          <button type="button" onClick={() => setModalChildId(childHour.childId)} className="flex items-center gap-1.5 text-xs text-[#5f6368] dark:text-gray-400 hover:text-[#1a73e8] dark:hover:text-blue-400 transition text-left">
                            <span className="truncate font-medium">{childHour.packageName || 'Package'}</span>
                            <span className="text-[#dadce0] dark:text-gray-500">·</span>
                            <span className={`font-medium shrink-0 ${isCritical ? 'text-[#d93025] dark:text-red-400' : isPending ? 'text-amber-600 dark:text-amber-400' : 'text-[#5f6368] dark:text-gray-400'}`}>{childHour.remainingHours.toFixed(1)}h left</span>
                            <ExternalLink size={12} className="shrink-0 text-[#1a73e8] dark:text-blue-400" aria-hidden />
                            <span className="text-[#1a73e8] dark:text-blue-400 text-xs">View details</span>
                          </button>
                          {onBookSession && childHour.remainingHours > 0 && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onBookSession(childHour.childId); }}
                              className="text-xs font-medium text-[#1a73e8] dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:ring-offset-1 rounded shrink-0"
                              aria-label={`Book session for ${childHour.childName}`}
                            >
                              Book session
                            </button>
                          )}
                        </div>
                        {tooltipChildId === childHour.childId && (
                          <div className="absolute z-[9999] w-72 bg-white dark:bg-gray-800 border border-[#dadce0] dark:border-gray-600 rounded-lg shadow-md p-3 bottom-full left-0 mb-2">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#e8eaed] dark:border-gray-700">
                              <Package size={14} className="text-[#1a73e8] dark:text-blue-400" />
                              <h4 className="text-xs font-semibold text-[#202124] dark:text-gray-100">{childHour.packageName || 'Package'} Package</h4>
                              {packageStatus === 'expired' ? <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-[#fce8e6] dark:bg-red-900/40 text-[#d93025] dark:text-red-300 flex items-center gap-1 ml-auto"><XCircle size={8} /> Expired</span> : packageStatus === 'expiring_soon' ? <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-[#fef7e0] dark:bg-amber-900/40 text-[#ea8600] dark:text-amber-300 flex items-center gap-1 ml-auto"><AlertCircle size={8} /> Expiring Soon</span> : <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-[#e6f4ea] dark:bg-green-900/40 text-[#1e8e3e] dark:text-green-300 flex items-center gap-1 ml-auto"><CheckCircle size={8} /> Active</span>}
                            </div>
                            <div className="space-y-1.5 text-xs text-[#5f6368] dark:text-gray-400">
                              <div className="flex items-center justify-between"><span>Total Hours:</span><span className="font-medium text-[#202124] dark:text-gray-100">{childHour.totalHours.toFixed(1)}h</span></div>
                              <div className="flex items-center justify-between"><span>Booked:</span><span className="font-medium text-[#202124] dark:text-gray-100">{childHour.bookedHours.toFixed(1)}h ({childHour.totalHours > 0 ? Math.round((childHour.bookedHours / childHour.totalHours) * 100) : 0}%)</span></div>
                              <div className="flex items-center justify-between"><span>Remaining:</span><span className="font-medium text-[#1e8e3e] dark:text-green-400">{childHour.remainingHours.toFixed(1)}h</span></div>
                              {childHour.packageExpiresAt && <div className="flex items-center gap-1.5 pt-1.5 border-t border-[#e8eaed] dark:border-gray-700"><Clock size={10} className="text-[#5f6368] dark:text-gray-400" /><span>{formatExpiryLabel(childHour.packageExpiresAt)}</span></div>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
            </div>
          );
        })()}
      </div>

      {/* Action needed – clear by child: 1 child = single message; multiple = "N children need attention" + list */}
      {(() => {
        const checklistNeeded = children.filter(childNeedsChecklistCta);
        const actionNeeded = hoursSummary.childHours.filter(ch => ch.pendingHours > 0 || (ch.totalHours === 0 && ch.pendingHours === 0));
        const totalActions = checklistNeeded.length + actionNeeded.length;
        const hasAnyAction = totalActions > 0;
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-xl border border-[#dadce0] dark:border-gray-600 ${isTooltipInActionNeeded ? 'overflow-visible' : 'overflow-hidden'}`}>
            <div className="px-6 py-4 border-b border-[#e8eaed] dark:border-gray-700 flex items-center justify-between gap-2">
              <h3 className="text-[11px] font-medium uppercase tracking-wide text-[#5f6368] dark:text-gray-400 flex items-center gap-2">
                {hasAnyAction ? (
                  <AlertCircle size={14} className="text-amber-500 dark:text-amber-400" />
                ) : (
                  <CheckCircle size={14} className="text-[#1e8e3e] dark:text-green-400" />
                )}
                Action needed
                {totalActions > 1 && (
                  <span className="text-[11px] font-normal text-[#5f6368] dark:text-gray-400">({totalActions})</span>
                )}
              </h3>
            </div>
            {!hasAnyAction ? (
              <div className="px-6 py-5">
                <p className="text-sm text-[#5f6368] dark:text-gray-400">All up to date</p>
              </div>
            ) : (
            <div
              className={`px-6 py-5 space-y-5 overscroll-contain ${
                isTooltipInActionNeeded ? 'overflow-visible' : totalActions >= 4 ? 'overflow-y-scroll sidebar-list-scroll' : 'overflow-y-auto'
              }`}
              style={totalActions >= 4 && !isTooltipInActionNeeded ? { maxHeight: 'min(280px, 45vh)' } : undefined}
              aria-label={`${totalActions} action${totalActions !== 1 ? 's' : ''} needed`}
            >
              {totalActions > 1 && (
                <p className="text-sm text-[#5f6368] dark:text-gray-400 -mt-1">
                  {totalActions} children need attention
                </p>
              )}
              {/* Checklist rows – clear message + single CTA (no delete icon in action widget) */}
              {checklistNeeded.map((child) => (
                <div
                  key={`checklist-${child.id}`}
                  className="rounded-lg border-l-4 border-l-amber-500 px-4 py-3 flex flex-col gap-2 bg-[#fef7e0] dark:bg-amber-900/20"
                  role="article"
                  aria-label={`${child.name} needs checklist`}
                >
                  <p className="text-sm font-medium text-[#202124] dark:text-gray-100">
                    {child.name} – complete checklist
                  </p>
                  {onCompleteChecklist && (
                    <button
                      type="button"
                      onClick={() => onCompleteChecklist(child.id)}
                      className="text-sm font-medium text-[#1a73e8] dark:text-blue-400 hover:underline text-left"
                    >
                      Start checklist →
                    </button>
                  )}
                </div>
              ))}
              {actionNeeded.map((childHour) => {
                    const isCritical = childHour.remainingHours < 1;
                    const isPending = childHour.remainingHours >= 1 && childHour.remainingHours < 2;
                    const daysUntilExpiry = childHour.packageExpiresAt ? moment(childHour.packageExpiresAt).diff(moment(), 'days') : null;
                    const packageStatus: 'active' | 'expiring_soon' | 'expired' | 'none' = (() => {
                      if (!childHour.packageExpiresAt) return childHour.totalHours > 0 ? 'active' : 'none';
                      if (daysUntilExpiry !== null && daysUntilExpiry < 0) return 'expired';
                      if (daysUntilExpiry !== null && daysUntilExpiry <= 7) return 'expiring_soon';
                      return 'active';
                    })();
                    const child = children.find(c => c.id === childHour.childId) || approvedChildren.find(c => c.id === childHour.childId);
                    const flags = getChildChecklistFlags(child);
                    const hasCompletedChecklist = flags.hasChecklist && flags.checklistCompleted;
                    const checklistState: 'missing' | 'submitted' | 'completed' | 'unknown' = (() => {
                      if (!child) return 'unknown';
                      if (!flags.hasChecklist) return 'missing';
                      if (flags.checklistCompleted) return 'completed';
                      return 'submitted';
                    })();
                    const canBuyHours = child !== undefined && child !== null && hasCompletedChecklist === true;
                    const hasPendingPayment = childHour.pendingHours > 0;
                    const draftBooking = childHour.draftBooking;
                    const childColor = getChildColor(childHour.childId);
                    const isNeedsHoursOnly = !hasPendingPayment && (childHour.totalHours === 0 || isCritical || isPending);
                    return (
                    <div
                      key={childHour.childId}
                      className={`rounded-lg border-l-4 px-3 py-3 relative tooltip-container transition-colors ${
                          hasPendingPayment
                            ? 'dark:bg-red-900/10 hover:bg-[#fad2cf] dark:hover:bg-red-900/20'
                            : isNeedsHoursOnly
                              ? 'bg-[#fef7e0] dark:bg-amber-900/20'
                              : 'dark:bg-gray-800/50 hover:bg-[#f1f3f4] dark:hover:bg-gray-700/50'
                        } ${tooltipChildId === childHour.childId ? 'z-[100]' : ''}`}
                      style={!isNeedsHoursOnly ? {
                        borderLeftColor: hasPendingPayment ? '#d93025' : childColor,
                        backgroundColor: hasPendingPayment ? '#fce8e6' : `${childColor}15`,
                      } : { borderLeftColor: '#ea8600' }}
                        role="article"
                        aria-label={`Hours for ${childHour.childName}`}
                      >
                        {isNeedsHoursOnly ? (
                          <>
                            <p className="text-sm font-semibold text-[#202124] dark:text-gray-100">
                              {childHour.childName} needs hours
                            </p>
                            <p className="text-xs text-[#5f6368] dark:text-gray-400 mt-0.5">
                              Purchase hours to start booking sessions
                            </p>
                            {onBuyHours && canBuyHours && (
                              <button
                                type="button"
                                onClick={() => onBuyHours(childHour.childId)}
                                className="mt-2 text-sm font-medium text-[#1a73e8] dark:text-blue-400 hover:underline"
                              >
                                Buy hours for {childHour.childName} →
                              </button>
                            )}
                            {(!canBuyHours) && (
                              <p className="mt-1 text-xs text-[#5f6368] dark:text-gray-400">
                                {checklistState === 'missing' ? 'Complete checklist first' : checklistState === 'submitted' ? 'Awaiting review' : 'Checklist required'}
                              </p>
                            )}
                          </>
                        ) : (
                        <>
                        <div className="flex items-center gap-2 flex-wrap min-h-0">
                          <span
                            className="text-sm font-medium text-[#202124] dark:text-gray-100 truncate"
                            title={childHour.childName}
                          >
                            {childHour.childName}
                          </span>
                          {!hasPendingPayment && childHour.totalHours === 0 && (
                            <span className="shrink-0 text-xs text-[#5f6368] dark:text-gray-400">needs hours</span>
                          )}
                          {!hasPendingPayment && childHour.totalHours > 0 && (isCritical || isPending) && (
                            <span className="shrink-0 text-xs text-[#5f6368] dark:text-gray-400">low hours</span>
                          )}
                          {hasPendingPayment && draftBooking && (() => {
                            const calculateOutstanding = () => {
                              if (draftBooking.outstandingAmount !== undefined && draftBooking.outstandingAmount > 0) {
                                return draftBooking.outstandingAmount;
                              }
                              if (draftBooking.status === 'draft' && draftBooking.package && draftBooking.totalHours) {
                                const packagePrice = draftBooking.package.price || 0;
                                const packageHours = draftBooking.package.hours || 0;
                                if (packageHours > 0) {
                                  const hourlyRate = packagePrice / packageHours;
                                  return Math.max(0, draftBooking.totalHours * hourlyRate);
                                }
                              }
                              const totalPrice = draftBooking.totalPrice || draftBooking.totalAmount || 0;
                              const paidAmount = draftBooking.paidAmount || 0;
                              const discountAmount = draftBooking.discountAmount || 0;
                              return Math.max(0, totalPrice - paidAmount - discountAmount);
                            };
                            const outstanding = calculateOutstanding();
                            const packageName = draftBooking.package?.name || childHour.packageName || 'Package';
                            return (
                              <>
                                <span className="text-[11px] text-[#5f6368] dark:text-gray-300 shrink-0">
                                  <span className="font-medium text-[#202124] dark:text-gray-100">{packageName}</span>
                                  <span className="text-[#dadce0] dark:text-gray-400"> · </span>
                                  <span className="tabular-nums">{childHour.pendingHours.toFixed(1)}h</span>
                                  <span className="text-[#dadce0] dark:text-gray-400"> · </span>
                                  <span className="font-medium text-[#d93025] dark:text-red-400 tabular-nums">{formatCurrency(outstanding)} due</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setModalChildId(childHour.childId)}
                                  className="text-[11px] text-[#1a73e8] dark:text-blue-400 hover:underline shrink-0"
                                >
                                  View details
                                </button>
                                {outstanding > 0 && (onCompletePayment ? (
                                  <Button
                                    type="button"
                                    onClick={() => onCompletePayment(draftBooking)}
                                    variant="primary"
                                    size="sm"
                                    className="shrink-0 !py-1 !px-2 text-[11px] font-semibold h-6"
                                    icon={<CreditCard size={10} />}
                                  >
                                    Pay {formatCurrency(outstanding)}
                                  </Button>
                                ) : (
                                  <Button
                                    href={`/bookings/${draftBooking.reference}/payment`}
                                    variant="primary"
                                    size="sm"
                                    className="shrink-0 !py-1 !px-2 text-[11px] font-semibold h-6"
                                    icon={<CreditCard size={10} />}
                                  >
                                    Pay {formatCurrency(outstanding)}
                                  </Button>
                                ))}
                              </>
                            );
                          })()}
                          {!hasPendingPayment && childHour.totalHours > 0 && (
                            <>
                              <span className="text-[11px] text-[#5f6368] dark:text-gray-400 shrink-0">
                                <span className="font-medium">{childHour.packageName || 'Package'}</span>
                                <span className="text-[#dadce0] dark:text-gray-500"> · </span>
                                {childHour.bookedHours > 0 && onOpenBookedSessions ? (
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onOpenBookedSessions(childHour.childId); }}
                                    className="text-[11px] font-medium tabular-nums text-[#1a73e8] dark:text-blue-400 hover:underline focus:outline-none rounded"
                                    aria-label={`View session details for ${childHour.childName}`}
                                  >
                                    {childHour.bookedHours.toFixed(1)}h booked
                                  </button>
                                ) : (
                                  <span className={isCritical ? 'text-[#d93025] dark:text-red-400' : 'text-[#5f6368] dark:text-gray-400'}>{childHour.bookedHours.toFixed(1)}h booked</span>
                                )}
                              </span>
                              <button
                                type="button"
                                onClick={() => setModalChildId(childHour.childId)}
                                className="text-[11px] text-[#1a73e8] dark:text-blue-400 hover:underline shrink-0"
                              >
                                View details
                              </button>
                            </>
                          )}
                          {(childHour.totalHours > 0 || hasPendingPayment) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTooltipChildId(tooltipChildId === childHour.childId ? null : childHour.childId);
                              }}
                              onMouseEnter={() => {
                                if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
                                setTooltipChildId(childHour.childId);
                              }}
                              onMouseLeave={() => {
                                tooltipTimeoutRef.current = setTimeout(() => setTooltipChildId(null), 200);
                              }}
                              className="p-0.5 hover:bg-[#e8eaed] dark:hover:bg-gray-600 rounded text-[#5f6368] hover:text-[#202124] dark:hover:text-gray-200 transition-colors shrink-0 ml-auto"
                              aria-label="View package details (tooltip)"
                            >
                              <Info size={11} />
                            </button>
                          )}
                        </div>

                        {/* Non–payment-due: single "Buy hours for [Child] →" CTA */}
                        {!hasPendingPayment && (isCritical || isPending || childHour.totalHours === 0) && (() => {
                          const hasActivePackage = childIdsWithActivePackage?.has(childHour.childId);
                          if (hasActivePackage) {
                            return (
                              <p className="mt-1 text-xs text-[#5f6368] dark:text-gray-400">
                                {childHour.packageExpiresAt
                                  ? `Buy again after ${moment(childHour.packageExpiresAt).format('DD MMM')}.`
                                  : 'Buy again after this package ends.'}
                              </p>
                            );
                          }
                          if ((isCritical || isPending || childHour.totalHours === 0) && onBuyHours && canBuyHours) {
                            return (
                              <button
                                type="button"
                                onClick={() => onBuyHours(childHour.childId)}
                                className="mt-1 text-sm font-medium text-[#1a73e8] dark:text-blue-400 hover:underline"
                              >
                                Buy hours for {childHour.childName} →
                              </button>
                            );
                          }
                          if ((isCritical || isPending || childHour.totalHours === 0) && !canBuyHours) {
                            return (
                              <span className="mt-1 block text-xs text-[#5f6368] dark:text-gray-400">
                                {checklistState === 'missing' ? 'Complete checklist first' : checklistState === 'submitted' ? 'Awaiting review' : 'Checklist required'}
                              </span>
                            );
                          }
                          return null;
                        })()}

                    {/* Tooltip – Google Calendar style */}
                    {tooltipChildId === childHour.childId && (childHour.totalHours > 0 || hasPendingPayment) && (
                      <div className="absolute z-[9999] w-72 bg-white dark:bg-gray-800 border border-[#dadce0] dark:border-gray-600 rounded-lg shadow-md p-3 bottom-full left-0 mb-2">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#e8eaed] dark:border-gray-700">
                          <Package size={14} className="text-[#1a73e8] dark:text-blue-400" />
                          <h4 className="text-xs font-semibold text-[#202124] dark:text-gray-100">
                            {hasPendingPayment && draftBooking
                              ? (draftBooking.package?.name || childHour.packageName || 'Package')
                              : (childHour.packageName || 'Package')} Package
                          </h4>
                          {hasPendingPayment && draftBooking ? (
                            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-[#fce8e6] dark:bg-red-900/40 text-[#d93025] dark:text-red-300 flex items-center gap-1 ml-auto">
                              <CreditCard size={8} />
                              Payment Pending
                            </span>
                          ) : packageStatus === 'expired' ? (
                            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-[#fce8e6] dark:bg-red-900/40 text-[#d93025] dark:text-red-300 flex items-center gap-1 ml-auto">
                              <XCircle size={8} />
                              Expired
                            </span>
                          ) : packageStatus === 'expiring_soon' ? (
                            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-[#fef7e0] dark:bg-amber-900/40 text-[#ea8600] dark:text-amber-300 flex items-center gap-1 ml-auto">
                              <AlertCircle size={8} />
                              Expiring Soon
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-[#e6f4ea] dark:bg-green-900/40 text-[#1e8e3e] dark:text-green-300 flex items-center gap-1 ml-auto">
                              <CheckCircle size={8} />
                              Active
                            </span>
                          )}
                        </div>
                        <div className="space-y-1.5 text-xs text-[#5f6368] dark:text-gray-400">
                          {hasPendingPayment && draftBooking ? (() => {
                            // Calculate outstanding amount
                            const calculateOutstanding = () => {
                              if (draftBooking.outstandingAmount !== undefined && draftBooking.outstandingAmount > 0) {
                                return draftBooking.outstandingAmount;
                              }
                              if (draftBooking.status === 'draft' && draftBooking.package && draftBooking.totalHours) {
                                const packagePrice = draftBooking.package.price || 0;
                                const packageHours = draftBooking.package.hours || 0;
                                if (packageHours > 0) {
                                  const hourlyRate = packagePrice / packageHours;
                                  const pendingHoursAmount = draftBooking.totalHours * hourlyRate;
                                  return Math.max(0, pendingHoursAmount);
                                }
                              }
                              const totalPrice = draftBooking.totalPrice || draftBooking.totalAmount || 0;
                              const paidAmount = draftBooking.paidAmount || 0;
                              const discountAmount = draftBooking.discountAmount || 0;
                              return Math.max(0, totalPrice - paidAmount - discountAmount);
                            };
                            const outstanding = calculateOutstanding();
                            return (
                              <>
                                <div className="flex items-center justify-between">
                                  <span>Total Hours:</span>
                                  <span className="font-medium text-[#202124] dark:text-gray-100">{(draftBooking.totalHours || 0).toFixed(1)}h</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>Unpaid:</span>
                                  <span className="font-medium text-[#d93025] dark:text-red-300">{(draftBooking.totalHours || 0).toFixed(1)}h</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>Amount Due:</span>
                                  <span className="font-medium text-[#d93025] dark:text-red-400">{formatCurrency(outstanding)}</span>
                                </div>
                                {draftBooking.packageExpiresAt && (
                                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-[#e8eaed] dark:border-gray-700">
                                    <Clock size={10} className="text-[#5f6368] dark:text-gray-400" />
                                    <span>{formatExpiryLabel(draftBooking.packageExpiresAt)}</span>
                                  </div>
                                )}
                              </>
                            );
                          })() : (
                            <>
                              <div className="flex items-center justify-between">
                                <span>Total Hours:</span>
                                <span className="font-medium text-[#202124] dark:text-gray-100">{childHour.totalHours.toFixed(1)}h</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Booked:</span>
                                <span className="font-medium text-[#202124] dark:text-gray-100">{childHour.bookedHours.toFixed(1)}h ({childHour.totalHours > 0 ? Math.round((childHour.bookedHours / childHour.totalHours) * 100) : 0}%)</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Remaining:</span>
                                <span className="font-medium text-[#1e8e3e] dark:text-green-400">{childHour.remainingHours.toFixed(1)}h</span>
                              </div>
                              {childHour.packageExpiresAt && (
                                <div className="flex items-center gap-1.5 pt-1.5 border-t border-[#e8eaed] dark:border-gray-700">
                                  <Clock size={10} className="text-[#5f6368] dark:text-gray-400" />
                                  <span>{formatExpiryLabel(childHour.packageExpiresAt)}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                        </>
                        )}
                      </div>
                    );
                  })}
            </div>
            )}
          </div>
        );
      })()}
      {/* Awaiting Review – Google Calendar style */}
      {awaitingChecklistReview.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#dadce0] dark:border-gray-600 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e8eaed] dark:border-gray-700 flex items-center justify-between gap-2">
            <h3 className="text-[11px] font-medium uppercase tracking-wide text-[#5f6368] dark:text-gray-400 flex items-center gap-2">
              <Hourglass size={14} className="text-[#1a73e8] dark:text-blue-400" />
              Awaiting Review
              {awaitingChecklistReview.length > 1 && (
                <span className="text-[11px] font-normal text-[#5f6368] dark:text-gray-400">
                  ({awaitingChecklistReview.length})
                </span>
              )}
            </h3>
          </div>
          <div className="px-4 py-2 space-y-1.5">
            {awaitingChecklistReview.map(item => (
              <div
                key={`awaiting-review-${item.childId}`}
                className="py-2 px-3 rounded-r-md border-l-4 border-l-[#1a73e8] dark:border-l-blue-500 bg-[#e8f0fe] dark:bg-blue-900/20 hover:bg-[#d2e3fc] dark:hover:bg-blue-900/30 transition-colors"
              >
                <p className="text-xs text-[#202124] dark:text-blue-200">
                  {item.childName}&rsquo;s checklist has been submitted and is awaiting review.
                </p>
                <p className="mt-0.5 text-xs text-[#5f6368] dark:text-blue-200/80">
                  No action needed — we&rsquo;ll notify you once it&rsquo;s approved.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Package Details Modal */}
      {modalChildId && (() => {
        const childHour = hoursSummary.childHours.find(ch => ch.childId === modalChildId);
        if (!childHour) return null;
        
        const child = children.find(c => c.id === childHour.childId) 
          || approvedChildren.find(c => c.id === childHour.childId);
        if (!child) return null;

        const hasPendingPayment = childHour.pendingHours > 0;
        const draftBooking = childHour.draftBooking;
        
        // Get active booking for this child
        const confirmedPaidBookings = bookings.filter(
          b => b.status === 'confirmed' && b.paymentStatus === 'paid'
        );
        const activeBooking = confirmedPaidBookings.find(b => {
          if (!b.participants) return false;
          return b.participants.some(p => p.childId === childHour.childId);
        });

        const booking = hasPendingPayment ? draftBooking : (activeBooking || null);
        if (!booking) return null;

        const packageName = booking.package?.name || childHour.packageName || 'Package';
        const packageStatus = hasPendingPayment
          ? 'payment_pending' as const
          : (childHour.packageExpiresAt
            ? (moment(childHour.packageExpiresAt).diff(moment(), 'days') < 0
              ? 'expired' as const
              : moment(childHour.packageExpiresAt).diff(moment(), 'days') <= 7
                ? 'expiring_soon' as const
                : 'active' as const)
            : 'active' as const);
        
        const totalHours = hasPendingPayment && draftBooking
          ? (draftBooking.totalHours || 0)
          : childHour.totalHours;
        
        const bookedHours = childHour.bookedHours;
        const remainingHours = childHour.remainingHours;
        const packageExpiresAt = hasPendingPayment && draftBooking
          ? draftBooking.packageExpiresAt
          : childHour.packageExpiresAt;
        
        const outstanding = hasPendingPayment && draftBooking
          ? (draftBooking.outstandingAmount ?? 
            ((draftBooking.totalPrice || 0) - (draftBooking.paidAmount || 0) - (draftBooking.discountAmount || 0)))
          : undefined;
        
        const pendingHours = hasPendingPayment && draftBooking ? (draftBooking.totalHours || 0) : undefined;

        const hourlyRate = totalHours > 0 && booking?.package?.price ? booking.package.price / totalHours : null;

        return (
          <BaseModal
            key={childHour.childId}
            isOpen={true}
            onClose={() => setModalChildId(null)}
            title={
              <span className="flex items-center gap-2">
                <Package size={20} className="text-[#1a73e8] dark:text-blue-400" />
                {packageName} Package
                <span className="text-sm text-[#5f6368] dark:text-gray-400">– {childHour.childName}</span>
              </span>
            }
            size="md"
            footer={
              <div className="flex items-center justify-end gap-2 w-full">
                {packageStatus === 'payment_pending' && outstanding !== undefined && outstanding > 0 && onCompletePayment && booking && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onCompletePayment(booking);
                      setModalChildId(null);
                    }}
                    icon={<CreditCard size={14} />}
                  >
                    Complete Payment
                  </Button>
                )}
                {packageStatus === 'payment_pending' && booking && onCancelDraftBooking && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onCancelDraftBooking(String(booking.id));
                      setModalChildId(null);
                    }}
                    className="text-[#d93025] dark:text-red-400 border-[#fce8e6] dark:border-red-900/50 hover:bg-[#fce8e6] dark:hover:bg-red-900/20"
                  >
                    Cancel package
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalChildId(null)}
                >
                  Close
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#5f6368] dark:text-gray-400">Status:</span>
                  {packageStatus === 'expired' ? (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-[#fce8e6] dark:bg-red-900/40 text-[#d93025] dark:text-red-300 flex items-center gap-1">
                      <XCircle size={12} />
                      Expired
                    </span>
                  ) : packageStatus === 'expiring_soon' ? (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-[#fef7e0] dark:bg-amber-900/40 text-[#ea8600] dark:text-amber-300 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Expiring Soon
                    </span>
                  ) : packageStatus === 'payment_pending' ? (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-[#fce8e6] dark:bg-red-900/40 text-[#d93025] dark:text-red-300 flex items-center gap-1">
                      <CreditCard size={12} />
                      Payment Pending
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-[#e6f4ea] dark:bg-green-900/40 text-[#1e8e3e] dark:text-green-300 flex items-center gap-1">
                      <CheckCircle size={12} />
                      Active
                    </span>
                  )}
                </div>

                {booking?.reference && (
                  <div className="text-sm">
                    <span className="font-medium text-[#5f6368] dark:text-gray-400">Booking Reference:</span>
                    <span className="ml-2 text-[#202124] dark:text-gray-100 font-mono">{booking.reference}</span>
                  </div>
                )}

                {booking?.createdAt && (
                  <div className="text-sm">
                    <span className="font-medium text-[#5f6368] dark:text-gray-400">Package Purchased:</span>
                    <span className="ml-2 text-[#202124] dark:text-gray-100">{moment(booking.createdAt).format('DD MMM YYYY')}</span>
                  </div>
                )}

                <div className="p-3 bg-[#f8f9fa] dark:bg-gray-700 rounded-lg space-y-2">
                  <h3 className="text-sm font-medium text-[#202124] dark:text-gray-100">Hours Breakdown</h3>
                  {packageStatus === 'payment_pending' && outstanding !== undefined && outstanding > 0 ? (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#5f6368] dark:text-gray-400">Total Hours:</span>
                        <span className="font-medium text-[#202124] dark:text-gray-100">{pendingHours?.toFixed(1) || totalHours.toFixed(1)}h</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#5f6368] dark:text-gray-400">Unpaid:</span>
                        <span className="font-medium text-[#d93025] dark:text-red-400">{pendingHours?.toFixed(1) || totalHours.toFixed(1)}h</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#5f6368] dark:text-gray-400">Total Hours:</span>
                        <span className="font-medium text-[#202124] dark:text-gray-100">{totalHours.toFixed(1)}h</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#5f6368] dark:text-gray-400">Booked:</span>
                        <span className="font-medium text-[#202124] dark:text-gray-100">{bookedHours.toFixed(1)}h ({totalHours > 0 ? Math.round((bookedHours / totalHours) * 100) : 0}%)</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#5f6368] dark:text-gray-400">Remaining:</span>
                        <span className="font-medium text-[#1e8e3e] dark:text-green-400">{remainingHours.toFixed(1)}h</span>
                      </div>
                    </>
                  )}
                </div>

                {packageStatus === 'payment_pending' && outstanding !== undefined && outstanding > 0 ? (
                  <div className="p-3 bg-[#fef7e0] dark:bg-amber-900/20 border border-[#fde9b0] dark:border-amber-700 rounded-lg space-y-2">
                    <h3 className="text-sm font-medium text-[#202124] dark:text-gray-100">Payment Information</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#5f6368] dark:text-gray-400">Amount Due:</span>
                      <span className="font-medium text-[#d93025] dark:text-red-300">{formatCurrency(outstanding)}</span>
                    </div>
                    {hourlyRate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#5f6368] dark:text-gray-400">Per Hour Rate:</span>
                        <span className="font-medium text-[#202124] dark:text-gray-100">{formatCurrency(hourlyRate)}</span>
                      </div>
                    )}
                  </div>
                ) : booking?.package?.price && (
                  <div className="p-3 bg-[#f8f9fa] dark:bg-gray-700 rounded-lg space-y-2">
                    <h3 className="text-sm font-medium text-[#202124] dark:text-gray-100">Payment Information</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#5f6368] dark:text-gray-400">Package Price:</span>
                      <span className="font-medium text-[#202124] dark:text-gray-100">{formatCurrency(booking.package.price)}</span>
                    </div>
                    {hourlyRate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#5f6368] dark:text-gray-400">Per Hour Rate:</span>
                        <span className="font-medium text-[#202124] dark:text-gray-100">{formatCurrency(hourlyRate)}</span>
                      </div>
                    )}
                  </div>
                )}

                {packageExpiresAt && (
                  <div className="p-3 bg-[#f8f9fa] dark:bg-gray-700 rounded-lg space-y-2">
                    <h3 className="text-sm font-medium text-[#202124] dark:text-gray-100 flex items-center gap-2">
                      <Clock size={14} className="text-[#5f6368] dark:text-gray-400" />
                      Timeline
                    </h3>
                    <div className="text-sm">
                      <span className="text-[#5f6368] dark:text-gray-300">Package Expires:</span>
                      <span className="ml-2 font-medium text-[#202124] dark:text-white">{formatExpiryLabel(packageExpiresAt)}</span>
                    </div>
                  </div>
                )}
              </div>
          </BaseModal>
        );
      })()}

      {/* Remove child confirmation modal */}
      {removeConfirmChildId && onRemoveChild && (() => {
        const child = children.find(c => c.id === removeConfirmChildId) || approvedChildren.find(c => c.id === removeConfirmChildId);
        if (!child) return null;
        const handleConfirm = async () => {
          setIsRemoving(true);
          try {
            await onRemoveChild(child.id);
            setRemoveConfirmChildId(null);
          } finally {
            setIsRemoving(false);
          }
        };
        return (
          <BaseModal
            isOpen={true}
            onClose={() => !isRemoving && setRemoveConfirmChildId(null)}
            title={`Remove ${child.name}?`}
            size="md"
            footer={
              <div className="flex justify-end gap-2 w-full">
                <Button variant="outline" size="sm" onClick={() => setRemoveConfirmChildId(null)} disabled={isRemoving}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleConfirm} disabled={isRemoving} icon={<Trash2 size={14} />}>
                  {isRemoving ? 'Removing…' : 'Yes, Remove'}
                </Button>
              </div>
            }
          >
            <p className="text-sm text-[#5f6368] dark:text-gray-400">
              This child profile and incomplete checklist will be permanently deleted. This action cannot be undone.
            </p>
          </BaseModal>
        );
      })()}
    </div>
  );
}
