"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type CalendarView,
  getMonthDays,
  getWeekDates,
  getDayHours,
  formatMonthYear,
  formatShortDay,
  formatDayNum,
  formatTime,
  toDateKey,
  isSameDay,
  addMonths,
  addWeeks,
  addDays,
} from "./calendar-utils";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  endTime?: string;
}

export interface MainCalendarProps {
  view: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  currentDate: Date;
  onCurrentDateChange?: (date: Date) => void;
  events?: CalendarEvent[];
  className?: string;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MainCalendar({
  view,
  onViewChange,
  currentDate,
  onCurrentDateChange,
  events = [],
  className = "",
}: MainCalendarProps) {
  const monthGrid = React.useMemo(
    () => getMonthDays(currentDate.getFullYear(), currentDate.getMonth()),
    [currentDate.getFullYear(), currentDate.getMonth()],
  );
  const weekDates = React.useMemo(() => getWeekDates(currentDate), [currentDate]);
  const hours = getDayHours();
  const today = new Date();

  const goPrev = () => {
    if (view === "month") onCurrentDateChange?.(addMonths(currentDate, -1));
    if (view === "week") onCurrentDateChange?.(addWeeks(currentDate, -1));
    if (view === "day") onCurrentDateChange?.(addDays(currentDate, -1));
  };
  const goNext = () => {
    if (view === "month") onCurrentDateChange?.(addMonths(currentDate, 1));
    if (view === "week") onCurrentDateChange?.(addWeeks(currentDate, 1));
    if (view === "day") onCurrentDateChange?.(addDays(currentDate, 1));
  };

  const title =
    view === "month"
      ? formatMonthYear(currentDate)
      : view === "week"
        ? `Week of ${weekDates[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
        : currentDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const eventsByDate = React.useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  return (
    <div className={`flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="rounded p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-body font-semibold text-slate-900 dark:text-slate-50">{title}</span>
          <button
            type="button"
            onClick={goNext}
            className="rounded p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-1">
          {(["month", "week", "day"] as CalendarView[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onViewChange?.(v)}
              className={`rounded px-2 py-1 text-caption font-medium capitalize ${
                view === v ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "month" && (
        <div className="p-4">
          <div className="grid grid-cols-7 text-center text-caption font-medium text-slate-500 dark:text-slate-400">
            {WEEKDAY_LABELS.map((l) => (
              <div key={l} className="py-1">{l}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px rounded bg-slate-100 dark:bg-slate-800">
            {monthGrid.flat().map((cell, i) => {
              if (!cell) return <div key={`e-${i}`} className="min-h-[80px] bg-white p-1 dark:bg-slate-900" />;
              const key = toDateKey(cell);
              const dayEvents = eventsByDate[key] ?? [];
              const isToday = isSameDay(cell, today);
              return (
                <div
                  key={key}
                  className={`min-h-[80px] bg-white p-1 dark:bg-slate-900 ${isToday ? "ring-1 ring-brand-500 rounded dark:ring-brand-400" : ""}`}
                >
                  <span className={`text-caption font-medium ${isToday ? "text-brand-700 dark:text-brand-300" : "text-slate-700 dark:text-slate-200"}`}>
                    {cell.getDate()}
                  </span>
                  <div className="mt-0.5 space-y-0.5">
                    {dayEvents.slice(0, 2).map((e) => (
                      <div key={e.id} className="truncate rounded bg-brand-50 px-1 py-0.5 text-micro text-brand-800 dark:bg-brand-900/40 dark:text-brand-200">
                        {e.time} {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-micro text-slate-500 dark:text-slate-400">+{dayEvents.length - 2}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "week" && (
        <div className="flex flex-1 overflow-x-auto p-4">
          <div className="flex min-w-0 flex-1">
            <div className="w-12 shrink-0 pt-6 text-right text-micro text-slate-500 dark:text-slate-400">
              {hours.slice(8, 20).map((h) => (
                <div key={h} className="h-10">{formatTime(h)}</div>
              ))}
            </div>
            <div className="flex flex-1 grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-800">
              {weekDates.map((d) => (
                <div key={toDateKey(d)} className="min-w-0 bg-white dark:bg-slate-900">
                  <div className={`border-b p-1 text-center text-caption dark:border-slate-700 ${isSameDay(d, today) ? "bg-brand-50 font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-200" : "text-slate-700 dark:text-slate-200"}`}>
                    {formatShortDay(d)} {formatDayNum(d)}
                  </div>
                  <div className="min-h-[400px]">
                    {hours.slice(8, 20).map((h) => {
                      const key = `${toDateKey(d)}-${h}`;
                      const evs = eventsByDate[toDateKey(d)]?.filter((e) => e.time === formatTime(h)) ?? [];
                      return (
                        <div key={key} className="h-10 border-b border-slate-50 dark:border-slate-800">
                          {evs.map((e) => (
                            <div key={e.id} className="mx-0.5 truncate rounded bg-brand-100 px-1 py-0.5 text-micro text-brand-800 dark:bg-brand-900/40 dark:text-brand-200">
                              {e.title}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === "day" && (
        <div className="flex flex-1 overflow-auto p-4">
          <div className="w-14 shrink-0 pt-6 text-right text-micro text-slate-500 dark:text-slate-400">
            {hours.map((h) => (
              <div key={h} className="h-12">{formatTime(h)}</div>
            ))}
          </div>
          <div className="flex-1 border-l border-slate-100 dark:border-slate-700">
            {hours.map((h) => {
              const key = `${toDateKey(currentDate)}-${h}`;
              const evs = eventsByDate[toDateKey(currentDate)]?.filter((e) => e.time === formatTime(h)) ?? [];
              return (
                <div key={key} className="h-12 border-b border-slate-50 px-2 dark:border-slate-800">
                  {evs.map((e) => (
                    <div key={e.id} className="rounded bg-brand-100 px-2 py-1 text-caption text-brand-800 dark:bg-brand-900/40 dark:text-brand-200">
                      {e.title} {e.time}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
