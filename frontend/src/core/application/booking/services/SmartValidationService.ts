/**
 * Smart Validation Service
 * 
 * Clean Architecture Layer: Application (Services)
 * Purpose: Provides real-time validation for bookings including duplicate checks, availability, and mode compatibility
 */

import { BookingDTO } from '../dto/BookingDTO';
import { CreateBookingDTO } from '../dto/CreateBookingDTO';
import { PackageDTO } from '../../packages/dto/PackageDTO';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export interface DuplicateBookingCheck {
  isDuplicate: boolean;
  conflictingBookings: BookingDTO[];
  message?: string;
}

export interface AvailabilityCheck {
  isAvailable: boolean;
  conflicts: Array<{
    date: string;
    time: string;
    reason: string;
  }>;
  message?: string;
}

export interface ModeCompatibilityCheck {
  isCompatible: boolean;
  message?: string;
  suggestedMode?: string;
}

export class SmartValidationService {
  /**
   * Validate a booking comprehensively
   */
  static validateBooking(
    dto: CreateBookingDTO,
    packageData: PackageDTO,
    previousBookings: BookingDTO[],
    bookedDates: string[],
    bookedTimeSlots?: Array<{ date: string; startTime: string; endTime: string }>
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 1. Duplicate booking check
    const duplicateCheck = this.checkDuplicateBooking(
      dto,
      packageData,
      previousBookings
    );
    if (duplicateCheck.isDuplicate) {
      errors.push({
        field: 'package',
        message: duplicateCheck.message || 'This package has already been purchased for this child.',
        code: 'DUPLICATE_BOOKING',
      });
    }

    // 2. Availability validation
    if (dto.schedules && dto.schedules.length > 0) {
      const availabilityCheck = this.checkAvailability(
        dto.schedules,
        bookedDates,
        bookedTimeSlots
      );
      if (!availabilityCheck.isAvailable) {
        availabilityCheck.conflicts.forEach(conflict => {
          errors.push({
            field: 'schedules',
            message: `Time slot ${conflict.date} at ${conflict.time} is not available: ${conflict.reason}`,
            code: 'UNAVAILABLE_SLOT',
          });
        });
      }
    }

    // 3. Mode compatibility check
    const modeCheck = this.checkModeCompatibility(
      dto.modeKey,
      packageData
    );
    if (!modeCheck.isCompatible) {
      errors.push({
        field: 'mode',
        message: modeCheck.message || 'Selected mode is not compatible with this package.',
        code: 'INCOMPATIBLE_MODE',
      });
    } else if (modeCheck.suggestedMode) {
      warnings.push({
        field: 'mode',
        message: modeCheck.message || `Consider using "${modeCheck.suggestedMode}" mode for better compatibility.`,
        code: 'MODE_SUGGESTION',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check for duplicate bookings
   */
  static checkDuplicateBooking(
    dto: CreateBookingDTO,
    packageData: PackageDTO,
    previousBookings: BookingDTO[]
  ): DuplicateBookingCheck {
    if (!dto.participants || dto.participants.length === 0) {
      return { isDuplicate: false, conflictingBookings: [] };
    }

    const childIds = dto.participants
      .map(p => p.childId)
      .filter((id): id is number => id !== undefined && id !== null);

    if (childIds.length === 0) {
      return { isDuplicate: false, conflictingBookings: [] };
    }

    // BUSINESS RULE: One active package per child (regardless of package type)
    // Check for ANY active booking for this child, not just the same package
    const conflictingBookings = previousBookings.filter(booking => {
      // Skip cancelled bookings
      if (booking.status === 'cancelled' || booking.cancelledAt) {
        return false;
      }

      // Skip bookings without participants
      if (!booking.participants || booking.participants.length === 0) {
        return false;
      }

      // Check if this booking has any of the children we're trying to book for
      const hasMatchingChild = booking.participants.some(participant => {
        const participantChildId = typeof participant.childId === 'string'
          ? parseInt(participant.childId, 10)
          : participant.childId;
        return participantChildId !== undefined && childIds.includes(participantChildId);
      });

      if (!hasMatchingChild) {
        return false;
      }

      // Check if booking is still active (has remaining hours or hasn't expired)
      const hasRemainingHours = (booking.remainingHours || 0) > 0;
      const isNotExpired = !booking.packageExpiresAt || new Date(booking.packageExpiresAt) > new Date();
      
      // Booking is active if it has remaining hours or hasn't expired
      return hasRemainingHours || isNotExpired;
    });

    if (conflictingBookings.length === 0) {
      return { isDuplicate: false, conflictingBookings: [] };
    }

    if (conflictingBookings.length > 0) {
      const activeBooking = conflictingBookings[0];
      const packageName = activeBooking.package?.name || 'a package';
      const expiresAt = activeBooking.packageExpiresAt 
        ? new Date(activeBooking.packageExpiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'No expiry set';
      
      return {
        isDuplicate: true,
        conflictingBookings,
        message: `This child already has an active package (${packageName}). According to our policy, each child can only have one active package at a time. The current package expires on ${expiresAt}. Please complete or cancel the existing package, or wait until it expires before booking a new package.`,
      };
    }

    return {
      isDuplicate: false,
      conflictingBookings: [],
    };
  }

  /**
   * Check availability for scheduled sessions
   */
  static checkAvailability(
    schedules: CreateBookingDTO['schedules'],
    bookedDates: string[],
    bookedTimeSlots?: Array<{ date: string; startTime: string; endTime: string }>
  ): AvailabilityCheck {
    const conflicts: Array<{ date: string; time: string; reason: string }> = [];

    if (!schedules || schedules.length === 0) {
      return { isAvailable: true, conflicts: [] };
    }

    schedules.forEach(schedule => {
      const dateStr = schedule.date;
      const startTime = schedule.startTime;
      const endTime = schedule.endTime;

      if (bookedDates.includes(dateStr)) {
        conflicts.push({
          date: dateStr,
          time: `${startTime}-${endTime}`,
          reason: 'This date is already booked for this child.',
        });
        return;
      }

      if (bookedTimeSlots && bookedTimeSlots.length > 0) {
        const conflictingSlot = bookedTimeSlots.find(slot => {
          if (slot.date !== dateStr) return false;
          
          const slotStart = this.timeToMinutes(slot.startTime);
          const slotEnd = this.timeToMinutes(slot.endTime);
          const scheduleStart = this.timeToMinutes(startTime);
          const scheduleEnd = this.timeToMinutes(endTime);

          return (
            (scheduleStart >= slotStart && scheduleStart < slotEnd) ||
            (scheduleEnd > slotStart && scheduleEnd <= slotEnd) ||
            (scheduleStart <= slotStart && scheduleEnd >= slotEnd)
          );
        });

        if (conflictingSlot) {
          conflicts.push({
            date: dateStr,
            time: `${startTime}-${endTime}`,
            reason: `Time slot overlaps with existing booking (${conflictingSlot.startTime}-${conflictingSlot.endTime}).`,
          });
        }
      }
    });

    return {
      isAvailable: conflicts.length === 0,
      conflicts,
      message: conflicts.length > 0
        ? `${conflicts.length} time slot(s) are not available.`
        : undefined,
    };
  }

  /**
   * Check mode compatibility with package
   */
  static checkModeCompatibility(
    modeKey: string | null | undefined,
    packageData: PackageDTO
  ): ModeCompatibilityCheck {
    if (!modeKey) {
      return { isCompatible: true };
    }

    if (modeKey === 'sessions') {
      return { isCompatible: true };
    }

    return {
      isCompatible: true,
      message: `"${modeKey}" mode is coming soon. For now, "sessions" mode is recommended.`,
      suggestedMode: 'sessions',
    };
  }

  /**
   * Convert time string (HH:mm) to minutes since midnight
   */
  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  }

  /**
   * Validate a single schedule
   */
  static validateSchedule(
    schedule: CreateBookingDTO['schedules'][0],
    bookedDates: string[],
    bookedTimeSlots?: Array<{ date: string; startTime: string; endTime: string }>
  ): { valid: boolean; error?: string } {
    const dateStr = schedule.date;
    const startTime = schedule.startTime;
    const endTime = schedule.endTime;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return { valid: false, error: 'Invalid date format. Expected YYYY-MM-DD.' };
    }

    if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
      return { valid: false, error: 'Invalid time format. Expected HH:mm.' };
    }

    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);
    if (endMinutes <= startMinutes) {
      return { valid: false, error: 'End time must be after start time.' };
    }

    if (bookedDates.includes(dateStr)) {
      return { valid: false, error: 'This date is already booked.' };
    }

    if (bookedTimeSlots && bookedTimeSlots.length > 0) {
      const conflictingSlot = bookedTimeSlots.find(slot => {
        if (slot.date !== dateStr) return false;
        
        const slotStart = this.timeToMinutes(slot.startTime);
        const slotEnd = this.timeToMinutes(slot.endTime);
        const scheduleStart = this.timeToMinutes(startTime);
        const scheduleEnd = this.timeToMinutes(endTime);

        return (
          (scheduleStart >= slotStart && scheduleStart < slotEnd) ||
          (scheduleEnd > slotStart && scheduleEnd <= slotEnd) ||
          (scheduleStart <= slotStart && scheduleEnd >= slotEnd)
        );
      });

      if (conflictingSlot) {
        return {
          valid: false,
          error: `Time slot overlaps with existing booking (${conflictingSlot.startTime}-${conflictingSlot.endTime}).`,
        };
      }
    }

    return { valid: true };
  }
}
