'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import {
  getMonday,
  getMonthStart,
  getRangeFromPeriodAnchor,
  CALENDAR_PERIOD_OPTIONS,
} from '@/utils/calendarRangeUtils';
import type { CalendarPeriod } from '@/utils/calendarRangeUtils';
import { useCalendarRangePopover } from './useCalendarRangePopover';
import { CalendarRangePopoverContent } from './CalendarRangePopoverContent';

export interface CalendarRangeToolbarProps {
  /** Current period (1 day, 1 week, 1 month). */
  period: CalendarPeriod;
  /** Set period; caller should also close popover when period changes. */
  setPeriod: (p: CalendarPeriod) => void;
  /** Anchor date: single day (YYYY-MM-DD), Monday for week, or 1st for month. */
  anchor: string;
  setAnchor: (a: string) => void;
  /** Optional: period dropdown id and aria-label for accessibility. */
  periodSelectId?: string;
  periodSelectLabel?: string;
  /** Optional: show "Last week" / "This week" only when period is 1_week. */
  showWeekShortcuts?: boolean;
  /** Optional: label for "go to current" button when period is 1_day ("Today") or 1_month ("This month"). */
  goToCurrentLabel?: string;
  /** Optional: className for the toolbar wrapper (e.g. gap and flex). */
  className?: string;
  /** When true, use stacked layout for narrow panels: row 1 = Day|Week|Month, row 2 = Prev + range + Next, row 3 = Last week | This week. Keeps range and arrows on one line. */
  compact?: boolean;
  /** Optional: render extra buttons after the range controls (e.g. Refresh). */
  children?: React.ReactNode;
}

/**
 * One trigger pattern for all periods:
 * - 1 day:   Prev | [range label ▼] | Next → opens day popover
 * - 1 week:  Prev | [range label ▼] | Next | Last week | This week → opens week popover
 * - 1 month: Prev | [range label ▼] | Next → opens month popover
 * Uses shared popover state and single ref for click-outside.
 */
