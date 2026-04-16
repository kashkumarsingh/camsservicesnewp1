'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/dashboard/universal/Breadcrumbs';
import { ROUTES } from '@/shared/utils/routes';
import { BACK_TO_ADMIN_DASHBOARD_LABEL, CURRENCY_SYMBOL } from '@/shared/utils/appConstants';
import { useAdminDashboardStats } from '@/interfaces/web/hooks/dashboard/useAdminDashboardStats';
import { useAdminRevenueReport } from '@/interfaces/web/hooks/admin/useAdminRevenueReport';
import { useAdminAuditLogs } from '@/interfaces/web/hooks/admin/useAdminAuditLogs';
import { useAdminSessions } from '@/interfaces/web/hooks/admin/useAdminSessions';
import { REPORTS_PAGE } from '@/dashboard/utils/reportsConstants';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { Calendar, Users, UserCheck, PoundSterling, Download } from 'lucide-react';
import DashboardButton from '@/design-system/components/Button/DashboardButton';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';

const API_V1_PREFIX = '/api/v1';

function useExportDownload() {
  const [exporting, setExporting] = useState<'bookings' | 'trainers' | null>(null);

  const downloadExport = useCallback(async (type: 'bookings' | 'trainers') => {
    const endpoint = type === 'bookings' ? `${API_V1_PREFIX}${API_ENDPOINTS.ADMIN_BOOKINGS_EXPORT}` : `${API_V1_PREFIX}${API_ENDPOINTS.ADMIN_TRAINERS_EXPORT}`;
    const filename = type === 'bookings' ? `bookings-export-${new Date().toISOString().slice(0, 10)}.csv` : `trainers-export-${new Date().toISOString().slice(0, 10)}.csv`;
    setExporting(type);
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: 'text/csv' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  }, []);

  return { downloadExport, exporting };
}

