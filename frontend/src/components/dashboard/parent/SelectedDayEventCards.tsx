'use client';

import React from 'react';
import moment from 'moment';
import { Activity, ChevronRight } from 'lucide-react';
import type { ChildActivitySession } from '@/components/dashboard/ChildrenActivitiesCalendar';

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

/**
 * Event cards for the selected day (reference: calendar app with "Sick Leave" style card).
 * Shows icon, title, duration, date range and arrow; tappable to open session detail.
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
        const isPast = session.isPast;
        const isOngoing = session.isOngoing;

        const statusStyles = isOngoing
          ? 'border-l-green-500 bg-green-50/80 dark:bg-green-900/20'
          : isPast
            ? 'border-l-slate-400 bg-slate-100 dark:bg-slate-800/50'
            : 'border-l-blue-500 bg-blue-50/80 dark:bg-blue-900/20';

        return (
          <li key={session.scheduleId}>
            <button
              type="button"
              onClick={() => onSessionClick?.(session)}
              className={`w-full text-left rounded-xl border border-slate-200 dark:border-slate-700 ${statusStyles} px-4 py-3 flex items-center gap-3 transition-colors hover:opacity-90 active:opacity-95`}
            >
              <span
                className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${
                  isOngoing
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                    : isPast
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                }`}
                aria-hidden
              >
                <Activity className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0">
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
