/**
 * Form-specific types for booking components (form state and user interaction).
 * Use camelCase; for API payloads use core/application types and bookingAdapters.
 */

/**
 * Form state for child details (allows empty values during entry).
 */
export interface FormChildDetails {
  id: number;
  name: string;
  age: number | '';
  medicalInfo: string;
  allergies?: string;
  emergencyContact: string;
}

/**
 * Form state for a booked day.
 */
export interface FormBookedDay {
  date: string;
  hours: number;
  startTime: string;
  endTime: string;
  selectedActivityIds: number[];
  customActivities: FormCustomActivity[];
  trainerChoice: boolean;
  trainerNotes?: string;
}

/**
 * Form state for a custom activity.
 */
export interface FormCustomActivity {
  name: string;
  duration: number;
  description?: string;
  equipment?: string;
}

/**
 * Form state for parent details.
 */
export interface FormParentDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
}

/**
 * Full booking wizard form state.
 */
export interface EnhancedBookingState {
  selectedTrainerId: number | null;
  bookedDays: FormBookedDay[];
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentAddress: string;
  parentPostcode: string;
  childrenDetails: FormChildDetails[];
  currentStep: number;
}
