import { Booking } from '@/core/domain/booking';
import { CreateBookingDTO } from '../dto/CreateBookingDTO';
import {
  ParentGuardian,
  Participant,
  BookingSchedule,
  BookingCalculator,
  PricingPolicy,
} from '@/core/domain/booking';
// Generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Booking Factory
 * Handles complex creation logic for Booking entities
 */
export class BookingFactory {
  /**
   * Create Booking from DTO
   */
  static createFromDTO(
    dto: CreateBookingDTO,
    packageBasePrice: number,
    hourlyRate?: number,
    minAge?: number,
    maxAge?: number
  ): Booking {
    // Create value objects
    // Handle optional parentGuardian - CreateBookingDTO always has parentGuardian
    if (!dto.parentGuardian) {
      throw new Error('parentGuardian is required in CreateBookingDTO');
    }
    
    const parentGuardian = ParentGuardian.create(
      dto.parentGuardian.firstName,
      dto.parentGuardian.lastName,
      dto.parentGuardian.email,
      dto.parentGuardian.phone,
      dto.parentGuardian.address,
      dto.parentGuardian.emergencyContact
    );

    const participants = dto.participants.map((p) =>
      Participant.create(
        p.firstName,
        p.lastName,
        new Date(p.dateOfBirth),
        p.medicalInfo,
        p.specialNeeds
      )
    );

    const schedules = dto.schedules.map((s) =>
      BookingSchedule.create(
        new Date(s.date),
        s.startTime,
        s.endTime,
        s.trainerId,
        s.activityId
      )
    );

    // Calculate totals
    // Pay First → Book Later flow: If no schedules, use minimum value
    // The backend will set correct totalHours when booking is created via createAfterPayment
    let totalHours = BookingCalculator.calculateTotalHours(schedules);
    if (totalHours <= 0 && schedules.length === 0) {
      // Pay First flow: Use minimum value to pass validation
      // Backend will set correct hours from package when booking is confirmed
      totalHours = 0.01;
      if (process.env.NODE_ENV === 'development') {
        console.log('[BookingFactory] Pay First flow: Using minimum totalHours for draft booking', { totalHours });
      }
    }
    const basePrice = hourlyRate
      ? BookingCalculator.calculateTotalPrice(packageBasePrice, totalHours, hourlyRate)
      : packageBasePrice;

    // Apply discounts
    const discount = PricingPolicy.calculateTotalDiscount(
      basePrice,
      totalHours,
      participants.length,
      dto.startDate ? new Date(dto.startDate) : undefined,
      new Date()
    );

    const totalPrice = basePrice - discount;

    // Create booking
    const booking = Booking.create(
      generateUUID(),
      dto.packageId,
      dto.packageSlug,
      parentGuardian,
      participants,
      schedules,
      totalHours,
      totalPrice,
      dto.startDate ? new Date(dto.startDate) : undefined,
      dto.notes
    );

    return booking;
  }
}