export function CalendarRangeToolbar({
  period,
  setPeriod,
  anchor,
  setAnchor,
  periodSelectId = 'calendar-period',
  periodSelectLabel = 'Period',
  showWeekShortcuts = true,
  goToCurrentLabel,
  className = '',
  compact = false,
  children,
}: CalendarRangeToolbarProps) {
  const popover = useCalendarRangePopover();
  const { rangeLabel } = getRangeFromPeriodAnchor(period, anchor);

  const handlePeriodChange = (newPeriod: CalendarPeriod) => {
    popover.closeCalendarPopover();
    setPeriod(newPeriod);
    const d = new Date(anchor + 'T12:00:00');
    if (newPeriod === '1_week' && d.getDay() !== 1) setAnchor(getMonday(d));
    if (newPeriod === '1_month') setAnchor(getMonthStart(d));
  };

  const goPrev = () => {
    const d = new Date(anchor + 'T12:00:00');
    if (period === '1_day') d.setDate(d.getDate() - 1);
    else if (period === '1_week') d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setAnchor(d.toISOString().slice(0, 10));
  };

  const goNext = () => {
    const d = new Date(anchor + 'T12:00:00');
    if (period === '1_day') d.setDate(d.getDate() + 1);
    else if (period === '1_week') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setAnchor(d.toISOString().slice(0, 10));
  };

  const goToCurrent = () => {
    const now = new Date();
    if (period === '1_day') setAnchor(now.toISOString().slice(0, 10));
    else if (period === '1_week') setAnchor(getMonday(now));
    else setAnchor(getMonthStart(now));
  };

  const goLastWeek = () => {
    const now = new Date();
    const lastMonday = getMonday(now);
    const d = new Date(lastMonday + 'T12:00:00');
    d.setDate(d.getDate() - 7);
    setAnchor(d.toISOString().slice(0, 10));
  };

  const defaultGoToLabel = period === '1_day' ? 'Today' : period === '1_month' ? 'This month' : 'This week';
  const label = goToCurrentLabel ?? defaultGoToLabel;

  const triggerButtonClass =
    'flex min-w-[140px] max-w-[260px] items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700';
  const navButtonClass =
    'rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700';
  const shortcutButtonClass =
    'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700';
  const thisWeekButtonClass =
    'rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/50';

  const tabBaseClass =
    'rounded-t-lg border-b-2 px-3 py-2 text-sm font-medium transition-colors min-h-[44px] sm:min-h-0 sm:py-1.5';
  const tabInactiveClass =
    'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600';
  const tabActiveClass =
    'border-primary-blue text-primary-blue dark:border-primary-blue dark:text-primary-blue bg-white dark:bg-slate-900 -mb-px';

  const navRowClass = compact ? 'flex items-center gap-2 min-w-0' : '';
  const triggerClassWeek = compact ? `${triggerButtonClass} min-w-0 flex-1` : `${triggerButtonClass} min-w-[180px]`;

  const popoverContentProps = {
    period,
    anchor,
    onSelect: setAnchor,
    onClose: popover.closeCalendarPopover,
    calendarViewMonthKey: popover.calendarViewMonthKey,
    setCalendarViewMonthKey: popover.setCalendarViewMonthKey,
    calendarViewYear: popover.calendarViewYear,
    setCalendarViewYear: popover.setCalendarViewYear,
    hoveredDay: popover.hoveredDay,
    setHoveredDay: popover.setHoveredDay,
    hoveredWeekMonday: popover.hoveredWeekMonday,
    setHoveredWeekMonday: popover.setHoveredWeekMonday,
    hoveredMonthKey: popover.hoveredMonthKey,
    setHoveredMonthKey: popover.setHoveredMonthKey,
  };

  return (
    <div
      className={
        compact
          ? `flex flex-col gap-2 w-full min-w-0 ${className}`
          : `flex flex-wrap items-center gap-2 ${className}`
      }
    >
      {popover.calendarPopoverOpen &&
        popover.triggerRect &&
        typeof document !== 'undefined' &&
        document.body &&
        createPortal(
          <div data-calendar-range-popover>
            <CalendarRangePopoverContent
              {...popoverContentProps}
              anchorRect={popover.triggerRect}
            />
          </div>,
          document.body
        )}

      {/* Month | Week | Day tabs */}
      <div
        role="tablist"
        aria-label={periodSelectLabel}
        id={periodSelectId}
        className="inline-flex rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 dark:border-slate-700 dark:bg-slate-800/80"
      >
        {CALENDAR_PERIOD_OPTIONS.map((opt) => {
          const isActive = period === opt.value;
          const tabLabel = opt.value === '1_month' ? 'Month' : opt.value === '1_week' ? 'Week' : 'Day';
          return (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${periodSelectId}-panel`}
              id={`${periodSelectId}-tab-${opt.value}`}
              onClick={() => handlePeriodChange(opt.value)}
              className={`${tabBaseClass} ${isActive ? tabActiveClass : tabInactiveClass}`}
            >
              {tabLabel}
            </button>
          );
        })}
      </div>

      {/* Month: Prev | [label ▼] | Next */}
      {period === '1_month' && (
        compact ? (
          <div className={navRowClass}>
            <button type="button" onClick={goPrev} className={`${navButtonClass} shrink-0`} aria-label="Previous month">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="relative flex-1 min-w-0" ref={popover.calendarPopoverRef}>
              <button
                type="button"
                onClick={(e) =>
                  popover.openCalendarPopover(
                    anchor,
                    period,
                    (e.currentTarget as HTMLElement).getBoundingClientRect()
                  )
                }
                className={`${triggerButtonClass} w-full min-w-0`}
                aria-label="Choose month"
                aria-expanded={popover.calendarPopoverOpen}
              >
                <span className="truncate">{rangeLabel}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
              </button>
            </div>
            <button type="button" onClick={goNext} className={`${navButtonClass} shrink-0`} aria-label="Next month">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <>
            <button type="button" onClick={goPrev} className={navButtonClass} aria-label="Previous month">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="relative" ref={popover.calendarPopoverRef}>
              <button
                type="button"
                onClick={(e) =>
                  popover.openCalendarPopover(
                    anchor,
                    period,
                    (e.currentTarget as HTMLElement).getBoundingClientRect()
                  )
                }
                className={triggerButtonClass}
                aria-label="Choose month"
                aria-expanded={popover.calendarPopoverOpen}
              >
                <span className="truncate">{rangeLabel}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
              </button>
            </div>
            <button type="button" onClick={goNext} className={navButtonClass} aria-label="Next month">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )
      )}

      {/* Week: Prev | [label ▼] | Next | Last week | This week */}
      {period === '1_week' && (
        compact ? (
          <>
            <div className={navRowClass}>
              <button type="button" onClick={goPrev} className={`${navButtonClass} shrink-0`} aria-label="Previous week">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="relative flex-1 min-w-0" ref={popover.calendarPopoverRef}>
                <button
                  type="button"
                  onClick={(e) =>
                    popover.openCalendarPopover(
                      anchor,
                      period,
                      (e.currentTarget as HTMLElement).getBoundingClientRect()
                    )
                  }
                  className={`${triggerClassWeek}`}
                  aria-label="Choose week"
                  aria-expanded={popover.calendarPopoverOpen}
                >
                  <span className="truncate">{rangeLabel}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                </button>
              </div>
              <button type="button" onClick={goNext} className={`${navButtonClass} shrink-0`} aria-label="Next week">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            {showWeekShortcuts && (
              <div className="flex items-center gap-2">
                <button type="button" onClick={goLastWeek} className={shortcutButtonClass}>
                  Last week
                </button>
                <button type="button" onClick={goToCurrent} className={thisWeekButtonClass}>
                  This week
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <button type="button" onClick={goPrev} className={navButtonClass} aria-label="Previous week">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="relative" ref={popover.calendarPopoverRef}>
              <button
                type="button"
                onClick={(e) =>
                  popover.openCalendarPopover(
                    anchor,
                    period,
                    (e.currentTarget as HTMLElement).getBoundingClientRect()
                  )
                }
                className={`${triggerButtonClass} min-w-[180px]`}
                aria-label="Choose week"
                aria-expanded={popover.calendarPopoverOpen}
              >
                <span className="truncate">{rangeLabel}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
              </button>
            </div>
            <button type="button" onClick={goNext} className={navButtonClass} aria-label="Next week">
              <ChevronRight className="h-5 w-5" />
            </button>
            {showWeekShortcuts && (
              <>
                <button type="button" onClick={goLastWeek} className={shortcutButtonClass}>
                  Last week
                </button>
                <button type="button" onClick={goToCurrent} className={thisWeekButtonClass}>
                  This week
                </button>
              </>
            )}
          </>
        )
      )}

      {/* Day: Prev | [label ▼] | Next */}
      {period === '1_day' && (
        compact ? (
          <div className={navRowClass}>
            <button type="button" onClick={goPrev} className={`${navButtonClass} shrink-0`} aria-label="Previous day">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="relative flex-1 min-w-0" ref={popover.calendarPopoverRef}>
              <button
                type="button"
                onClick={(e) =>
                  popover.openCalendarPopover(
                    anchor,
                    period,
                    (e.currentTarget as HTMLElement).getBoundingClientRect()
                  )
                }
                className={`${triggerButtonClass} w-full min-w-0`}
                aria-label="Choose day"
                aria-expanded={popover.calendarPopoverOpen}
              >
                <span className="truncate">{rangeLabel}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
              </button>
            </div>
            <button type="button" onClick={goNext} className={`${navButtonClass} shrink-0`} aria-label="Next day">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <>
            <button type="button" onClick={goPrev} className={navButtonClass} aria-label="Previous day">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="relative" ref={popover.calendarPopoverRef}>
              <button
                type="button"
                onClick={(e) =>
                  popover.openCalendarPopover(
                    anchor,
                    period,
                    (e.currentTarget as HTMLElement).getBoundingClientRect()
                  )
                }
                className={triggerButtonClass}
                aria-label="Choose day"
                aria-expanded={popover.calendarPopoverOpen}
              >
                <span className="truncate">{rangeLabel}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
              </button>
            </div>
            <button type="button" onClick={goNext} className={navButtonClass} aria-label="Next day">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )
      )}

      {/* Today / This month when not week */}
      {period !== '1_week' && (
        <button type="button" onClick={goToCurrent} className={thisWeekButtonClass}>
          {label}
        </button>
      )}

      {children}
    </div>
  );
}
