/**
 * Trainer Domain Types
 * 
 * Clean Architecture: Application Layer
 * Purpose: Type definitions for trainer-related data
 * Location: frontend/src/core/application/trainer/types.ts
 */

export interface TrainerBooking {
  id: number;
  reference: string;
  package: {
    id: number;
    name: string;
    slug: string;
    total_weeks?: number; // Package duration in weeks (for date constraint validation)
    total_hours?: number; // Package total hours (for hours constraint validation)
  };
  parent: {
    name: string;
    email?: string | null;
    phone?: string | null;
    /** Parent's address (e.g. for pickup / where session takes place). */
    address?: string | null;
    postcode?: string | null;
    county?: string | null;
  };
  participants: TrainerParticipant[];
  schedules: TrainerSchedule[];
  status: string;
  created_at: string;
}

export interface TrainerParticipant {
  id: number;
  /** From API (camelCase). Use childId when reading. */
  childId?: number | null;
  /** @deprecated Use childId. Kept for backward compat if API ever sends snake_case. */
  child_id?: number | null;
  name: string;
  age: number | null;
  medical_info?: string | null; // Legacy field from booking_participants
  medical_conditions?: string | null; // Phase 4: From child_checklists
  allergies?: string | null; // Phase 4: From child_checklists
  medications?: string | null; // Phase 4: From child_checklists
  dietary_requirements?: string | null; // Phase 4: From child_checklists
  special_needs?: string | null; // From booking_participants or child_checklists
  activity_restrictions?: string | null; // Phase 4: From child_checklists
  emergency_contact?: {
    name: string;
    phone: string;
    phone_alt?: string | null; // Phase 4: Alternative emergency contact
    relationship: string | null;
  } | null;
}

export interface TrainerSchedule {
  id: number;
  /** From API (camelCase). Prefer when reading. */
  bookingId?: number;
  booking_id?: number;
  date: string;
  startTime?: string;
  start_time?: string;
  endTime?: string;
  end_time?: string;
  status: string;
  trainer_assignment_status?: string | null;
  /** Session/venue address (where to go). Prefer over parent address when present. */
  location?: string | null;
  booking: {
    id: number;
    reference: string;
    package: {
      id: number;
      name: string;
      slug: string;
    };
  };
  activities: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  attendance?: ScheduleAttendance[];
}

/** Single schedule detail (e.g. for confirmation panel) – may include participants from booking */
export interface TrainerScheduleDetail extends TrainerSchedule {
  booking: TrainerSchedule['booking'] & {
    participants?: Array<{
      id: number;
      booking_id: number;
      child_id: number | null;
      first_name: string;
      last_name: string;
      child?: { id: number; name: string } | null;
    }>;
  };
}

export interface TrainerBookingsResponse {
  bookings: TrainerBooking[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more: boolean;
    prev_page: number | null;
    next_page: number | null;
  };
}

export interface TrainerBookingDetailResponse {
  booking: TrainerBooking;
}

export interface UpdateScheduleStatusRequest {
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  notes?: string;
}

export interface UpdateScheduleStatusResponse {
  schedule: {
    id: number;
    status: string;
    actual_start_time?: string | null;
    actual_end_time?: string | null;
    completed_at?: string | null;
  };
}

export interface TrainerDashboardStats {
  upcoming_sessions: number;
  total_bookings: number;
  today_schedule: number;
}

export interface TrainerDashboardStatsResponse {
  success: boolean;
  data: {
    stats: TrainerDashboardStats;
    recent_bookings: Array<{
      id: number;
      reference: string;
      package: {
        name: string;
        slug: string;
      };
      parent: {
        name: string;
      };
      participants: Array<{
        name: string;
        age: number | null;
      }>;
      next_schedule: {
        date: string;
        start_time: string;
        status: string;
      };
      status: string;
      created_at: string;
    }>;
  };
  meta: {
    timestamp: string;
    version: string;
  };
}

