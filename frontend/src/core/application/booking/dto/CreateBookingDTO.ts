import { ParentGuardianDTO, ParticipantDTO, BookingScheduleDTO } from './BookingDTO';

/**
 * Create Booking Data Transfer Object
 */
export interface CreateBookingDTO {
  packageId: string;
  packageSlug: string;
  parentGuardian: ParentGuardianDTO;
  participants: ParticipantDTO[];
  schedules: BookingScheduleDTO[];
  startDate?: string;
  notes?: string;
  modeKey?: string | null; // Booking mode selected during payment (e.g., 'single-day-event', 'school-run-after')
}


