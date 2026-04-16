export interface FormChildDetails {
  id: number;
  name: string;
  age: number | '';
  medicalInfo: string;
  allergies?: string;
  emergencyContact: string;
}

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

export interface FormCustomActivity {
  name: string;
  duration: number;
  description?: string;
  equipment?: string;
}

export interface FormParentDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
}

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
