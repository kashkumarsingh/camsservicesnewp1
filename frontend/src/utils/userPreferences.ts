/**
 * User Preferences Storage Utility
 * 
 * Clean Architecture Layer: Infrastructure (Utilities)
 * Purpose: Manages user preferences in localStorage for intelligent defaults
 */

export interface UserPreferences {
  preferredMode?: string | null;
  preferredActivities?: number[];
  preferredTrainers?: number[];
  preferredLocation?: {
    postcode?: string;
    address?: string;
    region?: string;
  };
  lastUpdated?: string;
}

const PREFERENCES_KEY = 'cams_user_preferences';

/**
 * Get user preferences from localStorage
 */
export function getUserPreferences(): UserPreferences | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored) as UserPreferences;
  } catch (error) {
    console.error('Failed to load user preferences:', error);
    return null;
  }
}

/**
 * Save user preferences to localStorage
 */
export function saveUserPreferences(preferences: Partial<UserPreferences>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const existing = getUserPreferences() || {};
    const updated: UserPreferences = {
      ...existing,
      ...preferences,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save user preferences:', error);
  }
}

/**
 * Update preferred mode
 */
export function updatePreferredMode(modeKey: string): void {
  saveUserPreferences({ preferredMode: modeKey });
}

/**
 * Update preferred activities
 */
export function updatePreferredActivities(activityIds: number[]): void {
  saveUserPreferences({ preferredActivities: activityIds });
}

/**
 * Update preferred location
 */
export function updatePreferredLocation(location: { postcode?: string; address?: string; region?: string }): void {
  saveUserPreferences({ preferredLocation: location });
}

/**
 * Clear all preferences
 */
export function clearUserPreferences(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(PREFERENCES_KEY);
}
