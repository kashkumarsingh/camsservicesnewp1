'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getMonthKey,
  getWeekEnd,
  getMonthCalendarGrid,
  formatDateLabel,
  formatWeekRangeWithMonth,
} from '@/utils/calendarRangeUtils';
import type { CalendarPeriod } from '@/utils/calendarRangeUtils';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const cellSelected =
  'bg-indigo-100 font-semibold text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200';
const cellHovered =
  'bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200';
const cellCurrentMonth =
  'text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700';
const cellOtherMonth =
  'text-slate-400 hover:bg-slate-50 dark:text-slate-500 dark:hover:bg-slate-700/50';

export interface CalendarRangePopoverContentProps {
  period: CalendarPeriod;
  anchor: string;
  onSelect: (newAnchor: string) => void;
  onClose: () => void;
  calendarViewMonthKey: string;
  setCalendarViewMonthKey: (key: string) => void;
  calendarViewYear: number;
  setCalendarViewYear: (year: number) => void;
  hoveredDay: string | null;
  setHoveredDay: (d: string | null) => void;
  hoveredWeekMonday: string | null;
  setHoveredWeekMonday: (m: string | null) => void;
  hoveredMonthKey: string | null;
  setHoveredMonthKey: (k: string | null) => void;
}

export function CalendarRangePopoverContent({
  period,
  anchor,
  onSelect,
  onClose,
  calendarViewMonthKey,
  setCalendarViewMonthKey,
  calendarViewYear,
  setCalendarViewYear,
  hoveredDay,
  setHoveredDay,
  hoveredWeekMonday,
  setHoveredWeekMonday,
  hoveredMonthKey,
  setHoveredMonthKey,
}: CalendarRangePopoverContentProps) {
  if (period === '1_day') {
    return (
      <div className="absolute left-1/2 top-full z-50 mt-1 w-72 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              const [y, m] = calendarViewMonthKey.split('-').map((x) => parseInt(x, 10));
              const prevMonth = m === 1 ? 12 : m - 1;
              const prevYear = m === 1 ? y - 1 : y;
              setCalendarViewMonthKey(`${prevYear}-${String(prevMonth).padStart(2, '0')}`);
            }}
            className="rounded p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {new Date(calendarViewMonthKey + '-01T12:00:00').toLocaleDateString('en-GB', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <button
            type="button"
            onClick={() => {
              const [y, m] = calendarViewMonthKey.split('-').map((x) => parseInt(x, 10));
              const nextMonth = m === 12 ? 1 : m + 1;
              const nextYear = m === 12 ? y + 1 : y;
              setCalendarViewMonthKey(`${nextYear}-${String(nextMonth).padStart(2, '0')}`);
            }}
            className="rounded p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-px text-center" onMouseLeave={() => setHoveredDay(null)}>
          {WEEKDAY_LABELS.map((wd) => (
            <span
              key={wd}
              className="py-1 text-[10px] font-medium text-slate-500 dark:text-slate-400"
            >
              {wd}
            </span>
          ))}
          {getMonthCalendarGrid(calendarViewMonthKey).map((row) =>
            row.map((dateStr) => {
              const d = new Date(dateStr + 'T12:00:00');
              const isCurrentMonth = dateStr.slice(0, 7) === calendarViewMonthKey;
              const isSelectedDay = dateStr === anchor;
              const isHovered = dateStr === hoveredDay;
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => {
                    onSelect(dateStr);
                    onClose();
                  }}
                  onMouseEnter={() => setHoveredDay(dateStr)}
                  className={`rounded py-1.5 text-xs transition-colors ${
                    isSelectedDay
                      ? cellSelected
                      : isHovered
                        ? cellHovered
                        : isCurrentMonth
                          ? cellCurrentMonth
                          : cellOtherMonth
                  }`}
                  title={formatDateLabel(dateStr)}
                >
                  {d.getDate()}
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  if (period === '1_week') {
    return (
      <div className="absolute left-1/2 top-full z-50 mt-1 w-72 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              const [y, m] = calendarViewMonthKey.split('-').map((x) => parseInt(x, 10));
              const prevMonth = m === 1 ? 12 : m - 1;
              const prevYear = m === 1 ? y - 1 : y;
              setCalendarViewMonthKey(`${prevYear}-${String(prevMonth).padStart(2, '0')}`);
            }}
            className="rounded p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {new Date(calendarViewMonthKey + '-01T12:00:00').toLocaleDateString('en-GB', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <button
            type="button"
            onClick={() => {
              const [y, m] = calendarViewMonthKey.split('-').map((x) => parseInt(x, 10));
              const nextMonth = m === 12 ? 1 : m + 1;
              const nextYear = m === 12 ? y + 1 : y;
              setCalendarViewMonthKey(`${nextYear}-${String(nextMonth).padStart(2, '0')}`);
            }}
            className="rounded p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div
          className="grid grid-cols-7 gap-px text-center"
          onMouseLeave={() => setHoveredWeekMonday(null)}
        >
          {WEEKDAY_LABELS.map((wd) => (
            <span
              key={wd}
              className="py-1 text-[10px] font-medium text-slate-500 dark:text-slate-400"
            >
              {wd}
            </span>
          ))}
          {getMonthCalendarGrid(calendarViewMonthKey).map((row) => {
            const weekMonday = row[0];
            const isSelectedWeek = weekMonday === anchor;
            const isHoveredWeek = weekMonday === hoveredWeekMonday;
            return row.map((dateStr) => {
              const d = new Date(dateStr + 'T12:00:00');
              const isCurrentMonth = dateStr.slice(0, 7) === calendarViewMonthKey;
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => {
                    onSelect(weekMonday);
                    onClose();
                  }}
                  onMouseEnter={() => setHoveredWeekMonday(weekMonday)}
                  className={`rounded py-1.5 text-xs transition-colors ${
                    isSelectedWeek
                      ? cellSelected
                      : isHoveredWeek
                        ? cellHovered
                        : isCurrentMonth
                          ? cellCurrentMonth
                          : cellOtherMonth
                  }`}
                  title={`Week ${formatWeekRangeWithMonth(weekMonday, getWeekEnd(weekMonday))}`}
                >
                  {d.getDate()}
                </button>
              );
            });
          })}
        </div>
      </div>
    );
  }

  // 1_month: year header + 3×4 month grid
  return (
    <div className="absolute left-1/2 top-full z-50 mt-1 w-64 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCalendarViewYear(calendarViewYear - 1)}
          className="rounded p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Previous year"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {calendarViewYear}
        </span>
        <button
          type="button"
          onClick={() => setCalendarViewYear(calendarViewYear + 1)}
          className="rounded p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Next year"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1" onMouseLeave={() => setHoveredMonthKey(null)}>
        {MONTH_NAMES.map((monthName, i) => {
          const monthKey = `${calendarViewYear}-${String(i + 1).padStart(2, '0')}`;
          const isSelected = getMonthKey(anchor) === monthKey;
          const isHovered = monthKey === hoveredMonthKey;
          return (
            <button
              key={monthKey}
              type="button"
              onClick={() => {
                const firstOfMonth = `${calendarViewYear}-${String(i + 1).padStart(2, '0')}-01`;
                onSelect(firstOfMonth);
                onClose();
              }}
              onMouseEnter={() => setHoveredMonthKey(monthKey)}
              className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                isSelected ? cellSelected : isHovered ? cellHovered : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {monthName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
