import { BookingSchedule } from '../valueObjects/BookingSchedule';

/**
 * Availability Policy
 * Encapsulates business rules for booking availability
 */
export class AvailabilityPolicy {
  /**
   * Maximum number of participants per session
   */
  static getMaxParticipantsPerSession(): number {
    return 10; // Business rule
  }

  /**
   * Minimum hours notice required for booking
   */
  static getMinimumNoticeHours(): number {
    return 24; // Business rule: 24 hours notice
  }

  /**
   * Maximum days in advance for booking
   */
  static getMaximumAdvanceDays(): number {
    return 90; // Business rule: 90 days in advance
  }

  /**
   * Check if schedule is within booking window
   */
  static isWithinBookingWindow(schedule: BookingSchedule): boolean {
    const now = new Date();
    const scheduleDate = schedule.getDate();
    const hoursUntilSchedule =
      (scheduleDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    return (
      hoursUntilSchedule >= this.getMinimumNoticeHours() &&
      hoursUntilSchedule <= this.getMaximumAdvanceDays() * 24
    );
  }

  /**
   * Check if date is available for booking
   */
  static isDateAvailable(date: Date, existingSchedules: BookingSchedule[]): boolean {
    const dateStr = date.toDateString();
    const schedulesOnDate = existingSchedules.filter(
      (schedule) => schedule.getDate().toDateString() === dateStr
    );
    return schedulesOnDate.length < this.getMaxParticipantsPerSession();
  }

  /**
   * Get available time slots for a date
   */
  static getAvailableTimeSlots(
    date: Date,
    existingSchedules: BookingSchedule[],
    allTimeSlots: string[]
  ): string[] {
    const dateStr = date.toDateString();
    const bookedSlots = existingSchedules
      .filter((schedule) => schedule.getDate().toDateString() === dateStr)
      .map((schedule) => schedule.getStartTime());

    return allTimeSlots.filter((slot) => !bookedSlots.includes(slot));
  }
}


