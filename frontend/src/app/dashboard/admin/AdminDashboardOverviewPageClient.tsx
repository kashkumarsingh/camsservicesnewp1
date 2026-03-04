'use client';

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CalendarDays, CalendarClock, ExternalLink, UserCheck, Users, BarChart2, UserPlus, PoundSterling, ClipboardList, UserCog, ShieldAlert } from "lucide-react";
import { useAuth } from "@/interfaces/web/hooks/auth/useAuth";
import { Breadcrumbs } from "@/components/dashboard/universal";
import { ROUTES } from "@/utils/routes";
import { useAdminDashboardStats } from "@/interfaces/web/hooks/dashboard/useAdminDashboardStats";
import { useAdminBookings } from "@/interfaces/web/hooks/admin/useAdminBookings";
import { useAdminTrainers } from "@/interfaces/web/hooks/admin/useAdminTrainers";
import { useLiveRefresh, useLiveRefreshContext } from "@/core/liveRefresh/LiveRefreshContext";
import { LIVE_REFRESH_ENABLED } from "@/utils/liveRefreshConstants";
import { apiClient } from "@/infrastructure/http/ApiClient";
import { API_ENDPOINTS } from "@/infrastructure/http/apiEndpoints";
import type { AdminBookingDTO } from "@/core/application/admin/dto/AdminBookingDTO";
import { getApiErrorMessage } from "@/utils/errorUtils";
import { ASSIGN_TRAINER_ERROR_FALLBACK } from "@/utils/appConstants";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { UnassignedSessionsModal } from "@/components/dashboard/admin/UnassignedSessionsModal";
import { PendingPaymentsModal } from "@/components/dashboard/admin/PendingPaymentsModal";
import { ZeroHoursModal } from "@/components/dashboard/admin/ZeroHoursModal";
import { NeedsAttentionModal, type NeedsAttentionItem } from "@/components/dashboard/admin/NeedsAttentionModal";
import { AdminDashboardRightSidebar } from "@/components/dashboard/admin/AdminDashboardRightSidebar";
import { AdminScheduleWeekGrid } from "@/components/dashboard/admin/AdminScheduleWeekGrid";
import { AdminTimesheetsGrid } from "@/components/dashboard/admin/AdminTimesheetsGrid";
import { AdminDashboardTrainersTab } from "@/components/dashboard/admin/AdminDashboardTrainersTab";
import { AdminDashboardFamiliesTab } from "@/components/dashboard/admin/AdminDashboardFamiliesTab";
import { AdminDashboardStatsTab } from "@/components/dashboard/admin/AdminDashboardStatsTab";
import { SessionDetailSidePanel } from "@/components/dashboard/admin/SessionDetailSidePanel";
import { TodaySessionsSidePanel } from "@/components/dashboard/admin/TodaySessionsSidePanel";
import { SessionLatestActivityPanel } from "@/components/dashboard/admin/SessionLatestActivityPanel";

interface AdminTodaySession {
  id: string;
  bookingId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  trainerName: string | null;
  bookingReference: string;
  parentName: string;
  childrenSummary: string;
  /** Child IDs for this session (from booking participants) – used for per-child filter. */
  childIds: string[];
  isUpcoming: boolean;
  isOngoing: boolean;
  isPast: boolean;
  /** Session location (venue/address). */
  location?: string | null;
  /** Last clock-in time (ISO 8601). */
  clockedInAt?: string | null;
  /** Last clock-out time (ISO 8601). */
  clockedOutAt?: string | null;
  /** Session completed at (ISO 8601). */
  completedAt?: string | null;
  /** Trainer-set "doing now" activity name (e.g. "Horse riding"). */
  currentActivityName?: string | null;
}

/** Format session time for display (HH:MM:SS → HH:MM). */
function formatSessionTime(t: string): string {
  return t && t.length >= 5 ? t.slice(0, 5) : t;
}

/** Format ISO 8601 datetime to HH:MM for clock in/out. */
function formatClockTime(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}

