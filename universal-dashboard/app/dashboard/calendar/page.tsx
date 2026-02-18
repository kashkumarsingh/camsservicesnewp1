"use client";

import React from "react";
import { MiniCalendar, MainCalendar, HorizontalCalendar } from "@/components/calendar";
import type { CalendarView, CalendarEvent } from "@/components/calendar";

function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
const today = new Date();
const in2 = new Date(today); in2.setDate(in2.getDate() + 2);
const in5 = new Date(today); in5.setDate(in5.getDate() + 5);
const MOCK_EVENTS: CalendarEvent[] = [
  { id: "1", title: "Team standup", date: toLocalDateKey(today), time: "09:00", endTime: "09:30" },
  { id: "2", title: "Review", date: toLocalDateKey(today), time: "14:00", endTime: "15:00" },
  { id: "3", title: "Workshop", date: toLocalDateKey(in2), time: "10:00", endTime: "12:00" },
  { id: "4", title: "Call", date: toLocalDateKey(in5), time: "11:00", endTime: "11:30" },
];

export default function CalendarShowcasePage() {
  const [mainView, setMainView] = React.useState<CalendarView>("month");
  const [focusedDate, setFocusedDate] = React.useState(() => new Date());
  const [horizontalDate, setHorizontalDate] = React.useState(() => new Date());

  return (
    <section className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-display font-semibold tracking-tight text-slate-900 dark:text-slate-50">Calendar</h1>
        <p className="text-body text-slate-600 dark:text-slate-400">
          Mini and main calendar share the same date; pick a day in either to sync. Horizontal strip is independent.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[auto_1fr]">
        <div className="space-y-4">
          <h2 className="text-title font-semibold text-slate-900 dark:text-slate-50">Mini calendar</h2>
          <MiniCalendar value={focusedDate} onChange={setFocusedDate} />
        </div>

        <div className="space-y-4 min-w-0">
          <h2 className="text-title font-semibold text-slate-900 dark:text-slate-50">Main calendar</h2>
          <MainCalendar
            view={mainView}
            onViewChange={setMainView}
            currentDate={focusedDate}
            onCurrentDateChange={setFocusedDate}
            events={MOCK_EVENTS}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-title font-semibold text-slate-900 dark:text-slate-50">Horizontal calendar</h2>
        <p className="text-caption text-slate-600 dark:text-slate-400">Scrollable strip of days; click a day to select.</p>
        <HorizontalCalendar
          currentDate={horizontalDate}
          onCurrentDateChange={setHorizontalDate}
          selectedDate={horizontalDate}
          onSelectDate={setHorizontalDate}
          numDays={14}
        />
      </div>
    </section>
  );
}
