'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Loader2, FileText, ListTodo, Activity, Clock4, MapPin } from 'lucide-react';
import moment from 'moment';
import Button from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/Modal';
import { trainerBookingRepository } from '@/infrastructure/http/trainer/TrainerBookingRepository';
import { toastManager } from '@/utils/toast';
import ActivityLogTimeline from '@/components/trainer/activities/ActivityLogTimeline';
import ActivityLogDetailModal from '@/components/trainer/modals/ActivityLogDetailModal';
import ActivityLogForm from '@/components/trainer/activities/ActivityLogForm';
import { trainerActivityLogRepository } from '@/infrastructure/http/trainer/TrainerActivityLogRepository';
import { trainerTimeEntryRepository } from '@/infrastructure/http/trainer/TrainerTimeEntryRepository';
import { trainerScheduleRepository } from '@/infrastructure/http/trainer/TrainerScheduleRepository';
import { getCurrentPositionOptional, reverseGeocode, getGoogleMapsSearchUrl } from '@/utils/locationUtils';
import { trainerActivityRepository } from '@/infrastructure/http/trainer/TrainerActivityRepository';
import type { ActivityLog, TimeEntry } from '@/core/application/trainer/types';

interface TrainerSessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    date: string;
    startTime: string;
    endTime: string;
    childName: string;
    childId: number;
    activities: string[];
    bookingId: number;
    scheduleId: number;
    bookingReference: string;
    isPast?: boolean;
    isOngoing?: boolean;
    isUpcoming?: boolean;
    status?: string;
    /** Parent address for pickup / where to meet the child. */
    pickupAddress?: string | null;
  } | null;
  onStatusUpdate?: () => void;
  /** Called after clock in/out so parent can refresh hero and time clock list */
  onTimeEntryUpdate?: () => void;
}

/**
 * Trainer Session Detail Modal Component
 * 
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Compact session details modal with status update actions (Google Calendar-style)
 * Location: frontend/src/components/trainer/modals/TrainerSessionDetailModal.tsx
 * 
 * Features:
 * - Uses BaseModal (universal modal component) with size="md" (matches ->modalWidth('md') requirement)
 * - Shows session details (child, date, time, activities, status)
 * - Status update actions (Completed, Cancelled, No Show) with optional notes
 * - Stays on dashboard after actions (no navigation)
 */
