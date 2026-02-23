/**
 * ApiClient
 *
 * All configuration comes from environment variables — no hardcoded URLs.
 *
 * .env.local (local dev):
 *   NEXT_PUBLIC_API_URL=http://localhost:9080/api/v1   ← browser requests
 *   API_URL=http://localhost:9080/api/v1               ← SSR requests
 *
 * .env.production (or Railway / Vercel env vars):
 *   NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api/v1
 *   API_URL=https://your-backend.up.railway.app/api/v1
 *
 * Rules:
 *  - NEXT_PUBLIC_API_URL  → used in the browser (inlined at build time by Next.js)
 *  - API_URL              → used server-side (SSR / Server Components / middleware)
 *  - Both must be the backend URL (not the frontend origin), or auth will fail.
 *  - Both must end with /api/v1 (the Laravel API prefix)
 *  - Never hardcode hostnames here. If a URL is wrong, fix the env var, not this file.
 *  - Base URL resolution (including dev fallback) is delegated to getApiBaseUrl (apiBaseUrl.ts).
 */

import {
  getAuthToken as getAuthTokenFromProvider,
  getAuthTokenFromCookies,
} from './auth/authTokenProvider';
import { getApiBaseUrl } from './apiBaseUrl';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  code?: string;
  response?: {
    status: number;
    statusText?: string;
    data?: unknown;
  };
  config?: {
    url?: string;
    method?: string;
  };
}

export interface PaginationMeta {
  currentPage?: number;
  lastPage?: number;
  perPage?: number;
  total?: number;
  hasMore?: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta & {
    timestamp?: string;
    version?: string;
    requestId?: string;
    count?: number;
  };
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  meta?: PaginationMeta;
}

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  getAuthToken?: () => string | null;
  onError?: (error: ApiError) => void;
}

