import { BaseEntity } from '@/core/domain/shared/BaseEntity';

export interface TrainerApplicationProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  postcode: string;
  addressLineOne?: string | null;
  addressLineTwo?: string | null;
  city?: string | null;
  county?: string | null;
  travelRadiusKm: number;
  availabilityPreferences?: string[] | null;
  excludedActivityIds?: string[] | null; // Activity IDs that trainer CANNOT facilitate
  exclusionReason?: string | null;       // Reason for activity limitations
  preferredAgeGroups?: string[] | null;
  experienceYears: number;
  bio?: string | null;
  certifications?: string[] | null;
  hasDbsCheck: boolean;
  dbsIssuedAt?: string | null;
  dbsExpiresAt?: string | null;
  insuranceProvider?: string | null;
  insuranceExpiresAt?: string | null;
  desiredHourlyRate?: number | null;
  attachments?: string[] | null;
}

export class TrainerApplication extends BaseEntity {
  private readonly props: TrainerApplicationProps;

  private constructor(id: string, props: TrainerApplicationProps) {
    super(id);
    this.props = props;
  }

  static create(id: string, props: TrainerApplicationProps): TrainerApplication {
    return new TrainerApplication(id, props);
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get email(): string {
    return this.props.email;
  }

  get phone(): string {
    return this.props.phone;
  }

  get postcode(): string {
    return this.props.postcode;
  }

  get addressLineOne(): string | undefined | null {
    return this.props.addressLineOne;
  }

  get addressLineTwo(): string | undefined | null {
    return this.props.addressLineTwo;
  }

  get city(): string | undefined | null {
    return this.props.city;
  }

  get county(): string | undefined | null {
    return this.props.county;
  }

  get travelRadiusKm(): number {
    return this.props.travelRadiusKm;
  }

  get availabilityPreferences(): string[] | undefined | null {
    return this.props.availabilityPreferences;
  }

  get excludedActivityIds(): string[] | undefined | null {
    return this.props.excludedActivityIds;
  }

  get exclusionReason(): string | undefined | null {
    return this.props.exclusionReason;
  }

  get preferredAgeGroups(): string[] | undefined | null {
    return this.props.preferredAgeGroups;
  }

  get experienceYears(): number {
    return this.props.experienceYears;
  }

  get bio(): string | undefined | null {
    return this.props.bio;
  }

  get certifications(): string[] | undefined | null {
    return this.props.certifications;
  }

  get hasDbsCheck(): boolean {
    return this.props.hasDbsCheck;
  }

  get dbsIssuedAt(): string | undefined | null {
    return this.props.dbsIssuedAt;
  }

  get dbsExpiresAt(): string | undefined | null {
    return this.props.dbsExpiresAt;
  }

  get insuranceProvider(): string | undefined | null {
    return this.props.insuranceProvider;
  }

  get insuranceExpiresAt(): string | undefined | null {
    return this.props.insuranceExpiresAt;
  }

  get desiredHourlyRate(): number | undefined | null {
    return this.props.desiredHourlyRate;
  }

  get attachments(): string[] | undefined | null {
    return this.props.attachments;
  }

  toJSON(): TrainerApplicationProps {
    return { ...this.props };
  }
}


