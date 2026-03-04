'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  ChevronRight,
  BarChart2,
  Users,
  Baby,
  UserCheck,
  Settings,
  FileText,
  Info,
} from 'lucide-react';
import { useAdminDashboardStats } from '@/interfaces/web/hooks/dashboard/useAdminDashboardStats';
import { useAdminBookings } from '@/interfaces/web/hooks/admin/useAdminBookings';
import { useAdminTrainers } from '@/interfaces/web/hooks/admin/useAdminTrainers';
import { ROUTES } from '@/utils/routes';
import { WEEKDAY_LABELS_MON_FRI } from '@/utils/appConstants';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import type { AdminBookingDTO } from '@/core/application/admin/dto/AdminBookingDTO';
import { SCHEDULE_SESSION_STATUS } from '@/utils/dashboardConstants';

const TOP_PERFORMERS_LIMIT = 5;
const cardBase =
  'rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900';

function useTodaySessionBreakdown(today: string) {
  const { bookings } = useAdminBookings({
    status: 'confirmed',
    payment_status: 'paid',
    session_date_from: today,
    session_date_to: today,
    limit: 200,
  });

  return useMemo(() => {
    const now = new Date();
    let completed = 0;
    let inProgress = 0;
    let upcoming = 0;
    let cancelled = 0;

    bookings.forEach((b: AdminBookingDTO) => {
      (b.sessions ?? []).forEach((s) => {
        if (!s.date || s.date !== today) return;
        const start = new Date(`${s.date}T${s.startTime}`);
        const end = new Date(`${s.date}T${s.endTime}`);
        const status = (s.status ?? '').toLowerCase();

        if (status === SCHEDULE_SESSION_STATUS.CANCELLED || s.cancelledAt) {
          cancelled += 1;
          return;
        }
        if (now >= end || status === SCHEDULE_SESSION_STATUS.COMPLETED || s.completedAt) {
          completed += 1;
          return;
        }
        if (now >= start && now < end) {
          inProgress += 1;
          return;
        }
        if (now < start) {
          upcoming += 1;
        }
      });
    });

    return { completed, inProgress, upcoming, cancelled, sessions: bookings };
  }, [bookings, today]);
}

