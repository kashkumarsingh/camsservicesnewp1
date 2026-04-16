/**
 * LocalStorage Constants
 * 
 * Centralized definition of localStorage keys for all components.
 * This provides a single source of truth for localStorage keys,
 * making it easier to maintain and update storage keys across the application.
 * 
 * Plain English: This file contains all the localStorage keys in one place.
 * Instead of hardcoding localStorage keys in each component, we define them here
 * and import them. This makes it easier to:
 * - Change storage keys in one place
 * - See all available storage keys at a glance
 * - Avoid key conflicts and inconsistencies
 * - Update keys when needed
 * - Reuse storage keys across components
 */

/**
 * LocalStorage Keys
 * These define the keys used for storing data in localStorage
 */
export const LOCAL_STORAGE_KEYS = {
  // User Preferences
  USER_PREFERENCES: 'cams_user_preferences',
  
  // Session Builder
  AUTO_ADVANCE_NEXT_DAY: 'autoAdvanceNextDay',
  RECENT_ITINERARY_ADDRESSES: 'recentItineraryAddresses',
  
  // Dashboard - Today's Activities
  DISMISSED_COMPLETED_SESSIONS: 'dismissedCompletedSessions',
  DISMISSED_TODAY_ACTIVITIES: 'dismissedTodayActivities',
  
  // FAQ (if using localStorage repository)
  FAQ_ITEMS: 'faq_items',
} as const;

/**
 * Type-safe localStorage key getter
 * Ensures localStorage keys are accessed correctly
 */
export type LocalStorageKey = keyof typeof LOCAL_STORAGE_KEYS;

/**
 * Helper function to get localStorage value safely
 * @param key - The localStorage key
 * @returns The stored value or null if not found/invalid
 */
export function getLocalStorageItem(key: LocalStorageKey): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    return localStorage.getItem(LOCAL_STORAGE_KEYS[key]);
  } catch (error) {
    console.error(`Failed to get localStorage item for key: ${key}`, error);
    return null;
  }
}

/**
 * Helper function to set localStorage value safely
 * @param key - The localStorage key
 * @param value - The value to store
 */
export function setLocalStorageItem(key: LocalStorageKey, value: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS[key], value);
  } catch (error) {
    console.error(`Failed to set localStorage item for key: ${key}`, error);
  }
}

/**
 * Helper function to remove localStorage value safely
 * @param key - The localStorage key
 */
export function removeLocalStorageItem(key: LocalStorageKey): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEYS[key]);
  } catch (error) {
    console.error(`Failed to remove localStorage item for key: ${key}`, error);
  }
}
