import { Booking } from '../entities/Booking';
import { Participant } from '../valueObjects/Participant';
import { BookingSchedule } from '../valueObjects/BookingSchedule';

/**
 * Booking Validator Service
 * Encapsulates business logic for validating booking-related operations
 */
export class BookingValidator {
  /**
   * Validate participant age against package requirements
   */
  static validateParticipantAge(
    participant: Participant,
    minAge?: number,
    maxAge?: number
  ): { valid: boolean; error?: string } {
    const age = participant.getAge();

    if (minAge !== undefined && age < minAge) {
      return {
        valid: false,
        error: `Participant must be at least ${minAge} years old`,
      };
    }

    if (maxAge !== undefined && age > maxAge) {
      return {
        valid: false,
        error: `Participant must be no more than ${maxAge} years old`,
      };
    }

    return { valid: true };
  }

  /**
   * Validate schedule conflicts
   */
  static validateScheduleConflicts(
    schedules: BookingSchedule[],
    existingSchedules: BookingSchedule[]
  ): { valid: boolean; conflicts: BookingSchedule[] } {
    const conflicts: BookingSchedule[] = [];

    for (const schedule of schedules) {
      for (const existingSchedule of existingSchedules) {
        if (schedule.conflictsWith(existingSchedule)) {
          conflicts.push(schedule);
          break;
        }
      }
    }

    return {
      valid: conflicts.length === 0,
      conflicts,
    };
  }

  /**
   * Validate booking can be confirmed
   */
  static validateBookingConfirmation(booking: Booking): { valid: boolean; error?: string } {
    if (!booking.canBeConfirmed()) {
      return {
        valid: false,
        error: 'Booking cannot be confirmed. Payment must be completed first.',
      };
    }

    if (booking.getSchedules().length === 0) {
      return {
        valid: false,
        error: 'Booking must have at least one schedule',
      };
    }

    if (booking.getParticipants().length === 0) {
      return {
        valid: false,
        error: 'Booking must have at least one participant',
      };
    }

    return { valid: true };
  }

  /**
   * Validate booking can be cancelled
   */
  static validateBookingCancellation(booking: Booking): { valid: boolean; error?: string } {
    if (!booking.canBeCancelled()) {
      return {
        valid: false,
        error: 'Booking cannot be cancelled in its current state',
      };
    }

    return { valid: true };
  }

  /**
   * Validate minimum hours requirement
   */
  static validateMinimumHours(
    totalHours: number,
    minimumHours: number
  ): { valid: boolean; error?: string } {
    if (totalHours < minimumHours) {
      return {
        valid: false,
        error: `Minimum booking hours is ${minimumHours}`,
      };
    }

    return { valid: true };
  }

  /**
   * Validate maximum hours requirement
   */
  static validateMaximumHours(
    totalHours: number,
    maximumHours: number
  ): { valid: boolean; error?: string } {
    if (totalHours > maximumHours) {
      return {
        valid: false,
        error: `Maximum booking hours is ${maximumHours}`,
      };
    }

    return { valid: true };
  }
}


