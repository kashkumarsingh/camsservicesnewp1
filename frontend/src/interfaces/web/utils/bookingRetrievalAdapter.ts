/**
 * Booking Retrieval Adapter
 * Converts BookingDTO to VisitorBooking format for retrieval page
 */

import { BookingDTO } from '@/core/application/booking/dto/BookingDTO';

export interface VisitorBooking {
  reference: string;
  email: string;
  phone: string;
  usedHours: number;
  remainingHours: number;
  totalHours: number;
  sessions: number;
  date: string;
  sessionsData?: Array<{
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    activities: Array<{ id: number; name: string; duration: number }>;
    notes?: string;
  }>;
  parentDetails?: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    postcode?: string;
    county?: string;
  };
  childrenDetails?: Array<{
    id: number;
    name: string;
    age: string | number;
    medicalInfo?: string;
  }>;
  packageName?: string;
  packageSlug?: string;
}

/**
 * Convert BookingDTO to VisitorBooking format
 */
export function bookingDTOToVisitorBooking(bookingDTO: BookingDTO): VisitorBooking {
  // Calculate used hours from schedules
  const usedHours = bookingDTO.schedules.reduce((total, schedule) => {
    const start = new Date(`2000-01-01T${schedule.startTime}`);
    const end = new Date(`2000-01-01T${schedule.endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return total + hours;
  }, 0);

  const remainingHours = bookingDTO.totalHours - usedHours;

  // Convert schedules to sessionsData format
  const sessionsData = bookingDTO.schedules.map((schedule, index) => {
    const start = new Date(`2000-01-01T${schedule.startTime}`);
    const end = new Date(`2000-01-01T${schedule.endTime}`);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    return {
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      duration,
      activities: schedule.activityId
        ? [{ id: parseInt(schedule.activityId), name: 'Activity', duration }]
        : [],
      notes: undefined,
    };
  });

  // Convert participants to childrenDetails format
  const childrenDetails = bookingDTO.participants.map((participant, index) => {
    const dob = new Date(participant.dateOfBirth);
    const age = new Date().getFullYear() - dob.getFullYear();

    return {
      id: index + 1,
      name: `${participant.firstName} ${participant.lastName}`.trim(),
      age: age || '',
      medicalInfo: participant.medicalInfo,
    };
  });

  // Handle optional parentGuardian - use fallback fields if not present
  const parentGuardian = bookingDTO.parentGuardian || {
    firstName: bookingDTO.parentFirstName || '',
    lastName: bookingDTO.parentLastName || '',
    email: bookingDTO.parentEmail || '',
    phone: bookingDTO.parentPhone || '',
    address: bookingDTO.parentAddress,
    emergencyContact: bookingDTO.emergencyContact,
  };

  // Convert parentGuardian to parentDetails format
  const parentDetails = {
    name: `${parentGuardian.firstName} ${parentGuardian.lastName}`.trim(),
    email: parentGuardian.email,
    phone: parentGuardian.phone,
    address: parentGuardian.address,
    postcode: undefined, // Not in DTO
    county: undefined, // Not in DTO
  };

  return {
    reference: bookingDTO.reference,
    email: parentGuardian.email,
    phone: parentGuardian.phone,
    usedHours,
    remainingHours,
    totalHours: bookingDTO.totalHours,
    sessions: bookingDTO.schedules.length,
    date: bookingDTO.createdAt,
    sessionsData,
    parentDetails,
    childrenDetails,
    packageSlug: bookingDTO.packageSlug,
    packageName: undefined, // Would need to fetch from package repository
  };
}

