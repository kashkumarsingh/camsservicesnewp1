'use client';

import React from 'react';
import moment from 'moment';
import type { ActivityLog } from '@/core/application/trainer/types';
import { ChevronRight } from 'lucide-react';

interface ActivityLogTimelineProps {
  logs: ActivityLog[];
  onLogClick?: (logId: number) => void;
  /** Max height for scrollable area (e.g. "max-h-52") */
  className?: string;
}

/**
 * Renders activity logs as a chronological history timeline (newest → oldest).
 * Use in session Logs tab instead of card list to avoid confusion.
 */
export default function ActivityLogTimeline({
  logs,
  onLogClick,
  className = '',
}: ActivityLogTimelineProps) {
  if (logs.length === 0) {
    return null;
  }

  const sorted = [...logs].sort((a, b) => {
    const aDate = a.activity_date || '';
    const bDate = b.activity_date || '';
    if (aDate !== bDate) return bDate.localeCompare(aDate);
    const aTime = (a as { startTime?: string }).startTime ?? a.start_time || (a as { createdAt?: string }).createdAt ?? a.created_at || '';
    const bTime = (b as { startTime?: string }).startTime ?? b.start_time || (b as { createdAt?: string }).createdAt ?? b.created_at || '';
    return bTime.localeCompare(aTime);
  });

  const lineLeftPx = 9;
  return (
    <div className={className}>
      <div className="relative">
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-600"
          style={{ left: `${lineLeftPx}px` }}
          aria-hidden
        />
        {sorted.map((log, index) => {
          const timeStr = (log as { startTime?: string }).startTime ?? log.start_time
            ? moment((log as { startTime?: string }).startTime ?? log.start_time, ['HH:mm:ss', 'HH:mm']).format('h:mm A')
            : (log as { createdAt?: string }).createdAt ?? log.created_at
              ? moment((log as { createdAt?: string }).createdAt ?? log.created_at).format('h:mm A')
              : null;
          const snippet = [log.description, log.notes].filter(Boolean).map((s) => (s || '').trim()).find((s) => s.length > 0);
          const preview = snippet ? (snippet.length > 50 ? `${snippet.slice(0, 50)}…` : snippet) : null;
          const isLast = index === sorted.length - 1;

          return (
            <div
              key={log.id}
              className={`flex ${!isLast ? 'pb-4' : ''}`}
            >
              <div
                className="flex shrink-0 items-start justify-center pt-[7px]"
                style={{ width: `${lineLeftPx * 2}px` }}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-slate-300 bg-white dark:border-slate-500 dark:bg-slate-800"
                  aria-hidden
                />
              </div>
              <div className="min-w-0 flex-1 pt-0.5 pl-2">
                <button
                  type="button"
                  onClick={() => onLogClick?.(log.id)}
                  className="text-left w-full rounded-md px-2 py-1.5 -mx-2 -my-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    {timeStr && (
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
                        {timeStr}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {log.activity_name}
                    </span>
                  </div>
                  {preview && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {preview}
                    </p>
                  )}
                  {onLogClick && (
                    <span className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                      View details
                      <ChevronRight className="h-3 w-3" aria-hidden />
                    </span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
