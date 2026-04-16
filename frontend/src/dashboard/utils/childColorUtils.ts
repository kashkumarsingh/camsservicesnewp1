/**
 * Centralised child colour palette and helper.
 *
 * Single source of truth for all child colour coding across:
 * - Parent dashboard (sidebar, calendar, filter)
 * - Trainer dashboard (calendar)
 * - Buy Hours modal and any other child lists
 *
 * Same childId always gets the same colour (deterministic, Google Calendar–style).
 * Hex values live in themeColors.ts; this module re-exports and provides getChildColor.
 */

import { themeColors } from '@/shared/utils/themeColors';

export const CHILD_COLOR_FALLBACK = themeColors.childColorFallback;

export const CHILD_COLORS: readonly string[] = themeColors.childColors;

/**
 * Returns a stable colour for a child by ID. Same childId always gets the same colour.
 */
export function getChildColor(childId: number): string {
  const colors = themeColors.childColors;
  const index = childId % colors.length;
  return colors[index] ?? themeColors.childColorFallback;
}
