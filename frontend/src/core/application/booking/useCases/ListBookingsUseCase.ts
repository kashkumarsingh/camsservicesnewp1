import { IBookingRepository } from '../ports/IBookingRepository';
import { BookingDTO } from '../dto/BookingDTO';
import { BookingFilterOptions } from '../dto/BookingFilterOptions';

/**
 * List Bookings Use Case
 * Orchestrates listing and filtering of bookings
 */
export class ListBookingsUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(filterOptions?: BookingFilterOptions): Promise<BookingDTO[]> {
    let bookings: BookingDTO[];

    if (filterOptions?.packageId) {
      bookings = await this.bookingRepository.findByPackageId(filterOptions.packageId);
    } else if (filterOptions?.parentEmail) {
      bookings = await this.bookingRepository.findByParentEmail(filterOptions.parentEmail);
    } else if (filterOptions?.status) {
      bookings = await this.bookingRepository.findByStatus(filterOptions.status);
    } else {
      bookings = await this.bookingRepository.findAll();
    }

    // Apply additional filters
    if (filterOptions) {
      if (filterOptions.startDate) {
        bookings = bookings.filter(
          (b) => b.startDate && new Date(b.startDate) >= filterOptions.startDate!
        );
      }
      if (filterOptions.endDate) {
        bookings = bookings.filter(
          (b) => b.startDate && new Date(b.startDate) <= filterOptions.endDate!
        );
      }
      if (filterOptions.minPrice !== undefined) {
        bookings = bookings.filter((b) => b.totalPrice >= filterOptions.minPrice!);
      }
      if (filterOptions.maxPrice !== undefined) {
        bookings = bookings.filter((b) => b.totalPrice <= filterOptions.maxPrice!);
      }
      if (filterOptions.paymentStatus) {
        bookings = bookings.filter((b) => b.paymentStatus === filterOptions.paymentStatus);
      }
    }

    return bookings;
  }
}


