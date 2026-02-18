/**
 * Trainer Availability Service
 * 
 * Infrastructure service for checking trainer availability.
 * In production, this would connect to a backend API.
 * Currently uses mock data for development.
 */

import moment from 'moment';

export interface TrainerTimeSlot {
  start: string; // "09:00"
  end: string; // "17:00"
  available: boolean;
  bookedBy?: string; // Booking reference if not available
}

export interface TrainerAvailability {
  trainerId: number;
  date: string; // "2025-10-28"
  slots: TrainerTimeSlot[];
}

// Mock trainer availability data
// In production, this would come from a backend API
const mockAvailabilityData: TrainerAvailability[] = [
  {
    trainerId: 1, // Sarah Miller
    date: '2025-10-28',
    slots: [
      { start: '09:00', end: '12:00', available: true },
      { start: '12:00', end: '15:00', available: false, bookedBy: 'BK-2025-001' },
      { start: '15:00', end: '18:00', available: true },
    ]
  },
  {
    trainerId: 1, // Sarah Miller
    date: '2025-10-29',
    slots: [
      { start: '09:00', end: '17:00', available: true },
    ]
  },
  {
    trainerId: 2, // James Wilson
    date: '2025-10-28',
    slots: [
      { start: '09:00', end: '17:00', available: true },
    ]
  },
  {
    trainerId: 3, // Emma Thompson
    date: '2025-10-28',
    slots: [
      { start: '09:00', end: '13:00', available: true },
      { start: '13:00', end: '17:00', available: false, bookedBy: 'BK-2025-002' },
    ]
  },
];

/**
 * Check if a trainer is available for a specific time range on a given date
 * @param trainerId - ID of the trainer (null means "No Preference")
 * @param date - Date in YYYY-MM-DD format or moment object
 * @param startTime - Start time in HH:mm format (e.g., "09:00")
 * @param endTime - End time in HH:mm format (e.g., "17:00")
 * @returns true if trainer is available, false otherwise
 */
export function checkTrainerAvailability(
  trainerId: number | null,
  date: string | moment.Moment,
  startTime: string,
  endTime: string
): boolean {
  // If no specific trainer selected, consider all time slots available
  if (trainerId === null) {
    return true;
  }

  const dateString = typeof date === 'string' ? date : date.format('YYYY-MM-DD');
  
  // Find trainer's availability for this date
  const trainerDay = mockAvailabilityData.find(
    (av) => av.trainerId === trainerId && av.date === dateString
  );

  // If no availability data exists for this date, assume trainer is available
  // (In production, this would be handled by the backend API)
  if (!trainerDay) {
    return true;
  }

  // Convert times to minutes for easier comparison
  const requestStart = timeToMinutes(startTime);
  const requestEnd = timeToMinutes(endTime);

  // Check if ALL requested time is covered by available slots
  for (const slot of trainerDay.slots) {
    const slotStart = timeToMinutes(slot.start);
    const slotEnd = timeToMinutes(slot.end);

    // Check if this slot covers the requested time
    const coversStart = slotStart <= requestStart;
    const coversEnd = slotEnd >= requestEnd;

    if (coversStart && coversEnd && slot.available) {
      return true;
    }
  }

  return false;
}

/**
 * Get all unavailable time slots for a trainer on a specific date
 * @param trainerId - ID of the trainer
 * @param date - Date in YYYY-MM-DD format or moment object
 * @returns Array of unavailable time ranges
 */
export function getUnavailableSlots(
  trainerId: number | null,
  date: string | moment.Moment
): Array<{ start: string; end: string; bookedBy?: string }> {
  if (trainerId === null) {
    return [];
  }

  const dateString = typeof date === 'string' ? date : date.format('YYYY-MM-DD');
  
  const trainerDay = mockAvailabilityData.find(
    (av) => av.trainerId === trainerId && av.date === dateString
  );

  if (!trainerDay) {
    return [];
  }

  return trainerDay.slots
    .filter(slot => !slot.available)
    .map(slot => ({
      start: slot.start,
      end: slot.end,
      bookedBy: slot.bookedBy
    }));
}

/**
 * Convert time string (HH:mm) to minutes since midnight
 * @param time - Time in HH:mm format
 * @returns Minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Get trainer availability summary for display
 * @param trainerId - ID of the trainer
 * @param date - Date in YYYY-MM-DD format or moment object
 * @returns Availability summary object
 */
export function getTrainerAvailabilitySummary(
  trainerId: number | null,
  date: string | moment.Moment
): {
  hasAvailability: boolean;
  totalAvailableHours: number;
  unavailableSlots: Array<{ start: string; end: string }>;
} {
  if (trainerId === null) {
    return {
      hasAvailability: true,
      totalAvailableHours: 8, // Default 8 hours
      unavailableSlots: []
    };
  }

  const dateString = typeof date === 'string' ? date : date.format('YYYY-MM-DD');
  
  const trainerDay = mockAvailabilityData.find(
    (av) => av.trainerId === trainerId && av.date === dateString
  );

  if (!trainerDay) {
    return {
      hasAvailability: false,
      totalAvailableHours: 0,
      unavailableSlots: []
    };
  }

  const availableSlots = trainerDay.slots.filter(slot => slot.available);
  const unavailableSlots = trainerDay.slots.filter(slot => !slot.available);

  const totalAvailableHours = availableSlots.reduce((sum, slot) => {
    const start = timeToMinutes(slot.start);
    const end = timeToMinutes(slot.end);
    return sum + ((end - start) / 60);
  }, 0);

  return {
    hasAvailability: availableSlots.length > 0,
    totalAvailableHours,
    unavailableSlots: unavailableSlots.map(slot => ({
      start: slot.start,
      end: slot.end
    }))
  };
}

