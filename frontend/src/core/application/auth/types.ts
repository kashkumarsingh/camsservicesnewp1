/**
 * Authentication Types
 * 
 * Clean Architecture: Application Layer
 * Purpose: Type definitions for authentication domain
 */

/** User from API; backend sends camelCase after keysToCamelCase. */
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  postcode?: string;
  county?: string;
  role: 'parent' | 'trainer' | 'admin' | 'super_admin' | 'editor';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  canBook?: boolean;
  createdAt: string;
}

/** Child from API / ChildrenRepository; backend sends camelCase. */
export interface Child {
  id: number;
  userId: number;
  name: string;
  age: number;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: string;
  postcode?: string;
  city?: string;
  region?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  hasChecklist: boolean;
  checklistCompleted: boolean;
  specialEducationalNeeds?: string;
  createdAt: string;
  canArchive?: boolean;
  canDelete?: boolean;
}

/**
 * Shape that API or code may use (snake_case or camelCase).
 * Used by getChildChecklistFlags to support both conventions.
 */
export type ChildChecklistFlagsSource = {
  has_checklist?: boolean;
  checklist_completed?: boolean;
  approval_status?: string;
  hasChecklist?: boolean;
  checklistCompleted?: boolean;
  approvalStatus?: string;
};

export interface ChildChecklistFlags {
  hasChecklist: boolean;
  checklistCompleted: boolean;
  approvalStatus: string;
}

/**
 * Read checklist/approval flags from a child-like object, supporting both snake_case and camelCase from the API.
 * Use this so the sidebar and dashboard are robust regardless of response shape.
 */
export function getChildChecklistFlags(
  child: ChildChecklistFlagsSource | null | undefined
): ChildChecklistFlags {
  if (!child) {
    return { hasChecklist: false, checklistCompleted: false, approvalStatus: '' };
  }
  const hasChecklist =
    child.has_checklist === true || child.hasChecklist === true;
  const checklistCompleted =
    child.checklist_completed === true || child.checklistCompleted === true;
  const approvalStatus =
    (child.approval_status as string) ?? (child.approvalStatus as string) ?? '';
  return { hasChecklist, checklistCompleted, approvalStatus };
}

/**
 * True when the child is pending and needs the checklist CTA (no checklist or incomplete checklist).
 * Use for ordering/sorting; for sidebar "ACTION NEEDED" use childNeedsChecklistToComplete so submitted children don't appear in both blocks.
 */
export function childNeedsChecklistCta(child: ChildChecklistFlagsSource | null | undefined): boolean {
  const { hasChecklist, checklistCompleted, approvalStatus } = getChildChecklistFlags(child);
  if (approvalStatus !== 'pending') return false;
  return !hasChecklist || !checklistCompleted;
}

/**
 * True when the child is pending and has NOT yet submitted a checklist (so we show "Complete checklist" in ACTION NEEDED).
 * Once they have submitted (hasChecklist true), they should only appear in "CHECKLIST SUBMITTED", not both.
 */
export function childNeedsChecklistToComplete(child: ChildChecklistFlagsSource | null | undefined): boolean {
  const { hasChecklist, approvalStatus } = getChildChecklistFlags(child);
  if (approvalStatus !== 'pending') return false;
  return hasChecklist !== true;
}

/**
 * True when the child has submitted the checklist but admin has not yet marked it complete (awaiting review).
 * Use this to show "We're reviewing your checklist" instead of "ALL CLEAR" so parents aren't confused.
 */
export function childAwaitingChecklistReview(child: ChildChecklistFlagsSource | null | undefined): boolean {
  const { hasChecklist, checklistCompleted, approvalStatus } = getChildChecklistFlags(child);
  if (approvalStatus !== 'pending') return false;
  return hasChecklist === true && checklistCompleted !== true;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  address: string;
  postcode: string;
  city?: string;
  region?: string;
  registration_source?: 'contact_page' | 'direct' | 'referral';
}

export interface LoginRequest {
  email: string;
  password: string;
}

/** API returns camelCase after backend keysToCamelCase. */
export interface AuthResponse {
  user: User;
  accessToken: string;
  tokenType: string;
}

export interface CreateChildRequest {
  name: string;
  age: number;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: string;
  postcode?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

export interface ChildChecklistRequest {
  medical_conditions?: string;
  allergies?: string;
  medications?: string;
  dietary_requirements?: string;
  emergency_contact_name: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone: string;
  emergency_contact_phone_alt?: string;
  emergency_contact_address?: string;
  special_needs?: string;
  behavioral_notes?: string;
  activity_restrictions?: string;
  consent_photography?: boolean;
  consent_medical_treatment?: boolean;
}

export interface UserChecklistRequest {
  identity_document_type?: string;
  identity_document_reference?: string;
  reference_1_name?: string;
  reference_1_contact?: string;
  reference_2_name?: string;
  reference_2_contact?: string;
  consent_data_processing?: boolean;
  consent_marketing?: boolean;
}