export default function TrainerSessionDetailModal({
  isOpen,
  onClose,
  session,
  onStatusUpdate,
  onTimeEntryUpdate,
}: TrainerSessionDetailModalProps) {
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityLogsLoading, setActivityLogsLoading] = useState(false);
  const [activityLogsError, setActivityLogsError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [activityLogDetailOpen, setActivityLogDetailOpen] = useState(false);
  const [activityLogFormOpen, setActivityLogFormOpen] = useState(false);
  const [sessionTimeEntries, setSessionTimeEntries] = useState<TimeEntry[]>([]);
  const [sessionTimeEntriesLoading, setSessionTimeEntriesLoading] = useState(false);
  const [clockActionLoading, setClockActionLoading] = useState(false);
  const [currentActivityOptions, setCurrentActivityOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [currentActivityId, setCurrentActivityId] = useState<number | '' | 'custom'>('');
  const [currentActivityCustomName, setCurrentActivityCustomName] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [currentActivityLoading, setCurrentActivityLoading] = useState(false);
  const [currentActivityUpdating, setCurrentActivityUpdating] = useState(false);
  const [locationFetching, setLocationFetching] = useState(false);
  type SessionTab = 'notes' | 'activity_log' | 'session_activity' | 'clock';
  const [activeTab, setActiveTab] = useState<SessionTab>('clock');
  const [showRightNowForm, setShowRightNowForm] = useState(false);
  /** After trainer submits "Update what I'm doing now", show below the Right now form */
  const [lastCurrentActivityUpdate, setLastCurrentActivityUpdate] = useState<{
    activityName: string;
    location: string;
    at: string;
  } | null>(null);
  /** Saved "Currently doing X at Y" history from API (newest first). */
  const [currentActivityUpdates, setCurrentActivityUpdates] = useState<Array<{ id: number; activity_name: string; location: string | null; at: string }>>([]);

  useEffect(() => {
    const loadCurrentActivityState = async () => {
      if (!isOpen || !session?.scheduleId) return;
      setCurrentActivityLoading(true);
      try {
        const res = await trainerActivityRepository.getSessionActivities(session.scheduleId);
        const schedule = res.schedule;
        const updates = (schedule as { current_activity_updates?: Array<{ id: number; activity_name: string; location: string | null; at: string }> })?.current_activity_updates ?? [];
        setCurrentActivityUpdates(updates);
        if (!session?.isOngoing) {
          setCurrentActivityLoading(false);
          return;
        }
        const assigned = (res.activities ?? []) as Array<{ id: number; name: string }>;
        const available = (res.available_activities ?? []) as Array<{ id: number; name: string }>;
        const seen = new Set<number>();
        const options: Array<{ id: number; name: string }> = [];
        [...assigned, ...available].forEach((a) => {
          if (!seen.has(a.id)) {
            seen.add(a.id);
            options.push({ id: a.id, name: a.name });
          }
        });
        options.sort((a, b) => a.name.localeCompare(b.name));
        setCurrentActivityOptions(options);
        const rawId = schedule.current_activity_id;
        const currentName = (schedule as { current_activity_name?: string })?.current_activity_name ?? null;
        if (rawId != null && rawId !== '' && options.some((o) => o.id === Number(rawId))) {
          setCurrentActivityId(Number(rawId));
          setCurrentActivityCustomName('');
        } else if (currentName && currentName.trim()) {
          setCurrentActivityId('custom');
          setCurrentActivityCustomName(currentName.trim());
        } else {
          setCurrentActivityId('');
          setCurrentActivityCustomName('');
        }
        setCurrentLocation(schedule.location ?? '');
      } catch {
        // Keep previous options on error so dropdown doesn't go empty (e.g. after slow/timeout)
      } finally {
        setCurrentActivityLoading(false);
      }
    };
    loadCurrentActivityState();
  }, [isOpen, session?.scheduleId, session?.isOngoing]);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!isOpen || !session) {
        return;
      }

      setActivityLogsLoading(true);
      setActivityLogsError(null);

      try {
        const logs = await trainerActivityLogRepository.getSessionLogs(session.scheduleId);
        setActivityLogs(logs);
      } catch (error: any) {
        // Treat 404 as "no logs yet" without surfacing an error
        const status = error?.response?.status;
        if (status === 404) {
          setActivityLogs([]);
          setActivityLogsError(null);
          return;
        }

        setActivityLogsError('Unable to load activity logs for this session. Please try again.');
        toastManager.error(
          (error && error.message) || 'Failed to load activity logs for this session'
        );
      } finally {
        setActivityLogsLoading(false);
      }
    };

    fetchLogs();
  }, [isOpen, session?.scheduleId]);

  useEffect(() => {
    const fetchTimeEntries = async () => {
      if (!isOpen || !session) return;
      setSessionTimeEntriesLoading(true);
      try {
        const res = await trainerTimeEntryRepository.list({
          booking_schedule_id: session.scheduleId,
        });
        setSessionTimeEntries(res.time_entries ?? []);
      } catch {
        setSessionTimeEntries([]);
      } finally {
        setSessionTimeEntriesLoading(false);
      }
    };
    fetchTimeEntries();
  }, [isOpen, session?.scheduleId]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('clock');
      setShowRightNowForm(false);
      setLastCurrentActivityUpdate(null);
    }
  }, [isOpen]);

  if (!session) return null;

  const sessionDateTime = moment(`${session.date} ${session.startTime}`, 'YYYY-MM-DD HH:mm');
  const sessionEndDateTime = moment(`${session.date} ${session.endTime}`, 'YYYY-MM-DD HH:mm');
  const now = moment();
  const isPast = session.isPast ?? sessionEndDateTime.isBefore(now);
  const isOngoing = session.isOngoing ?? (now.isSameOrAfter(sessionDateTime) && now.isBefore(sessionEndDateTime));
  const isUpcoming = session.isUpcoming ?? (now.isBefore(sessionDateTime));
  // Show Mark completed / Cancel / No show and Add activity log only when session has started (ongoing or past)
  const isSessionTimeOrPast = isPast || isOngoing;

  const sessionStart = moment(session.startTime, 'HH:mm');
  const sessionEnd = moment(session.endTime, 'HH:mm');
  const durationMinutes = Math.max(sessionEnd.diff(sessionStart, 'minutes'), 0);
  const durationHoursRaw = durationMinutes / 60;
  const durationHours =
    Number.isFinite(durationHoursRaw) && durationHoursRaw > 0
      ? parseFloat(durationHoursRaw.toFixed(1))
      : null;

  const activityLogFormId = `session-activity-log-form-${session.scheduleId}`;

  const handleStatusUpdate = async (newStatus: 'completed' | 'cancelled' | 'no_show') => {
    if (newStatus === 'completed' && activityLogs.length === 0) {
      const proceed = confirm(
        "You haven't added any activity logs yet. Document this session before marking it as completed?\n\nSelect 'OK' to skip and mark as completed, or 'Cancel' to add an activity log first."
      );

      if (!proceed) {
        setActivityLogFormOpen(true);
        return;
      }
    }

    if (!confirm(`Are you sure you want to mark this session as ${newStatus}?`)) {
      return;
    }

    setUpdating(true);
    try {
      await trainerBookingRepository.updateScheduleStatus(session.bookingId, session.scheduleId, {
        status: newStatus,
        notes: notes.trim() || undefined,
      });

      toastManager.success(`Session marked as ${newStatus}`);
      setNotes('');
      onStatusUpdate?.();
      onClose();
    } catch (error: any) {
      console.error('Failed to update schedule status:', error);
      toastManager.error(error.message || 'Failed to update session status');
    } finally {
      setUpdating(false);
    }
  };

  const handleActivityLogClick = (logId: number) => {
    const log = activityLogs.find((item) => item.id === logId);
    if (!log) {
      return;
    }
    setSelectedLog(log);
    setActivityLogDetailOpen(true);
  };

  const refreshActivityLogs = async () => {
    if (!session) {
      return;
    }
    try {
      const logs = await trainerActivityLogRepository.getSessionLogs(session.scheduleId);
      setActivityLogs(logs);
    } catch (error: any) {
      console.error('Failed to refresh activity logs for session:', error);
      toastManager.error(error.message || 'Failed to refresh activity logs for this session');
    }
  };

  const handleActivityLogCreatedOrUpdated = async () => {
    await refreshActivityLogs();
    setActivityLogFormOpen(false);
    toastManager.success('Activity log saved for this session');
  };

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Session details"
        size="lg"
        footer={
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
            {/* Left: Close */}
            <button
              type="button"
              onClick={onClose}
              disabled={updating}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Close
            </button>

            {/* Right: Status update actions (only when session has started or is ongoing) */}
            {isSessionTimeOrPast && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                {session.status !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('completed')}
                    disabled={updating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updating ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} />
                        Mark completed
                      </>
                    )}
                  </button>
                )}
                {session.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={updating}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-1 focus:ring-red-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <XCircle size={12} />
                    Cancel
                  </button>
                )}
                {session.status !== 'no_show' && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('no_show')}
                    disabled={updating}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-md hover:bg-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <AlertCircle size={12} />
                    No show
                  </button>
                )}
              </div>
            )}
          </div>
        }
      >
        <div className="space-y-3">
          {/* Top summary: child + time + date + activities + status */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-3 sm:p-4">
            <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              {session.childName}
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {moment(session.startTime, 'HH:mm').format('h:mm A')} – {moment(session.endTime, 'HH:mm').format('h:mm A')}
              {durationHours !== null && (
                <span className="text-gray-500 dark:text-gray-400"> · {durationHours}h</span>
              )}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Calendar size={14} className="text-gray-500 flex-shrink-0" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {moment(session.date).format('dddd, MMM D, YYYY')}
              </span>
            </div>
            {session.activities && session.activities.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {session.activities.map((activity, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 rounded-full"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            )}
            {session.status && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Status: <span className="font-medium capitalize text-gray-900 dark:text-gray-100">{session.status}</span>
              </p>
            )}
            {session.status === 'scheduled' && isOngoing && (
              <p className="text-xs text-green-700 dark:text-green-400 font-medium mt-1">In progress</p>
            )}
            <div className="flex items-start gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <MapPin size={14} className="text-gray-500 flex-shrink-0 mt-0.5" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Session / pickup address</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Where to go to meet the child or run the session</p>
                {session.pickupAddress ? (
                  <>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{session.pickupAddress}</p>
                    <a
                      href={getGoogleMapsSearchUrl(session.pickupAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                      aria-label={`Open ${session.pickupAddress} in Google Maps`}
                    >
                      <MapPin size={12} aria-hidden />
                      Open in Google Maps
                    </a>
                  </>
                ) : (
                  <p className="text-sm text-amber-700 dark:text-amber-300 italic mt-1">
                    Not set. Contact admin for the session or pickup address.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs: Clock | Right now | Logs | Notes */}
          <nav className="border-b border-gray-200 dark:border-gray-600 -mx-1 px-1" aria-label="Session tabs">
            <div className="flex gap-0 overflow-x-auto">
              {[
                { id: 'clock' as SessionTab, label: 'Clock', icon: Clock4 },
                { id: 'session_activity' as SessionTab, label: 'Right now', icon: Activity },
                { id: 'activity_log' as SessionTab, label: 'Logs', icon: ListTodo },
                { id: 'notes' as SessionTab, label: 'Notes', icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      whitespace-nowrap py-2.5 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors flex-shrink-0
                      ${activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }
                    `}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Tab panels */}
          <div className="min-h-[140px]">
            {activeTab === 'notes' && (
              <div className="space-y-2">
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Used when you mark the session as Completed, Cancelled or No Show.
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Child did well today…"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  rows={3}
                />
              </div>
            )}

            {activeTab === 'activity_log' && (
              <div className="space-y-3">
                {session.isUpcoming ? (
                  <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-3">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Session has not started yet</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                      You can add activity logs once the session has started. Clock in when you begin, then use this tab to add notes and photos.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Session history: add notes and photos in order. They appear as a timeline for you and for admins.
                    </p>
                    {activityLogsLoading ? (
                      <div className="space-y-2 animate-pulse" aria-busy="true" aria-label="Loading activity logs">
                        <div className="h-3 w-[85%] bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-3 w-[70%] bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-3 w-[60%] bg-slate-200 dark:bg-slate-700 rounded" />
                      </div>
                    ) : (
                      <>
                        {activityLogs.length === 0 && !activityLogsError && (
                          <p className="text-[11px] text-gray-500 py-2">No entries yet. Add a log to start the history.</p>
                        )}
                        {activityLogsError && <p className="text-xs text-red-600">{activityLogsError}</p>}
                        {activityLogs.length > 0 && (
                          <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30 px-3 py-3">
                            <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                              History (newest → oldest)
                            </p>
                            <ActivityLogTimeline
                              logs={activityLogs}
                              onLogClick={handleActivityLogClick}
                              className="max-h-44 overflow-y-auto"
                            />
                          </div>
                        )}
                        <Button type="button" variant="outline" size="sm" onClick={() => setActivityLogFormOpen(true)}>
                          + Add log
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'session_activity' && (
              <>
                {isOngoing ? (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
                      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">What I&apos;m doing right now</p>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">Quick update so admin and parents see your current activity and location. For full notes and photos, use the <strong>Logs</strong> tab.</p>
                      </div>
                      <div className="p-3">
                        {(() => {
                          const lineLeftPx = 9;
                          const dotColumnWidth = lineLeftPx * 2;
                          const DotColumn = ({ children }: { children: React.ReactNode }) => (
                            <div
                              className="flex shrink-0 items-start justify-center pt-[7px]"
                              style={{ width: `${dotColumnWidth}px` }}
                            >
                              {children}
                            </div>
                          );
                          return (
                            <div className="relative">
                              <div
                                className="absolute top-0 bottom-0 w-0.5 bg-blue-500 dark:bg-blue-400"
                                style={{ left: `${lineLeftPx}px` }}
                                aria-hidden
                              />
                              {(lastCurrentActivityUpdate || (() => {
                                const scheduleCurrentName = currentActivityId === 'custom' ? currentActivityCustomName : (currentActivityOptions.find((o) => o.id === currentActivityId)?.name ?? '');
                                return Boolean((scheduleCurrentName || '').trim() || currentLocation.trim()) && !lastCurrentActivityUpdate;
                              })()) && (
                                <div className="flex pb-3">
                                  <DotColumn>
                                    <span
                                      className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-400 ring-2 ring-white dark:ring-gray-800 animate-pulse"
                                      aria-hidden
                                    />
                                  </DotColumn>
                                  <div className="min-w-0 flex-1 pl-2">
                                    <span className="inline-flex items-center gap-1.5 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
                                      Live
                                    </span>
                                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                                      {lastCurrentActivityUpdate ? (
                                        <>
                                          <span className="font-medium">Currently doing {lastCurrentActivityUpdate.activityName}</span>
                                          {lastCurrentActivityUpdate.location && (
                                            <span className="text-gray-500 dark:text-gray-400"> at {lastCurrentActivityUpdate.location}</span>
                                          )}
                                          <span className="text-gray-500 dark:text-gray-400 ml-1">{lastCurrentActivityUpdate.at}</span>
                                        </>
                                      ) : (() => {
                                        const scheduleCurrentName = currentActivityId === 'custom' ? currentActivityCustomName : (currentActivityOptions.find((o) => o.id === currentActivityId)?.name ?? '');
                                        return (
                                          <>
                                            <span className="font-medium">Currently doing {(scheduleCurrentName || '').trim() || '—'}</span>
                                            {currentLocation.trim() && (
                                              <span className="text-gray-500 dark:text-gray-400"> at {currentLocation.trim()}</span>
                                            )}
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">(saved)</span>
                                          </>
                                        );
                                      })()}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {(() => {
                                // Show only previous (past) updates; skip the current one (index 0) to avoid duplicate with Live block; dedupe by content
                                const seen = new Set<string>();
                                const previousUpdates = currentActivityUpdates
                                  .slice(1)
                                  .filter((u) => {
                                    const key = `${u.activity_name}|${u.location ?? ''}|${u.at}`;
                                    if (seen.has(key)) return false;
                                    seen.add(key);
                                    return true;
                                  });
                                return previousUpdates.length > 0 ? (
                                  <>
                                    {previousUpdates.map((u) => (
                                      <div key={u.id} className="flex pb-3">
                                        <DotColumn>
                                          <span
                                            className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-gray-300 bg-gray-100 dark:border-gray-500 dark:bg-gray-700"
                                            aria-hidden
                                          />
                                        </DotColumn>
                                        <div className="min-w-0 flex-1 pl-2">
                                          <p className="text-xs text-gray-600 dark:text-gray-400">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Logged: {u.activity_name}</span>
                                            {u.location && <span className="text-gray-500 dark:text-gray-500"> at {u.location}</span>}
                                            <span className="text-gray-400 dark:text-gray-500 ml-1">· {u.at}</span>
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </>
                                ) : null;
                              })()}
                              <div className="flex">
                                <DotColumn>
                                  <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-blue-500 bg-white dark:border-blue-400 dark:bg-gray-800"
                                    aria-hidden
                                  />
                                </DotColumn>
                                <div className="min-w-0 flex-1 pl-2">
                            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">Update now</p>
                            {!showRightNowForm ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setShowRightNowForm(true)}
                              >
                                Log what I&apos;m doing now
                              </Button>
                            ) : currentActivityLoading ? (
                              <div className="animate-pulse space-y-1.5" aria-busy="true" aria-label="Loading current activity">
                                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                                <div className="h-8 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div>
                                  <label htmlFor="current-activity-select" className="block text-xs text-gray-600 dark:text-gray-400 mb-0.5">Activity</label>
                                  <select
                                    id="current-activity-select"
                                    value={currentActivityId === '' ? '' : currentActivityId}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      if (v === '' || v === 'custom') {
                                        setCurrentActivityId(v === 'custom' ? 'custom' : '');
                                        if (v !== 'custom') setCurrentActivityCustomName('');
                                      } else {
                                        setCurrentActivityId(parseInt(v, 10));
                                        setCurrentActivityCustomName('');
                                      }
                                    }}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                  >
                                    <option value="">None</option>
                                    {currentActivityOptions.map((a) => (
                                      <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                    <option value="custom">Other (type your own)</option>
                                  </select>
                                  {currentActivityId === 'custom' && (
                                    <input
                                      type="text"
                                      value={currentActivityCustomName}
                                      onChange={(e) => setCurrentActivityCustomName(e.target.value)}
                                      placeholder="e.g. Baking, Nature walk"
                                      className="mt-1.5 w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                      aria-label="Custom activity name"
                                    />
                                  )}
                                  {currentActivityOptions.length === 0 && currentActivityId !== 'custom' && !currentActivityLoading && (
                                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">No activities in the system yet. Contact admin.</p>
                                  )}
                                </div>
                                <div>
                                  <label htmlFor="current-location-input" className="block text-xs text-gray-600 dark:text-gray-400 mb-0.5">Location</label>
                                  <div className="flex gap-1.5">
                                    <input
                                      id="current-location-input"
                                      type="text"
                                      value={currentLocation}
                                      onChange={(e) => setCurrentLocation(e.target.value)}
                                      placeholder="e.g. Main arena, Studio 1"
                                      className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                      aria-describedby="current-location-description"
                                    />
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        setLocationFetching(true);
                                        try {
                                          const coords = await getCurrentPositionOptional();
                                          if (!coords) {
                                            toastManager.error('Location unavailable. Please enter the location manually or allow location access.');
                                            return;
                                          }
                                          const address = await reverseGeocode(coords.latitude, coords.longitude);
                                          setCurrentLocation(address?.trim() || 'Current position');
                                          if (address?.trim()) toastManager.success('Location set from your position');
                                        } catch {
                                          toastManager.error('Could not get location. Please enter it manually.');
                                        } finally {
                                          setLocationFetching(false);
                                        }
                                      }}
                                      disabled={locationFetching}
                                      className="shrink-0 p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                      title="Use my current location"
                                      aria-label="Use my current location"
                                    >
                                      {locationFetching ? (
                                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                      ) : (
                                        <MapPin className="h-4 w-4" aria-hidden />
                                      )}
                                    </button>
                                  </div>
                                  <p id="current-location-description" className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    Type a place or click the location icon to use your current position
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    disabled={currentActivityUpdating || (currentActivityId === 'custom' && !currentActivityCustomName.trim())}
                                    onClick={async () => {
                                      setCurrentActivityUpdating(true);
                                      try {
                                        const isCustom = currentActivityId === 'custom';
                                        const customName = currentActivityCustomName.trim();
                                        await trainerScheduleRepository.updateCurrentActivity(session.scheduleId, {
                                          current_activity_id: isCustom ? null : (currentActivityId === '' ? null : (currentActivityId as number)),
                                          current_activity_custom_name: isCustom && customName ? customName : null,
                                          location: currentLocation.trim() || null,
                                        });
                                        const activityName = isCustom ? customName : (currentActivityOptions.find((o) => o.id === currentActivityId)?.name ?? '');
                                        setLastCurrentActivityUpdate({
                                          activityName,
                                          location: currentLocation.trim() || '',
                                          at: moment().format('h:mm A'),
                                        });
                                        toastManager.success('Current activity updated');
                                        setShowRightNowForm(false);
                                        onTimeEntryUpdate?.();
                                        const res = await trainerActivityRepository.getSessionActivities(session.scheduleId);
                                        const updates = (res.schedule as { current_activity_updates?: Array<{ id: number; activity_name: string; location: string | null; at: string }> })?.current_activity_updates ?? [];
                                        setCurrentActivityUpdates(updates);
                                        if (isCustom && customName) {
                                          const res = await trainerActivityRepository.getSessionActivities(session.scheduleId);
                                          const available = (res.available_activities ?? []) as Array<{ id: number; name: string }>;
                                          const found = available.find((a) => a.name === customName);
                                          if (found) {
                                            setCurrentActivityId(found.id);
                                            setCurrentActivityCustomName('');
                                            setCurrentActivityOptions((prev) => {
                                              const has = prev.some((o) => o.id === found.id);
                                              if (!has) return [...prev, found].sort((a, b) => a.name.localeCompare(b.name));
                                              return prev;
                                            });
                                          }
                                        }
                                      } catch (e: unknown) {
                                        toastManager.error((e as Error)?.message ?? 'Failed to update');
                                      } finally {
                                        setCurrentActivityUpdating(false);
                                      }
                                    }}
                                  >
                                    {currentActivityUpdating ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Updating…</> : 'Update what I\'m doing now'}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowRightNowForm(false)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3">
                      To add or view activity logs (notes, photos), use the <button type="button" onClick={() => setActiveTab('activity_log')} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">Logs</button> tab.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Session not in progress</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">View or add activity logs (notes, photos) in the <strong>Logs</strong> tab.</p>
                      <Button type="button" size="sm" variant="outline" onClick={() => setActiveTab('activity_log')}>
                        Open Logs tab
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'clock' && (
              <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Time clock</p>
                {!isOngoing && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                    Clock in and out is only available while the session is in progress.
                  </p>
                )}
                {isOngoing && (
                  <>
                    {sessionTimeEntriesLoading ? (
                      <div className="animate-pulse space-y-2" aria-busy="true" aria-label="Loading time entries">
                        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const lastEntry = sessionTimeEntries.length > 0 ? sessionTimeEntries[sessionTimeEntries.length - 1] : null;
                          const canClockIn = !lastEntry || lastEntry.type === 'clock_out';
                          const canClockOut = lastEntry?.type === 'clock_in';
                          const refreshTimeEntries = async () => {
                            try {
                              const res = await trainerTimeEntryRepository.list({ booking_schedule_id: session.scheduleId });
                              setSessionTimeEntries(res.time_entries ?? []);
                            } catch {
                              setSessionTimeEntries([]);
                            }
                            onTimeEntryUpdate?.();
                          };
                          return (
                            <>
                              {canClockIn && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="border-green-600 text-green-700 hover:bg-green-50 dark:border-green-500 dark:text-green-300 dark:hover:bg-green-900/20"
                                  disabled={clockActionLoading}
                                  onClick={async () => {
                                    setClockActionLoading(true);
                                    try {
                                      const coords = await getCurrentPositionOptional();
                                      await trainerTimeEntryRepository.clockIn(session.scheduleId, coords ? { latitude: coords.latitude, longitude: coords.longitude } : undefined);
                                      toastManager.success('Clocked in');
                                      await refreshTimeEntries();
                                    } catch (e: unknown) {
                                      toastManager.error((e as Error)?.message ?? 'Failed to clock in');
                                    } finally {
                                      setClockActionLoading(false);
                                    }
                                  }}
                                >
                                  {clockActionLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Clock in'}
                                </Button>
                              )}
                              {canClockOut && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="border-amber-600 text-amber-700 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-300 dark:hover:bg-amber-900/20"
                                  disabled={clockActionLoading}
                                  onClick={async () => {
                                    setClockActionLoading(true);
                                    try {
                                      await trainerTimeEntryRepository.clockOut(session.scheduleId);
                                      toastManager.success('Clocked out');
                                      await refreshTimeEntries();
                                    } catch (e: unknown) {
                                      toastManager.error((e as Error)?.message ?? 'Failed to clock out');
                                    } finally {
                                      setClockActionLoading(false);
                                    }
                                  }}
                                >
                                  {clockActionLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Clock out'}
                                </Button>
                              )}
                              {!canClockIn && !canClockOut && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">No clock action available.</p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </>
                )}
                {sessionTimeEntries.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">Entries</p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                      {sessionTimeEntries.map((e) => (
                        <li key={e.id}>
                          {e.type === 'clock_in' ? 'In' : 'Out'} {e.clocked_at ? moment(e.clocked_at).format('h:mm A') : '—'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </BaseModal>

      {/* Activity Log Detail Modal */}
      <ActivityLogDetailModal
        isOpen={activityLogDetailOpen}
        onClose={() => {
          setActivityLogDetailOpen(false);
          setSelectedLog(null);
        }}
        log={selectedLog}
        onUpdate={refreshActivityLogs}
      />

      {/* Add / Edit Activity Log Modal (session-scoped) */}
      <BaseModal
        isOpen={activityLogFormOpen}
        onClose={() => setActivityLogFormOpen(false)}
        title={
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">Add activity log</span>
            <span className="text-xs text-gray-500">Child: {session.childName}</span>
          </div>
        }
        size="xl"
        footer={
          <div className="flex w-full justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActivityLogFormOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={activityLogFormId}
            >
              Save activity log
            </Button>
          </div>
        }
      >
        <div>
          <ActivityLogForm
            childId={session.childId}
            childName={session.childName}
            bookingId={session.bookingId}
            bookingScheduleId={session.scheduleId}
            onSuccess={handleActivityLogCreatedOrUpdated}
            onCancel={() => setActivityLogFormOpen(false)}
            formId={activityLogFormId}
            showActions={false}
            showChildHeader={false}
            initialData={{
              activity_date: session.date,
              start_time: `${session.startTime}:00`,
              end_time: `${session.endTime}:00`,
            }}
          />
        </div>
      </BaseModal>
    </>
  );
}
