'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import moment from 'moment';
import { parseSessionNotes, formatSessionNotes } from './sessionNotes/SessionNoteParser';
import { UniversalItineraryData, ItineraryService } from '@/interfaces/web/shared/itineraries/services/ItineraryService';
import { Calendar as CalendarIcon, Clock, ChevronDown, ChevronUp, Info, Car, CheckCircle, School, Stethoscope, BookOpen, Plus as PlusIcon, X, User } from 'lucide-react';
import { getSuggestedPickupOptions } from '@/interfaces/web/shared/itineraries/shared/pickupUtils';
import TimePicker from './pickers/TimePicker';
import DurationPicker from './pickers/DurationPicker';
import HorizontalCalendar from './calendars/HorizontalCalendar';
import CalendarBookingFlow from './sessionBuilder/CalendarBookingFlow';
// ActivityService now handles activity utilities
// Modular components
import { getTemplateForMode } from '@/interfaces/web/shared/itineraries/universal/templateRegistry';
import { useUniversalItinerary } from '@/interfaces/web/shared/itineraries/universal/useUniversalItinerary';
import ActivityPicker from './pickers/ActivityPicker';
import SessionPreview from './previews/SessionPreview';
import ActivitiesSection from './sessionBuilder/ActivitiesSection';
import SimpleActivitiesSection from './sessionBuilder/SimpleActivitiesSection';
import DatePickerSection from './sessionBuilder/DatePickerSection';
import TimeAndDurationSection from './sessionBuilder/TimeAndDurationSection';
import AdvancedOptionsSection from './sessionBuilder/AdvancedOptionsSection';
import ReviewCTA from './sessionBuilder/ReviewCTA';
import Button from '@/components/ui/Button';
import { formatHours } from '@/utils/formatHours';
import { DateService } from '@/infrastructure/services/calendar';
import { ActivityService } from '@/core/application/activities/services';
import {
  MODE_KEYS,
  TRAINER_CHOICE_MODES,
  HIDE_ACTIVITY_PICKER_MODES,
  ITINERARY_MODES,
  BOOKING_PRESETS,
  DEFAULT_START_TIME,
  SCHOOL_PICKUP_TIME,
  SCHOOL_END_TIME,
  MIN_DURATION_HOURS,
  MAX_DEFAULT_DURATION_HOURS,
  DEFAULT_WAITING_ROOM_DURATION_HOURS,
  DEFAULT_EXAM_DURATION_HOURS,
  HOMEWORK_TIME_HOURS,
  TRAVEL_TIME_DIFFERENT_ADDRESS_HOURS,
  TRAVEL_TIME_SAME_ADDRESS_HOURS,
  MAX_PREFERRED_ACTIVITIES,
  LOCATION_BASED_ACTIVITY_ID_THRESHOLD,
  DURATION_FILTER_THRESHOLDS,
  ACTIVITY_SCORING_WEIGHTS,
  ACTIVITY_KEYWORDS,
  UI_TEXT,
  MAX_RECENT_ADDRESSES,
  PROGRESS_STEPS,
  STORAGE_KEYS,
  DEFAULTS,
  calculateDefaultDuration,
  formatCustomDuration,
  calculateSafeHours,
} from './sessionBuilder/constants';
import { BookingActivity, LocationInfo, TrainerSummary } from './sessionBuilder/types';
import { useSessionMode } from './sessionBuilder/hooks/useSessionMode';
import { getModeRegistry } from './sessionBuilder/modes/registerModes';
import { useActivitySelection } from './sessionBuilder/hooks/useActivitySelection';
import { useAutoAdvancePreference } from './sessionBuilder/hooks/useAutoAdvancePreference';
import { useSessionEditing } from './sessionBuilder/hooks/useSessionEditing';
import { useItineraryCalculations } from './sessionBuilder/hooks/useItineraryCalculations';

type Activity = BookingActivity;

interface BookedSession {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  activities: Array<{ id: number; name: string; duration: number }>;
  customActivities?: Array<{ name: string; duration: number; description?: string; equipment?: string }>;
  trainer?: { id: number; name: string; specialty?: string };
  trainerId?: number;
  trainerChoice?: boolean;
  notes?: string;
}

interface SessionBuilderProps {
  remainingHours: number;
  totalPackageHours?: number; // Total hours in the package (for correct time budget display)
  suggestedActivities: BookingActivity[];
  existingSessions: BookedSession[];
  location?: LocationInfo;
  activityStats?: { total: number; available: number; filtered: number };
  selectedTrainerId?: number | null; // Initial trainer selection (from parent)
  selectedTrainerSummary?: TrainerSummary | null;
  initialModeKey?: string | null;
  parentAddress?: string;
  packageActivities?: Array<{ id: number; name: string; trainerIds: number[] }>;
  availableTrainers?: Array<{ id: number; name: string; imageSrc?: string; imageAlt?: string; rating?: number; role?: string; serviceRegions?: string[]; serviceAreaPostcodes?: string[] }>; // Optional trainers for selection
  initialEditSessionIndex?: number | null; // Index of session to edit
  preferredActivityIds?: number[];
  blockedDates?: string[]; // Dates booked in other bookings for this child
  minDate?: string; // Minimum selectable date (YYYY-MM-DD) - package start date
  maxDate?: string; // Maximum selectable date (YYYY-MM-DD) - based on package weeks constraint
  totalWeeks?: number; // Package duration in weeks - for display purposes
  onBookedDateClick?: (date: string, session: BookedSession) => void; // NEW: Handler for clicking booked dates on calendar
  onAddSession: (sessionData: {
    date: string;
    startTime: string;
    duration: number;
    endTime: string;
    selectedActivityIds: number[];
    customActivities: Array<{ name: string; duration: number; description?: string; equipment?: string }>;
    trainerChoice: boolean;
    trainerId?: number;
    notes?: string;
  }) => void;
  onUpdateSession: (index: number, sessionData: {
    date: string;
    startTime: string;
    duration: number;
    endTime: string;
    selectedActivityIds?: number[];
    customActivities?: Array<{ name: string; duration: number; description?: string; equipment?: string }>;
    trainerChoice?: boolean;
    trainerId?: number;
    notes?: string;
  }) => void;
  onSessionDurationChange?: (duration: number) => void; // Callback to notify parent of current session duration
  useCalendarFlow?: boolean; // NEW: Enable Calendar-First Booking Flow (Option 1)
}

