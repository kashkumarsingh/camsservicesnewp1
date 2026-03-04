'use client';

import React, { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  X,
  Calendar,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { ROUTES } from '@/utils/routes';

export interface TodaySessionItem {
  id: string;
  bookingId: string;
  startTime: string;
  endTime: string;
  childrenSummary: string;
  trainerName: string | null;
  parentName: string;
  isOngoing: boolean;
  isUpcoming: boolean;
}

export interface TodaySessionsSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  ongoingSessions: TodaySessionItem[];
  upcomingSessions: TodaySessionItem[];
  /** When a session is clicked, open session detail side panel. Panel typically closes after. */
  onViewSession?: (sessionId: string, bookingId: string, options?: { focusOnActivity?: boolean }) => void;
}

function formatTime(t: string): string {
  return t && t.length >= 5 ? t.slice(0, 5) : t;
}

export function TodaySessionsSidePanel({
  isOpen,
  onClose,
  ongoingSessions = [],
  upcomingSessions = [],
  onViewSession,
}: TodaySessionsSidePanelProps) {
  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleViewSession = useCallback(
    (sessionId: string, bookingId: string, options?: { focusOnActivity?: boolean }) => {
      onViewSession?.(sessionId, bookingId, options);
      onClose();
    },
    [onViewSession, onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const linkButtonClass =
    'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 dark:focus:ring-offset-slate-900';

  const panel = (
    <>
      <div
        className="fixed inset-0 z-overlay bg-slate-900/30 transition-opacity duration-300 ease-out"
        aria-hidden
        onClick={handleBackdropClick}
      />
      <aside
        className="fixed right-0 top-0 z-sidePanel flex h-full w-full flex-col bg-white shadow-xl dark:bg-slate-900 sm:w-[400px] md:max-w-[32rem]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="today-sessions-panel-title"
        style={{ animation: 'sessionPanelSlideIn 0.3s ease-out' }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html:
              '@keyframes sessionPanelSlideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}',
          }}
        />

        <div className="flex h-full flex-col overflow-hidden">
          <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <h2
              id="today-sessions-panel-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              Today&apos;s sessions
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              aria-label="Close panel"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4">
            {ongoingSessions.length > 0 && (
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                  In progress ({ongoingSessions.length})
                </p>
                <ul className="space-y-2" role="list">
                  {ongoingSessions.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-3 py-2.5 text-xs dark:border-emerald-800/60 dark:bg-emerald-950/40"
                    >
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatTime(s.startTime)}–{formatTime(s.endTime)}
                      </p>
                      <p className="mt-0.5 text-slate-700 dark:text-slate-300">{s.childrenSummary}</p>
                      <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                        {s.trainerName ?? 'Unassigned'} · {s.parentName}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewSession(s.id, s.bookingId)}
                          className={`${linkButtonClass} text-primary-blue hover:bg-primary-blue/10 dark:text-primary-blue dark:hover:bg-primary-blue/20`}
                        >
                          Open booking
                          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleViewSession(s.id, s.bookingId, { focusOnActivity: true })
                          }
                          className={`${linkButtonClass} text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50`}
                        >
                          <Activity className="h-3.5 w-3.5" aria-hidden />
                          Latest activity
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {upcomingSessions.length > 0 && (
              <div className={ongoingSessions.length > 0 ? 'mt-4' : ''}>
                <p className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                  <Calendar className="h-3.5 w-3.5" aria-hidden />
                  Upcoming today ({upcomingSessions.length})
                </p>
                <ul className="space-y-2" role="list">
                  {upcomingSessions.slice(0, 10).map((s) => (
                    <li
                      key={s.id}
                      className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs dark:border-slate-700/80 dark:bg-slate-800/40"
                    >
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatTime(s.startTime)}–{formatTime(s.endTime)}
                      </p>
                      <p className="mt-0.5 text-slate-700 dark:text-slate-300">{s.childrenSummary}</p>
                      <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                        {s.trainerName ?? 'Unassigned'} · {s.parentName}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleViewSession(s.id, s.bookingId)}
                        className={`mt-2 ${linkButtonClass} text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800`}
                      >
                        View session
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
                {upcomingSessions.length > 10 && (
                  <Link
                    href={ROUTES.DASHBOARD_ADMIN_BOOKINGS}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    View all bookings
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                )}
              </div>
            )}

            {ongoingSessions.length === 0 && upcomingSessions.length === 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No sessions today. Confirmed bookings will appear here.
              </p>
            )}

            {(ongoingSessions.length > 0 || upcomingSessions.length > 0) && (
              <Link
                href={ROUTES.DASHBOARD_ADMIN_BOOKINGS}
                className="mt-4 flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                Calendar &amp; bookings
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );

  return typeof document !== 'undefined' ? createPortal(panel, document.body) : panel;
}
