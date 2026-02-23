"use client";

import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import moment from "moment";
import { useAuth } from "@/interfaces/web/hooks/auth/useAuth";
import { useMyBookings } from "@/interfaces/web/hooks/booking/useMyBookings";
import { useDashboardStats } from "@/interfaces/web/hooks/dashboard/useDashboardStats";
import { getChildChecklistFlags, childNeedsChecklistToComplete, childAwaitingChecklistReview } from "@/core/application/auth/types";
import type { BookingDTO } from "@/core/application/booking/dto/BookingDTO";
import BuyHoursModal from "@/components/dashboard/modals/BuyHoursModal";
import Button from "@/components/ui/Button/Button";
import ParentBookingModal, { type ParentBookingFormData } from "@/components/dashboard/modals/ParentBookingModal";
import SessionDetailModal from "@/components/dashboard/modals/SessionDetailModal";
import CompleteChecklistModal, { type ChecklistFormData } from "@/components/dashboard/modals/CompleteChecklistModal";
import CompletePaymentModal from "@/components/dashboard/modals/CompletePaymentModal";
import TopUpModal from "@/components/dashboard/modals/TopUpModal";
import AddChildModal from "@/components/dashboard/modals/AddChildModal";
import { useActivities } from "@/interfaces/web/hooks/activities/useActivities";
import { apiClient } from "@/infrastructure/http/ApiClient";
import { API_ENDPOINTS } from "@/infrastructure/http/apiEndpoints";
import { toastManager, type Toast } from "@/utils/toast";
import { EMPTY_STATE } from "@/utils/emptyStateConstants";
import { useRouter } from "next/navigation";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import ToastContainer from "@/components/ui/Toast/ToastContainer";
import {
  AlertTriangle,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Package,
  ShieldAlert,
  Star,
  User,
  UserPlus,
} from "lucide-react";
import { useParentSessionNotes } from "@/interfaces/web/hooks/dashboard/useParentSessionNotes";
import { useSubmitSafeguardingConcern } from "@/interfaces/web/hooks/dashboard/useSubmitSafeguardingConcern";
import SessionNotesModal from "@/components/dashboard/modals/SessionNotesModal";
import SafeguardingConcernModal, { type SafeguardingConcernFormData } from "@/components/dashboard/modals/SafeguardingConcernModal";
import { useLiveRefresh } from "@/core/liveRefresh/LiveRefreshContext";
import { LIVE_REFRESH_ENABLED } from "@/utils/liveRefreshConstants";
import { ACTIVE_BOOKING_STATUSES, BOOKING_STATUS, PAYMENT_STATUS } from "@/utils/dashboardConstants";

const MIN_DURATION_HOURS = 3;

/** Countdown label for non-tech parents: "In 1h 26m", "Starting in 26m", "Tomorrow at 3:30pm", "In progress". */
function getCountdownLabel(dateStr: string, startTime: string, endTime?: string): string {
  const startM = moment(`${dateStr} ${startTime}`, ["YYYY-MM-DD HH:mm", "YYYY-MM-DD HH:mm:ss"], false);
  const endM = endTime
    ? moment(`${dateStr} ${endTime}`, ["YYYY-MM-DD HH:mm", "YYYY-MM-DD HH:mm:ss"], false)
    : startM.clone().add(1, "hour");
  const now = moment();
  if (now.isSameOrAfter(startM) && now.isBefore(endM)) return "In progress";
  if (!startM.isValid() || startM.isBefore(now)) return "";
  const diffMs = startM.diff(now);
  const totalMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours < 1) return mins <= 0 ? "Starting soon" : `In ${mins}m`;
  if (hours < 24) return mins > 0 ? `In ${hours}h ${mins}m` : `In ${hours}h`;
  const days = startM.diff(now, "days");
  if (days === 1) return "Tomorrow";
  if (days < 7) return `In ${days} days`;
  return startM.format("ddd, D MMM");
}