const SessionBuilder: React.FC<SessionBuilderProps> = ({
  remainingHours,
  totalPackageHours,
  suggestedActivities,
  existingSessions,
  location,
  activityStats,
  selectedTrainerId: initialSelectedTrainerId,
  selectedTrainerSummary: initialSelectedTrainerSummary,
  initialModeKey = null,
  parentAddress,
  packageActivities = [],
  availableTrainers = [],
  initialEditSessionIndex = null,
  preferredActivityIds = [],
  blockedDates = [],
  minDate,
  maxDate,
  totalWeeks,
  onBookedDateClick,
  onAddSession,
  onUpdateSession,
  onSessionDurationChange,
  useCalendarFlow = true, // NEW: Enable Calendar-First Booking Flow by default
}) => {
  // Defaults
  const defaultStartTime = DEFAULT_START_TIME;
  const defaultDuration = calculateDefaultDuration(remainingHours);

  // State
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState<string>(defaultStartTime);
  const [duration, setDuration] = useState(defaultDuration);
  const [notes, setNotes] = useState('');
  
  // Calendar-First Booking Flow state
  const [calendarFlowComplete, setCalendarFlowComplete] = useState(false);
  const [isReturningFromReview, setIsReturningFromReview] = useState(false);
  const [initialStep, setInitialStep] = useState<'date' | 'activities' | 'time' | 'trainer' | 'custom-time' | undefined>(undefined);

  // Load existing session data when editing
  useEffect(() => {
    const editIndex = initialEditSessionIndex;
    if (editIndex !== null && editIndex >= 0 && existingSessions[editIndex]) {
      const session = existingSessions[editIndex];
      setSelectedDate(session.date);
      setStartTime(session.startTime);
      setDuration(session.duration);
      setNotes(session.notes || '');
      // Pre-populate activities if they exist in the session
      if (session.activities && session.activities.length > 0) {
        const activityIds = session.activities
          .filter(a => a.id && typeof a.id === 'number')
          .map(a => a.id as number);
        setSelectedActivityIds(activityIds);
      }
      // When editing, show review section immediately so parents can see and edit the session
      // This prevents confusion - parents see the full session details right away
      setCalendarFlowComplete(true);
    } else {
      // Reset to defaults when not editing
      setCalendarFlowComplete(false);
    }
  }, [initialEditSessionIndex, existingSessions]);

  // Auto-advance preference
  const { autoAdvanceNextDay, setAutoAdvanceNextDay } = useAutoAdvancePreference();
  // Activity search & filters
  const [activitySearch, setActivitySearch] = useState('');
  const [durationFilter, setDurationFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  // Booking presets - initialize with initialModeKey if provided
  const [selectedPresetKey, setSelectedPresetKey] = useState<string | null>(initialModeKey || null);
  // Trainer selection (optional - can be null for "No preference")
  const [sessionSelectedTrainerId, setSessionSelectedTrainerId] = useState<number | null>(initialSelectedTrainerId || null);
  
  // Use session-level trainer selection if set, otherwise fall back to prop
  const effectiveSelectedTrainerId = sessionSelectedTrainerId !== null ? sessionSelectedTrainerId : initialSelectedTrainerId;
  
  // Calculate selected trainer summary from selected trainer
  // Note: Uses availableTrainers directly (filteredTrainers is defined later and is just a filtered subset)
  const selectedTrainerSummary = useMemo(() => {
    if (effectiveSelectedTrainerId === null) return initialSelectedTrainerSummary || null;
    const trainer = availableTrainers.find(t => t.id === effectiveSelectedTrainerId);
    if (!trainer) return null;
    return {
      id: trainer.id,
      name: trainer.name,
      imageSrc: trainer.imageSrc,
    };
  }, [effectiveSelectedTrainerId, availableTrainers, initialSelectedTrainerSummary]);
  
  // Helper flags derived from centralized mode definitions
  const {
    modeHandler,
    requiresTrainerChoice,
    hidesActivityPicker,
    usesItineraryRenderer,
    isSingleDayEvent,
    isMultiDayEvent,
    isSchoolRun,
    isHospitalAppointment,
    isExamSupport,
    isEventMode,
  } = useSessionMode(selectedPresetKey);

  const {
    selectedActivityIds,
    setSelectedActivityIds,
    trainerChoice,
    setTrainerChoice,
    showCustomForm,
    setShowCustomForm,
    // Custom activities array (FIXED: Now supports multiple)
    customActivities,
    setCustomActivities,
    // Custom activity form state
    customName,
    setCustomName,
    customDuration,
    setCustomDuration,
    customDescription,
    setCustomDescription,
    customEquipment,
    setCustomEquipment,
    equipmentOption,
    setEquipmentOption,
    editingCustomActivityId,
    // Custom activity functions
    handleAddCustomActivity,
    handleEditCustomActivity,
    handleDeleteCustomActivity,
    handleCustomFormVisibilityChange,
    handleCustomActivityReset,
    handleTrainerChoiceChange,
    resetCustomActivityForm,
  } = useActivitySelection({
    preferredActivityIds,
    requiresTrainerChoice,
    defaultDuration,
    currentDuration: duration,
  });

  const bookingPresets = useMemo(() => BOOKING_PRESETS, []);

  const preferenceNameLookup = useMemo(
    () =>
      preferredActivityIds
        .map((id) => suggestedActivities.find((activity) => activity.id === id)?.name)
        .filter((name): name is string => Boolean(name)),
    [preferredActivityIds, suggestedActivities]
  );

  // Extract package activity IDs for highlighting (not filtering)
  const packageActivityIds = useMemo(() => {
    const ids = new Set<number>();
    packageActivities.forEach((activity) => {
      if (activity.id && !isNaN(activity.id)) {
        ids.add(activity.id);
      }
    });
    return ids;
  }, [packageActivities]);

  // Hybrid trainer filtering: Location-based + Activity-based trainers
  // ALWAYS show location-based trainers (if location available)
  // ALSO show activity-based trainers (if activities selected)
  const filteredTrainers = useMemo(() => {
    if (!availableTrainers || availableTrainers.length === 0) {
      return [];
    }

    // Step 1: Separate trainers into location-based and activity-based
    const locationBasedTrainers: typeof availableTrainers = [];
    const activityBasedTrainers: typeof availableTrainers = [];
    const trainerMap = new Map<number, typeof availableTrainers[0] & { isLocationBased?: boolean; isActivityBased?: boolean }>();

    // Step 2: Filter by location (if location is available) - ALWAYS show these
    if (location && (location.region || location.postcode)) {
      availableTrainers.forEach(trainer => {
        // Check if trainer serves this location
        const serviceRegions = trainer?.serviceRegions ?? [];
        const serviceAreaPostcodes = trainer?.serviceAreaPostcodes ?? [];
        
        const matchesLocation = 
          (location.region && serviceRegions.includes(location.region)) ||
          (location.postcode && serviceAreaPostcodes.some((pc: string) => {
            // Match postcode prefix (e.g., "AL1" matches "AL1 2AB")
            const postcodePrefix = location.postcode?.split(' ')[0].substring(0, 2).toUpperCase();
            const trainerPostcodePrefix = pc.substring(0, 2).toUpperCase();
            return postcodePrefix === trainerPostcodePrefix;
          }));

        if (matchesLocation) {
          const trainerWithBadge = { ...trainer, isLocationBased: true };
          trainerMap.set(trainer.id, trainerWithBadge);
          locationBasedTrainers.push(trainerWithBadge);
        }
      });
    }

    // Step 3: Filter by selected activities (if any activities are selected) - ADD these to the list
    if (selectedActivityIds.length > 0 && packageActivities.length > 0) {
      // Get all trainer IDs associated with selected activities
      const activityTrainerIds = new Set<number>();
      selectedActivityIds.forEach(activityId => {
        const activity = packageActivities.find(a => a.id === activityId);
        if (activity && activity.trainerIds) {
          activity.trainerIds.forEach(trainerId => activityTrainerIds.add(trainerId));
        }
      });

      // Add trainers that support selected activities
      availableTrainers.forEach(trainer => {
        if (activityTrainerIds.has(trainer.id)) {
          const existing = trainerMap.get(trainer.id);
          if (existing) {
            existing.isActivityBased = true;
          } else {
            const trainerWithBadge = { ...trainer, isActivityBased: true };
            trainerMap.set(trainer.id, trainerWithBadge);
            activityBasedTrainers.push(trainerWithBadge);
          }
        }
      });
    }

    // Step 4: If no location-based trainers found, show ALL trainers (fallback)
    // This ensures trainers are always visible even if location filtering doesn't match
    if (trainerMap.size === 0) {
      availableTrainers.forEach(trainer => {
        trainerMap.set(trainer.id, { ...trainer });
      });
    }

    // Step 5: Combine both lists (deduplicate by trainer ID)
    const combinedTrainers = Array.from(trainerMap.values());

    // Step 6: Rank trainers (location-based first, then activity-based)
    const ranked = combinedTrainers.sort((a, b) => {
      // Prioritize trainers that match both location and activities
      const aBoth = a.isLocationBased && a.isActivityBased ? 3 : 0;
      const bBoth = b.isLocationBased && b.isActivityBased ? 3 : 0;
      if (aBoth !== bBoth) return bBoth - aBoth;

      // Then prioritize location-based
      const aLocation = a.isLocationBased ? 2 : 0;
      const bLocation = b.isLocationBased ? 2 : 0;
      if (aLocation !== bLocation) return bLocation - aLocation;

      // Then prioritize activity-based
      const aActivity = a.isActivityBased ? 1 : 0;
      const bActivity = b.isActivityBased ? 1 : 0;
      if (aActivity !== bActivity) return bActivity - aActivity;

      return 0;
    });

    // Debug logging removed to reduce console spam
    // Uncomment only when debugging trainer filtering issues
    // if (process.env.NODE_ENV === 'development') {
    //   console.log('[SessionBuilder] Trainer Filtering Debug:', {
    //     totalTrainers: availableTrainers.length,
    //     locationBasedCount: locationBasedTrainers.length,
    //     activityBasedCount: activityBasedTrainers.length,
    //     combinedCount: combinedTrainers.length,
    //     rankedCount: ranked.length,
    //     location: location ? { region: location.region, postcode: location.postcode } : 'none',
    //     selectedActivityIds: selectedActivityIds,
    //     showingAllTrainers: trainerMap.size === availableTrainers.length && locationBasedTrainers.length === 0,
    //     note: 'Showing location-based + activity-based trainers (or all trainers if no location match)',
    //   });
    // }

    return ranked;
  }, [availableTrainers, location, selectedActivityIds, packageActivities]);

  const applyPreset = (key: string, hours: number, note: string) => {
    setSelectedPresetKey(key);
    const safeHours = calculateSafeHours(hours, remainingHours);
    setDuration(safeHours);
    setCustomDuration(formatCustomDuration(safeHours));
    setNotes((prev) => prev && prev.length > 0 ? prev : note);
    if (
      key === MODE_KEYS.SINGLE_DAY_EVENT ||
      key === MODE_KEYS.MULTI_DAY_EVENT ||
      key === MODE_KEYS.HOSPITAL_APPOINTMENT ||
      key === MODE_KEYS.CLUB_ESCORT ||
      key === MODE_KEYS.SCHOOL_RUN_AFTER ||
      key === MODE_KEYS.EXAM_SUPPORT
    ) {
      // Focused flow: default to Trainer's Choice and hide activity grid
      setTrainerChoice(true);
      setSelectedActivityIds([]);
      if (
        key === MODE_KEYS.SINGLE_DAY_EVENT ||
        key === MODE_KEYS.MULTI_DAY_EVENT ||
        key === MODE_KEYS.HOSPITAL_APPOINTMENT ||
        key === MODE_KEYS.EXAM_SUPPORT ||
        key === MODE_KEYS.SCHOOL_RUN_AFTER
      ) {
        setAutoCalcFromItinerary(true);
      }
      if (key === MODE_KEYS.SINGLE_DAY_EVENT || key === MODE_KEYS.MULTI_DAY_EVENT) {
        setPickupTimeOverridden(false); // Reset override when preset changes
      }
      if (key === MODE_KEYS.HOSPITAL_APPOINTMENT) {
        setHospitalPickupTimeOverridden(false);
      }
      if (key === MODE_KEYS.EXAM_SUPPORT) {
        setExamPickupTimeOverridden(false);
      }
    }
  };

  // Ensure trainerChoice is always true for event/escort modes
  useEffect(() => {
    if (requiresTrainerChoice) {
      // Always set to true for these modes
      setTrainerChoice(true);
    }
  }, [requiresTrainerChoice]);

  // Apply initial mode on mount - automatically set mode if provided (from booking)
  // This ensures preset settings (duration, trainer choice, etc.) are applied
  useEffect(() => {
    if (initialModeKey && selectedPresetKey === initialModeKey) {
      // Mode is already set, but ensure preset settings are applied
      const preset = bookingPresets.find(p => p.key === initialModeKey);
      if (preset) {
        // Re-apply preset to ensure all settings (duration, trainer choice, etc.) are set
        applyPreset(preset.key, preset.suggestHours, preset.note);
      } else if (initialModeKey === MODE_KEYS.HOSPITAL_APPOINTMENT || initialModeKey === MODE_KEYS.EXAM_SUPPORT) {
        // Handle modes that may not be in bookingPresets but should still be set
        setTrainerChoice(true);
        setSelectedActivityIds([]);
      }
    } else if (initialModeKey && !selectedPresetKey) {
      // Mode not yet set, apply it
      const preset = bookingPresets.find(p => p.key === initialModeKey);
      if (preset) {
        applyPreset(preset.key, preset.suggestHours, preset.note);
      } else if (initialModeKey === MODE_KEYS.HOSPITAL_APPOINTMENT || initialModeKey === MODE_KEYS.EXAM_SUPPORT) {
        setSelectedPresetKey(initialModeKey);
        setTrainerChoice(true);
        setSelectedActivityIds([]);
      } else {
        setSelectedPresetKey(initialModeKey);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialModeKey, selectedPresetKey]);

  

  // Universal Itinerary System - Single source of truth for ALL modes
  const template = getTemplateForMode(selectedPresetKey);
  const {
    itineraryData,
    updateField,
    updateFields,
    getField,
    isValid: hasValidItineraryFromHook,
    missingFields: missingFieldsFromHook,
    suggestedDuration: computeSuggestedDuration,
    effectivePickupTime: effectivePickupTimeFromHook,
    pickupTimeSuggestions,
    effectiveStartTime: effectiveStartTimeFromItinerary,
  } = useUniversalItinerary({
    template,
    parentAddress,
    remainingHours,
    fallbackStartTime: defaultStartTime,
  });

  // Get missing fields from mode handler if available, otherwise use hook's missingFields
  const missingFields = useMemo(() => {
    if (modeHandler) {
      // Mode handler expects undefined (not null) when no template is provided
      return modeHandler.getValidationErrors(itineraryData, template ?? undefined);
    }
    return missingFieldsFromHook || [];
  }, [modeHandler, itineraryData, template, missingFieldsFromHook]);

  // Additional state that's not mode-specific
  const [autoCalcFromItinerary, setAutoCalcFromItinerary] = useState(false);
  const [recentAddresses, setRecentAddresses] = useState<string[]>([]);
  
  // School Run specific (not yet in template system)
  const [includeHomework, setIncludeHomework] = useState(true);
  
  // Multi-day event fields (handled separately for now)
  const [multiDayItinerary, setMultiDayItinerary] = useState<Array<{
    day: number;
    date: string;
    eventAddress: string;
    eventStartTime: string;
    eventEndTime: string;
    overnightLocation?: string;
  }>>([]);

  // School Run fields (not yet in template, keep as direct state for now)
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolPickupTime, setSchoolPickupTime] = useState<string>(SCHOOL_PICKUP_TIME);
  const [schoolEndTime, setSchoolEndTime] = useState<string>(SCHOOL_END_TIME);
  const [schoolDropoffAddress, setSchoolDropoffAddress] = useState('');
  const [schoolDropoffSameAsPickup, setSchoolDropoffSameAsPickup] = useState(false);
  
  // Helper setters that use updateField
  const setPickupAddress = (value: string) => {
    if (template) {
      const transportSeg = template.segments.find(s => s.type === 'transport') as any;
      if (transportSeg) {
        updateField(transportSeg.pickupFieldKeys.pickupAddress, value);
      }
    }
  };
  
  const setPickupTime = (value: string) => {
    if (template) {
      const transportSeg = template.segments.find(s => s.type === 'transport') as any;
      if (transportSeg) {
        updateField(transportSeg.pickupFieldKeys.pickupTime, value);
      }
    }
  };
  
  const setEventAddress = (value: string) => {
    if (template) {
      const stopSeg = template.segments.find(s => s.type === 'stop') as any;
      if (stopSeg) {
        updateField(stopSeg.addressKey, value);
      }
    }
  };
  
  const setEventStartTime = (value: string) => {
    if (template) {
      const stopSeg = template.segments.find(s => s.type === 'stop') as any;
      if (stopSeg?.startTimeKey) {
        updateField(stopSeg.startTimeKey, value);
      }
    }
  };
  
  const setEventEndTime = (value: string) => {
    if (template) {
      const stopSeg = template.segments.find(s => s.type === 'stop') as any;
      if (stopSeg?.endTimeKey) {
        updateField(stopSeg.endTimeKey, value);
      }
    }
  };
  
  const setDropoffAddress = (value: string) => {
    if (template) {
      const transportSeg = template.segments.find(s => s.type === 'transport') as any;
      if (transportSeg) {
        updateField(transportSeg.dropoffFieldKeys.dropoffAddress, value);
      }
    }
  };
  
  const setDropoffSameAsPickup = (value: boolean) => {
    if (template) {
      const transportSeg = template.segments.find(s => s.type === 'transport') as any;
      if (transportSeg) {
        updateField(transportSeg.dropoffFieldKeys.dropoffSameAsPickup, value);
      }
    }
  };
  
  const setIncludeTravel = (value: boolean) => {
    updateField('includeTravel', value);
  };
  
  const setHospitalPickupAddress = (value: string) => {
    if (isHospitalAppointment && template) {
      const transportSeg = template.segments.find(s => s.type === 'transport') as any;
      if (transportSeg) {
        updateField(transportSeg.pickupFieldKeys.pickupAddress, value);
      }
    }
  };
  
  const setHospitalPickupTime = (value: string) => {
    if (isHospitalAppointment && template) {
      const transportSeg = template.segments.find(s => s.type === 'transport') as any;
      if (transportSeg) {
        updateField(transportSeg.pickupFieldKeys.pickupTime, value);
      }
    }
  };

  const setHospitalAddress = (value: string) => {
    if (isHospitalAppointment && template) {
      const stopSeg = template.segments.find(s => s.type === 'stop') as any;
      if (stopSeg) {
        updateField(stopSeg.addressKey, value);
      }
    }
  };

  const setAppointmentTime = (value: string) => {
    if (isHospitalAppointment && template) {
      const stopSeg = template.segments.find(s => s.type === 'stop') as any;
      if (stopSeg?.startTimeKey) {
        updateField(stopSeg.startTimeKey, value);
      }
    }
  };
  
  
  const setWaitingRoomDuration = (value: string) => {
    if (isHospitalAppointment && template) {
      const waitSeg = template.segments.find(s => s.type === 'wait') as any;
      if (waitSeg) {
        updateField(waitSeg.durationKey, value);
      }
    }
  };
  
  const setHospitalDropoffAddress = (value: string) => {
    if (isHospitalAppointment && template) {
      const transportSeg = template.segments.find(s => s.type === 'transport') as any;
      if (transportSeg) {
        updateField(transportSeg.dropoffFieldKeys.dropoffAddress, value);
      }
    }
  };
  
  const setHospitalDropoffSameAsPickup = (value: boolean) => {
    if (isHospitalAppointment && template) {
      const transportSeg = template.segments.find(s => s.type === 'transport') as any;
      if (transportSeg) {
        updateField(transportSeg.dropoffFieldKeys.dropoffSameAsPickup, value);
      }
    }
  };
  
  const setMedicalNotes = (value: string) => {
    updateField('medicalNotes', value);
  };
  
  const setExamPickupAddress = (value: string) => {
    if (isExamSupport && template) {
      const transportSeg = template.segments.find(s => s.type === 'transport') as any;
      if (transportSeg) {
        updateField(transportSeg.pickupFieldKeys.pickupAddress, value);
      }
    }
  };
  
  const setExamPickupTime = (value: string) => {
    if (isExamSupport && template) {
      const transportSeg = template.segments.find(s => s.type === 'transport') as any;
      if (transportSeg) {
        updateField(transportSeg.pickupFieldKeys.pickupTime, value);
      }
    }
  };
  
  const setExamVenue = (value: string) => {
    if (isExamSupport && template) {
      const stopSeg = template.segments.find(s => s.type === 'stop') as any;
      if (stopSeg) {
        updateField(stopSeg.addressKey, value);
      }
    }
  };
  
  const setExamTime = (value: string) => {
    if (isExamSupport && template) {
      const stopSeg = template.segments.find(s => s.type === 'stop') as any;
      if (stopSeg?.startTimeKey) {
        updateField(stopSeg.startTimeKey, value);
      }
    }
  };
  
  const setExamDuration = (value: string) => {
    updateField('examDuration', value);
  };
  
  const setExamDropoffAddress = (value: string) => {
    if (isExamSupport && template) {
      const transportSeg = template.segments.find(s => s.type === 'transport') as any;
      if (transportSeg) {
        updateField(transportSeg.dropoffFieldKeys.dropoffAddress, value);
      }
    }
  };
  
  const setExamDropoffSameAsPickup = (value: boolean) => {
    if (isExamSupport && template) {
      const transportSeg = template.segments.find(s => s.type === 'transport') as any;
      if (transportSeg) {
        updateField(transportSeg.dropoffFieldKeys.dropoffSameAsPickup, value);
      }
    }
  };
  
  const setExamAccommodations = (value: string) => {
    updateField('examAccommodations', value);
  };
  
  // Pickup time overridden flags (for UI state only)
  const [pickupTimeOverridden, setPickupTimeOverridden] = useState(false);
  const [hospitalPickupTimeOverridden, setHospitalPickupTimeOverridden] = useState(false);
  const [examPickupTimeOverridden, setExamPickupTimeOverridden] = useState(false);

  // Extract all itinerary calculations into a dedicated hook
  const itineraryCalculations = useItineraryCalculations({
    itineraryData,
    template,
    getField,
    isSingleDayEvent,
    isMultiDayEvent,
    isHospitalAppointment,
    isExamSupport,
    isSchoolRun,
    startTime,
    duration,
    pickupTimeOverridden,
    hospitalPickupTimeOverridden,
    examPickupTimeOverridden,
    autoCalcFromItinerary,
    schoolAddress,
    schoolPickupTime,
    schoolEndTime,
    schoolDropoffAddress,
    schoolDropoffSameAsPickup,
    includeHomework,
    pickupTimeSuggestions,
    effectivePickupTimeFromHook: effectivePickupTimeFromHook ?? undefined,
    computeSuggestedDuration,
    effectiveStartTimeFromItinerary,
    parentAddress,
    remainingHours,
    suggestedActivities,
    location,
    selectedTrainerId: effectiveSelectedTrainerId,
    packageActivities,
  });

  // Destructure calculated values from hook
  const {
    pickupAddress,
    pickupTime,
    dropoffAddress,
    dropoffSameAsPickup,
    eventAddress,
    eventStartTime,
    eventEndTime,
    includeTravel,
    hospitalPickupAddress,
    hospitalPickupTime,
    hospitalAddress,
    appointmentTime,
    waitingRoomDuration,
    hospitalDropoffAddress,
    hospitalDropoffSameAsPickup,
    medicalNotes,
    examPickupAddress,
    examPickupTime,
    examVenue,
    examTime,
    examDuration,
    examDropoffAddress,
    examDropoffSameAsPickup,
    examAccommodations,
    computeHospitalSuggestedDuration,
    computeExamSuggestedDuration,
    computeSchoolRunSuggestedDuration,
    validPickupTimeOptions,
    validHospitalPickupTimeOptions,
    validExamPickupTimeOptions,
    effectivePickupTime,
    effectiveHospitalPickupTime,
    effectiveExamPickupTime,
    effectiveStartTime,
    effectiveDuration,
    endTime,
    rankedActivities,
    filteredByTrainer,
    sortedActivities,
    parseTimeToMinutes,
  } = itineraryCalculations;

  // Keep drop-off in sync when "Same as pickup" is enabled (universal)
  // Use ref to track last synced value to prevent infinite loops
  const lastSyncedPickupAddressRef = useRef<string>('');
  
  useEffect(() => {
    if (!template || !dropoffSameAsPickup || !pickupAddress) {
      lastSyncedPickupAddressRef.current = '';
      return;
    }
    
    // Skip if we already synced this pickup address
    if (lastSyncedPickupAddressRef.current === pickupAddress) {
      return;
    }
    
    const transportSeg = template.segments.find(s => s.type === 'transport') as any;
    if (!transportSeg) return;
    
    const currentDropoffAddress = dropoffAddress;
    // Only update if different to prevent infinite loop
    if (currentDropoffAddress !== pickupAddress) {
      updateField(transportSeg.dropoffFieldKeys.dropoffAddress, pickupAddress);
      lastSyncedPickupAddressRef.current = pickupAddress;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropoffSameAsPickup, pickupAddress, template]);

  // Load recent addresses from localStorage
  useEffect(() => {
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEYS.RECENT_ITINERARY_ADDRESSES) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setRecentAddresses(parsed.slice(0, MAX_RECENT_ADDRESSES));
      }
    } catch {}
  }, []);

  // Note: All calculations are now in useItineraryCalculations hook
  const computeSuggestedPickupTime = effectivePickupTimeFromHook;

  useEffect(() => {
    if (autoCalcFromItinerary && template) {
      // Use universal suggested duration for all template-based modes
      const suggested = computeSuggestedDuration;
      const rounded = Math.round(suggested * 10) / 10;
      setDuration(rounded);
      setCustomDuration(formatCustomDuration(rounded));
    } else if (selectedPresetKey === MODE_KEYS.SCHOOL_RUN_AFTER && autoCalcFromItinerary) {
      // School run not yet in template system
      const suggested = computeSchoolRunSuggestedDuration;
      const rounded = Math.round(suggested * 10) / 10;
      setDuration(rounded);
      setCustomDuration(formatCustomDuration(rounded));
    }
  }, [selectedPresetKey, autoCalcFromItinerary, computeSuggestedDuration, computeSchoolRunSuggestedDuration, template]);

  // Notify parent of duration changes (for event modes) - must be after computeSuggestedDuration is defined
  useEffect(() => {
    if (onSessionDurationChange) {
      let currentDuration = duration;
      if (autoCalcFromItinerary && template) {
        // Use universal suggested duration for all template-based modes
        currentDuration = computeSuggestedDuration;
      } else if (selectedPresetKey === MODE_KEYS.SCHOOL_RUN_AFTER && autoCalcFromItinerary) {
        // School run not yet in template system
        currentDuration = computeSchoolRunSuggestedDuration;
      }
      onSessionDurationChange(currentDuration);
    }
  }, [duration, autoCalcFromItinerary, computeSuggestedDuration, computeSchoolRunSuggestedDuration, selectedPresetKey, template, onSessionDurationChange]);

  // Auto-enable duration calculation for single-day events when all required fields are available
  useEffect(() => {
    if (isSingleDayEvent && template && !autoCalcFromItinerary) {
      const hasRequiredFields = pickupAddress?.trim() && 
                                eventAddress?.trim() && 
                                eventStartTime && 
                                eventEndTime &&
                                (pickupTime || pickupTimeSuggestions.length > 0);
      
      if (hasRequiredFields && computeSuggestedDuration > 0) {
        setAutoCalcFromItinerary(true);
      }
    }
  }, [isSingleDayEvent, template, pickupAddress, eventAddress, eventStartTime, eventEndTime, pickupTime, pickupTimeSuggestions.length, computeSuggestedDuration, autoCalcFromItinerary]);

  // Reset override when calculation inputs change significantly (so it recalculates)
  useEffect(() => {
    if (selectedPresetKey === 'single-day-event' && (eventStartTime || pickupAddress || eventAddress)) {
      // Only reset if the calculated time would be different
      if (effectivePickupTimeFromHook && pickupTime !== effectivePickupTimeFromHook && !pickupTimeOverridden) {
        setPickupTimeOverridden(false);
      }
    }
  }, [selectedPresetKey, eventStartTime, pickupAddress, eventAddress, effectivePickupTimeFromHook, pickupTime, pickupTimeOverridden]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select first suggestion when valid options are generated (unless manually overridden)
  useEffect(() => {
    if (selectedPresetKey === 'single-day-event' && pickupTimeSuggestions.length > 0 && !pickupTimeOverridden && !pickupTime) {
      const firstOption = pickupTimeSuggestions[0];
      setPickupTime(firstOption);
      setStartTime(firstOption);
    }
  }, [selectedPresetKey, pickupTimeSuggestions, pickupTimeOverridden, pickupTime]);

  // Sync startTime with pickupTime for single-day events
  useEffect(() => {
    if (selectedPresetKey === 'single-day-event' && pickupTime) {
      setStartTime(pickupTime);
    }
  }, [selectedPresetKey, pickupTime]);

  // Auto-select first suggestion for Hospital Appointment (unless manually overridden)
  useEffect(() => {
    if (isHospitalAppointment && validHospitalPickupTimeOptions.length > 0 && !hospitalPickupTimeOverridden && !hospitalPickupTime) {
      const firstOption = validHospitalPickupTimeOptions[0];
      setHospitalPickupTime(firstOption);
      setStartTime(firstOption);
    }
  }, [isHospitalAppointment, validHospitalPickupTimeOptions, hospitalPickupTimeOverridden, hospitalPickupTime]);

  // Sync startTime with pickupTime for Hospital Appointment
  useEffect(() => {
    if (isHospitalAppointment && hospitalPickupTime) {
      setStartTime(hospitalPickupTime);
    }
  }, [isHospitalAppointment, hospitalPickupTime]);

  // Auto-select first suggestion for Exam Support (unless manually overridden)
  useEffect(() => {
    if (isExamSupport && validExamPickupTimeOptions.length > 0 && !examPickupTimeOverridden && !examPickupTime) {
      const firstOption = validExamPickupTimeOptions[0];
      setExamPickupTime(firstOption);
      setStartTime(firstOption);
    }
  }, [isExamSupport, validExamPickupTimeOptions, examPickupTimeOverridden, examPickupTime]);

  // Sync startTime with pickupTime for Exam Support
  useEffect(() => {
    if (isExamSupport && examPickupTime) {
      setStartTime(examPickupTime);
    }
  }, [isExamSupport, examPickupTime]);

  // Advanced options (collapsed)
  const [showAdvanced, setShowAdvanced] = useState(false);

  const editIndex = useSessionEditing({
    initialEditSessionIndex,
    existingSessions,
    selectedDate,
    setSelectedDate,
    template,
    itineraryData,
    suggestedActivities,
    requiresTrainerChoice,
    remainingHours,
    defaultStartTime,
    selectedPresetKey,
    currentDuration: duration,
    handlers: {
      setSelectedActivityIds,
      setCustomName,
      setCustomDescription,
      setCustomEquipment,
      setEquipmentOption,
      setShowCustomForm,
      setNotes,
      updateFields,
      setStartTime,
      setDuration,
      setAutoCalcFromItinerary,
      setTrainerChoice,
      setCustomDuration,
      setEventAddress,
      setEventStartTime,
      setEventEndTime,
      setPickupAddress,
      setPickupTime,
      setDropoffAddress,
      setDropoffSameAsPickup,
      setIncludeTravel,
      setSchoolAddress,
      setSchoolPickupTime,
      setSchoolEndTime,
      setSchoolDropoffAddress,
      setSchoolDropoffSameAsPickup,
      setIncludeHomework,
      setHospitalPickupAddress,
      setHospitalPickupTime,
      setHospitalAddress,
      setAppointmentTime,
      setWaitingRoomDuration,
      setHospitalDropoffAddress,
      setHospitalDropoffSameAsPickup,
      setMedicalNotes,
      setExamPickupAddress,
      setExamPickupTime,
      setExamVenue,
      setExamTime,
      setExamDuration,
      setExamDropoffAddress,
      setExamDropoffSameAsPickup,
      setExamAccommodations,
      setPickupTimeOverridden,
      setHospitalPickupTimeOverridden,
      setExamPickupTimeOverridden,
    },
  });

  // Debug logging removed to reduce console spam
  // Uncomment only when debugging calendar flow issues
  // console.log('[SessionBuilder] CALENDAR FLOW CHECK:', {
  //   editIndex,
  //   calendarFlowComplete,
  //   shouldShowCalendar: (editIndex === null || editIndex < 0) && !calendarFlowComplete,
  //   initialEditSessionIndex,
  // });

  // Show all activities (not just top 6) but limit display with scroll
  const quickPickActivities = useMemo(() => {
    let items = [...sortedActivities];
    // Text search by name
    if (activitySearch.trim()) {
      const q = activitySearch.trim().toLowerCase();
      items = items.filter(a => a.name.toLowerCase().includes(q));
    }
    // Duration filter
    if (durationFilter !== 'all') {
      items = items.filter(a => {
        if (durationFilter === 'short') return a.duration <= DURATION_FILTER_THRESHOLDS.SHORT_MAX;
        if (durationFilter === 'medium') return a.duration > DURATION_FILTER_THRESHOLDS.SHORT_MAX && a.duration <= DURATION_FILTER_THRESHOLDS.MEDIUM_MAX;
        return a.duration > DURATION_FILTER_THRESHOLDS.MEDIUM_MAX; // long
      });
    }
    // Mode-aware filtering/sorting
    const mode = selectedPresetKey || initialModeKey;
    const lowerName = (s: string) => s.toLowerCase();
    const hasWord = (s: string, w: string) => lowerName(s).includes(w);
    const scoreFor = (a: Activity): number => {
      if (!mode) return 0;
      const name = a.name;
      switch (mode) {
        case MODE_KEYS.SCHOOL_RUN_AFTER:
          return (a.duration <= DURATION_FILTER_THRESHOLDS.MEDIUM_MAX ? ACTIVITY_SCORING_WEIGHTS.HIGH : ACTIVITY_SCORING_WEIGHTS.NONE) + 
                 (hasWord(name, ACTIVITY_KEYWORDS.SCHOOL_RUN.HOMEWORK) ? ACTIVITY_SCORING_WEIGHTS.MEDIUM : ACTIVITY_SCORING_WEIGHTS.NONE) + 
                 (hasWord(name, ACTIVITY_KEYWORDS.SCHOOL_RUN.INDOOR) ? ACTIVITY_SCORING_WEIGHTS.LOW : ACTIVITY_SCORING_WEIGHTS.NONE);
        case MODE_KEYS.WEEKEND_RESPITE:
          return (a.duration > DURATION_FILTER_THRESHOLDS.MEDIUM_MAX ? ACTIVITY_SCORING_WEIGHTS.HIGH : ACTIVITY_SCORING_WEIGHTS.NONE) + 
                 (hasWord(name, ACTIVITY_KEYWORDS.WEEKEND_RESPITE.OUTDOOR) ? ACTIVITY_SCORING_WEIGHTS.MEDIUM : ACTIVITY_SCORING_WEIGHTS.NONE) + 
                 (hasWord(name, ACTIVITY_KEYWORDS.WEEKEND_RESPITE.COMMUNITY) ? ACTIVITY_SCORING_WEIGHTS.MEDIUM : ACTIVITY_SCORING_WEIGHTS.NONE);
        case MODE_KEYS.THERAPY_COMPANION:
          return (hasWord(name, ACTIVITY_KEYWORDS.THERAPY_COMPANION.SENSORY) ? ACTIVITY_SCORING_WEIGHTS.HIGH : ACTIVITY_SCORING_WEIGHTS.NONE) + 
                 (hasWord(name, ACTIVITY_KEYWORDS.THERAPY_COMPANION.MINDFUL) ? ACTIVITY_SCORING_WEIGHTS.MEDIUM : ACTIVITY_SCORING_WEIGHTS.NONE) + 
                 (hasWord(name, ACTIVITY_KEYWORDS.THERAPY_COMPANION.REGULATION) ? ACTIVITY_SCORING_WEIGHTS.MEDIUM : ACTIVITY_SCORING_WEIGHTS.NONE) + 
                 (a.duration <= DURATION_FILTER_THRESHOLDS.MEDIUM_MAX ? ACTIVITY_SCORING_WEIGHTS.LOW : ACTIVITY_SCORING_WEIGHTS.NONE);
        case MODE_KEYS.EXAM_SUPPORT:
          return (hasWord(name, ACTIVITY_KEYWORDS.EXAM_SUPPORT.MINDFUL) ? ACTIVITY_SCORING_WEIGHTS.HIGH : ACTIVITY_SCORING_WEIGHTS.NONE) + 
                 (hasWord(name, ACTIVITY_KEYWORDS.EXAM_SUPPORT.CALM) ? ACTIVITY_SCORING_WEIGHTS.MEDIUM : ACTIVITY_SCORING_WEIGHTS.NONE) + 
                 (a.duration <= DURATION_FILTER_THRESHOLDS.MEDIUM_MAX ? ACTIVITY_SCORING_WEIGHTS.LOW : ACTIVITY_SCORING_WEIGHTS.NONE);
        case MODE_KEYS.HOLIDAY_DAY_TRIP:
          return (a.duration > DURATION_FILTER_THRESHOLDS.MEDIUM_MAX ? ACTIVITY_SCORING_WEIGHTS.MEDIUM : ACTIVITY_SCORING_WEIGHTS.NONE) + 
                 (hasWord(name, ACTIVITY_KEYWORDS.HOLIDAY_DAY_TRIP.OUTDOOR) ? ACTIVITY_SCORING_WEIGHTS.MEDIUM : ACTIVITY_SCORING_WEIGHTS.NONE) + 
                 (hasWord(name, ACTIVITY_KEYWORDS.HOLIDAY_DAY_TRIP.EXPLORATION) ? ACTIVITY_SCORING_WEIGHTS.LOW : ACTIVITY_SCORING_WEIGHTS.NONE);
        default:
          return ACTIVITY_SCORING_WEIGHTS.NONE;
      }
    };
    if (mode === MODE_KEYS.CLUB_ESCORT || mode === MODE_KEYS.HOSPITAL_APPOINTMENT) {
      // Prefer Trainer's Choice; keep items empty to nudge choice
      items = [];
    } else if (mode && mode !== 'single-day-event') {
      // Sort by score desc, then by duration (longer first already), then name
      items = items
        .map(a => ({ a, s: scoreFor(a) }))
        .sort((x, y) => (y.s - x.s) || (y.a.duration - x.a.duration) || x.a.name.localeCompare(y.a.name))
        .map(x => x.a);
    }
    return items;
  }, [sortedActivities, activitySearch, durationFilter, selectedPresetKey, initialModeKey]);

  // Reset activity selections when trainer changes - ONLY for modes that require a trainer
  useEffect(() => {
    if (!requiresTrainerChoice) {
      // For regular modes we now allow trainers + activities together, so do NOT reset
      return;
    }

    if (effectiveSelectedTrainerId !== null && editIndex < 0) {
      setSelectedActivityIds([]);
      // For event modes, trainer choice is always required
      setTrainerChoice(true);
    }
  }, [effectiveSelectedTrainerId, editIndex, requiresTrainerChoice]);

  // Calculate total duration of selected quick-pick activities
  const totalSelectedDuration = useMemo(() => {
    return selectedActivityIds.reduce((sum, id) => {
      const activity = quickPickActivities.find(a => a.id === id);
      return sum + (activity?.duration || 0);
    }, 0);
  }, [selectedActivityIds, quickPickActivities]);

  // Duration for all custom activities combined (FIXED: Now sums all custom activities)
  const customActivityDuration = useMemo(() => {
    return customActivities.reduce((total, activity) => total + activity.duration, 0);
  }, [customActivities]);

  // Combined duration of all activities (quick-pick + custom)
  const totalActivitiesDuration = useMemo(
    () => totalSelectedDuration + customActivityDuration,
    [totalSelectedDuration, customActivityDuration]
  );

  // Auto-sync session duration with custom activity duration when custom activity is present
  // This ensures custom activities count towards package hours
  // BUT: Don't override if user has manually set a higher duration
  useEffect(() => {
    if (customActivityDuration > 0 && selectedActivityIds.length === 0 && !trainerChoice && editIndex < 0) {
      // Only auto-sync if no quick-pick activities are selected and not in edit mode
      // This ensures custom activity duration counts as session duration
      // BUT: If user manually selected a higher duration, respect that (they might want longer session)
      const minDuration = 3; // Minimum session duration
      const targetDuration = Math.max(minDuration, customActivityDuration);
      // Only update if current duration is LESS than the custom activity duration
      // This allows users to book longer sessions (e.g., 6h) even if custom activity is 3h
      if (duration < targetDuration && Math.abs(duration - targetDuration) > 0.1) {
        setDuration(targetDuration);
      }
    }
  }, [customActivityDuration, selectedActivityIds.length, trainerChoice, editIndex, duration]);

  const handleToggleActivity = (activityId: number) => {
    setSelectedActivityIds(prev => {
      if (prev.includes(activityId)) {
        return prev.filter(id => id !== activityId);
      } else {
        return [...prev, activityId];
      }
    });
    // Don't set trainerChoice to false for event modes
    if (!requiresTrainerChoice) {
      setTrainerChoice(false);
    }
  };

  const handleSubmit = () => {
    const prevSelectedDate = selectedDate;
    const prevStartTime = startTime;
    const prevDuration = duration;

    // Use effective pickup time (first option if not set)
    const effectivePickupTimeForSubmit = isSingleDayEvent && (!pickupTime && validPickupTimeOptions.length > 0)
      ? validPickupTimeOptions[0]
      : pickupTime;
    
    // Use effective pickup times for Hospital and Exam
    const effectiveHospitalPickupTimeForSubmit = isHospitalAppointment && (!hospitalPickupTime && validHospitalPickupTimeOptions.length > 0)
      ? validHospitalPickupTimeOptions[0]
      : hospitalPickupTime;
    
    const effectiveExamPickupTimeForSubmit = isExamSupport && (!examPickupTime && validExamPickupTimeOptions.length > 0)
      ? validExamPickupTimeOptions[0]
      : examPickupTime;
    
    // Use effective start time for mode-specific sections
    const effectiveStartTimeForSubmit = 
      isSingleDayEvent && effectivePickupTimeForSubmit ? effectivePickupTimeForSubmit :
      isSchoolRun && schoolPickupTime ? schoolPickupTime :
      isHospitalAppointment && effectiveHospitalPickupTimeForSubmit ? effectiveHospitalPickupTimeForSubmit :
      isExamSupport && effectiveExamPickupTimeForSubmit ? effectiveExamPickupTimeForSubmit :
      startTime;

    // Format notes using Strategy pattern
    // Build itinerary data object for formatting
    const itineraryDataForFormatting: UniversalItineraryData = {
      ...itineraryData,
      // Override with effective values for formatting
      pickupAddress: selectedPresetKey === MODE_KEYS.SINGLE_DAY_EVENT ? pickupAddress : 
                     selectedPresetKey === MODE_KEYS.HOSPITAL_APPOINTMENT ? hospitalPickupAddress :
                     selectedPresetKey === MODE_KEYS.EXAM_SUPPORT ? examPickupAddress :
                     selectedPresetKey === MODE_KEYS.SCHOOL_RUN_AFTER ? parentAddress : '',
      pickupTime: selectedPresetKey === MODE_KEYS.SINGLE_DAY_EVENT ? (effectivePickupTimeForSubmit || pickupTime) :
                   selectedPresetKey === MODE_KEYS.HOSPITAL_APPOINTMENT ? (effectiveHospitalPickupTimeForSubmit || hospitalPickupTime) :
                   selectedPresetKey === MODE_KEYS.EXAM_SUPPORT ? (effectiveExamPickupTimeForSubmit || examPickupTime) :
                   selectedPresetKey === MODE_KEYS.SCHOOL_RUN_AFTER ? schoolPickupTime : '',
      dropoffAddress: selectedPresetKey === MODE_KEYS.SINGLE_DAY_EVENT ? dropoffAddress :
                      selectedPresetKey === MODE_KEYS.HOSPITAL_APPOINTMENT ? hospitalDropoffAddress :
                      selectedPresetKey === MODE_KEYS.EXAM_SUPPORT ? examDropoffAddress :
                      selectedPresetKey === MODE_KEYS.SCHOOL_RUN_AFTER ? schoolDropoffAddress : '',
      dropoffSameAsPickup: selectedPresetKey === MODE_KEYS.SINGLE_DAY_EVENT ? dropoffSameAsPickup :
                           selectedPresetKey === MODE_KEYS.HOSPITAL_APPOINTMENT ? hospitalDropoffSameAsPickup :
                           selectedPresetKey === MODE_KEYS.EXAM_SUPPORT ? examDropoffSameAsPickup :
                           selectedPresetKey === MODE_KEYS.SCHOOL_RUN_AFTER ? schoolDropoffSameAsPickup : false,
      eventAddress: eventAddress || '',
      eventStartTime: eventStartTime || '',
      eventEndTime: eventEndTime || '',
      includeTravel: includeTravel !== false,
      schoolAddress: schoolAddress || '',
      schoolPickupTime: schoolPickupTime || '',
      schoolEndTime: schoolEndTime || '',
      includeHomework: includeHomework === true,
      hospitalAddress: hospitalAddress || '',
      appointmentTime: appointmentTime || '',
      waitingRoomDuration: waitingRoomDuration || '0',
      medicalNotes: medicalNotes || undefined,
      examVenue: examVenue || '',
      examTime: examTime || '',
      examDuration: examDuration || '0',
      examAccommodations: examAccommodations || undefined,
      parentAddress,
    };
    
    const appendedNotes = formatSessionNotes(selectedPresetKey, itineraryDataForFormatting, notes);

    if (editIndex >= 0) {
      const activities = selectedActivityIds.length > 0
        ? selectedActivityIds
        : [];
      
      const customActivitiesList = customActivities.map(activity => ({
        name: activity.name,
        duration: activity.duration,
        description: activity.description,
        equipment: activity.equipment,
      }));

      onUpdateSession(editIndex, {
        date: selectedDate,
        startTime: effectiveStartTimeForSubmit,
        duration,
        endTime,
        selectedActivityIds: activities,
        customActivities: customActivitiesList,
        trainerChoice,
        trainerId: effectiveSelectedTrainerId ?? undefined,
        notes: appendedNotes.trim() || undefined,
      });
    } else {
      const activities = selectedActivityIds.length > 0
        ? selectedActivityIds
        : [];

      // FIXED: Now passes ALL custom activities (array) instead of just one
      const customActivitiesList = customActivities.map(activity => ({
        name: activity.name,
        duration: activity.duration,
        description: activity.description,
        equipment: activity.equipment,
      }));

      // Determine final session duration:
      // 1. For single-day events, use auto-calculated duration if available
      // 2. If custom activity is present, use the MAX of custom activity duration and manually selected duration
      //    (This allows users to book longer sessions even if custom activity is shorter)
      // 3. Otherwise, use the manually selected duration
      let finalDuration = duration;
      if (isSingleDayEvent && autoCalcFromItinerary && computeSuggestedDuration > 0) {
        finalDuration = computeSuggestedDuration;
      } else if (customActivitiesList.length > 0) {
        // FIXED: Calculate total duration of all custom activities
        const totalCustomDuration = customActivitiesList.reduce((sum, activity) => sum + activity.duration, 0);
        if (totalCustomDuration > 0) {
          // Custom activity duration should count, but allow user to book longer if they want
          // Use the maximum of total custom activity duration and manually selected duration
          finalDuration = Math.max(totalCustomDuration, duration);
        }
      }
      const [h, m] = effectiveStartTimeForSubmit.split(':').map(Number);
      const start = moment().hours(h).minutes(m);
      const finalEndTime = start.clone().add(finalDuration, 'hours').format('HH:mm');
      
      onAddSession({
        date: selectedDate,
        startTime: effectiveStartTimeForSubmit,
        duration: finalDuration,
        endTime: finalEndTime,
        selectedActivityIds: activities,
        customActivities: customActivitiesList,
        trainerChoice,
        trainerId: effectiveSelectedTrainerId ?? undefined, // Include trainer_id if parent selected a trainer
        notes: appendedNotes.trim() || undefined,
      });
    }
    // Save recent addresses
    try {
      if (typeof window !== 'undefined') {
        const addrs: string[] = [];
        if (pickupAddress && addrs.indexOf(pickupAddress) === -1) addrs.push(pickupAddress);
        if (dropoffAddress && addrs.indexOf(dropoffAddress) === -1) addrs.push(dropoffAddress);
        if (addrs.length) {
          const existingRaw = window.localStorage.getItem(STORAGE_KEYS.RECENT_ITINERARY_ADDRESSES);
          const existing: string[] = existingRaw ? JSON.parse(existingRaw) : [];
          const merged = [...addrs, ...existing.filter(a => !addrs.includes(a))].slice(0, MAX_RECENT_ADDRESSES);
          window.localStorage.setItem(STORAGE_KEYS.RECENT_ITINERARY_ADDRESSES, JSON.stringify(merged));
        }
      }
    } catch {}
    // Reset
    setSelectedActivityIds([]);
    // Don't set trainerChoice to false for event modes
    if (!requiresTrainerChoice) {
      setTrainerChoice(false);
    }
    setNotes('');
    setCustomName('');
    setCustomDescription('');
    setCustomEquipment('');
    setEquipmentOption('none');
    setShowCustomForm(false);

    // Always advance to next day after booking (for new sessions, not edits)
    if (editIndex < 0) {
      // Find the next available date using DateService
      const bookedDates = existingSessions.map(s => s.date);
      const nextDateStr = DateService.getNextAvailableDate(
        prevSelectedDate,
        bookedDates,
        moment().format('YYYY-MM-DD')
      );
      // Only advance if the next date is NOT already booked (to avoid triggering edit mode)
      if (!bookedDates.includes(nextDateStr)) {
        setSelectedDate(nextDateStr);
        
        // Reset itinerary data for next session (clear ALL fields, then selectively preserve addresses)
        if (template) {
          const parentAddr = getField('parentAddress') || '';
          
          // Get current pickup address before reset (if it exists)
          let preservedPickupAddress = '';
          if (isSingleDayEvent && template) {
            const transportSeg = template.segments.find(s => s.type === 'transport') as any;
            if (transportSeg) {
              preservedPickupAddress = getField(transportSeg.pickupFieldKeys.pickupAddress) || '';
            }
          }
          
          // Initialize fresh data (clears everything)
          const resetData = ItineraryService.initializeItineraryData(template);
          
          // Preserve parent address
          if (parentAddr) {
            resetData.parentAddress = parentAddr;
          }
          
          // For single-day events, preserve pickup address if it was a custom address (not parent address)
          if (isSingleDayEvent && preservedPickupAddress && !preservedPickupAddress.toLowerCase().includes('parent') && !preservedPickupAddress.toLowerCase().includes('my address')) {
            const transportSeg = template.segments.find(s => s.type === 'transport') as any;
            if (transportSeg) {
              resetData[transportSeg.pickupFieldKeys.pickupAddress] = preservedPickupAddress;
            }
          }
          
          // Explicitly clear ALL time fields and event addresses (preserve only pickup address)
          template.segments.forEach(seg => {
            if (seg.type === 'transport') {
              // Clear pickup time (preserve pickup address if it was custom)
              resetData[seg.pickupFieldKeys.pickupTime] = '';
              // Clear dropoff address
              resetData[seg.dropoffFieldKeys.dropoffAddress] = '';
              resetData[seg.dropoffFieldKeys.dropoffSameAsPickup] = false;
            } else if (seg.type === 'stop') {
              // Clear all event times
              if (seg.startTimeKey) resetData[seg.startTimeKey] = '';
              if (seg.endTimeKey) resetData[seg.endTimeKey] = '';
              // Clear event address (don't preserve - each day is different)
              resetData[seg.addressKey] = '';
            } else if (seg.type === 'wait') {
              // Clear wait duration
              resetData[seg.durationKey] = '0';
            }
          });
          
          // Update all fields at once
          updateFields(resetData);
          
          // Reset override flags
          setPickupTimeOverridden(false);
          setHospitalPickupTimeOverridden(false);
          setExamPickupTimeOverridden(false);
          setAutoCalcFromItinerary(requiresTrainerChoice); // Auto-enable for event modes
          
          // Also clear activity selections and custom form
          setSelectedActivityIds([]);
          setTrainerChoice(requiresTrainerChoice); // Keep trainer choice for event modes
          setCustomName('');
          setCustomDescription('');
          setCustomEquipment('');
          setEquipmentOption('none');
          setShowCustomForm(false);
          setNotes('');
        }
        
        // Reset time and duration for new session
        const postSubmitDuration = calculateDefaultDuration(remainingHours);
        setStartTime(defaultStartTime);
        setDuration(postSubmitDuration);
        setCustomDuration(formatCustomDuration(postSubmitDuration));
      }
    }
  };

  // Validation using Mode Registry (Extensible Pattern)
  // If mode handler exists, use it for validation. Otherwise, fall back to legacy validation.
  const hasValidItinerary = useMemo(() => {
    if (modeHandler) {
      // Use mode handler for validation (extensible)
      if (modeHandler.usesUniversalValidation && template) {
        // Use universal validation from hook when available
        return hasValidItineraryFromHook;
      }
      // Use mode handler's validateItinerary method
      // Mode handler expects undefined (not null) when no template is provided
      return modeHandler.validateItinerary(itineraryData, template ?? undefined);
    }

    // Legacy fallback for modes without handlers (backward compatibility)
    return (!isSingleDayEvent && !isSchoolRun && !isHospitalAppointment && !isExamSupport) || // Generic modes
      (isSingleDayEvent && (
        pickupAddress?.trim() &&
        effectivePickupTime &&
        eventAddress?.trim() &&
        eventStartTime &&
        eventEndTime
      )) ||
      (isSchoolRun && (
        schoolAddress?.trim() &&
        schoolPickupTime &&
        schoolEndTime
      )) ||
      (isHospitalAppointment && (
        hospitalPickupAddress?.trim() &&
        effectiveHospitalPickupTime &&
        hospitalAddress?.trim() &&
        appointmentTime
      )) ||
      (isExamSupport && (
        examPickupAddress?.trim() &&
        effectiveExamPickupTime &&
        examVenue?.trim() &&
        examTime &&
        examDuration
      ));
  }, [
    modeHandler,
    hasValidItineraryFromHook,
    template,
    itineraryData,
    isSingleDayEvent,
    isSchoolRun,
    isHospitalAppointment,
    isExamSupport,
    pickupAddress,
    effectivePickupTime,
    eventAddress,
    eventStartTime,
    eventEndTime,
    schoolAddress,
    schoolPickupTime,
    schoolEndTime,
    hospitalPickupAddress,
    effectiveHospitalPickupTime,
    hospitalAddress,
    appointmentTime,
    examPickupAddress,
    effectiveExamPickupTime,
    examVenue,
    examTime,
    examDuration,
  ]);


  // Submit validation using mode handler (extensible pattern)
  const canSubmit = useMemo(() => {
    const hasBasicRequirements = !!(
      selectedDate &&
      effectiveStartTime &&
      effectiveDuration > 0 &&
      hasValidItinerary
    );
    if (!hasBasicRequirements) return false;

    // Use mode handler to determine if trainer choice is required
    if (modeHandler?.requiresTrainerChoice) {
      return trainerChoice;
    }

    // Generic modes: allow activity selection or custom activities
    // Valid when:
    // - Trainer's choice is enabled, OR
    // - There is at least one selected or custom activity AND
    //   combined duration does not exceed the session duration
    const hasAnyActivities =
      selectedActivityIds.length > 0 || !!customName.trim();

    const activitiesFitSession =
      totalActivitiesDuration > 0 && totalActivitiesDuration <= duration;

    return !!(trainerChoice || (hasAnyActivities && activitiesFitSession));
  }, [
    selectedDate,
    effectiveStartTime,
    effectiveDuration,
    hasValidItinerary,
    modeHandler,
    trainerChoice,
    selectedActivityIds.length,
    totalActivitiesDuration,
    duration,
    customName,
  ]);
  const noHoursLeft = remainingHours <= 0 && editIndex < 0; // Disable only for new bookings, not edits

  if (noHoursLeft) {
    const used = existingSessions.reduce((sum, s) => sum + s.duration, 0);
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-2 border-gray-200">
        <div className="mb-4 p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <CalendarIcon className="text-white" size={20} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-red-900 mb-1">{UI_TEXT.MESSAGES.NO_HOURS_REMAINING_TITLE}</h4>
              <p className="text-sm text-red-800">
                {UI_TEXT.MESSAGES.NO_HOURS_REMAINING_DESCRIPTION(used)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              const sessionsSection = document.querySelector('[data-sessions-section]');
              if (sessionsSection) {
                sessionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="flex-1 text-center px-5 py-3 rounded-lg border-2 border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
          >
            {UI_TEXT.MESSAGES.MANAGE_SESSIONS}
          </button>
          <a href="/packages" className="flex-1 text-center px-5 py-3 rounded-lg bg-[#0080FF] text-white font-semibold hover:bg-[#0069cc] transition-colors">
            {UI_TEXT.MESSAGES.BUY_MORE_HOURS}
          </a>
        </div>
      </div>
    );
  }

  // Calculate current step for progress indicator
  // For event modes (single-day, school-run, hospital, exam): 3 steps
  // Step 1: Choose Date
  // Step 2: Fill Itinerary (Time & Duration)
  // Step 3: Review (ready to book)
  // For regular modes: 4 steps
  // Step 1: Choose Date
  // Step 2: Time & Duration
  // Step 3: Activities
  // Step 4: Review (ready to book)
  
  const totalSteps = isEventMode ? PROGRESS_STEPS.EVENT_MODE : PROGRESS_STEPS.REGULAR_MODE;
  
  let currentStep: number;
  if (!selectedDate) {
    currentStep = 1;
  } else if (isEventMode) {
    // Event mode: 3 steps
    if (!hasValidItinerary) {
      currentStep = 2; // Need to fill itinerary
    } else {
      currentStep = 3; // Ready to review/book
    }
  } else {
    // Regular mode: 4 steps
    if (!effectiveStartTime || duration <= 0) {
      currentStep = 2; // Need time & duration
    } else if (!trainerChoice && selectedActivityIds.length === 0 && !customName.trim()) {
      currentStep = 3; // Need activities
    } else {
      currentStep = 4; // Ready to review/book
    }
  }
  
  // Ensure currentStep doesn't exceed totalSteps
  const safeCurrentStep = Math.min(currentStep, totalSteps);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 space-y-6">
        {/* INSPIRATIONAL UI: Editing Session Banner */}
        {editIndex >= 0 && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 text-sm">Editing Session</h3>
              <p className="text-xs text-amber-700 mt-0.5">Make your changes and click "Review & Schedule" to update</p>
            </div>
          </div>
        )}
        
        {/* CALENDAR-FIRST BOOKING FLOW - SHOW FOR NEW AND EDIT! */}
        {!calendarFlowComplete && (
          <div data-calendar-flow>
            <CalendarBookingFlow
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            blockedDates={blockedDates}
            bookedSessions={existingSessions.map(session => ({
              date: session.date,
              startTime: session.startTime,
              endTime: session.endTime,
              duration: session.duration,
              activities: session.activities.map(a => ({
                id: a.id,
                name: a.name,
                duration: a.duration,
              })),
              notes: session.notes,
            }))}
            onBookedDateClick={onBookedDateClick ? (date: string, sessionData: { date: string; startTime: string; endTime: string; duration: number; activities: { id: number; name: string; duration?: number }[]; notes?: string }) => {
              // Convert BookedSessionData back to BookedSession format
              const session: BookedSession = {
                date: sessionData.date,
                startTime: sessionData.startTime,
                endTime: sessionData.endTime,
                duration: sessionData.duration,
                activities: sessionData.activities.map(a => ({
                  id: a.id,
                  name: a.name,
                  duration: a.duration || 0,
                })),
                notes: sessionData.notes,
              };
              onBookedDateClick(date, session);
            } : undefined}
            minDate={minDate ? moment(minDate) : moment()}
            maxDate={maxDate ? moment(maxDate) : undefined}
            quickPickActivities={quickPickActivities}
            selectedActivityIds={selectedActivityIds}
            onToggleActivity={handleToggleActivity}
            customActivities={customActivities}
            onAddCustomActivity={(name, dur) => {
              const newActivity = {
                id: `custom-${Date.now()}`,
                name,
                duration: dur,
                description: '',
                equipment: '',
              };
              setCustomActivities(prev => [...prev, newActivity]);
            }}
            isEditing={editIndex >= 0}
            editingDate={editIndex >= 0 && existingSessions[editIndex] ? existingSessions[editIndex].date : undefined}
            onBackToReview={() => {
              setCalendarFlowComplete(true);
              setIsReturningFromReview(false);
              setInitialStep(undefined); // Clear initial step when going back to review
              setTimeout(() => {
                const reviewElement = document.querySelector('[data-review-section]');
                if (reviewElement) {
                  reviewElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 100);
            }}
            onDeleteCustomActivity={(id) => {
              setCustomActivities(prev => prev.filter(a => a.id !== id));
            }}
            trainerChoice={trainerChoice}
            onTrainerChoiceChange={(choice) => {
              setTrainerChoice(choice);
              // When trainer choice is enabled, clear selected activities and custom activities
              if (choice) {
                setSelectedActivityIds([]);
                setCustomActivities([]);
              }
            }}
            startTime={startTime}
            onStartTimeChange={setStartTime}
            duration={duration}
            onDurationChange={setDuration}
            remainingHours={remainingHours}
            totalPackageHours={totalPackageHours}
            availableTrainers={availableTrainers}
            packageActivities={packageActivities}
            location={location}
            selectedTrainerId={effectiveSelectedTrainerId}
            onTrainerSelect={(trainerId) => {
              setSessionSelectedTrainerId(trainerId);
              // For regular modes, treat any trainer selection (including auto-assign) as a valid trainer choice
              if (!requiresTrainerChoice) {
                setTrainerChoice(true);
              }
            }}
            isReturningFromReview={isReturningFromReview}
            onReturnFromReview={() => {
              setIsReturningFromReview(false);
            }}
            onFlowComplete={() => {
              setCalendarFlowComplete(true);
              setIsReturningFromReview(false);
            }}
          />
          </div>
        )}

        {/* Review Section - Google Calendar Aesthetic */}
        {calendarFlowComplete && selectedDate && startTime && duration > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header - Google Calendar style (clean, minimal) */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Review Your Session</h2>
              <p className="text-sm text-gray-500 mt-0.5">Review and edit your session details before confirming</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Date Section */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:border-[#0080FF]/30 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarIcon className="w-5 h-5 text-[#0080FF] flex-shrink-0" />
                      <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-wide">Date</h3>
                    </div>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {moment(selectedDate).format('dddd, MMMM D, YYYY')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReturningFromReview(true);
                      setInitialStep('date');
                      setCalendarFlowComplete(false);
                      setTimeout(() => {
                        const calendarFlowElement = document.querySelector('[data-calendar-flow]');
                        if (calendarFlowElement) {
                          calendarFlowElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                    className="px-4 py-2 text-sm font-semibold text-[#0080FF] border-2 border-[#0080FF] rounded-lg hover:bg-[#0080FF] hover:text-white transition-all duration-300 flex-shrink-0"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Activities Section */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:border-[#0080FF]/30 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <PlusIcon className="w-5 h-5 text-[#0080FF] flex-shrink-0" />
                      <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-wide">
                        Activities ({trainerChoice ? 0 : selectedActivityIds.length + customActivities.length})
                      </h3>
                    </div>
                    {trainerChoice ? (
                      <div className="mt-2">
                        <p className="text-base font-semibold text-gray-900">Trainer's Choice</p>
                        <p className="text-sm text-gray-600 mt-1">Trainer will select activities</p>
                      </div>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {selectedActivityIds.map((activityId) => {
                          const activity = quickPickActivities.find(a => a.id === activityId);
                          if (!activity) return null;
                          return (
                            <div key={activityId} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-[#0080FF] flex-shrink-0" />
                              <p className="text-sm font-medium text-gray-900">{activity.name}</p>
                            </div>
                          );
                        })}
                        {customActivities.map((customActivity) => (
                          <div key={customActivity.id} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-500 flex-shrink-0" />
                            <p className="text-sm font-medium text-gray-900">{customActivity.name} ✨</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReturningFromReview(true);
                      setInitialStep('activities');
                      setCalendarFlowComplete(false);
                      setTimeout(() => {
                        const calendarFlowElement = document.querySelector('[data-calendar-flow]');
                        if (calendarFlowElement) {
                          calendarFlowElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                    className="px-4 py-2 text-sm font-semibold text-[#0080FF] border-2 border-[#0080FF] rounded-lg hover:bg-[#0080FF] hover:text-white transition-all duration-300 flex-shrink-0"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Time & Duration Section */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:border-[#0080FF]/30 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-[#0080FF] flex-shrink-0" />
                      <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-wide">Session Duration</h3>
                    </div>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {startTime} - {moment(startTime, 'HH:mm').add(duration, 'hours').format('HH:mm')} ({duration} hours)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReturningFromReview(true);
                      setInitialStep('time'); // CRITICAL FIX: Set explicit step to prevent cycling
                      setCalendarFlowComplete(false);
                      setTimeout(() => {
                        const calendarFlowElement = document.querySelector('[data-calendar-flow]');
                        if (calendarFlowElement) {
                          calendarFlowElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                    className="px-4 py-2 text-sm font-semibold text-[#0080FF] border-2 border-[#0080FF] rounded-lg hover:bg-[#0080FF] hover:text-white transition-all duration-300 flex-shrink-0"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Trainer Section */}
              {availableTrainers.length > 0 && (
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:border-[#0080FF]/30 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-[#0080FF] flex-shrink-0" />
                        <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-wide">Trainer</h3>
                      </div>
                      {effectiveSelectedTrainerId !== null && effectiveSelectedTrainerId !== undefined ? (
                        (() => {
                          const trainer = availableTrainers.find(t => t.id === effectiveSelectedTrainerId);
                          if (!trainer) return null;
                          const trainerAvatar = trainer.name
                            ? trainer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                            : 'TR';
                          return (
                            <div className="flex items-center gap-3 mt-2">
                              <div className="w-10 h-10 rounded-full bg-[#0080FF] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0 shadow-md">
                                {trainerAvatar}
                              </div>
                              <div>
                                <p className="text-base font-semibold text-gray-900">{trainer.name}</p>
                                <p className="text-sm text-gray-600">{trainer.role || 'Trainer'}</p>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="flex items-center gap-3 mt-2">
                          <div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0 shadow-md">
                            AA
                          </div>
                          <div>
                            <p className="text-base font-semibold text-gray-900">Auto-assigned</p>
                            <p className="text-sm text-gray-600">Best match based on availability</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsReturningFromReview(true);
                        setInitialStep('trainer');
                        setCalendarFlowComplete(false);
                        setTimeout(() => {
                          const calendarFlowElement = document.querySelector('[data-calendar-flow]');
                          if (calendarFlowElement) {
                            calendarFlowElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 100);
                      }}
                      className="px-4 py-2 text-sm font-semibold text-[#0080FF] border-2 border-[#0080FF] rounded-lg hover:bg-[#0080FF] hover:text-white transition-all duration-300 flex-shrink-0"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}

              {/* Summary Note */}
              <div className="pt-4 mt-4 border-t-2 border-gray-200 bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong className="text-[#1E3A5F]">Note:</strong> Your session is scheduled for <strong>{moment(selectedDate).format('MMMM D, YYYY')}</strong>. You'll receive a confirmation email with all the details.
                </p>
              </div>
            </div>

            {/* INSPIRATIONAL UI: Action Buttons (not sticky) */}
            <div className="px-6 py-4 border-t-2 border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  setIsReturningFromReview(true);
                  setCalendarFlowComplete(false);
                  setTimeout(() => {
                    const calendarFlowElement = document.querySelector('[data-calendar-flow]');
                    if (calendarFlowElement) {
                      calendarFlowElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }}
                variant="outline"
                className="flex-1"
              >
                Back to Edit
              </Button>
              {/* Confirm button is handled by ReviewCTA below */}
            </div>
          </div>
        )}

        {/* Activities are already selected in CalendarBookingFlow - no need to show again! */}
        {/* Removed duplicate activities section - activities are selected in Date → Activities → Time flow */}

        {/* Only show Advanced Options and Review when flow is complete */}
        {calendarFlowComplete && (
          <>
            <AdvancedOptionsSection
              noHoursLeft={noHoursLeft}
              showAdvanced={showAdvanced}
              onToggle={() => setShowAdvanced(!showAdvanced)}
              notes={notes}
              onNotesChange={setNotes}
              autoAdvanceNextDay={autoAdvanceNextDay}
              onAutoAdvanceChange={setAutoAdvanceNextDay}
            />
          </>
        )}

        {/* CRITICAL: When editing, ALWAYS show Save button (even when calendarFlowComplete is false) */}
        {/* This ensures parents can always save their changes, even after clicking "Change Details" */}
        {editIndex >= 0 && (
          <ReviewCTA
            noHoursLeft={noHoursLeft}
            isSingleDayEvent={isSingleDayEvent}
            selectedDate={selectedDate}
            effectiveStartTime={effectiveStartTime}
            pickupAddress={pickupAddress}
            eventAddress={eventAddress}
            eventStartTime={eventStartTime}
            eventEndTime={eventEndTime}
            pickupTime={pickupTime}
            effectivePickupTime={effectivePickupTime}
            pickupTimeSuggestions={pickupTimeSuggestions}
            computeSuggestedDuration={computeSuggestedDuration}
            effectiveDuration={effectiveDuration}
            duration={duration}
            hasValidItinerary={hasValidItinerary}
            trainerChoice={trainerChoice}
            missingFields={missingFields}
            handleSubmit={handleSubmit}
            canSubmit={canSubmit}
            editIndex={editIndex}
          />
        )}

        {/* For new bookings, only show Save button when flow is complete */}
        {editIndex < 0 && calendarFlowComplete && (
          <ReviewCTA
            noHoursLeft={noHoursLeft}
            isSingleDayEvent={isSingleDayEvent}
            selectedDate={selectedDate}
            effectiveStartTime={effectiveStartTime}
            pickupAddress={pickupAddress}
            eventAddress={eventAddress}
            eventStartTime={eventStartTime}
            eventEndTime={eventEndTime}
            pickupTime={pickupTime}
            effectivePickupTime={effectivePickupTime}
            pickupTimeSuggestions={pickupTimeSuggestions}
            computeSuggestedDuration={computeSuggestedDuration}
            effectiveDuration={effectiveDuration}
            duration={duration}
            hasValidItinerary={hasValidItinerary}
            trainerChoice={trainerChoice}
            missingFields={missingFields}
            handleSubmit={handleSubmit}
            canSubmit={canSubmit}
            editIndex={editIndex}
          />
        )}
      </div>
    </div>
  );
};

export default SessionBuilder;

