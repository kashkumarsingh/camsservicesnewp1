/**
 * Format hours as a human-readable string
 * 
 * @param hrs - Hours as a decimal number (e.g., 11.033333333333333)
 * @returns Formatted string (e.g., "11h 2m" or "11h" or "2m")
 */
export function formatHours(hrs: number): string {
  const totalMinutes = Math.round(hrs * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/**
 * Format hours as a compact string (rounded to 1 decimal place)
 * 
 * @param hrs - Hours as a decimal number
 * @returns Formatted string (e.g., "11.0h" or "6.9h")
 */
export function formatHoursCompact(hrs: number): string {
  return `${hrs.toFixed(1)}h`;
}




