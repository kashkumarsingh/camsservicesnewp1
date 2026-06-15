/**
 * Admin Staff DTOs — internal staff onboarding records (distinct from trainers).
 */

export type StaffVisaStatus =
  | 'british_citizen'
  | 'irish_citizen'
  | 'settled_status'
  | 'pre_settled_status'
  | 'skilled_worker'
  | 'health_care'
  | 'student'
  | 'dependent'
  | 'other';

export type StaffEmploymentStatus = 'active' | 'on_leave' | 'offboarded';

export interface AdminStaffDTO {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  addressLineOne?: string | null;
  addressLineTwo?: string | null;
  city?: string | null;
  county?: string | null;
  postcode?: string | null;
  jobTitle: string;
  department?: string | null;
  citizenship?: string | null;
  visaStatus: StaffVisaStatus;
  rightToWorkVerified: boolean;
  rightToWorkVerifiedAt?: string | null;
  rightToWorkExpiresAt?: string | null;
  startDate?: string | null;
  employmentStatus: StaffEmploymentStatus;
  hasDbsCheck: boolean;
  dbsCertificateNumber?: string | null;
  dbsIssuedAt?: string | null;
  dbsExpiresAt?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  notes?: string | null;
  onboardedById?: string | null;
  onboardedByName?: string | null;
  onboardedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateStaffDTO {
  name: string;
  email?: string;
  phone?: string;
  addressLineOne?: string;
  addressLineTwo?: string;
  city?: string;
  county?: string;
  postcode?: string;
  jobTitle: string;
  department?: string;
  citizenship?: string;
  visaStatus: StaffVisaStatus;
  rightToWorkVerified?: boolean;
  rightToWorkVerifiedAt?: string;
  rightToWorkExpiresAt?: string;
  startDate?: string;
  employmentStatus?: StaffEmploymentStatus;
  hasDbsCheck?: boolean;
  dbsCertificateNumber?: string;
  dbsIssuedAt?: string;
  dbsExpiresAt?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  onboardedAt?: string;
}

export type UpdateStaffDTO = Partial<CreateStaffDTO>;

export interface RemoteAdminStaffResponse {
  id: string | number;
  name: string;
  email?: string | null;
  phone?: string | null;
  addressLineOne?: string | null;
  address_line_one?: string | null;
  addressLineTwo?: string | null;
  address_line_two?: string | null;
  city?: string | null;
  county?: string | null;
  postcode?: string | null;
  jobTitle?: string | null;
  job_title?: string | null;
  department?: string | null;
  citizenship?: string | null;
  visaStatus?: string | null;
  visa_status?: string | null;
  rightToWorkVerified?: boolean | null;
  right_to_work_verified?: boolean | null;
  rightToWorkVerifiedAt?: string | null;
  right_to_work_verified_at?: string | null;
  rightToWorkExpiresAt?: string | null;
  right_to_work_expires_at?: string | null;
  startDate?: string | null;
  start_date?: string | null;
  employmentStatus?: string | null;
  employment_status?: string | null;
  hasDbsCheck?: boolean | null;
  has_dbs_check?: boolean | null;
  dbsCertificateNumber?: string | null;
  dbs_certificate_number?: string | null;
  dbsIssuedAt?: string | null;
  dbs_issued_at?: string | null;
  dbsExpiresAt?: string | null;
  dbs_expires_at?: string | null;
  emergencyContactName?: string | null;
  emergency_contact_name?: string | null;
  emergencyContactPhone?: string | null;
  emergency_contact_phone?: string | null;
  notes?: string | null;
  onboardedById?: string | null;
  onboarded_by_id?: string | null;
  onboardedByName?: string | null;
  onboarded_by_name?: string | null;
  onboardedAt?: string | null;
  onboarded_at?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
  updatedAt?: string | null;
  updated_at?: string | null;
}

export const STAFF_VISA_STATUS_OPTIONS: Array<{ label: string; value: StaffVisaStatus }> = [
  { label: 'British citizen', value: 'british_citizen' },
  { label: 'Irish citizen', value: 'irish_citizen' },
  { label: 'Settled status (EU Settlement Scheme)', value: 'settled_status' },
  { label: 'Pre-settled status', value: 'pre_settled_status' },
  { label: 'Skilled Worker visa', value: 'skilled_worker' },
  { label: 'Health & Care Worker visa', value: 'health_care' },
  { label: 'Student visa', value: 'student' },
  { label: 'Dependent visa', value: 'dependent' },
  { label: 'Other', value: 'other' },
];

export const STAFF_EMPLOYMENT_STATUS_OPTIONS: Array<{ label: string; value: StaffEmploymentStatus }> = [
  { label: 'Active', value: 'active' },
  { label: 'On leave', value: 'on_leave' },
  { label: 'Offboarded', value: 'offboarded' },
];

export function getStaffVisaStatusLabel(status: StaffVisaStatus | string): string {
  return STAFF_VISA_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

export function getStaffEmploymentStatusLabel(status: StaffEmploymentStatus | string): string {
  return STAFF_EMPLOYMENT_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

export function mapRemoteStaffToDTO(remote: RemoteAdminStaffResponse): AdminStaffDTO {
  return {
    id: String(remote.id),
    name: remote.name,
    email: remote.email ?? null,
    phone: remote.phone ?? null,
    addressLineOne: remote.addressLineOne ?? remote.address_line_one ?? null,
    addressLineTwo: remote.addressLineTwo ?? remote.address_line_two ?? null,
    city: remote.city ?? null,
    county: remote.county ?? null,
    postcode: remote.postcode ?? null,
    jobTitle: remote.jobTitle ?? remote.job_title ?? '',
    department: remote.department ?? null,
    citizenship: remote.citizenship ?? null,
    visaStatus: (remote.visaStatus ?? remote.visa_status ?? 'british_citizen') as StaffVisaStatus,
    rightToWorkVerified: Boolean(remote.rightToWorkVerified ?? remote.right_to_work_verified),
    rightToWorkVerifiedAt: remote.rightToWorkVerifiedAt ?? remote.right_to_work_verified_at ?? null,
    rightToWorkExpiresAt: remote.rightToWorkExpiresAt ?? remote.right_to_work_expires_at ?? null,
    startDate: remote.startDate ?? remote.start_date ?? null,
    employmentStatus: (remote.employmentStatus ?? remote.employment_status ?? 'active') as StaffEmploymentStatus,
    hasDbsCheck: Boolean(remote.hasDbsCheck ?? remote.has_dbs_check),
    dbsCertificateNumber: remote.dbsCertificateNumber ?? remote.dbs_certificate_number ?? null,
    dbsIssuedAt: remote.dbsIssuedAt ?? remote.dbs_issued_at ?? null,
    dbsExpiresAt: remote.dbsExpiresAt ?? remote.dbs_expires_at ?? null,
    emergencyContactName: remote.emergencyContactName ?? remote.emergency_contact_name ?? null,
    emergencyContactPhone: remote.emergencyContactPhone ?? remote.emergency_contact_phone ?? null,
    notes: remote.notes ?? null,
    onboardedById: remote.onboardedById ?? remote.onboarded_by_id ?? null,
    onboardedByName: remote.onboardedByName ?? remote.onboarded_by_name ?? null,
    onboardedAt: remote.onboardedAt ?? remote.onboarded_at ?? null,
    createdAt: remote.createdAt ?? remote.created_at ?? null,
    updatedAt: remote.updatedAt ?? remote.updated_at ?? null,
  };
}

export function createEmptyStaffForm(): CreateStaffDTO {
  return {
    name: '',
    email: '',
    phone: '',
    addressLineOne: '',
    addressLineTwo: '',
    city: '',
    county: '',
    postcode: '',
    jobTitle: '',
    department: '',
    citizenship: '',
    visaStatus: 'british_citizen',
    rightToWorkVerified: false,
    rightToWorkVerifiedAt: '',
    rightToWorkExpiresAt: '',
    startDate: new Date().toISOString().split('T')[0],
    employmentStatus: 'active',
    hasDbsCheck: false,
    dbsCertificateNumber: '',
    dbsIssuedAt: '',
    dbsExpiresAt: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    notes: '',
  };
}
