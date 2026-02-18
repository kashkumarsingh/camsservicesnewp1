/**
 * Unified Itinerary Types for Database Schema
 * 
 * Database structure:
 * - itinerary_type: 'single-day-event' | 'multi-day-event' | 'hospital-appointment' | 'exam-support' | 'school-run' | 'club-escort' | etc.
 * - itinerary_data: JSON field containing the type-specific data
 */

export type ItineraryType =
  | 'single-day-event'
  | 'multi-day-event'
  | 'hospital-appointment'
  | 'exam-support'
  | 'school-run'
  | 'club-escort'
  | 'therapy-companion'
  | 'holiday-day-trip'
  | 'weekend-respite'
  | 'custom';

/**
 * Common fields shared across all itinerary types
 */
export interface BaseItineraryData {
  // Pickup Information
  pickupAddress?: string;
  pickupTime?: string;
  pickupTimeOverridden?: boolean;
  
  // Drop-off Information
  dropoffAddress?: string;
  dropoffSameAsPickup?: boolean;
  
  // Common metadata
  includeTravel?: boolean;
  additionalNotes?: string;
}

/**
 * Single-Day Event Itinerary
 */
export interface SingleDayEventItineraryData extends BaseItineraryData {
  type: 'single-day-event';
  eventAddress: string;
  eventStartTime: string;
  eventEndTime: string;
  includeTravel: boolean;
}

/**
 * Multi-Day Event Itinerary
 */
export interface MultiDayEventItineraryData extends BaseItineraryData {
  type: 'multi-day-event';
  days: Array<{
    day: number;
    date: string;
    eventAddress: string;
    eventStartTime: string;
    eventEndTime: string;
    overnightLocation?: string;
  }>;
}

/**
 * Hospital Appointment Itinerary
 */
export interface HospitalAppointmentItineraryData extends BaseItineraryData {
  type: 'hospital-appointment';
  hospitalAddress: string;
  appointmentTime: string;
  waitingRoomDuration: string; // hours
  medicalNotes?: string;
}

/**
 * Exam Support Itinerary
 */
export interface ExamSupportItineraryData extends BaseItineraryData {
  type: 'exam-support';
  examVenue: string;
  examTime: string;
  examDuration: string; // hours
  examAccommodations?: string;
}

/**
 * School Run Itinerary
 */
export interface SchoolRunItineraryData extends BaseItineraryData {
  type: 'school-run';
  schoolAddress: string;
  schoolPickupTime: string;
  schoolEndTime: string;
  includeHomework: boolean;
}

/**
 * Club/Class Escort Itinerary
 */
export interface ClubEscortItineraryData extends BaseItineraryData {
  type: 'club-escort';
  clubName: string;
  clubAddress: string;
  pickupTime: string;
  clubEndTime: string;
}

/**
 * Union type for all itinerary data
 */
export type ItineraryData =
  | SingleDayEventItineraryData
  | MultiDayEventItineraryData
  | HospitalAppointmentItineraryData
  | ExamSupportItineraryData
  | SchoolRunItineraryData
  | ClubEscortItineraryData;

/**
 * Database-ready structure
 */
export interface ItineraryRecord {
  itinerary_type: ItineraryType;
  itinerary_data: ItineraryData;
}

/**
 * Helper to serialize itinerary data for database
 */
export function serializeItinerary(data: ItineraryData): ItineraryRecord {
  return {
    itinerary_type: data.type,
    itinerary_data: data,
  };
}

/**
 * Helper to deserialize itinerary data from database
 */
export function deserializeItinerary(record: ItineraryRecord): ItineraryData {
  return record.itinerary_data;
}

/**
 * Helper to format itinerary as human-readable text (for notes field fallback)
 */
export function formatItineraryAsText(data: ItineraryData): string {
  const lines: string[] = [];
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  switch (data.type) {
    case 'single-day-event':
      lines.push('📅 EVENT ITINERARY');
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      lines.push('');
      if (data.pickupAddress) {
        lines.push(`📍 Pickup Address: ${data.pickupAddress}`);
        lines.push(`   Time: ${data.pickupTime || '—'}`);
      }
      lines.push(`🎯 Event Address: ${data.eventAddress}`);
      lines.push(`   Time: ${data.eventStartTime} – ${data.eventEndTime}`);
      if (data.dropoffAddress || data.dropoffSameAsPickup) {
        lines.push(`🚗 Drop-off: ${data.dropoffSameAsPickup ? 'Same as pickup' : data.dropoffAddress}`);
      }
      lines.push(`✈️ Travel included: ${data.includeTravel ? 'Yes' : 'No'}`);
      break;
      
    case 'hospital-appointment':
      lines.push('🏥 HOSPITAL APPOINTMENT DETAILS');
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      lines.push('');
      if (data.pickupAddress) {
        lines.push(`📍 Pickup: ${data.pickupAddress} at ${data.pickupTime || '—'}`);
      }
      lines.push(`🏥 Hospital: ${data.hospitalAddress}`);
      lines.push(`⏰ Appointment: ${data.appointmentTime}`);
      lines.push(`⏱️ Waiting Room: ${data.waitingRoomDuration} hour(s)`);
      if (data.medicalNotes) {
        lines.push(`📝 Medical Notes: ${data.medicalNotes}`);
      }
      break;
      
    case 'exam-support':
      lines.push('📝 EXAM SUPPORT DETAILS');
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      lines.push('');
      if (data.pickupAddress) {
        lines.push(`📍 Pickup: ${data.pickupAddress} at ${data.pickupTime || '—'}`);
      }
      lines.push(`📍 Exam Venue: ${data.examVenue}`);
      lines.push(`⏰ Exam Time: ${data.examTime}`);
      lines.push(`⏱️ Duration: ${data.examDuration} hour(s)`);
      if (data.examAccommodations) {
        lines.push(`📝 Accommodations: ${data.examAccommodations}`);
      }
      break;
      
    case 'school-run':
      lines.push('🏫 SCHOOL RUN DETAILS');
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      lines.push('');
      lines.push(`🏫 School: ${data.schoolAddress}`);
      lines.push(`⏰ Pickup: ${data.schoolPickupTime}`);
      lines.push(`⏰ School End: ${data.schoolEndTime}`);
      lines.push(`📚 Homework: ${data.includeHomework ? 'Yes' : 'No'}`);
      break;
      
    default:
      lines.push(`📋 ITINERARY (${data.type})`);
      lines.push(JSON.stringify(data, null, 2));
  }
  
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  return lines.join('\n');
}