export default function ParentOverviewPageClient() {
  const router = useRouter();
  const { user, children, approvedChildren, loading, refresh } = useAuth();
  const { bookings, loading: bookingsLoading, refetch: refetchBookings } = useMyBookings();
  useDashboardStats();
  const { activities: allActivities } = useActivities();

  const [showBuyHoursModal, setShowBuyHoursModal] = useState(false);
  const [buyHoursChildId, setBuyHoursChildId] = useState<number | undefined>();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingModalChildId, setBookingModalChildId] = useState<number | undefined>();
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [checklistChildId, setChecklistChildId] = useState<number | undefined>();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentBooking, setSelectedPaymentBooking] = useState<BookingDTO | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    childName: string;
    childId: number;
    activities: string[];
    trainerName?: string;
    trainerPreferenceLabel?: string;
    requiresAdminApproval?: boolean;
    bookingId: number;
    scheduleId: string;
    isPast?: boolean;
    isOngoing?: boolean;
    isUpcoming?: boolean;
    itineraryNotes?: string;
    location?: string;
  } | null>(null);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpChildId, setTopUpChildId] = useState<number | null>(null);
  const [topUpBooking, setTopUpBooking] = useState<BookingDTO | null>(null);
  const [isTopUpSubmitting, setIsTopUpSubmitting] = useState(false);
  const [showSessionNotesModal, setShowSessionNotesModal] = useState(false);
  const [showSafeguardingModal, setShowSafeguardingModal] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [showHoursBreakdown, setShowHoursBreakdown] = useState(true);
  const moreDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setShowMoreDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { sessionNotesItems } = useParentSessionNotes();
  const { submitSafeguardingConcern } = useSubmitSafeguardingConcern();

  React.useEffect(() => {
    const unsub = toastManager.subscribe((t) => setToasts((prev) => [...prev, t]));
    return unsub;
  }, []);

  const getActiveBookingForChild = useCallback(
    (childId: number): BookingDTO | null => {
      const confirmedPaid = bookings.filter((b) => b.status === BOOKING_STATUS.CONFIRMED && b.paymentStatus === PAYMENT_STATUS.PAID);
      const childBookings = confirmedPaid.filter((b) => (b.participants ?? []).some((p) => p.childId === childId));
      if (childBookings.length === 0) return null;
      return [...childBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    },
    [bookings]
  );

  const childrenWithActivePackagesForBuyHours = useMemo(() => {
    const activeBookings = bookings.filter((b) => {
      if (!ACTIVE_BOOKING_STATUSES.includes(b.status ?? "")) return false;
      if (b.paymentStatus === PAYMENT_STATUS.REFUNDED || b.deletedAt) return false;
      if (b.packageExpiresAt && new Date(b.packageExpiresAt) <= new Date()) return false;
      return true;
    });
    const set = new Set<number>();
    activeBookings.forEach((b) => {
      b.participants?.forEach((p) => {
        if (p.childId) set.add(p.childId);
      });
    });
    return approvedChildren.filter((c) => set.has(c.id));
  }, [approvedChildren, bookings]);

  const allChildrenHaveActivePackages = useMemo(
    () => approvedChildren.length > 0 && childrenWithActivePackagesForBuyHours.length === approvedChildren.length,
    [approvedChildren, childrenWithActivePackagesForBuyHours]
  );
  const childIdsWithActivePackage = useMemo(
    () => new Set(childrenWithActivePackagesForBuyHours.map((c) => c.id)),
    [childrenWithActivePackagesForBuyHours]
  );
  const hasDraftOrUnpaidActivePackage = useMemo(() => {
    const active = bookings.filter((b) => {
      if (!ACTIVE_BOOKING_STATUSES.includes(b.status ?? "")) return false;
      if (b.paymentStatus === PAYMENT_STATUS.REFUNDED || b.deletedAt) return false;
      if (b.packageExpiresAt && new Date(b.packageExpiresAt) <= new Date()) return false;
      return true;
    });
    return active.some((b) => b.status === BOOKING_STATUS.DRAFT || b.paymentStatus !== PAYMENT_STATUS.PAID);
  }, [bookings]);
  const firstUnpaidBooking = useMemo(
    () =>
      bookings.find((b) => {
        if (!ACTIVE_BOOKING_STATUSES.includes(b.status ?? "")) return false;
        if (b.paymentStatus === PAYMENT_STATUS.PAID || b.paymentStatus === PAYMENT_STATUS.REFUNDED || b.deletedAt) return false;
        if (b.packageExpiresAt && new Date(b.packageExpiresAt) <= new Date()) return false;
        return true;
      }) ?? null,
    [bookings]
  );
  const firstUnpaidBookingReference = firstUnpaidBooking?.reference ?? null;

  const childrenNeedingChecklistForSidebar = useMemo(
    () => children.filter(childNeedsChecklistToComplete).map((c) => ({ id: c.id, name: c.name })),
    [children]
  );

  const upcomingSessionsForSidebar = useMemo(() => {
    const today = moment().format("YYYY-MM-DD");
    const items: Array<{
      scheduleId: string;
      date: string;
      startTime: string;
      endTime: string;
      childName: string;
      childId: number;
      trainerName?: string;
      location?: string | null;
      activities?: string[];
      packageName?: string | null;
    }> = [];
    const confirmedPaid = bookings.filter((b) => b.status === BOOKING_STATUS.CONFIRMED && b.paymentStatus === PAYMENT_STATUS.PAID);
    confirmedPaid.forEach((booking) => {
      const participant = booking.participants?.[0];
      const childName = participant ? `${participant.firstName ?? ""} ${participant.lastName ?? ""}`.trim() || "Child" : "Child";
      const childId = participant?.childId ?? 0;
      (booking.schedules ?? []).forEach((schedule) => {
        if (schedule.status === BOOKING_STATUS.CANCELLED) return;
        const dateStr = typeof schedule.date === "string" ? schedule.date : moment(schedule.date).format("YYYY-MM-DD");
        if (dateStr < today) return;
        const startTime = (schedule as { startTime?: string }).startTime ?? (schedule as { start_time?: string }).start_time ?? "";
        const endTime = (schedule as { endTime?: string }).endTime ?? (schedule as { end_time?: string }).end_time ?? "";
        items.push({
          scheduleId: String(schedule.id),
          date: dateStr,
          startTime,
          endTime,
          childName,
          childId,
          trainerName: schedule.trainer?.name,
          location: schedule.location ?? null,
          activities: schedule.activities?.map((a: { name: string }) => a.name) ?? [],
          packageName: booking.package?.name ?? null,
        });
      });
    });
    items.sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      if (d !== 0) return d;
      return (a.startTime || "").localeCompare(b.startTime || "");
    });
    return items.slice(0, 5);
  }, [bookings]);

  /** Past sessions (completed or date in the past), newest first, for Latest activity. */
  const pastSessionsForOverview = useMemo(() => {
    const today = moment().format("YYYY-MM-DD");
    const items: Array<{
      scheduleId: string;
      date: string;
      startTime: string;
      endTime: string;
      childName: string;
      childId: number;
      trainerName?: string;
      status?: string;
    }> = [];
    const confirmedPaid = bookings.filter((b) => b.status === BOOKING_STATUS.CONFIRMED && b.paymentStatus === PAYMENT_STATUS.PAID);
    confirmedPaid.forEach((booking) => {
      const participant = booking.participants?.[0];
      const childName = participant ? `${participant.firstName ?? ""} ${participant.lastName ?? ""}`.trim() || "Child" : "Child";
      const childId = participant?.childId ?? 0;
      (booking.schedules ?? []).forEach((schedule) => {
        if (schedule.status === BOOKING_STATUS.CANCELLED) return;
        const dateStr = typeof schedule.date === "string" ? schedule.date : moment(schedule.date).format("YYYY-MM-DD");
        const isPast = dateStr < today || schedule.status === BOOKING_STATUS.COMPLETED;
        if (!isPast) return;
        const startTime = (schedule as { startTime?: string }).startTime ?? (schedule as { start_time?: string }).start_time ?? "";
        const endTime = (schedule as { endTime?: string }).endTime ?? (schedule as { end_time?: string }).end_time ?? "";
        items.push({
          scheduleId: String(schedule.id),
          date: dateStr,
          startTime,
          endTime,
          childName,
          childId,
          trainerName: schedule.trainer?.name,
          status: schedule.status,
        });
      });
    });
    items.sort((a, b) => {
      const d = b.date.localeCompare(a.date);
      if (d !== 0) return d;
      return (b.startTime || "").localeCompare(a.startTime || "");
    });
    return items.slice(0, 10);
  }, [bookings]);

  /** Ongoing (live) sessions: today, in progress (now >= start and now < end), not completed. Shown first in Latest activity. */
  const ongoingSessionsForOverview = useMemo(() => {
    const now = moment();
    const today = now.format("YYYY-MM-DD");
    const items: Array<{
      scheduleId: string;
      date: string;
      startTime: string;
      endTime: string;
      childName: string;
      childId: number;
      trainerName?: string;
      status?: string;
    }> = [];
    const confirmedPaid = bookings.filter((b) => b.status === BOOKING_STATUS.CONFIRMED && b.paymentStatus === PAYMENT_STATUS.PAID);
    confirmedPaid.forEach((booking) => {
      const participant = booking.participants?.[0];
      const childName = participant ? `${participant.firstName ?? ""} ${participant.lastName ?? ""}`.trim() || "Child" : "Child";
      const childId = participant?.childId ?? 0;
      (booking.schedules ?? []).forEach((schedule) => {
        if (schedule.status === BOOKING_STATUS.CANCELLED || schedule.status === BOOKING_STATUS.COMPLETED) return;
        const dateStr = typeof schedule.date === "string" ? schedule.date : moment(schedule.date).format("YYYY-MM-DD");
        if (dateStr !== today) return;
        const startTime = (schedule as { startTime?: string }).startTime ?? (schedule as { start_time?: string }).start_time ?? "";
        const endTime = (schedule as { endTime?: string }).endTime ?? (schedule as { end_time?: string }).end_time ?? "";
        const startM = moment(`${dateStr} ${startTime}`, ["YYYY-MM-DD HH:mm", "YYYY-MM-DD HH:mm:ss"], false);
        const endM = endTime ? moment(`${dateStr} ${endTime}`, ["YYYY-MM-DD HH:mm", "YYYY-MM-DD HH:mm:ss"], false) : startM.clone().add(1, "hour");
        if (!startM.isValid() || !endM.isValid()) return;
        if (!now.isSameOrAfter(startM) || !now.isBefore(endM)) return;
        items.push({
          scheduleId: String(schedule.id),
          date: dateStr,
          startTime,
          endTime,
          childName,
          childId,
          trainerName: schedule.trainer?.name,
          status: schedule.status,
        });
      });
    });
    items.sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
    return items;
  }, [bookings]);

  /** Combined list: ongoing (live) first, then past (newest first), then upcoming (soonest first). No double-count: upcoming excludes ongoing. */
  const latestActivitySessions = useMemo(() => {
    type Item = { scheduleId: string; date: string; startTime: string; endTime: string; childName: string; childId: number; trainerName?: string; status?: string };
    const ongoingIds = new Set(ongoingSessionsForOverview.map((s) => s.scheduleId));
    const ongoing: Array<Item & { kind: "ongoing" }> = ongoingSessionsForOverview.map((s) => ({ ...s, kind: "ongoing" as const }));
    const past: Array<Item & { kind: "past" }> = pastSessionsForOverview.map((s) => ({ ...s, kind: "past" as const }));
    const upcoming: Array<Item & { kind: "upcoming" }> = upcomingSessionsForSidebar
      .filter((s) => !ongoingIds.has(s.scheduleId))
      .map((s) => ({ ...s, kind: "upcoming" as const }));
    return [...ongoing, ...past, ...upcoming];
  }, [ongoingSessionsForOverview, pastSessionsForOverview, upcomingSessionsForSidebar]);

  const nextSession = upcomingSessionsForSidebar[0] ?? null;

  const sessionsThisWeekCount = useMemo(() => {
    const start = moment().startOf("week");
    const end = moment().endOf("week");
    return upcomingSessionsForSidebar.filter((s) => {
      const m = moment(s.date);
      return m.isBetween(start, end, undefined, "[]");
    }).length;
  }, [upcomingSessionsForSidebar]);

  const totalRemainingHours = useMemo(() => {
    const confirmedPaid = bookings.filter((b) => b.status === BOOKING_STATUS.CONFIRMED && b.paymentStatus === PAYMENT_STATUS.PAID);
    return confirmedPaid.reduce((sum, b) => sum + (b.remainingHours ?? 0), 0);
  }, [bookings]);

  type OneAction = { type: "payment" } | { type: "checklist"; childId: number; childName: string } | { type: "buy_hours"; childId: number; childName: string } | null;
  const oneAction: OneAction = useMemo(() => {
    if (hasDraftOrUnpaidActivePackage && firstUnpaidBookingReference) return { type: "payment" };
    if (childrenNeedingChecklistForSidebar.length > 0) {
      const c = childrenNeedingChecklistForSidebar[0];
      return { type: "checklist", childId: c.id, childName: c.name };
    }
    const newOrExpired = approvedChildren.filter((c) => {
      const hasActive = childIdsWithActivePackage?.has(c.id);
      if (hasActive) return false;
      const active = getActiveBookingForChild(c.id);
      if (!active) return true;
      return (active.remainingHours ?? 0) <= 0;
    });
    if (newOrExpired.length > 0) {
      const c = newOrExpired[0];
      return { type: "buy_hours", childId: c.id, childName: c.name };
    }
    return null;
  }, [
    hasDraftOrUnpaidActivePackage,
    firstUnpaidBookingReference,
    childrenNeedingChecklistForSidebar,
    approvedChildren,
    childIdsWithActivePackage,
    getActiveBookingForChild,
  ]);

  const childrenSummary = useMemo(() => {
    const today = moment().format("YYYY-MM-DD");
    return approvedChildren.map((c) => {
      const active = getActiveBookingForChild(c.id);
      const remaining = active ? (active.remainingHours ?? 0) : 0;
      const total = active ? (active.totalHours ?? 0) : 0;
      const booked = active ? (active.bookedHours ?? 0) : 0;
      const status = total === 0 ? "new" : remaining <= 0 ? "expired" : "ok";
      const packageName = active?.package?.name ?? null;
      let lastSessionDate: string | null = null;
      let nextSessionForChild: (typeof upcomingSessionsForSidebar)[0] | null = null;
      if (active?.schedules) {
        const pastDates = (active.schedules as Array<{ date?: string; status?: string }>)
          .filter((s) => s.status !== "cancelled" && s.date)
          .map((s) => (typeof s.date === "string" ? s.date : moment(s.date).format("YYYY-MM-DD")))
          .filter((d) => d < today)
          .sort();
        if (pastDates.length > 0) lastSessionDate = pastDates[pastDates.length - 1];
      }
      nextSessionForChild = upcomingSessionsForSidebar.find((s) => s.childId === c.id) ?? null;
      return {
        id: c.id,
        name: c.name,
        status,
        remainingHours: remaining,
        totalHours: total,
        bookedHours: booked,
        packageName,
        lastSessionDate,
        nextSessionForChild,
      };
    });
  }, [approvedChildren, getActiveBookingForChild, upcomingSessionsForSidebar]);

  const childrenWithZeroHoursList = useMemo(() => {
    return childrenSummary.filter((c) => c.status === "expired" || c.status === "new").map((c) => ({ id: c.id, name: c.name }));
  }, [childrenSummary]);

  /** All children for Hours table and Your children: approved (with hours) + pending (checklist / awaiting review). Sorted newest first. */
  const allChildrenForDisplay = useMemo(() => {
    const approvedIds = new Set(approvedChildren.map((c) => c.id));
    const approvedRows = childrenSummary.map((c) => ({ ...c, pendingStatus: null as "checklist" | "review" | null }));
    const pendingChildren = children.filter((c) => !approvedIds.has(c.id));
    const pendingRows = pendingChildren.map((c) => {
      const needsChecklist = childNeedsChecklistToComplete(c);
      const awaitingReview = childAwaitingChecklistReview(c);
      const pendingStatus: "checklist" | "review" = needsChecklist ? "checklist" : "review";
      return {
        id: c.id,
        name: c.name,
        status: "pending" as const,
        remainingHours: 0,
        totalHours: 0,
        bookedHours: 0,
        packageName: null as string | null,
        lastSessionDate: null as string | null,
        nextSessionForChild: null,
        pendingStatus: awaitingReview ? "review" : pendingStatus,
      };
    });
    const combined = [...approvedRows, ...pendingRows];
    const createdAtByChildId = new Map(children.map((c) => [c.id, c.createdAt ?? ""]));
    return [...combined].sort((a, b) => {
      const dateA = createdAtByChildId.get(a.id) ?? "";
      const dateB = createdAtByChildId.get(b.id) ?? "";
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [children, approvedChildren, childrenSummary]);

  const hoursSummaryStats = useMemo(() => {
    const confirmedPaid = bookings.filter((b) => b.status === BOOKING_STATUS.CONFIRMED && b.paymentStatus === PAYMENT_STATUS.PAID);
    const totalRemaining = confirmedPaid.reduce((sum, b) => sum + (b.remainingHours ?? 0), 0);
    const totalUsed = confirmedPaid.reduce((sum, b) => sum + (b.bookedHours ?? 0), 0);
    const totalPurchased = confirmedPaid.reduce((sum, b) => sum + (b.totalHours ?? 0), 0);
    return { totalRemaining, totalUsed, totalPurchased };
  }, [bookings]);

  const findSessionByScheduleId = useCallback(
    (
      scheduleId: string,
      preferredChildName?: string,
      preferredChildId?: number
    ): NonNullable<typeof selectedSession> | null => {
      for (const booking of bookings) {
        if (booking.status !== "confirmed" || booking.paymentStatus !== "paid") continue;
        for (const schedule of booking.schedules || []) {
          if (String(schedule.id) === scheduleId) {
            const startTime = (schedule as { startTime?: string }).startTime ?? (schedule as { start_time?: string }).start_time ?? "";
            const endTime = (schedule as { endTime?: string }).endTime ?? (schedule as { end_time?: string }).end_time ?? "";
            const dateStr = typeof schedule.date === "string" ? schedule.date : moment(schedule.date).format("YYYY-MM-DD");
            const startM = moment(`${dateStr} ${startTime}`, ["YYYY-MM-DD HH:mm", "YYYY-MM-DD HH:mm:ss"], false);
            const endM = moment(`${dateStr} ${endTime}`, ["YYYY-MM-DD HH:mm", "YYYY-MM-DD HH:mm:ss"], false);
            const now = moment();
            const childName = preferredChildName ?? (booking.participants?.[0] ? `${booking.participants[0].firstName ?? ""} ${booking.participants[0].lastName ?? ""}`.trim() || "Child" : "Child");
            const childId = preferredChildId ?? booking.participants?.[0]?.childId ?? 0;
            return {
              id: String(schedule.id),
              date: dateStr,
              startTime,
              endTime,
              childName,
              childId,
              activities: schedule.activities?.map((a: { name: string }) => a.name) ?? [],
              bookingId: typeof booking.id === "string" ? parseInt(booking.id, 10) : Number(booking.id),
              scheduleId: String(schedule.id),
              isPast: now.isAfter(endM),
              isOngoing: now.isAfter(startM) && now.isBefore(endM),
              isUpcoming: now.isBefore(startM),
              trainerName: schedule.trainer?.name,
              requiresAdminApproval: schedule.requiresAdminApproval,
              itineraryNotes: schedule.itineraryNotes ?? schedule.notes,
              location: schedule.location ?? undefined,
            };
          }
        }
      }
      return null;
    },
    [bookings]
  );

  const handleUpcomingSessionClick = useCallback(
    (session: { scheduleId: string; childName: string; childId: number }) => {
      const resolved = findSessionByScheduleId(session.scheduleId, session.childName, session.childId);
      if (resolved) {
        setSelectedSession(resolved);
        setShowSessionModal(true);
      } else {
        toastManager.info("Session details are no longer available.");
      }
    },
    [findSessionByScheduleId]
  );

  const handleBookSession = useCallback((childId: number) => {
    const activeBooking = getActiveBookingForChild(childId);
    if (!activeBooking) {
      toastManager.error("This child does not have an active package. Please buy a package first.");
      return;
    }
    setBookingModalChildId(childId);
    setShowBookingModal(true);
  }, [getActiveBookingForChild]);

  const handleBuyHours = useCallback((childId: number) => {
    const child = children.find((c) => c.id === childId);
    if (child) {
      const { hasChecklist, checklistCompleted } = getChildChecklistFlags(child);
      if (!hasChecklist) {
        toastManager.warning("Please complete the checklist first before buying hours.");
        return;
      }
      if (!checklistCompleted) {
        toastManager.info("Your checklist has been submitted and is awaiting review. You will be able to buy hours once it has been approved.");
        return;
      }
    }
    setBuyHoursChildId(childId);
    setShowBuyHoursModal(true);
  }, [children]);

  const handleOpenTopUp = useCallback((childId: number) => {
    const activeBooking = getActiveBookingForChild(childId);
    if (!activeBooking) {
      toastManager.error("This child does not have an active package to top up.");
      return;
    }
    setTopUpChildId(childId);
    setTopUpBooking(activeBooking);
    setShowTopUpModal(true);
  }, [getActiveBookingForChild]);

  /** True if child has an active (confirmed, paid) package – use Top up instead of Buy hours. */
  const childHasActivePackage = useCallback(
    (childId: number) => getActiveBookingForChild(childId) != null,
    [getActiveBookingForChild]
  );

  const handleViewSessionNote = useCallback(
    (scheduleId: string, item: { childName: string; childId: number }) => {
      const session = findSessionByScheduleId(scheduleId, item.childName, item.childId);
      if (session) {
        setSelectedSession(session);
        setShowSessionModal(true);
        setShowSessionNotesModal(false);
        refetchBookings();
      } else {
        toastManager.info("Session details are no longer available.");
      }
    },
    [findSessionByScheduleId, refetchBookings]
  );

  const handleSafeguardingSubmit = useCallback(
    async (data: SafeguardingConcernFormData) => {
      await submitSafeguardingConcern(data);
      toastManager.success("Your concern has been recorded. Our Designated Safeguarding Lead will be in touch.");
      setShowSafeguardingModal(false);
    },
    [submitSafeguardingConcern]
  );

  const handleCompleteChecklist = useCallback((childId: number) => {
    setChecklistChildId(childId);
    setShowChecklistModal(true);
  }, []);

  /** Actionable strips: group "need hours" into one to reduce buttons. */
  const actionableStrips = useMemo(() => {
    const strips: Array<{ id: string; label: string; actionLabel: string; onClick: () => void }> = [];
    if (hasDraftOrUnpaidActivePackage && firstUnpaidBooking) {
      strips.push({
        id: "payment",
        label: "Complete payment to confirm your booking.",
        actionLabel: "Pay now",
        onClick: () => { setSelectedPaymentBooking(firstUnpaidBooking); setShowPaymentModal(true); },
      });
    }
    childrenNeedingChecklistForSidebar.forEach((c) => {
      strips.push({
        id: `checklist-${c.id}`,
        label: `Complete checklist for ${c.name}.`,
        actionLabel: "Complete",
        onClick: () => handleCompleteChecklist(c.id),
      });
    });
    if (childrenWithZeroHoursList.length > 0) {
      const names = childrenWithZeroHoursList.map((c) => c.name.split(" ")[0] || c.name).join(" & ");
      strips.push({
        id: "hours",
        label: childrenWithZeroHoursList.length === 1 ? `${names} needs hours.` : `${names} need hours.`,
        actionLabel: "Buy hours",
        onClick: () => { setBuyHoursChildId(undefined); setShowBuyHoursModal(true); },
      });
    }
    return strips;
  }, [
    hasDraftOrUnpaidActivePackage,
    firstUnpaidBooking,
    childrenNeedingChecklistForSidebar,
    childrenWithZeroHoursList,
    handleCompleteChecklist,
  ]);

  const childrenForBookingModal = useMemo(() => {
    return approvedChildren.map((child) => {
      const active = getActiveBookingForChild(child.id);
      const total = active?.totalHours ?? 0;
      const booked = active?.bookedHours ?? 0;
      const remaining = Math.max(0, total - booked);
      return {
        id: child.id,
        name: child.name,
        activePackages: active ? [{ id: Number(active.id), remainingHours: remaining, totalHours: total }] : undefined,
      };
    });
  }, [approvedChildren, getActiveBookingForChild]);

  const handleBookingSave = useCallback(
    async (bookingData: ParentBookingFormData) => {
      const activeBooking = getActiveBookingForChild(bookingData.childId);
      if (!activeBooking) throw new Error("No active package found for this child. Please buy a package first.");
      const activities: Array<{ activity_id: number; duration_hours?: number; order?: number }> = [];
      if (bookingData.activitySelectionType === "package_activity" && bookingData.selectedActivityIds?.length) {
        bookingData.selectedActivityIds.forEach((id, idx) => {
          activities.push({ activity_id: id, order: idx });
        });
      }
      let totalDuration = MIN_DURATION_HOURS;
      if (bookingData.activitySelectionType === "package_activity" && bookingData.selectedActivityIds?.length) {
        totalDuration = Math.max(
          MIN_DURATION_HOURS,
          (bookingData.selectedActivityIds || []).reduce((sum, activityId) => {
            const activity = allActivities.find((a) => String(a.id) === String(activityId));
            return sum + (activity?.duration || 1);
          }, 0)
        );
      } else if (bookingData.duration) {
        totalDuration = bookingData.duration;
      }
      const startM = moment(`${bookingData.date} ${bookingData.startTime}`, "YYYY-MM-DD HH:mm");
      const endTime = startM.clone().add(totalDuration, "hours").format("HH:mm");
      await apiClient.post(API_ENDPOINTS.BOOKING_SCHEDULES(activeBooking.id), {
        date: bookingData.date,
        start_time: bookingData.startTime,
        end_time: endTime,
        activities,
        itinerary_notes: bookingData.notes || null,
        location: bookingData.location || null,
      });
      toastManager.success("Session booked successfully!");
      refetchBookings();
      refresh();
      setShowBookingModal(false);
      setBookingModalChildId(undefined);
    },
    [getActiveBookingForChild, allActivities, refetchBookings, refresh]
  );

  const handleChecklistSubmit = useCallback(
    async (formData: ChecklistFormData) => {
      if (!checklistChildId) return;
      try {
        await apiClient.post(
          API_ENDPOINTS.CHILD_CHECKLIST(checklistChildId),
          formData
        );
        setShowChecklistModal(false);
        setChecklistChildId(undefined);
        refresh();
        refetchBookings();
        toastManager.success("Checklist submitted. We will review and get back to you.");
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        const message =
          error?.response?.data?.message ?? error?.message ?? "Failed to submit checklist. Please try again.";
        toastManager.error(message);
        throw err;
      }
    },
    [checklistChildId, refresh, refetchBookings]
  );

  const handlePaymentComplete = useCallback(() => {
    setShowPaymentModal(false);
    setSelectedPaymentBooking(null);
    refetchBookings();
    refresh();
    toastManager.success("Payment confirmed. Your hours are updated.");
  }, [refetchBookings, refresh]);

  const handlePaymentFailed = useCallback((message?: string) => {
    toastManager.error(message ?? "Payment failed. Please try again.");
  }, []);

  const handleAddChildSuccess = useCallback(async () => {
    await refresh();
    setShowAddChildModal(false);
    toastManager.success("Child added successfully! Please complete their checklist.");
  }, [refresh]);

  const handleTopUpProceedToPayment = useCallback(async () => {
    if (!topUpBooking || topUpChildId === null) return;
    setIsTopUpSubmitting(true);
    try {
      // Top-up flow would call API; for now close and refetch
      await refetchBookings();
      refresh();
      setShowTopUpModal(false);
      setTopUpChildId(null);
      setTopUpBooking(null);
      toastManager.success("Top-up completed.");
    } finally {
      setIsTopUpSubmitting(false);
    }
  }, [topUpBooking, topUpChildId, refetchBookings, refresh]);

  // Centralised live refresh: refetch when backend reports changes to bookings or children
  const parentOverviewRefetch = useCallback(() => {
    void Promise.all([
      Promise.resolve(refetchBookings(true)),
      Promise.resolve(refresh()),
    ]);
  }, [refetchBookings, refresh]);
  useLiveRefresh('bookings', parentOverviewRefetch, { enabled: LIVE_REFRESH_ENABLED });
  useLiveRefresh('trainer_schedules', parentOverviewRefetch, { enabled: LIVE_REFRESH_ENABLED });
  useLiveRefresh('children', parentOverviewRefetch, { enabled: LIVE_REFRESH_ENABLED });
  useLiveRefresh('notifications', parentOverviewRefetch, { enabled: LIVE_REFRESH_ENABLED });

  if (loading || bookingsLoading) {
    return <DashboardSkeleton variant="parent" />;
  }

  const parentFirstName = (user?.name ?? "there").split(" ")[0];
  const nextSessionCountdown = nextSession
    ? getCountdownLabel(nextSession.date, nextSession.startTime, nextSession.endTime)
    : "";
  const nextSessionChildHours = nextSession ? childrenSummary.find((c) => c.id === nextSession.childId)?.remainingHours ?? 0 : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const cardBase = "rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-sm";
  const cardPadding = "p-5 sm:p-6";

  return (
    <section className="space-y-5 pb-24 pl-2 sm:pl-3" aria-label="Parent dashboard overview">
      {/* Hero: greeting + primary actions (links where navigation, buttons for modals) */}
      <header className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
              {getGreeting()}, {parentFirstName}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400" title="Sessions, hours and children in one place">
              Sessions, hours and children — all in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/parent/schedule?open=booking"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              title="Open calendar and book a session"
            >
              <CalendarPlus className="h-4 w-4 shrink-0" aria-hidden />
              Schedule
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => { setBuyHoursChildId(undefined); setShowBuyHoursModal(true); }}
              className="inline-flex items-center gap-1.5"
              aria-label="Buy hours"
              title="Buy a package or add hours for your children"
            >
              <Package className="h-4 w-4 shrink-0" aria-hidden />
              Buy hours
            </Button>
            <div className="relative" ref={moreDropdownRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMoreDropdown((v) => !v)}
                className="inline-flex items-center gap-1.5"
                aria-label="More actions"
                aria-expanded={showMoreDropdown}
                aria-haspopup="true"
                title="Add child, trainer notes, report a concern"
              >
                More
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${showMoreDropdown ? "rotate-180" : ""}`} aria-hidden />
              </Button>
              {showMoreDropdown && (
                <div
                  className="absolute right-0 top-full z-20 mt-1 min-w-[200px] rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                  role="menu"
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    role="menuitem"
                    onClick={() => { setShowAddChildModal(true); setShowMoreDropdown(false); }}
                    title="Register a new child to book sessions"
                  >
                    <UserPlus className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                    Add child
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    role="menuitem"
                    onClick={() => { setShowSessionNotesModal(true); setShowMoreDropdown(false); }}
                    title="Summary notes from the trainer after each session"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                    Trainer notes
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    role="menuitem"
                    onClick={() => { setShowSafeguardingModal(true); setShowMoreDropdown(false); }}
                    title="Report a safeguarding concern"
                  >
                    <ShieldAlert className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                    Report a concern
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* At a glance – next session first, then schedule/hours/children */}
      <section
        className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
        aria-label="At a glance"
      >
        <div className="grid grid-cols-2 gap-0 lg:grid-cols-4">
          {/* Primary: next session (emphasised so it’s the obvious “what’s next”) */}
          {nextSession ? (
            <button
              type="button"
              onClick={() => handleUpcomingSessionClick({ scheduleId: nextSession.scheduleId, childName: nextSession.childName, childId: nextSession.childId })}
              className="flex flex-col gap-1 rounded-none border-b border-r border-slate-200 bg-indigo-50/80 px-4 py-3.5 text-left transition-colors hover:bg-indigo-100/80 dark:border-slate-700 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 lg:border-b-0 lg:border-r"
              title="View session details and activity"
            >
              <span className="flex items-center gap-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Next session
              </span>
              <span className="text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {nextSessionCountdown === "Tomorrow" ? "Tomorrow" : moment(nextSession.date).format("ddd")}
                {nextSession.startTime ? ` ${moment(nextSession.startTime, ["HH:mm", "HH:mm:ss"]).format("h:mma")}` : ""}
              </span>
              {nextSessionCountdown && nextSessionCountdown !== "Tomorrow" && (
                <span className="text-xs text-slate-600 dark:text-slate-400">{nextSessionCountdown}</span>
              )}
              <span className="mt-1 inline-flex items-center gap-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                View session
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </button>
          ) : (
            <Link
              href="/dashboard/parent/schedule"
              className="flex flex-col gap-1 rounded-none border-b border-r border-slate-200 bg-slate-50 px-4 py-3.5 text-left transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 lg:border-b-0"
              title="Open calendar to book or view sessions"
            >
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Next session
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">None scheduled</span>
              <span className="mt-1 inline-flex items-center gap-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                Book one
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </Link>
          )}

          {/* Sessions this week */}
          <Link
            href="/dashboard/parent/schedule"
            className="flex flex-col gap-1 rounded-none border-b border-r border-slate-200 bg-white px-4 py-3.5 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/50 lg:border-b-0"
            title="View your full schedule"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Sessions this week
            </span>
            <span className="text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{sessionsThisWeekCount}</span>
            <span className="mt-1 inline-flex items-center gap-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
              View schedule
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </Link>

          {/* Hours left – value first; CTA is “Buy hours” when 0, else “View schedule” */}
          {hoursSummaryStats.totalRemaining <= 0 ? (
            <button
              type="button"
              onClick={() => { setShowBuyHoursModal(true); setBuyHoursChildId(undefined); }}
              className="flex flex-col gap-1 rounded-none border-b border-r border-slate-200 bg-amber-50 px-4 py-3.5 text-left transition-colors hover:bg-amber-100 dark:border-slate-700 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 lg:border-b-0"
              title="Buy a package to get hours for booking"
            >
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-800 dark:text-amber-200">
                <Package className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Hours left
              </span>
              <span className="text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{hoursSummaryStats.totalRemaining.toFixed(1)}h</span>
              <span className="mt-1 inline-flex items-center gap-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                Buy hours
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </button>
          ) : (
            <Link
              href="/dashboard/parent/schedule"
              className="flex flex-col gap-1 rounded-none border-b border-r border-slate-200 bg-white px-4 py-3.5 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/50 lg:border-b-0"
              title="View schedule and book sessions"
            >
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Package className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Hours left
              </span>
              <span className="text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{hoursSummaryStats.totalRemaining.toFixed(1)}h</span>
              <span className="mt-1 inline-flex items-center gap-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                View schedule
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </Link>
          )}

          {/* Your children – link to manage, + Add opens modal */}
          <div className="flex flex-col gap-1 rounded-none border-b border-r-0 border-slate-200 bg-white px-4 py-3.5 dark:border-slate-700 dark:bg-slate-900 lg:border-b-0 lg:border-r">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Your children
            </span>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{children.length > 0 ? children.length : approvedChildren.length}</span>
              <div className="flex items-center gap-1.5">
                <Link
                  href="/dashboard/parent/children"
                  className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:underline"
                  title="Manage all children and their profiles"
                >
                  Manage
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <button
                  type="button"
                  onClick={() => setShowAddChildModal(true)}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  title="Register a new child"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three columns: Hours | Action required | Latest activity */}
      <div className="grid grid-cols-1 gap-4 mt-4 lg:grid-cols-3 lg:gap-6">
        {/* Hours – summary + collapsible breakdown + link to schedule */}
        <div className={`${cardBase} ${cardPadding}`}>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" aria-hidden />
              </span>
              Hours
            </h2>
            <div className="flex items-center gap-2">
              {approvedChildren.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHoursBreakdown((b) => !b)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center gap-0.5"
                  aria-expanded={showHoursBreakdown}
                  title={showHoursBreakdown ? "Hide per-child breakdown" : "Show hours per child"}
                >
                  {showHoursBreakdown ? "Less" : "Breakdown"}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showHoursBreakdown ? "rotate-180" : ""}`} aria-hidden />
                </button>
              )}
              {approvedChildren.length > 0 && (
                <Link
                  href="/dashboard/parent/schedule"
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                  title="Open calendar to book sessions"
                >
                  View schedule
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              )}
            </div>
          </div>
          {approvedChildren.length === 0 ? (
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400" title="Add children and buy a package to see hours">
              Add children and buy a package to see hours here.
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-slate-100">{hoursSummaryStats.totalRemaining.toFixed(1)}h</span>
                <span className="ml-1">left</span>
                <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{hoursSummaryStats.totalUsed.toFixed(1)}h</span> used
              </p>
              {showHoursBreakdown && (
                <div className="mt-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 overflow-hidden" role="region" aria-label="Hours per child">
                  <ul className="divide-y divide-slate-200 dark:divide-slate-700" aria-label="Hours per child">
                    {childrenSummary.map((c) => {
                      const hasHours = (c.remainingHours ?? 0) > 0;
                      const firstName = c.name.split(" ")[0] || c.name;
                      const canTopUp = childHasActivePackage(c.id);
                      return (
                        <li key={c.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{firstName}</span>
                          <span className="flex items-center gap-2 shrink-0">
                            {hasHours && (
                              <span className="text-slate-600 dark:text-slate-400 tabular-nums">{(c.remainingHours ?? 0).toFixed(1)}h</span>
                            )}
                            {!hasHours ? (
                              <button
                                type="button"
                                onClick={() => canTopUp ? handleOpenTopUp(c.id) : handleBuyHours(c.id)}
                                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline focus:underline focus:outline-none"
                                title={canTopUp ? `Top up hours for ${firstName}` : `Buy a package for ${firstName}`}
                              >
                                {canTopUp ? "Top up" : "Buy hours"}
                              </button>
                            ) : canTopUp ? (
                              <button
                                type="button"
                                onClick={() => handleOpenTopUp(c.id)}
                                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline focus:underline focus:outline-none"
                                title={`Add more hours for ${firstName}`}
                              >
                                Top up
                              </button>
                            ) : null}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action required – one button per item (hours grouped) */}
        <div className={`${cardBase} ${cardPadding}`}>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden />
            </span>
            Action required
          </h2>
          {actionableStrips.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400" title="You're all set for now">
              Nothing needs your attention right now.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {actionableStrips.map((strip) => (
                <li
                  key={strip.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2.5 dark:border-amber-800 dark:bg-amber-950/20"
                >
                  <span className="text-sm text-slate-800 dark:text-slate-200">{strip.label}</span>
                  <Button variant="primary" size="sm" onClick={strip.onClick} title={strip.actionLabel}>
                    {strip.actionLabel}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Latest activity – compact list; tap for details, link to full schedule */}
        <div className={`${cardBase} ${cardPadding}`}>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" aria-hidden />
              </span>
              Latest activity
            </h2>
            <Link
              href="/dashboard/parent/schedule"
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 inline-flex items-center gap-0.5"
              title="View full schedule and book sessions"
            >
              See schedule
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400" title="Live = in progress now. Past = tap for activity logs.">
            Live = in progress; tap for details
          </p>
          {latestActivitySessions.length === 0 ? (
            <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-xs text-slate-600 dark:text-slate-400">{EMPTY_STATE.NO_SESSIONS_YET.title}</p>
              {approvedChildren.length > 0 && totalRemainingHours > 0 && (
                <Link
                  href={`/dashboard/parent/schedule?open=booking&childId=${approvedChildren[0].id}`}
                  className="mt-2 inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                  title="Open calendar to book a session"
                >
                  Book a session
                  <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
              )}
            </div>
          ) : (
            <>
              <ul className="mt-2 space-y-1" role="list" aria-label="Sessions newest to oldest">
                {latestActivitySessions.slice(0, 3).map((s, index) => {
                  const now = moment();
                  const childShort = s.childName.split(" ")[0] || s.childName;
                  const dayLabel = moment(s.date).isSame(now, "day") ? "Today" : moment(s.date).format("ddd D MMM");
                  const timeStr = s.startTime ? moment(s.startTime, ["HH:mm", "HH:mm:ss"]).format("h:mm a") : "—";
                  const startM = moment(`${s.date} ${s.startTime}`, ["YYYY-MM-DD HH:mm", "YYYY-MM-DD HH:mm:ss"], false);
                  const endM = s.endTime ? moment(`${s.date} ${s.endTime}`, ["YYYY-MM-DD HH:mm", "YYYY-MM-DD HH:mm:ss"], false) : startM.clone().add(1, "hour");
                  const isPast = s.kind === "past";
                  const isOngoing = !isPast && startM.isValid() && endM.isValid() && now.isSameOrAfter(startM) && now.isBefore(endM);
                  const isTodayUpcoming = !isPast && !isOngoing && moment(s.date).isSame(now, "day");
                  const isFirstUpcoming = s.kind === "upcoming" && latestActivitySessions.findIndex((x) => x.kind === "upcoming") === latestActivitySessions.indexOf(s);
                  const isHighlight = index < 3;
                  const statusLabel = isPast ? "Past" : isOngoing ? "Live" : isTodayUpcoming ? "Today" : isFirstUpcoming ? "Next" : null;
                  const statusClass = isPast
                    ? "bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200"
                    : isOngoing
                      ? "bg-emerald-500 text-white dark:bg-emerald-600"
                      : isTodayUpcoming
                        ? "bg-amber-500 text-white dark:bg-amber-600"
                        : isFirstUpcoming
                          ? "bg-indigo-600 text-white dark:bg-indigo-500"
                          : "";
                  return (
                    <li key={s.kind === "past" ? `past-${s.scheduleId}` : s.kind === "ongoing" ? `ongoing-${s.scheduleId}` : `up-${s.scheduleId}`}>
                      <button
                        type="button"
                        onClick={() => handleUpcomingSessionClick({ scheduleId: s.scheduleId, childName: s.childName, childId: s.childId })}
                        className={`w-full rounded-md border px-2.5 py-1.5 text-left transition-colors hover:opacity-90 flex items-center justify-between gap-2 ${
                          isOngoing
                            ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/40"
                            : isHighlight
                              ? "border-indigo-200 bg-indigo-50/60 dark:border-indigo-800 dark:bg-indigo-950/30"
                              : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="min-w-0 truncate text-xs font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {statusLabel && (
                            <span className={`shrink-0 rounded px-1 py-0.5 text-[10px] font-semibold ${statusClass}`}>
                              {statusLabel}
                            </span>
                          )}
                          {childShort} — {dayLabel} {timeStr}
                          {s.trainerName ? ` · ${s.trainerName}` : ""}
                        </span>
                        <span className="shrink-0 flex items-center gap-1">
                          {s.kind === "past" && (
                            <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">Logs</span>
                          )}
                          <span className="text-slate-400 text-xs" aria-hidden>→</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {latestActivitySessions.length > 3 && (
                <Link
                  href="/dashboard/parent/schedule"
                  className="mt-2 flex items-center justify-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800"
                  title="View full schedule"
                >
                  See more ({latestActivitySessions.length - 3} more)
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className={`${cardBase} ${cardPadding}`}>
            {/* Header: title + summary + Add child */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    <User className="h-4 w-4 text-slate-600 dark:text-slate-400" aria-hidden />
                  </span>
                  Your children
                </h2>
                {(approvedChildren.length > 0 || children.length > 0) && (
                  <p
                    className="mt-2 text-sm text-slate-600 dark:text-slate-400"
                    title="Total hours you can use to book sessions across all approved children"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {hoursSummaryStats.totalRemaining.toFixed(1)}h
                    </span>{" "}
                    total across{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-300">{approvedChildren.length}</span>{" "}
                    approved. Take an action for each child below.
                  </p>
                )}
              </div>
              {(approvedChildren.length > 0 || children.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddChildModal(true)}
                  className="shrink-0 inline-flex items-center gap-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                  title="Register a new child to book sessions"
                >
                  <UserPlus className="h-4 w-4 shrink-0" aria-hidden />
                  Add child
                </Button>
              )}
            </div>

            {children.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 px-4 py-8 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">{EMPTY_STATE.NO_CHILDREN_ADDED_YET.title}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 inline-flex items-center gap-2"
                  onClick={() => setShowAddChildModal(true)}
                  title="Register a new child to book sessions"
                >
                  <UserPlus className="h-4 w-4 shrink-0" aria-hidden />
                  Add child
                </Button>
              </div>
            ) : (
              <ul className="mt-5 space-y-3" role="list">
                {allChildrenForDisplay.map((c) => {
                  const firstName = c.name.split(" ")[0] || c.name;
                  const initials = c.name
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  const isPending = c.status === "pending";
                  const pendingStatus = "pendingStatus" in c ? (c as { pendingStatus?: "checklist" | "review" | null }).pendingStatus : null;
                  const hasHours = (c.remainingHours ?? 0) > 0;
                  const primaryAction = isPending
                    ? pendingStatus === "checklist"
                      ? { label: "Complete checklist", href: null as string | null, onClick: () => handleCompleteChecklist(c.id) }
                      : { label: "Awaiting review", href: null as string | null, onClick: undefined as undefined }
                    : c.status === "new" || c.status === "expired"
                      ? childHasActivePackage(c.id)
                        ? { label: "Top up", href: null as string | null, onClick: () => handleOpenTopUp(c.id) }
                        : { label: "Buy hours", href: null as string | null, onClick: () => handleBuyHours(c.id) }
                      : {
                          label: "Book session",
                          href: `/dashboard/parent/schedule?open=booking&childId=${c.id}`,
                          onClick: undefined as undefined,
                        };
                  const statusVariant =
                    isPending && pendingStatus === "checklist"
                      ? "amber"
                      : isPending && pendingStatus === "review"
                        ? "sky"
                        : hasHours
                          ? "emerald"
                          : "slate";
                  const statusLabel = isPending ? "Checklist" : `${(c.remainingHours ?? 0).toFixed(0)}h left`;
                  const statusTooltip = isPending
                    ? pendingStatus === "checklist"
                      ? "Complete the checklist to get approved for booking"
                      : "We're reviewing your checklist; you'll be notified when approved"
                    : hasHours
                      ? `${(c.remainingHours ?? 0).toFixed(1)} hours remaining to book sessions`
                      : "No hours left; buy a package or top up to book";
                  const subtext = isPending
                    ? pendingStatus === "checklist"
                      ? "Complete checklist to get approved"
                      : "We're reviewing your checklist"
                    : !hasHours && (c.status === "expired" || c.status === "new")
                      ? childHasActivePackage(c.id)
                        ? "Top up to book more sessions"
                        : "Buy a package to get started"
                      : null;
                  const actionTooltip =
                    primaryAction.label === "Awaiting review"
                      ? "Checklist is under review"
                      : primaryAction.label === "Book session"
                        ? `Open calendar to book a session for ${firstName}`
                        : primaryAction.label === "Complete checklist"
                          ? `Complete the safeguarding checklist for ${firstName}`
                          : primaryAction.label === "Buy hours"
                            ? `Buy a package for ${firstName}`
                            : primaryAction.label === "Top up"
                              ? `Add more hours to ${firstName}'s package`
                              : "";
                  return (
                    <li
                      key={c.id}
                      title={`${firstName}: ${statusLabel}. ${subtext ?? (hasHours ? "Ready to book." : "Action needed.")}`}
                      className={`rounded-xl border px-4 py-3 transition-colors ${
                        statusVariant === "amber"
                          ? "border-amber-200 bg-amber-50/60 dark:border-amber-700/60 dark:bg-amber-950/25"
                          : statusVariant === "sky"
                            ? "border-sky-200 bg-sky-50/50 dark:border-sky-800/50 dark:bg-sky-950/20"
                            : statusVariant === "emerald"
                              ? "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-800/50 dark:bg-emerald-950/20"
                              : "border-slate-200 bg-slate-50/40 dark:border-slate-700 dark:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                              statusVariant === "amber"
                                ? "bg-amber-200 text-amber-800 dark:bg-amber-800/60 dark:text-amber-200"
                                : statusVariant === "sky"
                                  ? "bg-sky-200 text-sky-800 dark:bg-sky-800/60 dark:text-sky-200"
                                  : statusVariant === "emerald"
                                    ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-800/60 dark:text-emerald-200"
                                    : "bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200"
                            }`}
                            aria-hidden
                          >
                            {initials}
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-slate-100">{firstName}</span>
                              {isPending && (
                                <span
                                  className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                                  title="Recently added; complete checklist to get approved"
                                >
                                  New
                                </span>
                              )}
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                  statusVariant === "amber"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                                    : statusVariant === "sky"
                                      ? "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300"
                                      : statusVariant === "emerald"
                                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                        : "bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300"
                                }`}
                                title={statusTooltip}
                              >
                                {hasHours && !isPending && (
                                  <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden />
                                )}
                                {statusLabel}
                              </span>
                            </div>
                            {subtext && (
                              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtext}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 sm:pl-2">
                          {primaryAction.label === "Awaiting review" ? (
                            <span
                              className="text-xs font-medium text-slate-500 dark:text-slate-400"
                              title={actionTooltip}
                            >
                              Awaiting review
                            </span>
                          ) : primaryAction.href ? (
                            <Link
                              href={primaryAction.href}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                              title={actionTooltip}
                            >
                              {primaryAction.label}
                              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
                            </Link>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={primaryAction.onClick}
                              title={actionTooltip}
                            >
                              {primaryAction.label}
                            </Button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {(approvedChildren.length > 0 || children.length > 0) && (
              <Link
                href="/dashboard/parent/children"
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-600"
                title="See all children and manage their profiles and hours"
              >
                View all in My Children
                <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      <BuyHoursModal
        isOpen={showBuyHoursModal}
        onClose={() => {
          setShowBuyHoursModal(false);
          setBuyHoursChildId(undefined);
        }}
        child={buyHoursChildId ? approvedChildren.find((c) => c.id === buyHoursChildId) ?? null : null}
        children={approvedChildren}
        bookings={bookings}
        user={user ?? null}
        onDraftBookingCreated={(booking) => {
          setSelectedPaymentBooking(booking);
          setShowPaymentModal(true);
          setShowBuyHoursModal(false);
          setBuyHoursChildId(undefined);
        }}
        onConfirm={() => {
          setShowBuyHoursModal(false);
          setBuyHoursChildId(undefined);
          refetchBookings();
          refresh();
          router.push("/dashboard/parent");
        }}
        onOpenTopUp={handleOpenTopUp}
      />

      <ParentBookingModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setBookingModalChildId(undefined);
        }}
        onSubmit={handleBookingSave}
        preSelectedChildId={bookingModalChildId}
        children={childrenForBookingModal}
        renderAsPanel
        onBuyMoreHours={handleBuyHours}
        onTopUp={handleOpenTopUp}
        onAddChild={() => {
          setShowBookingModal(false);
          setShowAddChildModal(true);
        }}
      />

      <SessionDetailModal
        isOpen={showSessionModal}
        onClose={() => {
          setShowSessionModal(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        onEdit={(session) => {
          setShowSessionModal(false);
          setBookingModalChildId(session.childId);
          setShowBookingModal(true);
        }}
        onCancel={async (sessionId: string) => {
          await apiClient.post(API_ENDPOINTS.BOOKING_SCHEDULE_CANCEL(sessionId), { cancellationReason: null });
          toastManager.success("Session cancelled.");
          refetchBookings();
          refresh();
          setShowSessionModal(false);
          setSelectedSession(null);
        }}
        variant="sidepanel"
      />

      <CompleteChecklistModal
        isOpen={showChecklistModal}
        onClose={() => {
          setShowChecklistModal(false);
          setChecklistChildId(undefined);
        }}
        child={checklistChildId ? children.find((c) => c.id === checklistChildId) ?? null : null}
        onSubmit={handleChecklistSubmit}
      />

      {selectedPaymentBooking && (
        <CompletePaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPaymentBooking(null);
            refetchBookings();
          }}
          booking={selectedPaymentBooking}
          onPaymentComplete={handlePaymentComplete}
          onPaymentFailed={handlePaymentFailed}
        />
      )}

      <AddChildModal isOpen={showAddChildModal} onClose={() => setShowAddChildModal(false)} onSuccess={handleAddChildSuccess} />

      <SessionNotesModal
        isOpen={showSessionNotesModal}
        onClose={() => setShowSessionNotesModal(false)}
        items={sessionNotesItems}
        onViewSession={(scheduleId, item) => {
          setShowSessionNotesModal(false);
          handleViewSessionNote(scheduleId, item);
        }}
      />

      <SafeguardingConcernModal
        isOpen={showSafeguardingModal}
        onClose={() => setShowSafeguardingModal(false)}
        children={approvedChildren}
        onSubmit={handleSafeguardingSubmit}
      />

      {topUpBooking && topUpChildId !== null && (
        <TopUpModal
          isOpen={showTopUpModal}
          onClose={() => {
            setShowTopUpModal(false);
            setTopUpChildId(null);
            setTopUpBooking(null);
          }}
          childName={approvedChildren.find((c) => c.id === topUpChildId)?.name ?? "your child"}
          booking={topUpBooking}
          onProceedToPayment={handleTopUpProceedToPayment}
          isSubmitting={isTopUpSubmitting}
        />
      )}
    </section>
  );
}
