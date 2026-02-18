/**
 * Trainer availability by calendar dates – single source of truth for API contract.
 *
 * Backend: GetTrainerAvailabilityDatesAction / SetTrainerAvailabilityDatesAction
 * return this shape. Trainer and admin endpoints use the same contract.
 *
 * Use parseAvailabilityDatesPayload() to normalise raw API response into
 * TrainerAvailabilityDatesResult (camelCase, guaranteed arrays).
 */

/** Payload returned in response.data by trainer and admin availability-dates endpoints. */
export interface TrainerAvailabilityDatesPayload {
  dates: string[];
  unavailable_dates: string[];
}

/** Normalised result for frontend (trainer dashboard, admin panel). */
export interface TrainerAvailabilityDatesResult {
  availableDates: string[];
  unavailableDates: string[];
}

/**
 * Parse raw API response (data or unwrapped) into TrainerAvailabilityDatesResult.
 * Safe for missing/partial data.
 */
export function parseAvailabilityDatesPayload(
  data: { dates?: string[]; unavailable_dates?: string[] } | undefined | null
): TrainerAvailabilityDatesResult {
  const dates = data?.dates ?? [];
  const unavailableDates = data?.unavailable_dates ?? [];
  return {
    availableDates: Array.isArray(dates) ? dates : [],
    unavailableDates: Array.isArray(unavailableDates) ? unavailableDates : [],
  };
}
