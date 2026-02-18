'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
  CalendarOff,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  FileText,
  Loader2,
} from 'lucide-react';
import { useAdminTrainers } from '@/interfaces/web/hooks/admin/useAdminTrainers';
import { useLiveRefresh, useLiveRefreshContext } from '@/core/liveRefresh/LiveRefreshContext';
import { LIVE_REFRESH_ENABLED } from '@/utils/liveRefreshConstants';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { adminTrainerAbsenceRequestRepository } from '@/infrastructure/http/admin/AdminTrainerAbsenceRequestRepository';
import type { AdminAbsenceRequestItem } from '@/infrastructure/http/admin/AdminTrainerAbsenceRequestRepository';
import { SideCanvas } from '@/components/ui/SideCanvas';

/** Period: 1 day, 1 week, or 1 month. */
type TimesheetsPeriod = '1_day' | '1_week' | '1_month';

const PERIOD_OPTIONS: { value: TimesheetsPeriod; label: string }[] = [
  { value: '1_day', label: '1 day' },
  { value: '1_week', label: '1 week' },
  { value: '1_month', label: '1 month' },
];

function getMonday(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - (day === 0 ? 6 : day - 1);
  date.setDate(diff);
  return date.toISOString().slice(0, 10);
}

function getWeekEnd(weekStart: string): string {
  const d = new Date(weekStart + 'T12:00:00');
  d.setDate(d.getDate() + 6);
  return d.toISOString().slice(0, 10);
}

function getMonthEnd(monthStart: string): string {
  const d = new Date(monthStart + 'T12:00:00');
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return d.toISOString().slice(0, 10);
}

