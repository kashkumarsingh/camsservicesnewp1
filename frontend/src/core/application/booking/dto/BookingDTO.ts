// Import PaymentDTO from Payment domain (separate domain)
import { PaymentDTO } from '../../payment/dto/PaymentDTO';

/**
 * Booking Data Transfer Object
 */
export interface BookingDTO {
  id: string;
  reference: string;
  packageId: string;
  packageSlug: string;
  package?: {
    id: string;
    name: string;
    slug: string;
    price?: number; // Package price
    hours?: number; // Package hours
    totalWeeks?: number; // Package duration in weeks (e.g., 6 weeks)
    weeks?: number; // Alias for totalWeeks (for backward compatibility)
    activities?: Array<{
      id: number | string;
      name: string;
      trainers?: Array<{
        id: number | string;
      }>;
    }>;
  };
  status: string;
  paymentStatus: string;
  parentGuardian?: ParentGuardianDTO;
  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
  parentPhone?: string;
  parentAddress?: string;
  parentPostcode?: string;
  parentCounty?: string;
  emergencyContact?: string;
  participants: ParticipantDTO[];
  schedules: BookingScheduleDTO[];
  payments?: PaymentDTO[]; // Payments array from backend (polymorphic payments from separate Payment domain)
  totalHours: number;
  bookedHours?: number; // Hours already booked
  usedHours?: number; // Hours already used
  remainingHours?: number; // Hours remaining
  totalPrice: number;
  paidAmount: number;
  outstandingAmount?: number;
  discountAmount?: number;
  discountReason?: string;
  paymentPlan?: string;
  installmentCount?: number;
  nextPaymentDueAt?: string;
  createdAt: string;
  updatedAt: string;
  startDate?: string;
  packageExpiresAt?: string; // When the package expires (based on totalWeeks from booking creation)
  hoursExpiresAt?: string; // When the hours expire
  allowHourRollover?: boolean;
  createdByAdmin?: boolean;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  deletedAt?: string; // Soft delete timestamp
  totalAmount?: number; // Alias for totalPrice (backward compatibility)
  modeKey?: string | null; // Booking mode selected during payment (e.g., 'single-day-event', 'school-run-after')
}

export interface ParentGuardianDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  postcode?: string;
  county?: string;
  emergencyContact?: string;
}

export interface ParticipantDTO {
  childId?: number; // Required for backend - links to approved child
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  medicalInfo?: string;
  specialNeeds?: string;
}

export interface BookingScheduleDTO {
  id?: string; // Schedule ID for updates/deletes
  bookingId?: string; // Booking ID this schedule belongs to (from backend API)
  date: string;
  startTime: string;
  endTime: string;
  durationHours?: number; // Duration in hours
  actualDurationHours?: number; // Actual duration in hours (if different from planned)
  trainerId?: string;
  autoAssigned?: boolean;
  requiresAdminApproval?: boolean;
  trainerApprovedAt?: string | null;
  trainerApprovedByUserId?: string | null;
  trainer?: {
    id: string;
    name: string;
    slug: string;
    avatarUrl?: string;
  };
  activityId?: string;
  activities?: Array<{
    id: number | string;
    name: string;
    slug?: string;
    description?: string;
    notes?: string;
    duration?: number; // Duration in hours (from BookingController)
    durationHours?: number; // Duration in hours (from BookingScheduleController, TrainerBookingController)
    order?: number; // Order of activity in schedule
    assignment_status?: 'draft' | 'assigned' | 'confirmed';
    confirmed_at?: string;
  }>;
  status?: string; // Schedule status: 'scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'
  modeKey?: string | null; // Booking mode key
  notes?: string; // Itinerary notes (legacy field)
  itineraryNotes?: string; // Itinerary notes (new field from backend)
  location?: string | null; // Session location or venue (e.g. address or place name)
  bookedBy?: 'parent' | 'trainer' | 'admin'; // Who booked this session
  bookedByUserId?: string; // User ID of who booked this session
  originalDate?: string; // Original date if rescheduled
  originalStartTime?: string; // Original start time if rescheduled
  actualStartTime?: string; // Actual start time (if different from planned)
  actualEndTime?: string; // Actual end time (if different from planned)
  rescheduledAt?: string; // When the schedule was rescheduled
  rescheduleReason?: string; // Reason for rescheduling
  cancellationReason?: string; // Reason for cancellation
  completedAt?: string; // When the schedule was completed
  cancelledAt?: string; // When the schedule was cancelled
  order?: number; // Order of schedule in booking
  createdAt?: string; // When the schedule was created
  updatedAt?: string; // When the schedule was last updated
}


