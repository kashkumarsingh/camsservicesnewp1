/**
 * Participant Value Object
 * Represents a child participant in a booking
 */
export class Participant {
  private constructor(
    private readonly firstName: string,
    private readonly lastName: string,
    private readonly dateOfBirth: Date,
    private readonly medicalInfo?: string,
    private readonly specialNeeds?: string
  ) {
    if (!firstName || firstName.trim().length === 0) {
      throw new Error('Participant first name is required');
    }
    if (!lastName || lastName.trim().length === 0) {
      throw new Error('Participant last name is required');
    }
    if (!dateOfBirth || dateOfBirth > new Date()) {
      throw new Error('Participant date of birth must be in the past');
    }
  }

  static create(
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
    medicalInfo?: string,
    specialNeeds?: string
  ): Participant {
    return new Participant(firstName, lastName, dateOfBirth, medicalInfo, specialNeeds);
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

  getDateOfBirth(): Date {
    return this.dateOfBirth;
  }

  getAge(): number {
    const today = new Date();
    let age = today.getFullYear() - this.dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - this.dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.dateOfBirth.getDate())) {
      age--;
    }
    return age;
  }

  getMedicalInfo(): string | undefined {
    return this.medicalInfo;
  }

  getSpecialNeeds(): string | undefined {
    return this.specialNeeds;
  }

  hasMedicalInfo(): boolean {
    return !!this.medicalInfo;
  }

  hasSpecialNeeds(): boolean {
    return !!this.specialNeeds;
  }
}


