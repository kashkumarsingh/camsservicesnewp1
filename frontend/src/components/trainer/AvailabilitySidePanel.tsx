'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import moment, { Moment } from 'moment';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, CalendarOff } from 'lucide-react';
import SideCanvas from '@/components/ui/SideCanvas';
import Button from '@/components/ui/Button';

type ViewMode = 'month' | 'week' | 'day';

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface AvailabilitySidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Current month displayed (YYYY-MM). Panel syncs with this when opened. */
  currentMonth: string;
  /** Available dates (YYYY-MM-DD). Green = available. */
  availabilityDates: Set<string>;
  /** Dates set as unavailable (red). Optional, session-only. */
  unavailableDates?: Set<string>;
  /** Dates in an absence range (red + strikethrough). Optional, session-only. */
  absenceDates?: Set<string>;
  /** Approved absence dates from API (red + scribble). */
  approvedAbsenceDates?: Set<string>;
  /** Pending absence dates from API (waiting for admin approval). */
  pendingAbsenceDates?: Set<string>;
  /** Set a date as available (true) or unavailable (false). */
  onAvailabilitySet: (date: string, available: boolean) => void;
  /** Open add-absence flow (e.g. modal) with optional prefill from/to (YYYY-MM-DD). */
  onAddAbsence: (from?: string, to?: string) => void;
  /** Save current availability. Panel passes the month being viewed for the save range. */
  onSave: (month: string) => void;
  saving: boolean;
  /** When user navigates to a different month/week (panel loads that month's dates). */
  onMonthChange?: (month: string) => void;
  /** Bulk: set weekdays in the given month as available. */
  onBulkWeekdays?: (month: string) => void;
  /** Bulk: set weekends in the given month as available. */
  onBulkWeekends?: (month: string) => void;
  /** Bulk: set all editable days in the given month as available. */
  onBulkAllDays?: (month: string) => void;
  /** Bulk: clear availability in the given month. */
  onBulkClearMonth?: (month: string) => void;
}

/** Minimum date that can be set (24h ahead). */
function getMinEditableDate(): moment.Moment {
  return moment().add(24, 'hours').startOf('day');
}

