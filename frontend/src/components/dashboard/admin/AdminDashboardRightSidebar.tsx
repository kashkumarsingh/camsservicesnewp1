'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  Calendar,
  AlertTriangle,
  BarChart3,
  Activity,
  ChevronRight,
  UserPlus,
  PoundSterling,
  Users,
  UserCircle,
  Home,
  CalendarDays,
  TrendingUp,
} from 'lucide-react';

interface TodaySessionItem {
  id: string;
  bookingId: string;
  startTime: string;
  endTime: string;
  childrenSummary: string;
  trainerName: string | null;
  parentName: string;
  isOngoing: boolean;
  isUpcoming: boolean;
}

interface AdminDashboardRightSidebarProps {
  ongoingSessions: TodaySessionItem[];
  upcomingSessions: TodaySessionItem[];
  unassignedCount: number;
  pendingPaymentsCount: number;
  zeroHoursCount: number;
  stats: {
    activeTrainers: number;
    activeParents: number;
    sessionsThisWeek: number;
    revenueThisMonth: number | null;
  };
  /** When provided, "View" opens the session detail side panel. Options.focusOnActivity scrolls to Timeline. */
  onViewSession?: (sessionId: string, bookingId: string, options?: { focusOnActivity?: boolean }) => void;
}

function formatTime(t: string): string {
  return t && t.length >= 5 ? t.slice(0, 5) : t;
}

