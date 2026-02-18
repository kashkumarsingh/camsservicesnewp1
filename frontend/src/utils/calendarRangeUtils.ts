/**
 * Shared calendar range utilities for day/week/month period pickers.
 * Used by Admin Schedule, Parent dashboard, and Trainer dashboard.
 */

export type CalendarPeriod = '1_day' | '1_week' | '1_month';

export const CALENDAR_PERIOD_OPTIONS: { value: CalendarPeriod; label: string }[] = [
  { value: '1_day', label: '1 day' },
  { value: '1_week', label: '1 week' },
  { value: '1_month', label: '1 month' },
];

/** YYYY-MM-DD for Monday of the week containing d (UK week). */
export function getMonday(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - (day === 0 ? 6 : day - 1);
  date.setDate(diff);
  return date.toISOString().slice(0, 10);
}

/** YYYY-MM-DD for Sunday of the week (weekStart is Monday). */
export function getWeekEnd(weekStart: string): string {
  const d = new Date(weekStart + 'T12:00:00');
  d.setDate(d.getDate() + 6);
  return d.toISOString().slice(0, 10);
}

/** YYYY-MM-DD for the first day of the month containing d. */
export function getMonthStart(d: Date): string {
  const date = new Date(d);
  date.setDate(1);
  return date.toISOString().slice(0, 10);
}

/** YYYY-MM-DD for the last day of the month (monthStart is first day). */
export function getMonthEnd(monthStart: string): string {
  const d = new Date(monthStart + 'T12:00:00');
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return d.toISOString().slice(0, 10);
}

/** All YYYY-MM-DD dates in the month (monthStart is first day). */
export function getDaysInMonth(monthStart: string): string[] {
  const end = getMonthEnd(monthStart);
  const dates: string[] = [];
  const d = new Date(monthStart + 'T12:00:00');
  const endDate = new Date(end + 'T12:00:00');
  while (d <= endDate) {
    dates.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

/** YYYY-MM for month containing the given date string (YYYY-MM-DD). */
export function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

/** Format month label e.g. "January 2026". */
export function formatMonthLabel(monthStart: string): string {
  const d = new Date(monthStart + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

/** Format single date for header e.g. "Fri 30 Jan". */
export function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** Format date as short day label e.g. "Mon 10". */
export function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${weekdays[d.getDay()]} ${d.getDate()}`;
}

/** Week range label including month e.g. "Mon 16 – Sun 22 · Feb 2026". */
export function formatWeekRangeWithMonth(start: string, end: string): string {
  const startD = new Date(start + 'T12:00:00');
  const endD = new Date(end + 'T12:00:00');
  const dayRange = `${formatDayLabel(start)} – ${formatDayLabel(end)}`;
  const sameMonth = startD.getMonth() === endD.getMonth() && startD.getFullYear() === endD.getFullYear();
  const year = endD.getFullYear();
  if (sameMonth) {
    const month = endD.toLocaleDateString('en-GB', { month: 'short' });
    return `${dayRange} · ${month} ${year}`;
  }
  const startMonth = startD.toLocaleDateString('en-GB', { month: 'short' });
  const endMonth = endD.toLocaleDateString('en-GB', { month: 'short' });
  return `${formatDayLabel(start)} ${startMonth} – ${formatDayLabel(end)} ${endMonth} ${year}`;
}

/** Calendar grid for a month (YYYY-MM): array of rows, each row is 7 day dates (YYYY-MM-DD), Monday first. */
export function getMonthCalendarGrid(monthKey: string): string[][] {
  const [y, m] = monthKey.split('-').map((x) => parseInt(x, 10));
  const first = new Date(y, m - 1, 1);
  const last = new Date(y, m, 0);
  const startMonday = getMonday(first);
  const lastDayStr = `${y}-${String(m).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`;
  const endSunday = getWeekEnd(getMonday(lastDayStr));
  const rows: string[][] = [];
  const d = new Date(startMonday + 'T12:00:00');
  const endDate = new Date(endSunday + 'T12:00:00');
  while (d <= endDate) {
    const row: string[] = [];
    for (let i = 0; i < 7; i++) {
      row.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
    rows.push(row);
  }
  return rows;
}

/** Compute dateFrom, dateTo, displayDates, rangeLabel from period and anchor. */
export function getRangeFromPeriodAnchor(
  period: CalendarPeriod,
  anchor: string
): { dateFrom: string; dateTo: string; displayDates: string[]; rangeLabel: string } {
  if (period === '1_day') {
    return {
      dateFrom: anchor,
      dateTo: anchor,
      displayDates: [anchor],
      rangeLabel: formatDateLabel(anchor),
    };
  }
  if (period === '1_week') {
    const start = anchor;
    const end = getWeekEnd(start);
    const dates: string[] = [];
    const d = new Date(start + 'T12:00:00');
    for (let i = 0; i < 7; i++) {
      dates.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
    return {
      dateFrom: start,
      dateTo: end,
      displayDates: dates,
      rangeLabel: formatWeekRangeWithMonth(start, end),
    };
  }
  const monthStart = anchor;
  const end = getMonthEnd(monthStart);
  return {
    dateFrom: monthStart,
    dateTo: end,
    displayDates: getDaysInMonth(monthStart),
    rangeLabel: formatMonthLabel(monthStart),
  };
}