export function AdminReportsPageClient() {
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [sessionStatus, setSessionStatus] = useState<string>('');
  const [auditSearch, setAuditSearch] = useState<string>('');

  const { stats, loading, error } = useAdminDashboardStats();
  const { report, loading: revenueLoading, error: revenueError } = useAdminRevenueReport({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });
  const { logs, loading: logsLoading, error: logsError } = useAdminAuditLogs({
    perPage: 5,
    search: auditSearch || undefined,
  });
  const { sessions, loading: sessionsLoading, error: sessionsError } = useAdminSessions({
    perPage: 8,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    status: sessionStatus || undefined,
  });
  const { downloadExport, exporting } = useExportDownload();

  const last7DayLabels = useMemo(() => {
    const labels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }));
    }
    return labels;
  }, []);

  if (loading) {
    return <DashboardSkeleton variant="admin" />;
  }

  const sparklineCounts = stats?.sparklineCounts ?? [];
  const revenueThisMonth = report?.totalRevenue ?? stats?.revenue?.thisMonth ?? 0;
  const revenueTrend = report?.trendPercent ?? stats?.revenue?.trendPercent ?? 0;
  const maxSessions = Math.max(1, ...sparklineCounts);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <Breadcrumbs
          items={[
            { label: 'Admin', href: ROUTES.DASHBOARD_ADMIN },
            { label: 'Reports' },
          ]}
          trailing={
            <Link
              href={ROUTES.DASHBOARD_ADMIN}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              {BACK_TO_ADMIN_DASHBOARD_LABEL}
            </Link>
          }
        />
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {REPORTS_PAGE.TITLE}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {REPORTS_PAGE.DESCRIPTION}
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200" role="alert">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Report filters
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Date from
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Date to
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Session status
            <select
              value={sessionStatus}
              onChange={(e) => setSessionStatus(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300 sm:col-span-2">
            Audit search
            <input
              type="text"
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              placeholder="Search action, actor, entity..."
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>
        </div>
      </div>

      {/* Summary KPIs */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {REPORTS_PAGE.SECTION_KPIS}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Calendar className="h-4 w-4" aria-hidden />
              Bookings
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {stats?.bookings?.total ?? 0}
            </p>
            <p className="mt-0.5 text-2xs text-slate-500 dark:text-slate-400">
              {stats?.bookings?.confirmed ?? 0} confirmed · {stats?.bookings?.pending ?? 0} pending
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <PoundSterling className="h-4 w-4" aria-hidden />
              Revenue (month)
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {revenueThisMonth > 0 ? `${CURRENCY_SYMBOL}${(revenueThisMonth / 1000).toFixed(1)}k` : '—'}
            </p>
            {revenueTrend !== 0 && (
              <p className="mt-0.5 text-2xs font-medium text-emerald-600 dark:text-emerald-400">
                {revenueTrend > 0 ? '↑' : '↓'} {Math.abs(revenueTrend)}% vs last month
              </p>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <UserCheck className="h-4 w-4" aria-hidden />
              Active trainers
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {stats?.trainers?.active ?? 0}
            </p>
            <p className="mt-0.5 text-2xs text-slate-500 dark:text-slate-400">
              {stats?.trainers?.total ?? 0} total
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Users className="h-4 w-4" aria-hidden />
              Active families
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {stats?.users?.parentsApproved ?? 0}
            </p>
            <p className="mt-0.5 text-2xs text-slate-500 dark:text-slate-400">
              {stats?.users?.parentsPendingApproval ?? 0} pending approval
            </p>
          </div>
        </div>
      </div>

      {/* Sessions last 7 days – simple bar chart */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {REPORTS_PAGE.SECTION_SESSIONS}
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-end gap-2 sm:gap-3 h-32">
            {sparklineCounts.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No session data for the last 7 days.</p>
            ) : (
              sparklineCounts.map((count, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1 min-w-0">
                  <div
                    className="w-full rounded-t bg-primary-blue/80 dark:bg-primary-blue/70 min-h-[4px] transition-all"
                    style={{ height: `${(count / maxSessions) * 100}%` }}
                    title={`${last7DayLabels[i] ?? ''}: ${count} sessions`}
                  />
                  <span className="text-2xs font-medium text-slate-500 dark:text-slate-400 truncate w-full text-center">
                    {last7DayLabels[i] ?? ''}
                  </span>
                </div>
              ))
            )}
          </div>
          {sparklineCounts.length > 0 && (
            <p className="mt-2 text-2xs text-slate-500 dark:text-slate-400">
              Total: {sparklineCounts.reduce((a, b) => a + b, 0)} sessions
            </p>
          )}
        </div>
      </div>

      {/* Revenue source + API state */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Revenue data source
        </h2>
        {revenueLoading ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading revenue report...</p>
        ) : revenueError ? (
          <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">{revenueError}</p>
        ) : (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Revenue report endpoint connected. Showing API-backed values when available.
          </p>
        )}
      </div>

      {/* Recent sessions */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Recent sessions
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {sessionsLoading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading sessions...</p>
          ) : sessionsError ? (
            <p className="text-sm text-rose-700 dark:text-rose-300">{sessionsError}</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No sessions returned.</p>
          ) : (
            <ul className="space-y-2">
              {sessions.slice(0, 8).map((session) => (
                <li
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-slate-800"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100">Session #{session.id}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {session.date ?? 'No date'} {session.startTime && session.endTime ? `· ${session.startTime}-${session.endTime}` : ''}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {session.status ?? 'unknown'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Audit logs */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Latest audit logs
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {logsLoading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading audit logs...</p>
          ) : logsError ? (
            <p className="text-sm text-rose-700 dark:text-rose-300">{logsError}</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No audit logs returned.</p>
          ) : (
            <ul className="space-y-2">
              {logs.slice(0, 5).map((log) => (
                <li
                  key={log.id}
                  className="rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-slate-800"
                >
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {log.action ?? 'Action'} {log.entityType ? `· ${log.entityType}` : ''}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {log.actorName ?? log.actorEmail ?? 'System'} {log.createdAt ? `· ${new Date(log.createdAt).toLocaleString('en-GB')}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Export */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {REPORTS_PAGE.SECTION_EXPORT}
        </h2>
        <div className="flex flex-wrap gap-3">
          <DashboardButton
            type="button"
            variant="bordered"
            size="sm"
            icon={<Download className="h-3.5 w-3.5" />}
            onClick={() => downloadExport('bookings')}
            disabled={exporting !== null}
          >
            {exporting === 'bookings' ? REPORTS_PAGE.EXPORTING : REPORTS_PAGE.EXPORT_BOOKINGS}
          </DashboardButton>
          <DashboardButton
            type="button"
            variant="bordered"
            size="sm"
            icon={<Download className="h-3.5 w-3.5" />}
            onClick={() => downloadExport('trainers')}
            disabled={exporting !== null}
          >
            {exporting === 'trainers' ? REPORTS_PAGE.EXPORTING : REPORTS_PAGE.EXPORT_TRAINERS}
          </DashboardButton>
        </div>
        <p className="mt-2 text-2xs text-slate-500 dark:text-slate-400">
          CSV includes all records. For filtered exports, use the Bookings or Trainers page.
        </p>
      </div>
    </section>
  );
}
