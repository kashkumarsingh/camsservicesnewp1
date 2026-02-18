export interface TimesheetEntry {
  id: string;
  date: string; // ISO date, e.g. "2026-02-07"
  shiftId: string;
  position: string;
  location: string;
  confirmedHours: number;
  totalHours: number;
  confirmedPay: number;
  totalPay: number;
  status: 'confirmed' | 'pending' | 'disputed';
}

export interface PayPeriod {
  id: string;
  period: string; // Human-readable label, e.g. "Jan 2026"
  fromDate: string; // ISO date
  toDate: string; // ISO date
  totalHours: number;
  totalPay: number;
  status: 'upcoming' | 'paid';
  payDate?: string;
}

