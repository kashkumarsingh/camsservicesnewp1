'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Breadcrumbs, EmptyState } from '@/components/dashboard/universal';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { useMyBookings } from '@/interfaces/web/hooks/booking/useMyBookings';
import { useLiveRefresh } from '@/core/liveRefresh/LiveRefreshContext';
import { LIVE_REFRESH_ENABLED } from '@/utils/liveRefreshConstants';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';
import { UserPlus, CheckCircle, Clock, XCircle, Trash2, Calendar, Package, TrendingUp, ClipboardCheck, PlusCircle } from 'lucide-react';
import AddChildModal from '@/components/dashboard/modals/AddChildModal';
import CompleteChecklistModal, { type ChecklistFormData } from '@/components/dashboard/modals/CompleteChecklistModal';
import TopUpModal from '@/components/dashboard/modals/TopUpModal';
import { toastManager } from '@/utils/toast';
import ToastContainer from '@/components/ui/Toast/ToastContainer';
import type { Toast } from '@/utils/toast';
import { childrenRepository } from '@/infrastructure/http/children/ChildrenRepository';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import moment from 'moment';
import type { BookingDTO } from '@/core/application/booking/dto/BookingDTO';

/** Active (confirmed + paid) booking for a child; one per child, most recent. */
function getActiveBookingForChild(bookings: BookingDTO[], childId: number): BookingDTO | null {
  const confirmedPaid = bookings.filter(
    (b) => b.status === 'confirmed' && b.paymentStatus === 'paid'
  );
  const childBookings = confirmedPaid.filter((b) => {
    if (!b.participants) return false;
    return b.participants.some((p) => p.childId === childId);
  });
  if (childBookings.length === 0) return null;
  const sorted = [...childBookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return sorted[0];
}

export default function ParentChildrenPageClient() {
  const router = useRouter();
  const { user, children, loading, refresh, isAuthenticated } = useAuth();
  const { bookings } = useMyBookings();
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [checklistChildId, setChecklistChildId] = useState<number | undefined>();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpBooking, setTopUpBooking] = useState<BookingDTO | null>(null);
  const [topUpChildName, setTopUpChildName] = useState('');
  const [isTopUpSubmitting, setIsTopUpSubmitting] = useState(false);

  /** Per-child package summary for approved children (active confirmed+paid booking, hours). */
  const childPackageSummary = useMemo(() => {
    const map = new Map<
      number,
      { packageName: string; remainingHours: number; totalHours: number }
    >();
    children.forEach((child) => {
      if (child.approval_status !== 'approved') return;
      const active = getActiveBookingForChild(bookings, child.id);
      if (!active) return;
      const totalHours = active.totalHours ?? 0;
      const bookedHours = active.bookedHours ?? 0;
      const remainingHours = Math.max(0, totalHours - bookedHours);
      map.set(child.id, {
        packageName: active.package?.name ?? 'Package',
        remainingHours,
        totalHours,
      });
    });
    return map;
  }, [children, bookings]);

  // Toast subscription
  React.useEffect(() => {
    const unsubscribe = toastManager.subscribe((toast) => {
      setToasts((prev) => [...prev, toast]);
    });
    return unsubscribe;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent('/dashboard/parent/children')}`);
    }
  }, [loading, isAuthenticated, router]);

  // Redirect trainers to their dashboard
  React.useEffect(() => {
    if (!loading && user && user.role === 'trainer') {
      router.push('/dashboard/trainer');
    }
  }, [loading, user, router]);

  const handleAddChildSuccess = useCallback(async () => {
    await refresh();
    toastManager.success('Child added successfully! Please complete their checklist below.');
  }, [refresh]);

  const handleCompleteChecklist = useCallback((childId: number) => {
    setChecklistChildId(childId);
    setShowChecklistModal(true);
  }, []);

  const handleChecklistSubmit = useCallback(
    async (formData: ChecklistFormData) => {
      if (!checklistChildId) return;
      try {
        await apiClient.post(
          API_ENDPOINTS.CHILD_CHECKLIST(checklistChildId),
          formData
        );
        toastManager.success('Checklist submitted successfully! It will be reviewed shortly.');
        await refresh();
        setShowChecklistModal(false);
        setChecklistChildId(undefined);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to submit checklist. Please try again.';
        toastManager.error(message);
        throw err;
      }
    },
    [checklistChildId, refresh]
  );

  // Centralised live refresh: refetch when backend reports changes to children
  useLiveRefresh('children', useCallback(() => Promise.resolve(refresh()), [refresh]), {
    enabled: LIVE_REFRESH_ENABLED,
  });

  const handleRemoveChild = useCallback(
    async (childId: number, childName: string) => {
      if (!confirm(`Are you sure you want to remove ${childName}? This action cannot be undone.`)) {
        return;
      }

      try {
        await childrenRepository.delete(childId);
        await refresh();
        toastManager.success(`${childName} has been removed.`);
      } catch (err: unknown) {
        const error = err as {
          message?: string;
          response?: { data?: { message?: string } };
        };
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Unable to remove this child. Children with purchased hours or booking history must be archived instead.';
        toastManager.error(message);
      }
    },
    [refresh],
  );

  const handleOpenTopUp = useCallback(
    (child: (typeof children)[0]) => {
      const activeBooking = getActiveBookingForChild(bookings, child.id);
      if (!activeBooking) return;
      setTopUpChildName(child.name);
      setTopUpBooking(activeBooking);
      setShowTopUpModal(true);
    },
    [bookings],
  );

  const handleTopUpProceedToPayment = useCallback(
    async (hours: number, _totalPrice: number) => {
      if (!topUpBooking) return;
      setIsTopUpSubmitting(true);
      try {
        const bookingId = topUpBooking.id;
        const response = await apiClient.post<{
          checkout_url?: string | null;
          payment_intent_id?: string | null;
          payment_id?: string | null;
          amount?: number;
          hours?: number;
        }>(
          API_ENDPOINTS.BOOKING_TOP_UP(
            typeof bookingId === 'string' ? bookingId : Number(bookingId),
          ),
          { hours },
        );
        const checkoutUrl = response.data?.checkout_url;
        if (checkoutUrl) {
          setShowTopUpModal(false);
          setTopUpBooking(null);
          setTopUpChildName('');
          window.location.href = checkoutUrl;
          return;
        }
        toastManager.error('Unable to start top-up payment. Please try again.');
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        const message =
          err?.response?.data?.message ??
          err?.message ??
          'Failed to start top-up payment. Please try again.';
        toastManager.error(message);
      } finally {
        setIsTopUpSubmitting(false);
      }
    },
    [topUpBooking],
  );

  // Show loading skeleton
  if (loading || !user) {
    return <DashboardSkeleton variant="parent-children" />;
  }

  // Get status badge for a child
  const getStatusBadge = (child: typeof children[0]) => {
    if (child.approval_status === 'approved') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle size={12} />
          Approved
        </span>
      );
    }

    if (child.approval_status === 'pending') {
      // Check checklist status
      if (child.has_checklist !== true) {
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            <Clock size={12} />
            Checklist needed
          </span>
        );
      }

      if (child.checklist_completed !== true) {
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <Clock size={12} />
            Awaiting review
          </span>
        );
      }

      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <Clock size={12} />
          Pending approval
        </span>
      );
    }

    if (child.approval_status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <XCircle size={12} />
          Rejected
        </span>
      );
    }

    return null;
  };

  // Get actions for a child
  const getChildActions = (child: typeof children[0]) => {
    const actions = [];

    // Complete or update checklist (when pending and checklist not yet approved)
    const needsChecklist = child.approval_status === 'pending' && child.has_checklist !== true;
    const canUpdateChecklist = child.approval_status === 'pending' && child.has_checklist === true && child.checklist_completed !== true;
    if (needsChecklist || canUpdateChecklist) {
      actions.push(
        <Button
          key="checklist"
          size="sm"
          variant="primary"
          icon={<ClipboardCheck size={14} />}
          onClick={() => handleCompleteChecklist(child.id)}
        >
          {needsChecklist ? 'Complete checklist' : 'Update checklist'}
        </Button>
      );
    }

    // View progress (always available)
    actions.push(
      <Button
        key="progress"
        size="sm"
        variant="bordered"
        icon={<TrendingUp size={14} />}
        onClick={() => router.push('/dashboard/parent/progress')}
      >
        Progress
      </Button>
    );

    // Buy package / Top up (only if approved): "Top up" opens modal when 0h left; else "Buy package" goes to dashboard
    if (child.approval_status === 'approved') {
      const summary = childPackageSummary.get(child.id);
      const hasActivePackage = summary !== undefined;
      const needsTopUp = hasActivePackage && summary.remainingHours <= 0;
      actions.push(
        <Button
          key="buy"
          size="sm"
          variant="bordered"
          icon={needsTopUp ? <PlusCircle size={14} /> : <Package size={14} />}
          onClick={() =>
            needsTopUp ? handleOpenTopUp(child) : router.push(`/dashboard/parent?childId=${child.id}`)
          }
        >
          {needsTopUp ? 'Top up' : 'Buy package'}
        </Button>
      );
    }

    // Book session (only if approved)
    if (child.approval_status === 'approved') {
      actions.push(
        <Button
          key="book"
          size="sm"
          variant="primary"
          icon={<Calendar size={14} />}
          onClick={() => router.push(`/dashboard/parent?bookChildId=${child.id}`)}
        >
          Book session
        </Button>
      );
    }

    // Remove child (always available)
    actions.push(
      <button
        key="remove"
        type="button"
        onClick={() => handleRemoveChild(child.id, child.name)}
        className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
        aria-label="Remove child"
        title="Remove child"
      >
        <Trash2 size={14} />
      </button>
    );

    return actions;
  };

  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <Breadcrumbs
          items={[
            { label: 'Parent', href: '/dashboard/parent' },
            { label: 'My children' },
          ]}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              My children
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Review and manage all children linked to this parent account.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            icon={<UserPlus size={14} />}
            onClick={() => setShowAddChildModal(true)}
            className="w-full sm:w-auto"
          >
            Add child
          </Button>
        </div>
      </header>

      {children.length === 0 ? (
        <EmptyState
          title={EMPTY_STATE.NO_CHILDREN_LINKED_YET.title}
          message={EMPTY_STATE.NO_CHILDREN_LINKED_YET.message}
          action={
            <Button
              size="sm"
              variant="primary"
              icon={<UserPlus size={14} />}
              onClick={() => setShowAddChildModal(true)}
            >
              Add child
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <div
              key={child.id}
              className="group relative flex min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800 sm:p-5"
            >
              {/* Child info */}
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="min-w-0 break-words text-base font-semibold text-slate-900 dark:text-slate-50">
                    {child.name}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
                    {child.age && <span>Age {child.age}</span>}
                    {child.date_of_birth && (
                      <span className="text-xs">
                        (DOB: {moment(child.date_of_birth).format('DD/MM/YYYY')})
                      </span>
                    )}
                  </div>
                </div>
                <span className="shrink-0">{getStatusBadge(child)}</span>
              </div>

              {/* Package status (approved children only) – so parents see if child has active package and hours */}
              {child.approval_status === 'approved' && (
                <div className="mb-4 rounded-md bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-xs">
                  {(() => {
                    const summary = childPackageSummary.get(child.id);
                    if (!summary) {
                      return (
                        <span className="text-slate-600 dark:text-slate-400">
                          No active package. Buy a package to book sessions.
                        </span>
                      );
                    }
                    if (summary.remainingHours <= 0) {
                      return (
                        <span className="text-slate-600 dark:text-slate-400">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {summary.packageName}
                          </span>
                          {' · '}
                          <span>0h left</span>
                          {' – '}
                          <span className="font-medium">Top up to add more hours</span>
                        </span>
                      );
                    }
                    return (
                      <span className="text-slate-600 dark:text-slate-400">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {summary.packageName}
                        </span>
                        {' · '}
                        <span className="text-green-700 dark:text-green-400 font-medium tabular-nums">
                          {summary.remainingHours.toFixed(1)}h left
                        </span>
                        {summary.totalHours > 0 && (
                          <span className="text-slate-500 dark:text-slate-500">
                            {' '}
                            (of {summary.totalHours.toFixed(1)}h)
                          </span>
                        )}
                      </span>
                    );
                  })()}
                </div>
              )}

              {/* Special educational needs */}
              {child.special_educational_needs && (
                <div className="mb-4 rounded-md bg-blue-50 p-3 text-xs text-slate-700 dark:bg-blue-900/30 dark:text-slate-300">
                  <span className="font-medium">SEN:</span> {child.special_educational_needs}
                </div>
              )}

              {/* Rejection reason */}
              {child.approval_status === 'rejected' && child.rejection_reason && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  <span className="font-medium">Reason:</span> {child.rejection_reason}
                </div>
              )}

              {/* Checklist status + CTA */}
              {child.approval_status === 'pending' && (
                <div className="mb-4 flex flex-col gap-2">
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {child.has_checklist !== true ? (
                      <span>Complete the checklist so we can approve this child and you can book sessions.</span>
                    ) : child.checklist_completed !== true ? (
                      <span>Checklist submitted and awaiting review. You can update it below if needed.</span>
                    ) : (
                      <span>Checklist approved. Final account approval is pending.</span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-auto flex min-w-0 flex-wrap items-center gap-2">
                {getChildActions(child)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Child Modal */}
      <AddChildModal
        isOpen={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
        onSuccess={handleAddChildSuccess}
      />

      {/* Complete Checklist Modal */}
      <CompleteChecklistModal
        isOpen={showChecklistModal}
        onClose={() => {
          setShowChecklistModal(false);
          setChecklistChildId(undefined);
        }}
        child={checklistChildId ? children.find((c) => c.id === checklistChildId) ?? null : null}
        onSubmit={handleChecklistSubmit}
      />

      {/* Top-up Modal (add hours to existing package) */}
      {topUpBooking && (
        <TopUpModal
          isOpen={showTopUpModal}
          onClose={() => {
            setShowTopUpModal(false);
            setTopUpBooking(null);
            setTopUpChildName('');
          }}
          childName={topUpChildName || 'your child'}
          booking={topUpBooking}
          onProceedToPayment={handleTopUpProceedToPayment}
          isSubmitting={isTopUpSubmitting}
        />
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </section>
  );
}
