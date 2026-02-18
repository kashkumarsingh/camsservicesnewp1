export interface Activity {
  id: number;
  name: string;
  imageUrl?: string;
  duration: number;
  description: string;
  available_in_regions?: string[];
  [key: string]: unknown;
}

export interface ChildDetails {
  id: number;
  name: string;
  age: string | number;
  medicalInfo?: string;
  postcode?: string;
  address?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

export interface BookedSession {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  activities: Array<{ id: number; name: string; duration: number }>;
  customActivities?: Array<{ name: string; duration: number; description?: string; equipment?: string }>;
  trainer?: { id: number; name: string; specialty?: string };
  trainerId?: number;
  trainerChoice?: boolean;
  notes?: string;
}

