'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Package,
  FileText,
  CheckCircle2,
  Circle,
  Timer,
  ClipboardCheck,
  Star,
  Image,
  Activity,
} from 'lucide-react';
import { useLiveRefresh } from '@/core/liveRefresh/LiveRefreshContext';
import { LIVE_REFRESH_ENABLED } from '@/utils/liveRefreshConstants';
import type {
  AdminBookingDTO,
  UpdateBookingNotesDTO,
} from '@/core/application/admin/dto/AdminBookingDTO';
import type { RemoteBookingSession } from '@/core/application/admin/dto/AdminBookingDTO';
import { getGoogleMapsSearchUrl, getGoogleMapsUrlForCoordinates } from '@/utils/locationUtils';

type TimelineEventType =
  | 'start'
  | 'checkin'
  | 'activity'
  | 'note'
  | 'photo'
  | 'issue'
  | 'end'
  | 'cancelled'
  | 'scheduled'
  | 'now';

interface TimelineEvent {
  id: string;
  time: string;
  timeLabel: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  actor?: string;
}

function formatTime(t: string): string {
  if (!t || t.length < 5) return '';
  return t.slice(0, 5);
}

function formatTimeFromIso(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

function formatDateLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    const today = new Date();
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    if (isToday) return 'Today';
    return d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function buildTimeline(
  session: RemoteBookingSession,
  childrenSummary: string
): TimelineEvent[] {
  const date = session.date;
  const startTime = session.startTime;
  const endTime = session.endTime;
  const status = session.status ?? 'scheduled';
  const events: TimelineEvent[] = [];

  if (status === 'cancelled') {
    events.push({
      id: 'scheduled',
      time: `${date}T${startTime}`,
      timeLabel: formatTime(startTime),
      type: 'scheduled',
      title: 'Scheduled start',
      description: 'Session was cancelled before start',
    });
    const cancelledAt = session.cancelledAt
      ? formatTimeFromIso(session.cancelledAt)
      : '—';
    events.push({
      id: 'cancelled',
      time: session.cancelledAt ?? date + 'T' + startTime,
      timeLabel: cancelledAt,
      type: 'cancelled',
      title: 'Session cancelled',
      description: session.cancellationReason ?? undefined,
    });
    events.push({
      id: 'would-end',
      time: `${date}T${endTime}`,
      timeLabel: formatTime(endTime),
      type: 'scheduled',
      title: 'Would have ended',
    });
    return events;
  }

  events.push({
    id: 'start',
    time: `${date}T${startTime}`,
    timeLabel: formatTime(startTime),
    type: status === 'completed' ? 'start' : 'start',
    title: 'Session started',
    description: 'Scheduled start time',
  });

  if (session.clockedInAt) {
    events.push({
      id: 'checkin',
      time: session.clockedInAt,
      timeLabel: formatTimeFromIso(session.clockedInAt),
      type: 'checkin',
      title: 'Check-in',
      description: 'Child checked in by trainer',
    });
  }

  if (session.currentActivityName) {
    events.push({
      id: 'activity',
      time: session.clockedInAt ?? session.date + 'T' + session.startTime,
      timeLabel: formatTimeFromIso(session.clockedInAt) || formatTime(session.startTime),
      type: 'activity',
      title: 'Activity started',
      description: session.currentActivityName,
    });
  }

  if (session.clockedOutAt) {
    events.push({
      id: 'checkout',
      time: session.clockedOutAt,
      timeLabel: formatTimeFromIso(session.clockedOutAt),
      type: 'checkin',
      title: 'Check-out',
      description: 'Session ended',
    });
  }

  if (status === 'completed') {
    events.push({
      id: 'end',
      time: session.completedAt ?? `${date}T${endTime}`,
      timeLabel: formatTimeFromIso(session.completedAt) || formatTime(endTime),
      type: 'end',
      title: 'Session completed',
      description: `Duration: ${session.actualDurationHours ?? session.durationHours ?? 0}h`,
    });
  } else if (status === 'scheduled') {
    events.push({
      id: 'expected-end',
      time: `${date}T${endTime}`,
      timeLabel: formatTime(endTime),
      type: 'scheduled',
      title: 'Scheduled to end',
      description: `Expected duration: ${session.durationHours ?? 0}h`,
    });
  } else {
    events.push({
      id: 'expected-end',
      time: `${date}T${endTime}`,
      timeLabel: formatTime(endTime),
      type: 'now',
      title: 'Expected end',
      description: 'Session in progress',
    });
  }

  return events.sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );
}

function getSessionStatusLabel(status: string): string {
  switch (status) {
    case 'scheduled':
      return 'Scheduled';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'no_show':
      return 'No show';
    case 'rescheduled':
      return 'Rescheduled';
    default:
      return status;
  }
}

