import { ParticipantDTO, BookingScheduleDTO } from './BookingDTO';

/**
 * Update Booking Data Transfer Object
 */
export interface UpdateBookingDTO {
  participants?: ParticipantDTO[];
  schedules?: BookingScheduleDTO[];
  startDate?: string;
  notes?: string;
}


