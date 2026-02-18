import { Booking } from '@/core/domain/booking';
import { BookingDTO } from '../dto/BookingDTO';

/**
 * Booking Repository Interface
 * Defines the contract for booking data access
 */
export interface IBookingRepository {
  /**
   * Find booking by ID
   */
  findById(id: string): Promise<BookingDTO | null>;

  /**
   * Find booking by reference
   */
  findByReference(reference: string): Promise<BookingDTO | null>;

  /**
   * Find all bookings
   */
  findAll(): Promise<BookingDTO[]>;

  /**
   * Find bookings by package ID
   */
  findByPackageId(packageId: string): Promise<BookingDTO[]>;

  /**
   * Find bookings by parent email
   */
  findByParentEmail(email: string): Promise<BookingDTO[]>;

  /**
   * Find bookings by status
   */
  findByStatus(status: string): Promise<BookingDTO[]>;

  /**
   * Create a new booking
   */
  create(booking: Booking): Promise<BookingDTO>;

  /**
   * Update an existing booking
   */
  update(booking: Booking): Promise<BookingDTO>;

  /**
   * Cancel a booking (dedicated endpoint: cancels booking and all schedules, fires event).
   */
  cancel(id: string, reason: string): Promise<BookingDTO>;

  /**
   * Delete a booking
   */
  delete(id: string): Promise<void>;

  /**
   * Check if reference exists
   */
  referenceExists(reference: string): Promise<boolean>;
}


