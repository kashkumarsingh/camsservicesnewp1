/**
 * Admin Booking DTOs (Application Layer)
 *
 * Clean Architecture: Application Layer
 * Purpose: Data Transfer Objects for admin booking management
 * Location: frontend/src/core/application/admin/dto/AdminBookingDTO.ts
 *
 * These DTOs define the shape of booking data exchanged between:
 * - Frontend UI (Presentation Layer)
 * - Backend API (Infrastructure Layer)
 *
 * Naming Convention: "Remote" = from backend API (CMS-agnostic)
 */

// Shared enums for booking + payment status
export type BookingStatus = 'draft' | 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';

// ========== Remote API Response Types (from backend) ==========

export interface RemoteBookingParticipant {
  id: string;
  childId: string;
  name: string;
}

/** Trainer assignment workflow: pending_confirmation | trainer_confirmed | trainer_declined | admin_assigned */
export type TrainerAssignmentStatus =
  | 'pending_trainer_confirmation'
  | 'trainer_confirmed'
  | 'trainer_declined'
  | 'admin_assigned'
  | null;

export interface RemoteBookingSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  trainerId: string | null;
  trainerName: string | null;
  trainerEmail?: string | null;
  trainerPhone?: string | null;
  status: string;
  /** Trainer has confirmed this session; when set, admin cannot drag to reassign/unassign. */
  trainerAssignmentStatus?: TrainerAssignmentStatus;
  /** ISO 8601 when trainer confirmed (used for display). */
  trainerConfirmedAt?: string | null;
  /** Session location (e.g. venue name or address). */
  location?: string | null;
  /** Last clock-in time (ISO 8601) for admin Latest activity. */
  clockedInAt?: string | null;
  /** Trainer GPS latitude at clock-in (for "View trainer on map"). */
  clockedInLatitude?: number | null;
  /** Trainer GPS longitude at clock-in (for "View trainer on map"). */
  clockedInLongitude?: number | null;
  /** Last clock-out time (ISO 8601) for admin Latest activity. */
  clockedOutAt?: string | null;
  /** Trainer-set "doing now" activity ID. */
  currentActivityId?: string | null;
  /** Trainer-set "doing now" activity name (e.g. "Horse riding"). */
  currentActivityName?: string | null;
  /** Session activities: trainer "completed X" / "is performing X" at location (chronological). */
  currentActivityUpdates?: SessionActivityUpdate[];
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  durationHours?: number;
  actualDurationHours?: number;
}

export interface SessionActivityUpdate {
  id: number;
  activityName: string;
  location: string | null;
  /** ISO 8601 when trainer logged this activity. */
  at: string;
}

export interface RemoteBookingResponse {
  id: string;
  reference: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  parentId: string | null;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentAddress?: string;
  parentPostcode?: string;
  parentCounty?: string;
  emergencyContact?: string;
  packageId: string | null;
  packageName: string | null;
  totalHours: number;
  bookedHours: number;
  usedHours: number;
  remainingHours: number;
  totalPrice: number;
  paidAmount: number;
  discountAmount?: number;
  discountReason?: string;
  paymentPlan?: string;
  installmentCount?: number;
  nextPaymentDueAt?: string;
  startDate?: string;
  packageExpiresAt?: string;
  hoursExpiresAt?: string;
  adminNotes?: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  children?: RemoteBookingParticipant[];
  sessionCount?: number;
  sessions?: RemoteBookingSession[];
  createdAt: string;
  updatedAt: string;
}

export interface RemoteBookingsListResponse {
  data: RemoteBookingResponse[];
  meta?: {
    limit: number;
    offset: number;
    total_count: number;
  };
}

export interface RemoteUpdateStatusResponse {
  id: string;
  reference: string;
  status: string;
  paymentStatus: string;
  parentName: string;
  packageName: string | null;
  cancelledAt?: string;
  cancellationReason?: string;
  updatedAt: string;
}