function buildAdminTodaySessions(bookings: AdminBookingDTO[], todayStr: string): AdminTodaySession[] {
  const now = new Date();

  const sessions: AdminTodaySession[] = [];

  bookings.forEach((booking) => {
    const childrenSummary =
      booking.children && booking.children.length > 0
        ? booking.children.map((c) => c.name).join(", ")
        : "No children recorded";
    const childIds = booking.children?.map((c) => c.id) ?? [];

    booking.sessions.forEach((session) => {
      if (!session.date || !session.startTime || !session.endTime) return;
      if (!session.date.startsWith(todayStr)) return;

      const start = new Date(`${session.date}T${session.startTime}`);
      const end = new Date(`${session.date}T${session.endTime}`);

      const timeInWindow = start <= now && now < end;
      const hasClockedIn = !!session.clockedInAt;
      const hasClockedOut = !!session.clockedOutAt;
      const isOngoing = timeInWindow && hasClockedIn && !hasClockedOut;
      const isUpcoming = now < start;
      const isPast = now >= end;

      sessions.push({
        id: session.id,
        bookingId: booking.id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        trainerName: session.trainerName,
        bookingReference: booking.reference,
        parentName: booking.parentName,
        childrenSummary,
        childIds,
        isUpcoming,
        isOngoing,
        isPast,
        location: session.location ?? null,
        clockedInAt: session.clockedInAt ?? null,
        clockedOutAt: session.clockedOutAt ?? null,
        completedAt: session.completedAt ?? null,
        currentActivityName: session.currentActivityName ?? null,
      });
    });
  });

  sessions.sort((a, b) => {
    const aKey = `${a.date}T${a.startTime}`;
    const bKey = `${b.date}T${b.startTime}`;
    return aKey.localeCompare(bKey);
  });

  return sessions;
}

