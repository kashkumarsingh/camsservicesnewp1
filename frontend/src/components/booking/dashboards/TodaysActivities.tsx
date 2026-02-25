'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Calendar, Clock, Activity, AlertCircle, X } from 'lucide-react';
import moment from 'moment';
import type { BookingDTO } from '@/core/application/booking/dto/BookingDTO';
import { LOCAL_STORAGE_KEYS, getLocalStorageItem, setLocalStorageItem } from '@/utils/localStorageConstants';

interface TodaysActivitiesProps {
  bookings: BookingDTO[];
}

/**
 * Today's Activities Component
 * 
 * Displays all activities scheduled for today across all active bookings.
 * Shows activity names, times, and associated children.
 * 
 * Real-time updates: Refreshes every minute to update session status (upcoming/ongoing/past).
 */
export default function TodaysActivities({ bookings }: TodaysActivitiesProps) {
  // Real-time clock state - updates every minute
  const [currentTime, setCurrentTime] = useState(moment());
  
  // Get today's date in YYYY-MM-DD format (for localStorage key)
  const today = currentTime.format('YYYY-MM-DD');
  
  // Track if entire "Today's Activities" section is dismissed for today
  const [isSectionDismissed, setIsSectionDismissed] = useState<boolean>(() => {
    const dismissedDates = getLocalStorageItem('DISMISSED_TODAY_ACTIVITIES');
    if (dismissedDates) {
      try {
        const dates = JSON.parse(dismissedDates);
        return dates.includes(today);
      } catch {
        return false;
      }
    }
    return false;
  });
  
  // Track dismissed completed sessions (stored in localStorage)
  const [dismissedSessions, setDismissedSessions] = useState<Set<string>>(() => {
    const stored = getLocalStorageItem('DISMISSED_COMPLETED_SESSIONS');
    if (stored) {
      try {
        return new Set(JSON.parse(stored));
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  // Update time every minute for real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Update dismissed state when date changes (new day)
  useEffect(() => {
    const dismissedDates = getLocalStorageItem('DISMISSED_TODAY_ACTIVITIES');
    if (dismissedDates) {
      try {
        const dates = JSON.parse(dismissedDates);
        setIsSectionDismissed(dates.includes(today));
      } catch {
        setIsSectionDismissed(false);
      }
    } else {
      setIsSectionDismissed(false);
    }
  }, [today]);

  // Extract all today's sessions from all bookings
  const todaysSessions = useMemo(() => {
    const sessions: Array<{
      booking: BookingDTO;
      schedule: BookingDTO['schedules'][0];
      childName: string;
      activities: string[];
      startTime: string;
      endTime: string;
      duration: number;
      isUpcoming: boolean; // True if session hasn't started yet
      isOngoing: boolean; // True if session is currently happening
      isPast: boolean; // True if session has ended
    }> = [];

    bookings.forEach((booking) => {
      // Only show sessions from confirmed, paid bookings
      if (booking.status !== 'confirmed' || booking.paymentStatus !== 'paid') {
        return;
      }

      if (!booking.schedules || booking.schedules.length === 0) {
        return;
      }

      booking.schedules.forEach((schedule) => {
        // Check if this session is scheduled for today
        if (schedule.date === today) {
          const startMoment = moment(`${schedule.date} ${schedule.startTime}`, 'YYYY-MM-DD HH:mm');
          const endMoment = moment(`${schedule.date} ${schedule.endTime}`, 'YYYY-MM-DD HH:mm');
          // Use currentTime state for real-time updates
          const now = currentTime.clone();

          // Get child name from participants
          const childName = booking.participants?.[0]
            ? `${booking.participants[0].firstName} ${booking.participants[0].lastName}`
            : 'Your child';

          // Get activity names
          const activities = schedule.activities?.map((a) => a.name) || [];

          // Calculate duration
          const duration = schedule.durationHours || endMoment.diff(startMoment, 'hours', true);

          // Determine session status (real-time calculation)
          const isUpcoming = now.isBefore(startMoment);
          const isOngoing = now.isAfter(startMoment) && now.isBefore(endMoment);
          const isPast = now.isAfter(endMoment);

          sessions.push({
            booking,
            schedule,
            childName,
            activities,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            duration,
            isUpcoming,
            isOngoing,
            isPast,
          });
        }
      });
    });

    // Sort by start time (earliest first)
    return sessions.sort((a, b) => {
      const timeA = moment(a.startTime, 'HH:mm');
      const timeB = moment(b.startTime, 'HH:mm');
      return timeA.diff(timeB);
    });
  }, [bookings, today, currentTime]); // Include currentTime for real-time updates

  // If section is dismissed for today, don't render anything
  if (isSectionDismissed) {
    return null;
  }

  // If no sessions today, don't render anything
  if (todaysSessions.length === 0) {
    return null;
  }

  // Group sessions by status
  const upcomingSessions = todaysSessions.filter((s) => s.isUpcoming);
  const ongoingSessions = todaysSessions.filter((s) => s.isOngoing);
  const pastSessions = todaysSessions.filter((s) => s.isPast);
  
  // Separate dismissed and visible past sessions
  const visiblePastSessions = pastSessions.filter((session) => {
    const sessionKey = `${session.schedule.id || session.schedule.date}-${session.startTime}-${session.endTime}`;
    return !dismissedSessions.has(sessionKey);
  });
  
  const dismissedPastSessions = pastSessions.filter((session) => {
    const sessionKey = `${session.schedule.id || session.schedule.date}-${session.startTime}-${session.endTime}`;
    return dismissedSessions.has(sessionKey);
  });
  
  // Calculate visible session count (exclude dismissed)
  const visibleSessionCount = upcomingSessions.length + ongoingSessions.length + visiblePastSessions.length;
  
  // Note: We don't hide the component even if all sessions are dismissed
  // This allows users to see that there were sessions today, even if they dismissed them
  // The component will only hide if there are truly no sessions today (checked above)
  
  // Handle dismissing a completed session
  const handleDismissSession = (session: typeof pastSessions[0]) => {
    const sessionKey = `${session.schedule.id || session.schedule.date}-${session.startTime}-${session.endTime}`;
    const newDismissed = new Set(dismissedSessions);
    newDismissed.add(sessionKey);
    setDismissedSessions(newDismissed);
    
    // Persist to localStorage
    setLocalStorageItem('DISMISSED_COMPLETED_SESSIONS', JSON.stringify(Array.from(newDismissed)));
  };

  // Handle dismissing the entire section for today
  const handleDismissSection = () => {
    setIsSectionDismissed(true);
    
    // Persist to localStorage
    const dismissedDates = getLocalStorageItem('DISMISSED_TODAY_ACTIVITIES');
    let dates: string[] = [];
    
    if (dismissedDates) {
      try {
        dates = JSON.parse(dismissedDates);
      } catch {
        dates = [];
      }
    }
    
    // Add today's date if not already present
    if (!dates.includes(today)) {
      dates.push(today);
      setLocalStorageItem('DISMISSED_TODAY_ACTIVITIES', JSON.stringify(dates));
    }
  };

  // Check if all sessions are completed (no upcoming or ongoing sessions)
  const allSessionsCompleted = upcomingSessions.length === 0 && ongoingSessions.length === 0 && pastSessions.length > 0;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-card shadow-card p-6 mb-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-navy-blue">Today's Activities</h2>
            <p className="text-sm text-gray-600">
              {moment(today).format('dddd, MMMM Do YYYY')} • {visibleSessionCount} {visibleSessionCount === 1 ? 'session' : 'sessions'} scheduled
              {ongoingSessions.length > 0 && (
                <span className="ml-2 text-green-700 font-semibold">
                  • {ongoingSessions.length} {ongoingSessions.length === 1 ? 'in progress' : 'in progress'}
                </span>
              )}
            </p>
          </div>
        </div>
        {/* Show close button when all sessions are completed */}
        {allSessionsCompleted && (
          <button
            onClick={handleDismissSection}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Dismiss Today's Activities"
            title="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Ongoing Sessions (Highest Priority) */}
        {ongoingSessions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                  Happening Now
                </h3>
              </div>
              {ongoingSessions.length > 1 && (
                <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  {ongoingSessions.length} active
                </span>
              )}
            </div>
            <div className={`space-y-3 ${ongoingSessions.length > 3 ? 'max-h-[400px] overflow-y-auto pr-2' : ''}`}>
              {ongoingSessions.map((session, index) => {
                // Calculate time until session ends
                const endMoment = moment(`${session.schedule.date} ${session.endTime}`, 'YYYY-MM-DD HH:mm');
                const timeUntilEnd = moment.duration(endMoment.diff(currentTime));
                const minutesUntilEnd = Math.floor(timeUntilEnd.asMinutes());
                const isEndingSoon = minutesUntilEnd <= 30 && minutesUntilEnd > 0;
                const isEndingVerySoon = minutesUntilEnd <= 10 && minutesUntilEnd > 0;

                return (
                  <div
                    key={`ongoing-${index}`}
                    className={`bg-white border-2 rounded-lg p-4 shadow-md ${
                      isEndingVerySoon 
                        ? 'border-amber-400 bg-amber-50/30' 
                        : isEndingSoon 
                        ? 'border-amber-300 bg-amber-50/20' 
                        : 'border-green-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Child Name - Prominent Header */}
                        <div className="mb-3 pb-2 border-b border-green-200">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Activity className="w-5 h-5 text-green-600" />
                            <h4 className="text-lg font-bold text-gray-900">{session.childName}</h4>
                            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                              IN PROGRESS
                            </span>
                            {isEndingSoon && (
                              <span className={`text-xs font-bold px-3 py-1 rounded-full animate-pulse ${
                                isEndingVerySoon
                                  ? 'bg-amber-200 text-amber-900 border-2 border-amber-400'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {isEndingVerySoon 
                                  ? `⏰ Ending in ${minutesUntilEnd} min!` 
                                  : `⏰ Wrapping up in ${minutesUntilEnd} min`
                                }
                              </span>
                            )}
                          </div>
                        </div>
                        {session.activities.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-600 mb-1">Activities:</p>
                            <div className="flex flex-wrap gap-2">
                              {session.activities.map((activity, actIndex) => (
                                <span
                                  key={actIndex}
                                  className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                                >
                                  {activity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {session.startTime} - {session.endTime}
                            </span>
                          </div>
                          <span className="text-xs">({session.duration.toFixed(1)}h)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                Upcoming Today
              </h3>
            </div>
            <div className="space-y-3">
              {upcomingSessions.map((session, index) => {
                const startMoment = moment(`${session.schedule.date} ${session.startTime}`, 'YYYY-MM-DD HH:mm');
                // Use currentTime for real-time countdown
                const timeUntil = moment.duration(startMoment.diff(currentTime));
                const hoursUntil = Math.floor(timeUntil.asHours());
                const minutesUntil = timeUntil.minutes();

                return (
                  <div
                    key={`upcoming-${index}`}
                    className="bg-white border-2 border-blue-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">{session.childName}</span>
                        </div>
                        {session.activities.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-600 mb-1">Activities:</p>
                            <div className="flex flex-wrap gap-2">
                              {session.activities.map((activity, actIndex) => (
                                <span
                                  key={actIndex}
                                  className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                                >
                                  {activity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold text-blue-600">
                              {session.startTime} - {session.endTime}
                            </span>
                          </div>
                          <span className="text-xs">({session.duration.toFixed(1)}h)</span>
                          {hoursUntil > 0 && (
                            <span className="text-xs text-blue-600">
                              in {hoursUntil}h {minutesUntil}m
                            </span>
                          )}
                          {hoursUntil === 0 && minutesUntil > 0 && (
                            <span className="text-xs text-blue-600">in {minutesUntil}m</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Past Sessions (Today but already completed) */}
        {visiblePastSessions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Completed Today
              </h3>
            </div>
            <div className="space-y-2">
              {visiblePastSessions.map((session, index) => (
                <div
                  key={`past-${index}`}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 opacity-75 relative group"
                >
                  <button
                    onClick={() => handleDismissSession(session)}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    aria-label="Dismiss completed session"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                  <div className="flex items-center justify-between pr-8">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">{session.childName}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {session.startTime} - {session.endTime}
                    </div>
                  </div>
                  {session.activities.length > 0 && (
                    <div className="mt-1 text-xs text-gray-500">
                      {session.activities.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dismissed Sessions (Minimal Google Calendar style) */}
        {dismissedPastSessions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <X className="w-3 h-3 text-gray-400" />
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Completed (Hidden)
              </h3>
            </div>
            <div className="space-y-1.5">
              {dismissedPastSessions.map((session, index) => (
                <div
                  key={`dismissed-${index}`}
                  className="flex items-center justify-between py-1.5 px-2 border-l-2 border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Activity className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    <span className="text-xs text-gray-600 line-through truncate">{session.childName}</span>
                    {session.activities.length > 0 && (
                      <span className="text-xs text-gray-500 truncate">
                        • {session.activities.join(', ')}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {session.startTime} - {session.endTime}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