export interface RemoteAssignTrainerResponse {
  id: string;
  trainerId: string;
  trainerName: string | null;
  trainerEmail: string | null;
  updatedAt: string;
}

export interface RemoteBulkOperationResponse {
  cancelled_count?: number;
  confirmed_count?: number;
}

export interface RemoteUpdateNotesResponse {
  id: string;
  adminNotes: string | null;
  notes: string | null;
  updatedAt: string;
}

// ========== Frontend DTOs (for UI consumption) ==========

export interface AdminBookingDTO {
  id: string;
  reference: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  parentId: string | null;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentAddress?: string;
  parentPostcode?: string;
  parentCounty?: string;
  emergencyContact?: string;
  packageId: string | null;
  packageName: string | null;
  totalHours: number;
  bookedHours: number;
  usedHours: number;
  remainingHours: number;
  totalPrice: number;
  paidAmount: number;
  discountAmount?: number;
  discountReason?: string;
  paymentPlan?: string;
  installmentCount?: number;
  nextPaymentDueAt?: string;
  startDate?: string;
  packageExpiresAt?: string;
  hoursExpiresAt?: string;
  adminNotes?: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  children: RemoteBookingParticipant[];
  sessionCount: number;
  sessions: RemoteBookingSession[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBookingStatusDTO {
  status: BookingStatus;
  cancellation_reason?: string;
}

export interface AssignTrainerDTO {
  trainer_id: string;
}

export interface BulkCancelDTO {
  booking_ids: string[];
  cancellation_reason?: string;
}

export interface BulkConfirmDTO {
  booking_ids: string[];
}

export interface UpdateBookingNotesDTO {
  admin_notes?: string;
  notes?: string;
}

export interface AdminBookingsFilters {
  status?: string;
  payment_status?: string;
  package_id?: string;
  trainer_id?: string;
  /** When true, only bookings with at least one scheduled session that has no trainer assigned */
  needs_trainer?: boolean;
  parent_id?: string;
  date_from?: string;
  date_to?: string;
  /** Filter by session date (schedule date), not booking created_at */
  session_date_from?: string;
  session_date_to?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// ========== Mapper Functions (Remote → Frontend) ==========

export function mapRemoteBookingToAdminBookingDTO(
  remote: RemoteBookingResponse
): AdminBookingDTO {
  return {
    id: remote.id,
    reference: remote.reference,
    status: remote.status,
    paymentStatus: remote.paymentStatus,
    parentId: remote.parentId,
    parentName: remote.parentName,
    parentEmail: remote.parentEmail,
    parentPhone: remote.parentPhone,
    parentAddress: remote.parentAddress,
    parentPostcode: remote.parentPostcode,
    parentCounty: remote.parentCounty,
    emergencyContact: remote.emergencyContact,
    packageId: remote.packageId,
    packageName: remote.packageName,
    totalHours: remote.totalHours,
    bookedHours: remote.bookedHours,
    usedHours: remote.usedHours,
    remainingHours: remote.remainingHours,
    totalPrice: remote.totalPrice,
    paidAmount: remote.paidAmount,
    discountAmount: remote.discountAmount,
    discountReason: remote.discountReason,
    paymentPlan: remote.paymentPlan,
    installmentCount: remote.installmentCount,
    nextPaymentDueAt: remote.nextPaymentDueAt,
    startDate: remote.startDate,
    packageExpiresAt: remote.packageExpiresAt,
    hoursExpiresAt: remote.hoursExpiresAt,
    adminNotes: remote.adminNotes,
    notes: remote.notes,
    cancellationReason: remote.cancellationReason,
    cancelledAt: remote.cancelledAt,
    children: remote.children || [],
    sessionCount: remote.sessionCount || remote.sessions?.length || 0,
    sessions: remote.sessions || [],
    createdAt: remote.createdAt,
    updatedAt: remote.updatedAt,
  };
}
