/**
 * Booking Statistics Data Transfer Object
 */
export interface BookingStatsDTO {
  totalBookings: number;
  totalRevenue: number;
  pendingRevenue: number;
  averageBookingValue: number;
  totalHoursBooked: number;
  cancellationRate: number;
  bookingsByStatus: Record<string, number>;
  bookingsByPaymentStatus: Record<string, number>;
}


