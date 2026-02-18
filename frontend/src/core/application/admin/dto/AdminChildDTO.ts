/**
 * Admin Child DTOs (Application Layer)
 * 
 * Clean Architecture: Application Layer - Data Transfer Objects
 * Purpose: Type-safe data structures for admin children management
 */

export interface AdminChildChecklistDTO {
  id: string;
  childId: string;
  medicalConditions?: string | null;
  allergies?: string | null;
  medications?: string | null;
  dietaryRequirements?: string | null;
  emergencyContactName?: string | null;
  emergencyContactRelationship?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactPhoneAlt?: string | null;
  emergencyContactAddress?: string | null;
  specialNeeds?: string | null;
  behavioralNotes?: string | null;
  activityRestrictions?: string | null;
  consentPhotography?: boolean | null;
  consentMedicalTreatment?: boolean | null;
  checklistCompleted?: boolean;
  checklistCompletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AdminChildDTO {
  id: string;
  name: string;
  age: number;
  dateOfBirth?: string | null;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  address?: string | null;
  postcode?: string | null;
  city?: string | null;
  region?: string | null;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedAt?: string | null;
  approvedByName?: string | null;
  rejectionReason?: string | null;
  rejectedAt?: string | null;
  hasChecklist?: boolean;
  checklistCompleted?: boolean;
  checklistCompletedAt?: string | null;
  checklist?: AdminChildChecklistDTO | null;
  parentId: string | null;
  parentName: string | null;
  parentEmail: string | null;
  parentPhone?: string | null;
  /** Remaining hours from the child's latest confirmed booking; null if no confirmed booking. */
  remainingHours?: number | null;
  bookings?: ChildBookingDTO[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ChildBookingDTO {
  id: string;
  reference: string;
  packageName: string | null;
  status: string;
  paymentStatus: string;
  createdAt: string | null;
}

export interface CreateChildDTO {
  user_id: string;
  name: string;
  age: number;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: string;
  postcode?: string;
  city?: string;
  region?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
}

export interface UpdateChildDTO {
  user_id?: string;
  name?: string;
  age?: number;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: string;
  postcode?: string;
  city?: string;
  region?: string;
}

export interface LinkParentDTO {
  parent_id: string;
}

export interface RejectChildDTO {
  rejection_reason?: string;
}

/**
 * Remote backend response type (snake_case/camelCase from Laravel)
 */
export interface RemoteAdminChildResponse {
  id: string | number;
  name: string;
  age: number;
  dateOfBirth?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  postcode?: string | null;
  city?: string | null;
  region?: string | null;
  approvalStatus?: string | null;
  approval_status?: string | null;
  approvedAt?: string | null;
  approved_at?: string | null;
  approvedByName?: string | null;
  approved_by_name?: string | null;
  rejectionReason?: string | null;
  rejection_reason?: string | null;
  rejectedAt?: string | null;
  rejected_at?: string | null;
  parentId?: string | number | null;
  parent_id?: string | number | null;
  parentName?: string | null;
  parent_name?: string | null;
  parentEmail?: string | null;
  parent_email?: string | null;
  parentPhone?: string | null;
  parent_phone?: string | null;
  remainingHours?: number | null;
  remaining_hours?: number | null;
  hasChecklist?: boolean;
  has_checklist?: boolean;
  checklistCompleted?: boolean;
  checklist_completed?: boolean;
  checklistCompletedAt?: string | null;
  checklist_completed_at?: string | null;
  checklist?: RemoteAdminChildChecklistResponse | null;
  bookings?: RemoteChildBookingResponse[];
  createdAt?: string | null;
  created_at?: string | null;
  updatedAt?: string | null;
  updated_at?: string | null;
}

export interface RemoteChildBookingResponse {
  id: string | number;
  reference: string;
  packageName?: string | null;
  package_name?: string | null;
  status: string;
  paymentStatus?: string;
  payment_status?: string;
  createdAt?: string | null;
  created_at?: string | null;
}

export interface RemoteAdminChildChecklistResponse {
  id: string | number;
  child_id: string | number;
  medical_conditions?: string | null;
  allergies?: string | null;
  medications?: string | null;
  dietary_requirements?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_relationship?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_phone_alt?: string | null;
  emergency_contact_address?: string | null;
  special_needs?: string | null;
  behavioral_notes?: string | null;
  activity_restrictions?: string | null;
  consent_photography?: boolean | null;
  consent_medical_treatment?: boolean | null;
  checklist_completed?: boolean | null;
  checklist_completed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Map remote response to DTO
 */
export function mapRemoteChildToDTO(remote: RemoteAdminChildResponse): AdminChildDTO {
  return {
    id: String(remote.id),
    name: remote.name,
    age: remote.age,
    dateOfBirth: remote.dateOfBirth ?? remote.date_of_birth ?? null,
    gender: (remote.gender as AdminChildDTO['gender']) ?? null,
    address: remote.address ?? null,
    postcode: remote.postcode ?? null,
    city: remote.city ?? null,
    region: remote.region ?? null,
    approvalStatus: (remote.approvalStatus ?? remote.approval_status ?? 'pending') as AdminChildDTO['approvalStatus'],
    approvedAt: remote.approvedAt ?? remote.approved_at ?? null,
    approvedByName: remote.approvedByName ?? remote.approved_by_name ?? null,
    rejectionReason: remote.rejectionReason ?? remote.rejection_reason ?? null,
    rejectedAt: remote.rejectedAt ?? remote.rejected_at ?? null,
    hasChecklist: remote.hasChecklist ?? remote.has_checklist ?? false,
    checklistCompleted:
      remote.checklistCompleted ?? remote.checklist_completed ?? false,
    checklistCompletedAt:
      remote.checklistCompletedAt ?? remote.checklist_completed_at ?? null,
    checklist: remote.checklist ? mapRemoteChecklistToDTO(remote.checklist) : null,
    parentId: remote.parentId ? String(remote.parentId) : (remote.parent_id ? String(remote.parent_id) : null),
    parentName: remote.parentName ?? remote.parent_name ?? null,
    parentEmail: remote.parentEmail ?? remote.parent_email ?? null,
    parentPhone: remote.parentPhone ?? remote.parent_phone ?? null,
    remainingHours:
      remote.remainingHours ?? remote.remaining_hours ?? null,
    bookings: remote.bookings?.map(mapRemoteChildBookingToDTO),
    createdAt: remote.createdAt ?? remote.created_at ?? null,
    updatedAt: remote.updatedAt ?? remote.updated_at ?? null,
  };
}

/**
 * Map remote booking response to DTO
 */
export function mapRemoteChildBookingToDTO(remote: RemoteChildBookingResponse): ChildBookingDTO {
  return {
    id: String(remote.id),
    reference: remote.reference,
    packageName: remote.packageName ?? remote.package_name ?? null,
    status: remote.status,
    paymentStatus: remote.paymentStatus ?? remote.payment_status ?? '',
    createdAt: remote.createdAt ?? remote.created_at ?? null,
  };
}

export function mapRemoteChecklistToDTO(
  remote: RemoteAdminChildChecklistResponse,
): AdminChildChecklistDTO {
  return {
    id: String(remote.id),
    childId: String(remote.child_id),
    medicalConditions: remote.medical_conditions ?? null,
    allergies: remote.allergies ?? null,
    medications: remote.medications ?? null,
    dietaryRequirements: remote.dietary_requirements ?? null,
    emergencyContactName: remote.emergency_contact_name ?? null,
    emergencyContactRelationship: remote.emergency_contact_relationship ?? null,
    emergencyContactPhone: remote.emergency_contact_phone ?? null,
    emergencyContactPhoneAlt: remote.emergency_contact_phone_alt ?? null,
    emergencyContactAddress: remote.emergency_contact_address ?? null,
    specialNeeds: remote.special_needs ?? null,
    behavioralNotes: remote.behavioral_notes ?? null,
    activityRestrictions: remote.activity_restrictions ?? null,
    consentPhotography: remote.consent_photography ?? null,
    consentMedicalTreatment: remote.consent_medical_treatment ?? null,
    checklistCompleted: remote.checklist_completed ?? false,
    checklistCompletedAt: remote.checklist_completed_at ?? null,
    createdAt: remote.created_at ?? null,
    updatedAt: remote.updated_at ?? null,
  };
}
