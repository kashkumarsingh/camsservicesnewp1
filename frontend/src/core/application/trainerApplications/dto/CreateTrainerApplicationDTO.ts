export interface CreateTrainerApplicationDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  postcode: string;
  addressLineOne?: string;
  addressLineTwo?: string;
  city?: string;
  county?: string;
  travelRadiusKm: number;
  availabilityPreferences?: string[];
  excludedActivityIds?: string[]; // Activity IDs that trainer CANNOT facilitate
  exclusionReason?: string;       // Reason for activity limitations
  preferredAgeGroups?: string[];
  experienceYears: number;
  bio?: string;
  certifications?: string[];
  hasDbsCheck: boolean;
  dbsIssuedAt?: string;
  dbsExpiresAt?: string;
  insuranceProvider?: string;
  insuranceExpiresAt?: string;
  desiredHourlyRate?: number;
  attachments?: string[];
}


