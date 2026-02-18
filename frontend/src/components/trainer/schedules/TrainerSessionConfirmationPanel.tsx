'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import moment from 'moment';
import Button from '@/components/ui/Button';
import { trainerScheduleRepository } from '@/infrastructure/http/trainer/TrainerScheduleRepository';
import type { TrainerScheduleDetail } from '@/core/application/trainer/types';
import { toastManager } from '@/utils/toast';

const PENDING_CONFIRMATION = 'pending_trainer_confirmation';

interface TrainerSessionConfirmationPanelProps {
  scheduleId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmedOrDeclined?: () => void;
}

/**
 * Trainer Session Confirmation Panel (side panel)
 *
 * Shown when a session has been assigned to the trainer and is pending confirmation.
 * Trainer can confirm (session becomes scheduled) or decline (system may try next trainer).
 * Opened via ?confirm=9 in URL or from the "Session confirmation requested" notification.
 */
export default function TrainerSessionConfirmationPanel({
  scheduleId,
  isOpen,
  onClose,
  onConfirmedOrDeclined,
}: TrainerSessionConfirmationPanelProps) {
  const [schedule, setSchedule] = useState<TrainerScheduleDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<'confirm' | 'decline' | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    if (!isOpen || scheduleId == null) {
      setSchedule(null);
      setError(null);
      setDeclineReason('');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    trainerScheduleRepository
      .getById(scheduleId)
      .then((s) => {
        if (!cancelled) {
          setSchedule(s);
          if ((s.trainer_assignment_status ?? '') !== PENDING_CONFIRMATION) {
            setError('This session is not pending your confirmation.');
          }
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError((err as Error)?.message ?? 'Failed to load session.');
          setSchedule(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, scheduleId]);

  const handleConfirm = async () => {
    if (scheduleId == null) return;
    setActionLoading('confirm');
    try {
      await trainerScheduleRepository.confirmAssignment(scheduleId);
      toastManager.success('Session confirmed. It is now scheduled.');
      onConfirmedOrDeclined?.();
      onClose();
    } catch (err: unknown) {
      toastManager.error((err as Error)?.message ?? 'Failed to confirm session.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async () => {
    if (scheduleId == null) return;
    setActionLoading('decline');
    try {
      await trainerScheduleRepository.declineAssignment(scheduleId, declineReason.trim() || undefined);
      toastManager.success('Session declined. Another trainer may be assigned.');
      onConfirmedOrDeclined?.();
      onClose();
    } catch (err: unknown) {
      toastManager.error((err as Error)?.message ?? 'Failed to decline session.');
    } finally {
      setActionLoading(null);
    }
  };

  const childName =
    schedule?.booking?.participants?.length &&
    schedule.booking.participants[0]
      ? schedule.booking.participants[0].child?.name ??
        [schedule.booking.participants[0].first_name, schedule.booking.participants[0].last_name]
            .filter(Boolean)
            .join(' ')
      : 'Child';

  const dateLabel = schedule?.date
    ? moment(schedule.date).format('dddd, D MMM YYYY')
    : '';
  const timeLabel =
    schedule?.start_time && schedule?.end_time
      ? `${moment(schedule.start_time, 'HH:mm:ss').format('h:mm A')} – ${moment(schedule.end_time, 'HH:mm:ss').format('h:mm A')}`
      : '';

  return (
    <>
      {/* Backdrop */}
      <div
        role="presentation"
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        aria-label="Session confirmation"
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md border-l border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Confirm session
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              aria-label="Close panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" aria-hidden />
                <span className="sr-only">Loading session…</span>
              </div>
            )}

            {error && !loading && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>
                <Button type="button" variant="outline" className="mt-3" onClick={onClose}>
                  Close
                </Button>
              </div>
            )}

            {schedule && !loading && !error && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You have been assigned to this session. Please confirm or decline.
                </p>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">{childName}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    {dateLabel}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    {timeLabel}
                  </div>
                </div>

                <div>
                  <label htmlFor="decline-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Reason for declining (optional)
                  </label>
                  <textarea
                    id="decline-reason"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="e.g. Not available that day"
                    rows={2}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    disabled={actionLoading !== null}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          {schedule && !loading && !error && (
            <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/30"
                  onClick={handleDecline}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === 'decline' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Declining…
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      Decline
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleConfirm}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === 'confirm' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Confirming…
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Confirm session
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
