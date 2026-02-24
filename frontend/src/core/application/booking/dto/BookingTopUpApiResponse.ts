/**
 * API response for booking top-up (start payment).
 * Backend returns camelCase; type must match to avoid snake_case mistakes.
 */

export interface BookingTopUpApiResponse {
  checkoutUrl?: string | null;
  paymentIntentId?: string | null;
  paymentId?: number | null;
  amount?: number;
  hours?: number;
}
