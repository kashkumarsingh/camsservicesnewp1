'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Activity, Edit2, Trash2, Plus, Loader2, CreditCard } from 'lucide-react';
import moment from 'moment';
import Button from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/dashboard/universal/EmptyState';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import type { BookingDTO } from '@/core/application/booking/dto/BookingDTO';
import { toastManager } from '@/utils/toast';

interface BookedSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDTO | null;
  childName?: string;
  /** Called after a session is cancelled so parent can refetch data without full page reload */
  onSessionCancelled?: () => void | Promise<void>;
  /** When provided, "Book More Sessions" calls this (e.g. open booking modal on dashboard) instead of navigating away */
  onBookMoreSessions?: () => void;
  /** When provided, Edit session calls this with scheduleId so parent can open edit flow (e.g. booking modal) */
  onEditSession?: (scheduleId: string) => void;
}

/**
 * Booked Sessions Modal Component
 * 
 * Displays a list of all booked sessions for a specific booking/child.
 * Shows sessions in a clean, Google Calendar-style list.
 */
export default function BookedSessionsModal({
  isOpen,
  onClose,
  booking,
  childName,
  onSessionCancelled,
  onBookMoreSessions,
  onEditSession,
}: BookedSessionsModalProps) {
  const [cancellingSessionId, setCancellingSessionId] = useState<string | number | null>(null);

  if (!isOpen || !booking) {
    return null;
  }

  // Helper: Check if session is within 1 hour (cannot be edited)
  const isSessionWithinOneHour = (session: BookingDTO['schedules'][0]): boolean => {
    const sessionDateTime = moment(`${session.date} ${session.startTime}`, 'YYYY-MM-DD HH:mm');
    const now = moment();
    const hoursUntilSession = sessionDateTime.diff(now, 'hours', true);
    return hoursUntilSession > 0 && hoursUntilSession <= 1;
  };

  // Helper: Check if session is in the past
  const isSessionPast = (session: BookingDTO['schedules'][0]): boolean => {
    const sessionDate = moment(session.date);
    const today = moment().startOf('day');
    if (sessionDate.isBefore(today, 'day')) {
      return true;
    }
    if (sessionDate.isSame(today, 'day')) {
      const sessionDateTime = moment(`${session.date} ${session.startTime}`, 'YYYY-MM-DD HH:mm');
      return sessionDateTime.isBefore(moment());
    }
    return false;
  };

  // Check if session can be edited
  const canEditSession = (session: BookingDTO['schedules'][0]): boolean => {
    return !isSessionPast(session) && !isSessionWithinOneHour(session);
  };

  // Check if session can be cancelled (same as edit for now)
  const canCancelSession = (session: BookingDTO['schedules'][0]): boolean => {
    return canEditSession(session);
  };

  // Handle edit session – call parent to open edit flow on dashboard (e.g. booking modal)
  const handleEditSession = (session: BookingDTO['schedules'][0]) => {
    if (!session.id) return;
    const scheduleId = String(session.id);
    if (onEditSession) {
      onEditSession(scheduleId);
      onClose();
    }
  };

  // Handle cancel session
  const handleCancelSession = async (session: BookingDTO['schedules'][0]) => {
    if (!booking?.id || !session.id) return;
    
    if (!confirm(`Are you sure you want to cancel this session on ${moment(session.date).format('MMMM D, YYYY')} at ${session.startTime}?`)) {
      return;
    }

    setCancellingSessionId(session.id);
    try {
      // Use DELETE endpoint to cancel/delete the session
      await apiClient.delete(API_ENDPOINTS.BOOKING_SCHEDULE_BY_ID(session.id));
      await onSessionCancelled?.();
      onClose();
    } catch (error: unknown) {
      console.error('Failed to cancel session:', error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message = err?.response?.data?.message ?? (error instanceof Error ? error.message : 'Failed to cancel session. Please try again.');
      toastManager.error(message);
    } finally {
      setCancellingSessionId(null);
    }
  };

  // Get all non-cancelled sessions, sorted by date and time
  const sessions = (booking.schedules || [])
    .filter(s => s.status !== 'cancelled' && s.status !== 'rejected')
    .sort((a, b) => {
      const dateA = moment(`${a.date} ${a.startTime}`, 'YYYY-MM-DD HH:mm');
      const dateB = moment(`${b.date} ${b.startTime}`, 'YYYY-MM-DD HH:mm');
      return dateA.diff(dateB);
    });

  // Group sessions by date
  const sessionsByDate = sessions.reduce((acc, session) => {
    const date = session.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {} as Record<string, typeof sessions>);

  const sortedDates = Object.keys(sessionsByDate).sort((a, b) => 
    moment(a).diff(moment(b))
  );

  const today = moment().format('YYYY-MM-DD');
  const now = moment();
  const needsPayment = booking.paymentStatus !== 'paid' && booking.reference;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Booked hours and packages"
      size="lg"
      footer={
        onBookMoreSessions ? (
          <div className="flex justify-end w-full">
            <Button
              onClick={() => {
                onBookMoreSessions();
                onClose();
              }}
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
            >
              Book More Sessions
            </Button>
          </div>
        ) : undefined
      }
    >
      {needsPayment && (
        <div className="mb-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-sm font-medium text-amber-800 mb-2">
            Payment required before you can book sessions
          </p>
          <p className="text-xs text-amber-700 mb-3">
            Complete payment to activate your package and add sessions for this child.
          </p>
          <Link
            href={`/bookings/${booking.reference}/payment`}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            <CreditCard className="w-4 h-4" />
            Complete payment
          </Link>
        </div>
      )}
      {(childName || booking.package?.name) && (
        <div className="mb-4">
          {childName && <p className="text-sm text-gray-600">{childName}</p>}
          {booking.package?.name && <p className="text-xs text-gray-500 mt-0.5">{booking.package.name}</p>}
        </div>
      )}
      <div className="space-y-6">
          {sessions.length === 0 ? (
            <EmptyState
              title={EMPTY_STATE.NO_SESSIONS_BOOKED_YET.title}
              message={EMPTY_STATE.NO_SESSIONS_BOOKED_YET.message}
            />
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => {
                const dateSessions = sessionsByDate[date];
                const dateMoment = moment(date);
                const isToday = date === today;
                const isPast = dateMoment.isBefore(today, 'day');
                const isFuture = dateMoment.isAfter(today, 'day');

                return (
                  <div key={date}>
                    {/* Date Header */}
                    <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-200">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {isToday 
                            ? 'Today' 
                            : isPast 
                            ? dateMoment.format('dddd, MMMM D, YYYY')
                            : dateMoment.format('dddd, MMMM D, YYYY')
                          }
                        </h3>
                        <p className="text-xs text-gray-500">
                          {dateSessions.length} {dateSessions.length === 1 ? 'session' : 'sessions'}
                        </p>
                      </div>
                    </div>

                    {/* Sessions for this date */}
                    <div className="space-y-2 ml-8">
                      {dateSessions.map((session, index) => {
                        const startMoment = moment(`${session.date} ${session.startTime}`, 'YYYY-MM-DD HH:mm');
                        const endMoment = moment(`${session.date} ${session.endTime}`, 'YYYY-MM-DD HH:mm');
                        const isUpcoming = now.isBefore(startMoment);
                        const isOngoing = now.isAfter(startMoment) && now.isBefore(endMoment);
                        const isPast = now.isAfter(endMoment);
                        const activities = session.activities?.map(a => a.name) || [];
                        const isTrainerChoice = activities.length === 0;

                        const canEdit = canEditSession(session);
                        const canCancel = canCancelSession(session);

                        return (
                          <div
                            key={session.id || index}
                            className={`p-3 rounded-lg border ${
                              isOngoing
                                ? 'bg-green-50 border-green-200'
                                : isPast
                                ? 'bg-gray-50 border-gray-200 opacity-75'
                                : 'bg-blue-50 border-blue-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {session.startTime} - {session.endTime}
                                  </span>
                                  {isOngoing && (
                                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                      In Progress
                                    </span>
                                  )}
                                  {isUpcoming && (
                                    <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                      Upcoming
                                    </span>
                                  )}
                                  {isPast && (
                                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                      Completed
                                    </span>
                                  )}
                                </div>
                                {isTrainerChoice ? (
                                  <div className="flex items-center gap-2 mt-1">
                                    <Activity className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-600">Trainer's Choice</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {activities.map((activity, actIdx) => (
                                      <span
                                        key={actIdx}
                                        className="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-full"
                                      >
                                        {activity}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {session.durationHours && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {session.durationHours}h duration
                                  </p>
                                )}
                              </div>
                              {/* Action Buttons */}
                              {((canEdit && onEditSession) || canCancel) && (
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  {canEdit && onEditSession && (
                                    <button
                                      onClick={() => handleEditSession(session)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                      title="Edit session"
                                      aria-label="Edit session"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  {canCancel && (
                                    <button
                                      onClick={() => handleCancelSession(session)}
                                      disabled={cancellingSessionId === session.id}
                                      className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      title="Cancel session"
                                      aria-label="Cancel session"
                                    >
                                      {cancellingSessionId === session.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </BaseModal>
  );
}
