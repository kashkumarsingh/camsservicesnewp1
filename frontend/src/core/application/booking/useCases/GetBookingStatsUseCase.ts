import { IBookingRepository } from '../ports/IBookingRepository';
import { BookingStatsDTO } from '../dto/BookingStatsDTO';
import { BookingMapper } from '../mappers/BookingMapper';
import { BookingStatsCalculator } from '@/core/domain/booking';

/**
 * Get Booking Stats Use Case
 * Orchestrates retrieval of booking statistics
 */
export class GetBookingStatsUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(startDate?: Date, endDate?: Date): Promise<BookingStatsDTO> {
    // Get all bookings
    const bookingDTOs = await this.bookingRepository.findAll();

    // Convert to entities
    const bookings = bookingDTOs.map((dto) => BookingMapper.toEntity(dto));

    // Filter by date range if provided
    let filteredBookings = bookings;
    if (startDate || endDate) {
      filteredBookings = BookingStatsCalculator.getBookingsByDateRange(
        bookings,
        startDate || new Date(0),
        endDate || new Date()
      );
    }

    // Calculate statistics
    const totalBookings = filteredBookings.length;
    const totalRevenue = BookingStatsCalculator.calculateTotalRevenue(filteredBookings);
    const pendingRevenue = BookingStatsCalculator.calculatePendingRevenue(filteredBookings);
    const averageBookingValue = BookingStatsCalculator.calculateAverageBookingValue(filteredBookings);
    const totalHoursBooked = BookingStatsCalculator.calculateTotalHoursBooked(filteredBookings);
    const cancellationRate = BookingStatsCalculator.calculateCancellationRate(filteredBookings);
    const bookingsByStatus = BookingStatsCalculator.countByStatus(filteredBookings);
    const bookingsByPaymentStatus = BookingStatsCalculator.countByPaymentStatus(filteredBookings);

    return {
      totalBookings,
      totalRevenue,
      pendingRevenue,
      averageBookingValue,
      totalHoursBooked,
      cancellationRate,
      bookingsByStatus,
      bookingsByPaymentStatus,
    };
  }
}


