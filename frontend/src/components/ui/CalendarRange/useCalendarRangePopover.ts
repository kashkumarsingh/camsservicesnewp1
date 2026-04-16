'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { getMonthKey, getMonday } from '@/dashboard/utils/calendarRangeUtils';
import type { CalendarPeriod } from '@/dashboard/utils/calendarRangeUtils';

/**
 * Single model for calendar range popover: one open state, view keys, and hover state.
 * openCalendarPopover(anchor, period) sets the right view from anchor/period, clears hovers, opens.
 * Changing period in the dropdown should call setCalendarPopoverOpen(false).
 */
export type TriggerRect = { top: number; left: number; width: number; height: number };

export function useCalendarRangePopover() {
  const [calendarPopoverOpen, setCalendarPopoverOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<TriggerRect | null>(null);
  const [calendarViewMonthKey, setCalendarViewMonthKey] = useState(() =>
    getMonthKey(getMonday(new Date()))
  );
  const [calendarViewYear, setCalendarViewYear] = useState(() => new Date().getFullYear());
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [hoveredWeekMonday, setHoveredWeekMonday] = useState<string | null>(null);
  const [hoveredMonthKey, setHoveredMonthKey] = useState<string | null>(null);
  const calendarPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!calendarPopoverOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (calendarPopoverRef.current?.contains(target as Node)) return;
      if (target.closest?.('[data-calendar-range-popover]')) return;
      setCalendarPopoverOpen(false);
      setTriggerRect(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [calendarPopoverOpen]);

  const openCalendarPopover = useCallback(
    (anchor: string, period: CalendarPeriod, rect?: TriggerRect) => {
      setHoveredDay(null);
      setHoveredWeekMonday(null);
      setHoveredMonthKey(null);
      if (rect) setTriggerRect(rect);
      if (period === '1_day' || period === '1_week') {
        setCalendarViewMonthKey(getMonthKey(anchor));
      }
      if (period === '1_month') {
        setCalendarViewYear(new Date(anchor + 'T12:00:00').getFullYear());
      }
      setCalendarPopoverOpen(true);
    },
    []
  );

  const closeCalendarPopover = useCallback(() => {
    setCalendarPopoverOpen(false);
    setTriggerRect(null);
  }, []);

  return {
    calendarPopoverOpen,
    setCalendarPopoverOpen: (open: boolean) => {
      if (!open) setTriggerRect(null);
      setCalendarPopoverOpen(open);
    },
    triggerRect,
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
    calendarPopoverRef,
    openCalendarPopover,
    closeCalendarPopover,
  };
}
