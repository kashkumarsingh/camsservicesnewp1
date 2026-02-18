/**
 * Booking Status Value Object
 * Represents the current state of a booking
 */
export enum BookingStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export class BookingStatusVO {
  private constructor(private readonly value: BookingStatus) {
    if (!Object.values(BookingStatus).includes(value)) {
      throw new Error(`Invalid booking status: ${value}`);
    }
  }

  static create(status: BookingStatus): BookingStatusVO {
    return new BookingStatusVO(status);
  }

  getValue(): BookingStatus {
    return this.value;
  }

  isDraft(): boolean {
    return this.value === BookingStatus.DRAFT;
  }

  isPending(): boolean {
    return this.value === BookingStatus.PENDING;
  }

  isConfirmed(): boolean {
    return this.value === BookingStatus.CONFIRMED;
  }

  isCancelled(): boolean {
    return this.value === BookingStatus.CANCELLED;
  }

  isCompleted(): boolean {
    return this.value === BookingStatus.COMPLETED;
  }

  canBeCancelled(): boolean {
    return this.value === BookingStatus.PENDING || this.value === BookingStatus.CONFIRMED;
  }

  canBeConfirmed(): boolean {
    return this.value === BookingStatus.PENDING;
  }

  equals(other: BookingStatusVO): boolean {
    return this.value === other.value;
  }
}


