import { Booking } from '../entities/Booking';

/**
 * Booking Confirmed Event
 * Domain event fired when a booking is confirmed
 */
export class BookingConfirmedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly reference: string,
    public readonly confirmedAt: Date
  ) {}

  static fromBooking(booking: Booking): BookingConfirmedEvent {
    return new BookingConfirmedEvent(
      booking.getId(),
      booking.getReference().getValue(),
      new Date()
    );
  }
}


