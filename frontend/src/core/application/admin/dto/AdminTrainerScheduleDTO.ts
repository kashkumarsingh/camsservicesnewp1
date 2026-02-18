/**
 * Admin Trainer Schedule DTOs (Application Layer)
 *
 * Clean Architecture: Application Layer
 * Purpose: Data transfer objects for admin view of a trainer's booking schedules
 * Location: frontend/src/core/application/admin/dto/AdminTrainerScheduleDTO.ts
 */

export interface RemoteAdminScheduleActivity {
  id: string;
  name: string;
  slug: string;
}

export interface RemoteAdminScheduleItem {
  id: string;
  booking_id: string;
  reference: string | null;
  date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  status: string;
  location: string | null;
  package_name: string | null;
  package_slug: string | null;
  activities: RemoteAdminScheduleActivity[];
  current_activity_id: string | null;
  current_activity_name: string | null;
  trainer_id: string;
  trainer_name: string | null;
}

export interface RemoteAdminScheduleDetail extends RemoteAdminScheduleItem {
  clocked_in_at?: string | null;
  clocked_out_at?: string | null;
  parent_name?: string | null;
  parent_email?: string | null;
  parent_phone?: string | null;
  participants?: Array<{ id: string; name: string }>;
}

export interface RemoteAdminTrainerSchedulesResponse {
  success: boolean;
  data: {
    schedules: RemoteAdminScheduleItem[];
  };
  meta?: {
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      from: number | null;
      to: number | null;
    };
  };
}

export interface RemoteAdminTrainerScheduleDetailResponse {
  success: boolean;
  data: {
    schedule: RemoteAdminScheduleDetail;
  };
}

export interface AdminTrainerSchedulesFilters {
  date_from?: string;
  date_to?: string;
  status?: string;
  month?: number;
  year?: number;
  per_page?: number;
}

/**
 * Map backend schedule item to Shift-like shape for ScheduleListView.
 * Used by admin trainer schedule page (session = "shift" in UI).
 */
export function mapAdminScheduleToShift(
  item: RemoteAdminScheduleItem
): {
  id: string;
  position: string;
  location: { id: string; name: string; address: string; country: string; latitude: number; longitude: number };
  startTime: string;
  endTime: string;
  date: string;
  breakMinutes: number;
  assignee: string;
  rate: number;
  totalPay: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  notesCount?: number;
} {
  const startTime = (item.start_time ?? '').slice(0, 5) || '00:00';
  const endTime = (item.end_time ?? '').slice(0, 5) || '00:00';
  const position =
    item.package_name ?? (item.activities?.[0]?.name) ?? 'Session';
  const status =
    item.status === 'cancelled'
      ? ('cancelled' as const)
      : item.status === 'scheduled' || item.status === 'completed'
        ? ('confirmed' as const)
        : ('pending' as const);

  return {
    id: item.id,
    position,
    location: {
      id: item.id,
      name: item.location ?? 'TBC',
      address: '',
      country: '',
      latitude: 0,
      longitude: 0,
    },
    startTime,
    endTime,
    date: item.date,
    breakMinutes: 0,
    assignee: item.trainer_name ?? '',
    rate: 0,
    totalPay: 0,
    status,
    notesCount: 0,
  };
}
