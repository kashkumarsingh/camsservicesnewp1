import { Booking } from '@/core/domain/booking/entities/Booking';
import { IBookingRepository } from '@/core/application/booking/ports/IBookingRepository';
import { BookingDTO } from '@/core/application/booking/dto/BookingDTO';
import { BookingMapper } from '@/core/application/booking/mappers/BookingMapper';

/**
 * Static Booking Repository
 * Implements IBookingRepository using in-memory storage
 */
export class StaticBookingRepository implements IBookingRepository {
  private bookings: Map<string, BookingDTO> = new Map();

  async findById(id: string): Promise<BookingDTO | null> {
    const booking = this.bookings.get(id);
    return booking ? { ...booking } : null;
  }

  async findByReference(reference: string): Promise<BookingDTO | null> {
    for (const booking of this.bookings.values()) {
      if (booking.reference === reference) {
        return { ...booking };
      }
    }
    return null;
  }

  async findAll(): Promise<BookingDTO[]> {
    return Array.from(this.bookings.values()).map((booking) => ({ ...booking }));
  }

  async findByPackageId(packageId: string): Promise<BookingDTO[]> {
    return Array.from(this.bookings.values())
      .filter((booking) => booking.packageId === packageId)
      .map((booking) => ({ ...booking }));
  }

  async findByParentEmail(email: string): Promise<BookingDTO[]> {
    return Array.from(this.bookings.values())
      .filter((booking) => {
        // Handle optional parentGuardian - use fallback fields if not present
        const parentEmail = booking.parentGuardian?.email || booking.parentEmail || '';
        return parentEmail.toLowerCase() === email.toLowerCase();
      })
      .map((booking) => ({ ...booking }));
  }

  async findByStatus(status: string): Promise<BookingDTO[]> {
    return Array.from(this.bookings.values())
      .filter((booking) => booking.status === status)
      .map((booking) => ({ ...booking }));
  }

  async create(booking: Booking): Promise<BookingDTO> {
    const dto = BookingMapper.toDTO(booking);
    this.bookings.set(booking.getId(), dto);
    return { ...dto };
  }

  async update(booking: Booking): Promise<BookingDTO> {
    const existing = this.bookings.get(booking.getId());
    if (!existing) {
      throw new Error(`Booking with ID ${booking.getId()} not found`);
    }
    const dto = BookingMapper.toDTO(booking);
    this.bookings.set(booking.getId(), dto);
    return { ...dto };
  }

  async cancel(id: string, reason: string): Promise<BookingDTO> {
    const existing = this.bookings.get(id);
    if (!existing) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    const cancelled: BookingDTO = {
      ...existing,
      status: 'cancelled',
      cancellationReason: reason,
      cancelledAt: new Date().toISOString(),
    };
    this.bookings.set(id, cancelled);
    return { ...cancelled };
  }

  async delete(id: string): Promise<void> {
    const exists = this.bookings.has(id);
    if (!exists) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    this.bookings.delete(id);
  }

  async referenceExists(reference: string): Promise<boolean> {
    for (const booking of this.bookings.values()) {
      if (booking.reference === reference) {
        return true;
      }
    }
    return false;
  }
}


