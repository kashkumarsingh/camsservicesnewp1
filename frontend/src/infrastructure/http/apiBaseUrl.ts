/**
 * Single source of truth for API base URL resolution.
 * Used by ApiClient, getSiteSettings, and any code that needs the backend base URL.
 *
 * Env (no hostname or platform detection):
 * - Server: API_URL, then NEXT_SERVER_API_URL
 * - Client: NEXT_PUBLIC_API_URL, then NEXT_PUBLIC_API_BASE_URL
 *
 * Production: set API_URL and NEXT_PUBLIC_API_URL to the backend URL (e.g. Railway).
 * Docker: set API_URL=http://backend:80 (or your backend service host).
 * Local dev: set both in .env.local or rely on dev fallback (localhost:9080).
 */

declare const process: { env: Record<string, string | undefined> } | undefined;

/** Default when no env is set — development only. Production must set API_URL / NEXT_PUBLIC_API_URL. */
const DEFAULT_DEV_API_BASE = 'http://localhost:9080';

/**
 * Server API base. Literal process.env.API_URL / NEXT_SERVER_API_URL so bundler can inline.
 */
function getServerBase(): string {
  if (typeof process === 'undefined' || !process.env) return '';
  const u = process.env.API_URL || process.env.NEXT_SERVER_API_URL || '';
  return (typeof u === 'string' ? u : '').trim();
}

/**
 * Client API base. Literal process.env.NEXT_PUBLIC_* is required so Next.js inlines
 * these into the client bundle at build time; dynamic process.env[key] returns undefined.
 */
function getClientBase(): string {
  if (typeof process === 'undefined' || !process.env) return '';
  const u = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
  return (typeof u === 'string' ? u : '').trim();
}

/**
 * Ensures the base URL ends with /api/v1 (Laravel API prefix).
 * Accepts origin-only (e.g. http://localhost:9080) or full base (http://localhost:9080/api/v1).
 */
export function ensureApiV1Suffix(url: string): string {
  if (!url || !url.startsWith('http')) return url;
  const trimmed = url.replace(/\/$/, '');
  if (trimmed.endsWith('/api/v1')) return trimmed;
  return `${trimmed}/api/v1`;
}

export interface GetApiBaseUrlOptions {
  /** true when running in Node (SSR/server); false in the browser. */
  serverSide: boolean;
}

/**
 * Resolves the backend API base URL (with /api/v1) from env.
 * Uses literal env keys so Next.js can inline NEXT_PUBLIC_* on the client.
 */
export function getApiBaseUrl(options: GetApiBaseUrlOptions): string {
  const raw = options.serverSide ? getServerBase() : getClientBase();
  if (raw) return ensureApiV1Suffix(raw);
  const isDev = typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production';
  if (isDev) return ensureApiV1Suffix(DEFAULT_DEV_API_BASE);
  return ensureApiV1Suffix(DEFAULT_DEV_API_BASE);
}
