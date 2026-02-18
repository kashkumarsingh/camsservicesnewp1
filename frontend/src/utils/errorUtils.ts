/**
 * Error utilities for type-safe handling of unknown errors (e.g. from catch blocks).
 * Use instead of `err: any` and direct property access.
 */

import type { ApiError } from '@/infrastructure/http/ApiClient';

/**
 * Extract a user-facing message from an unknown error.
 * Prefers API response message, then Error.message, then fallback.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const apiErr = err as ApiError;
    const data = apiErr.response?.data;
    if (data && typeof data === 'object' && 'message' in data && typeof (data as { message: unknown }).message === 'string') {
      return (data as { message: string }).message;
    }
  }
  return fallback;
}

/**
 * Extract validation errors from an unknown API error (e.g. Laravel 422).
 * Returns a single string of concatenated messages, or null if none.
 */
export function getApiValidationErrors(err: unknown): string | null {
  if (typeof err !== 'object' || err === null || !('response' in err)) return null;
  const apiErr = err as ApiError;
  const data = apiErr.response?.data;
  if (!data || typeof data !== 'object' || !('errors' in data)) return null;
  const errors = (data as { errors?: Record<string, unknown> }).errors;
  if (!errors || typeof errors !== 'object') return null;
  const parts = Object.values(errors).flat().filter((m): m is string => typeof m === 'string');
  return parts.length > 0 ? parts.join(' ') : null;
}
