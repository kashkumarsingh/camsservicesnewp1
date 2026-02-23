'use client';

import React from 'react';
import { AlertCircle, CheckCircle, Clock, Users, BarChart2, Star, Calendar } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import type { TrainerBooking, TrainerDashboardStats, TrainerProfile } from '@/core/application/trainer/types';

interface TrainerDashboardRightSidebarProps {
  stats: TrainerDashboardStats | null;
  bookings: TrainerBooking[];
  profile?: TrainerProfile | null;
}

/**
 * Trainer Dashboard Right Sidebar Component
 * 
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Right sidebar with hours available and pending actions for trainers
 */
export default function TrainerDashboardRightSidebar({
  stats,
  bookings,
  profile,
}: TrainerDashboardRightSidebarProps) {

  const now = moment();
  const startOfWeek = moment().isoWeekday(1).startOf('day');
  const endOfWeek = moment().isoWeekday(7).endOf('day');
  const startOfMonth = moment().startOf('month');
  const endOfMonth = moment().endOf('month');

  const {
    totalHoursThisWeek,
    totalHoursThisMonth,
    completedHoursThisWeek,
    completedHoursThisMonth,
    pendingHoursThisWeek,
    activeTraineesCount,
    sessionsThisWeekCount,
    completionRate,
  } = React.useMemo(() => {
    let weekHours = 0;
    let monthHours = 0;
    let weekCompletedHours = 0;
    let monthCompletedHours = 0;
    let weekPendingHours = 0;

    const traineeIds = new Set<number>();

    bookings.forEach((booking) => {
      booking.participants?.forEach((participant) => {
        const id = participant.childId ?? participant.child_id;
        if (id != null) {
          traineeIds.add(id);
        }
      });

      booking.schedules?.forEach((schedule) => {
        if (schedule.status === 'cancelled') return;

        const start = moment(`${schedule.date} ${schedule.start_time}`, 'YYYY-MM-DD HH:mm');
        const end = moment(`${schedule.date} ${schedule.end_time}`, 'YYYY-MM-DD HH:mm');
        const durationHours = Math.max(end.diff(start, 'minutes') / 60, 0);

        const inWeek = start.isBetween(startOfWeek, endOfWeek, undefined, '[]');
        const inMonth = start.isBetween(startOfMonth, endOfMonth, undefined, '[]');

        if (inWeek) {
          weekHours += durationHours;
          if (schedule.status === 'completed') {
            weekCompletedHours += durationHours;
          } else if (schedule.status === 'scheduled') {
            weekPendingHours += durationHours;
          }
        }

        if (inMonth) {
          monthHours += durationHours;
          if (schedule.status === 'completed') {
            monthCompletedHours += durationHours;
          }
        }
      });
    });

    // Completion rate based on all sessions in the last 30 days
    const thirtyDaysAgo = now.clone().subtract(30, 'days');
    let completedSessions = 0;
    let totalRecentSessions = 0;

    bookings.forEach((booking) => {
      booking.schedules?.forEach((schedule) => {
        if (schedule.status === 'cancelled') return;
        const sessionDate = moment(`${schedule.date} ${schedule.start_time}`, 'YYYY-MM-DD HH:mm');
        if (sessionDate.isSameOrAfter(thirtyDaysAgo) && sessionDate.isSameOrBefore(now)) {
          totalRecentSessions += 1;
          if (schedule.status === 'completed') {
            completedSessions += 1;
          }
        }
      });
    });

    const completionRateValue =
      totalRecentSessions === 0 ? 0 : Math.round((completedSessions / totalRecentSessions) * 100);

    // Sessions this week count (non-cancelled)
    let sessionsThisWeek = 0;
    bookings.forEach((booking) => {
      booking.schedules?.forEach((schedule) => {
        if (schedule.status === 'cancelled') return;
        const sessionDate = moment(`${schedule.date} ${schedule.start_time}`, 'YYYY-MM-DD HH:mm');
        if (sessionDate.isBetween(startOfWeek, endOfWeek, undefined, '[]')) {
          sessionsThisWeek += 1;
        }
      });
    });

    return {
      totalHoursThisWeek: weekHours,
      totalHoursThisMonth: monthHours,
      completedHoursThisWeek: weekCompletedHours,
      completedHoursThisMonth: monthCompletedHours,
      pendingHoursThisWeek: weekPendingHours,
      activeTraineesCount: traineeIds.size,
      sessionsThisWeekCount: sessionsThisWeek,
      completionRate: completionRateValue,
    };
  }, [bookings, now, startOfWeek, endOfWeek, startOfMonth, endOfMonth]);

  // Derive weekly capacity from the trainer's availability preferences
  // (sum of all configured time slots across the week). This avoids
  // hard-coded assumptions such as "40h".
  const weeklyCapacityHours = React.useMemo(() => {
    const availability = profile?.availability_preferences;
    if (!availability || availability.length === 0) {
      return 0;
    }

    let total = 0;
    availability.forEach((dayPref) => {
      dayPref.time_slots.forEach((slot) => {
        const start = moment(slot.start, ['HH:mm', 'HH:mm:ss'], true);
        const end = moment(slot.end, ['HH:mm', 'HH:mm:ss'], true);
        if (!start.isValid() || !end.isValid()) {
          return;
        }
        const durationHours = Math.max(end.diff(start, 'minutes') / 60, 0);
        total += durationHours;
      });
    });

    return total;
  }, [profile]);

  const hasConfiguredAvailability = weeklyCapacityHours > 0;

  const hoursAvailable = hasConfiguredAvailability
    ? Math.max(weeklyCapacityHours - totalHoursThisWeek, 0)
    : 0;

  const hasHoursBookedThisWeek = totalHoursThisWeek > 0;

  const bookedPercentage =
    hasConfiguredAvailability && weeklyCapacityHours > 0
      ? Math.round((totalHoursThisWeek / weeklyCapacityHours) * 100)
      : 0;

  const overbookedHours =
    hasConfiguredAvailability && totalHoursThisWeek > weeklyCapacityHours
      ? totalHoursThisWeek - weeklyCapacityHours
      : 0;

  // Helper to format hours with one decimal place, trimming trailing .0
  const formatHours = (value: number) => {
    const fixed = value.toFixed(1);
    return fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed;
  };

  // Get bookings needing action (no sessions booked)
  const bookingsNeedingAction = React.useMemo(() => {
    return bookings.filter((booking) => {
      // Booking needs action if it has no schedules or all schedules are cancelled
      const hasActiveSessions = booking.schedules?.some(
        (s) => s.status !== 'cancelled'
      );
      return !hasActiveSessions && booking.status === 'confirmed';
    });
  }, [bookings]);

  return (
    <div className="w-full lg:w-64 xl:w-72 space-y-4">
      {/* Hours Available Widget */}
      <div
        id="trainer-weekly-hours-card"
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-5"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Clock size={16} className="text-[#2C5F8D]" />
              Weekly Hours
            </h3>
            {hasConfiguredAvailability ? (
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Capacity from your availability: {formatHours(weeklyCapacityHours)}h
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Set your availability to see your weekly capacity.
              </p>
            )}
          </div>
        </div>

        {/* Split stats: booked vs available to avoid ambiguity */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-3">
            <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
              Booked this week
            </p>
            <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
              {formatHours(totalHoursThisWeek)}h
            </p>
            <p className="mt-0.5 text-[11px] text-gray-600 dark:text-gray-400">
              {hasConfiguredAvailability
                ? bookedPercentage <= 100
                  ? `${bookedPercentage}% of your available hours`
                  : `${bookedPercentage}% of your available hours (over capacity)`
                : 'Based on your scheduled sessions this week'}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-3">
            <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
              Hours available
            </p>
            <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
              {hasConfiguredAvailability
                ? overbookedHours > 0
                  ? '0h'
                  : `${formatHours(hoursAvailable)}h`
                : '—'}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-600 dark:text-gray-400">
              {hasConfiguredAvailability
                ? overbookedHours > 0
                  ? `Over capacity by ${formatHours(overbookedHours)}h`
                  : `Out of ${formatHours(weeklyCapacityHours)}h from availability`
                : 'Configure your availability to see remaining hours'}
            </p>
          </div>
        </div>

        {hasHoursBookedThisWeek && hasConfiguredAvailability ? (
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] text-gray-600 dark:text-gray-400">
                Weekly capacity used
              </p>
              <span className="text-[11px] font-medium text-[#2C5F8D]">
                {bookedPercentage}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-600 overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-[#2C5F8D] via-[#4A90E2] to-[#7ED321]"
                style={{ width: `${Math.min(bookedPercentage, 100)}%` }}
              />
            </div>
          </div>
        ) : !hasConfiguredAvailability ? (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Add your working days and hours so we can calculate your weekly capacity automatically.
          </p>
        ) : (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            You have your full {formatHours(weeklyCapacityHours)}h available for bookings this week.
          </p>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BarChart2 size={16} className="text-[#2C5F8D]" />
            Quick Stats
          </h3>
          <span className="text-[10px] text-gray-500">
            This week
          </span>
        </div>
        {activeTraineesCount === 0 && sessionsThisWeekCount === 0 && completionRate === 0 ? (
          <p className="text-xs text-gray-500">
            Once you start working with families, your trainee, session, and completion statistics
            will appear here for quick reference.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
                <Users size={13} className="text-[#7ED321]" />
                <span>Active trainees</span>
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {activeTraineesCount}
              </span>
              <span className="text-[11px] text-gray-500">
                Clients with bookings
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
                <Calendar size={13} className="text-[#4A90E2]" />
                <span>Sessions</span>
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {sessionsThisWeekCount}
              </span>
              <span className="text-[11px] text-gray-500">
                This week
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
                <CheckCircle size={13} className="text-[#7ED321]" />
                <span>Completion</span>
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {completionRate}%
              </span>
              <span className="text-[11px] text-gray-500">
                Last 30 days
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
                <Star size={13} className="text-[#F5A623]" />
                <span>Avg rating</span>
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {/* Placeholder until rating is wired from profile */}
                —
              </span>
              <span className="text-[11px] text-gray-500">
                From parent feedback
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Pending Actions Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500" />
            Pending Actions
          </h3>
        </div>
        <div className="px-4 py-3 space-y-2">
          {bookingsNeedingAction.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
              <CheckCircle size={14} className="text-gray-400" />
              <span>All up to date</span>
            </div>
          ) : (
            bookingsNeedingAction.slice(0, 5).map((booking) => (
              <label
                key={booking.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-[#4A90E2] focus:ring-[#4A90E2] focus:ring-2"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Complete schedule for {booking.reference}
                  </p>
                  <Link
                    href={`/dashboard/trainer/bookings/${booking.id}`}
                    className="inline-flex items-center gap-1 text-[11px] text-[#D0021B] hover:text-[#B0021B] underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF5F5] text-[#D0021B] border border-[#D0021B]/40">
                      Urgent
                    </span>
                    View details
                  </Link>
                </div>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
