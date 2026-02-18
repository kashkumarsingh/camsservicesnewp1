import { TrainerProfile, type EmergencyContact, type Qualification } from '@/core/trainer/domain/entities/TrainerProfile';
import type { AvailabilityEntry, Shift } from '@/core/trainer/domain/entities/TrainerSchedule';
import type { PayPeriod, TimesheetEntry } from '@/core/trainer/domain/entities/TrainerTimesheet';

export const mockShifts: Shift[] = [
  {
    id: 'shift-001',
    position: 'Senior Fitness Trainer',
    location: {
      id: 'loc-001',
      name: 'ExcelCentre London',
      address: 'Royal Victoria Dock, 1 Western Gateway, London E16 1XL',
      country: 'United Kingdom',
      latitude: 51.5081,
      longitude: 0.0294,
    },
    startTime: '09:00',
    endTime: '17:00',
    date: '2026-02-07',
    breakMinutes: 60,
    assignee: 'John Smith',
    rate: 25.5,
    totalPay: 178.5,
    status: 'confirmed',
    notesCount: 2,
    hoursWorked: '12:15–16:30',
    totalHoursWorked: 4.25,
    clockHistory: [
      { id: 'c1', type: 'clock-in', time: '12:15', timestamp: '2026-02-07T12:15:00' },
      { id: 'c2', type: 'clock-out', time: '16:30', timestamp: '2026-02-07T16:30:00' },
    ],
    approvalStatus: {
      assignee: 'approved',
      supervisor: 'pending',
    },
  },
  {
    id: 'shift-002',
    position: 'Flexi Practitioner 1:1',
    location: {
      id: 'loc-002',
      name: 'LeHi',
      address: 'LeHi Centre, London',
      country: 'United Kingdom',
      latitude: 51.5074,
      longitude: -0.1278,
    },
    startTime: '12:15',
    endTime: '15:15',
    date: '2026-02-09',
    breakMinutes: 0,
    assignee: 'Kenneth Holder',
    rate: 0,
    totalPay: 0,
    status: 'confirmed',
    notesCount: 0,
    clockHistory: [
      { id: 'c3', type: 'clock-in', time: '12:15', timestamp: '2026-02-09T12:15:00' },
      { id: 'c4', type: 'clock-out', time: '16:30', timestamp: '2026-02-09T16:30:00' },
    ],
    hoursWorked: '12:15–16:30',
    totalHoursWorked: 4.25,
    approvalStatus: {
      assignee: 'approved',
      supervisor: 'pending',
    },
  },
];

export const mockAvailability: AvailabilityEntry[] = [
  {
    id: 'avail-001',
    date: '2026-02-16',
    type: 'unavailable',
    period: 'all-day',
  },
  {
    id: 'avail-002',
    date: '2026-02-17',
    type: 'unavailable',
    period: 'all-day',
  },
  {
    id: 'avail-003',
    date: '2026-02-18',
    type: 'unavailable',
    period: 'all-day',
  },
  {
    id: 'avail-004',
    date: '2026-02-19',
    type: 'unavailable',
    period: 'all-day',
  },
  {
    id: 'avail-005',
    date: '2026-02-20',
    type: 'unavailable',
    period: 'all-day',
  },
];

const mockQualifications: Qualification[] = [
  {
    id: 'qual-001',
    name: 'Driving Licence',
    issuer: 'DVLA',
    dateObtained: '2020-05-26',
    expiryDate: '2030-05-26',
  },
  {
    id: 'qual-002',
    name: 'Public Liability Insurance',
    issuer: 'Fish Insurance',
    dateObtained: '2024-10-23',
    expiryDate: '2025-10-23',
  },
];

const mockEmergencyContacts: EmergencyContact[] = [
  {
    id: 'ec-001',
    name: 'Emergency Contact One',
    relationship: 'Spouse',
    phone: '07123 456789',
    email: 'contact.one@example.com',
  },
];

export const mockTrainerProfile = new TrainerProfile(
  'trainer-001',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe',
  'John',
  'Doe',
  'john.doe@trainer.com',
  '1990-05-15',
  'Male',
  '+44 7700 900000',
  true,
  true,
  mockQualifications,
  mockEmergencyContacts,
);

export const mockTimesheetEntries: TimesheetEntry[] = [
  {
    id: 'ts-001',
    date: '2026-02-07',
    shiftId: 'shift-001',
    position: 'Senior Fitness Trainer',
    location: 'ExcelCentre London',
    confirmedHours: 7,
    totalHours: 8,
    confirmedPay: 178.5,
    totalPay: 204,
    status: 'confirmed',
  },
];

export const mockPayPeriods: PayPeriod[] = [
  {
    id: 'pp-jan-2026',
    period: 'January 2026',
    fromDate: '2026-01-01',
    toDate: '2026-01-31',
    totalHours: 120,
    totalPay: 2500,
    status: 'paid',
    payDate: '2026-02-05',
  },
];