export function AdminDashboardRightSidebar({
  ongoingSessions,
  upcomingSessions,
  unassignedCount,
  pendingPaymentsCount,
  zeroHoursCount,
  stats,
  onViewSession,
}: AdminDashboardRightSidebarProps) {
  const router = useRouter();
  const needsAttentionCount = unassignedCount + pendingPaymentsCount + zeroHoursCount;

  const handleViewSession = (sessionId: string, bookingId: string, options?: { focusOnActivity?: boolean }) => {
    if (onViewSession) {
      onViewSession(sessionId, bookingId, options);
    } else {
      router.push('/dashboard/admin/bookings');
    }
  };

  const cardBase =
    'rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900';
  const linkButtonClass =
    'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900';

  return (
    <aside
      className="w-full shrink-0 space-y-4 lg:w-72 xl:w-80"
      aria-label="Today's activity, needs attention, and quick stats"
    >
      {/* Card 1: Today's activity */}
      <div className={cardBase}>
        <h2 className="mb-3 text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Today&apos;s activity
        </h2>

        {ongoingSessions.length > 0 && (
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              In progress ({ongoingSessions.length})
            </p>
            <ul className="space-y-2" role="list">
              {ongoingSessions.map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-emerald-200/80 bg-emerald-50/60 py-2.5 px-3 text-xs dark:border-emerald-800/60 dark:bg-emerald-950/40"
                >
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatTime(s.startTime)}–{formatTime(s.endTime)}
                  </p>
                  <p className="mt-0.5 text-slate-700 dark:text-slate-300">{s.childrenSummary}</p>
                  <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                    {s.trainerName ?? 'Unassigned'} · {s.parentName}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewSession(s.id, s.bookingId)}
                      className={`${linkButtonClass} text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50`}
                    >
                      Open booking
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleViewSession(s.id, s.bookingId, { focusOnActivity: true })}
                      className={`${linkButtonClass} text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50`}
                    >
                      <Activity className="h-3.5 w-3.5" aria-hidden />
                      Latest activity
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {upcomingSessions.length > 0 && (
          <div className={ongoingSessions.length > 0 ? 'mt-4' : ''}>
            <p className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              Upcoming today ({upcomingSessions.length})
            </p>
            <ul className="space-y-2" role="list">
              {upcomingSessions.slice(0, 5).map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-slate-200 bg-slate-50/80 py-2.5 px-3 text-xs dark:border-slate-700/80 dark:bg-slate-800/40"
                >
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatTime(s.startTime)}–{formatTime(s.endTime)}
                  </p>
                  <p className="mt-0.5 text-slate-700 dark:text-slate-300">{s.childrenSummary}</p>
                  <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                    {s.trainerName ?? 'Unassigned'} · {s.parentName}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleViewSession(s.id, s.bookingId)}
                    className={`mt-2 ${linkButtonClass} text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800`}
                  >
                    View session
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            {upcomingSessions.length > 5 && (
              <Link
                href="/dashboard/admin/bookings"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                View all bookings
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            )}
          </div>
        )}

        {ongoingSessions.length === 0 && upcomingSessions.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No sessions today. Confirmed bookings will appear here.
          </p>
        )}

        {(ongoingSessions.length > 0 || upcomingSessions.length > 0) && (
          <Link
            href="/dashboard/admin/bookings"
            className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Calendar &amp; bookings
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        )}
      </div>

      {/* Card 2: Needs attention – actionable items only */}
      {needsAttentionCount > 0 && (
        <div
          className={`${cardBase} border-l-4 border-l-amber-500 dark:border-l-amber-400`}
          role="region"
          aria-label="Items needing attention"
        >
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
            Needs attention ({needsAttentionCount})
          </h2>
          <ul className="space-y-2" role="list">
            {unassignedCount > 0 && (
              <li>
                <Link
                  href="/dashboard/admin/bookings?needs_trainer=1"
                  className="flex items-center justify-between gap-2 rounded-lg border border-amber-200/60 bg-amber-50/60 px-3 py-2 text-xs transition-colors hover:bg-amber-100/60 dark:border-amber-800/60 dark:bg-amber-950/40 dark:hover:bg-amber-900/40"
                >
                  <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <UserPlus className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                    {unassignedCount} session{unassignedCount !== 1 ? 's' : ''} need a trainer
                  </span>
                  <span className="font-medium text-amber-700 dark:text-amber-300">Assign</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                </Link>
              </li>
            )}
            {pendingPaymentsCount > 0 && (
              <li>
                <Link
                  href="/dashboard/admin/bookings?payment_status=pending"
                  className="flex items-center justify-between gap-2 rounded-lg border border-amber-200/60 bg-amber-50/60 px-3 py-2 text-xs transition-colors hover:bg-amber-100/60 dark:border-amber-800/60 dark:bg-amber-950/40 dark:hover:bg-amber-900/40"
                >
                  <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <PoundSterling className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                    {pendingPaymentsCount} pending payment{pendingPaymentsCount !== 1 ? 's' : ''}
                  </span>
                  <span className="font-medium text-amber-700 dark:text-amber-300">Review</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                </Link>
              </li>
            )}
            {zeroHoursCount > 0 && (
              <li>
                <Link
                  href="/dashboard/admin/children?hours=0"
                  className="flex items-center justify-between gap-2 rounded-lg border border-amber-200/60 bg-amber-50/60 px-3 py-2 text-xs transition-colors hover:bg-amber-100/60 dark:border-amber-800/60 dark:bg-amber-950/40 dark:hover:bg-amber-900/40"
                >
                  <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <Users className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                    {zeroHoursCount} child{zeroHoursCount !== 1 ? 'ren' : ''} with 0 hours
                  </span>
                  <span className="font-medium text-amber-700 dark:text-amber-300">Contact parents</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                </Link>
                <p className="mt-1 px-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Suggest topping up hours so sessions can continue.
                </p>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Card 3: Quick stats – each row actionable */}
      <div className={cardBase}>
        <h2 className="mb-3 text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Quick stats
        </h2>
        <ul className="space-y-0.5 text-xs" role="list">
          <li>
            <Link
              href="/dashboard/admin/trainers"
              className="flex items-center justify-between gap-2 rounded-md py-1.5 px-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <span className="flex items-center gap-2">
                <UserCircle className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
                {stats.activeTrainers} trainer{stats.activeTrainers !== 1 ? 's' : ''} active
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/admin/parents"
              className="flex items-center justify-between gap-2 rounded-md py-1.5 px-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <span className="flex items-center gap-2">
                <Home className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
                {stats.activeParents} famil{stats.activeParents !== 1 ? 'ies' : 'y'} active
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/admin/bookings"
              className="flex items-center justify-between gap-2 rounded-md py-1.5 px-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
                {stats.sessionsThisWeek} session{stats.sessionsThisWeek !== 1 ? 's' : ''} this week
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/admin/reports"
              className="flex items-center justify-between gap-2 rounded-md py-1.5 px-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
                {stats.revenueThisMonth != null
                  ? `£${stats.revenueThisMonth.toLocaleString('en-GB', { minimumFractionDigits: 2 })} revenue this month`
                  : '— revenue'}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            </Link>
          </li>
        </ul>
        <Link
          href="/dashboard/admin/reports"
          className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          View full reports
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </aside>
  );
}
