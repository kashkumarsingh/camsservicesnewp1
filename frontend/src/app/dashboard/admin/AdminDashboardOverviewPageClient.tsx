'use client';

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  PoundSterling,
  AlertCircle,
  BarChart3,
  Clock,
  MapPin,
  User,
  Activity,
  ExternalLink,
  Users,
  UserCheck,
  FileText,
  Settings,
  CalendarDays,
  CalendarClock,
} from "lucide-react";
import { useAuth } from "@/interfaces/web/hooks/auth/useAuth";
import { useAdminDashboardStats } from "@/interfaces/web/hooks/dashboard/useAdminDashboardStats";
import { useAdminBookings } from "@/interfaces/web/hooks/admin/useAdminBookings";
import { useAdminTrainers } from "@/interfaces/web/hooks/admin/useAdminTrainers";
import { useLiveRefresh, useLiveRefreshContext } from "@/core/liveRefresh/LiveRefreshContext";
import { LIVE_REFRESH_ENABLED } from "@/utils/liveRefreshConstants";
import { apiClient } from "@/infrastructure/http/ApiClient";
import { API_ENDPOINTS } from "@/infrastructure/http/apiEndpoints";
import type { AdminBookingDTO } from "@/core/application/admin/dto/AdminBookingDTO";
import { DashboardSkeleton, ListRowsSkeleton } from "@/components/ui/Skeleton";
import { SKELETON_COUNTS } from "@/utils/skeletonConstants";
import { AdminDashboardAlertBar } from "@/components/dashboard/admin/AdminDashboardAlertBar";
import { UnassignedSessionsModal } from "@/components/dashboard/admin/UnassignedSessionsModal";
import { PendingPaymentsModal } from "@/components/dashboard/admin/PendingPaymentsModal";
import { ZeroHoursModal } from "@/components/dashboard/admin/ZeroHoursModal";
import { AdminDashboardRightSidebar } from "@/components/dashboard/admin/AdminDashboardRightSidebar";
import { AdminScheduleWeekGrid } from "@/components/dashboard/admin/AdminScheduleWeekGrid";
import { AdminTimesheetsGrid } from "@/components/dashboard/admin/AdminTimesheetsGrid";
import { AdminDashboardTrainersTab } from "@/components/dashboard/admin/AdminDashboardTrainersTab";
import { AdminDashboardFamiliesTab } from "@/components/dashboard/admin/AdminDashboardFamiliesTab";
import { SessionDetailSidePanel } from "@/components/dashboard/admin/SessionDetailSidePanel";
import { SessionLatestActivityPanel } from "@/components/dashboard/admin/SessionLatestActivityPanel";

