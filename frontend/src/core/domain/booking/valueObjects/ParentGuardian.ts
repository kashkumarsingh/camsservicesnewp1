/**
 * Parent/Guardian Value Object
 * Represents the parent or guardian information for a booking
 */
export class ParentGuardian {
  private constructor(
    private readonly firstName: string,
    private readonly lastName: string,
    private readonly email: string,
    private readonly phone: string,
    private readonly address?: string,
    private readonly emergencyContact?: string
  ) {
    if (!firstName || firstName.trim().length === 0) {
      throw new Error('Parent/Guardian first name is required');
    }
    if (!lastName || lastName.trim().length === 0) {
      throw new Error('Parent/Guardian last name is required');
    }
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Valid email address is required');
    }
    if (!phone || phone.trim().length === 0) {
      throw new Error('Phone number is required');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static create(
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    address?: string,
    emergencyContact?: string
  ): ParentGuardian {
    return new ParentGuardian(firstName, lastName, email, phone, address, emergencyContact);
  }

  getFirstName(): string {
    return this.firstName;
  }

  getLastName(): string {
    return this.lastName;
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  getEmail(): string {
    return this.email;
  }

  getPhone(): string {
    return this.phone;
  }

  getAddress(): string | undefined {
    return this.address;
  }

  getEmergencyContact(): string | undefined {
    return this.emergencyContact;
  }
}


