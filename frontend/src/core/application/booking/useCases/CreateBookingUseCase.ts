import { Booking } from '@/core/domain/booking';
import { IBookingRepository } from '../ports/IBookingRepository';
import { INotificationService } from '../ports/INotificationService';
import { CreateBookingDTO } from '../dto/CreateBookingDTO';
import { BookingDTO } from '../dto/BookingDTO';
import { BookingFactory } from '../factories/BookingFactory';
import { BookingMapper } from '../mappers/BookingMapper';
import { BookingCreatedEvent } from '@/core/domain/booking';

/**
 * Create Booking Use Case
 * Orchestrates the creation of a new booking
 */
export class CreateBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly notificationService: INotificationService
  ) {}

  async execute(
    dto: CreateBookingDTO,
    packageBasePrice: number,
    hourlyRate?: number,
    minAge?: number,
    maxAge?: number
  ): Promise<BookingDTO> {
    // Create booking entity
    const booking = BookingFactory.createFromDTO(
      dto,
      packageBasePrice,
      hourlyRate,
      minAge,
      maxAge
    );

    // Store original DTO in repository to preserve postcode/county (not in domain entity)
    // This is a workaround - ideally domain entity would store these optional fields
    // Use type assertion to avoid importing infrastructure in use case (Clean Architecture)
    if ('setOriginalCreateDTO' in this.bookingRepository) {
      (this.bookingRepository as any).setOriginalCreateDTO(dto);
    }

    // Save booking
    const bookingDTO = await this.bookingRepository.create(booking);

    // Fire domain event
    const event = BookingCreatedEvent.fromBooking(booking);

    // Send notification (async, don't await)
    this.notificationService
      .sendEmail(
        booking.getParentGuardian().getEmail(),
        'Booking Created',
        `Your booking ${booking.getReference().getValue()} has been created.`,
        'booking-created',
        { booking: BookingMapper.toDTO(booking) }
      )
      .catch((error) => {
        console.error('Failed to send booking creation notification:', error);
      });

    return bookingDTO;
  }
}


