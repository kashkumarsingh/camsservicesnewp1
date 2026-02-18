/**
 * Centralised child colour palette and helper.
 *
 * Single source of truth for all child colour coding across:
 * - Parent dashboard (sidebar, calendar, filter)
 * - Trainer dashboard (calendar)
 * - Buy Hours modal and any other child lists
 *
 * Same childId always gets the same colour (deterministic, Google Calendar–style).
 * No local copies, temporary palettes, or patch workarounds — import from here only.
 */

export const CHILD_COLOR_FALLBACK = '#9E9E9E';

export const CHILD_COLORS = [
  '#4285F4', // Blue
  '#34A853', // Green
  '#FBBC04', // Yellow/Amber
  '#EA4335', // Red
  '#9C27B0', // Purple
  '#FF9800', // Orange
  '#00BCD4', // Cyan
  '#795548', // Brown
] as const;

/**
 * Returns a stable colour for a child by ID. Same childId always gets the same colour.
 */
export function getChildColor(childId: number): string {
  const index = childId % CHILD_COLORS.length;
  return CHILD_COLORS[index] ?? CHILD_COLOR_FALLBACK;
}
