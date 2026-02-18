import { Booking, BookingValidator } from '@/core/domain/booking';
import { IBookingRepository } from '../ports/IBookingRepository';
import { INotificationService } from '../ports/INotificationService';
import { BookingDTO } from '../dto/BookingDTO';
import { BookingMapper } from '../mappers/BookingMapper';

/**
 * Cancel Booking Use Case
 * Orchestrates cancelling a booking via the dedicated cancel API (cancels booking, all schedules, fires event).
 */
export class CancelBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly notificationService: INotificationService
  ) {}

  async execute(id: string, reason: string): Promise<BookingDTO> {
    const existingDTO = await this.bookingRepository.findById(id);
    if (!existingDTO) {
      throw new Error(`Booking with ID ${id} not found`);
    }

    const booking = BookingMapper.toEntity(existingDTO);
    const validation = BookingValidator.validateBookingCancellation(booking);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error('Cancellation reason is required');
    }

    const cancelledDTO = await this.bookingRepository.cancel(id, reason);

    this.notificationService
      .sendBookingCancellation(
        existingDTO.reference ?? booking.getReference().getValue(),
        existingDTO.parentGuardian?.email ?? booking.getParentGuardian().getEmail(),
        reason
      )
      .catch((error) => {
        console.error('Failed to send booking cancellation notification:', error);
      });

    return cancelledDTO;
  }
}

