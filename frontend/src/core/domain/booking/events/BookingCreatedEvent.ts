import { Booking } from '../entities/Booking';

/**
 * Booking Created Event
 * Domain event fired when a booking is created
 */
export class BookingCreatedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly reference: string,
    public readonly packageId: string,
    public readonly totalPrice: number,
    public readonly createdAt: Date
  ) {}

  static fromBooking(booking: Booking): BookingCreatedEvent {
    return new BookingCreatedEvent(
      booking.getId(),
      booking.getReference().getValue(),
      booking.getPackageId(),
      booking.getTotalPrice(),
      booking.getCreatedAt()
    );
  }
}