/** Returns time-of-day greeting (Good morning / afternoon / evening). */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export const AdminDashboardOverviewPageClient: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { stats, loading, error, refetch: refetchStats } = useAdminDashboardStats();
  const { trainers: trainersForAssign } = useAdminTrainers({ is_active: true, limit: 100 });
  const [assigningSessionId, setAssigningSessionId] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [hasInitialLoadCompleted, setHasInitialLoadCompleted] = useState(false);
  /** "All children" when empty string; otherwise filter Latest activity by this child ID. */
  const [latestActivityChildFilter, setLatestActivityChildFilter] = useState<string>("");
  const [showAllLatestActivity, setShowAllLatestActivity] = useState(false);
  /** Dashboard tabs: Schedule (primary), Trainers, Families, Stats, Timesheets */
  const [activeTab, setActiveTab] = useState<'schedule' | 'trainers' | 'families' | 'stats' | 'timesheets'>('schedule');
  /** Modals opened from alert bar */
  const [modalNeedsAttentionList, setModalNeedsAttentionList] = useState(false);
  const [modalUnassigned, setModalUnassigned] = useState(false);
  const [modalPendingPayments, setModalPendingPayments] = useState(false);
  const [modalZeroHours, setModalZeroHours] = useState(false);
  const [sessionPanel, setSessionPanel] = useState<{
    sessionId: string;
    bookingId: string;
    focusOnActivity?: boolean;
  } | null>(null);
  const [showTodaySessionsPanel, setShowTodaySessionsPanel] = useState(false);

  // Local calendar date (YYYY-MM-DD) so "today's sessions" matches the admin's date
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);
  const {
    bookings: todayBookings,
    loading: todayBookingsLoading,
    error: todayBookingsError,
    fetchBookings: refetchTodayBookings,
    getBooking: getBookingForPanel,
    updateNotes: updateBookingNotes,
  } = useAdminBookings({
    status: "confirmed",
    payment_status: "paid",
    session_date_from: today,
    session_date_to: today,
    limit: 200,
  });

  const liveRefreshContext = useLiveRefreshContext();

  // Show skeleton until both stats and today's bookings have finished first load (avoids empty KPIs then data popping in)
  useEffect(() => {
    if (hasInitialLoadCompleted) return;
    if (!loading && !todayBookingsLoading) {
      setHasInitialLoadCompleted(true);
    }
  }, [hasInitialLoadCompleted, loading, todayBookingsLoading]);

  const handleAssignTrainer = useCallback(
    async (sessionId: string, trainerId: string) => {
      if (!trainerId) return;
      setAssignError(null);
      setAssigningSessionId(sessionId);
      try {
        await apiClient.put(
          API_ENDPOINTS.ADMIN_BOOKING_ASSIGN_TRAINER(sessionId),
          { trainer_id: trainerId }
        );
        liveRefreshContext?.invalidate("notifications");
        liveRefreshContext?.invalidate("bookings");
        liveRefreshContext?.invalidate("trainer_schedules");
        await refetchStats();
      } catch (err) {
        setAssignError(getApiErrorMessage(err, ASSIGN_TRAINER_ERROR_FALLBACK));
      } finally {
        setAssigningSessionId(null);
      }
    },
    [refetchStats, liveRefreshContext]
  );

  const totalBookings = stats?.bookings.total ?? 0;
  const activeUsers = stats?.users.parentsApproved ?? 0;
  const activeTrainers = stats?.trainers.active ?? 0;
  const pendingSafeguarding = stats?.alerts.pendingSafeguardingConcerns ?? 0;
  const pendingParentApprovals = stats?.alerts.pendingParentApprovals ?? 0;
  const pendingChildChecklists = stats?.alerts.pendingChildChecklists ?? 0;
  const pendingTrainerApplications = stats?.alerts.pendingTrainerApplications ?? 0;
  const sessionsAwaitingTrainer = stats?.alerts.sessionsAwaitingTrainer ?? 0;

  const totalPendingDecisions =
    (stats?.bookings.pending ?? 0) +
    pendingParentApprovals +
    pendingChildChecklists +
    pendingTrainerApplications +
    sessionsAwaitingTrainer;
  const hasSafeguardingRisk = pendingSafeguarding > 0;
  const hasDecisionWork = totalPendingDecisions > 0;
  const hasAnyAttention = hasSafeguardingRisk || hasDecisionWork;

  const todaySessions = React.useMemo(
    () => buildAdminTodaySessions(todayBookings, today),
    [todayBookings, today],
  );

  /** Unique children from today's bookings (for Latest activity per-child filter). */
  const uniqueChildrenFromToday = React.useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; name: string }[] = [];
    todayBookings.forEach((b) => {
      b.children?.forEach((c) => {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          list.push({ id: c.id, name: c.name });
        }
      });
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [todayBookings]);

  /** Sessions to show in Latest activity (filtered by child if selected). */
  const latestActivitySessions = React.useMemo(() => {
    if (!latestActivityChildFilter) return todaySessions;
    return todaySessions.filter((s) => s.childIds.includes(latestActivityChildFilter));
  }, [todaySessions, latestActivityChildFilter]);

  const latestActivityDisplayCount = showAllLatestActivity ? latestActivitySessions.length : 5;
  const latestActivityToShow = latestActivitySessions.slice(0, latestActivityDisplayCount);
  const hasMoreLatestActivity = latestActivitySessions.length > 5 && !showAllLatestActivity;

  // Centralised live refresh: refetch when backend reports changes so Today's activity
  // (right sidebar In progress / Upcoming), schedule grid, needs attention, and stats stay in sync.
  // Requires Reverb: set NEXT_PUBLIC_LIVE_REFRESH_WEBSOCKET_ENABLED=true and run Reverb server.
  const adminOverviewRefetch = React.useCallback(() => {
    void Promise.all([
      Promise.resolve(refetchStats(true)),
      Promise.resolve(refetchTodayBookings(undefined, true)),
    ]);
  }, [refetchStats, refetchTodayBookings]);
  useLiveRefresh('bookings', adminOverviewRefetch, { enabled: LIVE_REFRESH_ENABLED });
  useLiveRefresh('trainer_schedules', adminOverviewRefetch, { enabled: LIVE_REFRESH_ENABLED });
  useLiveRefresh('children', adminOverviewRefetch, { enabled: LIVE_REFRESH_ENABLED });
  useLiveRefresh('notifications', adminOverviewRefetch, { enabled: LIVE_REFRESH_ENABLED });
  useLiveRefresh('trainer_availability', adminOverviewRefetch, { enabled: LIVE_REFRESH_ENABLED });

  const ongoingSessions = todaySessions.filter((s) => s.isOngoing);
  const upcomingSessions = todaySessions.filter((s) => s.isUpcoming);

  /** Session status stats for dashboard cards and alerts (completion, issues, no-shows). */
  const sessionStats = React.useMemo(() => {
    const past = todaySessions.filter((s) => s.isPast);
    const completed = past.filter((s) => (s.status ?? '').toLowerCase() === 'completed');
    const noShow = todaySessions.filter((s) => (s.status ?? '').toLowerCase() === 'no_show');
    const incomplete = past.filter(
      (s) =>
        (s.status ?? '').toLowerCase() !== 'completed' &&
        (s.status ?? '').toLowerCase() !== 'cancelled' &&
        (s.status ?? '').toLowerCase() !== 'no_show' &&
        !s.completedAt &&
        !s.clockedOutAt
    );
    const issues = noShow.length + incomplete.length;
    const completedDenom = completed.length + incomplete.length + noShow.length;
    const completionRatePct =
      completedDenom > 0 ? Math.round((completed.length / completedDenom) * 100) : null;
    return {
      completedToday: completed.length,
      incompleteToday: incomplete.length,
      noShowToday: noShow.length,
      issuesCount: issues,
      completionRatePct,
    };
  }, [todaySessions]);

  /** Open the pending-decisions list modal so the admin can choose which category to act on. */
  const handleReviewNeedsAttention = useCallback(() => {
    setModalNeedsAttentionList(true);
  }, []);

  /** Build the list of needs-attention categories with counts for the modal. */
  const needsAttentionItems: NeedsAttentionItem[] = useMemo(() => {
    const unassigned = stats?.alerts?.sessionsAwaitingTrainer ?? 0;
    const pendingPayments = stats?.alerts?.pendingPaymentsCount ?? 0;
    const zeroHours = stats?.alerts?.childrenWithZeroHoursCount ?? 0;
    const childChecklists = stats?.alerts?.pendingChildChecklists ?? 0;
    const pendingBookings = stats?.bookings?.pending ?? 0;
    const trainerApps = pendingTrainerApplications ?? 0;
    const parentApprovals = pendingParentApprovals ?? 0;
    const safeguarding = pendingSafeguarding ?? 0;

    const items: NeedsAttentionItem[] = [];
    if (unassigned > 0) {
      items.push({
        id: 'unassigned',
        count: unassigned,
        label: `${unassigned} session${unassigned !== 1 ? 's' : ''} need a trainer`,
        actionLabel: 'Assign',
        icon: UserPlus,
        kind: 'modal-unassigned',
      });
    }
    if (pendingPayments > 0) {
      items.push({
        id: 'pending-payments',
        count: pendingPayments,
        label: `${pendingPayments} pending payment${pendingPayments !== 1 ? 's' : ''}`,
        actionLabel: 'Review',
        icon: PoundSterling,
        kind: 'modal-pending-payments',
      });
    }
    if (zeroHours > 0) {
      items.push({
        id: 'zero-hours',
        count: zeroHours,
        label: `${zeroHours} child${zeroHours !== 1 ? 'ren' : ''} with 0 hours`,
        actionLabel: 'Contact parents',
        icon: Users,
        kind: 'modal-zero-hours',
      });
    }
    if (childChecklists > 0) {
      items.push({
        id: 'child-checklists',
        count: childChecklists,
        label: `${childChecklists} pending child checklist${childChecklists !== 1 ? 's' : ''}`,
        actionLabel: 'Review',
        icon: ClipboardList,
        kind: 'navigate',
        href: ROUTES.DASHBOARD_ADMIN_CHILDREN,
      });
    }
    if (pendingBookings > 0) {
      items.push({
        id: 'pending-bookings',
        count: pendingBookings,
        label: `${pendingBookings} pending booking${pendingBookings !== 1 ? 's' : ''}`,
        actionLabel: 'View',
        icon: CalendarDays,
        kind: 'navigate',
        href: ROUTES.DASHBOARD_ADMIN_BOOKINGS,
      });
    }
    if (parentApprovals > 0) {
      items.push({
        id: 'parent-approvals',
        count: parentApprovals,
        label: `${parentApprovals} pending parent approval${parentApprovals !== 1 ? 's' : ''}`,
        actionLabel: 'Review',
        icon: UserCheck,
        kind: 'navigate',
        href: `${ROUTES.DASHBOARD_ADMIN_PARENTS}?status=pending`,
      });
    }
    if (trainerApps > 0) {
      items.push({
        id: 'trainer-applications',
        count: trainerApps,
        label: `${trainerApps} pending trainer application${trainerApps !== 1 ? 's' : ''}`,
        actionLabel: 'Review',
        icon: UserCog,
        kind: 'navigate',
        href: ROUTES.DASHBOARD_ADMIN_TRAINER_APPLICATIONS,
      });
    }
    if (safeguarding > 0) {
      items.push({
        id: 'safeguarding',
        count: safeguarding,
        label: `${safeguarding} safeguarding concern${safeguarding !== 1 ? 's' : ''} pending`,
        actionLabel: 'View reports',
        icon: ShieldAlert,
        kind: 'navigate',
        href: ROUTES.DASHBOARD_ADMIN_REPORTS,
      });
    }
    return items;
  }, [
    stats?.alerts?.sessionsAwaitingTrainer,
    stats?.alerts?.pendingPaymentsCount,
    stats?.alerts?.childrenWithZeroHoursCount,
    stats?.alerts?.pendingChildChecklists,
    stats?.bookings?.pending,
    pendingTrainerApplications,
    pendingParentApprovals,
    pendingSafeguarding,
  ]);

  // Show skeleton until stats and today's bookings have loaded (avoids empty KPIs / list then data popping in)
  if (!hasInitialLoadCompleted) {
    return <DashboardSkeleton variant="admin" />;
  }

  const adminDisplayName = user?.name?.trim().split(/\s+/)[0] || 'Admin';
  const needsAttentionTotal =
    (stats?.alerts?.sessionsAwaitingTrainer ?? 0) +
    (stats?.alerts?.pendingPaymentsCount ?? 0) +
    (stats?.alerts?.childrenWithZeroHoursCount ?? 0) +
    (stats?.alerts?.pendingChildChecklists ?? 0) +
    (stats?.bookings?.pending ?? 0) +
    (pendingParentApprovals ?? 0) +
    (pendingTrainerApplications ?? 0) +
    (pendingSafeguarding ?? 0);
  const hasNeedsAttention = needsAttentionTotal > 0;

  return (
    <section className="space-y-4 overflow-x-hidden md:space-y-6">
      <Breadcrumbs
        items={[
          { label: "Admin", href: ROUTES.DASHBOARD_ADMIN },
          { label: "Overview" },
        ]}
      />
      {/* Page header – responsive typography */}
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 md:text-2xl xl:text-3xl">
          {getGreeting()}, {adminDisplayName}
        </h1>
        <p className="max-w-[65ch] text-sm text-slate-600 dark:text-slate-400">
          Schedule and today&apos;s sessions. Review items needing attention first.
        </p>
      </header>

      {(error || todayBookingsError) && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200" role="alert">
          {error || todayBookingsError}
        </div>
      )}

      {/* Single needs-attention strip – one purpose, one primary CTA (Google Calendar–style) */}
      <div
        className={`rounded-xl border px-4 py-4 sm:px-5 shadow-sm transition-shadow duration-200 ${
          hasNeedsAttention
            ? 'border-amber-200 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/30'
            : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/40'
        }`}
        aria-label={hasNeedsAttention ? 'Items need your attention' : 'All clear'}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {hasNeedsAttention ? (
              <>
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                  {needsAttentionTotal} item{needsAttentionTotal !== 1 ? 's' : ''} need your attention
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">All clear — no pending decisions</p>
            )}
          </div>
          {hasNeedsAttention && (
            <button
              type="button"
              onClick={handleReviewNeedsAttention}
              className="inline-flex items-center gap-2 rounded-full bg-primary-blue px-6 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 transition-all duration-150 dark:bg-primary-blue dark:text-white dark:focus:ring-offset-slate-900"
            >
              Review
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* Four key metrics – Google Calendar–style cards: white surfaces, subtle shadow, status colour only on accent */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <button
          type="button"
          onClick={handleReviewNeedsAttention}
          className="rounded-xl border border-slate-200 border-l-4 border-l-amber-500 bg-white p-4 text-left shadow-sm transition-shadow duration-200 hover:shadow-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-900 min-h-[44px] touch-manipulation"
          aria-label="Needs attention – open relevant modal or page"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-700 dark:text-slate-300">Needs attention</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">{needsAttentionTotal}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Pending decisions</p>
        </button>
        <button
          type="button"
          onClick={() => setShowTodaySessionsPanel(true)}
          className="rounded-xl border border-slate-200 border-l-4 border-l-blue-500 bg-white p-4 text-left shadow-sm transition-shadow duration-200 hover:shadow-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-900 min-h-[44px] touch-manipulation"
          aria-label="Today's sessions – open side panel"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-700 dark:text-slate-300">Today&apos;s sessions</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">{todaySessions.length}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {ongoingSessions.length} in progress · {upcomingSessions.length} upcoming
          </p>
        </button>
        <button
          type="button"
          onClick={() => router.push(ROUTES.DASHBOARD_ADMIN_BOOKINGS)}
          className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-shadow duration-200 hover:shadow-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-900 min-h-[44px] touch-manipulation"
          aria-label="Bookings – view all"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Bookings</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">{loading ? '…' : totalBookings}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">View all</p>
        </button>
        <button
          type="button"
          onClick={() => router.push(ROUTES.DASHBOARD_ADMIN_REPORTS)}
          className="rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 bg-white p-4 text-left shadow-sm transition-shadow duration-200 hover:shadow-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-900 min-h-[44px] touch-manipulation"
          aria-label="Revenue this month – view reports"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-700 dark:text-slate-300">Revenue (month)</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
            {stats?.revenue != null ? `£${(stats.revenue.thisMonth / 1000).toFixed(1)}k` : '—'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">View reports</p>
        </button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-6">
          {/* Tabs: Schedule (primary), Trainers, Families, Stats, Timesheets – Google Calendar–style */}
          <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            {[
              { id: 'schedule' as const, label: 'Schedule', icon: CalendarDays },
              { id: 'timesheets' as const, label: 'Timesheets', icon: CalendarClock },
              { id: 'trainers' as const, label: 'Trainers', icon: UserCheck },
              { id: 'families' as const, label: 'Families', icon: Users },
              { id: 'stats' as const, label: 'Stats', icon: BarChart2 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors duration-150 ${
                  activeTab === id
                    ? 'border-gcal-primary text-gcal-primary dark:text-gcal-primary'
                    : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'schedule' && (
            <AdminScheduleWeekGrid
              onRefetchStats={refetchStats}
              onViewSession={(sessionId, bookingId, options) =>
                setSessionPanel({ sessionId, bookingId, focusOnActivity: options?.focusOnActivity })
              }
            />
          )}

          {activeTab === 'trainers' && <AdminDashboardTrainersTab />}
          {activeTab === 'families' && <AdminDashboardFamiliesTab />}
          {activeTab === 'stats' && <AdminDashboardStatsTab />}
          {activeTab === 'timesheets' && <AdminTimesheetsGrid />}
        </div>

        <AdminDashboardRightSidebar
          ongoingSessions={ongoingSessions}
          upcomingSessions={upcomingSessions}
          unassignedCount={stats?.alerts?.sessionsAwaitingTrainer ?? 0}
          pendingPaymentsCount={stats?.alerts?.pendingPaymentsCount ?? 0}
          zeroHoursCount={stats?.alerts?.childrenWithZeroHoursCount ?? 0}
          stats={{
            activeTrainers: stats?.trainers?.active ?? 0,
            activeParents: stats?.users?.parentsApproved ?? 0,
            sessionsThisWeek: (stats?.weekDayCounts ?? []).reduce((a, b) => a + b, 0),
            revenueThisMonth: stats?.revenue?.thisMonth ?? null,
          }}
          onViewSession={(sessionId, bookingId, options) =>
                setSessionPanel({ sessionId, bookingId, focusOnActivity: options?.focusOnActivity })
              }
        />
      </div>
      <NeedsAttentionModal
        isOpen={modalNeedsAttentionList}
        onClose={() => setModalNeedsAttentionList(false)}
        total={needsAttentionTotal}
        items={needsAttentionItems}
        onOpenUnassigned={() => setModalUnassigned(true)}
        onOpenPendingPayments={() => setModalPendingPayments(true)}
        onOpenZeroHours={() => setModalZeroHours(true)}
      />
      <UnassignedSessionsModal
        isOpen={modalUnassigned}
        onClose={() => setModalUnassigned(false)}
        sessions={stats?.alerts?.sessionsAwaitingTrainerList ?? []}
        onAssigned={refetchStats}
      />
      <PendingPaymentsModal
        isOpen={modalPendingPayments}
        onClose={() => setModalPendingPayments(false)}
        payments={stats?.alerts?.pendingPaymentsList ?? []}
      />
      <ZeroHoursModal
        isOpen={modalZeroHours}
        onClose={() => setModalZeroHours(false)}
        zeroHoursList={stats?.alerts?.childrenWithZeroHoursList ?? []}
      />
      <SessionLatestActivityPanel
        isOpen={!!sessionPanel && sessionPanel.focusOnActivity === true}
        onClose={() => setSessionPanel(null)}
        sessionId={sessionPanel?.sessionId ?? null}
        bookingId={sessionPanel?.bookingId ?? null}
        getBooking={getBookingForPanel}
        onViewFullBooking={
          sessionPanel?.sessionId && sessionPanel?.bookingId
            ? (sid, bid) => setSessionPanel({ sessionId: sid, bookingId: bid, focusOnActivity: false })
            : undefined
        }
      />
      <TodaySessionsSidePanel
        isOpen={showTodaySessionsPanel}
        onClose={() => setShowTodaySessionsPanel(false)}
        ongoingSessions={ongoingSessions}
        upcomingSessions={upcomingSessions}
        onViewSession={(sessionId, bookingId, options) => {
          setSessionPanel({ sessionId, bookingId, focusOnActivity: options?.focusOnActivity });
          setShowTodaySessionsPanel(false);
        }}
      />
      <SessionDetailSidePanel
        isOpen={!!sessionPanel && sessionPanel.focusOnActivity !== true}
        onClose={() => setSessionPanel(null)}
        sessionId={sessionPanel?.sessionId ?? null}
        bookingId={sessionPanel?.bookingId ?? null}
        getBooking={getBookingForPanel}
        onUpdate={refetchTodayBookings}
        onUpdateNotes={updateBookingNotes}
        onOpenLatestActivity={
          sessionPanel?.sessionId && sessionPanel?.bookingId
            ? (sid, bid) => setSessionPanel({ sessionId: sid, bookingId: bid, focusOnActivity: true })
            : undefined
        }
      />
    </section>
  );
};