export type ApiRequestOptions = RequestInit & {
  /** Per-request timeout override (ms) */
  timeout?: number;
  /** Query string params for GET requests */
  params?: Record<string, string>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function env(key: string, defaultValue = ''): string {
  try {
    if (typeof process === 'undefined' || !process.env) return defaultValue;
    const p = process.env;
    const val =
      key === 'NODE_ENV'
        ? p.NODE_ENV
        : key === 'NEXT_PUBLIC_API_TIMEOUT'
          ? p.NEXT_PUBLIC_API_TIMEOUT
          : key === 'NEXT_PUBLIC_API_RETRIES'
            ? p.NEXT_PUBLIC_API_RETRIES
            : (p as Record<string, string | undefined>)[key];
    return typeof val === 'string' && val.length > 0 ? val : defaultValue;
  } catch {
    return defaultValue;
  }
}

/** Normalise a base URL — always ends with /api/v1, never a trailing slash. */
function normalise(url: string): string {
  if (!url) return '';
  const trimmed = url.replace(/\/+$/, '');
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
}

// ─── ApiClient ────────────────────────────────────────────────────────────────

export class ApiClient {
  private readonly baseURL: string;
  private readonly timeout: number;
  private readonly retries: number;
  private readonly retryDelay: number;
  private readonly getAuthToken?: () => string | null;
  private readonly onError?: (error: ApiError) => void;

  constructor(config: ApiClientConfig = {}) {
    const isServer = typeof window === 'undefined';
    let baseURL = config.baseURL ? normalise(config.baseURL) : getApiBaseUrl({ serverSide: isServer });
    if (!baseURL && !isServer && env('NODE_ENV') === 'development') {
      baseURL = normalise('http://localhost:9080');
    }
    this.baseURL = baseURL;

    if (!this.baseURL) {
      const varNames = isServer
        ? 'API_URL (or NEXT_SERVER_API_URL)'
        : 'NEXT_PUBLIC_API_URL (or NEXT_PUBLIC_API_BASE_URL)';
      console.error(
        `[ApiClient] No base URL configured. Set ${varNames} in your .env.local / environment.`
      );
    }

    if (env('NODE_ENV') === 'development') {
      console.log('[ApiClient] initialised', {
        isServer,
        baseURL: this.baseURL || '(not configured — check env vars)',
      });
    }

    this.timeout = config.timeout ?? 15_000;
    this.retries = config.retries ?? 1;
    this.retryDelay = config.retryDelay ?? 500;
    this.getAuthToken = config.getAuthToken;
    this.onError = config.onError;
  }

  /** Backend origin without the /api/v1 suffix — used for Sanctum CSRF calls. */
  getBaseOrigin(): string {
    return this.baseURL.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private authHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.getAuthToken) {
      const token = this.getAuthToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    if (typeof document !== 'undefined') {
      const csrf = document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.content;
      if (csrf) headers['X-CSRF-TOKEN'] = csrf;
    }

    return headers;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            Object.assign(new Error('Request timeout'), { code: 'TIMEOUT' })
          ),
        ms
      )
    );
  }

  // ─── Core request ───────────────────────────────────────────────────────────

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: ApiRequestOptions,
    attempt = 0
  ): Promise<{ data: T }> {
    const { timeout: perRequestTimeout, params, ...fetchOptions } =
      options ?? {};
    const timeoutMs = perRequestTimeout ?? this.timeout;
    const isFormData = body instanceof FormData;
    const isDev = env('NODE_ENV') === 'development';

    let url = `${this.baseURL}${path}`;
    if (
      method.toUpperCase() === 'GET' &&
      params &&
      Object.keys(params).length
    ) {
      url +=
        (path.includes('?') ? '&' : '?') +
        new URLSearchParams(params).toString();
    }

    if (isDev) {
      console.log(`[ApiClient] ${method.toUpperCase()} ${url}`);
    }

    const hasNextCache =
      fetchOptions != null &&
      'next' in fetchOptions &&
      (fetchOptions as { next?: unknown }).next != null;

    const init: RequestInit = {
      method,
      credentials: 'include',
      ...(hasNextCache ? {} : { cache: 'no-store' as RequestCache }),
      headers: {
        Accept: 'application/json',
        ...this.authHeaders(),
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...fetchOptions?.headers,
      },
      ...fetchOptions,
      ...(body != null
        ? { body: isFormData ? body : JSON.stringify(body) }
        : {}),
    };

    try {
      const response = await Promise.race([
        fetch(url, init),
        this.timeoutPromise(timeoutMs),
      ]);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));

        if (isDev) {
          console.warn(
            `[ApiClient] ${method.toUpperCase()} ${url} → ${response.status}`,
            errorData
          );
        }

        const apiError: ApiError = {
          message:
            (errorData as { message?: string }).message ??
            (errorData as { error?: string }).error ??
            response.statusText,
          code:
            (errorData as { errorCode?: string }).errorCode ??
            (errorData as { code?: string }).code,
          response: {
            status: response.status,
            statusText: response.statusText,
            data: errorData,
          },
          config: { url, method: method.toUpperCase() },
        };

        this.onError?.(apiError);

        if (response.status >= 500 && attempt < this.retries) {
          await this.sleep(this.retryDelay * (attempt + 1));
          return this.request<T>(method, path, body, options, attempt + 1);
        }

        throw apiError;
      }

      if (response.status === 204) return { data: undefined as T };

      const json = await response.json();

      if (json && typeof json === 'object' && 'data' in json) {
        const isPaginated =
          'meta' in json &&
          json.meta &&
          typeof json.meta === 'object' &&
          ('count' in json.meta ||
            'total' in json.meta ||
            'total_count' in json.meta ||
            'limit' in json.meta);

        // Nested shape so existing callers (response.data.data / response.data.meta) keep working
        if (isPaginated) {
          return {
            data: { data: json.data, meta: json.meta } as T,
          };
        }
        return { data: json.data as T };
      }

      return { data: json as T };
    } catch (err: unknown) {
      const error = err as {
        message?: string;
        name?: string;
        code?: string;
        response?: unknown;
      };

      if (error?.response !== undefined) throw err;

      if (error?.code === 'TIMEOUT') {
        const timeoutError: ApiError = {
          message: 'Request timeout — the server took too long to respond.',
          code: 'TIMEOUT',
          config: { url, method: method.toUpperCase() },
        };
        this.onError?.(timeoutError);
        throw timeoutError;
      }

      const isNetwork =
        err instanceof TypeError ||
        error?.message === 'Failed to fetch' ||
        error?.name === 'TypeError';

      if (isNetwork && attempt < this.retries) {
        await this.sleep(this.retryDelay * (attempt + 1));
        return this.request<T>(method, path, body, options, attempt + 1);
      }

      const networkError: ApiError = {
        message:
          error?.message ?? 'Network error — unable to connect to server.',
        code: 'NETWORK_ERROR',
        config: { url, method: method.toUpperCase() },
      };

      if (isDev) {
        console.error(
          '[ApiClient] Network error:',
          networkError.message,
          '|',
          url
        );
      }

      this.onError?.(networkError);
      throw networkError;
    }
  }

  // ─── Public HTTP methods ─────────────────────────────────────────────────────

  get<T>(path: string, options?: ApiRequestOptions) {
    return this.request<T>('GET', path, undefined, options);
  }

  post<T>(path: string, data?: unknown, options?: ApiRequestOptions) {
    return this.request<T>('POST', path, data, options);
  }

  put<T>(path: string, data?: unknown, options?: ApiRequestOptions) {
    return this.request<T>('PUT', path, data, options);
  }

  patch<T>(path: string, data?: unknown, options?: ApiRequestOptions) {
    return this.request<T>('PATCH', path, data, options);
  }

  delete<T>(path: string, options?: ApiRequestOptions) {
    return this.request<T>('DELETE', path, undefined, options);
  }
}

// ─── Error handler ────────────────────────────────────────────────────────────

function handleApiError(error: ApiError): void {
  if (env('NODE_ENV') !== 'development') return;

  const status = error.response?.status;
  const isClientError = status != null && status >= 400 && status < 500;
  const log = isClientError ? console.warn : console.error;

  log(
    `[ApiClient] ${error.config?.method ?? 'REQUEST'} ${error.config?.url ?? ''}`,
    `→ ${error.message}`,
    error.response?.data ?? ''
  );
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const apiClient = new ApiClient({
  timeout: parseInt(env('NEXT_PUBLIC_API_TIMEOUT', '15000'), 10),
  retries: parseInt(env('NEXT_PUBLIC_API_RETRIES', '1'), 10),
  retryDelay: 500,
  getAuthToken: getAuthTokenFromProvider,
  onError: handleApiError,
});

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}

/**
 * Create an ApiClient for Server Components / Route Handlers that reads the auth token
 * from the request cookies. Pass the result of `await cookies()` from `next/headers`.
 * Use this whenever you make authenticated API calls on the server (RSC or API route).
 */
export function createServerApiClient(
  cookieStore: { get: (name: string) => { value: string } | undefined }
): ApiClient {
  return new ApiClient({
    getAuthToken: () => getAuthTokenFromCookies(cookieStore),
  });
}

export type RequestOptions = ApiRequestOptions;