export default function AvailabilitySidePanel({
  isOpen,
  onClose,
  currentMonth,
  availabilityDates,
  unavailableDates = new Set(),
  absenceDates = new Set(),
  approvedAbsenceDates = new Set(),
  pendingAbsenceDates = new Set(),
  onAvailabilitySet,
  onAddAbsence,
  onSave,
  saving,
  onBulkWeekdays,
  onBulkWeekends,
  onBulkAllDays,
  onBulkClearMonth,
  onMonthChange,
}: AvailabilitySidePanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [panelMonth, setPanelMonth] = useState(currentMonth);
  /** Week view: Monday of the week being viewed (YYYY-MM-DD). */
  const [panelWeekStart, setPanelWeekStart] = useState(() =>
    moment().startOf('isoWeek').format('YYYY-MM-DD')
  );
  const [panelDay, setPanelDay] = useState(() => moment().format('YYYY-MM-DD'));
  /** Multi-select: set of date strings (YYYY-MM-DD) selected for actions. */
  const [selectedDatesForAction, setSelectedDatesForAction] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);

  const minEditable = getMinEditableDate();

  // Sync panel when it opens or parent month changes
  useEffect(() => {
    if (isOpen) {
      setPanelMonth(currentMonth);
      setPanelDay(moment().format('YYYY-MM-DD'));
      setPanelWeekStart(moment(currentMonth, 'YYYY-MM').startOf('month').startOf('isoWeek').format('YYYY-MM-DD'));
    }
  }, [isOpen, currentMonth]);

  const monthMoment = useMemo(() => moment(panelMonth, 'YYYY-MM'), [panelMonth]);
  /** Week view: 7 days from panelWeekStart (Monday). */
  const weekStartMoment = useMemo(() => moment(panelWeekStart, 'YYYY-MM-DD').startOf('day'), [panelWeekStart]);
  const weekEnd = useMemo(() => weekStartMoment.clone().add(6, 'days'), [weekStartMoment]);

  const goPrev = useCallback(() => {
    if (viewMode === 'month') {
      const next = monthMoment.clone().subtract(1, 'month').format('YYYY-MM');
      setPanelMonth(next);
      onMonthChange?.(next);
    } else if (viewMode === 'week') {
      const prevWeek = weekStartMoment.clone().subtract(1, 'week');
      setPanelWeekStart(prevWeek.format('YYYY-MM-DD'));
      onMonthChange?.(prevWeek.format('YYYY-MM'));
    } else setPanelDay(moment(panelDay, 'YYYY-MM-DD').subtract(1, 'day').format('YYYY-MM-DD'));
  }, [viewMode, monthMoment, weekStartMoment, panelDay, onMonthChange]);

  const goNext = useCallback(() => {
    if (viewMode === 'month') {
      const next = monthMoment.clone().add(1, 'month').format('YYYY-MM');
      setPanelMonth(next);
      onMonthChange?.(next);
    } else if (viewMode === 'week') {
      const nextWeek = weekStartMoment.clone().add(1, 'week');
      setPanelWeekStart(nextWeek.format('YYYY-MM-DD'));
      onMonthChange?.(nextWeek.format('YYYY-MM'));
    } else setPanelDay(moment(panelDay, 'YYYY-MM-DD').add(1, 'day').format('YYYY-MM-DD'));
  }, [viewMode, monthMoment, weekStartMoment, panelDay, onMonthChange]);

  const goToToday = useCallback(() => {
    const today = moment();
    setPanelMonth(today.format('YYYY-MM'));
    setPanelWeekStart(today.clone().startOf('isoWeek').format('YYYY-MM-DD'));
    setPanelDay(today.format('YYYY-MM-DD'));
    onMonthChange?.(today.format('YYYY-MM'));
  }, [onMonthChange]);

  const handleDateClick = useCallback((dateStr: string) => {
    const d = moment(dateStr, 'YYYY-MM-DD');
    if (d.isBefore(minEditable, 'day')) return;
    setSelectedDatesForAction((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  }, [minEditable]);

  const clearSelection = useCallback(() => setSelectedDatesForAction(new Set()), []);

  const handleMakeAvailable = useCallback(() => {
    selectedDatesForAction.forEach((dateStr) => onAvailabilitySet(dateStr, true));
    setSelectedDatesForAction(new Set());
  }, [selectedDatesForAction, onAvailabilitySet]);

  const handleUnavailable = useCallback(() => {
    selectedDatesForAction.forEach((dateStr) => onAvailabilitySet(dateStr, false));
    setSelectedDatesForAction(new Set());
  }, [selectedDatesForAction, onAvailabilitySet]);

  const handleAddAbsenceClick = useCallback(() => {
    if (selectedDatesForAction.size > 0) {
      const sorted = Array.from(selectedDatesForAction).sort();
      onAddAbsence(sorted[0], sorted[sorted.length - 1]);
      setSelectedDatesForAction(new Set());
    } else {
      onAddAbsence();
    }
  }, [selectedDatesForAction, onAddAbsence]);

  // Month view: grid of days
  const monthDays = useMemo(() => {
    const start = monthMoment.clone().startOf('month').startOf('isoWeek');
    const end = monthMoment.clone().endOf('month').endOf('isoWeek');
    const days: Moment[] = [];
    const cursor = start.clone();
    while (cursor.isSameOrBefore(end, 'day')) {
      days.push(cursor.clone());
      cursor.add(1, 'day');
    }
    return days;
  }, [monthMoment]);

  // Week view: 7 days from panelWeekStart (Monday)
  const weekDays = useMemo(() => {
    const days: Moment[] = [];
    for (let i = 0; i < 7; i++) days.push(weekStartMoment.clone().add(i, 'days'));
    return days;
  }, [weekStartMoment]);

  // Day view: single day
  const dayMoment = useMemo(() => moment(panelDay, 'YYYY-MM-DD').startOf('day'), [panelDay]);

  const isEditable = (d: Moment) => d.isSameOrAfter(minEditable, 'day');

  /** Display state: available (green), approved absence (red scribble), pending (amber), unavailable (red), or neutral. */
  const getDateStatus = useCallback(
    (dateStr: string): 'available' | 'unavailable' | 'absence' | 'pending_absence' | 'neutral' => {
      if (availabilityDates.has(dateStr)) return 'available';
      if (approvedAbsenceDates?.has(dateStr)) return 'absence';
      if (pendingAbsenceDates?.has(dateStr)) return 'pending_absence';
      if (absenceDates?.has(dateStr)) return 'absence';
      if (unavailableDates?.has(dateStr)) return 'unavailable';
      return 'neutral';
    },
    [availabilityDates, approvedAbsenceDates, pendingAbsenceDates, absenceDates, unavailableDates]
  );

  const saveMonth = viewMode === 'day' ? moment(panelDay).format('YYYY-MM') : panelMonth;

  const footer = (
    <div className="flex flex-col gap-2">
      <Button onClick={() => onSave(saveMonth)} disabled={saving} variant="primary" size="sm" className="w-full">
        {saving ? 'Saving…' : 'Save'}
      </Button>
    </div>
  );

  return (
    <SideCanvas
      isOpen={isOpen}
      onClose={onClose}
      title="Set my availability"
      description="Click dates to select (multiple allowed). Use Make available, Unavailable, or Add absence. Use Today to jump to the current period."
      footer={footer}
      closeLabel="Close"
    >
      <div ref={panelRef} className="space-y-4">
        {/* View mode: Month | Week | Day */}
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800/50">
          {(['month', 'week', 'day'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium capitalize transition-colors ${
                viewMode === mode
                  ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Period navigation + Today */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-0 flex-1 text-center text-sm font-medium text-slate-900 dark:text-slate-100">
            {viewMode === 'month' && monthMoment.format('MMMM YYYY')}
            {viewMode === 'week' && `${weekStartMoment.format('D MMM')} – ${weekEnd.format('D MMM YYYY')}`}
            {viewMode === 'day' && dayMoment.format('dddd D MMMM YYYY')}
          </span>
          <button
            type="button"
            onClick={goNext}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={goToToday}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => onAddAbsence()}
            className="inline-flex items-center gap-1.5 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/50"
          >
            <CalendarOff className="h-3.5 w-3.5" aria-hidden />
            Add absence
          </button>
        </div>

        {/* Mini calendar grid */}
        <div className="min-h-[200px]">
          {viewMode === 'month' && (
            <div className="calendar-month grid grid-cols-7 gap-0.5 text-center">
              {WEEKDAY_HEADERS.map((h) => (
                <div key={h} className="py-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  {h}
                </div>
              ))}
              {monthDays.map((d) => {
                const dateStr = d.format('YYYY-MM-DD');
                const status = getDateStatus(dateStr);
                const editable = isEditable(d);
                const isCurrentMonth = d.month() === monthMoment.month();
                const statusClass =
                  status === 'available'
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200'
                    : status === 'pending_absence'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                      : status === 'absence'
                        ? 'bg-red-100 text-red-800 line-through decoration-red-600 dark:bg-red-900/40 dark:text-red-200 dark:decoration-red-400'
                        : status === 'unavailable'
                          ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-200 dark:hover:bg-red-900/50'
                          : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700';
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => handleDateClick(dateStr)}
                    disabled={!editable}
                    className={`min-h-[32px] rounded text-xs font-medium transition-colors ${
                      !editable
                        ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                        : selectedDatesForAction.has(dateStr)
                          ? 'ring-2 ring-indigo-500 ring-offset-1 bg-indigo-50 dark:bg-indigo-900/30'
                          : statusClass
                    } ${!isCurrentMonth ? 'opacity-50' : ''}`}
                    aria-label={`${d.format('D MMM YYYY')}${status === 'available' ? ', available' : status === 'pending_absence' ? ', waiting for approval' : status === 'absence' ? ', absence' : status === 'unavailable' ? ', unavailable' : ''}`}
                  >
                    {d.date()}
                  </button>
                );
              })}
            </div>
          )}

          {viewMode === 'week' && (
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((d) => {
                const dateStr = d.format('YYYY-MM-DD');
                const status = getDateStatus(dateStr);
                const editable = isEditable(d);
                const statusClass =
                  status === 'available'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                    : status === 'pending_absence'
                      ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-600 dark:bg-amber-900/40 dark:text-amber-200'
                      : status === 'absence'
                        ? 'border-red-300 bg-red-100 text-red-800 dark:border-red-600 dark:bg-red-900/40 dark:text-red-200'
                        : status === 'unavailable'
                          ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-600 dark:bg-red-900/30 dark:text-red-200'
                          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => handleDateClick(dateStr)}
                    disabled={!editable}
                    className={`flex flex-col items-center justify-center rounded-lg border py-3 text-center ${
                      !editable
                        ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500'
                        : selectedDatesForAction.has(dateStr)
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                          : statusClass
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{d.format('ddd')}</span>
                    <span className={`text-lg font-semibold ${status === 'absence' ? 'line-through decoration-red-600 dark:decoration-red-400' : ''}`} title={status === 'pending_absence' ? 'Waiting for approval' : undefined}>
                      {d.date()}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {viewMode === 'day' && (() => {
            const dayStr = dayMoment.format('YYYY-MM-DD');
            const status = getDateStatus(dayStr);
            const dayStatusClass =
              status === 'available'
                ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30'
                : status === 'pending_absence'
                  ? 'border-amber-300 bg-amber-50 dark:border-amber-600 dark:bg-amber-900/40'
                  : status === 'absence'
                    ? 'border-red-300 bg-red-100 dark:border-red-600 dark:bg-red-900/40'
                    : status === 'unavailable'
                      ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/30'
                      : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800';
            return (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => handleDateClick(dayStr)}
                  disabled={!isEditable(dayMoment)}
                  className={`rounded-xl border-2 px-8 py-6 text-center ${
                    !isEditable(dayMoment)
                      ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800'
                      : selectedDatesForAction.has(dayStr)
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                        : dayStatusClass
                  }`}
                >
                  <span
                    className={`block text-2xl font-bold ${
                      status === 'absence'
                        ? 'line-through decoration-red-600 dark:decoration-red-400 text-red-800 dark:text-red-200'
                        : status === 'pending_absence'
                          ? 'text-amber-800 dark:text-amber-200'
                          : status === 'unavailable'
                            ? 'text-red-800 dark:text-red-200'
                            : status === 'available'
                              ? 'text-emerald-800 dark:text-emerald-200'
                              : 'text-slate-900 dark:text-slate-100'
                    }`}
                    title={status === 'pending_absence' ? 'Waiting for approval' : undefined}
                  >
                    {dayMoment.date()}
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{dayMoment.format('MMMM YYYY')}</span>
                  {status === 'pending_absence' && (
                    <span className="block mt-1 text-xs font-medium text-amber-700 dark:text-amber-300">Waiting for approval</span>
                  )}
                </button>
              </div>
            );
          })()}
        </div>

        {/* Date action block: shown when one or more dates are selected */}
        {selectedDatesForAction.size > 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {selectedDatesForAction.size === 1
                  ? moment(Array.from(selectedDatesForAction)[0], 'YYYY-MM-DD').format('dddd D MMMM YYYY')
                  : `${selectedDatesForAction.size} dates selected`}
              </p>
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs font-medium text-slate-500 underline hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Clear selection
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleMakeAvailable}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
              >
                <CheckCircle className="h-3.5 w-3.5" aria-hidden />
                Make available
              </button>
              <button
                type="button"
                onClick={handleUnavailable}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                <XCircle className="h-3.5 w-3.5" aria-hidden />
                Unavailable
              </button>
              <button
                type="button"
                onClick={handleAddAbsenceClick}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/50"
              >
                <CalendarOff className="h-3.5 w-3.5" aria-hidden />
                Add absence
              </button>
            </div>
          </div>
        )}

        {/* Add absence (always visible – opens modal to pick a date range) */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
          <button
            type="button"
            onClick={() => onAddAbsence()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/50"
          >
            <CalendarOff className="h-3.5 w-3.5" aria-hidden />
            Add absence
          </button>
        </div>

        {/* Bulk actions */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Bulk:</span>
          {onBulkWeekdays && (
            <button
              type="button"
              onClick={() => onBulkWeekdays(panelMonth)}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Weekdays
            </button>
          )}
          {onBulkWeekends && (
            <button
              type="button"
              onClick={() => onBulkWeekends(panelMonth)}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Weekends
            </button>
          )}
          {onBulkAllDays && (
            <button
              type="button"
              onClick={() => onBulkAllDays(panelMonth)}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              All days
            </button>
          )}
          {onBulkClearMonth && (
            <button
              type="button"
              onClick={() => onBulkClearMonth(panelMonth)}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Clear month
            </button>
          )}
        </div>
      </div>
    </SideCanvas>
  );
}