function getDaysInMonth(monthStart: string): string[] {
  const end = getMonthEnd(monthStart);
  const dates: string[] = [];
  const d = new Date(monthStart + 'T12:00:00');
  const endDate = new Date(end + 'T12:00:00');
  while (d <= endDate) {
    dates.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function formatMonthLabel(monthStart: string): string {
  const d = new Date(monthStart + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${weekdays[d.getDay()]} ${d.getDate()}`;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatSubmittedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

type DayStatus = 'approved_absence' | 'pending_absence' | 'available' | 'unavailable' | 'none';

export function AdminTimesheetsGrid() {
  const today = new Date();
  const [period, setPeriod] = useState<TimesheetsPeriod>('1_week');
  const [anchor, setAnchor] = useState<string>(() => getMonday(today));

  const { dateFrom, dateTo, displayDates, rangeLabel } = useMemo(() => {
    if (period === '1_day') {
      return {
        dateFrom: anchor,
        dateTo: anchor,
        displayDates: [anchor],
        rangeLabel: formatDateLabel(anchor),
      };
    }
    if (period === '1_week') {
      const start = anchor;
      const end = getWeekEnd(start);
      const dates: string[] = [];
      const d = new Date(start + 'T12:00:00');
      for (let i = 0; i < 7; i++) {
        dates.push(d.toISOString().slice(0, 10));
        d.setDate(d.getDate() + 1);
      }
      return {
        dateFrom: start,
        dateTo: end,
        displayDates: dates,
        rangeLabel: `${formatDayLabel(start)} – ${formatDayLabel(end)}`,
      };
    }
    const monthStart = anchor;
    const end = getMonthEnd(monthStart);
    return {
      dateFrom: monthStart,
      dateTo: end,
      displayDates: getDaysInMonth(monthStart),
      rangeLabel: formatMonthLabel(monthStart),
    };
  }, [period, anchor]);

  const { trainers } = useAdminTrainers({ limit: 100 });

  const [trainerAvailability, setTrainerAvailability] = useState<{
    trainers: { id: string; name: string; slots: { date: string; startTime: string; endTime: string; isAvailable: boolean }[] }[];
  } | null>(null);

  const [trainerAbsence, setTrainerAbsence] = useState<{
    trainers: { id: string; name: string; approved_dates: string[]; pending_dates: string[] }[];
  } | null>(null);

  const [absenceRequests, setAbsenceRequests] = useState<AdminAbsenceRequestItem[]>([]);

  const [refreshKey, setRefreshKey] = useState(0);
  const liveRefreshContext = useLiveRefreshContext();

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useLiveRefresh('trainer_availability', refetch, { enabled: LIVE_REFRESH_ENABLED });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get<{
          trainers: { id: string; name: string; slots: { date: string; startTime: string; endTime: string; isAvailable: boolean }[] }[];
        }>(`${API_ENDPOINTS.ADMIN_TRAINERS_AVAILABILITY}?date_from=${dateFrom}&date_to=${dateTo}`, { timeout: 15000 });
        const data = res?.data;
        const trainersList = (data as { trainers?: typeof trainerAvailability.trainers })?.trainers;
        if (!cancelled && Array.isArray(trainersList)) {
          setTrainerAvailability({ trainers: trainersList });
        }
      } catch {
        if (!cancelled) setTrainerAvailability(null);
      }
    })();
    return () => { cancelled = true; };
  }, [dateFrom, dateTo, refreshKey]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get<{
          trainers: { id: string; name: string; approved_dates: string[]; pending_dates: string[] }[];
        }>(`${API_ENDPOINTS.ADMIN_TRAINERS_ABSENCE_DATES}?date_from=${dateFrom}&date_to=${dateTo}`, { timeout: 10000 });
        const data = res?.data;
        const trainersList = (data as { trainers?: typeof trainerAbsence.trainers })?.trainers;
        if (!cancelled && Array.isArray(trainersList)) {
          setTrainerAbsence({ trainers: trainersList });
        }
      } catch {
        if (!cancelled) setTrainerAbsence(null);
      }
    })();
    return () => { cancelled = true; };
  }, [dateFrom, dateTo, refreshKey]);

  useEffect(() => {
    let cancelled = false;
    adminTrainerAbsenceRequestRepository
      .list()
      .then(({ requests }) => {
        if (!cancelled) setAbsenceRequests(requests);
      })
      .catch(() => {
        if (!cancelled) setAbsenceRequests([]);
      });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const getDayStatus = useCallback(
    (trainerId: string, dateStr: string): DayStatus => {
      const id = String(trainerId);
      if (trainerAbsence?.trainers) {
        const abs = trainerAbsence.trainers.find((x) => String(x.id) === id);
        if (abs?.approved_dates?.includes(dateStr)) return 'approved_absence';
        if (abs?.pending_dates?.includes(dateStr)) return 'pending_absence';
      }
      if (!trainerAvailability?.trainers) return 'none';
      const t = trainerAvailability.trainers.find((x) => String(x.id) === id);
      if (!t) return 'none';
      const daySlots = t.slots.filter((s) => s.date === dateStr);
      const hasAvailable = daySlots.some((s) => s.isAvailable);
      const hasUnavailable = daySlots.some((s) => !s.isAvailable);
      if (hasAvailable) return 'available';
      if (hasUnavailable) return 'unavailable';
      return 'none';
    },
    [trainerAvailability, trainerAbsence]
  );

  /** Find the first pending absence request that covers (trainerId, dateStr). */
  const getRequestForCell = useCallback(
    (trainerId: string, dateStr: string): AdminAbsenceRequestItem | null => {
      const id = String(trainerId);
      return (
        absenceRequests.find(
          (r) => String(r.trainer_id) === id && r.date_from <= dateStr && dateStr <= r.date_to
        ) ?? null
      );
    },
    [absenceRequests]
  );

  const [panelRequest, setPanelRequest] = useState<AdminAbsenceRequestItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actingId, setActingId] = useState<number | null>(null);
  const [gridError, setGridError] = useState<string | null>(null);

  const openPanel = useCallback((request: AdminAbsenceRequestItem) => {
    setPanelRequest(request);
    setRejectReason('');
    setGridError(null);
  }, []);

  const closePanel = useCallback(() => {
    setPanelRequest(null);
    setRejectReason('');
  }, []);

  const handleApprove = useCallback(
    async (id: number) => {
      setActingId(id);
      setGridError(null);
      try {
        await adminTrainerAbsenceRequestRepository.approve(id);
        closePanel();
        setRefreshKey((k) => k + 1);
        liveRefreshContext?.invalidate('trainer_availability');
      } catch (err) {
        setGridError(err instanceof Error ? err.message : 'Failed to approve');
      } finally {
        setActingId(null);
      }
    },
    [closePanel, liveRefreshContext]
  );

  const handleReject = useCallback(
    async (id: number, reason?: string) => {
      setActingId(id);
      setGridError(null);
      try {
        await adminTrainerAbsenceRequestRepository.reject(id, reason || undefined);
        closePanel();
        setRefreshKey((k) => k + 1);
        liveRefreshContext?.invalidate('trainer_availability');
      } catch (err) {
        setGridError(err instanceof Error ? err.message : 'Failed to reject');
      } finally {
        setActingId(null);
      }
    },
    [closePanel, liveRefreshContext]
  );

  const goPrev = useCallback(() => {
    const d = new Date(anchor + 'T12:00:00');
    if (period === '1_day') d.setDate(d.getDate() - 1);
    else if (period === '1_week') d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setAnchor(d.toISOString().slice(0, 10));
  }, [anchor, period]);

  const goNext = useCallback(() => {
    const d = new Date(anchor + 'T12:00:00');
    if (period === '1_day') d.setDate(d.getDate() + 1);
    else if (period === '1_week') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setAnchor(d.toISOString().slice(0, 10));
  }, [anchor, period]);

  const goToThisWeek = useCallback(() => {
    setAnchor(getMonday(new Date()));
  }, []);

  const trainerRows = useMemo(
    () =>
      (trainers ?? []).map((t) => ({
        id: String(t.id),
        name: t.name ?? 'Unknown',
      })),
    [trainers]
  );

  const isLoading = !trainerAvailability && !trainerAbsence;

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      aria-labelledby="timesheets-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div className="flex flex-col gap-1">
          <h2 id="timesheets-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Trainer timesheets
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400" role="status">
            <span className="inline-block w-3 h-3 rounded-sm bg-emerald-400/80 align-middle mr-0.5" aria-hidden /> Available
            {' · '}
            <span className="inline-block w-3 h-3 rounded-sm bg-rose-400/80 align-middle mr-0.5" aria-hidden /> Unavailable
            {' · '}
            <span className="inline-block w-3 h-3 rounded-sm bg-rose-300 align-middle mr-0.5" aria-hidden /> Absence / holiday
            {' · '}
            <span className="inline-block w-3 h-3 rounded-sm bg-amber-400/80 align-middle mr-0.5" aria-hidden /> Pending (click to approve)
            {' · '}
            <span className="text-slate-400 dark:text-slate-500">Synced with schedule and trainer availability</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="timesheets-period" className="sr-only">
            Period
          </label>
          <select
            id="timesheets-period"
            value={period}
            onChange={(e) => setPeriod(e.target.value as TimesheetsPeriod)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            aria-label="Timesheets period"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={goPrev}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label={period === '1_day' ? 'Previous day' : period === '1_week' ? 'Previous week' : 'Previous month'}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-[140px] max-w-[220px] truncate text-center text-sm font-medium text-slate-700 dark:text-slate-200" title={rangeLabel}>
            {rangeLabel}
          </span>
          <button
            type="button"
            onClick={goNext}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label={period === '1_day' ? 'Next day' : period === '1_week' ? 'Next week' : 'Next month'}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goToThisWeek}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            This week
          </button>
          <button
            type="button"
            onClick={refetch}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Refresh timesheets"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Refresh
          </button>
        </div>
      </div>

      {gridError && (
        <div className="mx-4 mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
          {gridError}
        </div>
      )}

      <div className="overflow-x-auto">
        {isLoading && !trainerRows.length ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-hidden />
          </div>
        ) : trainerRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarOff className="h-10 w-10 text-slate-400" aria-hidden />
            <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">No trainers</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Add trainers to see timesheets.</p>
          </div>
        ) : (
          <table className="w-full min-w-[600px] border-collapse text-left" role="grid" aria-readonly>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
                <th className="sticky left-0 z-10 min-w-[140px] border-r border-slate-200 bg-slate-50/95 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-800/95 dark:text-slate-300">
                  Trainer
                </th>
                {displayDates.map((dateStr) => (
                  <th
                    key={dateStr}
                    className="min-w-0 border-b border-slate-200 px-1 py-2 text-center text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:text-slate-400"
                    scope="col"
                    title={formatDateLabel(dateStr)}
                  >
                    {period === '1_month' ? dateStr.slice(8, 10) : formatDayLabel(dateStr)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trainerRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 min-w-[140px] border-r border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    {row.name}
                  </th>
                  {displayDates.map((dateStr) => {
                    const status = getDayStatus(row.id, dateStr);
                    const request = status === 'pending_absence' ? getRequestForCell(row.id, dateStr) : null;
                    const isClickable = request !== null;
                    const cellBg =
                      status === 'approved_absence'
                        ? 'bg-rose-100/80 dark:bg-rose-950/40'
                        : status === 'pending_absence'
                          ? 'bg-amber-50/80 dark:bg-amber-950/30'
                          : status === 'available'
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/20'
                            : status === 'unavailable'
                              ? 'bg-rose-50/70 dark:bg-rose-950/20'
                              : 'bg-slate-50/50 dark:bg-slate-800/30';
                    return (
                      <td
                        key={dateStr}
                        className={`border border-slate-200 p-1 dark:border-slate-700 ${
                          period === '1_month' ? 'min-w-0 w-12 max-w-[4rem]' : 'min-w-[80px]'
                        } ${cellBg} ${isClickable ? 'cursor-pointer hover:ring-1 hover:ring-amber-400 dark:hover:ring-amber-500' : ''}`}
                        role={isClickable ? 'button' : undefined}
                        tabIndex={isClickable ? 0 : undefined}
                        onClick={() => isClickable && request && openPanel(request)}
                        onKeyDown={(e) => {
                          if (isClickable && request && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            openPanel(request);
                          }
                        }}
                        title={
                          status === 'approved_absence'
                            ? 'Absence / holiday'
                            : status === 'pending_absence'
                              ? 'Pending absence – click to approve or reject'
                              : status === 'available'
                                ? 'Available'
                                : status === 'unavailable'
                                  ? 'Unavailable'
                                  : 'Not set'
                        }
                        aria-label={`${row.name}, ${dateStr}: ${status.replace('_', ' ')}${isClickable ? ', click to open' : ''}`}
                      >
                        {status === 'approved_absence' && (
                          <span className="block text-center text-[10px] font-medium text-rose-700 dark:text-rose-300">
                            Absence
                          </span>
                        )}
                        {status === 'pending_absence' && (
                          <span className="block text-center text-[10px] font-medium text-amber-700 dark:text-amber-300">
                            Pending
                          </span>
                        )}
                        {status === 'available' && (
                          <span className="block text-center text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                            Available
                          </span>
                        )}
                        {status === 'unavailable' && (
                          <span className="block text-center text-[10px] font-medium text-rose-700 dark:text-rose-400">
                            Unavailable
                          </span>
                        )}
                        {status === 'none' && (
                          <span className="block text-center text-[10px] italic text-slate-400 dark:text-slate-500">
                            –
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <SideCanvas
        isOpen={panelRequest !== null}
        onClose={closePanel}
        title={panelRequest ? `${panelRequest.trainer_name} – Absence request` : 'Absence request'}
        description={panelRequest ? `${formatDate(panelRequest.date_from)} – ${formatDate(panelRequest.date_to)}` : undefined}
        footer={
          panelRequest ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleApprove(panelRequest.id)}
                disabled={actingId !== null}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-900/50 disabled:opacity-50"
              >
                {actingId === panelRequest.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CheckCircle2 className="h-4 w-4" aria-hidden />}
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleReject(panelRequest.id, rejectReason.trim() || undefined)}
                disabled={actingId !== null}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
              >
                {actingId === panelRequest.id ? null : <XCircle className="h-4 w-4" aria-hidden />}
                Reject
              </button>
            </div>
          ) : null
        }
      >
        {panelRequest && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                <User className="h-4 w-4 text-slate-600 dark:text-slate-300" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Trainer</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{panelRequest.trainer_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-300" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Dates</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(panelRequest.date_from)} – {formatDate(panelRequest.date_to)}
                </p>
              </div>
            </div>
            {panelRequest.reason ? (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                  <FileText className="h-4 w-4 text-slate-600 dark:text-slate-300" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Reason</p>
                  <p className="text-slate-700 dark:text-slate-300">{panelRequest.reason}</p>
                </div>
              </div>
            ) : null}
            <p className="text-xs text-slate-500 dark:text-slate-400">Submitted {formatSubmittedAt(panelRequest.created_at)}</p>
            <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
              <label htmlFor="timesheets-reject-reason" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Rejection reason (optional)
              </label>
              <textarea
                id="timesheets-reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Cover not available for these dates"
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                aria-describedby="timesheets-reject-hint"
              />
              <span id="timesheets-reject-hint" className="sr-only">
                Optional reason shown to the trainer when you reject this request.
              </span>
            </div>
          </div>
        )}
      </SideCanvas>
    </section>
  );
}
