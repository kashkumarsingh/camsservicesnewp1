/**
 * Booking Reference Value Object
 * Represents a unique booking reference number
 */
export class BookingReference {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Booking reference cannot be empty');
    }
    if (value.length < 6) {
      throw new Error('Booking reference must be at least 6 characters');
    }
  }

  static create(reference: string): BookingReference {
    return new BookingReference(reference);
  }

  static generate(): BookingReference {
    const prefix = 'BR';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return new BookingReference(`${prefix}-${timestamp}-${random}`);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: BookingReference): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}


