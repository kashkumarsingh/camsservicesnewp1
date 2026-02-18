import { IBookingRepository } from '../ports/IBookingRepository';
import { BookingDTO } from '../dto/BookingDTO';

/**
 * Get Booking Use Case
 * Orchestrates retrieval of a single booking
 */
export class GetBookingUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(id: string): Promise<BookingDTO | null> {
    return await this.bookingRepository.findById(id);
  }

  async executeByReference(reference: string): Promise<BookingDTO | null> {
    return await this.bookingRepository.findByReference(reference);
  }
}


