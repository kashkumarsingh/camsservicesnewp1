import { Booking, BookingValidator, BookingStatus, BookingStatusVO, BookingConfirmedEvent } from '@/core/domain/booking';
import { IBookingRepository } from '../ports/IBookingRepository';
import { INotificationService } from '../ports/INotificationService';
import { BookingDTO } from '../dto/BookingDTO';
import { BookingMapper } from '../mappers/BookingMapper';

/**
 * Confirm Booking Use Case
 * Orchestrates confirming a booking
 */
export class ConfirmBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly notificationService: INotificationService
  ) {}

  async execute(id: string): Promise<BookingDTO> {
    // Get existing booking
    const existingDTO = await this.bookingRepository.findById(id);
    if (!existingDTO) {
      throw new Error(`Booking with ID ${id} not found`);
    }

    const booking = BookingMapper.toEntity(existingDTO);

    // Validate booking can be confirmed
    const validation = BookingValidator.validateBookingConfirmation(booking);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Update status to confirmed
    const confirmedBooking = Booking.reconstitute(
      booking.getId(),
      booking.getReference(),
      booking.getPackageId(),
      booking.getPackageSlug(),
      BookingStatusVO.create(BookingStatus.CONFIRMED),
      booking.getPaymentStatus(),
      booking.getParentGuardian(),
      booking.getParticipants(),
      booking.getSchedules(),
      booking.getTotalHours(),
      booking.getTotalPrice(),
      booking.getPaidAmount(),
      booking.getCreatedAt(),
      new Date(),
      booking.getStartDate(),
      booking.getNotes(),
      booking.getCancellationReason(),
      booking.getCancelledAt()
    );

    // Save confirmed booking
    const confirmedDTO = await this.bookingRepository.update(confirmedBooking);

    // Fire domain event
    const event = BookingConfirmedEvent.fromBooking(confirmedBooking);

    // Send confirmation notification (async)
    this.notificationService
      .sendBookingConfirmation(
        booking.getReference().getValue(),
        booking.getParentGuardian().getEmail(),
        BookingMapper.toDTO(confirmedBooking)
      )
      .catch((error) => {
        console.error('Failed to send booking confirmation notification:', error);
      });

    return confirmedDTO;
  }
}