function getSessionStatusVariant(
  status: string
): 'green' | 'blue' | 'amber' | 'red' | 'slate' {
  switch (status) {
    case 'completed':
      return 'green';
    case 'cancelled':
    case 'no_show':
      return 'red';
    case 'scheduled':
      return 'blue';
    default:
      return 'slate';
  }
}

export interface SessionDetailSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null;
  bookingId: string | null;
  /** When true, panel scrolls to the Timeline section (clock-in, current activity, logs). */
  focusOnActivity?: boolean;
  getBooking: (bookingId: string) => Promise<AdminBookingDTO>;
  onUpdate?: () => void;
  /** Update booking notes (admin notes). When provided, "Add note" is functional. */
  onUpdateNotes?: (
    bookingId: string,
    data: UpdateBookingNotesDTO
  ) => Promise<void>;
  /** When provided, Overview shows "View activity" that opens the session activity panel. */
  onOpenLatestActivity?: (sessionId: string, bookingId: string) => void;
}

export function SessionDetailSidePanel({
  isOpen,
  onClose,
  sessionId,
  bookingId,
  focusOnActivity = false,
  getBooking,
  onUpdate,
  onUpdateNotes,
  onOpenLatestActivity,
}: SessionDetailSidePanelProps) {
  const [booking, setBooking] = useState<AdminBookingDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteFormOpen, setNoteFormOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const timelineSectionRef = React.useRef<HTMLElement | null>(null);
  type DetailTab = 'overview' | 'activity' | 'notes';
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');

  const session = useMemo(() => {
    if (!booking || !sessionId) return null;
    return booking.sessions?.find((s) => s.id === sessionId) ?? null;
  }, [booking, sessionId]);

  const childrenSummary = useMemo(() => {
    if (!booking?.children?.length) return 'No children';
    return booking.children.map((c) => c.name).join(', ');
  }, [booking]);

  const timeline = useMemo(() => {
    if (!session) return [];
    return buildTimeline(session, childrenSummary);
  }, [session, childrenSummary]);

  useEffect(() => {
    if (!isOpen || !bookingId) {
      setBooking(null);
      setError(null);
      setNoteFormOpen(false);
      setNoteError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getBooking(bookingId)
      .then((b) => {
        if (!cancelled) setBooking(b);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load session');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, bookingId, getBooking]);

  const refetchBooking = useCallback(() => {
    if (!bookingId) return;
    getBooking(bookingId).then(setBooking).catch(() => {});
  }, [bookingId, getBooking]);
  useLiveRefresh('bookings', refetchBooking, {
    enabled: LIVE_REFRESH_ENABLED && isOpen && !!bookingId,
  });
  useLiveRefresh('trainer_schedules', refetchBooking, {
    enabled: LIVE_REFRESH_ENABLED && isOpen && !!bookingId,
  });

  // When opened with "View activity", switch to Activity tab and scroll to Timeline
  useEffect(() => {
    if (!focusOnActivity || loading || error || !session) return;
    setActiveTab('activity');
    const el = timelineSectionRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => clearTimeout(t);
  }, [focusOnActivity, loading, error, session]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) handleClose();
    },
    [handleClose]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }
  }, [isOpen, handleClose]);

  const openNoteForm = useCallback(() => {
    setNoteDraft(booking?.adminNotes ?? '');
    setNoteError(null);
    setNoteFormOpen(true);
  }, [booking?.adminNotes]);

  const closeNoteForm = useCallback(() => {
    setNoteFormOpen(false);
    setNoteError(null);
  }, []);

  const saveAdminNote = useCallback(async () => {
    if (!bookingId || !onUpdateNotes) return;
    setNoteSaving(true);
    setNoteError(null);
    try {
      await onUpdateNotes(bookingId, { admin_notes: noteDraft.trim() || undefined });
      const updated = await getBooking(bookingId);
      setBooking(updated);
      onUpdate?.();
      setNoteFormOpen(false);
    } catch (err) {
      setNoteError(
        err instanceof Error ? err.message : 'Failed to save note'
      );
    } finally {
      setNoteSaving(false);
    }
  }, [bookingId, noteDraft, onUpdateNotes, getBooking, onUpdate]);

  if (!isOpen) return null;

  const statusVariant = session ? getSessionStatusVariant(session.status) : 'slate';
  const statusLabel = session ? getSessionStatusLabel(session.status) : '';

  const panel = (
    <>
      <div
        className="fixed inset-0 z-overlay bg-slate-900/30 transition-opacity duration-300 ease-out"
        aria-hidden
        onClick={handleBackdropClick}
      />
      <aside
        className="fixed right-0 top-0 z-overlay flex h-full w-full flex-col bg-white shadow-xl dark:bg-slate-900 sm:w-[480px] md:max-w-[40%]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-detail-title"
        style={{ animation: 'sessionPanelSlideIn 0.3s ease-out' }}
      >
        <style dangerouslySetInnerHTML={{ __html: '@keyframes sessionPanelSlideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}' }} />

        <div className="flex h-full flex-col overflow-hidden">
          <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <h2
              id="session-detail-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              Session details
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              aria-label="Close panel"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          {/* Tabs: Overview | Activity | Notes & billing */}
          {!loading && !error && session && booking && (
            <nav
              className="flex shrink-0 border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30"
              aria-label="Session detail tabs"
            >
              <div className="flex gap-0 overflow-x-auto px-2">
                {(
                  [
                    { id: 'overview' as const, label: 'Overview' },
                    { id: 'activity' as const, label: 'Activity' },
                    { id: 'notes' as const, label: 'Notes & billing' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                        : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>
          )}

          <div className="flex-1 overflow-y-auto p-4">
            {loading && (
              <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading session">
                <div className="h-4 w-[70%] bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-[85%] bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-20 w-full bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                {error}
              </div>
            )}
            {!loading && !error && session && booking && (
              <div className="space-y-5">
                {/* ——— Tab: Overview ——— */}
                {activeTab === 'overview' && (
                  <>
                    <section>
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {childrenSummary}
                      </p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusVariant === 'green'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                            : statusVariant === 'red'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'
                              : statusVariant === 'blue'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {statusLabel}
                      </span>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {formatDateLabel(session.date)} · {formatTime(session.startTime)} –{' '}
                        {formatTime(session.endTime)}
                        {session.durationHours != null &&
                          ` (${Number(session.durationHours)}h)`}
                      </p>
                      {session.status === 'scheduled' && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Scheduled to start
                          {session.date &&
                            new Date(session.date + 'T' + session.startTime) > new Date() &&
                            ` in ${Math.round(
                              (new Date(session.date + 'T' + session.startTime).getTime() -
                                Date.now()) /
                                60000
                            )} min`}
                        </p>
                      )}
                    </section>

                    <section className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/30">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        People
                      </h3>
                      <div className="mt-2 space-y-3">
                        {session.trainerName && (
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              Trainer: {session.trainerName}
                            </p>
                            {(session.trainerPhone || session.trainerEmail) && (
                              <p className="mt-0.5 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
                                {session.trainerPhone && (
                                  <a
                                    href={`tel:${session.trainerPhone}`}
                                    className="inline-flex items-center gap-1 hover:underline"
                                  >
                                    <Phone className="h-3 w-3" />
                                    {session.trainerPhone}
                                  </a>
                                )}
                                {session.trainerEmail && (
                                  <a
                                    href={`mailto:${session.trainerEmail}`}
                                    className="inline-flex items-center gap-1 hover:underline"
                                  >
                                    <Mail className="h-3 w-3" />
                                    {session.trainerEmail}
                                  </a>
                                )}
                              </p>
                            )}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Parent: {booking.parentName}
                          </p>
                          <p className="mt-0.5 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <a
                              href={`mailto:${booking.parentEmail}`}
                              className="inline-flex items-center gap-1 hover:underline"
                            >
                              <Mail className="h-3 w-3" />
                              {booking.parentEmail}
                            </a>
                            {booking.parentPhone && (
                              <a
                                href={`tel:${booking.parentPhone}`}
                                className="inline-flex items-center gap-1 hover:underline"
                              >
                                <Phone className="h-3 w-3" />
                                {booking.parentPhone}
                              </a>
                            )}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/30">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Booking
                      </h3>
                      <ul className="mt-2 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                        <li className="flex items-center gap-2">
                          <Package className="h-4 w-4 shrink-0 text-slate-400" />
                          {booking.packageName ?? '—'}
                        </li>
                        <li className="flex items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                          Ref: {booking.reference}
                        </li>
                        {session.location && (
                          <li className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                            <a
                              href={getGoogleMapsSearchUrl(session.location)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline dark:text-indigo-300"
                            >
                              {session.location}
                            </a>
                          </li>
                        )}
                        {session.clockedInLatitude != null &&
                          session.clockedInLongitude != null && (
                            <li className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                              <a
                                href={getGoogleMapsUrlForCoordinates(session.clockedInLatitude, session.clockedInLongitude)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline dark:text-indigo-300"
                              >
                                View trainer location on map
                              </a>
                            </li>
                          )}
                      </ul>
                      {sessionId && bookingId && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                          {onOpenLatestActivity ? (
                            <button
                              type="button"
                              onClick={() => onOpenLatestActivity(sessionId, bookingId)}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                              <Activity className="h-4 w-4 shrink-0" aria-hidden />
                              View activity
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveTab('activity')}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                              <Activity className="h-4 w-4 shrink-0" aria-hidden />
                              View timeline & checklist
                            </button>
                          )}
                        </div>
                      )}
                    </section>
                  </>
                )}

                {/* ——— Tab: Activity (Timeline + Completion & report) ——— */}
                {activeTab === 'activity' && (
                  <>
                    <section
                      ref={timelineSectionRef}
                      className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/30"
                      aria-label="Session timeline"
                    >
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Timeline
                      </h3>
                      <ul className="mt-3 space-y-0">
                        {timeline.map((evt, idx) => (
                          <li key={evt.id} className="relative flex gap-3 pb-4 last:pb-0">
                            {idx > 0 && (
                              <span
                                className="absolute left-[11px] top-6 bottom-0 w-px bg-slate-200 dark:bg-slate-600"
                                aria-hidden
                              />
                            )}
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                                evt.type === 'start' || evt.type === 'checkin' || evt.type === 'activity'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                                  : evt.type === 'end'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                                    : evt.type === 'cancelled'
                                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                                      : evt.type === 'now'
                                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                                        : 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {evt.type === 'cancelled' ? (
                                <X className="h-3.5 w-3.5" />
                              ) : evt.type === 'end' || evt.type === 'checkin' ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : evt.type === 'now' ? (
                                <Timer className="h-3.5 w-3.5" />
                              ) : (
                                <Circle className="h-2 w-2 fill-current" />
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {evt.timeLabel} – {evt.title}
                              </p>
                              {evt.description && (
                                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                                  {evt.description}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/30">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Completion & report
                      </h3>
                      <ul className="mt-2 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                        <li className="flex items-center gap-2">
                          {session.clockedInAt ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                          ) : (
                            <Circle className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                          )}
                          <span>Checked in</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {session.clockedInAt ? formatTimeFromIso(session.clockedInAt) : '—'}
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          {session.clockedOutAt ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                          ) : (
                            <Circle className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                          )}
                          <span>Checked out</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {session.clockedOutAt ? formatTimeFromIso(session.clockedOutAt) : '—'}
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                          <span>Report submitted</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">—</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Image className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                          <span>Photos uploaded</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">—</span>
                        </li>
                        <li className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-600 mt-2">
                          <FileText className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                          <span>Full report</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">—</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                          <span>Rating</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">—</span>
                        </li>
                      </ul>
                      {!session.clockedOutAt && !session.completedAt && session.status !== 'cancelled' && session.status !== 'no_show' && new Date(session.date + 'T' + session.endTime) < new Date() && (
                        <p className="mt-2 text-xs font-medium text-orange-600 dark:text-orange-400">
                          Incomplete – check-out or report missing
                        </p>
                      )}
                    </section>
                  </>
                )}

                {/* ——— Tab: Notes & billing ——— */}
                {activeTab === 'notes' && (
                  <>
                    <section className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/30">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Notes & updates
                      </h3>
                      {noteFormOpen ? (
                        <div className="mt-2 space-y-2">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Admin-only note (not visible to parent).
                          </p>
                          <textarea
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            placeholder="e.g. Follow-up call needed, parent requested early pick-up…"
                            rows={3}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                            disabled={noteSaving}
                          />
                          {noteError && (
                            <p className="text-xs text-rose-600 dark:text-rose-400">{noteError}</p>
                          )}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={saveAdminNote}
                              disabled={noteSaving}
                              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                            >
                              {noteSaving ? 'Saving…' : 'Save note'}
                            </button>
                            <button
                              type="button"
                              onClick={closeNoteForm}
                              disabled={noteSaving}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {booking.adminNotes ? (
                            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                              {booking.adminNotes}
                            </p>
                          ) : (
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                              Session notes appear here when added by the trainer.
                            </p>
                          )}
                          {onUpdateNotes && (
                            <button
                              type="button"
                              onClick={openNoteForm}
                              className="mt-2 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-300"
                            >
                              {booking.adminNotes ? 'Edit admin note' : 'Add note'}
                            </button>
                          )}
                        </>
                      )}
                    </section>

                    <section className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/30">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Payment & package hours
                      </h3>
                      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        Hours left on this booking’s package; used = hours already used from the package.
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                        <li>Payment: {booking.paymentStatus === 'paid' ? 'Paid' : booking.paymentStatus}</li>
                        <li>Package hours left: {booking.remainingHours}h</li>
                        <li>Hours used (from package): {booking.usedHours}h</li>
                      </ul>
                    </section>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );

  return typeof document !== 'undefined' ? createPortal(panel, document.body) : panel;
}
