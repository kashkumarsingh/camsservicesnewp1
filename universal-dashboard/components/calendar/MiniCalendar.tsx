"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getMonthDays,
  formatMonthYear,
  formatShortDay,
  toDateKey,
  isSameDay,
  addMonths,
} from "./calendar-utils";

export interface MiniCalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  className?: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MiniCalendar({ value = new Date(), onChange, className = "" }: MiniCalendarProps) {
  const [view, setView] = React.useState(() => new Date(value.getFullYear(), value.getMonth(), 1));

  React.useEffect(() => {
    if (!value) return;
    setView((prev) => {
      const next = new Date(value.getFullYear(), value.getMonth(), 1);
      return prev.getTime() === next.getTime() ? prev : next;
    });
  }, [value?.getTime()]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const grid = React.useMemo(() => getMonthDays(year, month), [year, month]);
  const selectedKey = value ? toDateKey(value) : null;

  const prev = () => setView((v) => addMonths(v, -1));
  const next = () => setView((v) => addMonths(v, 1));

  return (
    <div className={`w-full max-w-[240px] rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}>
      <div className="flex items-center justify-between px-1 pb-2 text-caption font-medium text-slate-700 dark:text-slate-200">
        <button type="button" onClick={prev} className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Previous month">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span>{formatMonthYear(view)}</span>
        <button type="button" onClick={next} className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Next month">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-micro">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-0.5 font-medium text-slate-500 dark:text-slate-400">
            {d.slice(0, 2)}
          </div>
        ))}
        {grid.flat().map((cell, i) => {
          if (!cell) return <div key={`e-${i}`} />;
          const key = toDateKey(cell);
          const isSelected = selectedKey === key;
          const isToday = isSameDay(cell, new Date());
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange?.(cell)}
              className={`h-7 w-full rounded text-caption font-medium ${
                isSelected
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : isToday
                    ? "bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/40 dark:text-brand-200 dark:hover:bg-brand-900/60"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              {cell.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
