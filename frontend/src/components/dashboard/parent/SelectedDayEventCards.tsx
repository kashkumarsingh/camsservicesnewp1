'use client';

import React from 'react';
import moment from 'moment';
import { Activity, ChevronRight } from 'lucide-react';
import type { ChildActivitySession } from '@/components/dashboard/ChildrenActivitiesCalendar';
import { getChildColor } from '@/utils/childColorUtils';
import { getCalendarLabelClasses, type CalendarSessionTimeStatus } from '@/utils/calendarLabelConstants';

function formatDurationMinutes(startTime: string, endTime: string): string {
  const start = moment(startTime, ['HH:mm', 'HH:mm:ss']);
  const end = moment(endTime, ['HH:mm', 'HH:mm:ss']);
  const mins = end.diff(start, 'minutes');
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainder = mins % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

function formatDateRange(date: string, startTime: string, endTime: string): string {
  const d = moment(date, 'YYYY-MM-DD');
  const start = moment(`${date} ${startTime}`, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss']);
  const end = moment(`${date} ${endTime}`, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss']);
  const dayLabel = d.format('ddd, D MMM');
  return `${dayLabel} ${start.format('HH:mm')} – ${end.format('HH:mm')}`;
}

interface SelectedDayEventCardsProps {
  sessions: ChildActivitySession[];
  onSessionClick?: (session: ChildActivitySession) => void;
  /** Optional: show empty state when no sessions */
  emptyMessage?: string;
}

/** Map session timing to calendar label status (Google Calendar–style meaningful label). */
function getSessionTimeStatus(session: ChildActivitySession): CalendarSessionTimeStatus {
  if (session.isOngoing) return 'live';
  if (session.isPast) return 'past';
  return 'upcoming';
}

/**
 * Event cards for the selected day (Google Calendar–style: coloured by child label, status dot).
 * Shows child colour as left border + fill, small status dot (Past/Live/Upcoming), title, duration; tappable to open session detail.
 */
export default function SelectedDayEventCards({
  sessions,
  onSessionClick,
  emptyMessage = 'No sessions on this day',
}: SelectedDayEventCardsProps) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 px-4 py-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2" role="list">
      {sessions.map((session) => {
        const title =
          session.activities?.length > 0
            ? session.activities.join(', ')
            : "Trainer's choice";
        const duration = formatDurationMinutes(session.startTime, session.endTime);
        const dateRange = formatDateRange(session.date, session.startTime, session.endTime);
        const timeStatus = getSessionTimeStatus(session);
        const statusClasses = getCalendarLabelClasses(timeStatus);
        const childColor = getChildColor(session.childId);
        const childBgAlpha = `${childColor}18`;

        return (
          <li key={session.scheduleId}>
            <button
              type="button"
              onClick={() => onSessionClick?.(session)}
              className="flex w-full items-center gap-3 rounded-xl border border-l-4 border-slate-200 px-4 py-3 text-left transition-all duration-150 hover:shadow-md active:opacity-95 dark:border-slate-700"
              style={{
                borderLeftColor: childColor,
                backgroundColor: childBgAlpha,
              }}
            >
              <span
                className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full text-slate-700 dark:text-slate-200"
                style={{ backgroundColor: `${childColor}30` }}
                aria-hidden
              >
                <Activity className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span
                  className={`flex-shrink-0 w-2 h-2 rounded-full ${statusClasses.dot}`}
                  title={timeStatus === 'live' ? 'Live' : timeStatus === 'past' ? 'Past' : 'Upcoming'}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {title}
                  </p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                    {duration}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {session.childName} · {dateRange}
                  </p>
                </div>
              </div>
              <ChevronRight
                className="flex-shrink-0 w-5 h-5 text-slate-400 dark:text-slate-500"
                aria-hidden
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
