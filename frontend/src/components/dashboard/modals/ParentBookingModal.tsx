'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Calendar, Clock, User, FileText, Loader2, Activity, Search, AlertTriangle, X, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import moment from 'moment';
import Button from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/Modal';
import { BOOKING_VALIDATION_MESSAGES, getMessageForDateReason, meetsMinimumDuration, formatDurationDisplay, formatActivityDurationDisplay, getHoursNeededForMinimum, toWholeActivityHours } from '@/utils/bookingValidationMessages';
import { getDateBookingStatus, getEarliestBookableDate, isTomorrowBookable } from '@/utils/bookingCutoffRules';
import { useActivities } from '@/interfaces/web/hooks/activities/useActivities';
import { MIN_DURATION_HOURS } from '@/utils/bookingConstants';
import { ListRowsSkeleton } from '@/components/ui/Skeleton';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';
import { parseCustomActivityFromNotes, parseAllCustomActivitiesFromNotes, removeCustomActivityFromNotes, normaliseNotesFromApi } from '@/utils/activitySelectionUtils';
import { toastManager } from '@/utils/toast';
import { getApiErrorMessage } from '@/utils/errorUtils';
import { ROUTES } from '@/utils/routes';
import { TIME_FORMAT_24H } from '@/utils/appConstants';
import { BOOKING_STATUS, PAYMENT_STATUS } from '@/utils/dashboardConstants';
import type { BookingDTO } from '@/core/application/booking/dto/BookingDTO';
import type { FC } from 'react';

const CustomActivityInlineEditor: FC<{
  /** Remaining capacity in hours (sessionCap - sessionDuration). Never pass raw maxAvailableDuration here. */
  remainingCapacity: number;
  onAdd: (name: string, duration: number) => void;
}> = ({ remainingCapacity, onAdd }) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState<number | ''>('');

  const minHours = 1;
  const hasRemainingCapacity = remainingCapacity >= minHours;
  const maxHours = hasRemainingCapacity ? Math.max(minHours, Math.floor(remainingCapacity)) : minHours;

  const handleAdd = () => {
    if (!hasRemainingCapacity || !name.trim() || !duration || duration <= 0) {
      return;
    }
    onAdd(name.trim(), duration);
    setName('');
    setDuration('');
  };

  const { PLACEHOLDER, HOURS_LABEL, REMAINING_MESSAGE, NO_REMAINING_MESSAGE, ADD_BUTTON } = EMPTY_STATE.CUSTOM_ACTIVITY_SECTION;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={PLACEHOLDER}
          className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          aria-label="Custom activity name"
        />
        <select
          value={duration === '' ? '' : duration}
          onChange={(e) => setDuration(e.target.value ? parseFloat(e.target.value) : '')}
          className="w-28 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          disabled={!hasRemainingCapacity}
          aria-label={HOURS_LABEL}
        >
          <option value="">{HOURS_LABEL}</option>
          {hasRemainingCapacity &&
            Array.from({ length: maxHours - minHours + 1 }, (_, i) => i + minHours).map((h) => (
              <option key={h} value={h}>
                {h} {h === 1 ? 'hour' : 'hours'}
              </option>
            ))}
        </select>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        {hasRemainingCapacity ? (
          <p className="text-2xs text-gray-600 order-2 sm:order-1">
            {REMAINING_MESSAGE}
          </p>
        ) : (
          <p className="text-2xs text-amber-600 order-2 sm:order-1">
            {NO_REMAINING_MESSAGE}
          </p>
        )}
        <button
          type="button"
          onClick={handleAdd}
          className="text-sm font-semibold text-purple-700 hover:text-purple-900 disabled:opacity-40 order-1 sm:order-2 shrink-0"
          disabled={!hasRemainingCapacity || !name.trim() || !duration}
        >
          {ADD_BUTTON}
        </button>
      </div>
    </div>
  );
};

interface ChildDTO {
  id: number;
  name: string;
  activePackages?: Array<{
    id: number;
    remainingHours: number;
    totalHours: number;
  }>;
  [key: string]: any;
}

interface ParentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Form submit handler. Required — modal cannot function without it. */
  onSubmit: (bookingData: ParentBookingFormData) => Promise<void>;
  /** @deprecated Use onSubmit. Kept for backward compatibility. */
  onSave?: (bookingData: ParentBookingFormData) => Promise<void>;
  preSelectedDate?: string; // YYYY-MM-DD format
  preSelectedTime?: string; // HH:mm format - from day view time slot
  preSelectedChildId?: number;
  children: ChildDTO[];
  existingBooking?: {
    scheduleId: string | undefined;
    date: string;
    startTime: string;
    endTime: string;
    childId: number;
    activities?: string[]; // Activity names from the existing session
    notes?: string;
    location?: string;
  };
  clickPosition?: { x: number; y: number }; // Optional: Position where user clicked (for smart positioning)
  /** When provided, shows "Buy hours" when child has no package so parent can open Buy Hours modal */
  onBuyMoreHours?: (childId: number) => void;
  /** When provided, shows "Top up" when child has a package but 0h left so parent can open Top-up flow */
  onTopUp?: (childId: number) => void;
  /** When provided and there are no approved children, "Add child" opens this (e.g. dashboard Add Child modal). When not provided, we link to dashboard to add a child there. */
  onAddChild?: () => void;
  /** Children who need to complete their checklist. When set and no approved children, show "Complete checklist" instead of "Add child". */
  childrenNeedingChecklist?: { id: number; name: string }[];
  /** Children whose checklist is submitted and awaiting admin review. When set and no approved children, show "We're reviewing" instead of "Add child". */
  childrenAwaitingChecklistReview?: { id: number; name: string }[];
  /** All children still pending approval (any reason). When set with no checklist action needed, show "We're reviewing". */
  childrenPendingApproval?: { id: number; name: string }[];
  /** Open the Complete Checklist flow for a specific child. Used when no approved children but childrenNeedingChecklist is set. */
  onCompleteChecklist?: (childId: number) => void;
  /** When true, render as a right-side slide-over panel instead of a modal (dashboard sidebar pattern) */
  renderAsPanel?: boolean;
  /** Parent's bookings: used to disable time slots already booked for the selected child on the selected date (avoid double-booking same slot) */
  bookings?: BookingDTO[];
}

export interface ParentBookingFormData {
  date: string;
  childId: number;
  startTime: string;
  activitySelectionType: 'package_activity' | 'trainer_choice' | 'custom';
  selectedActivityIds?: number[]; // Multiple activities can be selected (was selectedActivityId)
  customActivityName?: string; // Legacy single custom activity name (kept for backwards compatibility)
  customActivities?: { name: string; duration: number }[]; // New: multiple custom activities with durations
  duration?: number; // Duration in hours (for trainer_choice and custom - allows 3-24 hours)
  notes?: string;
  location?: string;
}

/**
 * Parent Booking Modal Component
 * 
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Lightweight booking form for parents (modal-based, Google Calendar-style)
 * Location: frontend/src/components/dashboard/modals/ParentBookingModal.tsx
 * 
 * Features:
 * - Modal width: md (matches ->modalWidth('md') requirement)
 * - Date pre-filled from calendar click
 * - Child selection (limited to parent's approved children)
 * - Activity Start Time picker (only times 24+ hours from now)
 * - Activity Selection (Choose from Available Activities from DATABASE, Let Trainer Choose, Custom Activity)
 * - Optional notes field (collapsed by default)
 * - Progressive disclosure (minimal fields, expand for more)
 * - Database-Driven: Activities loaded from activities table via API
 * - Hybrid Search: Autocomplete search for 500+ activities
 * - 3-24 Hour Rule: Only shows activities with valid duration
 */
