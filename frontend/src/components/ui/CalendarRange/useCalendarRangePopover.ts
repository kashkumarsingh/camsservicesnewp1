'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { getMonthKey, getMonday } from '@/utils/calendarRangeUtils';
import type { CalendarPeriod } from '@/utils/calendarRangeUtils';

/**
 * Single model for calendar range popover: one open state, view keys, and hover state.
 * openCalendarPopover(anchor, period) sets the right view from anchor/period, clears hovers, opens.
 * Changing period in the dropdown should call setCalendarPopoverOpen(false).
 */
export function useCalendarRangePopover() {
  const [calendarPopoverOpen, setCalendarPopoverOpen] = useState(false);
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
      const target = e.target as Node;
      if (calendarPopoverRef.current && !calendarPopoverRef.current.contains(target)) {
        setCalendarPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [calendarPopoverOpen]);

  const openCalendarPopover = useCallback((anchor: string, period: CalendarPeriod) => {
    setHoveredDay(null);
    setHoveredWeekMonday(null);
    setHoveredMonthKey(null);
    if (period === '1_day' || period === '1_week') {
      setCalendarViewMonthKey(getMonthKey(anchor));
    }
    if (period === '1_month') {
      setCalendarViewYear(new Date(anchor + 'T12:00:00').getFullYear());
    }
    setCalendarPopoverOpen(true);
  }, []);

  return {
    calendarPopoverOpen,
    setCalendarPopoverOpen,
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
  };
}