/** Tiny sparkline from array of values (0..max). */
function Sparkline({ values, className = "" }: { values: number[]; className?: string }) {
  if (!values?.length) return null;
  const max = Math.max(1, ...values);
  const w = 48;
  const h = 20;
  const points = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg className={className} width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={points} />
    </svg>
  );
}

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

      const isOngoing = start <= now && now < end;
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
  /** Dashboard tabs: schedule | timesheets | trainers | families | stats */
  const [activeTab, setActiveTab] = useState<'schedule' | 'timesheets' | 'trainers' | 'families' | 'stats'>('schedule');
  /** Modals opened from alert bar */
  const [modalUnassigned, setModalUnassigned] = useState(false);
  const [modalPendingPayments, setModalPendingPayments] = useState(false);
  const [modalZeroHours, setModalZeroHours] = useState(false);
  const [sessionPanel, setSessionPanel] = useState<{
    sessionId: string;
    bookingId: string;
    focusOnActivity?: boolean;
  } | null>(null);

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
        const message =
          err instanceof Error ? err.message : "Failed to assign trainer";
        setAssignError(message);
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

  // Show skeleton until stats and today's bookings have loaded (avoids empty KPIs / list then data popping in)
  if (!hasInitialLoadCompleted) {
    return <DashboardSkeleton variant="admin" />;
  }

  const adminDisplayName = user?.name?.trim().split(/\s+/)[0] || 'Admin';

  return (
    <section className="space-y-4">
      <header className="space-y-0.5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {getGreeting()}, {adminDisplayName}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          High-level system view across bookings, users, trainers and key risks.
        </p>
      </header>

      {(error || todayBookingsError) && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error || todayBookingsError}
        </div>
      )}

      <AdminDashboardAlertBar
        stats={stats}
        onUnassignedClick={() => setModalUnassigned(true)}
        onPendingPaymentsClick={() => setModalPendingPayments(true)}
        onZeroHoursClick={() => setModalZeroHours(true)}
        onTodayClick={() => router.push("/dashboard/admin/bookings")}
        onChecklistsToReviewClick={() => router.push("/dashboard/admin/children")}
      />

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-4">
          {/* Tab navigation */}
          <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
            {[
              { id: 'schedule' as const, label: 'Schedule', icon: CalendarDays },
              { id: 'timesheets' as const, label: 'Timesheets', icon: CalendarClock },
              { id: 'trainers' as const, label: 'Trainers', icon: UserCheck },
              { id: 'families' as const, label: 'Families', icon: Users },
              { id: 'stats' as const, label: 'Stats', icon: BarChart3 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
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

          {activeTab === 'timesheets' && <AdminTimesheetsGrid />}

          {activeTab === 'trainers' && (
            <AdminDashboardTrainersTab trainerCardLimit={12} />
          )}

          {activeTab === 'families' && (
            <AdminDashboardFamiliesTab />
          )}

          {activeTab === 'stats' && (
            <>
              {stats && (
              <>
              {/* View Full Reports CTA */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50/80 px-4 py-3 dark:border-indigo-800 dark:bg-indigo-950/30">
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                  Full reports, revenue breakdown and exports
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/admin/reports")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-white px-3 py-2 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 dark:border-indigo-700 dark:bg-white/10 dark:text-indigo-200 dark:hover:bg-indigo-900/50"
                >
                  <FileText className="h-4 w-4" aria-hidden />
                  View Full Reports
                </button>
              </div>

              {/* Sessions breakdown: Completed / In progress / Upcoming / Cancelled */}
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-labelledby="sessions-breakdown-heading">
                <h2 id="sessions-breakdown-heading" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Sessions breakdown
                </h2>
                <div className="mt-3 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed</span>
                    <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                      {todaySessions.filter((s) => s.isPast).length}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">today</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-950/30">
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">In progress</span>
                    <span className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                      {ongoingSessions.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Upcoming</span>
                    <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                      {upcomingSessions.length}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">today</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Cancelled</span>
                    <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                      {stats.bookings.cancelled}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">bookings</span>
                  </div>
                </div>
              </section>

              {/* Session status cards: completion rate, average rating, issues count */}
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-labelledby="session-status-cards-heading">
                <h2 id="session-status-cards-heading" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Session status
                </h2>
                <div className="mt-3 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-950/30">
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Completion rate</span>
                    <span className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                      {sessionStats.completionRatePct != null ? `${sessionStats.completionRatePct}%` : '—'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">today</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Average rating</span>
                    <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">—</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/30">
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Issues count</span>
                    <span className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                      {sessionStats.issuesCount}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">no-show / incomplete</span>
                  </div>
                </div>
              </section>

              {/* Session alerts: missing reports, no-shows, low ratings */}
              {(sessionStats.incompleteToday > 0 || sessionStats.noShowToday > 0) && (
                <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-800 dark:bg-amber-950/40" aria-labelledby="session-alerts-heading">
                  <h2 id="session-alerts-heading" className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    Session alerts
                  </h2>
                  <ul className="mt-2 space-y-1 text-sm text-amber-800 dark:text-amber-200">
                    {sessionStats.incompleteToday > 0 && (
                      <li>⏱️ {sessionStats.incompleteToday} session(s) missing report / check-out (incomplete)</li>
                    )}
                    {sessionStats.noShowToday > 0 && (
                      <li>🔴 {sessionStats.noShowToday} no-show(s) today</li>
                    )}
                    <li className="text-slate-500 dark:text-slate-400">Low ratings: — (when available)</li>
                  </ul>
                </section>
              )}

              {/* Other action required – safeguarding, approvals, etc. */}
          <section
            className={`rounded-xl border p-4 shadow-sm ${
              hasAnyAttention
                ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40"
                : "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40"
            }`}
          >
            {!hasAnyAttention ? (
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                ✓ All clear
              </p>
            ) : (
              <>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200">
                  Action required
                </h2>

                {loading ? (
              <div className="mt-3 space-y-2 animate-pulse" aria-busy="true" aria-label="Loading action items">
                <div className="h-3 w-full max-w-[90%] bg-amber-200/50 dark:bg-amber-800/30 rounded" />
                <div className="h-3 w-[80%] bg-amber-200/50 dark:bg-amber-800/30 rounded" />
                <div className="h-3 w-[70%] bg-amber-200/50 dark:bg-amber-800/30 rounded" />
              </div>
            ) : hasAnyAttention ? (
              <div className="mt-3 space-y-4">
                {pendingSafeguarding > 0 && (
                  <div className="rounded-lg border-2 border-amber-300 bg-white p-3 shadow-sm dark:border-amber-700 dark:bg-slate-900/60">
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/admin/reports")}
                      className="flex w-full cursor-pointer items-center justify-between gap-3 text-left hover:opacity-90"
                    >
                      <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        Safeguarding concerns to triage
                      </span>
                      <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-full bg-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                        {pendingSafeguarding}
                      </span>
                    </button>
                  </div>
                )}

                {stats.bookings.pending > 0 && (
                  <div className="rounded-lg border-2 border-amber-300 bg-white p-3 shadow-sm dark:border-amber-700 dark:bg-slate-900/60">
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/admin/bookings")}
                      className="flex w-full cursor-pointer items-center justify-between gap-3 text-left hover:opacity-90"
                    >
                      <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        Bookings awaiting decision
                      </span>
                      <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-full bg-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                        {stats.bookings.pending}
                      </span>
                    </button>
                  </div>
                )}

                {pendingTrainerApplications > 0 && (
                  <div className="rounded-lg border-2 border-amber-300 bg-white p-3 shadow-sm dark:border-amber-700 dark:bg-slate-900/60">
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/admin/trainer-applications")}
                      className="flex w-full cursor-pointer items-center justify-between gap-3 text-left hover:opacity-90"
                    >
                      <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        Trainer applications awaiting review
                      </span>
                      <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-full bg-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                        {pendingTrainerApplications}
                      </span>
                    </button>
                  </div>
                )}

                {sessionsAwaitingTrainer > 0 && (
                  <div className="rounded-lg border-2 border-amber-300 bg-white p-3 shadow-sm dark:border-amber-700 dark:bg-slate-900/60">
                    <button
                      type="button"
                      onClick={() => setModalUnassigned(true)}
                      className="flex w-full cursor-pointer items-center justify-between gap-3 text-left hover:opacity-90"
                    >
                      <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        Sessions needing trainer assignment
                      </span>
                      <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-full bg-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                        {sessionsAwaitingTrainer}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/admin/bookings?needs_trainer=1")}
                      className="mt-2 text-xs font-medium text-amber-800 underline underline-offset-1 hover:no-underline dark:text-amber-200"
                    >
                      View in bookings →
                    </button>
                  </div>
                )}

                {pendingParentApprovals > 0 && (
                  <div className="rounded-lg border-2 border-amber-300 bg-white p-3 shadow-sm dark:border-amber-700 dark:bg-slate-900/60">
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/admin/parents?status=pending")}
                      className="flex w-full cursor-pointer items-center justify-between gap-3 text-left hover:opacity-90"
                    >
                      <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        Parents awaiting approval
                      </span>
                      <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-full bg-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                        {pendingParentApprovals}
                      </span>
                    </button>
                  </div>
                )}

                {pendingChildChecklists > 0 && (
                  <div className="rounded-lg border-2 border-amber-300 bg-white p-3 shadow-sm dark:border-amber-700 dark:bg-slate-900/60">
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/admin/children")}
                      className="flex w-full cursor-pointer items-center justify-between gap-3 text-left hover:opacity-90"
                    >
                      <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        Child checklists awaiting review
                      </span>
                      <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-full bg-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                        {pendingChildChecklists}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ) : null}
              </>
            )}
          </section>

      {/* KPIs + Today&apos;s sessions */}
      <div className="space-y-4">
        <div className="grid items-stretch gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/admin/bookings")}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
            aria-label="Go to admin bookings"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Total bookings
                </p>
                {stats?.sparklineCounts && stats.sparklineCounts.length > 0 && (
                  <span className="text-slate-400 dark:text-slate-500" aria-hidden>
                    <Sparkline values={stats.sparklineCounts} className="h-4 w-12" />
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {loading ? "…" : totalBookings}
                </p>
                {!loading && stats?.bookings?.trendPercent != null && (
                  <span className={`flex items-center text-xs font-medium ${stats.bookings.trendPercent >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {stats.bookings.trendPercent >= 0 ? <TrendingUp className="h-3.5 w-3.5" aria-hidden /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden />}
                    {stats.bookings.trendPercent >= 0 ? "↑" : "↓"} {stats.bookings.trendPercent >= 0 ? "+" : ""}{stats.bookings.trendPercent}%
                  </span>
                )}
              </div>
              {!loading && stats && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {stats.bookings.confirmed} confirmed · {stats.bookings.pending} pending · {stats.bookings.cancelled} cancelled
                </p>
              )}
            </div>
            <p className="mt-3 text-xs font-medium text-indigo-600 underline underline-offset-2 dark:text-indigo-300">
              View bookings
            </p>
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard/admin/parents")}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
            aria-label="Go to admin parents"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Active parents
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {loading ? "…" : activeUsers}
                </p>
                {!loading && stats?.users?.trendPercent != null && (
                  <span className={`flex items-center text-xs font-medium ${stats.users.trendPercent >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {stats.users.trendPercent >= 0 ? <TrendingUp className="h-3.5 w-3.5" aria-hidden /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden />}
                    {stats.users.trendPercent >= 0 ? "↑" : "↓"} {stats.users.trendPercent >= 0 ? "+" : ""}{stats.users.trendPercent}%
                  </span>
                )}
              </div>
              {!loading && stats && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {stats.users.parentsPendingApproval} awaiting approval
                </p>
              )}
            </div>
            <p className="mt-3 text-xs font-medium text-indigo-600 underline underline-offset-2 dark:text-indigo-300">
              View parents
            </p>
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard/admin/trainers")}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
            aria-label="Go to admin trainers"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Active trainers
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {loading ? "…" : activeTrainers}
                </p>
                {!loading && stats?.trainers?.trendPercent != null && (
                  <span className={`flex items-center text-xs font-medium ${stats.trainers.trendPercent >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {stats.trainers.trendPercent >= 0 ? <TrendingUp className="h-3.5 w-3.5" aria-hidden /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden />}
                    {stats.trainers.trendPercent >= 0 ? "↑" : "↓"} {stats.trainers.trendPercent >= 0 ? "+" : ""}{stats.trainers.trendPercent}%
                  </span>
                )}
              </div>
              {!loading && stats && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {stats.trainers.total} total trainer profiles
                </p>
              )}
            </div>
            <p className="mt-3 text-xs font-medium text-indigo-600 underline underline-offset-2 dark:text-indigo-300">
              View trainers
            </p>
          </button>
        </div>

        {/* Today's sessions / activities overview */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Today&apos;s sessions
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Live view of today&apos;s booked activities across all children.
              </p>
            </div>
            {!todayBookingsLoading && todaySessions.length > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {`${todaySessions.length} session${
                  todaySessions.length === 1 ? "" : "s"
                } today${
                  ongoingSessions.length
                    ? ` · ${ongoingSessions.length} in progress`
                    : upcomingSessions.length
                      ? ` · ${upcomingSessions.length} upcoming`
                      : ""
                }`}
              </p>
            )}
          </div>

          {todayBookingsLoading ? (
            <div className="mt-3" aria-busy="true" aria-label="Loading today's sessions">
              <ListRowsSkeleton count={SKELETON_COUNTS.LIST_ROWS} />
            </div>
          ) : todaySessions.length === 0 ? (
            <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
              No sessions are scheduled for today. Confirmed bookings will appear here as they are created.
            </div>
          ) : (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {ongoingSessions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    In progress
                  </h3>
                  <ul className="space-y-1.5">
                    {ongoingSessions.map((session) => (
                      <li
                        key={session.id}
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                      >
                        <p className="font-semibold">
                          {session.childrenSummary}
                        </p>
                        <p className="mt-0.5">
                          {formatSessionTime(session.startTime)} – {formatSessionTime(session.endTime)}
                          {session.trainerName ? ` · ${session.trainerName}` : " · Unassigned"}
                        </p>
                        <p className="mt-0.5 text-[11px] opacity-80">
                          {session.parentName}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                  Upcoming today
                </h3>
                <ul className="space-y-1.5">
                  {upcomingSessions.length === 0 ? (
                    <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                      No further sessions booked for later today.
                    </li>
                  ) : (
                    upcomingSessions.map((session) => (
                      <li
                        key={session.id}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      >
                        <p className="font-semibold">
                          {session.childrenSummary}
                        </p>
                        <p className="mt-0.5">
                          {formatSessionTime(session.startTime)} – {formatSessionTime(session.endTime)}
                          {session.trainerName ? ` · ${session.trainerName}` : " · Unassigned"}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {session.parentName}
                        </p>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* Four widgets: Revenue, Upcoming, Pending actions, Quick stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <section
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            aria-labelledby="widget-revenue"
          >
            <h2 id="widget-revenue" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <PoundSterling className="h-4 w-4" aria-hidden />
              Revenue (monthly)
            </h2>
            {stats?.revenue != null ? (
              <>
                <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  £{stats.revenue.thisMonth.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs">
                  {stats.revenue.trendPercent >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-rose-600" aria-hidden />
                  )}
                  <span className={stats.revenue.trendPercent >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                    {stats.revenue.trendPercent >= 0 ? "↑" : "↓"} {Math.abs(stats.revenue.trendPercent)}% vs last month
                  </span>
                </p>
                {/* Revenue trend: last month vs this month */}
                <div className="mt-3 flex items-end gap-2" aria-hidden>
                  <div className="flex flex-1 flex-col items-center gap-0.5">
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Last month</span>
                    <div
                      className="w-full min-h-[2rem] rounded-t bg-slate-200 dark:bg-slate-600"
                      style={{
                        height: `${Math.max(8, Math.round((stats.revenue.lastMonth / Math.max(stats.revenue.thisMonth, stats.revenue.lastMonth, 1)) * 48))}px`,
                      }}
                    />
                    <span className="text-[10px] text-slate-600 dark:text-slate-300">
                      £{(stats.revenue.lastMonth / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col items-center gap-0.5">
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">This month</span>
                    <div
                      className="w-full min-h-[2rem] rounded-t bg-indigo-500 dark:bg-indigo-600"
                      style={{
                        height: `${Math.max(8, Math.round((stats.revenue.thisMonth / Math.max(stats.revenue.thisMonth, stats.revenue.lastMonth, 1)) * 48))}px`,
                      }}
                    />
                    <span className="text-[10px] text-slate-600 dark:text-slate-300">
                      £{(stats.revenue.thisMonth / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/admin/reports")}
                  className="mt-2 text-xs font-medium text-indigo-600 underline underline-offset-2 dark:text-indigo-300"
                >
                  View reports
                </button>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">—</p>
            )}
          </section>

          <section
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            aria-labelledby="widget-upcoming"
          >
            <h2 id="widget-upcoming" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Calendar className="h-4 w-4" aria-hidden />
              Upcoming (7 days)
            </h2>
            <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
              {stats?.upcomingSessionsCount ?? "—"}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">sessions in next 7 days</p>
            <button
              type="button"
              onClick={() => router.push("/dashboard/admin/bookings")}
              className="mt-2 text-xs font-medium text-indigo-600 underline underline-offset-2 dark:text-indigo-300"
            >
              View bookings
            </button>
          </section>

          <section
            className={`rounded-xl border p-4 shadow-sm ${
              totalPendingDecisions + pendingSafeguarding > 0
                ? "border-amber-200 bg-amber-50/80 dark:border-amber-900 dark:bg-amber-950/30"
                : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            }`}
            aria-labelledby="widget-pending"
          >
            <h2
              id="widget-pending"
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${
                totalPendingDecisions + pendingSafeguarding > 0
                  ? "text-amber-800 dark:text-amber-200"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <AlertCircle className="h-4 w-4" aria-hidden />
              Pending actions
            </h2>
            <p
              className={`mt-2 text-xl font-semibold ${
                totalPendingDecisions + pendingSafeguarding > 0
                  ? "text-amber-900 dark:text-amber-100"
                  : "text-slate-900 dark:text-slate-50"
              }`}
            >
              {totalPendingDecisions + pendingSafeguarding}
            </p>
            <p
              className={`mt-1 text-xs ${
                totalPendingDecisions + pendingSafeguarding > 0
                  ? "text-amber-800/90 dark:text-amber-200/90"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {pendingSafeguarding > 0 && "Safeguarding · "}
              {stats?.bookings.pending ?? 0} bookings · {pendingParentApprovals} parents · {pendingChildChecklists} checklists
            </p>
            <button
              type="button"
              onClick={() => (totalPendingDecisions + pendingSafeguarding > 0) && router.push("/dashboard/admin/bookings")}
              className={`mt-2 text-xs font-medium underline underline-offset-2 ${
                totalPendingDecisions + pendingSafeguarding > 0
                  ? "text-amber-800 hover:no-underline dark:text-amber-200"
                  : "text-indigo-600 dark:text-indigo-300"
              }`}
            >
              Review
            </button>
          </section>

          <section
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            aria-labelledby="widget-quickstats"
          >
            <h2 id="widget-quickstats" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <BarChart3 className="h-4 w-4" aria-hidden />
              Quick stats
            </h2>
            <ul className="mt-2 space-y-1 text-xs text-slate-700 dark:text-slate-200">
              <li>{totalBookings} bookings</li>
              <li>{activeUsers} parents</li>
              <li>{activeTrainers} trainers</li>
              <li>{todaySessions.length} today</li>
            </ul>
          </section>
        </div>

        {/* Quick Actions + Mini week calendar */}
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-labelledby="quick-actions">
            <h2 id="quick-actions" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Quick actions
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.push("/dashboard/admin/bookings")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Calendar className="h-4 w-4" aria-hidden />
                Bookings
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/admin/parents")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Users className="h-4 w-4" aria-hidden />
                Parents
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/admin/children")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Users className="h-4 w-4" aria-hidden />
                Children
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/admin/trainers")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <UserCheck className="h-4 w-4" aria-hidden />
                Trainers
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/admin/reports")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <FileText className="h-4 w-4" aria-hidden />
                Reports
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/admin/settings")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Settings className="h-4 w-4" aria-hidden />
                Settings
              </button>
            </div>
          </section>

          <section
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            aria-labelledby="week-calendar"
          >
            <h2 id="week-calendar" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              This week (Mon–Fri)
            </h2>
            <div className="mt-3 flex gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => {
                const count = stats?.weekDayCounts?.[i] ?? 0;
                return (
                  <div
                    key={day}
                    className="flex min-w-[2.5rem] flex-col items-center rounded-lg border border-slate-200 bg-slate-50 py-2 dark:border-slate-700 dark:bg-slate-800/50"
                  >
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{day}</span>
                    <span className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-50">{count}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Top performers (trainers by rating) */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-labelledby="top-performers-heading">
          <h2 id="top-performers-heading" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Top performers
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Trainers by rating (top 5)
          </p>
          {trainersForAssign.length === 0 ? (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">No trainers to show.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {[...trainersForAssign]
                .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
                .slice(0, 5)
                .map((trainer) => (
                  <li key={trainer.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{trainer.name}</span>
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      {Number(trainer.rating ?? 0).toFixed(1)} ★
                    </span>
                  </li>
                ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => router.push("/dashboard/admin/trainers")}
            className="mt-3 text-xs font-medium text-indigo-600 underline underline-offset-2 dark:text-indigo-300"
          >
            View all trainers
          </button>
        </section>
      </div>
              </>
              )}
            </>
          )}
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
