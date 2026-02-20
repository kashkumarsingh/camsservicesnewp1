"use client";

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import moment from 'moment';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { AlertCircle, CheckCircle, XCircle, ClipboardCheck, Calendar, User, Users, Package, Clock, TrendingUp, ArrowRight, X, LogOut, CreditCard, Settings, BookOpen, CalendarPlus, UserPlus, RefreshCw, FileText, ShieldAlert, Keyboard, Plus, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import ChildrenActivitiesCalendar from '@/components/dashboard/ChildrenActivitiesCalendar';
import BookedSessionsModal from '@/components/dashboard/modals/BookedSessionsModal';
import ParentBookingModal, { type ParentBookingFormData } from '@/components/dashboard/modals/ParentBookingModal';
import SessionDetailModal from '@/components/dashboard/modals/SessionDetailModal';
import BuyHoursModal from '@/components/dashboard/modals/BuyHoursModal';
import CompleteChecklistModal, { type ChecklistFormData } from '@/components/dashboard/modals/CompleteChecklistModal';
import CompletePaymentModal from '@/components/dashboard/modals/CompletePaymentModal';
import TopUpModal from '@/components/dashboard/modals/TopUpModal';
import ParentSettingsModal from '@/components/dashboard/modals/ParentSettingsModal';
import AddChildModal from '@/components/dashboard/modals/AddChildModal';
import SafeguardingConcernModal, { type SafeguardingConcernFormData } from '@/components/dashboard/modals/SafeguardingConcernModal';
import SessionNotesModal from '@/components/dashboard/modals/SessionNotesModal';
import ToastContainer from '@/components/ui/Toast/ToastContainer';
import { toastManager, type Toast } from '@/utils/toast';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { useMyBookings } from '@/interfaces/web/hooks/booking/useMyBookings';
import { useCancelBooking } from '@/interfaces/web/hooks/booking/useCancelBooking';
import { useActivities } from '@/interfaces/web/hooks/activities/useActivities'; // ✅ Import for activities
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { ApiPaymentService } from '@/infrastructure/services/payment/ApiPaymentService';
import { childrenRepository } from '@/infrastructure/http/children/ChildrenRepository';
import type { BookingDTO } from '@/core/application/booking/dto/BookingDTO';
import { useSmartResponsive } from '@/interfaces/web/hooks/responsive/useSmartResponsive';
import { useDashboardStats } from '@/interfaces/web/hooks/dashboard/useDashboardStats';
import { useParentSessionNotes } from '@/interfaces/web/hooks/dashboard/useParentSessionNotes';
import { useSubmitSafeguardingConcern } from '@/interfaces/web/hooks/dashboard/useSubmitSafeguardingConcern';
import { getDateBookingStatus } from '@/utils/bookingCutoffRules';
import { getChildChecklistFlags, childNeedsChecklistCta, childNeedsChecklistToComplete, childAwaitingChecklistReview } from '@/core/application/auth/types';
import { USER_ROLE, APPROVAL_STATUS, BOOKING_STATUS, PAYMENT_STATUS } from '@/utils/dashboardConstants';
import { ROUTES } from '@/utils/routes';
import { getMessageForDateReason } from '@/utils/bookingValidationMessages';
import { useLiveRefresh } from '@/core/liveRefresh/LiveRefreshContext';
import { LIVE_REFRESH_ENABLED } from '@/utils/liveRefreshConstants';
import { ChildrenFilter } from '@/components/dashboard/ChildrenFilter';
import { getMonday, getMonthKey } from '@/utils/calendarRangeUtils';
import type { CalendarPeriod } from '@/utils/calendarRangeUtils';
import { CalendarRangeToolbar } from '@/components/ui/CalendarRange';

export default function ParentDashboardPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, children, approvedChildren, loading, isAuthenticated, isApproved, hasApprovedChildren, canBook, logout, refresh } = useAuth();
  const { bookings, loading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useMyBookings();
  const { cancelBooking, loading: cancelBookingLoading, error: cancelBookingError, resetError: resetCancelError } = useCancelBooking();
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { sessionNotesItems, loading: sessionNotesLoading, error: sessionNotesError, refetch: refetchSessionNotes } = useParentSessionNotes();
  const { submitSafeguardingConcern } = useSubmitSafeguardingConcern();

  // Log API errors for debugging
  useEffect(() => {
    if (bookingsError) {
      console.error('[Dashboard] Bookings API Error:', bookingsError);
      toastManager.error(`Failed to load bookings: ${bookingsError}`);
    }
    if (statsError) {
      console.error('[Dashboard] Stats API Error:', statsError);
      toastManager.error(`Failed to load dashboard stats: ${statsError}`);
    }
  }, [bookingsError, statsError]);
  useEffect(() => {
    if (sessionNotesError) {
      console.error('[Dashboard] Session notes API Error:', sessionNotesError);
    }
  }, [sessionNotesError]);
  const { activities: allActivities } = useActivities(); // ✅ Fetch all activities for duration calculation
  const [showChildAddedSuccess, setShowChildAddedSuccess] = useState(false);
  const [showAllPendingChildren, setShowAllPendingChildren] = useState(false);
  const [showAllApprovedChildren, setShowAllApprovedChildren] = useState(false);
  // Track if this is the initial load (to prevent showing skeleton on tab switches)
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  // Gate: only show dashboard content after the first full load has completed (avoids showing partial/stale data then it "jumping" to real data)
  const [hasInitialLoadCompleted, setHasInitialLoadCompleted] = useState(false);

  // Ref to show purchase success toast only once (avoids duplicate toasts from Strict Mode or double run)
  const hasShownPurchaseToastRef = React.useRef(false);
  // Ref to confirm payment from session only once (return from Stripe Checkout)
  const hasConfirmedPaymentFromSessionRef = React.useRef(false);
  const purchaseSuccessTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // After returning from Stripe Checkout: confirm payment with backend when session_id is present, then toast + refetch
  useEffect(() => {
    const purchaseStatus = searchParams.get('purchase');
    const sessionId = searchParams.get('session_id');

    if (purchaseStatus === 'success') {
      const run = async () => {
        // If we have session_id, backend was never told to confirm—confirm now so booking becomes confirmed/paid
        if (sessionId && !hasConfirmedPaymentFromSessionRef.current) {
          hasConfirmedPaymentFromSessionRef.current = true;
          try {
            const endpoint = API_ENDPOINTS.GET_PAYMENT_INTENT_FROM_SESSION;
            const intentResponse = await apiClient.post<{ payment_intent_id: string }>(endpoint, {
              session_id: sessionId,
            });
            const paymentIntentId = intentResponse.data?.payment_intent_id;
            if (paymentIntentId) {
              const confirmResult = await ApiPaymentService.confirmPayment(paymentIntentId);
              if (!confirmResult.success) {
                console.error('[Dashboard] Payment confirm failed:', confirmResult.error);
                toastManager.error(confirmResult.error ?? 'Payment could not be confirmed. Your payment was received; the booking may update shortly.');
              }
            }
          } catch (err) {
            console.error('[Dashboard] Failed to confirm payment from session:', err);
            toastManager.error('Payment was received but we could not confirm it. Your booking may update shortly—check back in a moment.');
          }
        }

        if (!hasShownPurchaseToastRef.current) {
          hasShownPurchaseToastRef.current = true;
          toastManager.success(
            'Payment received. Your hours will update in a moment—you can now book sessions from your dashboard.',
          );
        }
        refetchBookings(true);
        refresh();
        purchaseSuccessTimeoutRef.current = setTimeout(() => refetchBookings(true), 2000);
        router.replace('/dashboard/parent', { scroll: false });
      };
      run();
      return () => {
        if (purchaseSuccessTimeoutRef.current) {
          clearTimeout(purchaseSuccessTimeoutRef.current);
          purchaseSuccessTimeoutRef.current = null;
        }
      };
    }

    if (purchaseStatus === 'canceled') {
      toastManager.info(
        'Payment was cancelled. Your package will only be confirmed once payment is completed.',
      );
      router.replace('/dashboard/parent', { scroll: false });
    }
  }, [searchParams, router, refetchBookings, refresh]);

  // When arriving with ?package=slug (from public packages), open Buy Hours modal so parent can complete purchase in dashboard
  const packageSlugFromUrl = searchParams.get('package');
  const childIdFromUrl = searchParams.get('childId');
  useEffect(() => {
    if (!packageSlugFromUrl || !hasInitialLoadCompleted || !user || user.role !== 'parent') return;
    setBuyHoursInitialPackageSlug(packageSlugFromUrl);
    setShowBuyHoursModal(true);
    setBuyHoursChildId(childIdFromUrl ? parseInt(childIdFromUrl, 10) : undefined);
    router.replace('/dashboard/parent', { scroll: false });
  }, [packageSlugFromUrl, hasInitialLoadCompleted, user?.role, router]);

  // Track background refresh state (for subtle indicator)
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Loading timeout: if loading takes more than 15 seconds, show error
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  useEffect(() => {
    if (loading || bookingsLoading) {
      const timer = setTimeout(() => {
        if (loading || bookingsLoading) {
          console.error('[Dashboard] Loading timeout - API calls taking too long');
          setLoadingTimeout(true);
        }
      }, 15000); // 15 second timeout
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading, bookingsLoading]);
  
  // Filter children to only those with active (confirmed and paid) bookings
  const approvedChildIdsWithBookings = useMemo(() => {
    const ids = new Set<number>();
    bookings.forEach(booking => {
      if (booking.status === BOOKING_STATUS.CONFIRMED && booking.paymentStatus === PAYMENT_STATUS.PAID) {
        booking.participants?.forEach(participant => {
          if (participant.childId) {
            ids.add(participant.childId);
          }
        });
      }
    });
    return Array.from(ids);
  }, [bookings]);

  const childrenWithBookings = useMemo(() => {
    return children.filter(child => approvedChildIdsWithBookings.includes(child.id));
  }, [children, approvedChildIdsWithBookings]);

  /** New children (0 hours, never had a package) and expired (ran out) for filter options. */
  const { newChildIds, expiredChildIds } = useMemo(() => {
    const confirmedPaid = bookings.filter((b) => b.status === BOOKING_STATUS.CONFIRMED && b.paymentStatus === PAYMENT_STATUS.PAID);
    const newIds: number[] = [];
    const expiredIds: number[] = [];
    approvedChildren.forEach((child) => {
      const childBookings = confirmedPaid.filter((b) =>
        (b.participants ?? []).some((p) => p.childId === child.id),
      );
      if (childBookings.length === 0) {
        newIds.push(child.id);
        return;
      }
      const latest = [...childBookings].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];
      const total = latest.totalHours ?? 0;
      const booked = latest.bookedHours ?? 0;
      const remaining = Math.max(0, total - booked);
      if (total > 0 && remaining <= 0) expiredIds.push(child.id);
    });
    return { newChildIds: newIds, expiredChildIds: expiredIds };
  }, [approvedChildren, bookings]);

  // Left sidebar state (Google Calendar-style) - synced calendars
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(() => moment().format('YYYY-MM-DD'));
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<string>(() => moment().format('YYYY-MM'));
  const [weekRangeDates, setWeekRangeDates] = useState<Set<string>>(new Set());
  const [switchToDayView, setSwitchToDayView] = useState(false);
  const [visibleChildIds, setVisibleChildIds] = useState<number[]>([]);

  // Shared calendar range toolbar (day/week/month) – syncs to calendar below
  const [calendarPeriod, setCalendarPeriod] = useState<CalendarPeriod>('1_month');
  const [calendarAnchor, setCalendarAnchor] = useState<string>(() => getMonday(new Date()));
  const handleCalendarAnchorChange = useCallback((newAnchor: string) => {
    setCalendarAnchor(newAnchor);
    setCurrentCalendarMonth(getMonthKey(newAnchor));
    setSelectedCalendarDate(newAnchor);
  }, []);
  
  // Booked hours and packages modal state
  const [showBookedSessionsModal, setShowBookedSessionsModal] = useState(false);
  const [selectedBookingForModal, setSelectedBookingForModal] = useState<BookingDTO | null>(null);
  const [selectedChildNameForModal, setSelectedChildNameForModal] = useState<string>('');

  // New booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showBuyHoursModal, setShowBuyHoursModal] = useState(false);
  const [buyHoursChildId, setBuyHoursChildId] = useState<number | undefined>();
  const [buyHoursInitialPackageSlug, setBuyHoursInitialPackageSlug] = useState<string | null>(null);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [checklistChildId, setChecklistChildId] = useState<number | undefined>();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentBooking, setSelectedPaymentBooking] = useState<BookingDTO | null>(null);
  const [bookingModalDate, setBookingModalDate] = useState<string | undefined>();
  const [bookingModalTime, setBookingModalTime] = useState<string | undefined>(); // For day view time slot
  const [bookingModalChildId, setBookingModalChildId] = useState<number | undefined>();
  const [editingSession, setEditingSession] = useState<{
    scheduleId: string | undefined;
    date: string;
    startTime: string;
    endTime: string;
    childId: number;
    activities?: string[]; // ✅ Activity names from the existing session
    notes?: string;
    location?: string;
  } | null>(null);

  // Top-up modal state (add hours to an existing package)
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpChildId, setTopUpChildId] = useState<number | null>(null);
  const [topUpBooking, setTopUpBooking] = useState<BookingDTO | null>(null);
  const [isTopUpSubmitting, setIsTopUpSubmitting] = useState(false);

  // Session detail modal state
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    childName: string;
    childId: number;
    activities: string[];
    trainerName?: string;
    trainerAssignmentStatus?: string | null;
    trainerPreferenceLabel?: string;
    requiresAdminApproval?: boolean;
    bookingId: number;
    scheduleId: string;
    isPast?: boolean;
    isOngoing?: boolean;
    isUpcoming?: boolean;
    itineraryNotes?: string; // Itinerary notes for custom activity detection
    location?: string;
  } | null>(null);

  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Add Child modal state
  const [showAddChildModal, setShowAddChildModal] = useState(false);

  // Safeguarding concern modal state
  const [showSafeguardingModal, setShowSafeguardingModal] = useState(false);

  // Session notes list modal state (header button)
  const [showSessionNotesModal, setShowSessionNotesModal] = useState(false);

  // FAB speed-dial open state (mobile)
  const [fabOpen, setFabOpen] = useState(false);

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast subscription
  useEffect(() => {
    const unsubscribe = toastManager.subscribe((toast) => {
      setToasts((prev) => [...prev, toast]);
    });
    return unsubscribe;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Children filter: empty selectedIds = "All Children" (show all). No auto-init so default is show all.
  
  // Debug: Log calendar render info
  useEffect(() => {
    if (!loading && !bookingsLoading) {
      console.log('[Dashboard] Calendar Debug Info:', {
        childrenWithBookings: childrenWithBookings.map(c => ({ id: c.id, name: c.name })),
        visibleChildIds,
        totalBookings: bookings.length,
        confirmedPaidBookings: bookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED && b.paymentStatus === PAYMENT_STATUS.PAID).length,
        bookingsWithSchedules: bookings.filter(b => b.schedules && b.schedules.length > 0).map(b => ({
          id: b.id,
          reference: b.reference,
          scheduleCount: b.schedules?.length || 0,
          schedules: b.schedules?.map(s => ({
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime,
            status: s.status,
          })),
        })),
      });
    }
  }, [loading, bookingsLoading, childrenWithBookings, visibleChildIds, bookings]);

  // Toggle child visibility on calendar
  const handleToggleChildVisibility = useCallback((childId: number) => {
    setVisibleChildIds(prev => {
      if (prev.includes(childId)) {
        return prev.filter(id => id !== childId);
      } else {
        return [...prev, childId];
      }
    });
  }, []);

  // Handle date selection from mini calendar - triggers day view (Google Calendar-style)
  const handleMiniCalendarDateSelect = useCallback((date: string) => {
    setSelectedCalendarDate(date);
    // Also update the month to match the selected date
    setCurrentCalendarMonth(moment(date).format('YYYY-MM'));
    setSwitchToDayView(true);
    // Reset the flag after a short delay so subsequent internal calendar navigation doesn't trigger day view
    setTimeout(() => setSwitchToDayView(false), 100);
  }, []);

  // Handle click on unbookable date in mini calendar (today, tomorrow after 6 PM) - show toast (context-aware message)
  const handleUnavailableDateClick = useCallback((_dateStr: string, reason?: string) => {
    toastManager.error(getMessageForDateReason(reason, { now: moment() }));
  }, []);

  // Handle date change from day view navigation (arrows) - syncs mini calendar without opening modal
  const handleDayViewDateChange = useCallback((date: string) => {
    setSelectedCalendarDate(date);
    // Also update the month to match the selected date
    setCurrentCalendarMonth(moment(date).format('YYYY-MM'));
  }, []);

  // Handle month change (synced between mini calendar and main calendar)
  const handleCalendarMonthChange = useCallback((month: string) => {
    setCurrentCalendarMonth(month);
  }, []);

  // Handle week range change (for syncing mini calendar week highlighting)
  const handleWeekRangeChange = useCallback((weekRange: Set<string>) => {
    setWeekRangeDates(weekRange);
  }, []);

  // Handle add child success (from modal)
  const handleAddChildSuccess = useCallback(async () => {
    // Refresh the children list
    await refresh();
    // Show success message
    setShowChildAddedSuccess(true);
    // Auto-hide after 10 seconds
    setTimeout(() => setShowChildAddedSuccess(false), 10000);
    // Show toast
    toastManager.success('Child added successfully! Please complete their checklist.');
  }, [refresh]);

  // Check if we just added a child (from query param)
  useEffect(() => {
    if (searchParams?.get('childAdded') === 'true') {
      setShowChildAddedSuccess(true);
      // Remove query param from URL without scrolling
      const url = new URL(window.location.href);
      url.searchParams.delete('childAdded');
      window.history.replaceState({}, '', url.pathname);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => setShowChildAddedSuccess(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Check for deep-link modals (query params)
  useEffect(() => {
    const openBooking = searchParams?.get('open') === 'booking';
    const childIdParam = searchParams?.get('childId');
    const bookingDate = searchParams?.get('bookDate');
    const bookingChildId = searchParams?.get('bookChildId');
    const editSessionId = searchParams?.get('editSessionId');

    if (openBooking) {
      setShowBookingModal(true);
      if (childIdParam) {
        const id = parseInt(childIdParam, 10);
        if (!Number.isNaN(id)) setBookingModalChildId(id);
      }
      const url = new URL(window.location.href);
      url.searchParams.delete('open');
      url.searchParams.delete('childId');
      window.history.replaceState({}, '', url.pathname + (url.search || ''));
    }

    if (bookingDate) {
      setBookingModalDate(bookingDate);
      if (bookingChildId) {
        setBookingModalChildId(parseInt(bookingChildId, 10));
      }
      setShowBookingModal(true);
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('bookDate');
      url.searchParams.delete('bookChildId');
      window.history.replaceState({}, '', url.pathname);
    }

    if (editSessionId) {
      // Find session and open edit modal
      bookings.forEach(booking => {
        booking.schedules?.forEach(schedule => {
          if (schedule.id === editSessionId) {
            const child = approvedChildren.find(c => {
              return booking.participants?.some(p => p.childId === c.id);
            });
            if (child && schedule.date && schedule.startTime && schedule.endTime) {
              setEditingSession({
                scheduleId: schedule.id,
                date: schedule.date,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                childId: child.id,
                notes: schedule.itineraryNotes || undefined,
              });
              setBookingModalChildId(child.id);
              setShowBookingModal(true);
            }
          }
        });
      });
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('editSessionId');
      window.history.replaceState({}, '', url.pathname);
    }

    const scheduleIdParam = searchParams?.get('scheduleId');
    if (scheduleIdParam) {
      let opened = false;
      for (const booking of bookings) {
        if (opened) break;
        if (booking.status !== 'confirmed' || booking.paymentStatus !== 'paid') continue;
        for (const schedule of booking.schedules || []) {
          if (String(schedule.id) === scheduleIdParam) {
            const startTime = schedule.startTime ?? (schedule as { start_time?: string }).start_time ?? '';
            const endTime = schedule.endTime ?? (schedule as { end_time?: string }).end_time ?? '';
            const dateStr = typeof schedule.date === 'string' ? schedule.date : moment(schedule.date).format('YYYY-MM-DD');
            const childName = booking.participants?.[0] ? `${booking.participants[0].firstName ?? ''} ${booking.participants[0].lastName ?? ''}`.trim() || 'Child' : 'Child';
            const childId = booking.participants?.[0]?.childId ?? 0;
            setSelectedSession({
              id: String(schedule.id),
              date: dateStr,
              startTime,
              endTime,
              childName,
              childId,
              activities: schedule.activities?.map((a: { name: string }) => a.name) ?? [],
              bookingId: typeof booking.id === 'string' ? parseInt(booking.id, 10) : Number(booking.id),
              scheduleId: String(schedule.id),
              isPast: moment().isAfter(moment(`${dateStr} ${endTime}`, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss'])),
              isOngoing: false,
              isUpcoming: false,
              trainerName: schedule.trainer?.name,
              trainerAssignmentStatus: (schedule as { trainerAssignmentStatus?: string }).trainerAssignmentStatus ?? null,
              requiresAdminApproval: schedule.requiresAdminApproval,
              itineraryNotes: schedule.itineraryNotes ?? schedule.notes,
              location: schedule.location ?? undefined,
            });
            setShowSessionModal(true);
            const url = new URL(window.location.href);
            url.searchParams.delete('scheduleId');
            window.history.replaceState({}, '', url.pathname + (url.search || ''));
            opened = true;
            break;
          }
        }
      }
    }
  }, [searchParams, bookings, approvedChildren]);

  // Auto-refresh handler (triggered automatically on visibility/focus)
  // Only shows subtle indicator if NOT initial load (to avoid showing indicator on first load)
  const handleRefresh = useCallback(async () => {
    // Only show indicator if initial load is complete (background refresh)
    const isBackgroundRefresh = !isInitialLoad;
    
    if (isBackgroundRefresh) {
      setIsRefreshing(true);
    }
    
    try {
      await Promise.all([
        refresh(), // Refresh auth data (user + children)
        refetchBookings(), // Refresh bookings
        refetchStats(), // Refresh dashboard stats
      ]);
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    } finally {
      if (isBackgroundRefresh) {
        // Small delay before hiding indicator for better UX (user can see it completed)
        setTimeout(() => {
          setIsRefreshing(false);
        }, 300);
      }
    }
  }, [refresh, refetchBookings, isInitialLoad]);

  // Centralised live refresh: refetch when backend reports changes to bookings, notifications, or children
  const parentRefetch = useCallback(() => {
    void Promise.all([
      Promise.resolve(refetchBookings(true)),
      Promise.resolve(refetchStats(true)),
      Promise.resolve(refresh()),
    ]);
  }, [refetchBookings, refetchStats, refresh]);
  useLiveRefresh('bookings', parentRefetch, { enabled: LIVE_REFRESH_ENABLED });
  useLiveRefresh('notifications', parentRefetch, { enabled: LIVE_REFRESH_ENABLED });
  useLiveRefresh('children', parentRefetch, { enabled: LIVE_REFRESH_ENABLED });

  // Get active booking for a child
  const getActiveBookingForChild = useCallback((childId: number): BookingDTO | null => {
    const confirmedPaidBookings = bookings.filter(
      b => b.status === BOOKING_STATUS.CONFIRMED && b.paymentStatus === PAYMENT_STATUS.PAID
    );
    const childBookings = confirmedPaidBookings.filter(b => {
      if (!b.participants) return false;
      return b.participants.some(p => p.childId === childId);
    });
    if (childBookings.length === 0) return null;
    const sorted = [...childBookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sorted[0];
  }, [bookings]);

  // Handle booking save (create or update session)
  const handleBookingSave = useCallback(async (bookingData: ParentBookingFormData) => {
    const activeBooking = getActiveBookingForChild(bookingData.childId);
    if (!activeBooking) {
      throw new Error('No active package found for this child. Please buy a package first.');
    }

    // ✅ NEW: Determine activities array based on activity selection type (MULTIPLE ACTIVITIES SUPPORT)
    const activities: Array<{ activity_id: number; duration_hours?: number; order?: number }> = [];
    
    if (bookingData.activitySelectionType === 'package_activity' && bookingData.selectedActivityIds && bookingData.selectedActivityIds.length > 0) {
      // ✅ Multiple activities selected - send all of them
      bookingData.selectedActivityIds.forEach((activityId, idx) => {
        // Find activity from useActivities hook (database activities)
        // Note: We don't have direct access to useActivities here, so we'll use activeBooking.package.activities
        // OR we need to fetch activities separately
        // For now, we'll send activity IDs and let backend determine duration
        activities.push({
          activity_id: activityId,
          order: idx,
        });
      });
    }
    // For custom activities (single legacy name and/or multiple new ones), include in notes.
    if (bookingData.customActivityName || (bookingData.customActivities && bookingData.customActivities.length > 0)) {
      const customLines: string[] = [];

      if (bookingData.customActivityName) {
        customLines.push(`Custom Activity: ${bookingData.customActivityName}`);
      }

      if (bookingData.customActivities && bookingData.customActivities.length > 0) {
        bookingData.customActivities.forEach((custom) => {
          const durationText = custom.duration ? ` (${custom.duration}h)` : '';
          customLines.push(`Custom Activity: ${custom.name}${durationText}`);
        });
      }

      const customNote = customLines.join('\n');
      bookingData.notes = bookingData.notes
        ? `${customNote}\n\n${bookingData.notes}`
        : customNote;
    }
    // For 'trainer_choice', activities array remains empty (backend will handle)

    // ✅ Calculate total duration based on selected activities OR selected duration
    // Import MIN_DURATION_HOURS constant
    const MIN_DURATION_HOURS = 3; // Minimum session duration (matches bookingValidationMessages)
    let totalDuration = MIN_DURATION_HOURS; // Default to minimum hours (business rule)
    
    if (bookingData.activitySelectionType === 'package_activity') {
      // Base duration from database-backed activities
      const selectedIds = bookingData.selectedActivityIds || [];
      const dbDuration = selectedIds.reduce((sum, activityId) => {
        const activity = allActivities.find(a => String(a.id) === String(activityId));
        return sum + (activity?.duration || 1);
      }, 0);

      // Additional duration from custom activities
      const customDuration = (bookingData.customActivities || []).reduce(
        (sum, custom) => sum + (custom.duration || 0),
        0
      );

      totalDuration = Math.max(MIN_DURATION_HOURS, dbDuration + customDuration);

      // Also populate activity duration_hours in activities array for backend for DB activities
      selectedIds.forEach((activityId, idx) => {
        const activity = allActivities.find(a => String(a.id) === String(activityId));
        if (activity && activities[idx]) {
          activities[idx].duration_hours = activity.duration;
        }
      });
    } else if (bookingData.duration) {
      // For 'trainer_choice' or legacy custom, use selected duration
      totalDuration = bookingData.duration;
    }

    // Calculate end time using the selected date to handle multi-day sessions correctly
    const startDateTime = moment(`${bookingData.date} ${bookingData.startTime}`, 'YYYY-MM-DD HH:mm');
    const endDateTime = startDateTime.clone().add(totalDuration, 'hours');
    const endTime = endDateTime.format('HH:mm');
    
    // Handle multi-day sessions: When a session spans to the next day and end time equals start time
    // (e.g., 24-hour session starting at 22:00 ending at 22:00 next day), backend validation fails
    // because it only compares time strings without considering dates.
    // Solution: Silently adjust end time by 1 minute to ensure validation passes.
    // This adjustment is invisible to parents and has negligible impact (0.07% of 24 hours).
    const isNextDay = !endDateTime.isSame(startDateTime, 'day');
    const finalEndTime = (isNextDay && endTime === bookingData.startTime) 
      ? endDateTime.clone().add(1, 'minute').format('HH:mm')
      : endTime;

    // Debug: Log the payload being sent to backend
    console.log('[handleBookingSave] Payload:', {
      date: bookingData.date,
      start_time: bookingData.startTime,
      end_time: finalEndTime,
      totalDuration,
      activities,
      activitySelectionType: bookingData.activitySelectionType,
      itinerary_notes: bookingData.notes || null,
    });

    try {
      if (editingSession && editingSession.scheduleId) {
        // ✅ Update existing session with multiple activities
        await apiClient.put(
          API_ENDPOINTS.BOOKING_SCHEDULE_BY_ID(editingSession.scheduleId),
          {
            date: bookingData.date,
            start_time: bookingData.startTime,
            end_time: finalEndTime,
            activities: activities, // Array of {activity_id, duration_hours?, order?}
            itinerary_notes: bookingData.notes || null,
          }
        );
        toastManager.success('Session updated successfully!');
      } else {
        // ✅ Create new session with multiple activities
        await apiClient.post(
          API_ENDPOINTS.BOOKING_SCHEDULES(activeBooking.id),
          {
            date: bookingData.date,
            start_time: bookingData.startTime,
            end_time: finalEndTime,
            activities: activities, // Array of {activity_id, duration_hours?, order?}
            itinerary_notes: bookingData.notes || null,
          }
        );
        toastManager.success('Session booked successfully!');
      }

      // Refresh bookings to update calendar
      await refetchBookings();
      await refresh();

      // Reset modal state
      setShowBookingModal(false);
      setBookingModalDate(undefined);
      setBookingModalChildId(undefined);
      setEditingSession(null);
    } catch (error: unknown) {
      const err = error as {
        message?: string;
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
      };
      const data = err?.response?.data;
      console.error('Failed to save booking:', {
        message: err?.message,
        response: data ? { data } : undefined,
      });
      // Prefer backend message; fall back to first validation error (e.g. duration)
      const firstValidationError = data?.errors
        ? (Object.values(data.errors).flat().find(Boolean) as string | undefined)
        : undefined;
      const errorMessage =
        data?.message ||
        firstValidationError ||
        err?.message ||
        'Failed to save session. Please try again.';
      toastManager.error(errorMessage, {
        label: 'Retry',
        onClick: () => handleBookingSave(bookingData),
      });
      throw error;
    }
  }, [editingSession, getActiveBookingForChild, refetchBookings, refresh]);

  // Handle session cancel (24-hour rule enforced on backend; hours refunded on success)
  const handleSessionCancel = useCallback(async (scheduleId: string) => {
    try {
      await apiClient.post(API_ENDPOINTS.BOOKING_SCHEDULE_CANCEL(scheduleId), {
        cancellationReason: null,
      });

      toastManager.success('Session cancelled successfully!');
      
      // Refresh bookings to update calendar and hours
      await refetchBookings();
      await refresh();

      // Close modal
      setShowSessionModal(false);
      setSelectedSession(null);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error('Failed to cancel session:', err);
      const errorMessage = err?.response?.data?.message ||
                          err?.message ||
                          'Failed to cancel session. Please try again.';
      toastManager.error(errorMessage);
      throw error;
    }
  }, [refetchBookings, refresh]);

  // Bulk cancel selected sessions (calendar multi-select)
  const handleBulkCancel = useCallback(async (scheduleIds: string[]) => {
    if (scheduleIds.length === 0) return;
    try {
      await Promise.all(
        scheduleIds.map((id) =>
          apiClient.post(API_ENDPOINTS.BOOKING_SCHEDULE_CANCEL(id), { cancellationReason: null })
        )
      );
      toastManager.success(
        scheduleIds.length === 1
          ? 'Session cancelled successfully!'
          : `${scheduleIds.length} sessions cancelled successfully!`
      );
      await refetchBookings();
      await refresh();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err?.response?.data?.message ||
                          err?.message ||
                          'Failed to cancel one or more sessions. Please try again.';
      toastManager.error(errorMessage);
      throw error;
    }
  }, [refetchBookings, refresh]);

  // Reschedule session (drag-to-reschedule confirm)
  const handleRescheduleRequest = useCallback(
    async (
      session: { scheduleId: string; date: string; startTime: string; endTime: string },
      newDate: string,
      newStartTime: string,
      newEndTime: string
    ) => {
      try {
        await apiClient.put(API_ENDPOINTS.BOOKING_SCHEDULE_BY_ID(session.scheduleId), {
          date: newDate,
          start_time: newStartTime,
          end_time: newEndTime,
        });
        toastManager.success('Session rescheduled successfully!');
        await refetchBookings();
        await refresh();
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        const errorMessage = err?.response?.data?.message ||
                            err?.message ||
                            'Failed to reschedule session. Please try again.';
        toastManager.error(errorMessage);
        throw error;
      }
    },
    [refetchBookings, refresh]
  );

  // Handle calendar date click (open booking modal) — all date rules from bookingCutoffRules
  const handleCalendarDateClick = useCallback((date: string, time?: string) => {
    const now = moment();
    const status = getDateBookingStatus(date, now);
    if (!status.bookable && status.reason) {
      toastManager.error(getMessageForDateReason(status.reason, { now }));
      return;
    }

    // Date is bookable — open modal
    // The modal will validate that the selected time is 24+ hours away
    setBookingModalDate(date);
    setBookingModalChildId(undefined); // Clear pre-selected child
    setEditingSession(null); // Clear editing session
    if (time) {
      setBookingModalTime(time); // Pre-select time for day view
    } else {
      setBookingModalTime(undefined); // Clear time if clicking from month view
    }
    setShowBookingModal(true);
  }, []);

  // Handle calendar session click (open session detail modal)
  const handleCalendarSessionClick = useCallback((session: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    childName: string;
    childId: number;
    activities: string[];
    trainerName?: string;
    trainerPreferenceLabel?: string;
    requiresAdminApproval?: boolean;
    bookingId: number;
    scheduleId: string;
    isPast?: boolean;
    isOngoing?: boolean;
    isUpcoming?: boolean;
    itineraryNotes?: string;
  }) => {
    setSelectedSession(session);
    setShowSessionModal(true);
  }, []);

  // Handle session edit (open booking modal with existing data)
  const handleSessionEdit = useCallback((session: typeof selectedSession) => {
    if (!session) return;
    
    setEditingSession({
      scheduleId: session.scheduleId,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      childId: session.childId,
      activities: session.activities || [], // ✅ Include activities from session
      notes: session.itineraryNotes, // ✅ Include notes for custom activity detection
      location: session.location,
    });
    setBookingModalChildId(session.childId);
    setBookingModalDate(session.date);
    setBookingModalTime(undefined); // Clear pre-selected time when editing
    setShowBookingModal(true);
    setShowSessionModal(false);
  }, []);

  // Handle child actions
  const handleBookSession = useCallback((childId: number, date?: string) => {
    // Only allow booking if child has an active package
    const activeBooking = getActiveBookingForChild(childId);
    if (!activeBooking) {
      toastManager.error('This child does not have an active package. Please buy a package first.');
      return;
    }

    setBookingModalChildId(childId);
    setEditingSession(null); // Clear editing session
    setBookingModalTime(undefined); // Clear pre-selected time
    if (date) {
      setBookingModalDate(date);
    } else {
      // Default to tomorrow (no same-day bookings)
      setBookingModalDate(moment().add(1, 'day').format('YYYY-MM-DD'));
    }
    setShowBookingModal(true);
  }, [getActiveBookingForChild]);

  // Keyboard shortcuts: N (new booking), H (hours), ←/→ (month), Esc (close modals). Don't trigger in inputs.
  const [showKeyboardShortcutsHint, setShowKeyboardShortcutsHint] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName?.toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        if (hasApprovedChildren && canBook && approvedChildren.length > 0) handleBookSession(approvedChildren[0].id);
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        document.getElementById('dashboard-hours-section')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentCalendarMonth((m) => moment(m, 'YYYY-MM').add(-1, 'month').format('YYYY-MM'));
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentCalendarMonth((m) => moment(m, 'YYYY-MM').add(1, 'month').format('YYYY-MM'));
        return;
      }
      if (e.key === 'Escape') {
        setShowKeyboardShortcutsHint(false);
        setShowSessionModal(false);
        setShowBookingModal(false);
        setShowBuyHoursModal(false);
        setShowPaymentModal(false);
        setShowChecklistModal(false);
        setShowAddChildModal(false);
        setShowSafeguardingModal(false);
        setShowSessionNotesModal(false);
        setShowTopUpModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCalendarMonth, hasApprovedChildren, canBook, approvedChildren, handleBookSession]);

  // Open Booked Sessions modal (Session Details – which days are booked) for a child
  const handleOpenBookedSessions = useCallback((childId: number) => {
    const activeBooking = getActiveBookingForChild(childId);
    if (!activeBooking) {
      toastManager.info('No active package with sessions for this child.');
      return;
    }
    const child = children.find(c => c.id === childId) || approvedChildren.find(c => c.id === childId);
    setSelectedBookingForModal(activeBooking);
    setSelectedChildNameForModal(child?.name ?? '');
    setShowBookedSessionsModal(true);
  }, [getActiveBookingForChild, children, approvedChildren]);

  // Resolve session by scheduleId from bookings for SessionDetailModal (e.g. when opening from Session Notes card)
  const findSessionByScheduleId = useCallback((
    scheduleId: string,
    preferredChildName?: string,
    preferredChildId?: number
  ): NonNullable<typeof selectedSession> | null => {
    for (const booking of bookings) {
      if (booking.status !== 'confirmed' || booking.paymentStatus !== 'paid') continue;
      for (const schedule of booking.schedules || []) {
        if (String(schedule.id) === scheduleId) {
          const startTime = schedule.startTime ?? (schedule as { start_time?: string }).start_time ?? '';
          const endTime = schedule.endTime ?? (schedule as { end_time?: string }).end_time ?? '';
          const activities = schedule.activities?.map((a: { name: string }) => a.name) ?? [];
          const dateStr = typeof schedule.date === 'string' ? schedule.date : moment(schedule.date).format('YYYY-MM-DD');
          const startMoment = moment(`${dateStr} ${startTime}`, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss'], false);
          const endMoment = moment(`${dateStr} ${endTime}`, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss'], false);
          const now = moment();
          const childName = preferredChildName ?? (booking.participants?.[0] ? `${booking.participants[0].firstName ?? ''} ${booking.participants[0].lastName ?? ''}`.trim() || 'Child' : 'Child');
          const childId = preferredChildId ?? booking.participants?.[0]?.childId ?? 0;
          return {
            id: String(schedule.id),
            date: dateStr,
            startTime,
            endTime,
            childName,
            childId,
            activities,
            bookingId: typeof booking.id === 'string' ? parseInt(booking.id, 10) : Number(booking.id),
            scheduleId: String(schedule.id),
            isPast: now.isAfter(endMoment),
            isOngoing: now.isAfter(startMoment) && now.isBefore(endMoment),
            isUpcoming: now.isBefore(startMoment),
            trainerName: schedule.trainer?.name,
            trainerAssignmentStatus: (schedule as { trainerAssignmentStatus?: string }).trainerAssignmentStatus ?? null,
            requiresAdminApproval: schedule.requiresAdminApproval,
            itineraryNotes: schedule.itineraryNotes ?? schedule.notes,
            location: schedule.location ?? undefined,
          };
        }
      }
    }
    return null;
  }, [bookings]);

  // Open session/note detail from Session Notes card → SessionDetailModal
  const handleViewSessionNote = useCallback((scheduleId: string, item: { childName: string; childId: number }) => {
    const session = findSessionByScheduleId(scheduleId, item.childName, item.childId);
    if (session) {
      setSelectedSession(session);
      setShowSessionModal(true);
      refetchBookings(); // Fresh data so assigned trainer is visible when modal opens
    } else {
      toastManager.info('Session details are no longer available.');
    }
  }, [findSessionByScheduleId, refetchBookings]);

  // Open session detail from sidebar "Next up" list
  const handleUpcomingSessionClick = useCallback(
    (session: { scheduleId: string; childName: string; childId: number }) => {
      const resolved = findSessionByScheduleId(
        session.scheduleId,
        session.childName,
        session.childId,
      );
      if (resolved) {
        setSelectedSession(resolved);
        setShowSessionModal(true);
      } else {
        toastManager.info('Session details are no longer available.');
      }
    },
    [findSessionByScheduleId],
  );

  // When session modal is open and bookings update (e.g. after refetch), re-resolve session so trainer name stays in sync
  useEffect(() => {
    if (!showSessionModal || !selectedSession?.scheduleId) return;
    const resolved = findSessionByScheduleId(
      selectedSession.scheduleId,
      selectedSession.childName,
      selectedSession.childId
    );
    if (resolved) {
      setSelectedSession(resolved);
    }
  }, [bookings, showSessionModal, selectedSession?.scheduleId, selectedSession?.childName, selectedSession?.childId, findSessionByScheduleId]);

  const handleSafeguardingSubmit = useCallback(async (data: SafeguardingConcernFormData) => {
    await submitSafeguardingConcern(data);
    toastManager.success('Your concern has been recorded. Our Designated Safeguarding Lead will be in touch.');
  }, [submitSafeguardingConcern]);

  const handleBuyHours = useCallback((childId: number) => {
    const child = children.find(c => c.id === childId);
    if (child) {
      const { hasChecklist, checklistCompleted } = getChildChecklistFlags(child);
      if (!hasChecklist) {
        toastManager.warning('Please complete the checklist first before buying hours.');
        return;
      }
      if (!checklistCompleted) {
        toastManager.info('Your checklist has been submitted and is awaiting review. You will be able to buy hours once it has been approved.');
        return;
      }
    }
    setBuyHoursChildId(childId);
    setShowBuyHoursModal(true);
  }, [children]);

  const handleOpenTopUp = useCallback((childId: number) => {
    const child = approvedChildren.find(c => c.id === childId);
    if (!child) {
      toastManager.error('We could not find this child. Please refresh the page and try again.');
      return;
    }

    const activeBooking = getActiveBookingForChild(childId);
    if (!activeBooking) {
      toastManager.error('This child does not have an active package to top up.');
      return;
    }

    if (activeBooking.status !== 'confirmed' || activeBooking.paymentStatus !== 'paid') {
      toastManager.error('You can only top up fully paid, confirmed packages. Please complete payment first.');
      return;
    }

    setTopUpChildId(childId);
    setTopUpBooking(activeBooking);
    setShowTopUpModal(true);
  }, [approvedChildren, getActiveBookingForChild]);

  const handleTopUpProceedToPayment = useCallback(async (hours: number, _totalPrice: number) => {
    if (!topUpBooking || topUpChildId === null) return;

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
          typeof bookingId === 'string' ? bookingId : Number(bookingId)
        ),
        { hours }
      );

      const checkoutUrl = response.data?.checkout_url;
      if (checkoutUrl) {
        setShowTopUpModal(false);
        window.location.href = checkoutUrl;
        return;
      }

      toastManager.error('Unable to start top-up payment. Please try again.');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to start top-up payment. Please try again.';
      toastManager.error(message);
    } finally {
      setIsTopUpSubmitting(false);
    }
  }, [topUpBooking, topUpChildId]);

  const handleCompleteChecklist = useCallback((childId: number) => {
    setChecklistChildId(childId);
    setShowChecklistModal(true);
  }, []);

  const handleRemoveChild = useCallback(
    async (childId: number) => {
      try {
        await childrenRepository.delete(childId);
        await refresh();
        toastManager.success('Child removed.');
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

  const handleCompletePayment = useCallback((booking: BookingDTO) => {
    setSelectedPaymentBooking(booking);
    setShowPaymentModal(true);
  }, []);

  const handlePaymentComplete = useCallback(async () => {
    // Refresh bookings so sidebar hours update immediately (silent refetch = no loading flash)
    await refetchBookings(true);
    refresh();
    // Single success toast so parent knows payment went through
    toastManager.success('Payment received. Your hours will update in a moment—you can now book sessions.');
    // Close modal
    setShowPaymentModal(false);
    setSelectedPaymentBooking(null);
    // Delayed refetch in case backend confirms the booking shortly after
    setTimeout(() => refetchBookings(true), 2000);
  }, [refetchBookings, refresh]);

  const handlePaymentFailed = useCallback((error: string) => {
    toastManager.error(`Payment failed: ${error}`);
  }, []);

  const handleCancelDraftBooking = useCallback(async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.post(API_ENDPOINTS.BOOKING_CANCEL(bookingId), {
        cancellation_reason: 'Cancelled by parent - payment not completed',
      });

      toastManager.success('Draft booking cancelled successfully.');
      await refetchBookings();
    } catch (error: any) {
      console.error('Failed to cancel draft booking:', error);
      toastManager.error(error.message || 'Failed to cancel booking. Please try again.');
    }
  }, [refetchBookings]);

  const handleChecklistSubmit = useCallback(async (formData: ChecklistFormData) => {
    if (!checklistChildId) return;

    try {
      // Submit checklist to API
      await apiClient.post(
        API_ENDPOINTS.CHILD_CHECKLIST(checklistChildId),
        formData
      );

      toastManager.success('Checklist submitted successfully!');

      // Refresh children data
      await refresh();

      // Close modal
      setShowChecklistModal(false);
      setChecklistChildId(undefined);
    } catch (error: any) {
      console.error('Failed to submit checklist:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to submit checklist. Please try again.';
      toastManager.error(errorMessage);
      throw error;
    }
  }, [checklistChildId, refresh]);

  // Calculate summary statistics


  // Determine which child to use for "Buy More Hours" button
  // Priority: Child with lowest remaining hours (most urgent need) > First approved child
  const buyMoreHoursChildId = useMemo(() => {
    if (!stats || approvedChildren.length === 0) return null;
    
    // If only one approved child, use that one
    if (approvedChildren.length === 1) {
      return approvedChildren[0].id;
    }
    
    // Guard: API may return object or undefined; ensure we have an array
    const activePackagesPerChild = Array.isArray(stats.activePackagesPerChild)
      ? stats.activePackagesPerChild
      : [];
    
    // If multiple children, find the one with the lowest remaining hours (most urgent)
    const childWithLowestHours = activePackagesPerChild
      .filter((child) => (child.activePackages?.length ?? 0) > 0) // Only children with active packages
      .sort((a, b) => {
        const aRemaining = a.activePackages?.[0]?.remainingHours ?? Infinity;
        const bRemaining = b.activePackages?.[0]?.remainingHours ?? Infinity;
        return aRemaining - bRemaining; // Sort ascending (lowest first)
      })[0];
    
    // If found a child with active package and low hours, use that
    if (childWithLowestHours && childWithLowestHours.activePackages?.[0]?.remainingHours !== undefined) {
      return childWithLowestHours.childId;
    }
    
    // Otherwise, use first approved child (for children without packages yet)
    return approvedChildren[0].id;
  }, [approvedChildren, stats]);

  // Check which children have active packages (matching backend Child::activeBookings() logic)
  // Active booking = draft/pending/confirmed, not refunded, not deleted, package not expired
  // This is used to determine if "Buy Hours" button should be disabled
  const childrenWithActivePackagesForBuyHours = useMemo(() => {
    if (approvedChildren.length === 0) return [];
    
    // Match backend logic: activeBookings() checks for:
    // - Status: draft, pending, or confirmed
    // - Payment status: not refunded
    // - Not soft deleted (deletedAt is null)
    // - Package not expired (packageExpiresAt is null or in the future)
    const activeBookings = bookings.filter(b => {
      // Status check
      if (!['draft', 'pending', 'confirmed'].includes(b.status)) return false;
      
      // Payment status check
      if (b.paymentStatus === PAYMENT_STATUS.REFUNDED) return false;
      
      // Soft delete check
      if (b.deletedAt) return false;
      
      // Package expiry check
      if (b.packageExpiresAt) {
        const expiresAt = new Date(b.packageExpiresAt);
        if (expiresAt <= new Date()) return false; // Expired
      }
      
      return true;
    });
    
    // Map child IDs that have active bookings
    const childIdsWithActivePackages = new Set<number>();
    activeBookings.forEach(booking => {
      if (booking.participants) {
        booking.participants.forEach(p => {
          if (p.childId) {
            childIdsWithActivePackages.add(p.childId);
          }
        });
      }
    });
    
    // Return children that have active packages
    return approvedChildren.filter(child => childIdsWithActivePackages.has(child.id));
  }, [approvedChildren, bookings]);
  
  // Check if all children have active packages (to disable "Buy Hours" button)
  const allChildrenHaveActivePackages = useMemo(() => {
    if (approvedChildren.length === 0) return false;
    return childrenWithActivePackagesForBuyHours.length === approvedChildren.length;
  }, [approvedChildren, childrenWithActivePackagesForBuyHours]);

  // Child IDs that already have an active package (draft/pending/confirmed). Used by sidebar to avoid showing "Buy hours" when the child cannot purchase another package yet.
  const childIdsWithActivePackage = useMemo(
    () => new Set(childrenWithActivePackagesForBuyHours.map(c => c.id)),
    [childrenWithActivePackagesForBuyHours]
  );

  // True when at least one "active" booking is still draft or unpaid (so we can show a clearer message than "All selected children already have an active package").
  const hasDraftOrUnpaidActivePackage = useMemo(() => {
    const activeBookings = bookings.filter(b => {
      if (!['draft', 'pending', 'confirmed'].includes(b.status)) return false;
      if (b.paymentStatus === PAYMENT_STATUS.REFUNDED || b.deletedAt) return false;
      if (b.packageExpiresAt && new Date(b.packageExpiresAt) <= new Date()) return false;
      return true;
    });
    return activeBookings.some(b => b.status === BOOKING_STATUS.DRAFT || b.paymentStatus !== PAYMENT_STATUS.PAID);
  }, [bookings]);

  // First unpaid booking (for "Complete payment" / Pay now from alerts).
  const firstUnpaidBooking = useMemo(() => {
    return bookings.find(b => {
      if (!['draft', 'pending', 'confirmed'].includes(b.status ?? '')) return false;
      if (b.paymentStatus === PAYMENT_STATUS.PAID || b.paymentStatus === PAYMENT_STATUS.REFUNDED || b.deletedAt) return false;
      if (b.packageExpiresAt && new Date(b.packageExpiresAt) <= new Date()) return false;
      return true;
    }) ?? null;
  }, [bookings]);
  const firstUnpaidBookingReference = firstUnpaidBooking?.reference ?? null;
  
  // Filter approved children to only those with active packages (eligible for booking)
  const childrenWithActivePackages = useMemo(() => {
    return approvedChildren.filter(child => {
      const activeBooking = getActiveBookingForChild(child.id);
      return activeBooking !== null;
    });
  }, [approvedChildren, getActiveBookingForChild]);

  // All approved children with activePackages/remainingHours for the Book Session modal.
  // Includes children with no paid package (remainingHours: 0) so the dropdown shows everyone;
  // the modal shows "Complete payment or buy hours" and disables submit when 0h available.
  const childrenForBookingModal = useMemo(() => {
    return approvedChildren.map((child) => {
      const activeBooking = getActiveBookingForChild(child.id);
      const totalHours = activeBooking?.totalHours ?? 0;
      const bookedHours = activeBooking?.bookedHours ?? 0;
      const remainingHours = Math.max(0, totalHours - bookedHours);
      return {
        id: child.id,
        name: child.name,
        activePackages:
          activeBooking != null
            ? [
                {
                  id: typeof activeBooking.id === 'string' ? parseInt(activeBooking.id, 10) : activeBooking.id,
                  remainingHours,
                  totalHours,
                },
              ]
            : [{ id: 0, remainingHours: 0, totalHours: 0 }],
      };
    });
  }, [approvedChildren, getActiveBookingForChild]);

  // Children list for schedule filter dropdown (id, name, remainingHours for "Show: Child name (Xh left)").
  const filterableChildrenWithHours = useMemo(() => {
    return approvedChildren.map((child) => {
      const activeBooking = getActiveBookingForChild(child.id);
      const totalHours = activeBooking?.totalHours ?? 0;
      const bookedHours = activeBooking?.bookedHours ?? 0;
      const remainingHours = Math.max(0, totalHours - bookedHours);
      return { id: child.id, name: child.name, remainingHours };
    });
  }, [approvedChildren, getActiveBookingForChild]);

  // Smart Responsive Hook - Context-Aware Layout Decisions
  const pendingActionsCount = useMemo(() => {
    if (!stats) return 0;
    return stats.childrenNeedingChecklist + stats.childrenWithPendingChecklist;
  }, [stats]);

  const isInteracting = showBookingModal || showBuyHoursModal || showChecklistModal || 
                       showSessionModal || showSettingsModal || showAddChildModal || showBookedSessionsModal ||
                       showSessionNotesModal || showSafeguardingModal;

  const responsive = useSmartResponsive({
    itemCount: children.length + bookings.length,
    hasPendingActions: (pendingActionsCount > 0 || (stats?.pendingBookings ?? 0) > 0),
    isEmpty: children.length === 0 && bookings.length === 0,
    isInteracting,
  });

  // Children rejected by admin – show banner so parent sees what happened
  const rejectedChildren = useMemo(
    () => children.filter((c) => getChildChecklistFlags(c).approvalStatus === 'rejected'),
    [children]
  );

  // Get pending children sorted by priority (checklist needed first) - MUST be before early returns
  const pendingChildrenSorted = useMemo(() => {
    const pending = children.filter(c => getChildChecklistFlags(c).approvalStatus === 'pending');
    return pending.sort((a, b) => {
      const aNeedsChecklist = childNeedsChecklistCta(a);
      const bNeedsChecklist = childNeedsChecklistCta(b);
      if (aNeedsChecklist && !bNeedsChecklist) return -1;
      if (!aNeedsChecklist && bNeedsChecklist) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [children]);

  // Children needing checklist action (pending with no or incomplete checklist)
  const childrenNeedingAction = useMemo(() => {
    return children.filter(childNeedsChecklistCta);
  }, [children]);

  // For overview sidebar "ACTION NEEDED": only children who have NOT yet submitted a checklist (so we don't show same child in both ACTION NEEDED and CHECKLIST SUBMITTED)
  const childrenNeedingChecklistForSidebar = useMemo(
    () => children.filter(childNeedsChecklistToComplete).map((c) => ({ id: c.id, name: c.name })),
    [children]
  );

  // Children who have submitted checklist but are awaiting admin review – show "We're reviewing" so parent doesn't see "ALL CLEAR" and get confused
  const childrenAwaitingChecklistReviewForSidebar = useMemo(
    () => children.filter(childAwaitingChecklistReview).map((c) => ({ id: c.id, name: c.name })),
    [children]
  );

  // All children still pending approval (for sidebar: show "Under review" when no checklist action needed, so we never show "ALL CLEAR" while a child is pending)
  const childrenPendingApprovalForSidebar = useMemo(
    () => children.filter((c) => getChildChecklistFlags(c).approvalStatus === 'pending').map((c) => ({ id: c.id, name: c.name })),
    [children]
  );

  // Upcoming sessions for "Next up" strip in sidebar (next 5, confirmed+paid, not cancelled, date >= today)
  const upcomingSessionsForSidebar = useMemo(() => {
    const today = moment().format('YYYY-MM-DD');
    const items: Array<{
      scheduleId: string;
      date: string;
      startTime: string;
      endTime: string;
      childName: string;
      childId: number;
      trainerName?: string;
      location?: string | null;
      activities?: string[];
      packageName?: string | null;
    }> = [];
    const confirmedPaid = bookings.filter(
      (b) => b.status === BOOKING_STATUS.CONFIRMED && b.paymentStatus === PAYMENT_STATUS.PAID,
    );
    confirmedPaid.forEach((booking) => {
      const participant = booking.participants?.[0];
      const childName = participant
        ? `${participant.firstName ?? ''} ${participant.lastName ?? ''}`.trim() || 'Child'
        : 'Child';
      const childId = participant?.childId ?? 0;
      (booking.schedules ?? []).forEach((schedule) => {
        if (schedule.status === BOOKING_STATUS.CANCELLED) return;
        const dateStr =
          typeof schedule.date === 'string'
            ? schedule.date
            : moment(schedule.date).format('YYYY-MM-DD');
        if (dateStr < today) return;
        const startTime =
          (schedule as { startTime?: string; start_time?: string }).startTime ??
          (schedule as { start_time?: string }).start_time ??
          '';
        const endTime =
          (schedule as { endTime?: string; end_time?: string }).endTime ??
          (schedule as { end_time?: string }).end_time ??
          '';
        const trainerName = schedule.trainer?.name;
        const location = schedule.location ?? null;
        const activities =
          schedule.activities?.map((a: { name: string }) => a.name) ?? [];
        items.push({
          scheduleId: String(schedule.id),
          date: dateStr,
          startTime,
          endTime,
          childName,
          childId,
          trainerName,
          location,
          activities,
          packageName: booking.package?.name ?? null,
        });
      });
    });
    items.sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      if (d !== 0) return d;
      return (a.startTime || '').localeCompare(b.startTime || '');
    });
    return items.slice(0, 5);
  }, [bookings]);

  // Sessions this week (for empty-state banner: "No sessions this week — book one?")
  const sessionsThisWeekCount = useMemo(() => {
    const start = moment().startOf('week');
    const end = moment().endOf('week');
    let count = 0;
    const confirmedPaid = bookings.filter(
      (b) => b.status === BOOKING_STATUS.CONFIRMED && b.paymentStatus === PAYMENT_STATUS.PAID,
    );
    confirmedPaid.forEach((booking) => {
      (booking.schedules ?? []).forEach((schedule) => {
        if (schedule.status === BOOKING_STATUS.CANCELLED) return;
        const dateStr =
          typeof schedule.date === 'string'
            ? schedule.date
            : moment(schedule.date).format('YYYY-MM-DD');
        const m = moment(dateStr);
        if (m.isBetween(start, end, undefined, '[]')) count++;
      });
    });
    return count;
  }, [bookings]);

  // Total remaining hours across approved children (for empty-state: only show "book one?" when they have hours)
  const totalRemainingHoursForBanner = useMemo(() => {
    const confirmedPaid = bookings.filter(
      (b) => b.status === BOOKING_STATUS.CONFIRMED && b.paymentStatus === PAYMENT_STATUS.PAID,
    );
    let total = 0;
    approvedChildren.forEach((child) => {
      const childBookings = confirmedPaid.filter((b) =>
        (b.participants ?? []).some((p) => p.childId === child.id),
      );
      if (childBookings.length === 0) return;
      const latest = [...childBookings].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];
      const th = latest.totalHours ?? 0;
      const bh = latest.bookedHours ?? 0;
      total += Math.max(0, th - bh);
    });
    return total;
  }, [approvedChildren, bookings]);

  // Show first 6 approved children by default (better for many children), or all if toggled
  const INITIAL_APPROVED_DISPLAY = 6;
  const displayedApprovedChildren = showAllApprovedChildren 
    ? approvedChildren 
    : approvedChildren.slice(0, INITIAL_APPROVED_DISPLAY);
  const hasMoreApprovedChildren = approvedChildren.length > INITIAL_APPROVED_DISPLAY;

  // Auto-refresh: Check for children with completed checklists but still pending
  // This helps catch cases where auto-approval happened but frontend hasn't refreshed
  // NOTE: Removed aggressive 10-second polling - use visibility/focus refresh instead (already handled by useAuth)
  // The visibility/focus refresh mechanism (lines 697-749) is sufficient for keeping data fresh
  useEffect(() => {
    // Kept for reference, but polling is now handled by useAuth hook
    // This reduces unnecessary API calls and improves performance
  }, [children, refresh]);

  // Show first 3 pending children by default, or all if toggled
  const INITIAL_PENDING_DISPLAY = 3;
  const displayedPendingChildren = showAllPendingChildren 
    ? pendingChildrenSorted 
    : pendingChildrenSorted.slice(0, INITIAL_PENDING_DISPLAY);
  const hasMorePendingChildren = pendingChildrenSorted.length > INITIAL_PENDING_DISPLAY;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const packageSlug = searchParams.get('package');
      const childId = searchParams.get('childId');
      const redirectPath = '/dashboard/parent' + (packageSlug ? `?package=${encodeURIComponent(packageSlug)}${childId ? `&childId=${childId}` : ''}` : '');
      router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    // Redirect trainers to their dashboard
    if (!loading && user && user.role === USER_ROLE.TRAINER) {
      router.push('/dashboard/trainer');
      return;
    }
  }, [loading, isAuthenticated, user, router, searchParams]);

  // Only consider initial load complete when ALL of auth, bookings, stats and session notes have finished their first load.
  // This prevents showing dashboard content with partial/stale data (e.g. "0 booked" or empty sidebar then it updates).
  // Single memoized dependency keeps useEffect dependency array length constant (avoids React "changed size between renders" error).
  const initialLoadFlags = useMemo(
    () => ({ hasInitialLoadCompleted, loading, bookingsLoading, statsLoading, sessionNotesLoading }),
    [hasInitialLoadCompleted, loading, bookingsLoading, statsLoading, sessionNotesLoading],
  );
  useEffect(() => {
    if (initialLoadFlags.hasInitialLoadCompleted) return;
    if (!initialLoadFlags.loading && !initialLoadFlags.bookingsLoading && !initialLoadFlags.statsLoading && !initialLoadFlags.sessionNotesLoading) {
      setHasInitialLoadCompleted(true);
      setIsInitialLoad(false);
      setIsRefreshing(false);
    }
  }, [initialLoadFlags]);

  // Children summary is now handled inside the right sidebar (hours + alerts).

  // Show skeleton until the first full load has completed (do not show data before everything has loaded)
  const shouldShowSkeleton = !hasInitialLoadCompleted;
  if (shouldShowSkeleton) {
    // If loading has timed out, show error instead of infinite skeleton
    if (loadingTimeout) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
          <div className="max-w-md text-center">
            <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Loading Timeout</h1>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              The dashboard is taking too long to load. This might be due to a slow API response or network issue.
            </p>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Debug: loading={loading}, bookingsLoading={bookingsLoading}, bookingsError={bookingsError || 'none'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()} variant="primary">
                Reload Page
              </Button>
              <Button onClick={() => router.push(ROUTES.LOGIN)} variant="secondary">
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div aria-busy="true" aria-label="Loading dashboard">
        <DashboardSkeleton variant="parent" />
      </div>
    );
  }

  if (!user || !stats) {
    return null;
  }

  const getStatusBanner = () => {
if (user.approval_status === APPROVAL_STATUS.PENDING) {
        return {
        type: 'warning',
        icon: AlertCircle,
        title: 'Account Pending Approval',
        message: 'Your registration is pending admin approval. You\'ll be notified once approved.',
      };
    }
    
    if (user.approval_status === APPROVAL_STATUS.REJECTED) {
      return {
        type: 'error',
        icon: XCircle,
        title: 'Account Not Approved',
        message: user.rejection_reason || 'Your registration was not approved. Please contact us for more information.',
      };
    }
    
    if (user.approval_status === APPROVAL_STATUS.APPROVED && !hasApprovedChildren) {
      return {
        type: 'info',
        icon: Users,
        title: 'Add Children to Get Started',
        message: 'Your account is approved! Add children and complete their checklists to book packages.',
      };
    }
    
    return {
      type: 'success',
      icon: CheckCircle,
      title: 'Account Approved',
      message: 'You can now book packages and services!',
    };
  };

  const statusBanner = getStatusBanner();
  const StatusIcon = statusBanner.icon;

  // Get dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get parent name (from user)
  const parentName = user?.name || 'Parent';

  // Adaptive spacing: mobile compact, tablet/desktop normal, large desktop (1920+) more spacing
  const spacingClasses = {
    compact: 'gap-4 sm:gap-6 md:gap-8',
    normal: 'gap-6 sm:gap-8 lg:gap-10 2xl:gap-12',
    comfortable: 'gap-8 lg:gap-10 2xl:gap-12 min-[1920px]:gap-16',
  }[responsive.spacing];

  const paddingClasses = {
    small: 'px-5 sm:px-6 py-5 sm:py-6',
    medium: 'px-6 sm:px-8 md:px-10 py-6 sm:py-8 md:py-10',
    large: 'px-8 sm:px-10 md:px-[40px] py-8 sm:py-10 md:py-[40px]',
  }[responsive.padding];

  const mobileTab = searchParams.get('tab');
  const activeMobileTab = mobileTab === 'hours' ? 'hours' : mobileTab === 'alerts' ? 'alerts' : 'upcoming';

  return (
    <section className={`space-y-10 ${paddingClasses}`}>
      {/* Page header – hidden on mobile (< md); shown on tablet/desktop */}
      <header className="border-b border-slate-200 dark:border-slate-800 pb-6 hidden md:block">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 truncate">
              {getGreeting()}, {parentName.split(' ')[0]}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5" title="Sessions scheduled this week">
                <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden />
                {sessionsThisWeekCount} session{sessionsThisWeekCount !== 1 ? 's' : ''} booked this week
              </span>
              <span className="hidden sm:inline w-px h-4 bg-slate-200 dark:bg-slate-600" aria-hidden />
              <span className="flex items-center gap-1.5" title="Hours you can still use to book sessions">
                <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />
                {totalRemainingHoursForBanner.toFixed(1)}h left to book
              </span>
              <span className="hidden sm:inline w-px h-4 bg-slate-200 dark:bg-slate-600" aria-hidden />
              <span className="flex items-center gap-1.5" title="Children on your account (approved to book)">
                <Users className="w-3.5 h-3.5 shrink-0" aria-hidden />
                {approvedChildren.length} child{approvedChildren.length !== 1 ? 'ren' : ''} on account
              </span>
            </div>
            {isRefreshing && (
              <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                <RefreshCw size={12} className="animate-spin shrink-0" aria-hidden />
                Syncing…
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button onClick={() => setShowAddChildModal(true)} variant="outline" size="sm" icon={<UserPlus size={14} className="sm:h-4 sm:w-4" />} className="text-xs sm:text-sm">Add child</Button>
            {allChildrenHaveActivePackages ? (
              <div className="group relative">
                <Button onClick={() => { setShowBuyHoursModal(true); setBuyHoursChildId(undefined); }} variant="secondary" size="sm" icon={<Package size={14} className="sm:h-4 sm:w-4" />} className="cursor-not-allowed text-xs opacity-60 sm:text-sm" disabled title="All children have active packages.">Buy Hours</Button>
              </div>
            ) : (
              <Button onClick={() => { setShowBuyHoursModal(true); setBuyHoursChildId(undefined); }} variant="primary" size="sm" icon={<Package size={14} className="sm:h-4 sm:w-4" />} className="text-xs sm:text-sm">Buy Hours</Button>
            )}
            <Button onClick={() => setShowSessionNotesModal(true)} variant="outline" size="sm" icon={<FileText size={14} className="sm:h-4 sm:w-4" />} className="text-xs sm:text-sm" title="Summary notes from your child’s trainer after each session (activity logs are visible live and after the session)"><span className="hidden sm:inline">Trainer notes</span><span className="sm:hidden">Notes</span></Button>
            <span className="hidden sm:inline-block w-px h-6 bg-slate-200 dark:bg-slate-700" aria-hidden />
            <button type="button" onClick={() => setShowSafeguardingModal(true)} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 rounded-lg inline-flex items-center gap-1.5 py-1.5 px-2 -m-1.5">
              <ShieldAlert size={14} className="sm:h-4 sm:w-4 shrink-0" /><span className="hidden sm:inline">Report a concern</span><span className="sm:hidden">Concern</span>
            </button>
            <div className="relative">
              <button type="button" onClick={() => setShowKeyboardShortcutsHint((v) => !v)} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Keyboard shortcuts" aria-expanded={showKeyboardShortcutsHint}>
                <Keyboard size={18} className="sm:h-5 sm:w-5" aria-hidden />
              </button>
              {showKeyboardShortcutsHint && (
                <>
                  <div className="fixed inset-0 z-40" aria-hidden onClick={() => setShowKeyboardShortcutsHint(false)} />
                  <div className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl py-2 px-3" role="dialog" aria-label="Keyboard shortcuts">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">Keyboard shortcuts</p>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <li><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">N</kbd> New booking</li>
                      <li><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">H</kbd> Jump to hours</li>
                      <li><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">→</kbd> Previous / next month</li>
                      <li><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Esc</kbd> Close modals</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content: Mobile = calendar first (order-1), sidebar below (order-2). Desktop = calendar left, sidebar right. */}
      <div className={`mb-8 flex flex-col lg:flex-row ${spacingClasses}`}>
        {/* Main Calendar - Primary focus: on mobile order-1 (top, calendar-first); on lg order-1 (left). */}
        <div className="order-1 min-w-0 flex-1 lg:order-1">
          {/* Empty-state: no sessions this week but has hours — nudge to book */}
          {approvedChildren.length > 0 &&
            totalRemainingHoursForBanner > 0 &&
            sessionsThisWeekCount === 0 && (
              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  No sessions this week — book one?
                </p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  You have {totalRemainingHoursForBanner.toFixed(1)}h left. Tap below to schedule a session.
                </p>
                <Button
                  onClick={() => handleBookSession(approvedChildren[0].id)}
                  variant="primary"
                  size="sm"
                  className="mt-3"
                  icon={<CalendarPlus size={14} />}
                >
                  Book session
                </Button>
              </div>
            )}

          {/* Mobile: greeting at top, then calendar + tabs */}
          <div className="lg:hidden">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 px-2 pb-2 pt-0">
              {getGreeting()}, {parentName.split(' ')[0]}
            </h1>
            <div className="parent-schedule-root flex flex-col bg-white dark:bg-slate-900 max-w-md mx-auto rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
              <header className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                <p className="text-gray-600 dark:text-slate-400 text-xs">
                  Tap a date to book or view sessions
                </p>
              </header>
              <div className="px-4 pt-2 pb-1">
                <ChildrenFilter
                  children={filterableChildrenWithHours}
                  selectedIds={visibleChildIds}
                  onChange={setVisibleChildIds}
                  hideWhenSingle={true}
                  newChildIds={newChildIds}
                  expiredChildIds={expiredChildIds}
                />
              </div>
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                <CalendarRangeToolbar
                  period={calendarPeriod}
                  setPeriod={setCalendarPeriod}
                  anchor={calendarAnchor}
                  setAnchor={handleCalendarAnchorChange}
                  periodSelectId="parent-calendar-period"
                  periodSelectLabel="Calendar period"
                  showWeekShortcuts={true}
                />
              </div>
              <div className="flex-1 overflow-hidden px-1 min-h-[280px]">
                <ChildrenActivitiesCalendar
                  bookings={bookings}
                  onDateClick={handleCalendarDateClick}
                  onSessionClick={handleCalendarSessionClick}
                  selectedDate={selectedCalendarDate}
                  onDateChange={handleDayViewDateChange}
                  switchToDayView={switchToDayView}
                  currentMonth={currentCalendarMonth}
                  onMonthChange={handleCalendarMonthChange}
                  onWeekRangeChange={handleWeekRangeChange}
                  visibleChildIds={visibleChildIds}
                  filterableChildren={approvedChildren.map((c) => ({ id: c.id, name: c.name }))}
                  onFilterChange={setVisibleChildIds}
                  onUnavailableDateClick={(_date, reason) => {
                    toastManager.error(getMessageForDateReason(reason, { now: moment() }));
                  }}
                  showCompactView={responsive.showCompactView}
                  spacing={responsive.spacing}
                  onBulkCancel={handleBulkCancel}
                  onRescheduleRequest={handleRescheduleRequest}
                  newChildIds={newChildIds}
                  onBuyHoursForChild={handleBuyHours}
                  calendarPeriod={calendarPeriod}
                  calendarAnchor={calendarAnchor}
                />
              </div>

              {/* Tabs: UPCOMING | HOURS | ALERTS */}
              <div className="border-t border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-3">
                  <Link
                    href="/dashboard/parent"
                    className={`flex items-center justify-center py-3 text-xs font-semibold uppercase tracking-wide min-h-[44px] border-b-2 transition-colors ${
                      activeMobileTab === 'upcoming'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Upcoming
                  </Link>
                  <Link
                    href="/dashboard/parent?tab=hours"
                    className={`flex items-center justify-center py-3 text-xs font-semibold uppercase tracking-wide min-h-[44px] border-b-2 transition-colors ${
                      activeMobileTab === 'hours'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Hours
                  </Link>
                  <Link
                    href="/dashboard/parent?tab=alerts"
                    className={`flex items-center justify-center py-3 text-xs font-semibold uppercase tracking-wide min-h-[44px] border-b-2 transition-colors ${
                      activeMobileTab === 'alerts'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Alerts
                  </Link>
                </div>

                {/* Tab content */}
                <div className="p-4 min-h-[180px] overflow-y-auto max-h-[50vh]">
                  {activeMobileTab === 'upcoming' && (
                    <div className="space-y-4">
                      {upcomingSessionsForSidebar.length > 0 ? (
                        <>
                          <div>
                            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Next session</h3>
                            {(() => {
                              const s = upcomingSessionsForSidebar[0];
                              const dateLabel = moment(s.date).format('ddd, MMM D');
                              const timeLabel = s.startTime ? moment(s.startTime, ['HH:mm', 'HH:mm:ss']).format('h:mm A') : '';
                              return (
                                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-4">
                                  <p className="font-semibold text-slate-900 dark:text-slate-100">{s.childName}</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{dateLabel} · {timeLabel}</p>
                                  {s.trainerName && <p className="text-sm text-slate-500 dark:text-slate-400">with {s.trainerName}</p>}
                                  <div className="flex gap-2 mt-3">
                                    <Button variant="primary" size="sm" onClick={() => handleUpcomingSessionClick({ scheduleId: s.scheduleId, childName: s.childName, childId: s.childId })}>View details</Button>
                                    <Button variant="outline" size="sm" onClick={() => handleBookSession(s.childId)}>Reschedule</Button>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                          <div>
                            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Upcoming sessions</h3>
                            <ul className="space-y-2">
                              {upcomingSessionsForSidebar.slice(1, 6).map((s) => {
                                const dateLabel = moment(s.date).format('MMM D · ddd');
                                const timeLabel = s.startTime ? moment(s.startTime, ['HH:mm', 'HH:mm:ss']).format('h:mma') : '';
                                return (
                                  <li key={s.scheduleId}>
                                    <button type="button" onClick={() => handleUpcomingSessionClick({ scheduleId: s.scheduleId, childName: s.childName, childId: s.childId })} className="w-full text-left rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                      <span className="font-medium text-slate-900 dark:text-slate-100">{dateLabel} · {timeLabel}</span>
                                      <span className="block text-sm text-slate-500 dark:text-slate-400">{s.childName}{s.trainerName ? ` · ${s.trainerName}` : ''}</span>
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming sessions. Book one to get started.</p>
                      )}
                    </div>
                  )}
                  {activeMobileTab === 'hours' && (
                    <div className="space-y-4">
                      <div className="text-center py-2">
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalRemainingHoursForBanner.toFixed(1)}h</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">left to book sessions</p>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(100, (totalRemainingHoursForBanner / Math.max(totalRemainingHoursForBanner + (stats?.totalHoursBooked ?? 0), 1)) * 100)}%` }} />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{(stats?.totalHoursBooked ?? 0).toFixed(1)}h used · {(totalRemainingHoursForBanner + (stats?.totalHoursBooked ?? 0)).toFixed(1)}h total</p>
                      <div className="space-y-2">
                        {approvedChildren.map((c) => {
                          const rem = bookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED && b.paymentStatus === PAYMENT_STATUS.PAID && b.participants?.some(p => p.childId === c.id)).reduce((sum, b) => sum + (b.remainingHours ?? 0), 0);
                          const total = bookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED && b.paymentStatus === PAYMENT_STATUS.PAID && b.participants?.some(p => p.childId === c.id)).reduce((sum, b) => sum + (b.totalHours ?? 0), 0) || rem;
                          const hasActivePackage = childIdsWithActivePackage?.has(c.id);
                          const needsTopUp = hasActivePackage && rem <= 0;
                          const needsBuyHours = !hasActivePackage;
                          const actionLabel = needsBuyHours ? ' (Buy hours)' : needsTopUp ? ' (Top up)' : null;
                          return (
                            <div key={c.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900 dark:text-slate-100">{c.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {rem.toFixed(1)}h left of {total.toFixed(1)}h{actionLabel ? <span className="font-medium text-slate-600 dark:text-slate-300">{actionLabel}</span> : null}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {!hasActivePackage ? (
                                  <Button variant="primary" size="sm" onClick={() => handleBuyHours(c.id)}>Buy hours</Button>
                                ) : rem <= 0 ? (
                                  <Button variant="primary" size="sm" onClick={() => handleOpenTopUp(c.id)}>Top up</Button>
                                ) : (
                                  <>
                                    <Button variant="outline" size="sm" onClick={() => handleBookSession(c.id)}>Book</Button>
                                    <Button variant="outline" size="sm" onClick={() => handleOpenTopUp(c.id)}>Top up</Button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {activeMobileTab === 'alerts' && (
                    <div className="space-y-2">
                      {(childrenNeedingChecklistForSidebar?.length ?? 0) > 0 && (
                        <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20 p-3">
                          <p className="font-semibold text-amber-800 dark:text-amber-200">Checklist needed</p>
                          <p className="text-sm text-amber-700 dark:text-amber-300">Complete checklist for: {childrenNeedingChecklistForSidebar?.map(c => c.name).join(', ')}</p>
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => childrenNeedingChecklistForSidebar?.[0] && handleCompleteChecklist(childrenNeedingChecklistForSidebar[0].id)}>Complete</Button>
                        </div>
                      )}
                      {hasDraftOrUnpaidActivePackage && (
                        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-3">
                          <p className="font-semibold text-red-800 dark:text-red-200">Payment required</p>
                          <p className="text-sm text-red-700 dark:text-red-300">Complete payment for your booking to confirm sessions.</p>
                          <Button variant="primary" size="sm" className="mt-2" onClick={() => { if (firstUnpaidBooking) { setSelectedPaymentBooking(firstUnpaidBooking); setShowPaymentModal(true); } }}>Pay now</Button>
                        </div>
                      )}
                      {approvedChildren.some(c => !childIdsWithActivePackage?.has(c.id)) && (
                        <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-3">
                          <p className="font-semibold text-blue-800 dark:text-blue-200">Buy hours</p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">Some children don't have an active package.</p>
                          <Button variant="primary" size="sm" className="mt-2" onClick={() => setShowBuyHoursModal(true)}>Buy hours</Button>
                        </div>
                      )}
                      {((childrenNeedingChecklistForSidebar?.length ?? 0) === 0 && !hasDraftOrUnpaidActivePackage && !approvedChildren.some(c => !childIdsWithActivePackage?.has(c.id))) && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">No alerts right now.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FAB speed-dial: Book session, Add child, Session notes, Report concern, Buy Hours */}
            <div className="lg:hidden fixed bottom-20 right-4 z-20 flex flex-col items-end gap-2">
              {fabOpen && (
                <>
                  <div className="fixed inset-0 z-20 bg-black/20" aria-hidden onClick={() => setFabOpen(false)} />
                  <div className="relative z-30 flex flex-col gap-2 pb-2">
                    <button type="button" onClick={() => { setFabOpen(false); handleBookSession(approvedChildren[0]?.id ?? 0); }} className="flex items-center gap-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg pl-4 pr-5 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-100 min-h-[44px] whitespace-nowrap">
                      <CalendarPlus className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                      Book session
                    </button>
                    <button type="button" onClick={() => { setFabOpen(false); setShowAddChildModal(true); }} className="flex items-center gap-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg pl-4 pr-5 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-100 min-h-[44px] whitespace-nowrap">
                      <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                      Add child
                    </button>
                    <button type="button" onClick={() => { setFabOpen(false); setShowSessionNotesModal(true); }} className="flex items-center gap-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg pl-4 pr-5 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-100 min-h-[44px] whitespace-nowrap">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                      Trainer notes
                    </button>
                    <button type="button" onClick={() => { setFabOpen(false); setShowSafeguardingModal(true); }} className="flex items-center gap-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg pl-4 pr-5 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-100 min-h-[44px] whitespace-nowrap">
                      <ShieldAlert className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                      Report a concern
                    </button>
                    <button type="button" onClick={() => { setFabOpen(false); setShowBuyHoursModal(true); setBuyHoursChildId(undefined); }} className="flex items-center gap-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg pl-4 pr-5 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-100 min-h-[44px] whitespace-nowrap">
                      <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                      Buy Hours
                    </button>
                    <button type="button" onClick={() => { setFabOpen(false); const firstWithPackage = approvedChildren.find(c => childIdsWithActivePackage?.has(c.id)); if (firstWithPackage) handleOpenTopUp(firstWithPackage.id); else { toastManager.info('No active package to top up. Buy hours first.'); setShowBuyHoursModal(true); } }} className="flex items-center gap-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg pl-4 pr-5 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-100 min-h-[44px] whitespace-nowrap">
                      <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                      Top up
                    </button>
                  </div>
                </>
              )}
              <button
                type="button"
                onClick={() => setFabOpen((o) => !o)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-transform min-w-[44px] min-h-[44px]"
                aria-label={fabOpen ? 'Close menu' : 'Quick actions'}
                aria-expanded={fabOpen}
              >
                <Plus className={`h-6 w-6 transition-transform ${fabOpen ? 'rotate-45' : ''}`} />
              </button>
            </div>
          </div>

          {/* Desktop / tablet calendar */}
          <div className="hidden lg:block">
            <div className="mb-3 flex justify-end">
              <ChildrenFilter
                children={filterableChildrenWithHours}
                selectedIds={visibleChildIds}
                onChange={setVisibleChildIds}
                hideWhenSingle={true}
                newChildIds={newChildIds}
                expiredChildIds={expiredChildIds}
              />
            </div>
            <div className="mb-3">
              <CalendarRangeToolbar
                period={calendarPeriod}
                setPeriod={setCalendarPeriod}
                anchor={calendarAnchor}
                setAnchor={handleCalendarAnchorChange}
                periodSelectId="parent-calendar-period-desktop"
                periodSelectLabel="Calendar period"
                showWeekShortcuts={true}
              />
            </div>
            <ChildrenActivitiesCalendar
              bookings={bookings}
              onDateClick={handleCalendarDateClick}
              onSessionClick={handleCalendarSessionClick}
              selectedDate={selectedCalendarDate}
              onDateChange={handleDayViewDateChange}
              switchToDayView={switchToDayView}
              currentMonth={currentCalendarMonth}
              onMonthChange={handleCalendarMonthChange}
              onWeekRangeChange={handleWeekRangeChange}
              visibleChildIds={visibleChildIds}
              filterableChildren={approvedChildren.map((c) => ({ id: c.id, name: c.name }))}
              onFilterChange={setVisibleChildIds}
              onUnavailableDateClick={(_date, reason) => {
                toastManager.error(getMessageForDateReason(reason, { now: moment() }));
              }}
              showCompactView={responsive.showCompactView}
              spacing={responsive.spacing}
              onBulkCancel={handleBulkCancel}
              onRescheduleRequest={handleRescheduleRequest}
              newChildIds={newChildIds}
              onBuyHoursForChild={handleBuyHours}
              calendarPeriod={calendarPeriod}
              calendarAnchor={calendarAnchor}
            />
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Buy Hours Modal */}
      <BuyHoursModal
        isOpen={showBuyHoursModal}
        onClose={() => {
          setShowBuyHoursModal(false);
          setBuyHoursChildId(undefined);
          setBuyHoursInitialPackageSlug(null);
        }}
        initialPackageSlug={buyHoursInitialPackageSlug ?? undefined}
        child={buyHoursChildId ? approvedChildren.find(c => c.id === buyHoursChildId) || null : null}
        children={approvedChildren}
        bookings={bookings}
        user={user ?? null}
        onDraftBookingCreated={(booking) => {
          setSelectedPaymentBooking(booking);
          setShowPaymentModal(true);
          setShowBuyHoursModal(false);
          setBuyHoursChildId(undefined);
        }}
        onConfirm={() => {
          setShowBuyHoursModal(false);
          setBuyHoursChildId(undefined);
          setBuyHoursInitialPackageSlug(null);
          router.push('/dashboard/parent');
        }}
        onOpenTopUp={(childId) => {
          handleOpenTopUp(childId);
        }}
      />

      {/* Complete Checklist Modal */}
      <CompleteChecklistModal
        isOpen={showChecklistModal}
        onClose={() => {
          setShowChecklistModal(false);
          setChecklistChildId(undefined);
        }}
        child={checklistChildId ? children.find(c => c.id === checklistChildId) || null : null}
        onSubmit={handleChecklistSubmit}
      />

      {/* Complete Payment Modal */}
      {selectedPaymentBooking && (
        <CompletePaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPaymentBooking(null);
            // Refetch bookings so sidebar shows pending payment (draft) without hard refresh
            refetchBookings();
          }}
          booking={selectedPaymentBooking}
          onPaymentComplete={handlePaymentComplete}
          onPaymentFailed={handlePaymentFailed}
        />
      )}

      {/* Booking: right-side panel (reuses sidebar space; no modal overlay) */}
      <ParentBookingModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setBookingModalDate(undefined);
          setBookingModalTime(undefined);
          setBookingModalChildId(undefined);
          setEditingSession(null);
        }}
        onSubmit={handleBookingSave}
        preSelectedDate={bookingModalDate}
        preSelectedTime={bookingModalTime}
        preSelectedChildId={bookingModalChildId}
        children={childrenForBookingModal}
        existingBooking={editingSession ? {
          scheduleId: editingSession.scheduleId,
          date: editingSession.date,
          startTime: editingSession.startTime,
          endTime: editingSession.endTime,
          childId: editingSession.childId,
          activities: editingSession.activities,
          notes: editingSession.notes,
          location: editingSession.location,
        } : undefined}
        renderAsPanel
        onBuyMoreHours={(childId) => {
          handleBuyHours(childId);
        }}
        onTopUp={(childId) => {
          handleOpenTopUp(childId);
        }}
        onAddChild={() => {
          setShowBookingModal(false);
          setShowAddChildModal(true);
        }}
      />

      {/* Session Detail – side panel */}
      <SessionDetailModal
        isOpen={showSessionModal}
        onClose={() => {
          setShowSessionModal(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        onEdit={handleSessionEdit}
        onCancel={handleSessionCancel}
        variant="sidepanel"
        otherSessionsOnDayCount={
          selectedSession
            ? bookings.reduce((count, booking) => {
                if (
                  booking.status !== 'confirmed' ||
                  booking.paymentStatus !== 'paid'
                ) {
                  return count;
                }
                const schedules = booking.schedules ?? [];
                const sameDayCount = schedules.filter((schedule) => {
                  const dateStr =
                    typeof schedule.date === 'string'
                      ? schedule.date
                      : moment(schedule.date).format('YYYY-MM-DD');
                  return dateStr === selectedSession.date;
                }).length;
                return count + sameDayCount;
              }, 0)
            : undefined
        }
        sessionsOnSameDay={
          selectedSession
            ? (() => {
                const sessions: NonNullable<typeof selectedSession & { childId: number }>[] =
                  [];
                bookings.forEach((booking) => {
                  if (
                    booking.status !== 'confirmed' ||
                    booking.paymentStatus !== 'paid'
                  ) {
                    return;
                  }
                  (booking.schedules ?? []).forEach((schedule) => {
                    const dateStr =
                      typeof schedule.date === 'string'
                        ? schedule.date
                        : moment(schedule.date).format('YYYY-MM-DD');
                    if (dateStr !== selectedSession.date) {
                      return;
                    }
                    const startTime =
                      schedule.startTime ??
                      (schedule as { start_time?: string }).start_time ??
                      '';
                    const endTime =
                      schedule.endTime ??
                      (schedule as { end_time?: string }).end_time ??
                      '';

                    // Derive a friendly child name from booking participants when needed
                    const childName =
                      selectedSession.childId &&
                      booking.participants?.some(
                        (p) => p.childId === selectedSession.childId,
                      )
                        ? selectedSession.childName
                        : booking.participants?.[0]
                        ? `${booking.participants[0].firstName ?? ''} ${
                            booking.participants[0].lastName ?? ''
                          }`.trim() || 'Child'
                        : 'Child';

                    const childId =
                      booking.participants?.find(
                        (p) => p.childId === selectedSession.childId,
                      )?.childId ??
                      booking.participants?.[0]?.childId ??
                      selectedSession.childId;

                    sessions.push({
                      id: String(schedule.id),
                      date: dateStr,
                      startTime,
                      endTime,
                      childName,
                      childId: childId ?? 0,
                      activities:
                        schedule.activities?.map(
                          (a: { name: string }) => a.name,
                        ) ?? [],
                      bookingId:
                        typeof booking.id === 'string'
                          ? parseInt(booking.id, 10)
                          : Number(booking.id),
                      scheduleId: String(schedule.id),
                      isPast: selectedSession.isPast,
                      isOngoing: selectedSession.isOngoing,
                      isUpcoming: selectedSession.isUpcoming,
                      trainerName: schedule.trainer?.name,
                      trainerAssignmentStatus: (schedule as { trainerAssignmentStatus?: string }).trainerAssignmentStatus ?? null,
                      trainerPreferenceLabel: undefined,
                      requiresAdminApproval: schedule.requiresAdminApproval,
                      itineraryNotes: schedule.itineraryNotes ?? schedule.notes,
                    });
                  });
                });

                // Sort by start time so list is chronological
                return sessions.sort((a, b) =>
                  a.startTime.localeCompare(b.startTime),
                );
              })()
            : undefined
        }
      />

      {/* Booked Sessions Modal – which days are booked (Session Details) */}
      <BookedSessionsModal
        isOpen={showBookedSessionsModal}
        onClose={() => {
          setShowBookedSessionsModal(false);
          setSelectedBookingForModal(null);
          setSelectedChildNameForModal('');
        }}
        booking={selectedBookingForModal}
        childName={selectedChildNameForModal}
        onSessionCancelled={async () => {
          await refetchBookings();
          await refresh();
        }}
        onBookMoreSessions={() => {
          const childId = selectedBookingForModal?.participants?.[0]?.childId;
          if (childId != null) handleBookSession(childId);
        }}
        onEditSession={(scheduleId) => {
          const childId = selectedBookingForModal?.participants?.[0]?.childId;
          const session = findSessionByScheduleId(scheduleId, selectedChildNameForModal, childId);
          if (session) {
            handleSessionEdit(session);
            setShowBookedSessionsModal(false);
            setSelectedBookingForModal(null);
            setSelectedChildNameForModal('');
          }
        }}
      />

      {/* Settings Modal */}
      <ParentSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* Add Child Modal */}
      <AddChildModal
        isOpen={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
        onSuccess={handleAddChildSuccess}
      />

      {/* Session Notes List Modal */}
      <SessionNotesModal
        isOpen={showSessionNotesModal}
        onClose={() => setShowSessionNotesModal(false)}
        items={sessionNotesItems}
        onViewSession={(scheduleId, item) => {
          setShowSessionNotesModal(false);
          handleViewSessionNote(scheduleId, item);
        }}
      />

      {/* Safeguarding Concern Modal */}
      <SafeguardingConcernModal
        isOpen={showSafeguardingModal}
        onClose={() => setShowSafeguardingModal(false)}
        children={approvedChildren}
        onSubmit={handleSafeguardingSubmit}
      />
      {topUpBooking && topUpChildId !== null && (
        <TopUpModal
          isOpen={showTopUpModal}
          onClose={() => {
            setShowTopUpModal(false);
            setTopUpChildId(null);
            setTopUpBooking(null);
          }}
          childName={
            approvedChildren.find(c => c.id === topUpChildId)?.name ||
            selectedChildNameForModal ||
            'your child'
          }
          booking={topUpBooking}
          onProceedToPayment={handleTopUpProceedToPayment}
          isSubmitting={isTopUpSubmitting}
        />
      )}
    </section>
  );
}
