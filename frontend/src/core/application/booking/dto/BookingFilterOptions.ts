/**
 * Booking Filter Options
 */
export interface BookingFilterOptions {
  status?: string;
  paymentStatus?: string;
  packageId?: string;
  parentEmail?: string;
  startDate?: Date;
  endDate?: Date;
  minPrice?: number;
  maxPrice?: number;
}