export function AdminDashboardStatsTab() {
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const { stats, loading, error } = useAdminDashboardStats();
  const todayBreakdown = useTodaySessionBreakdown(today);
  const { trainers } = useAdminTrainers({ limit: 100 });

  const topPerformers = useMemo(() => {
    return [...trainers]
      .filter((t) => t.rating != null && Number.isFinite(t.rating))
      .sort((a, b) => (Number(b.rating) ?? 0) - (Number(a.rating) ?? 0))
      .slice(0, TOP_PERFORMERS_LIMIT);
  }, [trainers]);

  const weekDayCounts = stats?.weekDayCounts ?? [0, 0, 0, 0, 0];

  const pendingActionsCount =
    (stats?.alerts?.sessionsAwaitingTrainer ?? 0) +
    (stats?.alerts?.pendingPaymentsCount ?? 0) +
    (stats?.alerts?.pendingParentApprovals ?? 0) +
    (stats?.alerts?.pendingChildChecklists ?? 0) +
    (stats?.alerts?.pendingTrainerApplications ?? 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
        Failed to load stats. Please try again.
      </div>
    );
  }

  const bookings = stats?.bookings ?? { total: 0, confirmed: 0, pending: 0, cancelled: 0, trendPercent: 0 };
  const users = stats?.users ?? { total: 0, parentsApproved: 0, parentsPendingApproval: 0, trendPercent: 0 };
  const trainersStats = stats?.trainers ?? { total: 0, active: 0, trendPercent: 0 };
  const revenue = stats?.revenue ?? { thisMonth: 0, lastMonth: 0, trendPercent: 0 };
  const todaySessionsCount = stats?.todaySessionsCount ?? 0;
  const upcomingSessionsCount = stats?.upcomingSessionsCount ?? 0;

  const trendStr = (p: number | undefined) =>
    p == null || p === 0 ? '' : p > 0 ? `↑ +${p}%` : `↓ ${p}%`;

  const revenueMax = Math.max(revenue.thisMonth ?? 0, revenue.lastMonth ?? 0, 1);
  const lastMonthWidth = revenueMax > 0 ? ((revenue.lastMonth ?? 0) / revenueMax) * 100 : 0;
  const thisMonthWidth = revenueMax > 0 ? ((revenue.thisMonth ?? 0) / revenueMax) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Full reports, revenue breakdown and exports
        </h2>
        <Link
          href={ROUTES.DASHBOARD_ADMIN_REPORTS}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-blue hover:underline dark:text-primary-blue"
        >
          <FileText className="h-4 w-4 shrink-0" aria-hidden />
          View Full Reports
        </Link>
      </div>

      {/* Row 1: Sessions breakdown + Session status */}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className={cardBase}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Sessions breakdown
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm tabular-nums dark:border-slate-700 dark:bg-slate-800">
              Completed {todayBreakdown.completed} today
            </span>
            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium tabular-nums text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
              In progress {todayBreakdown.inProgress}
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm tabular-nums dark:border-slate-700 dark:bg-slate-800">
              Upcoming {todayBreakdown.upcoming} today
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm tabular-nums dark:border-slate-700 dark:bg-slate-800">
              Cancelled {todayBreakdown.cancelled} bookings
            </span>
          </div>
        </section>

        <section className={cardBase}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Session status
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="rounded-md border-2 border-emerald-200 bg-emerald-50/50 py-2 px-3 dark:border-emerald-800 dark:bg-emerald-950/30">
              Completion rate — today
            </li>
            <li className="rounded-md border border-slate-200 py-2 px-3 dark:border-slate-700">
              Average rating —
            </li>
            <li className="rounded-md border-2 border-red-200 py-2 px-3 dark:border-red-800">
              <span className="font-medium">Issues count</span> 0 no-show / incomplete
            </li>
          </ul>
        </section>
      </div>

      {/* Action required – yellow highlight */}
      <section className="rounded-xl border-2 border-amber-300 bg-amber-50/50 p-5 dark:border-amber-600 dark:bg-amber-950/20">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200">
          Action required
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href={ROUTES.DASHBOARD_ADMIN_TRAINER_APPLICATIONS}
            className="flex items-center justify-between rounded-lg border-2 border-amber-300 bg-white py-3 px-4 transition-colors hover:bg-amber-50 dark:border-amber-600 dark:bg-slate-900 dark:hover:bg-amber-950/30"
          >
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Trainer applications awaiting review
            </span>
            <span className="flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-amber-400 px-2 text-sm font-bold text-amber-900 dark:bg-amber-500 dark:text-amber-950">
              {stats?.alerts?.pendingTrainerApplications ?? 0}
            </span>
          </Link>
          <Link
            href={ROUTES.DASHBOARD_ADMIN_PARENTS}
            className="flex items-center justify-between rounded-lg border-2 border-amber-300 bg-white py-3 px-4 transition-colors hover:bg-amber-50 dark:border-amber-600 dark:bg-slate-900 dark:hover:bg-amber-950/30"
          >
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Parents awaiting approval
            </span>
            <span className="flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-amber-400 px-2 text-sm font-bold text-amber-900 dark:bg-amber-500 dark:text-amber-950">
              {stats?.alerts?.pendingParentApprovals ?? 0}
            </span>
          </Link>
        </div>
      </section>

      {/* Row 2: Total bookings, Active parents, Active trainers */}
      <div className="grid gap-4 sm:grid-cols-3">
        <section className={cardBase}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Total bookings
          </h3>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">{bookings.total}</p>
          {bookings.trendPercent != null && bookings.trendPercent !== 0 && (
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{trendStr(bookings.trendPercent)}</p>
          )}
          <p className="mt-1 text-2xs text-slate-500 dark:text-slate-400">
            {bookings.confirmed} confirmed · {bookings.pending} pending · {bookings.cancelled} cancelled
          </p>
          <Link
            href={ROUTES.DASHBOARD_ADMIN_BOOKINGS}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-blue hover:underline dark:text-primary-blue"
          >
            View bookings
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>

        <section className={cardBase}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Active parents
          </h3>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">{users.parentsApproved}</p>
          {users.trendPercent != null && users.trendPercent !== 0 && (
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{trendStr(users.trendPercent)}</p>
          )}
          {(users.parentsPendingApproval ?? 0) > 0 && (
            <p className="mt-1 text-2xs text-amber-600 dark:text-amber-400">{users.parentsPendingApproval} awaiting approval</p>
          )}
          <Link
            href={ROUTES.DASHBOARD_ADMIN_PARENTS}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-blue hover:underline dark:text-primary-blue"
          >
            View parents
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>

        <section className={cardBase}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Active trainers
          </h3>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">{trainersStats.active}</p>
          {trainersStats.trendPercent != null && trainersStats.trendPercent !== 0 && (
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{trendStr(trainersStats.trendPercent)}</p>
          )}
          <p className="mt-1 text-2xs text-slate-500 dark:text-slate-400">{trainersStats.total} total trainer profiles</p>
          <Link
            href={ROUTES.DASHBOARD_ADMIN_TRAINERS}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-blue hover:underline dark:text-primary-blue"
          >
            View trainers
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>
      </div>

      {/* Today's sessions – full width */}
      <section className={cardBase}>
        <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">Today&apos;s sessions</h3>
        <p className="text-2xs text-slate-500 dark:text-slate-400">
          Live view of today&apos;s booked activities across all children.
        </p>
        {todaySessionsCount === 0 ? (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            No sessions are scheduled for today. Confirmed bookings will appear here as they are created.
          </p>
        ) : (
          <p className="mt-3 text-sm font-medium tabular-nums text-slate-900 dark:text-slate-100">
            {todaySessionsCount} session{todaySessionsCount !== 1 ? 's' : ''} today
          </p>
        )}
      </section>

      {/* Row 3: Revenue, Upcoming, Pending actions (yellow), Quick stats – 4 columns */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <section className={cardBase}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            £ Revenue (monthly)
          </h3>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            £{(revenue.thisMonth ?? 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
          </p>
          {revenue.trendPercent != null && revenue.trendPercent !== 0 && (
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              ↑ {Math.abs(revenue.trendPercent)}% vs last month
            </p>
          )}
          <div className="mt-3 space-y-2">
            <div className="space-y-1">
              <span className="text-2xs text-slate-500 dark:text-slate-400">Last month £{((revenue.lastMonth ?? 0) / 1000).toFixed(1)}k</span>
              <div
                className="w-full rounded-full bg-slate-200 dark:bg-slate-700 h-2 overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.min(100, lastMonthWidth)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Last month revenue ${((revenue.lastMonth ?? 0) / 1000).toFixed(1)}k`}
              >
                <div
                  className="h-full rounded-full bg-slate-400 dark:bg-slate-500 transition-all"
                  style={{ width: `${Math.min(100, lastMonthWidth)}%` }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-2xs text-slate-500 dark:text-slate-400">This month £{((revenue.thisMonth ?? 0) / 1000).toFixed(1)}k</span>
              <div
                className="w-full rounded-full bg-slate-200 dark:bg-slate-700 h-2 overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.min(100, thisMonthWidth)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`This month revenue ${((revenue.thisMonth ?? 0) / 1000).toFixed(1)}k`}
              >
                <div
                  className="h-full rounded-full bg-primary-blue transition-all"
                  style={{ width: `${Math.min(100, thisMonthWidth)}%` }}
                />
              </div>
            </div>
          </div>
          <Link
            href={ROUTES.DASHBOARD_ADMIN_REPORTS}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-blue hover:underline dark:text-primary-blue"
          >
            View reports
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>

        <section className={cardBase}>
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            Upcoming (7 days)
          </h3>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">{upcomingSessionsCount}</p>
          <p className="text-2xs text-slate-500 dark:text-slate-400">sessions in next 7 days</p>
          <Link
            href={ROUTES.DASHBOARD_ADMIN_BOOKINGS}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-blue hover:underline dark:text-primary-blue"
          >
            View bookings
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>

        <section className="rounded-xl border-2 border-amber-300 bg-amber-50/50 p-5 dark:border-amber-600 dark:bg-amber-950/20">
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200">
            <Info className="h-3.5 w-3.5" aria-hidden />
            Pending actions
          </h3>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">{pendingActionsCount}</p>
          <p className="text-2xs text-slate-600 dark:text-slate-400">
            {stats?.alerts?.sessionsAwaitingTrainer ?? 0} bookings · {stats?.alerts?.pendingParentApprovals ?? 0} parents ·{' '}
            {stats?.alerts?.pendingChildChecklists ?? 0} checklists
          </p>
          <Link
            href={ROUTES.DASHBOARD_ADMIN}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-blue hover:underline dark:text-primary-blue"
          >
            Review
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>

        <section className={cardBase}>
          <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            <BarChart2 className="h-3.5 w-3.5" aria-hidden />
            Quick stats
          </h3>
          <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
            <li>{bookings.total} bookings</li>
            <li>{users.parentsApproved} parents</li>
            <li>{trainersStats.active} trainers</li>
            <li>{todaySessionsCount} today</li>
          </ul>
        </section>
      </div>

      {/* Quick actions – horizontal row of icon buttons */}
      <section className={cardBase}>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          Quick actions
        </h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Bookings', href: ROUTES.DASHBOARD_ADMIN_BOOKINGS, icon: CalendarDays },
            { label: 'Parents', href: ROUTES.DASHBOARD_ADMIN_PARENTS, icon: Users },
            { label: 'Children', href: ROUTES.DASHBOARD_ADMIN_CHILDREN, icon: Baby },
            { label: 'Trainers', href: ROUTES.DASHBOARD_ADMIN_TRAINERS, icon: UserCheck },
            { label: 'Reports', href: ROUTES.DASHBOARD_ADMIN_REPORTS, icon: BarChart2 },
            { label: 'Settings', href: ROUTES.DASHBOARD_ADMIN_SETTINGS, icon: Settings },
          ].map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-primary-blue/30 hover:bg-primary-blue/5 hover:text-primary-blue dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-primary-blue/50 dark:hover:bg-primary-blue/10 dark:hover:text-primary-blue"
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* This week + Top performers – side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className={cardBase}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            This week (Mon–Fri)
          </h3>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            {WEEKDAY_LABELS_MON_FRI.map((label, i) => (
              <span key={label} className="tabular-nums text-slate-700 dark:text-slate-300">
                {label} <span className="font-semibold">{weekDayCounts[i] ?? 0}</span>
              </span>
            ))}
          </div>
        </section>

        <section className={cardBase}>
          <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">Top performers</h3>
          <p className="mb-3 text-2xs text-slate-500 dark:text-slate-400">Trainers by rating (top 5)</p>
          {topPerformers.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No trainer ratings yet.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {topPerformers.map((trainer) => (
                <li key={trainer.id} className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>{trainer.name ?? '—'}</span>
                  <span className="tabular-nums">{Number(trainer.rating).toFixed(1)} ★</span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={ROUTES.DASHBOARD_ADMIN_TRAINERS}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-blue hover:underline dark:text-primary-blue"
          >
            View all trainers
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>
      </div>
    </div>
  );
}
