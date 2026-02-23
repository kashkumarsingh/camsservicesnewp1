'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import moment from 'moment';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { trainerBookingRepository } from '@/infrastructure/http/trainer/TrainerBookingRepository';
import { trainerProfileRepository } from '@/infrastructure/http/trainer/TrainerProfileRepository';
import { trainerTimeEntryRepository } from '@/infrastructure/http/trainer/TrainerTimeEntryRepository';
import { trainerAvailabilityDatesRepository } from '@/infrastructure/http/trainer/TrainerAvailabilityDatesRepository';
import { trainerAbsenceRequestRepository } from '@/infrastructure/http/trainer/TrainerAbsenceRequestRepository';
import type {
  TrainerDashboardStats,
  TrainerBooking,
  TrainerProfile,
  TimeEntry,
} from '@/core/application/trainer/types';
import {
  Settings,
  AlertCircle,
  ShieldAlert,
  Eye,
  CalendarCheck,
  ChevronRight,
  Plus,
  HelpCircle,
  Mail,
  MapPin,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import TrainerSessionsCalendar from '@/components/trainer/TrainerSessionsCalendar';
import { TraineeFilter } from '@/components/trainer/TraineeFilter';
import TrainerSessionDetailModal from '@/components/trainer/modals/TrainerSessionDetailModal';
import { TrainerAddClockOutModal } from '@/components/trainer/modals/TrainerAddClockOutModal';
import TrainerSessionConfirmationPanel from '@/components/trainer/schedules/TrainerSessionConfirmationPanel';
import TrainerSettingsModal from '@/components/trainer/modals/TrainerSettingsModal';
import AddAbsenceModal from '@/components/trainer/modals/AddAbsenceModal';
import AvailabilitySidePanel from '@/components/trainer/AvailabilitySidePanel';
import TrainerViewConcernsModal from '@/components/trainer/modals/TrainerViewConcernsModal';
import SafeguardingConcernModal, { type SafeguardingConcernFormData } from '@/components/dashboard/modals/SafeguardingConcernModal';
import { useSubmitSafeguardingConcern } from '@/interfaces/web/hooks/dashboard/useSubmitSafeguardingConcern';
import ToastContainer from '@/components/ui/Toast/ToastContainer';
import { toastManager, type Toast } from '@/utils/toast';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { useSmartResponsive } from '@/interfaces/web/hooks/responsive/useSmartResponsive';
import { useLiveRefresh } from '@/core/liveRefresh/LiveRefreshContext';
import { LIVE_REFRESH_ENABLED } from '@/utils/liveRefreshConstants';
import { ROUTES } from '@/utils/routes';
import { useDashboardSyncEnabled } from '@/core/dashboardSync/DashboardSyncContext';
import { dashboardSyncStore } from '@/core/dashboardSync/dashboardSyncStore';
import SideCanvas from '@/components/ui/SideCanvas';
import type { TrainerEmergencyContact } from '@/core/application/trainer/types';
import { getTrainerChildDisplayName } from '@/utils/trainerPrivacy';
import { getMonday, getMonthKey, getRangeFromPeriodAnchor } from '@/utils/calendarRangeUtils';
import { getGoogleMapsSearchUrl, formatUKPostcode } from '@/utils/locationUtils';
import type { CalendarPeriod } from '@/utils/calendarRangeUtils';
import { CalendarRangeToolbar } from '@/components/ui/CalendarRange';

// Helper to format hours with one decimal place, trimming trailing .0
function formatHours(value: number): string {
  const fixed = value.toFixed(1);
  return fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed;
}

/** Build display address: schedule location first, then parent address with UK postcode formatted. */
function buildSessionAddress(
  scheduleLocation: string | null | undefined,
  parent: { address?: string | null; postcode?: string | null; county?: string | null } | undefined
): string | null {
  const loc = scheduleLocation?.trim();
  if (loc) return loc;
  if (!parent) return null;
  const parts = [
    parent.address?.trim() || null,
    parent.postcode ? formatUKPostcode(parent.postcode) : null,
    parent.county?.trim() || null,
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

type TodayHeroSession = {
  date: string;
  startTime: string;
  endTime: string;
  childName: string;
  childId: number;
  activities: string[];
  bookingId: number;
  scheduleId: number;
  bookingReference: string;
  isPast: boolean;
  isOngoing: boolean;
  isUpcoming: boolean;
  status?: string;
  pickupAddress?: string | null;
};

type TodayScheduleSummary = {
  nextSession: TodayHeroSession | null;
  totalSessionsToday: number;
  totalHoursToday: number;
};

type WeeklySnapshotDay = {
  label: string;
  date: string;
  sessions: number;
  hours: number;
};

type DaySessionSummary = {
  date: string;
  startTime: string;
  endTime: string;
  childName: string;
  childId: number;
  activities: string[];
  bookingReference: string;
  packageName: string;
  status: string;
  bookingId: number;
  scheduleId: number;
  /** Session/venue or parent address for pickup – formatted with UK postcode. */
  pickupAddress?: string | null;
};

/** Session timing + display state for list styling (past / live / upcoming / cancelled / completed). */
function getSessionTimingState(session: { date: string; startTime: string; endTime: string; status?: string }): {
  isPast: boolean;
  isOngoing: boolean;
  isUpcoming: boolean;
  statusLabel: string;
  statusVariant: 'cancelled' | 'completed' | 'live' | 'upcoming';
} {
  if (session.status === 'cancelled') {
    return { isPast: true, isOngoing: false, isUpcoming: false, statusLabel: 'Cancelled', statusVariant: 'cancelled' };
  }
  const now = moment();
  const startMoment = moment(`${session.date} ${session.startTime}`, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss']);
  const endMoment = moment(`${session.date} ${session.endTime}`, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss']);
  const isPast = now.isAfter(endMoment);
  const isOngoing = now.isSameOrAfter(startMoment) && now.isBefore(endMoment);
  const isUpcoming = now.isBefore(startMoment);
  if (session.status === 'completed' || isPast) {
    return { isPast: true, isOngoing: false, isUpcoming: false, statusLabel: 'Completed', statusVariant: 'completed' };
  }
  if (isOngoing) {
    return { isPast: false, isOngoing: true, isUpcoming: false, statusLabel: 'Live', statusVariant: 'live' };
  }
  return { isPast: false, isOngoing: false, isUpcoming: true, statusLabel: 'Upcoming', statusVariant: 'upcoming' };
}

function getTodayScheduleSummary(bookings: TrainerBooking[]): TodayScheduleSummary {
  const now = moment();
  const startOfDay = now.clone().startOf('day');
  const endOfDay = now.clone().endOf('day');

  type InternalSession = {
    startMoment: moment.Moment;
    endMoment: moment.Moment;
    isPast: boolean;
    isOngoing: boolean;
    isUpcoming: boolean;
    childName: string;
    childId: number;
    activities: string[];
    booking: TrainerBooking;
    schedule: TrainerBooking['schedules'][number];
  };

  const sessions: InternalSession[] = [];

  bookings.forEach((booking) => {
    booking.schedules?.forEach((schedule) => {
      if (schedule.status === 'cancelled') {
        return;
      }

      const startMoment = moment(
        `${schedule.date} ${schedule.start_time}`,
        ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss'],
      );
      const endMoment = moment(
        `${schedule.date} ${schedule.end_time}`,
        ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss'],
      );

      if (!startMoment.isValid() || !endMoment.isValid()) {
        return;
      }

      if (!startMoment.isBetween(startOfDay, endOfDay, undefined, '[]')) {
        return;
      }

      const isPast = now.isAfter(endMoment);
      const isOngoing = now.isSameOrAfter(startMoment) && now.isBefore(endMoment);
      const isUpcoming = now.isBefore(startMoment);

      const childName = getTrainerChildDisplayName(booking.participants?.[0]?.name);
      const childId = booking.participants?.[0]?.childId ?? booking.participants?.[0]?.child_id ?? 0;
      const activities = schedule.activities?.map((a) => a.name) ?? [];

      sessions.push({
        startMoment,
        endMoment,
        isPast,
        isOngoing,
        isUpcoming,
        childName,
        childId,
        activities,
        booking,
        schedule,
      });
    });
  });

  if (sessions.length === 0) {
    return {
      nextSession: null,
      totalSessionsToday: 0,
      totalHoursToday: 0,
    };
  }

  const upcomingOrOngoing = sessions
    .filter((session) => session.isUpcoming || session.isOngoing)
    .sort((a, b) => a.startMoment.diff(b.startMoment));

  const past = sessions
    .filter((session) => session.isPast)
    .sort((a, b) => b.startMoment.diff(a.startMoment));

  const primary = upcomingOrOngoing[0] ?? past[0];

  const totalHoursToday = sessions.reduce((total, session) => {
    const durationMinutes = session.endMoment.diff(session.startMoment, 'minutes');
    return total + Math.max(durationMinutes / 60, 0);
  }, 0);

  const pickupAddress = buildSessionAddress(primary.schedule.location, primary.booking.parent);
  return {
    nextSession: {
      date: primary.schedule.date,
      startTime: primary.schedule.start_time,
      endTime: primary.schedule.end_time,
      childName: primary.childName,
      childId: primary.childId,
      activities: primary.activities,
      bookingId: primary.booking.id,
      scheduleId: primary.schedule.id,
      bookingReference: primary.booking.reference,
      isPast: primary.isPast,
      isOngoing: primary.isOngoing,
      isUpcoming: primary.isUpcoming,
      status: primary.schedule.status,
      pickupAddress: pickupAddress ?? null,
    },
    totalSessionsToday: sessions.length,
    totalHoursToday,
  };
}

function getWeeklySnapshot(bookings: TrainerBooking[]): WeeklySnapshotDay[] {
  const startOfWeek = moment().isoWeekday(1).startOf('day');
  const days: WeeklySnapshotDay[] = [];

  for (let offset = 0; offset < 7; offset += 1) {
    const day = startOfWeek.clone().add(offset, 'days');
    const dateStr = day.format('YYYY-MM-DD');

    let sessionsCount = 0;
    let hours = 0;

    bookings.forEach((booking) => {
      booking.schedules?.forEach((schedule) => {
        if (schedule.status === 'cancelled' || schedule.date !== dateStr) {
          return;
        }

        const start = moment(
          `${schedule.date} ${schedule.start_time}`,
          ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss'],
        );
        const end = moment(
          `${schedule.date} ${schedule.end_time}`,
          ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss'],
        );

        if (!start.isValid() || !end.isValid()) {
          return;
        }

        const durationMinutes = end.diff(start, 'minutes');
        hours += Math.max(durationMinutes / 60, 0);
        sessionsCount += 1;
      });
    });

    days.push({
      label: day.format('ddd'),
      date: dateStr,
      sessions: sessionsCount,
      hours,
    });
  }

  return days;
}

export default function TrainerDashboardPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, isAuthenticated } = useAuth();
  const syncEnabled = useDashboardSyncEnabled();
  const { submitSafeguardingConcern } = useSubmitSafeguardingConcern();
  /** Tab driven by URL (shell renders bottom nav); default schedule when on /dashboard/trainer */
  const activeTab = (searchParams.get('tab') === 'more' ? 'more' : 'schedule') as 'schedule' | 'more';
  /** Open Add clock-out modal when arriving from notification link (?openClockOut=scheduleId). */
  useEffect(() => {
    const id = searchParams.get('openClockOut');
    setOpenClockOutScheduleId(id ?? null);
  }, [searchParams]);
  // Stats and bookings
  const [stats, setStats] = useState<TrainerDashboardStats | null>(null);
  const [bookings, setBookings] = useState<TrainerBooking[]>([]);
  // We currently do not load trainer stats from the API; keep this false so
  // the skeleton does not block rendering.
  const [statsLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  
  // Profile
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'qualifications'>('profile');
  const [emergencyContacts, setEmergencyContacts] = useState<TrainerEmergencyContact[]>([]);

  // Hero clock in/out (per session, shown on schedule)
  const [timeEntriesForHero, setTimeEntriesForHero] = useState<TimeEntry[] | null>(null);
  const [heroClockLoading, setHeroClockLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  // Gate: only show dashboard content after the first full load has completed (avoids showing partial/stale data then it "jumping" to real data)
  const [hasInitialLoadCompleted, setHasInitialLoadCompleted] = useState(false);

  // Modals
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showSafeguardingModal, setShowSafeguardingModal] = useState(false);
  const [showViewConcernsModal, setShowViewConcernsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<{
    date: string;
    startTime: string;
    endTime: string;
    childName: string;
    childId: number;
    activities: string[];
    bookingId: number;
    scheduleId: number;
    bookingReference: string;
    packageName?: string;
    isPast?: boolean;
    isOngoing?: boolean;
    isUpcoming?: boolean;
    status?: string;
    /** Session/venue or parent address for pickup. */
    pickupAddress?: string | null;
  } | null>(null);
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  /** When set (e.g. from ?openClockOut=scheduleId), show Add clock-out modal. */
  const [openClockOutScheduleId, setOpenClockOutScheduleId] = useState<string | null>(null);

  // Mobile: FAB and actions dropdown (responsive)
  const [showMobileActionsDropdown, setShowMobileActionsDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const [dropdownAlign, setDropdownAlign] = useState<'left' | 'right'>('right');
  const actionsButtonRef = React.useRef<HTMLButtonElement>(null);

  // Calendar state (mini calendar and right sidebar removed – calendar-only layout like parent)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | undefined>(undefined);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<string>(moment().format('YYYY-MM'));
  const [visibleTraineeIds, setVisibleTraineeIds] = useState<number[]>([]);
  const [weekRangeDates, setWeekRangeDates] = useState<Set<string>>(new Set());

  // Shared calendar range toolbar (day/week/month) – syncs to calendar below
  const [calendarPeriod, setCalendarPeriod] = useState<CalendarPeriod>('1_week');
  const [calendarAnchor, setCalendarAnchor] = useState<string>(() => getMonday(new Date()));
  const handleCalendarAnchorChange = useCallback((newAnchor: string) => {
    setCalendarAnchor(newAnchor);
    setCurrentCalendarMonth(getMonthKey(newAnchor));
    setSelectedCalendarDate(newAnchor);
  }, []);

  // Availability: side panel (mini calendar + make available / unavailable / add absence)
  const [showAvailabilityPanel, setShowAvailabilityPanel] = useState(false);
  const [availabilityDates, setAvailabilityDates] = useState<Set<string>>(new Set());
  const availabilityDatesRef = useRef<Set<string>>(availabilityDates);
  availabilityDatesRef.current = availabilityDates;
  /** Dates explicitly set as unavailable (red in panel). Session-only, not persisted. */
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set());
  /** Dates in an added absence range (red + strikethrough). Session-only until submitted. */
  const [absenceDates, setAbsenceDates] = useState<Set<string>>(new Set());
  /** Approved absence dates from API (red scribble). */
  const [approvedAbsenceDates, setApprovedAbsenceDates] = useState<Set<string>>(new Set());
  /** Pending absence dates from API (waiting for approval). */
  const [pendingAbsenceDates, setPendingAbsenceDates] = useState<Set<string>>(new Set());
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [showAddAbsenceModal, setShowAddAbsenceModal] = useState(false);
  const [addAbsencePrefill, setAddAbsencePrefill] = useState<{ from: string; to: string } | null>(null);

  // Trainees list for filter (derived from bookings; empty = show all)
  const traineesForFilter = useMemo(() => {
    const map = new Map<number, string>();
    bookings.forEach((booking) => {
      booking.participants?.forEach((p) => {
        if (p.childId ?? p.child_id && p.name) {
          map.set(p.childId ?? p.child_id, p.name);
        }
      });
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [bookings]);

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast subscription
  useEffect(() => {
    const unsubscribe = toastManager.subscribe((toast) => {
      setToasts((prev) => [...prev, toast]);
    });
    return unsubscribe;
  }, []);


  // Handle mini calendar date select (left sidebar → main calendar Day view)
  // Mirrors parent dashboard behaviour: selecting a date from the mini calendar
  // should jump into Day view focused on that date.
  const [switchToDayView, setSwitchToDayView] = useState(false);
  const handleMiniCalendarDateSelect = useCallback((date: string) => {
    setSelectedCalendarDate(date);
    setCurrentCalendarMonth(moment(date, 'YYYY-MM-DD').format('YYYY-MM'));
    setSwitchToDayView(true);

    // Smoothly scroll main trainer calendar into view to reduce cognitive load,
    // mirroring the parent dashboard behaviour when jumping to a specific day.
    const container = document.getElementById('trainer-sessions-calendar');
    if (container) {
      container.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }

    // Reset the flag shortly after so internal calendar navigation does not
    // keep forcing Day view.
    setTimeout(() => {
      setSwitchToDayView(false);
    }, 100);
  }, []);

  // Handle calendar date change from main calendar (Day/Week navigation → mini calendar)
  const handleCalendarDateChange = useCallback((date: string) => {
    setSelectedCalendarDate(date);
    const month = moment(date, 'YYYY-MM-DD').format('YYYY-MM');
    setCurrentCalendarMonth(month);
  }, []);

  // Handle week range change from main calendar (Week view → mini calendar highlight)
  // IMPORTANT: Avoid infinite render loops by only updating state when the
  // actual set of dates has changed (content comparison, not reference).
  const handleCalendarWeekRangeChange = useCallback((weekRange: Set<string>) => {
    setWeekRangeDates((prev) => {
      const prevArray = Array.from(prev).sort();
      const nextArray = Array.from(weekRange).sort();
      if (prevArray.length === nextArray.length && prevArray.every((v, i) => v === nextArray[i])) {
        return prev; // No content change, keep previous Set to avoid re-render loop
      }
      return new Set(weekRange);
    });
  }, []);

  // Handle calendar month change (either from mini calendar or main calendar)
  const handleCalendarMonthChange = useCallback((month: string) => {
    setCurrentCalendarMonth(month);
  }, []);

  // Fetch availability dates for a month (for "My availability" and main calendar)
  const fetchAvailabilityForMonth = useCallback(async (month: string) => {
    const start = moment(month, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
    const end = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');
    try {
      const [availabilityResult, absenceData] = await Promise.all([
        trainerAvailabilityDatesRepository.getDates(start, end),
        trainerAbsenceRequestRepository.list(start, end),
      ]);
      setAvailabilityDates(new Set(availabilityResult.availableDates));
      setUnavailableDates(new Set(availabilityResult.unavailableDates));
      setApprovedAbsenceDates(new Set(absenceData.approved_dates));
      setPendingAbsenceDates(new Set(absenceData.pending_dates));
    } catch (err: any) {
      setAvailabilityDates(new Set());
      setUnavailableDates(new Set());
      setApprovedAbsenceDates(new Set());
      setPendingAbsenceDates(new Set());
      const data = err?.response?.data;
      const errors = data?.errors;
      let msg = err?.message ?? 'Failed to load availability';
      if (errors && typeof errors === 'object') {
        const first = Object.values(errors).flat()[0];
        if (typeof first === 'string') msg = first;
      } else if (data?.message) {
        msg = data.message;
      }
      toastManager.error(msg);
    }
  }, []);

  useEffect(() => {
    if (showAvailabilityPanel && currentCalendarMonth) {
      fetchAvailabilityForMonth(currentCalendarMonth);
    }
  }, [showAvailabilityPanel, currentCalendarMonth, fetchAvailabilityForMonth]);

  // Load availability and absence for the current calendar month so main calendar shows them without opening panel
  useEffect(() => {
    if (currentCalendarMonth) {
      fetchAvailabilityForMonth(currentCalendarMonth);
    }
  }, [currentCalendarMonth, fetchAvailabilityForMonth]);

  const handleAvailabilitySet = useCallback((date: string, available: boolean) => {
    setAvailabilityDates((prev) => {
      const next = new Set(prev);
      if (available) next.add(date);
      else next.delete(date);
      return next;
    });
    setUnavailableDates((prev) => {
      const next = new Set(prev);
      if (available) next.delete(date);
      else next.add(date);
      return next;
    });
    setAbsenceDates((prev) => {
      const next = new Set(prev);
      next.delete(date);
      return next;
    });
  }, []);

  /** Submit absence request (pending admin approval). On success, refetch absences for the month. */
  const handleAddAbsence = useCallback(async (from: string, to: string, reason?: string) => {
    try {
      await trainerAbsenceRequestRepository.create(from, to, reason);
      const month = moment(from, 'YYYY-MM-DD').format('YYYY-MM');
      await fetchAvailabilityForMonth(month);
      setShowAddAbsenceModal(false);
      setAddAbsencePrefill(null);
      toastManager.success('Absence requested. Waiting for admin approval.');
    } catch (err: any) {
      const data = err?.response?.data;
      const errors = data?.errors;
      let msg = err?.message ?? 'Failed to submit absence request.';
      if (errors && typeof errors === 'object') {
        const first = Object.values(errors).flat()[0];
        if (typeof first === 'string') msg = first;
      } else if (data?.message) {
        msg = data.message;
      }
      toastManager.error(msg);
    }
  }, [fetchAvailabilityForMonth]);

  /** Open Add absence modal (e.g. from availability panel with prefill). */
  const openAddAbsenceModal = useCallback((from?: string, to?: string) => {
    if (from && to) setAddAbsencePrefill({ from, to });
    else setAddAbsencePrefill(null);
    setShowAddAbsenceModal(true);
  }, []);

  /** Bulk: mark all editable days in the given month as available. */
  const handleBulkAvailableAll = useCallback((month: string) => {
    const start = moment(month, 'YYYY-MM').startOf('month');
    const end = moment(month, 'YYYY-MM').endOf('month');
    const minEditable = moment().add(24, 'hours').startOf('day');
    setAvailabilityDates((prev) => {
      const next = new Set(prev);
      const cursor = start.clone();
      while (cursor.isSameOrBefore(end, 'day')) {
        if (cursor.isSameOrAfter(minEditable)) next.add(cursor.format('YYYY-MM-DD'));
        cursor.add(1, 'day');
      }
      return next;
    });
    toastManager.success('All days in month set available. Click Save to apply.');
  }, []);

  /** Bulk: mark weekdays (Mon–Fri) in the given month as available. */
  const handleBulkWeekdays = useCallback((month: string) => {
    const start = moment(month, 'YYYY-MM').startOf('month');
    const end = moment(month, 'YYYY-MM').endOf('month');
    const minEditable = moment().add(24, 'hours').startOf('day');
    setAvailabilityDates((prev) => {
      const next = new Set(prev);
      const cursor = start.clone();
      while (cursor.isSameOrBefore(end, 'day')) {
        const dow = cursor.isoWeekday();
        if (dow >= 1 && dow <= 5 && cursor.isSameOrAfter(minEditable)) next.add(cursor.format('YYYY-MM-DD'));
        cursor.add(1, 'day');
      }
      return next;
    });
    toastManager.success('Weekdays set available. Click Save to apply.');
  }, []);

  /** Bulk: mark weekends (Sat–Sun) in the given month as available. */
  const handleBulkWeekends = useCallback((month: string) => {
    const start = moment(month, 'YYYY-MM').startOf('month');
    const end = moment(month, 'YYYY-MM').endOf('month');
    const minEditable = moment().add(24, 'hours').startOf('day');
    setAvailabilityDates((prev) => {
      const next = new Set(prev);
      const cursor = start.clone();
      while (cursor.isSameOrBefore(end, 'day')) {
        const dow = cursor.isoWeekday();
        if ((dow === 6 || dow === 7) && cursor.isSameOrAfter(minEditable)) next.add(cursor.format('YYYY-MM-DD'));
        cursor.add(1, 'day');
      }
      return next;
    });
    toastManager.success('Weekends set available. Click Save to apply.');
  }, []);

  /** Bulk: clear all availability in the given month. */
  const handleBulkClearMonth = useCallback((month: string) => {
    const start = moment(month, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
    const end = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');
    setAvailabilityDates((prev) => {
      const next = new Set(prev);
      prev.forEach((d) => {
        if (d >= start && d <= end) next.delete(d);
      });
      return next;
    });
    toastManager.success('Month cleared. Click Save to apply.');
  }, []);

  // Handle trainee visibility toggle
  const handleToggleTraineeVisibility = useCallback((traineeId: number) => {
    setVisibleTraineeIds((prev) => {
      if (prev.includes(traineeId)) {
        return prev.filter((id) => id !== traineeId);
      }
      return [...prev, traineeId];
    });
  }, []);

  // Handle add session (placeholder - trainers don't create sessions, they're assigned)
  const handleAddSession = useCallback(() => {
    toastManager.info('Sessions are assigned by parents. You can view and manage your assigned sessions here.');
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/trainer');
      return;
    }

    if (!loading && user && user.role !== 'trainer') {
      router.push('/dashboard');
      return;
    }

    if (!loading && user && user.role === 'trainer' && user.approvalStatus !== 'approved') {
      return;
    }
  }, [loading, isAuthenticated, user, router]);

  const fetchBookings = useCallback(async (silent = false) => {
    if (!user || user.role !== 'trainer' || user.approvalStatus !== 'approved') {
      return;
    }

    try {
      if (!silent) {
        setBookingsLoading(true);
        setError(null);
      }
      const response = await trainerBookingRepository.list();
      setBookings(response.bookings);
      if (syncEnabled) {
        dashboardSyncStore.setTrainerBookings(user.id, response.bookings);
      }
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
      if (!silent) {
        setError(err.message || 'Failed to load bookings');
      }
    } finally {
      if (!silent) {
        setBookingsLoading(false);
      }
    }
  }, [user, syncEnabled]);

  const unavailableDatesRef = useRef<Set<string>>(new Set());
  unavailableDatesRef.current = unavailableDates;

  const handleSaveAvailability = useCallback(async (month: string) => {
    const start = moment(month, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
    const end = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');
    const availableInMonth = Array.from(availabilityDatesRef.current).filter(
      (d) => d >= start && d <= end
    ).sort();
    const unavailableInMonth = Array.from(unavailableDatesRef.current).filter(
      (d) => d >= start && d <= end
    ).sort();
    setSavingAvailability(true);
    try {
      await trainerAvailabilityDatesRepository.setDates(start, end, availableInMonth, unavailableInMonth);
      await fetchAvailabilityForMonth(month);
      toastManager.success('Availability saved.');
      setShowAvailabilityPanel(false);
      fetchBookings(true);
    } catch (err: any) {
      const data = err?.response?.data;
      const errors = data?.errors;
      let msg = err?.message ?? 'Failed to save availability';
      if (errors && typeof errors === 'object') {
        const first = Object.values(errors).flat()[0];
        if (typeof first === 'string') msg = first;
      } else if (data?.message) {
        msg = data.message;
      }
      toastManager.error(msg);
    } finally {
      setSavingAvailability(false);
    }
  }, [fetchAvailabilityForMonth, fetchBookings]);

  const fetchProfile = useCallback(async () => {
    if (!user || user.role !== 'trainer' || user.approvalStatus !== 'approved') {
      return;
    }

    try {
      setProfileLoading(true);
      setError(null);
      const profileData = await trainerProfileRepository.get();
      setProfile(profileData);
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (loading || !user || user.role !== 'trainer' || user.approvalStatus !== 'approved') {
      return;
    }

    if (syncEnabled) {
      const cached = dashboardSyncStore.getTrainerBookings(user.id);
      if (cached?.bookings?.length !== undefined) {
        setBookings(cached.bookings as TrainerBooking[]);
        setBookingsLoading(false);
        void fetchBookings(true);
        return;
      }
    }

    void fetchBookings();
  }, [loading, user, fetchBookings, syncEnabled]);

  // Hero card: fetch time entries for today's next/ongoing session so we can show Clock in vs Clock out
  const heroScheduleId = useMemo(() => {
    const summary = getTodayScheduleSummary(bookings);
    return summary.nextSession?.scheduleId ?? null;
  }, [bookings]);

  useEffect(() => {
    if (activeTab !== 'schedule' || !heroScheduleId) {
      setTimeEntriesForHero(null);
      return;
    }
    trainerTimeEntryRepository
      .list({ booking_schedule_id: heroScheduleId })
      .then((res) => {
        setTimeEntriesForHero(res.timeEntries ?? []);
      })
      .catch(() => {
        setTimeEntriesForHero(null);
      });
  }, [activeTab, heroScheduleId]);

  const fetchHeroTimeEntries = useCallback(() => {
    if (!heroScheduleId) return;
    trainerTimeEntryRepository
      .list({ booking_schedule_id: heroScheduleId })
      .then((res) => setTimeEntriesForHero(res.timeEntries ?? []))
      .catch(() => setTimeEntriesForHero(null));
  }, [heroScheduleId]);

  // Centralised live refresh: refetch when backend reports changes to bookings or trainer_schedules
  const trainerRefetch = useCallback(() => fetchBookings(true), [fetchBookings]);
  useLiveRefresh('bookings', trainerRefetch, {
    enabled: LIVE_REFRESH_ENABLED && !!user && user.role === 'trainer' && user.approvalStatus === 'approved',
  });
  useLiveRefresh('trainer_schedules', trainerRefetch, {
    enabled: LIVE_REFRESH_ENABLED && !!user && user.role === 'trainer' && user.approvalStatus === 'approved',
  });

  // Load trainer profile so we can derive availability-based capacity
  useEffect(() => {
    if (loading || !user || user.role !== 'trainer' || user.approvalStatus !== 'approved') {
      return;
    }

    if (!profile && !profileLoading) {
      void fetchProfile();
    }

    if (emergencyContacts.length === 0) {
      void trainerProfileRepository
        .getEmergencyContacts()
        .then((contacts) => setEmergencyContacts(contacts))
        .catch(() => {
          // Soft-fail: emergency contacts are optional UI enhancement
        });
    }
  }, [loading, user, profile, profileLoading, fetchProfile, emergencyContacts.length]);

  // Handle calendar session click – pending confirmation opens confirmation panel; otherwise session detail modal
  const handleCalendarSessionClick = useCallback((session: {
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
    trainerAssignmentStatus?: string | null;
  }) => {
    const needsConfirmation = session.trainerAssignmentStatus === 'pending_trainer_confirmation';
    if (needsConfirmation) {
      setConfirmationScheduleId(session.scheduleId);
    } else {
      setSelectedSession(session);
      setShowSessionModal(true);
    }
  }, []);

  // Session confirmation panel (when admin assigns a session, trainer confirms or declines from overview)
  const [confirmationScheduleId, setConfirmationScheduleId] = useState<number | null>(null);
  const closeConfirmationPanel = useCallback(() => {
    setConfirmationScheduleId(null);
  }, []);
  const refreshAfterConfirmation = useCallback(() => {
    fetchBookings();
  }, [fetchBookings]);

  const pendingConfirmationCount = useMemo(() => {
    let count = 0;
    bookings.forEach((b) => {
      b.schedules?.forEach((s) => {
        if ((s as { trainer_assignment_status?: string }).trainer_assignment_status === 'pending_trainer_confirmation') count++;
      });
    });
    return count;
  }, [bookings]);

  // Handle session status update
  const handleSessionStatusUpdate = useCallback(async () => {
    await fetchBookings();
  }, [fetchBookings]);

  // Smart Responsive Hook - Context-Aware Layout Decisions
  // MUST be called before any early returns to maintain hook order
  const isInteracting = showSessionModal || showSettingsModal || confirmationScheduleId != null;
  const responsive = useSmartResponsive({
    itemCount: bookings.length,
    hasPendingActions: bookings.some((booking) => {
      const hasActiveSessions = booking.schedules?.some(
        (s) => s.status !== 'cancelled'
      );
      return !hasActiveSessions && booking.status === 'confirmed';
    }),
    isEmpty: bookings.length === 0,
    isInteracting,
  });

  // Get dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get trainer name (from profile or user)
  const trainerName = profile?.name || user?.name || 'Trainer';

  // Adaptive spacing classes (minimal gap between sidebar and main column)
  const spacingClasses = {
    compact: 'gap-1.5 sm:gap-2',
    normal: 'gap-2 lg:gap-3',
    comfortable: 'gap-3 lg:gap-4',
  }[responsive.spacing];

  const paddingClasses = {
    small: 'px-2 sm:px-3 py-3 sm:py-4',
    medium: 'px-2 sm:px-3 md:px-3 py-3 sm:py-4 md:py-8',
    large: 'px-2 sm:px-3 md:px-4 py-4 sm:py-6 md:py-10',
  }[responsive.padding];

  const [selectedWeekDayDate, setSelectedWeekDayDate] = useState<string | null>(null);

  const selectedDaySessions: DaySessionSummary[] = useMemo(() => {
    if (!selectedWeekDayDate) return [];

    const summaries: DaySessionSummary[] = [];

    bookings.forEach((booking) => {
      booking.schedules?.forEach((schedule) => {
        if (schedule.date !== selectedWeekDayDate) {
          return;
        }

        const childName = getTrainerChildDisplayName(booking.participants?.[0]?.name);
        const childId = booking.participants?.[0]?.childId ?? booking.participants?.[0]?.child_id ?? 0;
        const activities = schedule.activities?.map((a) => a.name) ?? [];

        const pickupAddress = buildSessionAddress(schedule.location, booking.parent);
        summaries.push({
          date: schedule.date,
          startTime: schedule.start_time,
          endTime: schedule.end_time,
          childName,
          childId,
          activities,
          bookingReference: booking.reference,
          packageName: booking.package.name,
          status: schedule.status,
          bookingId: booking.id,
          scheduleId: schedule.id,
          pickupAddress: pickupAddress ?? null,
        });
      });
    });

    return summaries.sort((a, b) => {
      const startA = moment(`${a.date} ${a.startTime}`, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss']);
      const startB = moment(`${b.date} ${b.startTime}`, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss']);
      return startA.diff(startB);
    });
  }, [bookings, selectedWeekDayDate]);

  /** Date range for the current calendar period (1 day / 1 week / 1 month) – used for sessions panel. */
  const calendarRange = useMemo(
    () => getRangeFromPeriodAnchor(calendarPeriod, calendarAnchor),
    [calendarPeriod, calendarAnchor]
  );
  const datesInRangeSet = useMemo(() => new Set(calendarRange.displayDates), [calendarRange.displayDates]);

  /** Sessions for the current calendar period (day, week, or month) – shown below calendar. */
  const sessionsForPeriod: DaySessionSummary[] = useMemo(() => {
    const summaries: DaySessionSummary[] = [];

    bookings.forEach((booking) => {
      booking.schedules?.forEach((schedule) => {
        if (schedule.status === 'cancelled' || !datesInRangeSet.has(schedule.date)) return;

        const childName = getTrainerChildDisplayName(booking.participants?.[0]?.name);
        const childId = booking.participants?.[0]?.childId ?? booking.participants?.[0]?.child_id ?? 0;
        const activities = schedule.activities?.map((a) => a.name) ?? [];

        const pickupAddress = buildSessionAddress(schedule.location, booking.parent);
        summaries.push({
          date: schedule.date,
          startTime: schedule.start_time,
          endTime: schedule.end_time,
          childName,
          childId,
          activities,
          bookingReference: booking.reference,
          packageName: booking.package.name,
          status: schedule.status,
          bookingId: booking.id,
          scheduleId: schedule.id,
          pickupAddress: pickupAddress ?? null,
        });
      });
    });

    let result = summaries.sort((a, b) => {
      const startA = moment(`${a.date} ${a.startTime}`, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss']);
      const startB = moment(`${b.date} ${b.startTime}`, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss']);
      return startA.diff(startB);
    });

    if (Array.isArray(visibleTraineeIds) && visibleTraineeIds.length > 0) {
      result = result.filter((s) => visibleTraineeIds.includes(s.childId));
    }
    return result;
  }, [bookings, datesInRangeSet, visibleTraineeIds]);

  // Mobile FAB dropdown: position based on viewport
  useEffect(() => {
    if (showMobileActionsDropdown && actionsButtonRef.current) {
      const button = actionsButtonRef.current;
      const rect = button.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const dropdownHeight = 140;
      const dropdownWidth = 224;
      const margin = 8;
      const spaceBelow = viewportHeight - rect.bottom - margin;
      const spaceAbove = rect.top - margin;
      setDropdownPosition(spaceBelow >= dropdownHeight || spaceBelow > spaceAbove ? 'bottom' : 'top');
      const spaceRight = viewportWidth - rect.right;
      const spaceLeft = rect.left;
      setDropdownAlign(spaceRight >= dropdownWidth || spaceRight > spaceLeft ? 'right' : 'left');
    }
  }, [showMobileActionsDropdown]);

  useEffect(() => {
    if (isInteracting && showMobileActionsDropdown) setShowMobileActionsDropdown(false);
  }, [isInteracting, showMobileActionsDropdown]);

  useEffect(() => {
    if (!showMobileActionsDropdown) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsButtonRef.current && !actionsButtonRef.current.contains(event.target as Node)) {
        const dropdown = document.getElementById('trainer-mobile-actions-dropdown');
        if (dropdown && !dropdown.contains(event.target as Node)) setShowMobileActionsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileActionsDropdown]);

  // Only consider initial load complete when auth has settled AND:
  // - the user is a fully approved trainer (bookings finished loading), or
  // - the user is a non-trainer, or
  // - the trainer is not yet approved (so we can show the approval status screen).
  useEffect(() => {
    if (hasInitialLoadCompleted) return;
    if (loading) return;

    // If there is no user or they are not a trainer, we don't need bookings:
    // allow the route guard/redirection logic to run.
    if (!user || user.role !== 'trainer') {
      setHasInitialLoadCompleted(true);
      return;
    }

    // For trainers who are not yet approved, we want to show the "pending/not approved"
    // screen instead of keeping them on a perpetual skeleton.
    if (user.approvalStatus !== 'approved') {
      setHasInitialLoadCompleted(true);
      return;
    }

    // For fully approved trainers, only mark the initial load as complete once the
    // first bookings fetch has completed (success or failure).
    if (!bookingsLoading) {
      setHasInitialLoadCompleted(true);
    }
  }, [hasInitialLoadCompleted, loading, bookingsLoading, user]);

  // Early returns AFTER all hooks — show skeleton until first full load has completed (do not show data before everything has loaded)
  if (!hasInitialLoadCompleted || loading || statsLoading || bookingsLoading) {
    return <DashboardSkeleton variant="trainer" />;
  }

  if (!user || user.role !== 'trainer') {
    return null;
  }

  if (user.approvalStatus !== 'approved') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-amber-500" aria-hidden />
          <h1 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
            {user.approvalStatus === 'pending' ? 'Account Pending Approval' : 'Account Not Approved'}
          </h1>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            {user.approvalStatus === 'pending'
              ? 'Your trainer account is pending admin approval. You\'ll be notified once approved.'
              : 'Your trainer account was not approved. Please contact us for more information.'}
          </p>
          <Button onClick={() => router.push('/')} className="w-full">
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className={`space-y-4 ${paddingClasses}`}>
      <header className="space-y-0.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              {getGreeting()}, {trainerName.split(' ')[0]}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your schedule, sessions and time tracking.
            </p>
          </div>
          {/* Desktop: show Availability, Concern, View; mobile: moved into FAB */}
          <div className="hidden sm:flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              onClick={() => setShowAvailabilityPanel(true)}
              variant="primary"
              size="sm"
              icon={<CalendarCheck size={14} className="sm:h-4 sm:w-4" />}
              className="text-xs sm:text-sm"
            >
              Set my availability
            </Button>
            <Button
              onClick={() => setShowSafeguardingModal(true)}
              variant="secondary"
              size="sm"
              icon={<ShieldAlert size={14} className="sm:h-4 sm:w-4" />}
              className="text-xs sm:text-sm"
            >
              Log concern
            </Button>
            <Button
              onClick={() => setShowViewConcernsModal(true)}
              variant="outline"
              size="sm"
              icon={<Eye size={14} className="sm:h-4 sm:w-4" />}
              className="text-xs sm:text-sm"
            >
              View concerns
            </Button>
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden />
            {error}
          </div>
        </div>
      )}

      {/* Content: Schedule (calendar + sessions) or More (greeting + menu); tab indicated by bottom nav only */}
        {activeTab === 'schedule' && (
        <>
        {/* Schedule: single calendar view; availability set on main calendar */}
        <div className={`flex flex-col ${spacingClasses} mb-6`}>
          {pendingConfirmationCount > 0 && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
              <p className="font-medium">
                You have {pendingConfirmationCount} session{pendingConfirmationCount !== 1 ? 's' : ''} waiting for your confirmation.
              </p>
              <p className="mt-0.5 text-amber-700 dark:text-amber-300">
                Click any session marked <span className="font-semibold">Confirm</span> on the calendar to confirm or decline.
              </p>
            </div>
          )}
          <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
            <TraineeFilter
              trainees={traineesForFilter}
              selectedIds={visibleTraineeIds}
              onChange={setVisibleTraineeIds}
              hideWhenSingle
            />
          </div>

          <div className="mb-3">
            <CalendarRangeToolbar
              period={calendarPeriod}
              setPeriod={setCalendarPeriod}
              anchor={calendarAnchor}
              setAnchor={handleCalendarAnchorChange}
              periodSelectId="trainer-calendar-period"
              periodSelectLabel="Calendar period"
              showWeekShortcuts={true}
            />
          </div>

          <div className="min-w-0 flex-1" id="trainer-sessions-calendar">
            <TrainerSessionsCalendar
              bookings={bookings}
              onSessionClick={handleCalendarSessionClick}
              visibleTraineeIds={visibleTraineeIds}
              selectedDate={selectedCalendarDate}
              switchToDayView={switchToDayView}
              onDateChange={handleCalendarDateChange}
              currentMonth={currentCalendarMonth}
              onMonthChange={handleCalendarMonthChange}
              onWeekRangeChange={handleCalendarWeekRangeChange}
              availabilityDates={availabilityDates}
              approvedAbsenceDates={approvedAbsenceDates}
              pendingAbsenceDates={pendingAbsenceDates}
              unavailableDates={unavailableDates}
              onDateClickOpenAvailability={(dateStr) => {
                const month = moment(dateStr).format('YYYY-MM');
                setCurrentCalendarMonth(month);
                fetchAvailabilityForMonth(month);
                setShowAvailabilityPanel(true);
              }}
            />
          </div>

          {/* Sessions for the selected period (1 day / 1 week / 1 month) – white card below calendar */}
          <div className="mt-4">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
              <h3 className="sr-only">
                Sessions for {calendarRange.rangeLabel}
              </h3>
              {sessionsForPeriod.length === 0 ? (
                <p className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
                  No sessions scheduled for this {calendarPeriod === '1_day' ? 'day' : calendarPeriod === '1_week' ? 'week' : 'month'}.
                </p>
              ) : (
                <>
                  <p className="px-4 pt-3 pb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {calendarRange.rangeLabel}
                  </p>
                  <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                    {sessionsForPeriod.map((session) => {
                      const timeRange = `${moment(session.startTime, ['HH:mm', 'HH:mm:ss']).format('HH:mm')} – ${moment(session.endTime, ['HH:mm', 'HH:mm:ss']).format('HH:mm')}`;
                      const sessionType = session.activities?.length ? session.activities.slice(0, 2).join(', ') : 'Session';
                      const timing = getSessionTimingState(session);
                      const borderClass =
                        timing.statusVariant === 'cancelled'
                          ? 'border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20'
                          : timing.statusVariant === 'completed'
                            ? 'border-l-4 border-l-slate-400 bg-slate-50/50 dark:bg-slate-800/30'
                            : timing.statusVariant === 'live'
                              ? 'border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20'
                              : 'border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/20';
                      const dotClass =
                        timing.statusVariant === 'cancelled'
                          ? 'bg-red-500'
                          : timing.statusVariant === 'completed'
                            ? 'bg-slate-400'
                            : timing.statusVariant === 'live'
                              ? 'bg-green-500'
                              : 'bg-blue-500';
                      const pillClass =
                        timing.statusVariant === 'cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
                          : timing.statusVariant === 'completed'
                            ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                            : timing.statusVariant === 'live'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200';
                      return (
                        <li key={`${session.date}-${session.scheduleId}`}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSession({
                                date: session.date,
                                startTime: session.startTime,
                                endTime: session.endTime,
                                childName: session.childName,
                                childId: session.childId,
                                activities: session.activities,
                                bookingId: session.bookingId,
                                scheduleId: session.scheduleId,
                                bookingReference: session.bookingReference,
                                packageName: session.packageName,
                                status: session.status,
                                pickupAddress: session.pickupAddress ?? null,
                              });
                              setShowSessionModal(true);
                            }}
                            className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:opacity-90 ${borderClass}`}
                          >
                            <span
                              className={`flex h-2 w-2 shrink-0 rounded-full mt-1.5 ${timing.statusVariant === 'live' ? 'animate-pulse' : ''} ${dotClass}`}
                              aria-hidden
                            />
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-900 dark:text-slate-50">
                                <span className="font-semibold">{timeRange}</span>
                                <span className="text-slate-400">|</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">{session.childName}</span>
                                <span className="text-slate-400">|</span>
                                <span className="text-slate-600 dark:text-slate-400">{sessionType}</span>
                                <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide ${pillClass}`}
                              aria-label={`Session status: ${timing.statusLabel}`}
                            >
                              {timing.statusVariant === 'live' && (
                                <span className="mr-1 inline-block h-1 w-1 rounded-full bg-current animate-pulse" aria-hidden />
                              )}
                              {timing.statusLabel}
                            </span>
                              </span>
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                <MapPin size={12} className="shrink-0 text-slate-500" aria-hidden />
                                {session.pickupAddress ? (
                                  <a
                                    href={getGoogleMapsSearchUrl(session.pickupAddress)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="line-clamp-2 text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                    aria-label={`Open ${session.pickupAddress} in Google Maps`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {session.pickupAddress}
                                  </a>
                                ) : (
                                  <span className="italic">Location not set – contact admin</span>
                                )}
                              </p>
                            </span>
                            <ChevronRight size={18} className="shrink-0 text-slate-400 mt-0.5" aria-hidden />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile: FAB + actions dropdown (Availability, Concern, View) – profile is in top nav */}
        {!responsive.showSidebar && (
          <div className="fixed bottom-20 right-4 z-30">
            <button
              ref={actionsButtonRef}
              type="button"
              onClick={() => setShowMobileActionsDropdown((v) => !v)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              aria-label="Actions"
              aria-expanded={showMobileActionsDropdown}
            >
              <Plus size={24} aria-hidden />
            </button>
            {showMobileActionsDropdown && (
              <>
                <div className="fixed inset-0 z-40" aria-hidden onClick={() => setShowMobileActionsDropdown(false)} />
                <div
                  id="trainer-mobile-actions-dropdown"
                  className={`absolute z-50 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900 ${
                    dropdownPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                  } right-0`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileActionsDropdown(false);
                      setShowAvailabilityPanel(true);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <CalendarCheck size={18} className="shrink-0 text-slate-600 dark:text-slate-400" aria-hidden />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-50">Set my availability</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Mark dates available or not</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileActionsDropdown(false);
                      setShowSafeguardingModal(true);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <ShieldAlert size={18} className="shrink-0 text-slate-600 dark:text-slate-400" aria-hidden />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-50">Log concern</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Safeguarding or issue</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileActionsDropdown(false);
                      setShowViewConcernsModal(true);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <Eye size={18} className="shrink-0 text-slate-600 dark:text-slate-400" aria-hidden />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-50">View concerns</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Submitted concerns</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        </>
        )}

      {/* More tab: only real options – Settings (profile/qualifications), Contact, FAQ */}
      {activeTab === 'more' && (
        <div className={`${spacingClasses}`}>
          <ul className="space-y-0.5 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
            <li>
              <Link
                href="/dashboard/trainer/settings"
                className="flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <Settings size={20} className="shrink-0 text-slate-600 dark:text-slate-400" aria-hidden />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-50">Settings</span>
                <ChevronRight size={18} className="ml-auto shrink-0 text-slate-400" aria-hidden />
              </Link>
            </li>
            <li>
              <Link
                href={ROUTES.CONTACT}
                className="flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <Mail size={20} className="shrink-0 text-slate-600 dark:text-slate-400" aria-hidden />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-50">Contact</span>
                <ChevronRight size={18} className="ml-auto shrink-0 text-slate-400" aria-hidden />
              </Link>
            </li>
            <li>
              <Link
                href={ROUTES.FAQ}
                className="flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <HelpCircle size={20} className="shrink-0 text-slate-600 dark:text-slate-400" aria-hidden />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-50">FAQ</span>
                <ChevronRight size={18} className="ml-auto shrink-0 text-slate-400" aria-hidden />
              </Link>
            </li>
          </ul>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Modals */}
      <TrainerSessionConfirmationPanel
        scheduleId={confirmationScheduleId}
        isOpen={confirmationScheduleId != null}
        onClose={closeConfirmationPanel}
        onConfirmedOrDeclined={refreshAfterConfirmation}
      />
      <TrainerSessionDetailModal
        isOpen={showSessionModal}
        onClose={() => {
          setShowSessionModal(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        onStatusUpdate={handleSessionStatusUpdate}
        onTimeEntryUpdate={fetchHeroTimeEntries}
      />
      <TrainerAddClockOutModal
        isOpen={openClockOutScheduleId != null}
        onClose={() => {
          setOpenClockOutScheduleId(null);
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            params.delete('openClockOut');
            const q = params.toString();
            router.replace(window.location.pathname + (q ? '?' + q : ''), { scroll: false });
          }
        }}
        scheduleId={openClockOutScheduleId}
        onSuccess={fetchHeroTimeEntries}
      />
      <TrainerSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        profile={profile}
        profileLoading={profileLoading}
        onProfileUpdate={(updatedProfile) => {
          setProfile(updatedProfile);
        }}
        onError={(error) => toastManager.error(error)}
        initialTab={settingsTab}
      />

      {typeof document !== 'undefined' &&
        createPortal(
          <AddAbsenceModal
            isOpen={showAddAbsenceModal}
            onClose={() => { setShowAddAbsenceModal(false); setAddAbsencePrefill(null); }}
            onConfirm={handleAddAbsence}
            currentMonth={currentCalendarMonth}
            initialFrom={addAbsencePrefill?.from}
            initialTo={addAbsencePrefill?.to}
          />,
          document.body
        )}

      <AvailabilitySidePanel
        isOpen={showAvailabilityPanel}
        onClose={() => setShowAvailabilityPanel(false)}
        currentMonth={currentCalendarMonth}
        availabilityDates={availabilityDates}
        unavailableDates={unavailableDates}
        absenceDates={absenceDates}
        approvedAbsenceDates={approvedAbsenceDates}
        pendingAbsenceDates={pendingAbsenceDates}
        onAvailabilitySet={handleAvailabilitySet}
        onAddAbsence={openAddAbsenceModal}
        onSave={handleSaveAvailability}
        saving={savingAvailability}
        onMonthChange={fetchAvailabilityForMonth}
        onBulkWeekdays={handleBulkWeekdays}
        onBulkWeekends={handleBulkWeekends}
        onBulkAllDays={handleBulkAvailableAll}
        onBulkClearMonth={handleBulkClearMonth}
      />

      <SafeguardingConcernModal
        isOpen={showSafeguardingModal}
        onClose={() => setShowSafeguardingModal(false)}
        children={[]}
        onSubmit={async (data: SafeguardingConcernFormData) => {
          await submitSafeguardingConcern(data);
          setShowSafeguardingModal(false);
          toastManager.success('Concern submitted. We will follow up as needed.');
        }}
      />

      <TrainerViewConcernsModal
        isOpen={showViewConcernsModal}
        onClose={() => setShowViewConcernsModal(false)}
      />

      {/* Side canvas for week-at-a-glance day details */}
      <SideCanvas
        isOpen={!!selectedWeekDayDate && selectedDaySessions.length > 0}
        onClose={() => setSelectedWeekDayDate(null)}
        title={
          selectedWeekDayDate
            ? `Sessions on ${moment(selectedWeekDayDate, 'YYYY-MM-DD').format('dddd D MMMM')}`
            : 'Day details'
        }
        description="Tap a session to open the full details view."
      >
        {selectedDaySessions.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            No sessions scheduled for this day.
          </p>
        ) : (
          <ul className="space-y-3">
            {selectedDaySessions.map((session, index) => {
              const start = moment(session.startTime, ['HH:mm', 'HH:mm:ss']).format('h:mm A');
              const end = moment(session.endTime, ['HH:mm', 'HH:mm:ss']).format('h:mm A');
              const primaryActivity = session.activities[0];
              const extraCount = Math.max(session.activities.length - 1, 0);
              const timing = getSessionTimingState(session);
              const borderClass =
                timing.statusVariant === 'cancelled'
                  ? 'border-l-4 border-l-red-500 bg-red-50/70 dark:bg-red-950/30'
                  : timing.statusVariant === 'completed'
                    ? 'border-l-4 border-l-slate-400 bg-slate-100/80 dark:bg-slate-800/50'
                    : timing.statusVariant === 'live'
                      ? 'border-l-4 border-l-green-500 bg-green-50/70 dark:bg-green-950/30'
                      : 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/30';
              const pillClass =
                timing.statusVariant === 'cancelled'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
                  : timing.statusVariant === 'completed'
                    ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                    : timing.statusVariant === 'live'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200';

              return (
                <li key={`${session.date}-${session.startTime}-${index}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSession({
                        date: session.date,
                        startTime: session.startTime,
                        endTime: session.endTime,
                        childName: session.childName,
                        childId: session.childId,
                        activities: session.activities,
                        bookingId: session.bookingId,
                        scheduleId: session.scheduleId,
                        bookingReference: session.bookingReference,
                        packageName: session.packageName,
                        status: session.status,
                        pickupAddress: session.pickupAddress ?? null,
                      });
                      setShowSessionModal(true);
                    }}
                    className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-left transition-colors hover:opacity-90 dark:border-slate-700 ${borderClass}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-50">
                        {session.childName}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide ${pillClass}`}
                        aria-label={`Status: ${timing.statusLabel}`}
                      >
                        {timing.statusVariant === 'live' && (
                          <span className="mr-1 inline-block h-1 w-1 rounded-full bg-current animate-pulse" aria-hidden />
                        )}
                        {timing.statusLabel}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                      {start} – {end}
                    </p>
                    {primaryActivity && (
                      <p className="mt-0.5 truncate text-[11px] text-slate-600 dark:text-slate-400">
                        Activity: {primaryActivity}
                        {extraCount > 0 && (
                          <span className="text-slate-500 dark:text-slate-400">
                            {' '}
                            +{extraCount} more
                          </span>
                        )}
                      </p>
                    )}
                    <p className="mt-1 flex items-start gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <MapPin size={11} className="shrink-0 mt-0.5" aria-hidden />
                      {session.pickupAddress ? (
                        <a
                          href={getGoogleMapsSearchUrl(session.pickupAddress)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="line-clamp-2 text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                          aria-label={`Open ${session.pickupAddress} in Google Maps`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {session.pickupAddress}
                        </a>
                      ) : (
                        <span className="italic">Location not set – contact admin</span>
                      )}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </SideCanvas>

    </section>
  );
}
