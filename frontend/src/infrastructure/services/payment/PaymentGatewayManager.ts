/**
 * Payment Gateway Manager
 *
 * Clean Architecture: Infrastructure Layer (Payment Gateway Facade)
 * Purpose: Single entry point for payment gateway operations (Stripe today; extensible).
 *
 * - Loads Stripe with retry and ad-blocker resilience
 * - Creates payment intents via backend (ApiPaymentService)
 * - Centralised payment error reporting (suppresses known Stripe analytics noise only)
 *
 * Use this instead of patching console or duplicating Stripe load logic in UI components.
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { ApiPaymentService } from './ApiPaymentService';

const STRIPE_NOISE_PATTERNS = [
  'r.stripe.com/b',
  'ERR_BLOCKED_BY_CLIENT',
];

function isStripeNoise(message: string): boolean {
  if (message.includes('Failed to fetch') && message.includes('stripe.com')) return true;
  return STRIPE_NOISE_PATTERNS.some((p) => message.includes(p));
}

function serialisableError(arg: unknown): unknown {
  if (arg instanceof Error) {
    const err = arg as Error & { response?: { data?: unknown; status?: number } };
    return {
      message: err.message,
      ...(err.stack && { stack: err.stack }),
      ...(err.response && {
        response: { status: err.response?.status, data: err.response?.data },
      }),
    };
  }
  if (arg && typeof arg === 'object' && 'message' in arg && typeof (arg as { message: unknown }).message === 'string') {
    const obj = arg as { message: string; stack?: string; response?: { data?: unknown; status?: number } };
    return {
      message: obj.message,
      ...(obj.stack && { stack: obj.stack }),
      ...(obj.response && { response: { status: obj.response?.status, data: obj.response?.data } }),
    };
  }
  return arg;
}

/**
 * Report a payment-related error. Suppresses known Stripe analytics noise.
 */
export function reportPaymentError(error: unknown, context?: string): void {
  const message = error instanceof Error ? error.message : typeof error === 'object' && error !== null && 'message' in error ? String((error as { message: unknown }).message) : String(error);
  if (isStripeNoise(message)) return;
  const serialised = serialisableError(error);
  const prefix = context ? `[PaymentGateway] ${context}:` : '[PaymentGateway]';
  try {
    console.error(prefix, serialised);
  } catch {
    console.error(prefix, message);
  }
}

async function loadStripeWithRetry(
  stripePublicKey: string,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<Stripe | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const stripe = await loadStripe(stripePublicKey);
      if (stripe) return stripe;
    } catch {
      if (attempt === maxRetries) return null;
      await new Promise((r) => setTimeout(r, delay * Math.pow(2, attempt - 1)));
    }
  }
  return null;
}

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe instance (lazy load with retry).
 */
export function getStripeInstance(): Promise<Stripe | null> {
  if (stripePromise !== null) return stripePromise;
  const key = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
  if (!key || key.trim() === '') {
    if (typeof window !== 'undefined') {
      console.warn('[PaymentGateway] NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not set.');
    }
    stripePromise = Promise.resolve(null);
    return stripePromise;
  }
  stripePromise = loadStripeWithRetry(key);
  return stripePromise;
}

export interface CreatePaymentIntentResult {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  checkoutUrl?: string;
  error?: string;
}

/**
 * Create a payment intent for a booking.
 */
export async function createPaymentIntent(
  bookingId: string,
  amount: number,
  currency: string = 'GBP',
  paymentMethod: string = 'stripe'
): Promise<CreatePaymentIntentResult> {
  return ApiPaymentService.createPaymentIntent(bookingId, amount, currency, paymentMethod);
}

export const PaymentGatewayManager = {
  getStripe: getStripeInstance,
  createPaymentIntent,
  reportError: reportPaymentError,
};
