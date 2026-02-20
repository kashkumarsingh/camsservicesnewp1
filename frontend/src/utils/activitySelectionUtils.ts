/**
 * Activity Selection Utilities
 * 
 * Clean Architecture: Utils Layer
 * Purpose: Utilities for detecting and displaying activity selection types
 * Location: frontend/src/utils/activitySelectionUtils.ts
 * 
 * Handles three activity selection types:
 * 1. 'standard' - Parent selected specific activities from database
 * 2. 'trainer_choice' - Trainer decides activities on the day
 * 3. 'custom' - Parent specified a custom activity description
 */

/** Activity selection type */
export type ActivitySelectionType = 'standard' | 'trainer_choice' | 'custom';

/** Prefix used when storing custom activity in notes */
export const CUSTOM_ACTIVITY_PREFIX = 'Custom Activity:';

/** Result of parsing activity selection from session data */
export interface ActivitySelectionInfo {
  type: ActivitySelectionType;
  /** Activity names (for standard type) */
  activities: string[];
  /** Custom activity description (for custom type) */
  customActivityDescription?: string;
  /** Display text for UI */
  displayText: string;
  /** Icon for UI (emoji) */
  icon: string;
}

/**
 * Detects the activity selection type from session data
 * 
 * Logic:
 * 1. If activities array has items -> 'standard'
 * 2. If notes contain "Custom Activity:" prefix -> 'custom'
 * 3. Otherwise -> 'trainer_choice'
 * 
 * @param activities - Array of activity names/objects
 * @param notes - Session notes
 * @param durationHours - Duration in hours (for display)
 * @returns ActivitySelectionInfo with type, display text, and icon
 */
export function detectActivitySelection(
  activities: Array<string | { name: string; [key: string]: unknown }> | undefined,
  notes: string | undefined,
  durationHours?: number
): ActivitySelectionInfo {
  // Normalise activities to string array
  const activityNames = normaliseActivitiesToNames(activities);
  
  // Check for standard activities
  if (activityNames.length > 0) {
    return {
      type: 'standard',
      activities: activityNames,
      displayText: formatActivitiesDisplay(activityNames),
      icon: '🏃',
    };
  }
  
  // Check for custom activity in notes
  const customActivity = parseCustomActivityFromNotes(notes);
  if (customActivity) {
    const durationText = durationHours ? ` (${formatDuration(durationHours)})` : '';
    return {
      type: 'custom',
      activities: [],
      customActivityDescription: customActivity,
      displayText: `📝 ${customActivity}${durationText}`,
      icon: '📝',
    };
  }
  
  // Default to trainer's choice
  const durationText = durationHours ? ` (${formatDuration(durationHours)})` : '';
  return {
    type: 'trainer_choice',
    activities: [],
    displayText: `🎯 Trainer's Choice${durationText}`,
    icon: '🎯',
  };
}

/**
 * Normalises activities to an array of names
 * Handles both string arrays and object arrays with 'name' property
 */
export function normaliseActivitiesToNames(
  activities: Array<string | { name: string; [key: string]: unknown }> | undefined
): string[] {
  if (!activities || activities.length === 0) {
    return [];
  }
  
  return activities.map(activity => {
    if (typeof activity === 'string') {
      return activity;
    }
    return activity.name || '';
  }).filter(name => name.length > 0);
}

/**
 * Parses custom activity description from notes
 * Looks for "Custom Activity: {description}" pattern
 *
 * @param notes - Session notes
 * @returns Custom activity description or undefined
 */
export function parseCustomActivityFromNotes(notes: string | undefined): string | undefined {
  if (!notes) {
    return undefined;
  }

  // Look for "Custom Activity: {description}" pattern
  // Can be at start of notes or on its own line
  const lines = notes.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith(CUSTOM_ACTIVITY_PREFIX)) {
      const description = trimmedLine.substring(CUSTOM_ACTIVITY_PREFIX.length).trim();
      if (description.length > 0) {
        return description;
      }
    }
  }

  return undefined;
}

