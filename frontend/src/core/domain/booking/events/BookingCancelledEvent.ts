import { Booking } from '../entities/Booking';

/**
 * Booking Cancelled Event
 * Domain event fired when a booking is cancelled
 */
export class BookingCancelledEvent {
  constructor(
    public readonly bookingId: string,
    public readonly reference: string,
    public readonly reason: string,
    public readonly cancelledAt: Date
  ) {}

  static fromBooking(booking: Booking): BookingCancelledEvent {
    if (!booking.getCancellationReason() || !booking.getCancelledAt()) {
      throw new Error('Booking must have cancellation reason and date');
    }
    return new BookingCancelledEvent(
      booking.getId(),
      booking.getReference().getValue(),
      booking.getCancellationReason()!,
      booking.getCancelledAt()!
    );
  }
}


