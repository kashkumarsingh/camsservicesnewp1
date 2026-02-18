export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Qualification {
  id: string;
  name: string;
  issuer: string;
  dateObtained: string;
  expiryDate?: string;
}

export class TrainerProfile {
  constructor(
    public readonly id: string,
    public readonly avatar: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly dateOfBirth: string,
    public readonly gender: string,
    public readonly mobile: string,
    public readonly drivingLicence: boolean,
    public readonly accessToCar: boolean,
    public readonly qualifications: Qualification[],
    public readonly emergencyContacts: EmergencyContact[],
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get initials(): string {
    const firstInitial = this.firstName?.[0] ?? '';
    const lastInitial = this.lastName?.[0] ?? '';
    const combined = `${firstInitial}${lastInitial}`.trim();
    return combined ? combined.toUpperCase() : 'TR';
  }
}