/**
 * Parses all custom activity lines from notes (e.g. "Custom Activity: name (1h)").
 * Returns array of { name, duration } for use in edit pre-fill.
 */
export function parseAllCustomActivitiesFromNotes(
  notes: string | undefined
): Array<{ name: string; duration: number }> {
  if (!notes) return [];
  const result: Array<{ name: string; duration: number }> = [];
  const lines = notes.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine.startsWith(CUSTOM_ACTIVITY_PREFIX)) continue;
    const description = trimmedLine.substring(CUSTOM_ACTIVITY_PREFIX.length).trim();
    if (!description.length) continue;
    // Match "name (1h)" or "name (1.5h)" -> { name, duration }
    const match = description.match(/^(.+?)\s*\((\d+(?:\.\d+)?)\s*h\)\s*$/i);
    if (match) {
      result.push({ name: match[1].trim(), duration: parseFloat(match[2]) || 1 });
    } else {
      result.push({ name: description, duration: 1 });
    }
  }
  return result;
}

/**
 * Formats activities array for display
 * Shows first 2 activities, then "+X" for remaining
 * 
 * @param activities - Array of activity names
 * @param maxDisplay - Maximum number to show before "+X" (default: 2)
 * @returns Formatted display string
 */
export function formatActivitiesDisplay(
  activities: string[],
  maxDisplay: number = 2
): string {
  if (activities.length === 0) {
    return '';
  }
  
  if (activities.length <= maxDisplay) {
    return activities.join(', ');
  }
  
  const displayed = activities.slice(0, maxDisplay);
  const remaining = activities.length - maxDisplay;
  return `${displayed.join(', ')} +${remaining}`;
}

/**
 * Formats duration for display (hours)
 *
 * @param hours - Duration in hours
 * @returns Formatted string like "3h" or "3.5h"
 */
export function formatDuration(hours: number): string {
  if (hours === Math.floor(hours)) {
    return `${hours}h`;
  }
  return `${hours.toFixed(1)}h`;
}

/**
 * Formats duration in minutes for parent-facing display (e.g. calendar).
 * Prefers hours when >= 60 min so "360min" shows as "6h".
 *
 * @param minutes - Duration in minutes
 * @returns "45m", "6h", "1.5h", etc.
 */
export function formatDurationMinutesForDisplay(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = minutes / 60;
  if (hours === Math.floor(hours)) {
    return `${hours}h`;
  }
  return `${hours.toFixed(1)}h`;
}

/**
 * Creates notes with custom activity prefix
 * Used when saving a custom activity
 * 
 * @param customActivity - Custom activity description
 * @param additionalNotes - Any additional notes to include
 * @returns Formatted notes string
 */
export function createCustomActivityNotes(
  customActivity: string,
  additionalNotes?: string
): string {
  const customLine = `${CUSTOM_ACTIVITY_PREFIX} ${customActivity}`;
  
  if (additionalNotes && additionalNotes.trim().length > 0) {
    return `${customLine}\n\n${additionalNotes}`;
  }
  
  return customLine;
}

/**
 * Removes custom activity prefix from notes
 * Used when switching from custom to another activity type
 * 
 * @param notes - Session notes
 * @returns Notes without custom activity prefix
 */
export function removeCustomActivityFromNotes(notes: string | undefined): string {
  if (!notes) {
    return '';
  }
  
  const lines = notes.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmedLine = line.trim();
    return !trimmedLine.startsWith(CUSTOM_ACTIVITY_PREFIX);
  });
  
  return filteredLines.join('\n').trim();
}

/**
 * Gets the appropriate badge variant based on activity selection type
 * For use with status badges
 */
export function getActivityBadgeVariant(type: ActivitySelectionType): 'default' | 'secondary' | 'outline' {
  switch (type) {
    case 'trainer_choice':
      return 'secondary';
    case 'custom':
      return 'outline';
    default:
      return 'default';
  }
}

/**
 * Calculates session duration from start and end times
 * 
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @returns Duration in hours
 */
export function calculateDurationFromTimes(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;
  // Handle sessions that span to next day
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }
  return (endMinutes - startMinutes) / 60;
}
