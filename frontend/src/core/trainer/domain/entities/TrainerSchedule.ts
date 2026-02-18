export interface ShiftLocation {
  id: string;
  name: string;
  address: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface ClockEvent {
  id: string;
  type: 'clock-in' | 'clock-out' | 'break-start' | 'break-end';
  time: string;
  timestamp: string;
}

export interface ApprovalStatus {
  assignee: 'approved' | 'pending' | 'rejected';
  supervisor: 'approved' | 'pending' | 'rejected';
}

export interface Shift {
  id: string;
  position: string;
  location: ShiftLocation;
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  date: string; // "2026-02-07"
  breakMinutes: number;
  assignee: string;
  rate: number;
  totalPay: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  notesCount?: number;
  clockHistory?: ClockEvent[];
  hoursWorked?: string; // "12:15–16:30"
  totalHoursWorked?: number;
  approvalStatus?: ApprovalStatus;
}

export interface AvailabilityEntry {
  id: string;
  date: string;
  type: 'available' | 'unavailable';
  period: 'all-day' | 'morning' | 'afternoon' | 'evening';
}

export interface AbsenceRequest {
  id: string;
  type: 'sick-leave' | 'annual-leave' | 'unpaid-leave' | 'other';
  fromDate: string;
  toDate: string;
  halfDay: boolean;
  status: 'approved' | 'pending' | 'rejected';
  comment?: string;
  days: number;
}

