"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, toDateKey, isSameDay, formatShortDay, formatDayNum } from "./calendar-utils";

export interface HorizontalCalendarProps {
  currentDate: Date;
  onCurrentDateChange?: (date: Date) => void;
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  numDays?: number;
  className?: string;
}

export function HorizontalCalendar({
  currentDate,
  onCurrentDateChange,
  selectedDate,
  onSelectDate,
  numDays = 14,
  className = "",
}: HorizontalCalendarProps) {
  const today = new Date();
  const dates = React.useMemo(() => {
    const out: Date[] = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - Math.floor(numDays / 2));
    for (let i = 0; i < numDays; i++) {
      out.push(addDays(start, i));
    }
    return out;
  }, [currentDate, numDays]);

  const goPrev = () => onCurrentDateChange?.(addDays(currentDate, -7));
  const goNext = () => onCurrentDateChange?.(addDays(currentDate, 7));

  return (
    <div className={`flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}>
      <button
        type="button"
        onClick={goPrev}
        className="shrink-0 rounded p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="Previous week"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto py-1">
        {dates.map((d) => {
          const key = toDateKey(d);
          const isSelected = selectedDate ? isSameDay(d, selectedDate) : isSameDay(d, currentDate);
          const isToday = isSameDay(d, today);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate?.(d)}
              className={`flex min-w-[52px] shrink-0 flex-col items-center rounded-lg border px-1 py-2 text-center transition ${
                isSelected
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-900/40 dark:text-brand-200"
                  : isToday
                    ? "border-slate-300 bg-slate-50 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <span className="text-micro font-medium text-slate-500 dark:text-slate-400">{formatShortDay(d)}</span>
              <span className={`text-lg font-semibold ${isSelected ? "text-brand-700 dark:text-brand-200" : ""}`}>
                {formatDayNum(d)}
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={goNext}
        className="shrink-0 rounded p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="Next week"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
