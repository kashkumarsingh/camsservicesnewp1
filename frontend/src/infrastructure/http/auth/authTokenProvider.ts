/**
 * Auth Token Provider — single source of truth for auth token storage.
 *
 * All token read/write/clear must go through this module. Used by:
 * - AuthRepository (set after login/register, clear on logout)
 * - ApiClient (Authorization header)
 * - useAuth (clear on 401 / logout)
 * - LiveRefreshContext (Bearer token for WebSocket auth)
 *
 * Client: localStorage + cookie (cookie so SSR/RSC requests send it).
 * Server: read from request cookies via getAuthTokenFromCookies(cookieStore).
 */

const STORAGE_KEY = 'auth_token';
const COOKIE_NAME = 'auth_token';
/** Cookie max-age: 7 days. */
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Returns the current auth token or null. Client-only (reads localStorage, then cookie as fallback).
 * On the server use getAuthTokenFromCookies(cookieStore) in RSC/Route Handlers.
 */
export function getAuthToken(): string | null {
  if (!isBrowser()) return null;
  try {
    const fromStorage = window.localStorage.getItem(STORAGE_KEY);
    if (typeof fromStorage === 'string' && fromStorage.length > 0) return fromStorage;
    const fromCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${COOKIE_NAME}=`))
      ?.split('=')[1];
    if (typeof fromCookie === 'string' && fromCookie.length > 0) {
      const decoded = decodeURIComponent(fromCookie);
      if (decoded.length > 0) return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Read auth token from the current request's cookies (Server Components / Route Handlers).
 * Pass the result of `await cookies()` from `next/headers`.
 */
export function getAuthTokenFromCookies(
  cookieStore: { get: (name: string) => { value: string } | undefined }
): string | null {
  const cookie = cookieStore.get(COOKIE_NAME);
  const value = cookie?.value;
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/**
 * Stores the auth token in localStorage and sets the auth_token cookie (path=/, SameSite=Lax)
 * so SSR/RSC requests send it. Client-only.
 */
export function setAuthToken(token: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, token);
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax`;
  } catch {
    // Storage/cookie disabled — ignore
  }
}

/**
 * Removes the auth token from localStorage and clears the cookie. Client-only.
 */
export function clearAuthToken(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    // ignore
  }
}

/**
 * Whether a token is present (convenience for guards). Client-only.
 */
export function hasAuthToken(): boolean {
  const token = getAuthToken();
  return typeof token === 'string' && token.length > 0;
}