// Phase 5: Profile Management Types
export interface TrainerProfile {
  id: number;
  name: string;
  slug: string;
  role: string;
  bio: string;
  full_description: string | null;
  image: string | null;
  rating: number;
  total_reviews: number;
  specialties: string[];
  certifications: TrainerCertification[];
  experience_years: number;
  availability_notes: string | null;
  home_postcode: string | null;
  travel_radius_km: number | null;
  service_area_postcodes: string[];
  preferred_age_groups: string[];
  availability_preferences: AvailabilityPreference[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrainerCertification {
  id: string;
  name: string;
  year?: number | null;
  issuer?: string | null;
  file_path?: string | null;
  file_url?: string | null;
  uploaded_at?: string | null;
  /** Expiry date (YYYY-MM-DD); used for compliance colour coding */
  expiry_date?: string | null;
}

export interface TrainerEmergencyContact {
  id: number;
  name: string;
  relationship?: string | null;
  phone: string;
  email?: string | null;
}

export interface AvailabilityPreference {
  day: string; // 'monday', 'tuesday', etc.
  time_slots: Array<{
    start: string; // '09:00'
    end: string; // '17:00'
  }>;
}

export interface TrainerProfileResponse {
  success: boolean;
  data: {
    profile: TrainerProfile;
  };
  meta: {
    timestamp: string;
    version: string;
  };
}

export interface UpdateTrainerProfileRequest {
  name?: string;
  role?: string;
  bio?: string;
  full_description?: string | null;
  specialties?: string[];
  experience_years?: number;
  availability_notes?: string | null;
  home_postcode?: string | null;
  travel_radius_km?: number | null;
  service_area_postcodes?: string[];
  preferred_age_groups?: string[];
  availability_preferences?: AvailabilityPreference[];
}

export interface UploadQualificationRequest {
  file: File;
  name: string;
  year?: number | null;
  issuer?: string | null;
}

export interface UploadQualificationResponse {
  success: boolean;
  data: {
    certification: TrainerCertification;
    certifications: TrainerCertification[];
  };
  meta: {
    timestamp: string;
    version: string;
  };
}

export interface UpdateAvailabilityRequest {
  availability_preferences: AvailabilityPreference[];
  availability_notes?: string | null;
}

// Phase 2: Schedule Management — uses same TrainerSchedule as above (single declaration)

export interface ScheduleAttendance {
  id: number;
  booking_schedule_id: number;
  booking_participant_id: number;
  attended: boolean;
  arrival_time?: string | null;
  departure_time?: string | null;
  notes?: string | null;
  participant: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface TrainerNote {
  id: number;
  trainer_id: number;
  booking_id: number;
  booking_schedule_id?: number | null;
  note: string;
  type: 'general' | 'incident' | 'feedback' | 'attendance';
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrainerSchedulesResponse {
  schedules: TrainerSchedule[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number | null;
    to: number | null;
  };
}

export interface MarkAttendanceRequest {
  participants: Array<{
    participant_id: number;
    attended: boolean;
    arrival_time?: string;
    departure_time?: string;
    notes?: string;
  }>;
}

export interface MarkAttendanceResponse {
  attendance: ScheduleAttendance[];
}

// Time Tracking Types (camelCase — API response is converted from snake_case by BaseApiController)
export interface TimeEntry {
  id: number;
  trainerId: number;
  bookingScheduleId: number;
  type: 'clock_in' | 'clock_out';
  recordedAt: string;
  source: string;
  notes?: string | null;
}

export interface TimeEntriesResponse {
  timeEntries: TimeEntry[];
  pagination?: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
    from: number | null;
    to: number | null;
  };
}

export interface TrainerNotesResponse {
  notes: TrainerNote[];
}

export interface CreateNoteRequest {
  note: string;
  type?: 'general' | 'incident' | 'feedback' | 'attendance';
  is_private?: boolean;
}

export interface CreateNoteResponse {
  note: TrainerNote;
}

// Phase 3: Activity Logging Types (API returns camelCase after BaseApiController)
export interface ActivityLog {
  id: number;
  trainer_id: number;
  child_id: number;
  /** camelCase from API */
  childId?: number;
  booking_id?: number | null;
  bookingId?: number | null;
  booking_schedule_id?: number | null;
  bookingScheduleId?: number | null;
  activity_name: string;
  description?: string | null;
  notes?: string | null;
  behavioral_observations?: string | null;
  achievements?: string | null;
  challenges?: string | null;
  status: 'in_progress' | 'completed' | 'needs_attention';
  activity_date: string;
  start_time?: string | null;
  startTime?: string | null;
  end_time?: string | null;
  endTime?: string | null;
  duration_minutes?: number | null;
  photos?: string[];
  videos?: string[];
  consent_photography: boolean;
  milestone_achieved: boolean;
  milestone_name?: string | null;
  milestone_description?: string | null;
  is_editable: boolean;
  editable_until?: string | null;
  created_at: string;
  updated_at: string;
  createdAt?: string;
  updatedAt?: string;
  child?: {
    id: number;
    name: string;
    age: number;
  };
  booking?: {
    id: number;
    reference: string;
  };
  schedule?: {
    id: number;
    date: string;
    start_time: string;
  };
}

export interface ActivityLogsResponse {
  activity_logs: ActivityLog[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number | null;
    to: number | null;
  };
}

export interface ChildActivityLogsResponse {
  child: {
    id: number;
    name: string;
    age: number;
  };
  activity_logs: ActivityLog[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number | null;
    to: number | null;
  };
}

export interface CreateActivityLogRequest {
  child_id: number;
  booking_id?: number;
  booking_schedule_id?: number;
  activity_name: string;
  description?: string;
  notes?: string;
  behavioral_observations?: string;
  achievements?: string;
  challenges?: string;
  status?: 'in_progress' | 'completed' | 'needs_attention';
  activity_date: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  photos?: string[];
  videos?: string[];
  consent_photography?: boolean;
  milestone_achieved?: boolean;
  milestone_name?: string;
  milestone_description?: string;
}

export interface CreateActivityLogResponse {
  activity_log: ActivityLog;
}

export interface UpdateActivityLogRequest {
  activity_name?: string;
  description?: string;
  notes?: string;
  behavioral_observations?: string;
  achievements?: string;
  challenges?: string;
  status?: 'in_progress' | 'completed' | 'needs_attention';
  activity_date?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  photos?: string[];
  videos?: string[];
  consent_photography?: boolean;
  milestone_achieved?: boolean;
  milestone_name?: string;
  milestone_description?: string;
}

export interface UpdateActivityLogResponse {
  activity_log: ActivityLog;
}

// Activity Assignment Types (New Feature)
export interface SessionActivity {
  id: number;
  name: string;
  slug: string;
  description: string;
  duration_hours: number;
  order: number;
  notes?: string | null;
  assignment_status: 'draft' | 'assigned' | 'confirmed';
  assigned_at?: string | null;
  confirmed_at?: string | null;
}

export interface AvailableActivity {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url?: string | null;
  difficulty_level?: string | null;
}

export interface SessionActivityInfo {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  activity_count: number;
  is_activity_override: boolean;
  activity_override_reason?: string | null;
  activity_status: 'pending' | 'assigned' | 'confirmed' | 'completed';
  activity_confirmed_at?: string | null;
  calculated_activity_count: number;
  /** Trainer-set "doing now" for Latest activity. */
  current_activity_id?: number | null;
  current_activity_name?: string | null;
  location?: string | null;
  /** Past "Currently doing X at Y" updates (newest first). */
  current_activity_updates?: Array<{ id: number; activity_name: string; location: string | null; at: string }>;
  package: {
    id: number;
    name: string;
    hours_per_activity: number;
    allow_activity_override: boolean;
  };
}

export interface SessionActivitiesResponse {
  schedule: SessionActivityInfo;
  activities: SessionActivity[];
  available_activities: AvailableActivity[];
}

export interface AssignActivityRequest {
  activity_id: number;
  duration_hours?: number;
  order?: number;
  notes?: string;
}

export interface AssignActivityResponse {
  schedule: {
    id: number;
    activity_status: string;
  };
  activity: {
    id: number;
    name: string;
    slug: string;
    assignment_status: string;
    assigned_at: string;
  };
}

export interface ConfirmActivitiesRequest {
  activity_ids?: number[];
  notes?: string;
}

export interface ConfirmActivitiesResponse {
  schedule: {
    id: number;
    activity_status: string;
    activity_confirmed_at: string;
  };
  activities: Array<{
    id: number;
    activity_id: number;
    assignment_status: string;
    confirmed_at: string;
  }>;
  notification_sent: boolean;
}

export interface OverrideActivityCountRequest {
  activity_count: number;
  override_reason: string;
}

export interface OverrideActivityCountResponse {
  schedule: {
    id: number;
    activity_count: number;
    is_activity_override: boolean;
    activity_override_reason: string;
    calculated_activity_count: number;
  };
}

