'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import moment, { Moment } from 'moment';
import MonthCalendar from '../calendars/MonthCalendar';
import EnhancedTimeSlotSelector from '../pickers/EnhancedTimeSlotSelector';
import TimePicker from '../pickers/TimePicker';
import DurationPicker from '../pickers/DurationPicker';
import SimpleActivitiesSection from './SimpleActivitiesSection';
import { Calendar, Clock, CheckCircle2, ArrowLeft, ArrowRight, Sparkles, Users, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import { MIN_DURATION_HOURS, calculateDefaultDuration } from './config';

interface BookedSessionData {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  activities: { id: number; name: string; duration?: number }[];
  notes?: string;
}

interface SimpleActivity {
  id: number;
  name: string;
  category?: string;
  duration?: number;
  views?: number; // For "Hot" badge calculation
}

interface CustomActivity {
  id: string;
  name: string;
  duration: number;
  description?: string;
  equipment?: string;
}

interface CalendarBookingFlowProps {
  // Date props
  selectedDate: string | null;
  onDateChange: (date: string) => void;
  blockedDates?: string[];
  bookedSessions?: BookedSessionData[]; // NEW: Full session data for calendar display
  onBookedDateClick?: (date: string, session: BookedSessionData) => void; // NEW: Click handler for booked dates
  minDate?: Moment;
  maxDate?: Moment;
  
  // Activities props (NEW: For Date → Activities → Time flow)
  quickPickActivities: SimpleActivity[];
  selectedActivityIds: number[];
  onToggleActivity: (id: number) => void;
  customActivities: CustomActivity[];
  onAddCustomActivity: (name: string, duration: number) => void;
  onDeleteCustomActivity: (id: string) => void;
  trainerChoice?: boolean; // Whether trainer will choose activities
  onTrainerChoiceChange?: (choice: boolean) => void; // Handler for trainer choice toggle
  
  // Time props
  startTime: string;
  onStartTimeChange: (time: string) => void;
  
  // Duration props
  duration: number;
  onDurationChange: (duration: number) => void;
  remainingHours: number; // NEW: For calculating max duration
  totalPackageHours?: number; // Total hours in the package (for correct time budget display)
  
  // Trainer props (NEW: For optional trainer selection)
  availableTrainers?: Array<{ 
    id: number; 
    name: string; 
    imageSrc?: string; 
    imageAlt?: string; 
    rating?: number;
    role?: string;
    serviceRegions?: string[];
    serviceAreaPostcodes?: string[];
    activities?: string[];
  }>;
  packageActivities?: Array<{ id: number; name: string; trainerIds: number[] }>;
  location?: { region?: string; postcode?: string };
  selectedTrainerId?: number | null;
  onTrainerSelect?: (trainerId: number | null) => void;
  
  // Callback when returning from review (Change Details clicked)
  onReturnFromReview?: () => void;
  isReturningFromReview?: boolean; // Whether user is returning from review section
  
  // Callback when flow is complete
  onFlowComplete: () => void;
  
  // Edit mode props
  isEditing?: boolean; // Whether we're editing an existing session
  onBackToReview?: () => void; // Callback to go back to review section
  initialStep?: 'date' | 'activities' | 'time' | 'trainer' | 'custom-time'; // Force starting step (e.g., when clicking Edit on Date)
  editingDate?: string; // Date currently being edited (for highlighting in calendar)
}

/**
 * CalendarBookingFlow Component
 * 
 * NEW FLOW: Date → Activities → Time → Trainer (Optional)
 * 
 * Step 1: Visual Calendar → Select Date
 * Step 2: Activities → Select Activities (calculates duration)
 * Step 3: Time Slots → Select Time (filtered by activity duration)
 * Step 4: Trainer Selection → Choose Trainer (optional, filtered by location + activities)
 * 
 * Features:
 * - Step-by-step visual flow
 * - Clear progress indicators
 * - Activities determine duration
 * - Time slots filtered by required duration
 * - Trainer filtering by location and activities
 * - Mobile-friendly design
 * - Easy navigation between steps
 */
export default function CalendarBookingFlow({
  selectedDate,
  onDateChange,
  blockedDates = [],
  bookedSessions = [],
  onBookedDateClick,
  minDate,
  maxDate,
  quickPickActivities,
  selectedActivityIds,
  onToggleActivity,
  customActivities,
  onAddCustomActivity,
  onDeleteCustomActivity,
  trainerChoice = false,
  onTrainerChoiceChange,
  startTime,
  onStartTimeChange,
  duration,
  onDurationChange,
  remainingHours,
  totalPackageHours,
  availableTrainers = [],
  packageActivities = [],
  location,
  selectedTrainerId,
  onTrainerSelect,
  isReturningFromReview = false,
  onFlowComplete,
  isEditing = false,
  onBackToReview,
  initialStep,
  editingDate,
}: CalendarBookingFlowProps) {
  
  // Debug logging removed to reduce console spam
  // Uncomment only when debugging calendar flow rendering issues
  //   // Debug logging removed to reduce console spam
  // Uncomment only when debugging calendar flow rendering issues
  // console.log('[CalendarBookingFlow] COMPONENT RENDERING!', { selectedDate, startTime, duration, currentStep: 'initializing' });
  
  // Start at date step by default, or use initialStep if provided
  const [currentStep, setCurrentStep] = useState<'date' | 'activities' | 'time' | 'trainer' | 'custom-time'>(initialStep || 'date');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasUsedInitialStep, setHasUsedInitialStep] = useState(false);
  const prevInitialStepRef = useRef(initialStep);
  
  // CRITICAL: Track manual navigation to prevent auto-advance from interfering
  // When user clicks Continue/Back buttons, we set this flag to prevent auto-advance logic
  const [isManualNavigation, setIsManualNavigation] = useState(false);
  const manualNavigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track slot constraints for Custom Time (when user clicks Custom Time from a selected slot)
  const [customTimeSlotConstraints, setCustomTimeSlotConstraints] = useState<{ minTime?: string; maxTime?: string } | null>(null);
  
  // Smart step detection: Update step based on available data (handles both new bookings and editing)
  useEffect(() => {
    // PRIORITY 1: If initialStep is explicitly provided, use it IMMEDIATELY
    // This takes absolute priority - don't auto-advance
    // CRITICAL: When initialStep is set, it overrides isReturningFromReview to prevent cycling
    // Always apply when initialStep changes OR when currentStep doesn't match initialStep
    // This ensures Edit buttons work correctly even if clicking the same Edit button multiple times
    if (initialStep !== undefined && initialStep !== null) {
      // Always sync currentStep with initialStep when initialStep is set
      // This handles both: 1) initialStep changed to new value, 2) currentStep drifted from initialStep
      if (currentStep !== initialStep || prevInitialStepRef.current !== initialStep) {
        setCurrentStep(initialStep);
        setHasInitialized(true); // Mark as initialized so we don't auto-advance
        setHasUsedInitialStep(true);
        prevInitialStepRef.current = initialStep;
      }
      return; // Exit early - initialStep takes absolute priority
    }
    
    // If initialStep was set but is now cleared, reset the flag
    if (!initialStep && hasUsedInitialStep) {
      setHasUsedInitialStep(false);
      prevInitialStepRef.current = undefined;
    }
    
    // PRIORITY 2: If returning from review (Change Details clicked), start at activities step if date is already set
    // BUT only if initialStep is NOT explicitly set (initialStep takes priority)
    // This allows parents to quickly change activities, time, or trainer without re-selecting the date
    if (isReturningFromReview && !initialStep) {
      if (selectedDate) {
        // Date is already set (editing mode), start at activities step
        setCurrentStep('activities');
      } else {
        // No date set, start at date step
        setCurrentStep('date');
      }
      setHasInitialized(true);
      return;
    }
    
    // PRIORITY 3: Only auto-advance on initial load (when hasInitialized is false)
    // BUT skip this if initialStep is set (already handled above)
    // CRITICAL: Skip auto-advance if user is manually navigating (clicked Continue/Back)
    if (!hasInitialized && !isManualNavigation) {
      // Check if we have a valid time selection (not just default values)
      // Default startTime is '09:00', so we check if it's been explicitly set by user
      // For a new booking, we should start at date step even if defaults are present
      const hasValidTime = startTime && startTime.trim() !== '' && duration > 0;
      
      // Check if this looks like an edit (has activities selected OR custom activities)
      // This helps distinguish between "new booking with defaults" vs "editing existing session"
      const looksLikeEdit = selectedActivityIds.length > 0 || customActivities.length > 0;
      
      // If editing (has date, valid time, duration, AND activities) - start at time step
      // OR if we have a date but it's not today (user explicitly selected a date)
      const isExplicitDate = selectedDate && moment(selectedDate).format('YYYY-MM-DD') !== moment().format('YYYY-MM-DD');
      
      if (selectedDate && hasValidTime && (looksLikeEdit || isExplicitDate)) {
        // If trainers available and trainer not selected, go to trainer step
        if (availableTrainers.length > 0 && onTrainerSelect && selectedTrainerId === undefined) {
          setCurrentStep('trainer');
        } else {
          setCurrentStep('time');
        }
        setHasInitialized(true);
      } 
      // If date selected but no valid time yet - move to activities
      // BUT only if initialStep is not set or already used (don't override explicit step)
      else if (selectedDate && !hasValidTime && (!initialStep || hasUsedInitialStep)) {
        setCurrentStep('activities');
        setHasInitialized(true);
      }
      // If no date selected OR date is today (default) with no activities - stay on date step
      else if (!selectedDate || (!looksLikeEdit && !isExplicitDate)) {
        setHasInitialized(true);
        // Stay on date step (already set by useState)
      }
    }
    // After initialization, only update if user hasn't manually navigated
    // (This prevents auto-advancing when user goes back)
    // IMPORTANT: If initialStep is set and already used, don't run auto-advance logic
    // CRITICAL: If user is manually navigating, skip all auto-advance logic
  }, [selectedDate, startTime, duration, hasInitialized, availableTrainers.length, onTrainerSelect, selectedTrainerId, selectedActivityIds.length, customActivities.length, isReturningFromReview, initialStep, hasUsedInitialStep, isManualNavigation, currentStep]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (manualNavigationTimeoutRef.current) {
        clearTimeout(manualNavigationTimeoutRef.current);
      }
    };
  }, []);
  
  // Start calendar at current month OR the month of minDate if in future
  const [currentMonth, setCurrentMonth] = useState<Moment>(() => {
    if (minDate && minDate.isAfter(moment(), 'month')) {
      return minDate.clone().startOf('month');
    }
    return moment().startOf('month');
  });
  const [showCustomTime, setShowCustomTime] = useState(false);

  // Calculate total duration from selected activities (for display only, not auto-setting)
  const totalActivitiesDuration = useMemo(() => {
    // Database activities duration
    const dbDuration = selectedActivityIds.reduce((sum, id) => {
      const activity = quickPickActivities.find(a => a.id === id);
      return sum + (activity?.duration || 0);
    }, 0);
    
    // Custom activities duration
    const customDuration = customActivities.reduce((sum, activity) => sum + activity.duration, 0);
    
    return dbDuration + customDuration;
  }, [selectedActivityIds, quickPickActivities, customActivities]);

  // CRITICAL: Check if activities exceed remaining hours
  const activitiesExceedRemaining = totalActivitiesDuration > remainingHours;

  // Calculate package activity IDs for SimpleActivitiesSection (must be at top level for hooks order)
  const packageActivityIds = useMemo(() => {
    const ids = new Set<number>();
    packageActivities.forEach(a => {
      if (a.id && !isNaN(a.id)) ids.add(a.id);
    });
    return ids;
  }, [packageActivities]);

  // Trainer filtering: Location-based + Activity-based trainers
  const filteredTrainers = useMemo(() => {
    if (!availableTrainers || availableTrainers.length === 0) {
      return [];
    }

    // Step 1: Separate trainers into location-based and activity-based
    const locationBasedTrainers: typeof availableTrainers = [];
    const activityBasedTrainers: typeof availableTrainers = [];
    const trainerMap = new Map<number, typeof availableTrainers[0] & { 
      isLocationBased?: boolean; 
      isActivityBased?: boolean;
      matchScore?: number; // Smart Trainer Matching: percentage match based on selected activities
    }>();

    // Step 2: Filter by location (if location is available) - ALWAYS show these
    if (location && (location.region || location.postcode)) {
      availableTrainers.forEach(trainer => {
        // Check if trainer serves this location
        const serviceRegions = trainer?.serviceRegions || [];
        const serviceAreaPostcodes = trainer?.serviceAreaPostcodes || [];
        
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
    // Enhanced with Smart Trainer Matching: Calculate match score based on selected activities
    if (selectedActivityIds.length > 0 && packageActivities.length > 0) {
      // Get all trainer IDs associated with selected activities
      const activityTrainerIds = new Set<number>();
      selectedActivityIds.forEach(activityId => {
        const activity = packageActivities.find(a => a.id === activityId);
        if (activity && activity.trainerIds) {
          activity.trainerIds.forEach(trainerId => activityTrainerIds.add(trainerId));
        }
      });

      // Add trainers that support selected activities + calculate match score
      availableTrainers.forEach(trainer => {
        // Calculate match score: percentage of selected activities that this trainer offers
        const trainerActivityIds = new Set<number>();
        packageActivities.forEach(activity => {
          if (activity.trainerIds && activity.trainerIds.includes(trainer.id)) {
            trainerActivityIds.add(activity.id);
          }
        });
        
        const selectedActivityIdsSet = new Set(selectedActivityIds);
        const matchingActivities = Array.from(trainerActivityIds).filter(id => selectedActivityIdsSet.has(id));
        const matchScore = selectedActivityIds.length > 0 
          ? Math.round((matchingActivities.length / selectedActivityIds.length) * 100)
          : 0;

        if (activityTrainerIds.has(trainer.id)) {
          const existing = trainerMap.get(trainer.id);
          if (existing) {
            existing.isActivityBased = true;
            existing.matchScore = matchScore;
          } else {
            const trainerWithBadge = { ...trainer, isActivityBased: true, matchScore };
            trainerMap.set(trainer.id, trainerWithBadge);
            activityBasedTrainers.push(trainerWithBadge);
          }
        } else {
          // Even if no matching activities, set match score for all trainers (for display)
          const existing = trainerMap.get(trainer.id);
          if (existing) {
            existing.matchScore = matchScore;
          } else {
            trainerMap.set(trainer.id, { ...trainer, matchScore });
          }
        }
      });
    } else {
      // No activities selected - set match score to undefined (don't show)
      availableTrainers.forEach(trainer => {
        const existing = trainerMap.get(trainer.id);
        if (existing) {
          existing.matchScore = undefined;
        } else {
          trainerMap.set(trainer.id, { ...trainer, matchScore: undefined });
        }
      });
    }

    // Step 4: If no location-based trainers found, show ALL trainers (fallback)
    if (trainerMap.size === 0) {
      availableTrainers.forEach(trainer => {
        trainerMap.set(trainer.id, { ...trainer });
      });
    }

    // Step 5: Combine both lists (deduplicate by trainer ID)
    const combinedTrainers = Array.from(trainerMap.values());

    // Step 6: Rank trainers (location-based first, then activity-based, then by match score)
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

      // Finally, sort by match score (higher is better)
      const aScore = a.matchScore ?? 0;
      const bScore = b.matchScore ?? 0;
      if (aScore !== bScore) return bScore - aScore;

      return 0;
    });

    return ranked;
  }, [availableTrainers, location, selectedActivityIds, packageActivities]);

  // REMOVED: Auto-update session duration - let parents decide duration themselves!
  // Parents choose duration in time step (minimum 3h, maximum remaining hours)

  // Set default duration when custom time is shown or start time is selected (if duration is invalid)
  useEffect(() => {
    // Only set default if we're in custom time mode and duration is invalid (0, undefined, or less than minimum)
    if (showCustomTime && startTime && (duration <= 0 || !duration || duration < MIN_DURATION_HOURS)) {
      // Default to minimum 3h (parents will choose actual duration)
      const safeDuration = Math.max(MIN_DURATION_HOURS, Math.min(calculateDefaultDuration(remainingHours), remainingHours));
      onDurationChange(safeDuration);
    }
  }, [showCustomTime, startTime, duration, remainingHours, onDurationChange]);

  // Handle date selection
  const handleDateSelect = (date: string) => {
    // CRITICAL: Mark as manual navigation to prevent auto-advance interference
    setIsManualNavigation(true);
    
    // Clear any existing timeout
    if (manualNavigationTimeoutRef.current) {
      clearTimeout(manualNavigationTimeoutRef.current);
    }
    
    onDateChange(date);
    // Auto-advance to activities selection (NEW FLOW!) - EXPLICIT navigation
    setCurrentStep('activities');
    
    // Reset manual navigation flag after a short delay
    manualNavigationTimeoutRef.current = setTimeout(() => {
      setIsManualNavigation(false);
    }, 100);
  };

  // Handle activities completion
  const handleActivitiesComplete = () => {
    // CRITICAL: Mark as manual navigation to prevent auto-advance interference
    setIsManualNavigation(true);
    
    // Clear any existing timeout
    if (manualNavigationTimeoutRef.current) {
      clearTimeout(manualNavigationTimeoutRef.current);
    }
    
    // Auto-set duration to activity total (minimum 3h) when moving to time step
    if (totalActivitiesDuration > 0) {
      const targetDuration = Math.max(MIN_DURATION_HOURS, Math.min(totalActivitiesDuration, remainingHours));
      onDurationChange(targetDuration);
    } else {
      // No activities selected, use minimum
      onDurationChange(MIN_DURATION_HOURS);
    }
    
    // Advance to time selection - EXPLICIT navigation
    setCurrentStep('time');
    
    // Reset manual navigation flag after a short delay (allows step to settle)
    manualNavigationTimeoutRef.current = setTimeout(() => {
      setIsManualNavigation(false);
    }, 100);
  };

  // Handle time slot selection (from enhanced selector)
  const handleTimeSlotComplete = (start: string, dur: number) => {
    // CRITICAL: Mark as manual navigation to prevent auto-advance interference
    setIsManualNavigation(true);
    
    // Clear any existing timeout
    if (manualNavigationTimeoutRef.current) {
      clearTimeout(manualNavigationTimeoutRef.current);
    }
    
    onStartTimeChange(start);
    onDurationChange(dur);
    
    // If trainers available, go to trainer selection step, otherwise complete flow - EXPLICIT navigation
    if (availableTrainers.length > 0 && onTrainerSelect) {
      setCurrentStep('trainer');
      // Reset manual navigation flag after a short delay
      manualNavigationTimeoutRef.current = setTimeout(() => {
        setIsManualNavigation(false);
      }, 100);
    } else {
      setIsManualNavigation(false); // Reset immediately if completing flow
      onFlowComplete();
    }
  };

  // Handle custom time click
  const handleCustomTimeClick = (slotConstraints?: { minTime?: string; maxTime?: string }) => {
    setShowCustomTime(true);
    setCurrentStep('custom-time');
    // Store slot constraints if provided (so Custom Time respects the selected slot)
    setCustomTimeSlotConstraints(slotConstraints || null);
  };

  // Handle custom time confirmation
  const handleCustomTimeConfirm = () => {
    // CRITICAL: Mark as manual navigation to prevent auto-advance interference
    setIsManualNavigation(true);
    
    // Clear any existing timeout
    if (manualNavigationTimeoutRef.current) {
      clearTimeout(manualNavigationTimeoutRef.current);
    }
    
    // If trainers available, go to trainer selection step, otherwise complete flow - EXPLICIT navigation
    if (availableTrainers.length > 0 && onTrainerSelect) {
      setCurrentStep('trainer');
      // Reset manual navigation flag after a short delay
      manualNavigationTimeoutRef.current = setTimeout(() => {
        setIsManualNavigation(false);
      }, 100);
    } else {
      setIsManualNavigation(false); // Reset immediately if completing flow
      onFlowComplete();
    }
  };

  // Handle trainer selection completion
  const handleTrainerComplete = () => {
    onFlowComplete();
  };

  // Go back to previous step
  const handleBack = () => {
    // CRITICAL: Mark as manual navigation to prevent auto-advance interference
    setIsManualNavigation(true);
    
    // Clear any existing timeout
    if (manualNavigationTimeoutRef.current) {
      clearTimeout(manualNavigationTimeoutRef.current);
    }
    
    // EXPLICIT navigation - no auto-advance interference
    if (currentStep === 'trainer') {
      setCurrentStep('time');
      setShowCustomTime(false); // Reset custom time state when going back
      // Keep slot constraints when going back from trainer to time step
    } else if (currentStep === 'time' || currentStep === 'custom-time') {
      setCurrentStep('activities');
      if (currentStep === 'custom-time') {
        setShowCustomTime(false);
        // Clear slot constraints when going back from custom-time to activities
        setCustomTimeSlotConstraints(null);
      }
    } else if (currentStep === 'activities') {
      setCurrentStep('date');
    }
    
    // Reset manual navigation flag after a short delay
    manualNavigationTimeoutRef.current = setTimeout(() => {
      setIsManualNavigation(false);
    }, 100);
  };

  // Get step name for breadcrumb
  const getStepName = (step: string): string => {
    switch (step) {
      case 'date': return 'Date';
      case 'activities': return 'Activities';
      case 'time': return 'Time & Duration';
      case 'custom-time': return 'Time & Duration';
      case 'trainer': return 'Trainer';
      default: return 'Session Details';
    }
  };

  return (
    <div className="space-y-6" data-calendar-flow>
      {/* Breadcrumb: Show when editing from Review */}
      {isReturningFromReview && initialStep && (
        <div className="bg-blue-50 border-l-4 border-[#0080FF] rounded-lg p-4">
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5 text-[#0080FF] flex-shrink-0" />
            <p className="text-sm font-semibold text-[#1E3A5F]">
              Editing: <span className="text-[#0080FF]">{getStepName(currentStep)}</span>
            </p>
            <span className="text-xs text-gray-600 ml-auto">
              Make your changes and continue to save
            </span>
          </div>
        </div>
      )}

      {/* Progress Indicators - Google Calendar Style */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-7 gap-2 items-center">
          {/* Step 1: Date */}
          <div className="flex flex-col items-center gap-1">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
              ${currentStep === 'date'
                ? 'bg-gradient-to-br from-[#0080FF] to-[#00D4FF] text-white'
                : (selectedDate && moment(selectedDate).format('YYYY-MM-DD') !== moment().format('YYYY-MM-DD')) || (selectedDate && (selectedActivityIds.length > 0 || customActivities.length > 0))
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600'
              }
            `}>
              {((selectedDate && moment(selectedDate).format('YYYY-MM-DD') !== moment().format('YYYY-MM-DD')) || (selectedDate && (selectedActivityIds.length > 0 || customActivities.length > 0))) ? <CheckCircle2 className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
            </div>
            <span className={`text-xs font-semibold hidden sm:inline whitespace-nowrap text-center ${
              currentStep === 'date' ? 'text-[#0080FF]' : ((selectedDate && moment(selectedDate).format('YYYY-MM-DD') !== moment().format('YYYY-MM-DD')) || (selectedDate && (selectedActivityIds.length > 0 || customActivities.length > 0))) ? 'text-green-600' : 'text-gray-600'
            }`}>
              Pick date
            </span>
          </div>

          {/* Connector */}
          <div className={`h-0.5 ${((selectedDate && moment(selectedDate).format('YYYY-MM-DD') !== moment().format('YYYY-MM-DD')) || (selectedDate && (selectedActivityIds.length > 0 || customActivities.length > 0))) ? 'bg-green-500' : 'bg-gray-200'}`}></div>

          {/* Step 2: Activities */}
          <div className="flex flex-col items-center gap-1">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
              ${currentStep === 'activities'
                ? 'bg-gradient-to-br from-[#0080FF] to-[#00D4FF] text-white'
                : (selectedActivityIds.length > 0 || customActivities.length > 0 || trainerChoice)
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600'
              }
            `}>
              {(selectedActivityIds.length > 0 || customActivities.length > 0 || trainerChoice) ? <CheckCircle2 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <span className={`text-xs font-semibold hidden sm:inline whitespace-nowrap text-center ${
              currentStep === 'activities' ? 'text-[#0080FF]' : (selectedActivityIds.length > 0 || customActivities.length > 0 || trainerChoice) ? 'text-green-600' : 'text-gray-600'
            }`}>
              Activities
            </span>
          </div>

          {/* Connector */}
          <div className={`h-0.5 ${(selectedActivityIds.length > 0 || customActivities.length > 0 || trainerChoice) ? 'bg-green-500' : 'bg-gray-200'}`}></div>

          {/* Step 3: Time */}
          <div className="flex flex-col items-center gap-1">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
              ${currentStep === 'time' || currentStep === 'custom-time'
                ? 'bg-gradient-to-br from-[#0080FF] to-[#00D4FF] text-white'
                : (startTime && duration > 0 && (selectedActivityIds.length > 0 || customActivities.length > 0))
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600'
              }
            `}>
              {(startTime && duration > 0 && (selectedActivityIds.length > 0 || customActivities.length > 0)) ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <span className={`text-xs font-semibold hidden sm:inline whitespace-nowrap text-center ${
              currentStep === 'time' || currentStep === 'custom-time' ? 'text-[#0080FF]' : (startTime && duration > 0 && (selectedActivityIds.length > 0 || customActivities.length > 0 || trainerChoice)) ? 'text-green-600' : 'text-gray-600'
            }`}>
              Time & duration
            </span>
          </div>

          {/* Connector */}
          {availableTrainers.length > 0 && onTrainerSelect ? (
            <>
              <div className={`h-0.5 ${(startTime && duration > 0 && (selectedActivityIds.length > 0 || customActivities.length > 0 || trainerChoice)) ? 'bg-green-500' : 'bg-gray-200'}`}></div>

              {/* Step 4: Trainer (Optional) */}
              <div className="flex flex-col items-center gap-1">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${currentStep === 'trainer'
                    ? 'bg-gradient-to-br from-[#0080FF] to-[#00D4FF] text-white'
                    : selectedTrainerId !== null && selectedTrainerId !== undefined
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {selectedTrainerId !== null && selectedTrainerId !== undefined ? <CheckCircle2 className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-semibold hidden sm:inline whitespace-nowrap text-center ${
                  currentStep === 'trainer' ? 'text-[#0080FF]' : selectedTrainerId !== null && selectedTrainerId !== undefined ? 'text-green-600' : 'text-gray-600'
                }`}>
                  Trainer
                </span>
              </div>
            </>
          ) : (
            <div className="col-span-2"></div>
          )}
        </div>
      </div>

      {/* Step Content */}
      <div className="relative min-h-[400px]">
        {/* STEP 1: Date Selection */}
        {currentStep === 'date' && (
          <div className="animate-fadeIn">
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">
                📅 When would you like to book?
              </h2>
              <p className="text-sm text-gray-600">
                Select a date from the calendar below
              </p>
            </div>
            
            {/* Editing Indicator - Show which date is being edited */}
            {isEditing && editingDate && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-900">
                      Editing Session
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Current date: <span className="font-bold">{moment(editingDate).format('dddd, MMMM D, YYYY')}</span> (highlighted in amber below)
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <MonthCalendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              blockedDates={blockedDates}
              bookedSessions={bookedSessions}
              onBookedDateClick={onBookedDateClick}
              minDate={minDate}
              maxDate={maxDate}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              editingDate={editingDate}
            />
          </div>
        )}

        {/* STEP 2: Activities Selection (NEW: Before Time!) */}
        {currentStep === 'activities' && (
          <div className="animate-fadeIn relative pb-32">
            {/* EDIT MODE: Back to Review Button */}
            {isEditing && onBackToReview && (
              <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900 mb-1">
                        Make your changes here
                      </p>
                      <p className="text-xs text-blue-700">
                        Change activities, time, or trainer. When done, click &quot;Back to Review&quot; below, then &quot;Save Changes&quot; at the bottom.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={onBackToReview}
                    variant="primary"
                    size="sm"
                    icon={<ArrowLeft className="w-4 h-4" />}
                    className="flex-shrink-0"
                  >
                    Back to Review
                  </Button>
                </div>
              </div>
            )}
            
            {/* Selected Date Summary */}
            <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-green-700 font-medium">Selected Date</p>
                    <p className="text-lg font-bold text-green-900">
                      {moment(selectedDate ?? '').format('dddd, MMMM D, YYYY')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change
                </button>
              </div>
            </div>

            {/* Activities Header */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">
                What activities would you like?
              </h2>
              <p className="text-sm text-gray-600">
                Select activities for your session • You'll choose the session duration next
              </p>
            </div>

            {/* Activities Section */}
            {quickPickActivities && quickPickActivities.length > 0 ? (
              <SimpleActivitiesSection
                duration={remainingHours}
                quickPickActivities={quickPickActivities}
                selectedActivityIds={selectedActivityIds}
                onToggleActivity={onToggleActivity}
                customActivities={customActivities}
                onAddCustomActivity={onAddCustomActivity}
                onDeleteCustomActivity={onDeleteCustomActivity}
                remainingTime={remainingHours}
                totalPackageHours={totalPackageHours}
                trainerChoice={trainerChoice}
                onTrainerChoiceChange={onTrainerChoiceChange}
                packageActivityIds={packageActivityIds}
                existingSessions={bookedSessions}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-700 mb-2">Loading Activities...</h3>
                <p className="text-sm text-gray-600">
                  Please wait whilst we load available activities for your session.
                </p>
              </div>
            )}

            {/* INSPIRATIONAL UI: Inline Continue Button (not sticky) */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="max-w-7xl mx-auto">
                {/* Selected Summary in Footer */}
                {totalActivitiesDuration > 0 && (
                  <div className="mb-3 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-bold text-blue-700">
                      {totalActivitiesDuration.toFixed(1)}h selected
                    </span>
                    <span className="text-xs text-gray-600">
                      • {remainingHours.toFixed(1)}h remaining
                    </span>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    icon={<ArrowLeft className="w-4 h-4" />}
                    className="flex-1"
                  >
                    Back to Date
                  </Button>
                  <Button
                    onClick={handleActivitiesComplete}
                    disabled={
                      (selectedActivityIds.length === 0 && customActivities.length === 0 && !trainerChoice) ||
                      activitiesExceedRemaining
                    }
                    className="flex-1 text-sm font-semibold py-3 shadow-lg"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {activitiesExceedRemaining ? (
                        <>
                          ⚠️ Remove Activities First
                        </>
                      ) : (
                        <>
                          Continue to Time
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Time Slot Selection */}
        {currentStep === 'time' && !showCustomTime && (
          <div className="animate-fadeIn">
            {/* Selected Date Summary */}
            <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-green-700 font-medium">Selected Date</p>
                    <p className="text-lg font-bold text-green-900">
                      {moment(selectedDate ?? '').format('dddd, MMMM D, YYYY')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change
                </button>
              </div>
            </div>

            {/* Activities Summary (if selected) */}
            {totalActivitiesDuration > 0 && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Selected Activities</p>
                      <p className="text-lg font-bold text-blue-900">
                        {totalActivitiesDuration.toFixed(1)}h total
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('activities')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-white hover:bg-blue-100 rounded-lg transition-colors border border-blue-300 shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Change Activities
                  </button>
                </div>
                <p className="text-xs text-blue-600 font-semibold">
                  ✅ Duration set to {totalActivitiesDuration.toFixed(1)}h from your activities
                </p>
              </div>
            )}

            <EnhancedTimeSlotSelector
              selectedDate={selectedDate}
              onComplete={handleTimeSlotComplete}
              onCustomTimeClick={handleCustomTimeClick}
              minDuration={totalActivitiesDuration > 0 ? totalActivitiesDuration : undefined}
              maxDuration={remainingHours}
              initialDuration={duration}
              onChangeActivities={() => setCurrentStep('activities')}
            />

            {/* Back Button */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleBack}
                className="text-sm text-gray-600 hover:text-[#0080FF] font-medium inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to activities
              </button>
            </div>
          </div>
        )}

        {/* STEP 2B: Custom Time Selection */}
        {currentStep === 'custom-time' && showCustomTime && (
          <div className="animate-fadeIn">
            {/* Selected Date Summary */}
            <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-green-700 font-medium">Selected Date</p>
                  <p className="text-lg font-bold text-green-900">
                    {moment(selectedDate ?? '').format('dddd, MMMM D, YYYY')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-[#1E3A5F] mb-6 text-center">
                🕐 Set Your Custom Time
              </h3>

              <div className="space-y-6">
                {/* Start Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time
                  </label>
                  <TimePicker
                    value={startTime}
                    onChange={onStartTimeChange}
                    selectedDate={selectedDate ?? undefined}
                    label=""
                    minTime={customTimeSlotConstraints?.minTime}
                    maxTime={customTimeSlotConstraints?.maxTime}
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration
                  </label>
                  <DurationPicker
                    value={duration || MIN_DURATION_HOURS}
                    onChange={onDurationChange}
                    maxHours={remainingHours}
                    label=""
                  />
                </div>

                {/* Summary */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Session:</span>{' '}
                    {startTime && duration ? (
                      <>
                        {startTime} - {(() => {
                          const endTime = moment(startTime, 'HH:mm').add(duration, 'hours');
                          const endHour = endTime.hours();
                          const endMinute = endTime.minutes();
                          // If end time is 24:00 (midnight next day), display as 00:00
                          if (endHour === 0 && endMinute === 0 && duration > 0) {
                            return '00:00';
                          }
                          return endTime.format('HH:mm');
                        })()} ({duration}h)
                      </>
                    ) : (
                      <span className="text-red-600">Please select a start time and duration</span>
                    )}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCustomTimeConfirm}
                    disabled={!startTime || !duration || duration < MIN_DURATION_HOURS}
                    className="flex-1"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Trainer Selection (Optional) */}
        {currentStep === 'trainer' && availableTrainers.length > 0 && onTrainerSelect && (
          <div className="animate-fadeIn relative pb-24">
            {/* Selected Date & Time Summary - Google Calendar style */}
            <div className="mb-6 p-4 bg-green-50/50 border-l-4 border-green-500 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Selected Date & Time</p>
                  <p className="text-sm font-medium text-gray-900">
                    {moment(selectedDate ?? '').format('dddd, MMMM D, YYYY')}
                  </p>
                  <p className="text-xs text-gray-600">
                    {startTime} - {moment(startTime, 'HH:mm').add(duration, 'hours').format('HH:mm')} ({duration}h)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep('time')}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Activities Summary (if selected) - Google Calendar style */}
            {totalActivitiesDuration > 0 && (
              <div className="mb-4 p-4 bg-blue-50/50 border-l-4 border-blue-500 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Selected Activities</p>
                    <p className="text-sm font-medium text-gray-900">
                      {totalActivitiesDuration.toFixed(1)}h total
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('activities')}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}

            {/* Trainer Selection UI - Google Calendar style */}
            <div className="p-5 bg-white border-b border-gray-200 pb-6">
              <div className="mb-4">
                <h4 className="text-base font-medium text-gray-900 mb-1">Choose Your Trainer</h4>
                <p className="text-xs text-gray-600">(Optional - but helps ensure the best match!)</p>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                You have two options: <strong>let us auto-assign</strong> the perfect trainer, or <strong>pick a specific trainer</strong> yourself.
              </p>

              {/* Trainer Availability Info - Google Calendar style */}
              {filteredTrainers.length > 0 && location && (
                <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs text-gray-600">
                    {filteredTrainers.length} trainer{filteredTrainers.length === 1 ? '' : 's'} available
                    {location.region && ` in ${location.region}`}
                    {selectedActivityIds.length > 0 && ` for your selected activities`}
                  </p>
                </div>
              )}

              {/* Auto-Assign Best Match Card - Google Calendar style with clear clickability */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => {
                    onTrainerSelect(null);
                    handleTrainerComplete();
                  }}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all duration-300 cursor-pointer ${
                    selectedTrainerId === null
                      ? 'border-[#0080FF] bg-blue-50 shadow-md ring-2 ring-[#0080FF]/20'
                      : 'border-gray-300 hover:border-[#0080FF] hover:bg-blue-50/30 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-bold text-[#1E3A5F] text-base">✨ Auto-Assign Best Match</span>
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-bold uppercase">Recommended</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-700"><strong>Best for your location</strong> - matched to your area</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-700"><strong>Perfect for selected activities</strong> - expert match</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-700"><strong>Faster booking</strong> - skip the selection step!</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                      {selectedTrainerId === null ? (
                        <div className="w-8 h-8 rounded-full bg-[#0080FF] flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center transition-all duration-300 hover:border-[#0080FF]">
                          <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
                        </div>
                      )}
                      <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                        {selectedTrainerId === null ? 'Selected' : 'Click to select'}
                      </span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Clear Visual Separator - Google Calendar style */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 py-1 bg-white text-gray-600 text-xs font-semibold uppercase tracking-wider border border-gray-300 rounded-full">
                    OR CHOOSE A SPECIFIC TRAINER
                  </span>
                </div>
              </div>

              {/* Specific Trainer Selection */}
              {filteredTrainers.length > 0 && (
                <>
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-sm font-bold text-gray-900 mb-2">Select a Specific Trainer:</p>
                    <p className="text-xs text-gray-600">
                      💡 <strong>Tip:</strong> Choosing a specific trainer can help if your child has worked with them before or if you prefer their style. We'll show you the best matches first.
                    </p>
                    {selectedActivityIds.length === 0 && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
                          <span>💡</span>
                          <span>Smart Match Available</span>
                        </p>
                        <p className="text-xs text-blue-700">
                          <strong>How it works:</strong> When you select specific activities, we&apos;ll show a <strong>Match %</strong> on each trainer based on their qualifications and experience. If you choose <strong>Trainer&apos;s Choice</strong>, we&apos;ll match trainers by availability and location instead.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* INSPIRATIONAL UI: Trainer Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {filteredTrainers.slice(0, 6).map((trainer) => {
                      const isSelected = selectedTrainerId === trainer.id;
                      
                      // Calculate match percentage based on activities
                      const selectedActivityNames = packageActivities
                        .filter(a => selectedActivityIds.includes(a.id))
                        .map(a => a.name);
                      
                      // Get trainer's activities (if available)
                      const trainerActivityNames = trainer?.activities ?? [];
                      const matchingActivities = selectedActivityNames.filter(name => 
                        trainerActivityNames.includes(name)
                      );
                      const matchPercentage = selectedActivityNames.length > 0 
                        ? Math.round((matchingActivities.length / selectedActivityNames.length) * 100)
                        : 0;

                      // Get trainer avatar initials
                      const trainerAvatar = trainer.name
                        ? trainer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                        : 'TR';

                      return (
                        <button
                          key={trainer.id}
                          type="button"
                          onClick={() => onTrainerSelect(trainer.id)}
                          className={`p-4 sm:p-6 border-2 rounded-lg text-left transition-all duration-300 ${
                            isSelected
                              ? 'border-[#0080FF] bg-blue-50 shadow-lg ring-2 ring-[#0080FF]/20'
                              : 'border-gray-300 hover:border-[#0080FF] hover:bg-blue-50/30 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#0080FF] text-white flex items-center justify-center font-semibold flex-shrink-0 shadow-md">
                              {trainerAvatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-gray-900">{trainer.name}</h3>
                                  <p className="text-sm text-gray-600 mt-1">{trainer.role || 'Trainer'}</p>
                                </div>
                                {isSelected && (
                                  <Check className="w-5 h-5 text-[#0080FF] flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-1 mt-2">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              
                              {selectedActivityIds.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className={`h-full rounded-full ${
                                          matchPercentage >= 70 ? 'bg-green-500' : 
                                          matchPercentage >= 40 ? 'bg-yellow-500' : 
                                          matchPercentage > 0 ? 'bg-orange-400' : 'bg-gray-400'
                                        }`}
                                        style={{ width: `${matchPercentage}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600 whitespace-nowrap">{matchPercentage}% match</span>
                                  </div>
                                  {matchingActivities.length > 0 ? (
                                    <div>
                                      <p className="text-xs text-gray-600 mb-1.5 font-medium">Can teach:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {matchingActivities.slice(0, 3).map((activity, idx) => (
                                          <span key={idx} className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                            {activity}
                                          </span>
                                        ))}
                                        {matchingActivities.length > 3 && (
                                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                            +{matchingActivities.length - 3} more
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="text-xs text-gray-600 mb-1.5 font-medium">Specializes in:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {trainerActivityNames.slice(0, 3).map((activity: string, idx: number) => (
                                          <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                            {activity}
                                          </span>
                                        ))}
                                        {trainerActivityNames.length > 3 && (
                                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                            +{trainerActivityNames.length - 3} more
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Will coordinate with specialist trainers
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* INSPIRATIONAL UI: Inline Footer Buttons (not sticky) */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                {isEditing && onBackToReview ? (
                  <>
                    <Button
                      onClick={onBackToReview}
                      variant="outline"
                      className="flex-1"
                    >
                      Back to Review
                    </Button>
                    <Button
                      onClick={() => {
                        // If trainer not selected, default to null (auto-assign)
                        if (selectedTrainerId === undefined) {
                          onTrainerSelect?.(null);
                        }
                        handleTrainerComplete();
                      }}
                      variant="primary"
                      className="flex-1"
                    >
                      Continue
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => setCurrentStep('time')}
                      variant="outline"
                      className="flex-1"
                    >
                      Back to Time
                    </Button>
                    <Button
                      onClick={() => {
                        // If trainer not selected, default to null (auto-assign)
                        if (selectedTrainerId === undefined) {
                          onTrainerSelect?.(null);
                        }
                        handleTrainerComplete();
                      }}
                      variant="primary"
                      className="flex-1"
                    >
                      Continue
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
