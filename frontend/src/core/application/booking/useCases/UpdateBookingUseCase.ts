import { Booking, BookingPolicy, BookingCalculator, PricingPolicy, Participant, BookingSchedule } from '@/core/domain/booking';
import { IBookingRepository } from '../ports/IBookingRepository';
import { UpdateBookingDTO } from '../dto/UpdateBookingDTO';
import { BookingDTO } from '../dto/BookingDTO';
import { BookingMapper } from '../mappers/BookingMapper';

/**
 * Update Booking Use Case
 * Orchestrates updating an existing booking
 */
export class UpdateBookingUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(id: string, dto: UpdateBookingDTO, packageBasePrice?: number, hourlyRate?: number): Promise<BookingDTO> {
    // Get existing booking
    const existingDTO = await this.bookingRepository.findById(id);
    if (!existingDTO) {
      throw new Error(`Booking with ID ${id} not found`);
    }

    const existingBooking = BookingMapper.toEntity(existingDTO);

    // Check if booking can be edited
    if (!BookingPolicy.allowsModifications(existingBooking)) {
      throw new Error('Booking cannot be modified in its current state');
    }

    // Update participants if provided
    let participants = existingBooking.getParticipants();
    if (dto.participants) {
      participants = dto.participants.map((p) =>
        Participant.create(
          p.firstName,
          p.lastName,
          new Date(p.dateOfBirth),
          p.medicalInfo,
          p.specialNeeds
        )
      );
    }

    // Update schedules if provided
    let schedules = existingBooking.getSchedules();
    if (dto.schedules) {
      schedules = dto.schedules.map((s) =>
        BookingSchedule.create(
          new Date(s.date),
          s.startTime,
          s.endTime,
          s.trainerId,
          s.activityId
        )
      );
    }

    // Recalculate totals if schedules or participants changed
    let totalHours = existingBooking.getTotalHours();
    let totalPrice = existingBooking.getTotalPrice();

    if (dto.schedules || dto.participants) {
      totalHours = BookingCalculator.calculateTotalHours(schedules);
      if (packageBasePrice !== undefined) {
        const basePrice = hourlyRate
          ? BookingCalculator.calculateTotalPrice(packageBasePrice, totalHours, hourlyRate)
          : packageBasePrice;

        const discount = PricingPolicy.calculateTotalDiscount(
          basePrice,
          totalHours,
          participants.length,
          dto.startDate ? new Date(dto.startDate) : undefined,
          new Date()
        );

        totalPrice = basePrice - discount;
      }
    }

    // Create updated booking
    const updatedBooking = Booking.reconstitute(
      existingBooking.getId(),
      existingBooking.getReference(),
      existingBooking.getPackageId(),
      existingBooking.getPackageSlug(),
      existingBooking.getStatus(),
      existingBooking.getPaymentStatus(),
      existingBooking.getParentGuardian(),
      participants,
      schedules,
      totalHours,
      totalPrice,
      existingBooking.getPaidAmount(),
      existingBooking.getCreatedAt(),
      new Date(), // Updated at
      dto.startDate ? new Date(dto.startDate) : existingBooking.getStartDate(),
      dto.notes ?? existingBooking.getNotes(),
      existingBooking.getCancellationReason(),
      existingBooking.getCancelledAt()
    );

    // Save updated booking
    return await this.bookingRepository.update(updatedBooking);
  }
}

