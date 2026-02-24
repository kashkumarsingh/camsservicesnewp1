'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Calendar, Clock, User, FileText, Loader2, Activity, Search, AlertTriangle, X, ChevronDown, ChevronUp } from 'lucide-react';
import moment from 'moment';
import Button from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/Modal';
import { BOOKING_VALIDATION_MESSAGES, getMessageForDateReason, meetsMinimumDuration, formatDurationDisplay, formatActivityDurationDisplay, getHoursNeededForMinimum } from '@/utils/bookingValidationMessages';
import { getDateBookingStatus, getEarliestBookableDate, isTomorrowBookable } from '@/utils/bookingCutoffRules';
import { useActivities } from '@/interfaces/web/hooks/activities/useActivities';
import { MIN_DURATION_HOURS } from '@/utils/bookingConstants';
import { ListRowsSkeleton } from '@/components/ui/Skeleton';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';
import { parseCustomActivityFromNotes, parseAllCustomActivitiesFromNotes, removeCustomActivityFromNotes, normaliseNotesFromApi } from '@/utils/activitySelectionUtils';
import { toastManager } from '@/utils/toast';
import { ROUTES } from '@/utils/routes';
import type { FC } from 'react';

const CustomActivityInlineEditor: FC<{
  maxAvailableDuration: number; // Remaining capacity in hours for new custom activity
  onAdd: (name: string, duration: number) => void;
}> = ({ maxAvailableDuration, onAdd }) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState<number | ''>('');

  const minHours = 1;
  const hasRemainingCapacity = maxAvailableDuration >= minHours;
  const maxHours = hasRemainingCapacity ? Math.max(minHours, Math.floor(maxAvailableDuration)) : minHours;

  const handleAdd = () => {
    if (!hasRemainingCapacity || !name.trim() || !duration || duration <= 0) {
      return;
    }
    onAdd(name.trim(), duration);
    setName('');
    setDuration('');
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Baking, Lego building..."
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <select
          value={duration === '' ? '' : duration}
          onChange={(e) => setDuration(e.target.value ? parseFloat(e.target.value) : '')}
          className="w-28 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          disabled={!hasRemainingCapacity}
        >
          <option value="">Hours</option>
          {hasRemainingCapacity &&
            Array.from({ length: maxHours - minHours + 1 }, (_, i) => i + minHours).map((h) => (
              <option key={h} value={h}>
                {h} {h === 1 ? 'hour' : 'hours'}
              </option>
            ))}
        </select>
      </div>
      <div className="flex justify-between items-center">
        {hasRemainingCapacity ? (
          <p className="text-2xs text-gray-600">
            You can still add more custom activities within the remaining session time.
          </p>
        ) : (
          <p className="text-2xs text-amber-600">
            No remaining time available for additional custom activities in this session.
          </p>
        )}
        <button
          type="button"
          onClick={handleAdd}
          className="text-xs font-semibold text-purple-700 hover:text-purple-900 disabled:opacity-40"
          disabled={!hasRemainingCapacity || !name.trim() || !duration}
        >
          Add custom activity
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
  /** When true, render as a right-side slide-over panel instead of a modal (dashboard sidebar pattern) */
  renderAsPanel?: boolean;
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
  renderAsPanel = false,
}: ParentBookingModalProps) {
  /** Submit handler: required onSubmit takes precedence; fallback to deprecated onSave for backward compat. */
  const handleSubmitCallback = onSubmitProp ?? onSaveLegacy;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [activitySearch, setActivitySearch] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const parentModeSectionRef = useRef<HTMLDivElement | null>(null);
  const trainerModeSectionRef = useRef<HTMLDivElement | null>(null);
  const hasUserChosenSelectionModeRef = useRef(false);
  const [showCustomSection, setShowCustomSection] = useState(false);

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

  // Get remaining hours for selected child (raw value; 0 when package unpaid or no hours)
  const selectedChildRemainingHours = useMemo(() => {
    if (!formData.childId) return 24; // Default max if no child selected
    const child = children.find(c => c.id === formData.childId);
    if (!child?.activePackages || child.activePackages.length === 0) return 24; // No package info: assume can book
    const remaining = child.activePackages[0].remainingHours;
    return typeof remaining === 'number' && remaining >= 0 ? remaining : 0;
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

  // Derive a sensible initial selection mode whenever the modal is (re)opened
  useEffect(() => {
    if (!isOpen) {
      // Reset flag when modal is closed so defaults apply next time it opens
      hasUserChosenSelectionModeRef.current = false;
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
  
  // Check if session duration is valid (MIN_DURATION_HOURS to maxAvailableDuration)
  const isDurationValid = useMemo(() => {
    if (sessionDuration < MIN_DURATION_HOURS) return false;
    // For package_activity, duration is calculated from activities, so we check against maxAvailableDuration
    // For trainer_choice and custom, we also check against maxAvailableDuration
    if (formData.date && formData.startTime) {
      return sessionDuration <= maxAvailableDuration;
    }
    // If no date/time selected, fall back to standard 24-hour check
    return sessionDuration <= 24;
  }, [sessionDuration, maxAvailableDuration, formData.date, formData.startTime]);

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

  // Get available time slots (30-minute intervals, 24 hours)
  // In edit mode, always include the existing session's start time
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
      return allTimeSlots.map(time => ({ 
        time, 
        disabled: !(isEditMode && time === existingStartTime),
      }));
    }

    if (isTomorrow) {
      // After 6:00 PM today, tomorrow is no longer bookable at all
      if (!isTomorrowBookable(moment())) {
        return allTimeSlots.map(time => ({
          time,
          disabled: !(isEditMode && time === existingStartTime),
        }));
      }
      // Tomorrow before 6 PM: times that are at least 24 hours away (include exactly 24h to match backend and UK scenario)
      // Exception: In edit mode, the existing start time is always available
      return allTimeSlots.map(time => {
        const timeMoment = moment(`${formData.date} ${time}`, 'YYYY-MM-DD HH:mm');
        const isAvailable = !timeMoment.isBefore(minBookingTime);
        const isExistingTime = isEditMode && time === existingStartTime;
        return { time, disabled: !isAvailable && !isExistingTime };
      });
    }

    // For dates beyond tomorrow, ALL 24 hours are available (00:00 - 23:30)
    // Business Rule: 24-hour booking availability - no business hours restrictions
    // All times from midnight (00:00) to 11:30 PM (23:30) are available
    return allTimeSlots.map(time => ({ time, disabled: false }));
  }, [formData.date, existingBooking]);


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

  // Adjust duration if it exceeds maximum available duration when date/time changes
  useEffect(() => {
    // Only adjust if we have a date, time, and duration selected
    if (!formData.date || !formData.startTime || !formData.duration) return;
    
    // Only adjust for trainer_choice and custom activity types (package_activity duration is calculated from activities)
    if (formData.activitySelectionType === 'package_activity') return;
    
    // If current duration exceeds maximum available, adjust it
    if (formData.duration > maxAvailableDuration) {
      setFormData(prev => ({
        ...prev,
        duration: maxAvailableDuration,
      }));
    }
  }, [formData.date, formData.startTime, maxAvailableDuration, formData.activitySelectionType, formData.duration]);

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
          ? `Session exceeds maximum available time. Maximum ${formatDurationDisplay(maxAvailableDuration)} available from ${moment(formData.startTime, 'HH:mm').format('h:mm A')} until 11:59 PM on ${moment(formData.date).format('MMMM D, YYYY')}.`
          : BOOKING_VALIDATION_MESSAGES.SESSION_TOO_LONG;
      toastManager.error(errorMessage);
      return;
    }

    setIsSubmitting(true);
    
    // Debug: Log formData being sent to submit handler
    console.log('[ParentBookingModal] formData:', {
      date: formData.date,
      startTime: formData.startTime,
      childId: formData.childId,
      activitySelectionType: formData.activitySelectionType,
      selectedActivityIds: formData.selectedActivityIds,
      duration: formData.duration,
      notes: formData.notes,
    });
    
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
      console.error('Failed to save booking:', error);
      toastManager.error(error instanceof Error ? error.message : 'Failed to save booking. Please try again.');
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
  const remainingDuration = Math.max(0, maxAvailableDuration - sessionDuration);

  // Cap activity selection by BOTH (1) remaining package hours and (2) session max (until 11:59 PM)
  // So parents cannot add activities beyond what the session allows — no "exceeds 6h" surprise after the fact
  const isActivityDisabledByRemainingHours = useCallback(
    (activityId: number, duration: number) => {
      const isSelected = formData.selectedActivityIds?.includes(activityId) ?? false;
      if (isSelected) return false; // Allow unchecking
      // In edit mode, allow selecting so parent can swap activities; validation will block submit if over cap
      if (isEditMode) return false;
      return sessionDuration + duration > selectedChildRemainingHours;
    },
    [formData.selectedActivityIds, sessionDuration, selectedChildRemainingHours, isEditMode]
  );
  const isActivityDisabledBySessionCap = useCallback(
    (activityId: number, duration: number) => {
      const isSelected = formData.selectedActivityIds?.includes(activityId) ?? false;
      if (isSelected) return false; // Allow unchecking to remove
      // In edit mode, allow selecting so parent can swap activities; validation will block submit if over cap
      if (isEditMode) return false;
      return sessionDuration + duration > maxAvailableDuration;
    },
    [formData.selectedActivityIds, sessionDuration, maxAvailableDuration, isEditMode]
  );
  const isActivityDisabled = useCallback(
    (activityId: number, duration: number) => {
      const byHours = isActivityDisabledByRemainingHours(activityId, duration);
      const bySession = isActivityDisabledBySessionCap(activityId, duration);
      return byHours || bySession;
    },
    [isActivityDisabledByRemainingHours, isActivityDisabledBySessionCap]
  );
  const hasReachedRemainingHoursCap = sessionDuration >= selectedChildRemainingHours && selectedChildRemainingHours < 24;
  const hasReachedSessionCap = sessionDuration >= maxAvailableDuration;

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
      <form ref={formRef} onSubmit={handleSubmit} id="booking-form" className="space-y-4 sm:space-y-5">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar size={14} className="inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              min={minBookingDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Child Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User size={14} className="inline mr-1" />
              Child <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.childId}
              onChange={(e) => setFormData(prev => ({ ...prev, childId: parseInt(e.target.value, 10) }))}
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
              <p className="text-xs text-gray-600 mt-1">
                You do not yet have any approved children to book for.{' '}
                {onAddChild ? (
                  <button
                    type="button"
                    onClick={() => onAddChild()}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Add child
                  </button>
                ) : (
                  <Link href={ROUTES.DASHBOARD_PARENT} className="text-blue-600 hover:underline font-medium">
                    Go to dashboard to add a child
                  </Link>
                )}{' '}
                to create a child profile before booking a session.
              </p>
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

          {/* Activity Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock size={14} className="inline mr-1" />
              Activity Start Time <span className="text-red-500">*</span>
            </label>
            <select
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
                      {moment(time, 'HH:mm').format('h:mm A')}{isExistingTime ? ' (current)' : ''}
                    </option>
                  );
                });
              })()}
            </select>
            {(() => {
              const availableTimes = availableTimeSlots.filter(({ disabled }) => !disabled);
              
                if (!formData.startTime) {
                if (!formData.date) {
                  return (
                    <p className="text-xs text-gray-500 mt-1">
                      Please select a date first to see available times
                    </p>
                  );
                }

                  if (selectedChildHasNoHours && !isEditMode) {
                    return (
                      <p className="text-xs text-amber-600 mt-1">
                        <AlertTriangle className="inline w-3 h-3 mr-1" />
                        {selectedChildNeedsTopUp ? 'Top up to unlock time selection.' : 'Buy hours to unlock time selection.'}
                      </p>
                    );
                  }
                  if (!canSelectStartTime) {
                    return (
                      <p className="text-xs text-gray-500 mt-1">
                        Please select a child before choosing a start time
                      </p>
                    );
                  }
                if (availableTimes.length === 0) {
                  return (
                    <p className="text-xs text-amber-600 mt-1">
                      <AlertTriangle className="inline w-3 h-3 mr-1" />
                      No times for this date. Pick a date from the calendar above.
                    </p>
                  );
                }
                
                return (
                  <p className="text-xs text-gray-500 mt-1">
                    {availableTimes.length} available time{availableTimes.length !== 1 ? 's' : ''} • Select a start time
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
            {/* Show session duration and end time */}
            {formData.startTime && sessionEndTime.display && (
              <div className={`mt-2 p-2 border rounded-lg ${
                isDurationValid 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-amber-50 border-amber-300'
              }`}>
                <p className="text-xs text-gray-700">
                  <span className="font-semibold">Session:</span> {moment(formData.startTime, 'HH:mm').format('h:mm A')} - {sessionEndTime.display}
                  {sessionEndTime.isNextDay && <span className="text-blue-600 font-medium"> (next day)</span>}
                </p>
                <p className={`text-xs mt-0.5 font-medium ${
                  isDurationValid ? 'text-green-700' : 'text-amber-700'
                }`}>
                  {isDurationValid ? (
                    <>
                      <span className="text-green-600">✓ </span>
                      Duration: {formatDurationDisplay(sessionDuration)} (Valid)
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="inline w-3 h-3 mr-1" />
                      Duration: {formatDurationDisplay(sessionDuration)}
                    </>
                  )}
                </p>
                {!isDurationValid && (
                  <p className="text-xs text-amber-600 mt-1">
                    {sessionDuration < MIN_DURATION_HOURS 
                      ? `⚠️ Sessions must be at least ${MIN_DURATION_HOURS} hours. Add ${formatDurationDisplay(getHoursNeededForMinimum(sessionDuration))} more.` 
                      : `⚠️ Maximum ${formatDurationDisplay(maxAvailableDuration)} available (until 11:59 PM on ${moment(formData.date).format('MMM D')}).`
                    }
                  </p>
                )}
                {isDurationValid && sessionDuration >= MIN_DURATION_HOURS && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Meets {MIN_DURATION_HOURS}-hour minimum
                    {maxAvailableDuration > sessionDuration && ` • Can book up to ${formatDurationDisplay(maxAvailableDuration)}${selectedChildRemainingHours < 24 && maxAvailableDuration <= selectedChildRemainingHours ? ' (package limit)' : ''}`}
                  </p>
                )}
            </div>
            )}
          </div>

          {/* Activity Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Activity size={14} className="inline mr-1" />
              Activity Selection <span className="text-red-500">*</span>
            </label>

            {!canSelectActivities && (
              <p className="text-xs text-gray-500 mb-2">
                {selectedChildHasNoHours
                  ? (selectedChildNeedsTopUp ? 'This child has no hours left. Top up to add more hours.' : 'This child has no package. Buy hours to book sessions.')
                  : '⏰ Please select a start time first. We need to know when the session starts to calculate the available duration (until 11:59 PM on the same day).'}
              </p>
            )}

            {/* STEP 1: Selection Mode – three clear options */}
            <div
              className={`space-y-2 mb-3 ${
                !canSelectActivities ? 'opacity-60 pointer-events-none select-none' : ''
              }`}
              aria-disabled={!canSelectActivities}
            >
              {/* Mode A: Parent chooses all activities */}
              <label className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="activitySelectionMode"
                  value="all_parent"
                  checked={selectionMode === 'all_parent'}
                  onChange={() => handleSelectionModeChange('all_parent')}
                  className="mt-1"
                  disabled={!canSelectActivities}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    I&apos;ll choose all activities
                  </div>
                </div>
              </label>

              {/* Mode C: Trainer chooses everything */}
              <label className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="activitySelectionMode"
                  value="all_trainer"
                  checked={selectionMode === 'all_trainer'}
                  onChange={() => handleSelectionModeChange('all_trainer')}
                  className="mt-1"
                  disabled={!canSelectActivities}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    Trainer chooses everything
                  </div>
                </div>
              </label>
            </div>

            {/* STEP 2: Based on selection mode */}
            {selectionMode !== 'all_trainer' && (
              <div ref={parentModeSectionRef} className="space-y-3">
                {/* Section 1: Standard Activities (database-backed) */}
                <section className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="font-medium text-sm text-gray-900 mb-1">
                    Standard Activities
                  </div>

                  <div className="mt-2 space-y-2">
                    {/* Loading state */}
                    {loadingActivities && (
                      <div className="py-2" aria-busy="true" aria-label="Loading activities">
                        <ListRowsSkeleton count={SKELETON_COUNTS.LIST_ROWS} />
                      </div>
                    )}
                    {/* Error state */}
                    {activitiesError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-700 font-medium">
                          <AlertTriangle className="inline w-4 h-4 mr-1" />
                          Failed to load activities
                        </p>
                        <p className="text-xs text-red-600 mt-1">{activitiesError}</p>
                      </div>
                    )}
                    {/* Activities loaded successfully */}
                    {!loadingActivities && !activitiesError && availableActivities.length > 0 && (
                      <>
                        {/* Search box for 500+ activities */}
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={activitySearch}
                            onChange={(e) => setActivitySearch(e.target.value)}
                            placeholder="Search activities..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        {/* Cap message: once remaining hours are used, no more activities can be added */}
                        {/* Session cap upfront: so parents know the limit before selecting */}
                        {canSelectActivities && formData.date && formData.startTime && (
                          <p className="text-xs text-gray-700 bg-blue-50 border border-blue-200 rounded px-2 py-1.5 mb-2">
                            Add activities up to <strong>{formatDurationDisplay(maxAvailableDuration)}</strong> for this session
                            {selectedChildRemainingHours < 24 && maxAvailableDuration <= selectedChildRemainingHours
                              ? ` (${formatDurationDisplay(selectedChildRemainingHours)} left in package).`
                              : ` (until 11:59 PM on ${moment(formData.date).format('MMM D')}).`}
                          </p>
                        )}
                        {hasReachedRemainingHoursCap && !hasReachedSessionCap && (
                          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 mb-2">
                            You&apos;ve used all {selectedChildRemainingHours}h for this package. Remove an activity to swap, or buy more hours.
                          </p>
                        )}
                        {hasReachedSessionCap && (
                          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 mb-2">
                            Session is full ({formatDurationDisplay(maxAvailableDuration)} max until 11:59 PM). Remove an activity to swap, or choose an earlier start time for a longer session.
                          </p>
                        )}
                        {/* Multiple activity selection - checkboxes (Fixed max height) */}
                        <div className="border border-gray-300 rounded-lg h-48 overflow-y-auto p-2 space-y-1">
                          {filteredActivities.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">
                              {EMPTY_STATE.NO_ACTIVITIES_FOUND_DROPDOWN.title}
                            </p>
                          )}
                          {filteredActivities.map(activity => {
                            const disabledByHours = isActivityDisabledByRemainingHours(activity.id, activity.duration);
                            const disabledBySession = isActivityDisabledBySessionCap(activity.id, activity.duration);
                            const disabled = disabledByHours || disabledBySession;
                            return (
                              <label
                                key={activity.id}
                                className={`flex items-start gap-3 p-2 rounded transition-colors ${
                                  disabled
                                    ? 'cursor-not-allowed opacity-60 bg-gray-50'
                                    : 'hover:bg-gray-50 cursor-pointer'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.selectedActivityIds?.includes(activity.id) || false}
                                  disabled={disabled}
                                  onChange={(e) => {
                                    if (disabled) return;
                                    const isChecked = e.target.checked;
                                    setFormData(prev => {
                                      const currentIds = prev.selectedActivityIds || [];
                                      return {
                                        ...prev,
                                        selectedActivityIds: isChecked
                                          ? [...currentIds, activity.id]
                                          : currentIds.filter(id => id !== activity.id)
                                      };
                                    });
                                  }}
                                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                                  aria-describedby={disabled ? `activity-${activity.id}-reason` : undefined}
                                />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {activity.name}
                                  </div>
                                  <div className="text-xs text-gray-600" id={disabled ? `activity-${activity.id}-reason` : undefined}>
                                    Duration: {formatActivityDurationDisplay(activity.duration)}
                                    {activity.category && ` • ${activity.category.replace('_', ' ')}`}
                                    {disabledBySession && (
                                      <span className="block text-amber-600 mt-0.5">
                                        Session max for this time is {formatDurationDisplay(maxAvailableDuration)} (until 11:59 PM)
                                      </span>
                                    )}
                                    {disabledByHours && !disabledBySession && (
                                      <span className="block text-amber-600 mt-0.5">
                                        Would exceed {selectedChildRemainingHours}h remaining in package
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                        {/* Show count and filter info */}
                        <p className="text-xs text-gray-600">
                          {activitySearch &&
                            `${filteredActivities.length} of ${availableActivities.length} activities`}
                          {!activitySearch &&
                            `${filteredActivities.length} activities available (all durations)`}
                        </p>
                      </>
                    )}
                    {/* No activities in database */}
                    {(!loadingActivities &&
                      !activitiesError &&
                      availableActivities.length === 0) ? (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-700 font-medium">
                          <AlertTriangle className="inline w-4 h-4 mr-1" />
                          {EMPTY_STATE.NO_ACTIVITIES_FOUND_IN_DATABASE.title}
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          Please contact support if this issue persists.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </section>

                {/* Section 2: Add Custom Activity (optional, collapsible) */}
                {canSelectActivities && (
                  <section className="border border-purple-200 rounded-lg bg-purple-50/40">
                    <button
                      type="button"
                      onClick={() => setShowCustomSection(prev => !prev)}
                      className="w-full flex items-center justify-between px-3 py-2.5"
                    >
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                          + Add Custom Activity (optional)
                        </p>
                        <p className="text-xs text-gray-600">
                          Use this if you cannot find an activity in the list above.
                        </p>
                      </div>
                      {showCustomSection ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </button>

                    {showCustomSection && (
                      <div className="border-t border-purple-200 px-3 pb-3">
                        <CustomActivityInlineEditor
                          maxAvailableDuration={remainingDuration}
                          onAdd={(name, duration) => {
                            if (!name.trim() || duration <= 0) return;
                            setShowCustomSection(true);
                            setFormData(prev => ({
                              ...prev,
                              activitySelectionType:
                                prev.activitySelectionType === 'trainer_choice' ? 'package_activity' : prev.activitySelectionType,
                              customActivities: [...(prev.customActivities || []), { name: name.trim(), duration }],
                            }));
                          }}
                        />
                      </div>
                    )}
                  </section>
                )}

                {/* Section 3: Selected Activities – standard + custom combined */}
                {(totalSelectedActivities > 0 || sessionDuration > 0) && (
                  <section className={`p-3 border rounded-lg space-y-2 ${
                    sessionDuration > maxAvailableDuration
                      ? 'bg-red-50 border-red-200'
                      : sessionDuration >= MIN_DURATION_HOURS
                        ? 'bg-green-50 border-green-200'
                        : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-medium ${
                        sessionDuration > maxAvailableDuration
                          ? 'text-red-700'
                          : sessionDuration >= MIN_DURATION_HOURS
                            ? 'text-green-700'
                            : 'text-amber-700'
                      }`}>
                        {sessionDuration > maxAvailableDuration ? (
                          <>
                            {totalSelectedActivities} activity(ies) • {formatDurationDisplay(sessionDuration)} selected — max for this session is {formatDurationDisplay(maxAvailableDuration)} (until 11:59 PM). Remove activities or choose an earlier start time.
                          </>
                        ) : (
                          <>
                            {sessionDuration >= MIN_DURATION_HOURS ? '✓ ' : '⚠️ '}
                            {totalSelectedActivities} activity(ies) • Total: {formatDurationDisplay(sessionDuration)}
                            {sessionDuration < MIN_DURATION_HOURS && (
                              <span className="text-amber-600">
                                {' '}
                                (Need {formatDurationDisplay(getHoursNeededForMinimum(sessionDuration))} more)
                              </span>
                            )}
                            {sessionDuration >= MIN_DURATION_HOURS && (
                              <span className="text-green-600">
                                {' '}
                                (Meets {MIN_DURATION_HOURS}h minimum • up to {formatDurationDisplay(maxAvailableDuration)} for this session)
                              </span>
                            )}
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
                        className="text-xs text-gray-600 hover:text-gray-800 hover:underline"
                      >
                        Clear all
                      </button>
                    </div>
                    {sessionDuration > maxAvailableDuration ? (
                      <p className="text-2xs text-red-700">
                        Adding more package hours won&apos;t extend the session past 11:59 PM. Remove activities or pick an earlier start time.
                      </p>
                    ) : maxAvailableDuration > sessionDuration && (
                      <p className="text-2xs text-gray-600">
                        Available: {formatDurationDisplay(maxAvailableDuration - sessionDuration)} remaining for this session
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {formData.selectedActivityIds?.map(activityId => {
                        const activity = availableActivities.find(a => a.id === activityId);
                        if (!activity) return null;
                        return (
                          <span
                            key={activityId}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
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
                              className="ml-0.5 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
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
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full"
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
                            className="ml-0.5 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                            aria-label={`Remove ${custom.name}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      {formData.customActivityName && (
                        <span
                          key="custom-activity-chip-legacy"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full"
                        >
                          Custom: {formData.customActivityName}
                        </span>
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Trainer-only mode: duration selector with explanation */}
            {selectionMode === 'all_trainer' && canSelectActivities && (
              <div
                ref={trainerModeSectionRef}
                className="mt-2 p-3 border border-gray-300 rounded-lg bg-blue-50/40"
              >
                <div className="font-medium text-sm text-gray-900 mb-1">Trainer&apos;s choice</div>
                <p className="text-xs text-gray-600 mb-2">
                  The trainer will select all activities for this session based on your child&apos;s
                  needs. You only need to choose how long the session should be.
                </p>
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Session Duration <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.duration ?? MIN_DURATION_HOURS}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        duration: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {(() => {
                      const maxHours = maxAvailableDuration;
                      const options = [];
                      // Half-hour steps from MIN_DURATION_HOURS up to max (e.g. 3, 3.5, 4 when 4h remaining)
                      for (let h = MIN_DURATION_HOURS; h <= maxHours; h += 0.5) {
                        const value = Math.round(h * 10) / 10;
                        options.push(
                          <option key={value} value={value}>
                            {value} {value === 1 ? 'hour' : 'hours'}
                          </option>
                        );
                      }
                      return options;
                    })()}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum {MIN_DURATION_HOURS} hours required
                    {formData.date && formData.startTime && maxAvailableDuration > MIN_DURATION_HOURS && (
                      <span className="text-green-600">
                        {' '}
                        • Up to {formatDurationDisplay(maxAvailableDuration)} available
                      </span>
                    )}
                    {formData.date && formData.startTime && maxAvailableDuration === MIN_DURATION_HOURS && (
                      <span className="text-amber-600">
                        {' '}
                        • {formatDurationDisplay(maxAvailableDuration)} max (until 11:59 PM)
                      </span>
                    )}
                    {selectedChildRemainingHours < 24 && !isEditMode && (
                      <span className="block mt-0.5 text-blue-600">
                        {selectedChildRemainingHours.toFixed(1)}h remaining in package
                      </span>
                    )}
                  </p>
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

          {/* Validation warnings */}
          {(!isDurationValid || !isTimeValid) && formData.startTime && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700 font-medium text-center">
                <AlertTriangle className="inline w-4 h-4 mr-1" />
                {!isTimeValid && (!dateBookingStatus.bookable ? `${getMessageForDateReason(dateBookingStatus.reason, { now: moment() })} ` : `${BOOKING_VALIDATION_MESSAGES.INSUFFICIENT_NOTICE}. `)}
                {!isDurationValid && (
                  sessionDuration < MIN_DURATION_HOURS 
                    ? `Sessions must be at least ${MIN_DURATION_HOURS} hours. Select more activities or increase duration.`
                    : `Session exceeds ${formatDurationDisplay(maxAvailableDuration)} maximum (until 11:59 PM on selected date).`
                )}
              </p>
            </div>
          )}

          {/* Add hours: Top up (has package) or Buy hours (no package) – only when package hours are the limit; hide in edit mode */}
          {formData.childId && selectedChildRemainingHours < 24 && (onTopUp || onBuyMoreHours) && !(sessionDuration > maxAvailableDuration) && !isEditMode && (
            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                {selectedChildRemainingHours <= 0
                  ? 'No hours left in this package.'
                  : `Only ${selectedChildRemainingHours.toFixed(1)}h left in this package.`}
                {' '}
                Need more? {selectedChildHasPackage ? 'Top up' : 'Buy hours'} before booking.
              </p>
              <button
                type="button"
                onClick={() => (selectedChildHasPackage && onTopUp ? onTopUp(formData.childId) : onBuyMoreHours?.(formData.childId))}
                className="mt-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 underline focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 rounded"
              >
                {selectedChildHasPackage && onTopUp ? 'Top up' : 'Buy hours'}
              </button>
            </div>
          )}
      </form>
  );

  if (renderAsPanel && isOpen) {
    return (
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
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              aria-label="Close panel"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {formContent}
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50 dark:bg-gray-800/50">
            {footerContent}
          </div>
        </div>
      </>
    );
  }

  return (
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
}
