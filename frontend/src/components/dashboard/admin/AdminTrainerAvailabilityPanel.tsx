'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import moment from 'moment';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminTrainerAvailabilityDates } from '@/interfaces/web/hooks/admin/useAdminTrainerAvailabilityDates';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import type { AdminTrainerDTO } from '@/core/application/admin/dto/AdminTrainerDTO';

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface AdminTrainerAvailabilityPanelProps {
  trainer: AdminTrainerDTO;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Side panel: calendar view of trainer availability (synced from trainer dashboard).
 * Green = available, Red = unavailable, Amber = absence (approved or pending), synced with trainer dashboard.
 */
export function AdminTrainerAvailabilityPanel({
  trainer,
  isOpen,
  onClose,
}: AdminTrainerAvailabilityPanelProps) {
  const [monthMoment, setMonthMoment] = useState(() => moment().startOf('month'));
  const dateFrom = monthMoment.clone().startOf('month').format('YYYY-MM-DD');
  const dateTo = monthMoment.clone().endOf('month').format('YYYY-MM-DD');
  const { dates: availabilityDates, unavailableDates, loading } = useAdminTrainerAvailabilityDates(
    trainer.id,
    dateFrom,
    dateTo
  );
  const availableSet = useMemo(() => new Set(availabilityDates), [availabilityDates]);
  const unavailableSet = useMemo(() => new Set(unavailableDates ?? []), [unavailableDates]);

  const [approvedAbsenceSet, setApprovedAbsenceSet] = useState<Set<string>>(new Set());
  const [pendingAbsenceSet, setPendingAbsenceSet] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!trainer.id || !dateFrom || !dateTo) return;
    const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
    const url = `${API_ENDPOINTS.ADMIN_TRAINER_ABSENCE_DATES(trainer.id)}?${params.toString()}`;
    apiClient.get<{ data?: { approved_dates?: string[]; pending_dates?: string[] } } | { approved_dates?: string[]; pending_dates?: string[] }>(url).then((res) => {
      const raw = res.data;
      const data = raw && typeof raw === 'object' && 'data' in raw ? (raw as { data?: { approved_dates?: string[]; pending_dates?: string[] } }).data : raw as { approved_dates?: string[]; pending_dates?: string[] } | undefined;
      setApprovedAbsenceSet(new Set(data?.approved_dates ?? []));
      setPendingAbsenceSet(new Set(data?.pending_dates ?? []));
    }).catch(() => {
      setApprovedAbsenceSet(new Set());
      setPendingAbsenceSet(new Set());
    });
  }, [trainer.id, dateFrom, dateTo]);

  const monthDays: moment.Moment[] = useMemo(() => {
    const start = monthMoment.clone().startOf('month').startOf('week').isoWeekday(1);
    const end = monthMoment.clone().endOf('month').endOf('week').isoWeekday(7);
    const out: moment.Moment[] = [];
    const d = start.clone();
    while (d.isSameOrBefore(end, 'day')) {
      out.push(d.clone());
      d.add(1, 'day');
    }
    return out;
  }, [monthMoment]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-overlay flex justify-end"
      aria-modal="true"
      role="dialog"
      aria-label={`Availability for ${trainer.name}`}
    >
      <button
        type="button"
        className="flex-1 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="w-full max-w-md flex flex-col bg-white dark:bg-slate-900 shadow-xl border-l border-slate-200 dark:border-slate-800">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              View availability
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{trainer.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Close panel"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Legend */}
          <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800/50">
            <span className="flex items-center gap-1.5">
              <span
                className="h-5 w-5 rounded-full bg-emerald-500 shrink-0"
                aria-hidden
              />
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-5 w-5 rounded-full bg-rose-500 shrink-0"
                aria-hidden
              />
              Unavailable
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-5 w-5 shrink-0 rounded-full border-2 border-dashed border-amber-500 bg-amber-50/50 dark:bg-amber-900/20"
                aria-hidden
              />
              Absence
            </span>
          </div>

          {/* Month nav */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMonthMoment(monthMoment.clone().subtract(1, 'month'))}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {monthMoment.format('MMMM YYYY')}
            </span>
            <button
              type="button"
              onClick={() => setMonthMoment(monthMoment.clone().add(1, 'month'))}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAY_HEADERS.map((h) => (
              <div
                key={h}
                className="py-1 text-[10px] font-medium text-slate-500 dark:text-slate-400"
              >
                {h}
              </div>
            ))}
            {loading ? (
              <div className="col-span-7 grid grid-cols-7 gap-px py-4 animate-pulse" aria-busy="true" aria-label="Loading availability">
                {Array.from({ length: 35 }, (_, i) => (
                  <div key={i} className="h-8 bg-slate-200 dark:bg-slate-700 rounded" />
                ))}
              </div>
            ) : (
              monthDays.map((d) => {
                const dateStr = d.format('YYYY-MM-DD');
                const isCurrentMonth = d.month() === monthMoment.month();
                const isPast = d.isBefore(moment(), 'day');
                const isAvailable = availableSet.has(dateStr);
                const isUnavailable = unavailableSet.has(dateStr);
                const isApprovedAbsence = approvedAbsenceSet.has(dateStr);
                const isPendingAbsence = pendingAbsenceSet.has(dateStr);
                const isAbsence = isApprovedAbsence || isPendingAbsence;
                const status = !isCurrentMonth
                  ? 'other-month'
                  : isPast
                    ? 'past'
                    : isApprovedAbsence
                      ? 'absence'
                      : isPendingAbsence
                        ? 'pending_absence'
                        : isAvailable
                          ? 'available'
                          : isUnavailable
                            ? 'unavailable'
                            : 'neutral';
                return (
                  <div
                    key={dateStr}
                    className={`min-h-[36px] flex items-center justify-center rounded-full text-xs font-medium ${
                      status === 'other-month'
                        ? 'text-slate-300 dark:text-slate-600'
                        : status === 'past'
                          ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                          : status === 'absence'
                            ? 'border-2 border-dashed border-rose-500 bg-rose-50/80 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200'
                            : status === 'pending_absence'
                              ? 'border-2 border-dashed border-amber-500 bg-amber-50/50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200'
                              : status === 'available'
                                ? 'bg-emerald-500 text-white dark:bg-emerald-600'
                                : status === 'unavailable'
                                  ? 'bg-rose-500/90 text-white dark:bg-rose-600'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                    title={`${d.format('D MMM YYYY')}: ${
                      status === 'past' ? 'Past' : status === 'absence' ? 'Absence' : status === 'pending_absence' ? 'Pending absence' : status === 'available' ? 'Available' : status === 'unavailable' ? 'Unavailable' : 'Not set'
                    }`}
                  >
                    {d.date()}
                  </div>
                );
              })
            )}
          </div>
          <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
            Synced from trainer&apos;s dashboard. Green = available, red = unavailable.
          </p>
        </div>
      </div>
    </div>
  );
}