export default function ParentBookingModal({
  isOpen,
  onClose,
  onSubmit: onSubmitProp,
  onSave: onSaveLegacy,
  preSelectedDate,
  preSelectedTime,
  preSelectedChildId,
  children,
  existingBooking,
  clickPosition,
  onBuyMoreHours,
  onTopUp,
  onAddChild,
  childrenNeedingChecklist,
  childrenAwaitingChecklistReview,
  childrenPendingApproval,
  onCompleteChecklist,
  renderAsPanel = false,
  bookings = [],
}: ParentBookingModalProps) {
  /** Submit handler: required onSubmit takes precedence; fallback to deprecated onSave for backward compat. */
  const handleSubmitCallback = onSubmitProp ?? onSaveLegacy;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [activitySearch, setActivitySearch] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const childSelectRef = useRef<HTMLSelectElement>(null);
  const parentModeSectionRef = useRef<HTMLDivElement | null>(null);
  const trainerModeSectionRef = useRef<HTMLDivElement | null>(null);
  const hasUserChosenSelectionModeRef = useRef(false);
  const [showStandardSection, setShowStandardSection] = useState(true);
  const [customPopoverOpen, setCustomPopoverOpen] = useState(false);
  const customActivityTriggerRef = useRef<HTMLButtonElement>(null);
  const [dismissedHints, setDismissedHints] = useState<Record<string, boolean>>({});
  /** When true, show the date input in the sticky section (otherwise only the compact "Booking: date · child" line is visible). */
  const [showDateInput, setShowDateInput] = useState(false);
  /** When true, show the child select in the sticky section. Also true when no child selected so parent can pick. */
  const [showChildSelect, setShowChildSelect] = useState(false);
  /** When true, show the Activity Start Time dropdown. Hidden when a time is selected (user can click compact time to expand). */
  const [showTimeSelect, setShowTimeSelect] = useState(false);
  const timeSelectRef = useRef<HTMLSelectElement>(null);
  const panelCloseButtonRef = useRef<HTMLButtonElement>(null);

  // Selection mode for parent/trainer control over activities:
  // - 'all_parent'  → Parent specifies activities for the full duration
  // - 'all_trainer' → Trainer specifies everything (no activity selection required)
  type SelectionMode = 'all_parent' | 'all_trainer';
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('all_trainer');
  
  // Fetch activities from database (activities table)
  const { activities: databaseActivities, loading: loadingActivities, error: activitiesError } = useActivities();
  

  // Form state
  const defaultDate = preSelectedDate || moment().add(1, 'day').format('YYYY-MM-DD');
  const [formData, setFormData] = useState<ParentBookingFormData>({
    date: defaultDate,
    childId: preSelectedChildId || 0, // No child selected by default (user must choose)
    startTime: preSelectedTime || '', // No time selected by default (user must choose)
    activitySelectionType: 'trainer_choice', // Default: Let Trainer Choose
    selectedActivityIds: [], // Multiple activities
    customActivities: [],
    duration: MIN_DURATION_HOURS, // Default duration uses constant (minimum business rule)
    notes: existingBooking?.notes || '',
  });

  // Get available activities from DATABASE (activities table)
  const availableActivities = useMemo(() => {
    return databaseActivities.map(act => ({
      id: typeof act.id === 'string' ? parseInt(act.id, 10) : act.id,
      name: act.name,
      duration: act.duration || MIN_DURATION_HOURS, // Use constant instead of hardcoded value
      category: act.category,
    }));
  }, [databaseActivities]);

  // Filter activities based on search only (show ALL durations)
  const filteredActivities = useMemo(() => {
    let filtered = availableActivities;
    
    // Apply search filter
    if (activitySearch.trim()) {
      const searchLower = activitySearch.toLowerCase();
      filtered = filtered.filter(act => 
        act.name.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [availableActivities, activitySearch]);

  // Get remaining hours for selected child. Never return 24 as fallback – only use real data so we never allow more than child has.
  const selectedChildRemainingHours = useMemo(() => {
    if (!formData.childId) return 0; // No child selected → cap 0 so we don't allow adding activities until child is chosen
    const child = children.find(c => c.id === formData.childId);
    if (!child?.activePackages || child.activePackages.length === 0) return 0; // No package → cap 0
    const raw = child.activePackages[0].remainingHours;
    const remaining = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(remaining) && remaining >= 0 ? remaining : 0;
  }, [formData.childId, children]);

  const selectedChildHasNoHours = selectedChildRemainingHours < MIN_DURATION_HOURS && formData.childId !== 0;

  /** Business rule: has package (confirmed+paid with totalHours > 0) → "Top up"; no package → "Buy hours". */
  const selectedChildHasPackage = useMemo(() => {
    if (!formData.childId) return false;
    const child = children.find((c) => c.id === formData.childId);
    const pkg = child?.activePackages?.[0];
    return Boolean(pkg && (pkg.totalHours ?? 0) > 0);
  }, [formData.childId, children]);
  const selectedChildNeedsTopUp = selectedChildHasNoHours && selectedChildHasPackage;
  const selectedChildNeedsBuyHours = selectedChildHasNoHours && !selectedChildHasPackage;

  // Calculate maximum available duration based on selected date and time
  // Business Rule: Sessions must end by 11:59 PM (23:59) on the selected day
  // Maximum duration = 23:59 - start time
  const maxAvailableDuration = useMemo(() => {
    if (!formData.date || !formData.startTime) {
      // If no date/time selected, return the minimum of remaining hours or 24
      return Math.min(24, Math.floor(selectedChildRemainingHours));
    }

    const startDateTime = moment(`${formData.date} ${formData.startTime}`, 'YYYY-MM-DD HH:mm');
    if (!startDateTime.isValid()) {
      return Math.min(24, Math.floor(selectedChildRemainingHours));
    }

    // Calculate end of day (23:59:59) on the selected date
    const endOfDay = startDateTime.clone().endOf('day'); // 23:59:59.999
    
    // Calculate maximum duration in hours (from start time to end of day)
    const maxDurationHours = endOfDay.diff(startDateTime, 'hours', true);

    // Round down to nearest half hour (since we use 30-minute intervals)
    const maxDurationRounded = Math.floor(maxDurationHours * 2) / 2;

    // Cap at remaining hours and 24 hours maximum, but preserve half‑hour precision
    const cappedByRemaining = Math.min(maxDurationRounded, selectedChildRemainingHours);
    const cappedBy24 = Math.min(cappedByRemaining, 24);

    // Ensure minimum is at least MIN_DURATION_HOURS
    return Math.max(MIN_DURATION_HOURS, cappedBy24);
  }, [formData.date, formData.startTime, selectedChildRemainingHours]);

  // ─── SESSION CAP: SINGLE SOURCE OF TRUTH (do not reintroduce the "8h shown when child has 6h" bug) ───
  // All session-limit logic MUST use sessionCap only. Never use maxAvailableDuration for:
  // display ("max X", "X left for this session"), validation (isDurationValid), or activity disabling.
  // sessionCap = min(time until 11:59 PM, child's remaining hours) so we never show or allow more than the child has.
  const sessionCap = useMemo(
    () => Math.min(maxAvailableDuration, selectedChildRemainingHours),
    [maxAvailableDuration, selectedChildRemainingHours]
  );

  // Effective cap: NEVER allow selecting more than the child's remaining hours (focused view / any view).
  // Use this for all UI limits (duration dropdown max, activity disable, trim) so we never offer > remaining.
  const hoursCap = useMemo(
    () => Math.min(sessionCap, selectedChildRemainingHours),
    [sessionCap, selectedChildRemainingHours]
  );

  // Enforce cap: whenever selection total exceeds child's hours, trim immediately (simple: child has Xh → max Xh)
  useEffect(() => {
    if (!isOpen || formData.childId === undefined) return;

    const ids = formData.selectedActivityIds || [];
    const custom = formData.customActivities || [];
    let dbDuration = ids.reduce((t, id) => {
      const a = availableActivities.find((ax) => ax.id === id);
      return t + (a?.duration ?? 0);
    }, 0);
    let customDuration = custom.reduce((t, c) => t + (c.duration ?? 0), 0);
    let total = dbDuration + customDuration;
    if (total <= hoursCap) return;

    // Trim: remove from end until total <= hoursCap (custom first, then standard)
    let newCustom = [...custom];
    let newIds = [...ids];
    while (total > hoursCap && newCustom.length > 0) {
      const removed = newCustom.pop()!;
      customDuration -= removed.duration ?? 0;
      total = dbDuration + customDuration;
    }
    while (total > hoursCap && newIds.length > 0) {
      const removedId = newIds.pop()!;
      const a = availableActivities.find((ax) => ax.id === removedId);
      dbDuration -= a?.duration ?? 0;
      total = dbDuration + customDuration;
    }
    setFormData((prev) => ({
      ...prev,
      selectedActivityIds: newIds,
      customActivities: newCustom,
    }));
  }, [isOpen, formData.childId, hoursCap, availableActivities, formData.selectedActivityIds, formData.customActivities]);

  // Reset dismissed hints and expand state when modal closes so they show again next open
  useEffect(() => {
    if (!isOpen) {
      hasUserChosenSelectionModeRef.current = false;
      setDismissedHints({});
      setShowDateInput(false);
      setShowChildSelect(false);
      setShowTimeSelect(false);
      setCustomPopoverOpen(false);
      return;
    }
  }, [isOpen]);

  // Position for "Add your own activity" popover (anchored to + button, kept in viewport)
  const POPOVER_WIDTH = 320;
  const POPOVER_OFFSET = 8;
  const VIEWPORT_PAD = 16;
  const [customPopoverPosition, setCustomPopoverPosition] = useState<{ top: number; left: number } | null>(null);

  const computePopoverPosition = useCallback(() => {
    const el = customActivityTriggerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    let left = rect.left;
    const maxLeft = typeof window !== 'undefined' ? window.innerWidth - POPOVER_WIDTH - VIEWPORT_PAD : left;
    if (left + POPOVER_WIDTH > (typeof window !== 'undefined' ? window.innerWidth : 0) - VIEWPORT_PAD) {
      left = Math.max(VIEWPORT_PAD, rect.right - POPOVER_WIDTH);
    } else {
      left = Math.max(VIEWPORT_PAD, Math.min(left, maxLeft));
    }
    let top = rect.bottom + POPOVER_OFFSET;
    const maxTop = typeof window !== 'undefined' ? window.innerHeight - VIEWPORT_PAD : top + 400;
    if (top + 400 > maxTop) {
      top = Math.max(VIEWPORT_PAD, rect.top - 400 - POPOVER_OFFSET);
    }
    return { top, left };
  }, []);

  useEffect(() => {
    if (!customPopoverOpen) {
      setCustomPopoverPosition(null);
      return;
    }
    setCustomPopoverPosition(computePopoverPosition());
  }, [customPopoverOpen, computePopoverPosition]);

  useEffect(() => {
    if (!customPopoverOpen) return;
    const updatePosition = () => {
      const pos = computePopoverPosition();
      if (pos) setCustomPopoverPosition(pos);
    };
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [customPopoverOpen, computePopoverPosition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && customPopoverOpen) setCustomPopoverOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [customPopoverOpen]);

  // When opening as panel, focus the close button so the first form control (e.g. radio) doesn’t get focus and show a heavy border
  useEffect(() => {
    if (isOpen && renderAsPanel) {
      const t = setTimeout(() => panelCloseButtonRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [isOpen, renderAsPanel]);

  // Derive a sensible initial selection mode whenever the modal is (re)opened
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // If the parent has explicitly chosen any mode, do not override it
    // when formData changes (e.g. as they add/remove activities).
    if (hasUserChosenSelectionModeRef.current) {
      return;
    }

    // If trainer_choice with no explicit activities/custom, treat as "trainer chooses everything"
    if (
      formData.activitySelectionType === 'trainer_choice' &&
      (!formData.selectedActivityIds || formData.selectedActivityIds.length === 0) &&
      !formData.customActivityName
    ) {
      setSelectionMode('all_trainer');
      return;
    }

    // Otherwise default to "parent chooses all" – parents are specifying activities
    setSelectionMode('all_parent');
  }, [
    isOpen,
    formData.activitySelectionType,
    formData.selectedActivityIds,
    formData.customActivityName,
  ]);

  const handleSelectionModeChange = (mode: SelectionMode) => {
    hasUserChosenSelectionModeRef.current = true;
    setSelectionMode(mode);

    if (mode === 'all_trainer') {
      // Trainer fully in control – clear parent-specified activities/custom
      setFormData(prev => ({
        ...prev,
        activitySelectionType: 'trainer_choice',
        selectedActivityIds: [],
        customActivityName: undefined,
        // Keep duration as-is (parents may have already chosen it)
      }));
    } else {
      // Parent is specifying at least some activities
      setFormData(prev => {
        // If we were previously in trainer_choice with no activities,
        // move to package_activity by default so the UI behaves intuitively.
        if (
          prev.activitySelectionType === 'trainer_choice' &&
          (!prev.selectedActivityIds || prev.selectedActivityIds.length === 0) &&
          !prev.customActivityName
        ) {
          return {
            ...prev,
            activitySelectionType: 'package_activity',
          };
        }
        return prev;
      });
    }
  };

  // Scroll relevant section into view when parent switches mode
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const scrollOptions: ScrollIntoViewOptions = {
      behavior: 'smooth',
      block: 'start',
    };

    if (selectionMode === 'all_trainer' && trainerModeSectionRef.current) {
      trainerModeSectionRef.current.scrollIntoView(scrollOptions);
    } else if (selectionMode !== 'all_trainer' && parentModeSectionRef.current) {
      parentModeSectionRef.current.scrollIntoView(scrollOptions);
    }
  }, [selectionMode, isOpen]);

  // Calculate session duration and end time based on activity selection
  const sessionDuration = useMemo(() => {
    const selectedIds = formData.selectedActivityIds || [];
    const customActivities = formData.customActivities || [];

    // Duration from database-backed activities
    const dbDuration = selectedIds.reduce((total, activityId) => {
      const activity = availableActivities.find(a => a.id === activityId);
      return total + (activity?.duration || 0);
    }, 0);

    // Duration from custom activities
    const customDuration = customActivities.reduce((total, custom) => {
      return total + (custom.duration || 0);
    }, 0);

    const combined = dbDuration + customDuration;
    if (combined > 0) {
      return combined;
    }

    // In package_activity mode with nothing selected, use 0 so the activity list is re-enabled (no cap blocking all checkboxes)
    if (formData.activitySelectionType === 'package_activity') {
      return 0;
    }

    // Fallback: for trainer_choice or legacy custom, use selected duration (defaults to minimum)
    return formData.duration || MIN_DURATION_HOURS;
  }, [formData.selectedActivityIds, formData.customActivities, formData.duration, formData.activitySelectionType, availableActivities]);

  // Display total using whole hours so summary matches activity chips (e.g. 0.8h activity shows "1h" chip → total "1h" not "0.8h")
  const sessionDurationForDisplay = useMemo(() => {
    const selectedIds = formData.selectedActivityIds || [];
    const customActivities = formData.customActivities || [];
    const dbDisplay = selectedIds.reduce((total, activityId) => {
      const activity = availableActivities.find(a => a.id === activityId);
      return total + (activity != null ? toWholeActivityHours(activity.duration) : 0);
    }, 0);
    const customDisplay = customActivities.reduce((total, custom) => total + toWholeActivityHours(custom.duration || 0), 0);
    const combined = dbDisplay + customDisplay;
    if (combined > 0) return combined;
    return sessionDuration;
  }, [formData.selectedActivityIds, formData.customActivities, availableActivities, sessionDuration]);

  // Session duration valid: at least MIN_DURATION_HOURS and never above child's hours (single source of truth).
  const isDurationValid = useMemo(() => {
    if (sessionDuration < MIN_DURATION_HOURS) return false;
    return sessionDuration <= hoursCap;
  }, [sessionDuration, hoursCap]);

  // Check if selected time is at least 24 hours away
  // Exception: In edit mode, the existing session's time is always valid
  // After 6:00 PM today, booking for exactly tomorrow is not allowed
  const isTimeValid = useMemo(() => {
    if (!formData.date || !formData.startTime) return false;

    // In edit mode, existing time is always valid (session already exists)
    const isEditMode = !!existingBooking;
    // ✅ CRITICAL: Normalise to HH:mm format for comparison (API may return HH:mm:ss)
    const existingStartTime = existingBooking?.startTime
      ? moment(existingBooking.startTime, ['HH:mm', 'HH:mm:ss']).format('HH:mm')
      : undefined;
    const existingDate = existingBooking?.date;
    if (isEditMode && formData.startTime === existingStartTime && formData.date === existingDate) {
      return true; // Existing session time is always valid
    }

    const now = moment();
    const selectedDateMoment = moment(formData.date, 'YYYY-MM-DD').startOf('day');
    const isTomorrow = selectedDateMoment.isSame(now.clone().add(1, 'day'), 'day');
    if (isTomorrow && !isTomorrowBookable(now)) {
      return false; // After 6 PM today, tomorrow is no longer bookable
    }

    const selectedDateTime = moment(`${formData.date} ${formData.startTime}`, 'YYYY-MM-DD HH:mm');
    const minBookingTime = now.clone().add(24, 'hours');
    // Allow "at least 24 hours" to include exactly 24h (matches backend; e.g. book at 29 Jan 8:44 PM for 30 Jan 8:44 PM)
    return !selectedDateTime.isBefore(minBookingTime);
  }, [formData.date, formData.startTime, existingBooking]);

  /** True when selected date is not bookable (e.g. tomorrow after 6 PM). Use central rule so messages stay in sync. */
  const dateBookingStatus = useMemo(() => {
    if (!formData.date) return { bookable: true as boolean, reason: undefined as string | undefined };
    const status = getDateBookingStatus(formData.date);
    return { bookable: status.bookable, reason: status.reason };
  }, [formData.date]);

  const sessionEndTime = useMemo(() => {
    if (!formData.startTime || !formData.date) {
      return { time: '', display: '', isNextDay: false };
    }
    // Use the selected date to properly calculate end time (handles multi-day sessions)
    const startDateTime = moment(`${formData.date} ${formData.startTime}`, 'YYYY-MM-DD HH:mm');
    const endDateTime = startDateTime.clone().add(sessionDuration, 'hours');
    const isNextDay = !endDateTime.isSame(startDateTime, 'day');
    return {
      time: endDateTime.format('HH:mm'),
      display: endDateTime.format('HH:mm'),
      isNextDay,
    };
  }, [formData.startTime, formData.date, sessionDuration]);

  // Booked time ranges for the selected child on the selected date (so we can disable those slots and avoid double-booking)
  // Excludes the session being edited (existingBooking) so the current slot stays selectable when rescheduling
  const bookedRangesOnSelectedDate = useMemo(() => {
    const childId = formData.childId;
    if (!childId || !formData.date || !bookings.length) return [];
    const dateStr = moment(formData.date, 'YYYY-MM-DD').format('YYYY-MM-DD');
    const ranges: Array<{ startTime: string; endTime: string }> = [];
    const confirmedPaid = bookings.filter(
      (b) => b.status === BOOKING_STATUS.CONFIRMED && b.paymentStatus === PAYMENT_STATUS.PAID
    );
    const existingScheduleId = existingBooking?.scheduleId;
    confirmedPaid.forEach((booking) => {
      const hasChild = booking.participants?.some((p) => p.childId === childId);
      if (!hasChild) return;
      (booking.schedules ?? []).forEach((schedule) => {
        if (existingScheduleId && (schedule.id ?? (schedule as { scheduleId?: string }).scheduleId) === existingScheduleId) return;
        const sDate =
          typeof schedule.date === 'string'
            ? moment(schedule.date, 'YYYY-MM-DD').format('YYYY-MM-DD')
            : moment(schedule.date).format('YYYY-MM-DD');
        if (sDate !== dateStr) return;
        const rawStart =
          schedule.startTime ?? (schedule as { start_time?: string }).start_time ?? '';
        const rawEnd =
          schedule.endTime ?? (schedule as { end_time?: string }).end_time ?? '';
        if (!rawStart || !rawEnd) return;
        const startTime = moment(rawStart, ['HH:mm', 'HH:mm:ss']).format('HH:mm');
        const endTime = moment(rawEnd, ['HH:mm', 'HH:mm:ss']).format('HH:mm');
        ranges.push({ startTime, endTime });
      });
    });
    return ranges;
  }, [bookings, formData.childId, formData.date, existingBooking]);

  // Helper: does a session starting at slotTime overlap any booked range? (session from slot to end of day)
  const slotOverlapsBooked = useCallback(
    (slotTime: string) => {
      if (bookedRangesOnSelectedDate.length === 0 || !formData.date) return false;
      const slotStartM = moment(`${formData.date} ${slotTime}`, 'YYYY-MM-DD HH:mm');
      const slotEndM = slotStartM.clone().endOf('day');
      return bookedRangesOnSelectedDate.some(({ startTime, endTime }) => {
        const startM = moment(`${formData.date} ${startTime}`, 'YYYY-MM-DD HH:mm');
        const endM = moment(`${formData.date} ${endTime}`, 'YYYY-MM-DD HH:mm');
        return slotStartM.isBefore(endM) && slotEndM.isAfter(startM);
      });
    },
    [bookedRangesOnSelectedDate, formData.date]
  );

  // Get available time slots (30-minute intervals, 24 hours)
  // In edit mode, always include the existing session's start time
  // Slots that overlap an existing booking for this child on this date are disabled
  const availableTimeSlots = useMemo(() => {
    // Get the existing session's start time (for edit mode)
    // ✅ CRITICAL: Normalise to HH:mm format (API may return HH:mm:ss)
    const existingStartTime = existingBooking?.startTime 
      ? moment(existingBooking.startTime, ['HH:mm', 'HH:mm:ss']).format('HH:mm')
      : undefined;
    const isEditMode = !!existingBooking;
    
    // If no date is selected, show all times as disabled with helpful message
    if (!formData.date) {
      const allTimeSlots: string[] = [];
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          allTimeSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        }
      }
      return allTimeSlots.map(time => ({ time, disabled: true }));
    }

    const now = moment();
    const minBookingTime = now.clone().add(24, 'hours');
    const selectedDate = moment(formData.date, 'YYYY-MM-DD');
    
    // Validate date is valid
    if (!selectedDate.isValid()) {
      const allTimeSlots: string[] = [];
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          allTimeSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        }
      }
      return allTimeSlots.map(time => ({ time, disabled: true }));
    }
    
    // Generate all 24 hours in 30-minute intervals (00:00 to 23:30)
    const allTimeSlots: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        allTimeSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }

    // Check if selected date is today or tomorrow (needs filtering)
    const today = now.clone().startOf('day');
    const tomorrow = today.clone().add(1, 'day');
    const selectedDateStart = selectedDate.clone().startOf('day');
    
    const isToday = selectedDateStart.isSame(today, 'day');
    const isTomorrow = selectedDateStart.isSame(tomorrow, 'day');

    if (isToday) {
      // Today: all times are unavailable (can't book same day)
      // Exception: In edit mode, the existing start time is always available
      return allTimeSlots.map(time => {
        const isExistingTime = isEditMode && time === existingStartTime;
        const disabled = !isExistingTime || slotOverlapsBooked(time);
        return { time, disabled };
      });
    }

    if (isTomorrow) {
      // After 6:00 PM today, tomorrow is no longer bookable at all
      if (!isTomorrowBookable(moment())) {
        return allTimeSlots.map(time => {
          const isExistingTime = isEditMode && time === existingStartTime;
          const disabled = !isExistingTime || slotOverlapsBooked(time);
          return { time, disabled };
        });
      }
      // Tomorrow before 6 PM: times that are at least 24 hours away; also disable slots already booked for this child
      return allTimeSlots.map(time => {
        const timeMoment = moment(`${formData.date} ${time}`, 'YYYY-MM-DD HH:mm');
        const isAvailable = !timeMoment.isBefore(minBookingTime);
        const isExistingTime = isEditMode && time === existingStartTime;
        const disabled = (!isAvailable || slotOverlapsBooked(time)) && !isExistingTime;
        return { time, disabled };
      });
    }

    // For dates beyond tomorrow: disable slots that overlap existing bookings for this child on this date
    return allTimeSlots.map(time => {
      const isExistingTime = isEditMode && time === existingStartTime;
      const disabled = !isExistingTime && slotOverlapsBooked(time);
      return { time, disabled };
    });
  }, [formData.date, existingBooking, slotOverlapsBooked]);


  // Initialize form when modal opens OR when key props change
  // This ensures the form updates when clicking different dates or editing different sessions
  useEffect(() => {
    if (!isOpen) return; // Don't initialize when modal is closed
    
    // Determine the correct date to use (priority: existingBooking > preSelectedDate > tomorrow)
    // ✅ FIX: Prioritise existingBooking.date when editing to ensure date persists correctly
    let initialDate: string;
    if (existingBooking?.date && moment(existingBooking.date, 'YYYY-MM-DD', true).isValid()) {
      // Editing existing session - use the session's date
      initialDate = existingBooking.date;
    } else if (preSelectedDate && moment(preSelectedDate, 'YYYY-MM-DD', true).isValid()) {
      // Pre-selected date from calendar click — use only if it's bookable (e.g. after 6 PM tomorrow is disabled)
      const status = getDateBookingStatus(preSelectedDate);
      initialDate = status.bookable ? preSelectedDate : getEarliestBookableDate();
    } else {
      // Earliest bookable date: tomorrow before 6 PM, day after tomorrow from 6 PM today
      initialDate = getEarliestBookableDate();
    }
    
    // Initialize form data
    const initialData: ParentBookingFormData = {
      date: initialDate,
      childId: preSelectedChildId || 0,
      startTime: preSelectedTime || '', // No time selected by default (user must choose)
      activitySelectionType: 'trainer_choice',
      selectedActivityIds: [],
      customActivities: [],
      duration: MIN_DURATION_HOURS, // Use constant instead of hardcoded value
      notes: '',
    };

    // If editing existing booking, populate from existingBooking
    if (existingBooking) {
      // Date is already set above with proper validation
      initialData.childId = existingBooking.childId;
      // ✅ CRITICAL: Normalise startTime to HH:mm format (API may return HH:mm:ss)
      // The dropdown options use HH:mm format, so we must match that format
      initialData.startTime = moment(existingBooking.startTime, ['HH:mm', 'HH:mm:ss']).format('HH:mm');
      
      // Calculate duration from existing booking's start and end times
      // ✅ Use flexible format parsing (API may return HH:mm or HH:mm:ss)
      const startMoment = moment(existingBooking.startTime, ['HH:mm', 'HH:mm:ss']);
      const endMoment = moment(existingBooking.endTime, ['HH:mm', 'HH:mm:ss']);
      let calculatedDuration = endMoment.diff(startMoment, 'hours', true);
      // Handle sessions that span to next day
      if (calculatedDuration <= 0) {
        calculatedDuration += 24;
      }
      
      // API may send itinerary_notes as JSON array; normalise to newline-separated so custom activities parse into activities, not notes
      const notes = normaliseNotesFromApi(existingBooking.notes || '');
      // Pre-fill database activities by matching names to IDs
      const matchedActivityIds = (existingBooking.activities && existingBooking.activities.length > 0)
        ? availableActivities
            .filter(dbActivity => existingBooking.activities?.includes(dbActivity.name))
            .map(dbActivity => dbActivity.id)
        : [];
      // Parse custom activity/activities from notes (e.g. "Custom Activity: baking (3h)") into activities section
      const customActivitiesFromNotes = parseAllCustomActivitiesFromNotes(notes);
      const hasCustomInNotes = customActivitiesFromNotes.length > 0;

      if (matchedActivityIds.length > 0 || hasCustomInNotes) {
        // Session has database activities and/or custom – show both in package_activity mode
        initialData.activitySelectionType = 'package_activity';
        initialData.selectedActivityIds = matchedActivityIds;
        if (hasCustomInNotes) {
          initialData.customActivities = customActivitiesFromNotes;
        }
        initialData.notes = removeCustomActivityFromNotes(notes);
        setShowNotes(!!initialData.notes);
      } else {
        // Legacy: only custom activity in notes (no database activities)
        const customActivity = parseCustomActivityFromNotes(notes);
        if (customActivity) {
          initialData.activitySelectionType = 'custom';
          initialData.customActivityName = customActivity;
          initialData.duration = Math.max(MIN_DURATION_HOURS, Math.min(24, calculatedDuration));
          initialData.notes = removeCustomActivityFromNotes(notes);
          setShowNotes(!!initialData.notes);
        } else {
          initialData.activitySelectionType = 'trainer_choice';
          initialData.duration = Math.max(MIN_DURATION_HOURS, Math.min(24, calculatedDuration));
        initialData.notes = notes;
        setShowNotes(!!notes);
        }
      }
    }

    setFormData(initialData);
  }, [isOpen, preSelectedDate, preSelectedTime, preSelectedChildId, existingBooking, availableActivities]); // ✅ Update when key props change

  // Clear selected time if it becomes unavailable when date changes
  // Exception: In edit mode, never clear the existing session's start time
  useEffect(() => {
    // Only check if we have a date and time selected
    if (!formData.date || !formData.startTime) return;
    
    // In edit mode, don't clear the existing session's start time
    const isEditMode = !!existingBooking;
    // ✅ CRITICAL: Normalise to HH:mm format for comparison (API may return HH:mm:ss)
    const existingStartTime = existingBooking?.startTime
      ? moment(existingBooking.startTime, ['HH:mm', 'HH:mm:ss']).format('HH:mm')
      : undefined;
    if (isEditMode && formData.startTime === existingStartTime) {
      // Don't clear the existing time - it's always valid when editing
      return;
    }
    
    // Check if the currently selected time is available
    const selectedTimeSlot = availableTimeSlots.find(slot => slot.time === formData.startTime);
    if (selectedTimeSlot && selectedTimeSlot.disabled) {
      // Selected time is no longer available, clear it
      setFormData(prev => ({
        ...prev,
        startTime: '',
      }));
    }
  }, [formData.date, availableTimeSlots, formData.startTime, existingBooking]);

  // Adjust duration if it exceeds cap (child's remaining hours) when date/time or child changes
  useEffect(() => {
    if (!formData.date || !formData.startTime || !formData.duration) return;
    if (formData.activitySelectionType === 'package_activity') return;
    if (formData.duration <= hoursCap) return;
    const capped = formData.activitySelectionType === 'trainer_choice'
      ? Math.floor(hoursCap)
      : hoursCap;
    setFormData(prev => ({ ...prev, duration: capped }));
  }, [formData.date, formData.startTime, formData.duration, formData.activitySelectionType, hoursCap]);

  // Validate form before submission
  const isFormValid = useMemo(() => {
    // Child must be selected (not 0)
    if (!formData.childId || formData.childId === 0 || !formData.date || !formData.startTime) return false;
    // Child must have at least minimum session hours available (no submit when 0h or package unpaid); skip in edit mode (rescheduling same session)
    const isEditMode = !!existingBooking;
    if (selectedChildRemainingHours < MIN_DURATION_HOURS && !isEditMode) return false;
    // Time must be at least 24 hours away
    if (!isTimeValid) return false;
    if (
      formData.activitySelectionType === 'package_activity' &&
      (!formData.selectedActivityIds || formData.selectedActivityIds.length === 0) &&
      (!formData.customActivities || formData.customActivities.length === 0)
    ) {
      return false;
    }
    if (formData.activitySelectionType === 'custom' && !formData.customActivityName?.trim()) return false;
    return true;
  }, [formData, isTimeValid, selectedChildRemainingHours, existingBooking]);

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!isFormValid) {
      toastManager.warning('Please fill in all required fields');
      return;
    }
    
    // Validate session duration (minimum 3 hours, maximum until 11:59 PM)
    if (!isDurationValid) {
      const errorMessage = sessionDuration < MIN_DURATION_HOURS 
        ? `Sessions must be at least ${MIN_DURATION_HOURS} hours. Current: ${formatDurationDisplay(sessionDuration)}. Please select more activities or increase the duration.` 
        : formData.date && formData.startTime
          ? `Session exceeds maximum available time. Maximum ${formatDurationDisplay(hoursCap)} (child has ${formatDurationDisplay(selectedChildRemainingHours)}). Remove activities or pick earlier time.`
          : BOOKING_VALIDATION_MESSAGES.SESSION_TOO_LONG;
      toastManager.error(errorMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      if (!handleSubmitCallback) return;
      await handleSubmitCallback(formData);
      onClose();
      // Reset form
      const resetDate = moment().add(1, 'day').format('YYYY-MM-DD');
      setFormData({
        date: resetDate,
        childId: 0, // Reset to no selection
        startTime: '', // Reset to no time selected
        activitySelectionType: 'trainer_choice',
        selectedActivityIds: [],
        duration: MIN_DURATION_HOURS, // Reset to minimum duration constant
        notes: '',
      });
      setShowNotes(false);
      setActivitySearch('');
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error, 'Failed to save booking. Please try again.');
      const err = error as { response?: { data?: unknown } };
      console.error('Failed to save booking:', errorMessage, err?.response?.data ?? error);
      // "Exceed remaining hours" is a validation fix in the modal (remove activities), not a retry — don't show Retry so user isn't stuck in a loop
      const isExceedRemainingHoursError =
        typeof errorMessage === 'string' && errorMessage.toLowerCase().includes('exceed your remaining');
      toastManager.error(
        errorMessage,
        isExceedRemainingHoursError
          ? undefined
          : { label: 'Retry', onClick: () => handleSubmit() }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedChild = children.find(c => c.id === formData.childId);
  const isEditMode = !!existingBooking;
  const minBookingDate = isEditMode ? undefined : getEarliestBookableDate();
  const isChildSelected = !!formData.childId && formData.childId !== 0;
  const isStartTimeSelected = !!formData.startTime;
  // In edit mode, allow changing time even when child has no hours (rescheduling same session doesn't need extra hours)
  const canSelectStartTime = isChildSelected && (!selectedChildHasNoHours || isEditMode);
  const canSelectActivities = isChildSelected && isStartTimeSelected && (!selectedChildHasNoHours || isEditMode);

  const standardActivitiesCount = formData.selectedActivityIds?.length ?? 0;
  const customActivitiesCount = formData.customActivities?.length ?? 0;
  const totalSelectedActivities = standardActivitiesCount + customActivitiesCount;
  const remainingDuration = Math.max(0, hoursCap - sessionDuration);

  // Cap activity selection by BOTH (1) remaining package hours and (2) session max (until 11:59 PM)
  // So parents cannot add activities beyond what the session allows — no "exceeds 6h" surprise after the fact
  const isActivityDisabledByRemainingHours = useCallback(
    (activityId: number, duration: number) => {
      const isSelected = formData.selectedActivityIds?.includes(activityId) ?? false;
      if (isSelected) return false; // Allow unchecking
      // In edit mode, allow selecting so parent can swap activities; validation will block submit if over cap
      if (isEditMode) return false;
      return sessionDuration + duration > hoursCap;
    },
    [formData.selectedActivityIds, sessionDuration, hoursCap, isEditMode]
  );
  const isActivityDisabledBySessionCap = useCallback(
    (activityId: number, duration: number) => {
      const isSelected = formData.selectedActivityIds?.includes(activityId) ?? false;
      if (isSelected) return false; // Allow unchecking to remove
      // In edit mode, allow selecting so parent can swap activities; validation will block submit if over cap
      if (isEditMode) return false;
      return sessionDuration + duration > hoursCap;
    },
    [formData.selectedActivityIds, sessionDuration, hoursCap, isEditMode]
  );
  const isActivityDisabled = useCallback(
    (activityId: number, duration: number) => {
      const byHours = isActivityDisabledByRemainingHours(activityId, duration);
      const bySession = isActivityDisabledBySessionCap(activityId, duration);
      return byHours || bySession;
    },
    [isActivityDisabledByRemainingHours, isActivityDisabledBySessionCap]
  );
  const hasReachedRemainingHoursCap = sessionDuration >= hoursCap && selectedChildRemainingHours < 24;
  const hasReachedSessionCap = sessionDuration >= hoursCap;

  const bookingTitle = isEditMode ? 'Edit Session' : 'Book Session';
  const footerContent = (
    <div className="flex gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="flex-1"
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="primary"
        className="flex-1"
        disabled={isSubmitting || !isFormValid || children.length === 0 || !isDurationValid || !isTimeValid}
        onClick={() => {
          if (formRef.current) {
            formRef.current.requestSubmit();
          } else {
            handleSubmit();
          }
        }}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin mr-2" />
            Saving...
          </>
        ) : (
          isEditMode ? 'Update Session' : 'Book Session'
        )}
      </Button>
    </div>
  );

  const formContent = (
      <form ref={formRef} onSubmit={handleSubmit} id="booking-form" className="min-w-0 space-y-4 sm:space-y-5">
          {/* Compact "Booking: date · child" + prominent hours – sticky on scroll; -mt/pt cancels scroll padding; overflow-hidden so scroll content doesn’t show through */}
          <div
            className={`sticky top-0 z-10 space-y-3 overflow-hidden bg-white dark:bg-gray-800 border-b border-slate-200/80 dark:border-slate-700/80 pb-2 ${
              renderAsPanel ? '-mx-4 -mt-4 px-4 pt-4' : '-mx-4 -mt-4 px-4 pt-4 md:-mx-6 md:-mt-6 md:px-6 md:pt-6'
            }`}
          >
          {formData.date && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <p className="text-2xs text-gray-500 flex flex-wrap items-center gap-x-1 gap-y-1">
                <span>Booking:</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowDateInput(true);
                    setTimeout(() => {
                      dateInputRef.current?.focus();
                      dateInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 0);
                  }}
                  className="text-primary-blue hover:underline font-medium"
                >
                  {moment(formData.date, 'YYYY-MM-DD').format('D MMM YYYY')}
                </button>
                <span aria-hidden>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowChildSelect(true);
                    setTimeout(() => {
                      childSelectRef.current?.focus();
                      childSelectRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 0);
                  }}
                  className="text-primary-blue hover:underline font-medium"
                >
                  {formData.childId === 0 ? 'Select child' : children.find((c) => c.id === formData.childId)?.name ?? 'Child'}
                </button>
                {formData.startTime && sessionEndTime.display && (
                  <>
                    <span aria-hidden>·</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowTimeSelect(true);
                        setTimeout(() => {
                          timeSelectRef.current?.focus();
                          timeSelectRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 0);
                      }}
                      className="inline-flex items-center gap-1 text-2xs text-primary-blue hover:underline font-medium transition-colors"
                      aria-label="Change activity start time"
                    >
                      <Clock size={12} className="shrink-0 text-primary-blue/80" aria-hidden />
                      <span>
                        {moment(formData.startTime, 'HH:mm').format(TIME_FORMAT_24H)} – {sessionEndTime.display}
                        {sessionEndTime.isNextDay ? ' (next day)' : ''}
                      </span>
                    </button>
                    <span aria-hidden>·</span>
                    <span className={`text-2xs font-medium ${isDurationValid ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      ✓ {formatDurationDisplay(sessionDuration)}
                    </span>
                  </>
                )}
              </p>
              {formData.childId !== 0 && formData.childId !== undefined && (
                <span
                  className="inline-flex items-center rounded-md bg-primary-blue/10 px-2 py-0.5 text-2xs font-medium text-navy-blue"
                  aria-label={`${formatDurationDisplay(selectedChildRemainingHours)} available to book`}
                >
                  {formatDurationDisplay(selectedChildRemainingHours)} available
                </span>
              )}
            </div>
          )}

          {/* Date input: hidden unless user clicked the date in the compact line */}
          <div className={showDateInput ? '' : 'hidden'}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar size={14} className="inline mr-1" />
              Date
            </label>
            <input
              ref={dateInputRef}
              type="date"
              value={formData.date}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, date: e.target.value }));
                setShowDateInput(false);
              }}
              onBlur={() => setShowDateInput(false)}
              min={minBookingDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              aria-label="Session date"
            />
          </div>

          {/* Child select: hidden unless no child selected yet or user clicked the child in the compact line */}
          <div className={showChildSelect || formData.childId === 0 ? '' : 'hidden'}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User size={14} className="inline mr-1" />
              Child <span className="text-red-500">*</span>
            </label>
            <select
              ref={childSelectRef}
              value={formData.childId}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, childId: parseInt(e.target.value, 10) }));
                setShowChildSelect(false);
              }}
              onBlur={() => setShowChildSelect(false)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formData.childId === 0 ? 'border-gray-300 text-gray-500' : 'border-gray-300 text-gray-900'
              }`}
              required
              disabled={!formData.date}
            >
              <option value={0} disabled>
                Select a child...
              </option>
              {children.length === 0 ? (
                <option value={0} disabled>No approved children</option>
              ) : (
                children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))
              )}
            </select>
            {children.length === 0 ? (
              (() => {
                const needsChecklist = (childrenNeedingChecklist?.length ?? 0) > 0;
                const awaitingReview = (childrenAwaitingChecklistReview?.length ?? 0) > 0;
                const pendingNoAction = (childrenPendingApproval?.length ?? 0) > 0 && (childrenNeedingChecklist?.length ?? 0) === 0;
                if (needsChecklist && childrenNeedingChecklist?.[0] && onCompleteChecklist) {
                  const first = childrenNeedingChecklist[0];
                  const dropdownChecklistLabel = first.name?.trim() ? `${first.name}'s checklist` : BOOKING_VALIDATION_MESSAGES.YOUR_CHILD_CHECKLIST;
                  return (
                    <p className="text-xs text-amber-700 mt-1 flex flex-wrap items-center gap-x-1 gap-y-1">
                      <AlertTriangle className="inline w-3 h-3 shrink-0" />
                      {BOOKING_VALIDATION_MESSAGES.NO_APPROVED_CHILDREN_TO_BOOK} Complete{' '}
                      <button
                        type="button"
                        onClick={() => onCompleteChecklist(first.id)}
                        className="text-amber-700 hover:underline font-medium"
                      >
                        {dropdownChecklistLabel}
                      </button>
                      {BOOKING_VALIDATION_MESSAGES.CREATE_CHILD_PROFILE_BEFORE_BOOKING}
                      {onAddChild ? (
                        <>
                          {' '}
                          <button
                            type="button"
                            onClick={() => onAddChild()}
                            className="text-amber-700 hover:underline font-medium"
                          >
                            {BOOKING_VALIDATION_MESSAGES.OR_ADD_ANOTHER_CHILD}
                          </button>
                          .
                        </>
                      ) : (
                        <>
                          {' '}
                          <Link href={ROUTES.DASHBOARD_PARENT} className="text-amber-700 hover:underline font-medium">
                            {BOOKING_VALIDATION_MESSAGES.OR_ADD_ANOTHER_CHILD}
                          </Link>
                          .
                        </>
                      )}
                    </p>
                  );
                }
                if (awaitingReview || pendingNoAction) {
                  const names = (childrenAwaitingChecklistReview ?? childrenPendingApproval ?? []);
                  const label = names.length === 1 ? `${names[0].name}'s` : 'your children\'s';
                  return (
                    <p className="text-xs text-gray-600 mt-1">
                      We&apos;re reviewing {label} details. You&apos;ll be able to book sessions once we&apos;ve approved. No need to do anything – we&apos;ll email you when it&apos;s done.
                    </p>
                  );
                }
                return (
                  <p className="text-xs text-gray-600 mt-1">
                    {BOOKING_VALIDATION_MESSAGES.NO_APPROVED_CHILDREN_TO_BOOK}{' '}
                    {onAddChild ? (
                      <button
                        type="button"
                        onClick={() => onAddChild()}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {BOOKING_VALIDATION_MESSAGES.ADD_CHILD_LABEL}
                      </button>
                    ) : (
                      <Link href={ROUTES.DASHBOARD_PARENT} className="text-blue-600 hover:underline font-medium">
                        {BOOKING_VALIDATION_MESSAGES.GO_TO_DASHBOARD_TO_ADD_CHILD}
                      </Link>
                    )}
                    {BOOKING_VALIDATION_MESSAGES.CREATE_CHILD_PROFILE_BEFORE_BOOKING}
                  </p>
                );
              })()
            ) : selectedChildHasNoHours && !isEditMode ? (
              <p className="text-xs text-amber-700 mt-1 flex flex-wrap items-center gap-x-1">
                <AlertTriangle className="inline w-3 h-3 shrink-0" />
                {selectedChildNeedsTopUp
                  ? 'This child has no hours left in their package. '
                  : 'This child has no package. '}
                {selectedChildNeedsTopUp && onTopUp && formData.childId ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onTopUp(formData.childId)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Top up
                    </button>
                    {' to add more hours.'}
                  </>
                ) : (onBuyMoreHours && formData.childId) ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onBuyMoreHours(formData.childId)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Buy hours
                    </button>
                    {' to book sessions.'}
                  </>
                ) : (
                  selectedChildNeedsTopUp ? 'Top up to add more hours.' : 'Buy hours to book sessions.'
                )}
              </p>
            ) : (
              formData.childId === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {!formData.date
                    ? 'Please select a date first'
                    : 'Please select which child you\'re booking for'}
                </p>
              )
            )}
          </div>
          </div>

          {/* Activity Start Time: hidden when a time is selected (user can click compact "08:30 – 11:30 · ✓ 3h" in sticky header to expand) */}
          <div className={showTimeSelect || !formData.startTime ? '' : 'hidden'}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock size={14} className="inline mr-1" />
              Activity Start Time <span className="text-red-500">*</span>
            </label>
            <select
              ref={timeSelectRef}
              value={formData.startTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                !formData.startTime ? 'border-gray-300 text-gray-500' : 'border-gray-300 text-gray-900'
              }`}
              required
              disabled={!canSelectStartTime}
            >
              <option value="" disabled>
                {!formData.date
                  ? 'Please select a date first'
                  : selectedChildHasNoHours
                    ? (selectedChildNeedsTopUp ? 'No hours left — top up to book' : 'No package — buy hours to book')
                    : !canSelectStartTime
                      ? 'Please select a child first'
                      : 'Select a time...'}
              </option>
              {(() => {
                // Filter to show ONLY available (non-disabled) times
                const availableTimes = availableTimeSlots.filter(({ disabled }) => !disabled);
                
                // In edit mode, mark the existing start time for clarity
                const isEditMode = !!existingBooking;
                // ✅ CRITICAL: Normalise to HH:mm format for comparison (API may return HH:mm:ss)
                const existingStartTime = existingBooking?.startTime
                  ? moment(existingBooking.startTime, ['HH:mm', 'HH:mm:ss']).format('HH:mm')
                  : undefined;
                
                // If no times are available, show a helpful message
                if (availableTimes.length === 0 && formData.date) {
                  return (
                    <option value="" disabled>
                      No available times for this date
                    </option>
                  );
                }
                
                // Show only available times (no disabled options)
                // In edit mode, mark the existing time with "(current)"
                return availableTimes.map(({ time }) => {
                  const isExistingTime = isEditMode && time === existingStartTime;
                  return (
                    <option
                      key={time}
                      value={time}
                    >
                      {moment(time, 'HH:mm').format(TIME_FORMAT_24H)}{isExistingTime ? ' (current)' : ''}
                    </option>
                  );
                });
              })()}
            </select>
            {(() => {
              const availableTimes = availableTimeSlots.filter(({ disabled }) => !disabled);
              
                if (!formData.startTime) {
                if (!formData.date) {
                  return <p className="text-xs text-gray-500 mt-1">Select date first.</p>;
                }
                  if (selectedChildHasNoHours && !isEditMode) {
                    return (
                      <p className="text-xs text-amber-600 mt-1">
                        <AlertTriangle className="inline w-3 h-3 mr-1" />
                        {selectedChildNeedsTopUp ? 'Top up to book.' : 'Buy hours to book.'}
                      </p>
                    );
                  }
                  if (!canSelectStartTime) {
                    return <p className="text-xs text-gray-500 mt-1">Select child first.</p>;
                  }
                if (availableTimes.length === 0) {
                  return (
                    <p className="text-xs text-amber-600 mt-1">
                      <AlertTriangle className="inline w-3 h-3 mr-1" />
                      No times this date.
                    </p>
                  );
                }
                
                return (
                  <p className="text-xs text-gray-500 mt-1">
                    {availableTimes.length} time{availableTimes.length !== 1 ? 's' : ''} available
                  </p>
                );
              }
              
              return null;
            })()}
            {formData.startTime && !isTimeValid && (
              <p className="text-xs text-amber-600 mt-1">
                <AlertTriangle className="inline w-3 h-3 mr-1" />
                {BOOKING_VALIDATION_MESSAGES.INSUFFICIENT_NOTICE}
            </p>
            )}
            {/* Session time/duration – compact; dismissible */}
            {formData.startTime && sessionEndTime.display && !dismissedHints.sessionSummary && (
              <div className={`mt-2 p-2 border rounded-lg flex items-center justify-between gap-2 ${
                isDurationValid ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-300'
              }`}>
                <p className="text-xs text-gray-700">
                  {moment(formData.startTime, 'HH:mm').format(TIME_FORMAT_24H)} – {sessionEndTime.display}
                  {sessionEndTime.isNextDay && <span className="text-blue-600"> (next day)</span>}
                  {' · '}
                  <span className={isDurationValid ? 'text-green-700 font-medium' : 'text-amber-700'}>
                    {isDurationValid ? `✓ ${formatDurationDisplay(sessionDuration)}` : `${formatDurationDisplay(sessionDuration)}${sessionDuration < MIN_DURATION_HOURS ? ` (min ${MIN_DURATION_HOURS}h)` : ` (max ${formatDurationDisplay(hoursCap)})`}`}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setDismissedHints(prev => ({ ...prev, sessionSummary: true }))}
                  className="text-gray-400 hover:text-gray-600 shrink-0"
                  aria-label="Dismiss"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Activity Selection – radio (choose one) + color system: blue = Standard, violet = Custom */}
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-800">
              <Activity size={16} className="shrink-0 text-gcal-primary" aria-hidden />
              Activity Selection <span className="text-red-500">*</span>
            </label>

            {!canSelectActivities && (
              <p className="text-2xs text-gray-500 mb-2">
                {selectedChildHasNoHours
                  ? (selectedChildNeedsTopUp ? 'No hours left. Top up to book.' : 'No package. Buy hours to book.')
                  : 'Select date and start time first.'}
              </p>
            )}

            {/* STEP 1: Who chooses? – accordion-style, one box, two options; selected row expands content below */}
            <p className="text-2xs font-medium text-gray-500 mb-1.5">Choose one</p>
            <div
              className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 overflow-hidden mb-3 ${
                !canSelectActivities ? 'opacity-60 pointer-events-none select-none' : ''
              }`}
              aria-disabled={!canSelectActivities}
              role="radiogroup"
              aria-label="Who chooses activities"
            >
              <label
                className={`flex min-h-[44px] items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-150 border-b border-gray-200 dark:border-gray-600 ${
                  selectionMode === 'all_parent'
                    ? 'bg-gcal-primary-light border-l-4 border-l-gcal-primary'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                } ${!canSelectActivities ? 'cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="activitySelectionMode"
                  value="all_parent"
                  checked={selectionMode === 'all_parent'}
                  onChange={() => handleSelectionModeChange('all_parent')}
                  disabled={!canSelectActivities}
                  className="h-4 w-4 shrink-0 border border-gray-300 text-gcal-primary focus:ring-2 focus:ring-gcal-primary/50 focus:ring-offset-0 focus-visible:outline-none"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  I&apos;ll choose all activities
                </span>
              </label>
              <label
                className={`flex min-h-[44px] items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-150 ${
                  selectionMode === 'all_trainer'
                    ? 'bg-gcal-primary-light border-l-4 border-l-gcal-primary'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                } ${!canSelectActivities ? 'cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="activitySelectionMode"
                  value="all_trainer"
                  checked={selectionMode === 'all_trainer'}
                  onChange={() => handleSelectionModeChange('all_trainer')}
                  disabled={!canSelectActivities}
                  className="h-4 w-4 shrink-0 border border-gray-300 text-gcal-primary focus:ring-2 focus:ring-gcal-primary/50 focus:ring-offset-0 focus-visible:outline-none"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Trainer chooses everything
                </span>
              </label>
            </div>

            {/* STEP 2: When session full, disable completely – no "remove one" */}
            {selectionMode !== 'all_trainer' && (
              <div
                ref={parentModeSectionRef}
                className={`space-y-3 ${hasReachedSessionCap ? 'pointer-events-none opacity-70' : ''}`}
                aria-disabled={hasReachedSessionCap}
              >
                {hasReachedSessionCap && (
                  <p className="rounded-lg bg-gcal-primary-light/60 dark:bg-gcal-primary/10 px-4 py-3 text-sm font-medium text-gcal-primary">
                    {EMPTY_STATE.STANDARD_ACTIVITY_SECTION.SESSION_FULL} ({formatDurationDisplay(hoursCap)} max).
                  </p>
                )}
                {/* Section 1: Standard Activities – from activity list; + opens "Add your own" popover */}
                <section className="rounded-lg bg-slate-50/80 dark:bg-slate-800/30">
                  <div className="flex min-h-[44px] items-center rounded-t-lg bg-white/80 dark:bg-slate-800/50">
                    <button
                      type="button"
                      onClick={() => setShowStandardSection(prev => !prev)}
                      title={EMPTY_STATE.STANDARD_ACTIVITY_SECTION.TOOLTIP_TITLE}
                      aria-expanded={showStandardSection}
                      aria-label={`${EMPTY_STATE.STANDARD_ACTIVITY_SECTION.TOOLTIP_TITLE}. ${showStandardSection ? 'Collapse' : 'Expand'} section`}
                      className="flex flex-1 min-w-0 items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-slate-100/80 dark:hover:bg-slate-700/30 rounded-t-lg"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gcal-primary" aria-hidden />
                        <span className="text-sm font-semibold text-gcal-primary">
                          {EMPTY_STATE.STANDARD_ACTIVITY_SECTION.SHORT_LABEL}
                        </span>
                        <span className="text-2xs font-normal text-slate-500 dark:text-slate-400 truncate">From the activity list</span>
                      </div>
                      {showStandardSection ? (
                        <ChevronUp className="w-4 h-4 text-gcal-primary shrink-0" aria-hidden />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gcal-primary shrink-0" aria-hidden />
                      )}
                    </button>
                    <span className="h-6 w-px shrink-0 bg-slate-200 dark:bg-slate-600" aria-hidden />
                    <div className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center pr-2">
                      <button
                        ref={customActivityTriggerRef}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomPopoverOpen(prev => !prev);
                        }}
                        title={EMPTY_STATE.CUSTOM_ACTIVITY_SECTION.ADD_YOUR_OWN_ACTIVITY_TOOLTIP}
                        aria-label={EMPTY_STATE.CUSTOM_ACTIVITY_SECTION.ADD_YOUR_OWN_ACTIVITY_TOOLTIP}
                        aria-expanded={customPopoverOpen}
                        aria-haspopup="dialog"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-violet-600 dark:text-violet-400 transition-colors hover:bg-violet-50 dark:hover:bg-violet-900/30 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:ring-inset"
                      >
                        <Plus className="w-5 h-5" aria-hidden />
                      </button>
                    </div>
                  </div>

                  {showStandardSection && (
                  <div className="px-4 pt-3 pb-4 space-y-2">
                    {loadingActivities && (
                      <div className="py-2" aria-busy="true" aria-label="Loading activities">
                        <ListRowsSkeleton count={SKELETON_COUNTS.LIST_ROWS} />
                      </div>
                    )}
                    {activitiesError && (
                      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
                        <p className="text-xs font-medium text-red-700 dark:text-red-300 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden />
                          Failed to load activities
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{activitiesError}</p>
                      </div>
                    )}
                    {!loadingActivities && !activitiesError && availableActivities.length > 0 && (
                      <>
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" aria-hidden />
                          <input
                            type="text"
                            value={activitySearch}
                            onChange={(e) => setActivitySearch(e.target.value)}
                            placeholder="Search activities..."
                            className="w-full rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 pl-9 pr-3 py-2 text-sm transition-colors placeholder:text-slate-400 focus:border-gcal-primary focus:outline-none focus:ring-2 focus:ring-gcal-primary/20 dark:focus:border-gcal-primary"
                          />
                        </div>
                        {canSelectActivities && formData.date && formData.startTime && !dismissedHints.activityCap && (
                          <p className="flex items-center justify-between gap-2 rounded-lg bg-gcal-primary-light/50 dark:bg-gcal-primary/10 px-3 py-2 text-xs text-slate-700 dark:text-slate-300">
                            <span>You can book up to <strong>{formatDurationDisplay(hoursCap)}</strong> for this session (child has {formatDurationDisplay(selectedChildRemainingHours)} available)</span>
                            <button type="button" onClick={() => setDismissedHints(prev => ({ ...prev, activityCap: true }))} className="shrink-0 rounded p-0.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" aria-label="Dismiss"><X size={12} /></button>
                          </p>
                        )}
                        {hasReachedRemainingHoursCap && !hasReachedSessionCap && !dismissedHints.activityCapHours && (
                          <p className="flex items-center justify-between gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                            <span>Package hours used. Remove one or top up.</span>
                            <button type="button" onClick={() => setDismissedHints(prev => ({ ...prev, activityCapHours: true }))} className="shrink-0 rounded p-0.5 text-amber-600 hover:text-amber-800 dark:hover:text-amber-300" aria-label="Dismiss"><X size={12} /></button>
                          </p>
                        )}
                        {hasReachedSessionCap && !dismissedHints.activityCapFull && (
                          <p className="flex items-center justify-between gap-2 rounded-lg bg-gcal-primary-light/50 dark:bg-gcal-primary/10 px-3 py-2 text-xs font-medium text-gcal-primary">
                            <span>{EMPTY_STATE.STANDARD_ACTIVITY_SECTION.SESSION_FULL} ({formatDurationDisplay(hoursCap)} max).</span>
                            <button type="button" onClick={() => setDismissedHints(prev => ({ ...prev, activityCapFull: true }))} className="shrink-0 rounded p-0.5 text-gcal-primary/70 hover:text-gcal-primary" aria-label="Dismiss"><X size={12} /></button>
                          </p>
                        )}
                        <div className="h-48 overflow-y-auto rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-600/50 p-2 space-y-0.5">
                          {filteredActivities.length === 0 && (
                            <p className="py-4 text-center text-sm text-gray-500">
                              {EMPTY_STATE.NO_ACTIVITIES_FOUND_DROPDOWN.title}
                            </p>
                          )}
                          {filteredActivities.map(activity => {
                            const disabledByHours = isActivityDisabledByRemainingHours(activity.id, activity.duration);
                            const disabledBySession = isActivityDisabledBySessionCap(activity.id, activity.duration);
                            const disabled = disabledByHours || disabledBySession;
                            const isChecked = formData.selectedActivityIds?.includes(activity.id) || false;
                            return (
                              <label
                                key={activity.id}
                                className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg px-2.5 py-2 transition-colors duration-150 ${
                                  disabled
                                    ? 'cursor-not-allowed opacity-60'
                                    : isChecked
                                      ? 'bg-gcal-primary-light/50 dark:bg-gcal-primary/20'
                                      : 'hover:bg-slate-100 dark:hover:bg-slate-700/40'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={disabled}
                                  onChange={(e) => {
                                    if (disabled) return;
                                    const checked = e.target.checked;
                                    if (checked && sessionDuration + activity.duration > hoursCap) return;
                                    setFormData(prev => {
                                      const currentIds = prev.selectedActivityIds || [];
                                      return {
                                        ...prev,
                                        selectedActivityIds: checked
                                          ? [...currentIds, activity.id]
                                          : currentIds.filter(id => id !== activity.id)
                                      };
                                    });
                                  }}
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-gcal-primary focus:ring-2 focus:ring-gcal-primary/30 disabled:cursor-not-allowed"
                                  aria-describedby={disabled ? `activity-${activity.id}-reason` : undefined}
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {activity.name}
                                  </div>
                                  <div className="text-2xs text-slate-600 dark:text-slate-400" id={disabled ? `activity-${activity.id}-reason` : undefined}>
                                    Duration: {formatActivityDurationDisplay(activity.duration)}
                                    {activity.category && ` · ${activity.category.replace('_', ' ')}`}
                                    {disabledBySession && (
                                      <span className="mt-0.5 block text-amber-600">
                                        Session full
                                      </span>
                                    )}
                                    {disabledByHours && !disabledBySession && (
                                      <span className="mt-0.5 block text-amber-600">
                                        Would exceed package remaining
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                        <p className="text-2xs text-slate-600 dark:text-slate-400">
                          {activitySearch
                            ? `${filteredActivities.length} of ${availableActivities.length} activities`
                            : `${filteredActivities.length} activities available (all durations)`}
                        </p>
                      </>
                    )}
                    {!loadingActivities && !activitiesError && availableActivities.length === 0 && (
                      <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
                        <p className="text-xs font-medium text-amber-800 dark:text-amber-200 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden />
                          {EMPTY_STATE.NO_ACTIVITIES_FOUND_IN_DATABASE.title}
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                          Please contact support if this issue persists.
                        </p>
                      </div>
                    )}
                  </div>
                  )}
                </section>

                {/* Section 2: Selected Activities – pill UI (same as custom activities), each pill removable */}
                {(totalSelectedActivities > 0 || sessionDuration > 0) && (
                  <section className="rounded-lg bg-white dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-600/50 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {sessionDuration > hoursCap ? (
                          <>{totalSelectedActivities} activities · {formatDurationDisplay(sessionDurationForDisplay)} — max {formatDurationDisplay(hoursCap)}. Remove activities or pick earlier time.</>
                        ) : (
                          <>
                            {sessionDuration >= MIN_DURATION_HOURS ? '✓ ' : '⚠️ '}
                            {totalSelectedActivities} {totalSelectedActivities === 1 ? 'activity' : 'activities'} · {formatDurationDisplay(sessionDurationForDisplay)}
                            {sessionDuration < MIN_DURATION_HOURS && <span className="text-amber-600"> (add {formatDurationDisplay(getHoursNeededForMinimum(sessionDurationForDisplay))})</span>}
                          </>
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData(prev => ({
                            ...prev,
                            selectedActivityIds: [],
                            customActivities: [],
                            customActivityName: undefined,
                          }))
                        }
                        className="rounded-full px-3 py-1.5 text-xs font-medium text-gcal-primary transition-colors duration-150 hover:bg-gcal-primary-light focus:outline-none focus:ring-2 focus:ring-gcal-primary/30"
                      >
                        Clear all
                      </button>
                    </div>
                    {sessionDuration > hoursCap && (
                      <p className="text-2xs text-red-600">{EMPTY_STATE.STANDARD_ACTIVITY_SECTION.REMOVE_ACTIVITIES_HINT}</p>
                    )}
                    {hoursCap > sessionDuration && (
                      <p className="text-2xs text-slate-500 dark:text-slate-400">{formatDurationDisplay(Math.max(0, hoursCap - sessionDurationForDisplay))} left for this session (max {formatDurationDisplay(hoursCap)})</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {formData.selectedActivityIds?.map(activityId => {
                        const activity = availableActivities.find(a => a.id === activityId);
                        if (!activity) return null;
                        return (
                          <span
                            key={activityId}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200"
                          >
                            {activity.name} ({formatActivityDurationDisplay(activity.duration)})
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  selectedActivityIds: (prev.selectedActivityIds || []).filter(id => id !== activityId)
                                }));
                              }}
                              className="rounded-full p-0.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                              aria-label={`Remove ${activity.name}`}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        );
                      })}
                      {formData.customActivities?.map((custom, index) => (
                        <span
                          key={`${custom.name}-${index}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200"
                        >
                          {custom.name} ({formatActivityDurationDisplay(custom.duration)})
                          <button
                            type="button"
                            onClick={() =>
                              setFormData(prev => ({
                                ...prev,
                                customActivities: (prev.customActivities || []).filter((_, i) => i !== index),
                              }))
                            }
                            className="rounded-full p-0.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                            aria-label={`Remove ${custom.name}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      {formData.customActivityName && (
                        <span
                          key="custom-activity-chip-legacy"
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200"
                        >
                          Custom: {formData.customActivityName}
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, customActivityName: undefined }))}
                            className="rounded-full p-0.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                            aria-label="Remove custom activity"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Trainer-only mode – GCAL-style card */}
            {selectionMode === 'all_trainer' && canSelectActivities && (
              <div
                ref={trainerModeSectionRef}
                className="mt-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4"
              >
                <div className="text-sm font-medium text-gray-900 mb-1">Trainer&apos;s choice</div>
                <p className="text-2xs text-gray-600 mb-2">Choose session length; trainer selects activities.</p>
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Session Duration <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={Math.min(
                      Math.floor(hoursCap),
                      Math.max(MIN_DURATION_HOURS, Math.round(Number(formData.duration) || MIN_DURATION_HOURS))
                    )}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        duration: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {(() => {
                      const maxHours = Math.max(MIN_DURATION_HOURS, Math.floor(hoursCap));
                      const options = [];
                      for (let h = MIN_DURATION_HOURS; h <= maxHours; h += 1) {
                        options.push(
                          <option key={h} value={h}>
                            {h} {h === 1 ? 'hour' : 'hours'}
                          </option>
                        );
                      }
                      return options;
                    })()}
                  </select>
                  {!dismissedHints.trainerDuration && (formData.date && formData.startTime) && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center justify-between gap-2">
                      <span>
                        Min {MIN_DURATION_HOURS}h
                        {hoursCap > MIN_DURATION_HOURS && ` · Up to ${formatDurationDisplay(hoursCap)} (${formatDurationDisplay(selectedChildRemainingHours)} available)`}
                        {selectedChildRemainingHours < 24 && !isEditMode && hoursCap <= selectedChildRemainingHours && ` · ${selectedChildRemainingHours.toFixed(1)}h left`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDismissedHints(prev => ({ ...prev, trainerDuration: true }))}
                        className="text-gray-400 hover:text-gray-600 shrink-0"
                        aria-label="Dismiss"
                      >
                        <X size={12} />
                      </button>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes (Progressive Disclosure) */}
          {!showNotes ? (
            <button
              type="button"
              onClick={() => setShowNotes(true)}
              className="w-full text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
            >
              <FileText size={14} />
              Add notes (optional)
            </button>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText size={14} className="inline mr-1" />
                Notes (optional)
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special instructions or notes..."
              />
              <button
                type="button"
                onClick={() => {
                  setShowNotes(false);
                  setFormData(prev => ({ ...prev, notes: '' }));
                }}
                className="text-xs text-gray-500 hover:text-gray-700 mt-1"
              >
                Remove notes
              </button>
            </div>
          )}

          {/* Validation – short; disappears when user fixes the issue */}
          {(!isDurationValid || !isTimeValid) && formData.startTime && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700 font-medium">
                <AlertTriangle className="inline w-3 h-3 mr-1" />
                {!isTimeValid && (!dateBookingStatus.bookable ? getMessageForDateReason(dateBookingStatus.reason, { now: moment() }) : BOOKING_VALIDATION_MESSAGES.INSUFFICIENT_NOTICE)}
                {!isTimeValid && !isDurationValid && ' · '}
                {!isDurationValid && (sessionDuration < MIN_DURATION_HOURS ? `Min ${MIN_DURATION_HOURS}h. Add activities or duration.` : `Max ${formatDurationDisplay(hoursCap)} for this session (child has ${formatDurationDisplay(selectedChildRemainingHours)}).`)}
              </p>
            </div>
          )}

          {/* Top up / Buy hours – short; dismissible */}
          {formData.childId !== 0 && formData.childId != null && selectedChildRemainingHours < 24 && (onTopUp || onBuyMoreHours) && !(sessionDuration > hoursCap) && !isEditMode && !dismissedHints.topUp && (
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg flex items-center justify-between gap-2">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                {selectedChildRemainingHours <= 0 ? 'No hours left.' : `${selectedChildRemainingHours.toFixed(1)}h left.`}
                {' '}
                <button type="button" onClick={() => (selectedChildHasPackage && onTopUp ? onTopUp(formData.childId) : onBuyMoreHours?.(formData.childId))} className="font-semibold underline">
                  {selectedChildHasPackage ? 'Top up' : 'Buy hours'}
                </button>
              </p>
              <button type="button" onClick={() => setDismissedHints(prev => ({ ...prev, topUp: true }))} className="text-amber-600 hover:text-amber-800 shrink-0" aria-label="Dismiss"><X size={12} /></button>
            </div>
          )}
      </form>
  );

  const mainContent =
    renderAsPanel && isOpen ? (
      (() => {
        const panel = (
          <>
            <div
              className="fixed inset-0 z-overlay bg-black/30 transition-opacity"
              onClick={onClose}
              aria-hidden
            />
            <div
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-overlay bg-white dark:bg-gray-800 shadow-xl flex flex-col border-l border-gray-200 dark:border-gray-700"
              role="dialog"
              aria-modal="true"
              aria-labelledby="booking-panel-title"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
                <h2 id="booking-panel-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {bookingTitle}
                </h2>
                <button
                  ref={panelCloseButtonRef}
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Close panel"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 p-4">
                {formContent}
              </div>
              <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-4 sm:px-5 py-3 dark:border-gray-800 dark:bg-gray-900/50">
                {footerContent}
              </div>
            </div>
          </>
        );
        return typeof document !== 'undefined' ? createPortal(panel, document.body) : panel;
      })()
    ) : (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={bookingTitle}
        clickPosition={clickPosition}
        size="md"
        ariaLabelledBy="booking-modal-title"
        footer={footerContent}
      >
        {formContent}
      </BaseModal>
    );

  const popoverPortal =
    customPopoverOpen &&
    customPopoverPosition &&
    typeof document !== 'undefined' &&
    document.body &&
    createPortal(
      <div className="fixed inset-0 z-popover" aria-hidden={!customPopoverOpen}>
        <div
          role="presentation"
          className="absolute inset-0 bg-black/20"
          onClick={() => setCustomPopoverOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-activity-popover-title"
          className="fixed z-popover w-[320px] max-h-[85vh] overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
          style={{ top: customPopoverPosition.top, left: customPopoverPosition.left }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-2.5 dark:border-slate-700">
            <div className="min-w-0">
              <h3 id="custom-activity-popover-title" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {EMPTY_STATE.CUSTOM_ACTIVITY_SECTION.ADD_YOUR_OWN_ACTIVITY_TOOLTIP}
              </h3>
              <p className="text-2xs text-slate-600 dark:text-slate-400 mt-0.5">
                {EMPTY_STATE.CUSTOM_ACTIVITY_SECTION.NOT_IN_LIST}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCustomPopoverOpen(false)}
              className="p-1.5 shrink-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-4">
            <CustomActivityInlineEditor
              remainingCapacity={remainingDuration}
              onAdd={(name, duration) => {
                if (!name.trim() || duration <= 0) return;
                if (sessionDuration + duration > hoursCap) return;
                setCustomPopoverOpen(false);
                setFormData((prev) => ({
                  ...prev,
                  activitySelectionType:
                    prev.activitySelectionType === 'trainer_choice' ? 'package_activity' : prev.activitySelectionType,
                  customActivities: [...(prev.customActivities || []), { name: name.trim(), duration }],
                }));
              }}
            />
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <>
      {mainContent}
      {popoverPortal}
    </>
  );
}
