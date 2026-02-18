'use client';

import React, { useMemo, useState, useEffect } from 'react';
import moment from 'moment';
import { X, Clock, Calendar, Edit2, Trash2, Info } from 'lucide-react';
import { BaseModal } from '@/components/ui/Modal';
import { HorizontalCalendar } from '@/components/ui/Calendar';
import type { CalendarDate } from '@/components/ui/Calendar';

interface BookedSessionData {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  activities: { id: number; name: string; duration?: number }[];
  notes?: string;
  /** Set when admin has assigned a trainer; shown in session details */
  trainerName?: string;
}

interface SessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSession: BookedSessionData | null;
  allSessions: BookedSessionData[];
  onDateChange: (date: string) => void;
  onEdit?: () => void;
  onCancel?: () => void;
  minDate?: string; // Package start date (YYYY-MM-DD)
  maxDate?: string; // Package expiry date (YYYY-MM-DD)
}

/**
 * SessionDetailModal Component
 * 
 * Shows detailed view of a booked session with:
 * - Horizontal calendar strip (Facebook planner style)
 * - Full session details (time, activities, notes)
 * - Navigation between booked dates
 * - Edit/Cancel actions
 */
export default function SessionDetailModal({
  isOpen,
  onClose,
  selectedSession,
  allSessions,
  onDateChange,
  onEdit,
  onCancel,
  minDate,
  maxDate,
}: SessionDetailModalProps) {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [noSessionMessage, setNoSessionMessage] = useState<string | null>(null);
  const [displayedDate, setDisplayedDate] = useState<string | null>(null);

  // Convert booked sessions to CalendarDate format for HorizontalCalendar
  const highlightedDates: CalendarDate[] = useMemo(() => {
    return allSessions.map(session => ({
      date: session.date,
      label: `${session.duration}h`,
      metadata: session,
    }));
  }, [allSessions]);

  // Initialize displayedDate when selectedSession changes
  useEffect(() => {
    if (selectedSession) {
      setDisplayedDate(selectedSession.date);
      setNoSessionMessage(null);
    }
  }, [selectedSession]);

  // NOW we can do early return after all hooks are called
  if (!isOpen || !selectedSession) return null;

  // Determine which date we are showing
  const currentDateStr = displayedDate || selectedSession.date;

  // All sessions for the currently displayed date (can be 1 or many)
  const sessionsForDisplayedDate = allSessions.filter(
    (session) => session.date === currentDateStr,
  );

  const hasSessionForDisplayedDate = sessionsForDisplayedDate.length > 0;
  // Primary session (first) used only for simple edit/lock logic when there is a single session that day
  const primarySession = hasSessionForDisplayedDate ? sessionsForDisplayedDate[0] : null;

  // Use displayed date or fallback to selectedSession date
  const displayDate = moment(currentDateStr);
  
  // Calculate edit/lock state from the primary session (single-session days only)
  const sessionDateTime = primarySession
    ? moment(`${primarySession.date} ${primarySession.startTime}`, 'YYYY-MM-DD HH:mm')
    : null;
  const isPastSession = sessionDateTime ? sessionDateTime.isBefore(moment()) : false;
  const isWithinOneHour = sessionDateTime && !isPastSession 
    ? sessionDateTime.diff(moment(), 'hours', true) > 0 && sessionDateTime.diff(moment(), 'hours', true) <= 1
    : false;
  const canEdit = !isPastSession && !isWithinOneHour;

  // Handle date click from HorizontalCalendar
  const handleCalendarDateClick = (date: string, metadata?: any) => {
    // Find the session for this date
    const sessionForDate = allSessions.find(s => s.date === date);
    if (sessionForDate) {
      setNoSessionMessage(null); // Clear any previous message
      setDisplayedDate(date);
      onDateChange(date);
    } else {
      // Show meaningful message for dates without sessions
      setDisplayedDate(date); // Update displayed date even if no session
      const dateMoment = moment(date);
      const isToday = dateMoment.isSame(moment(), 'day');
      const isPast = dateMoment.isBefore(moment(), 'day');
      const isFuture = dateMoment.isAfter(moment(), 'day');
      
      let message = '';
      if (isToday) {
        message = 'No session booked for today. Click "Book Sessions" to schedule one.';
      } else if (isPast) {
        message = `No session was booked for ${dateMoment.format('MMMM D, YYYY')}.`;
      } else {
        message = `No session booked for ${dateMoment.format('MMMM D, YYYY')}. Click "Book Sessions" to schedule one.`;
      }
      
      setNoSessionMessage(message);
      // Auto-hide message after 4 seconds
      setTimeout(() => {
        setNoSessionMessage(null);
      }, 4000);
    }
  };

  // Convert minDate/maxDate strings to Moment objects for HorizontalCalendar
  const minDateMoment = minDate ? moment(minDate) : undefined;
  const maxDateMoment = maxDate ? moment(maxDate) : undefined;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div>
          <span className="text-lg font-medium text-gray-900">Session Details</span>
          <p className="text-sm text-gray-600 mt-0.5">
            {displayDate.format('dddd, MMMM D, YYYY')}
          </p>
        </div>
      }
      size="xl"
      footer={
        <div className="flex flex-col w-full">
          {hasSessionForDisplayedDate && sessionsForDisplayedDate.length === 1 && (
            <>
              {isPastSession && (
                <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                  This session is in the past and cannot be edited or cancelled.
                </div>
              )}
              {isWithinOneHour && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                  <strong>🔒 Session Locked:</strong> This session starts within 1 hour and cannot be edited. Please contact support if you need urgent changes.
                </div>
              )}
            </>
          )}
          <div className="flex flex-wrap gap-2 justify-end">
            {hasSessionForDisplayedDate && sessionsForDisplayedDate.length === 1 && onCancel && canEdit && (
              <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors border border-red-200 hover:border-red-300">
                Cancel Session
              </button>
            )}
            {hasSessionForDisplayedDate && sessionsForDisplayedDate.length === 1 && onEdit && canEdit && (
              <button type="button" onClick={onEdit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors">
                Edit Session
              </button>
            )}
            {hasSessionForDisplayedDate && sessionsForDisplayedDate.length === 1 && onEdit && !canEdit && !isPastSession && (
              <button type="button" disabled className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded transition-colors cursor-not-allowed" title="Session is locked (starts within 1 hour)">
                Edit Session (Locked)
              </button>
            )}
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors">
              Close
            </button>
          </div>
        </div>
      }
    >
      <div>
          {/* HORIZONTAL CALENDAR - Now with minDate/maxDate for package constraints */}
          <HorizontalCalendar
            selectedDate={displayedDate || selectedSession.date}
            highlightedDates={highlightedDates}
            onDateClick={handleCalendarDateClick}
            highlightColor="blue"
            variant="default"
            minDate={minDateMoment}
            maxDate={maxDateMoment}
            className="mb-4"
          />

          {/* Message for dates without sessions */}
          {noSessionMessage && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 flex-1">{noSessionMessage}</p>
              <button
                onClick={() => setNoSessionMessage(null)}
                className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                aria-label="Dismiss message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* SESSION DETAILS - Only show if there's a session for the displayed date */}
          {hasSessionForDisplayedDate ? (
            <div className="space-y-4">
              {sessionsForDisplayedDate.length > 1 && (
                <div className="text-xs font-medium text-gray-600">
                  {sessionsForDisplayedDate.length} sessions on this day
                </div>
              )}
              {sessionsForDisplayedDate.map((session, index) => (
                <div
                  key={`${session.date}-${session.startTime}-${session.endTime}-${index}`}
                  className="space-y-4 border border-gray-200 rounded-lg p-4"
                >
                  {/* Header: Session number and time */}
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Session {sessionsForDisplayedDate.length > 1 ? index + 1 : 1}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {session.startTime} - {session.endTime}
                      </p>
                      <span className="text-xs text-gray-500">
                        ({session.duration}h)
                      </span>
                    </div>
                  </div>

                  {/* Trainer (when assigned by admin) */}
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                      Trainer
                    </p>
                    <p className="text-sm text-gray-900">
                      {session.trainerName ?? 'Waiting for trainer approval'}
                    </p>
                  </div>

                  {/* Activities */}
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                      Activities
                    </p>
                    {session.activities && session.activities.length > 0 ? (
                      <div className="space-y-1.5">
                        {session.activities.map((activity, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-1"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                              <p className="text-sm font-normal text-gray-900">
                                {activity.name}
                              </p>
                            </div>
                            {activity.duration && (
                              <span className="text-xs text-gray-500">
                                ~{activity.duration}h
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
                        <span className="text-blue-700 font-semibold text-sm">
                          Trainer&apos;s Choice
                        </span>
                        <span className="text-xs text-blue-700">
                          (Trainer will pick the activities for this session)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {session.notes && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                        Notes
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {session.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Empty state when no session for displayed date
            <div className="py-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No session details available for this date.</p>
            </div>
          )}
      </div>
    </BaseModal>
  );
}
