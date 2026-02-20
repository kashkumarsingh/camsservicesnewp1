/**
 * API Client
 * Centralized HTTP client for making API requests to Laravel backend.
 *
 * Contract: See API_RESPONSE_CONTRACT.md (repo root). Backend returns
 * { success, data, meta }; this client unwraps so callers receive `data` only
 * (or { data, meta } for collection/paginated). All response keys are camelCase.
 *
 * Features:
 * - Automatic authentication token handling
 * - Retry logic for failed requests
 * - Comprehensive error handling
 * - Request/response interceptors
 * - Type-safe responses
 */

// Type declaration for Node.js process (available in Next.js runtime)
declare const process: {
  env: Record<string, string | undefined>;
} | undefined;

export interface ApiError {
  response?: {
    status: number;
    statusText?: string;
    data?: unknown;
  };
  message: string;
  code?: string;
  config?: {
    url?: string;
    method?: string;
  };
}

/**
 * Backend envelope shape (before unwrap). All API responses use this.
 * Key conversion and unwrap are centralised: backend BaseApiController::keysToCamelCase(),
 * frontend ApiClient request().
 */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta & { timestamp?: string; version?: string; requestId?: string; count?: number };
}

/** Pagination meta from backend (camelCase). See BaseApiController::paginatedResponse(). */
export interface PaginationMeta {
  currentPage?: number;
  lastPage?: number;
  perPage?: number;
  total?: number;
  hasMore?: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
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

/** Request options extended with optional per-request timeout (ms) and GET query params. */
export type ApiRequestOptions = RequestInit & {
  timeout?: number;
  /** Query string params for GET requests (appended to URL). */
  params?: Record<string, string>;
};

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;
  private getAuthToken?: () => string | null;
  private onError?: (error: ApiError) => void;

  constructor(config: ApiClientConfig = {}) {
    // For server-side (Next.js SSR), use Docker service name
    // For client-side (browser), use NEXT_PUBLIC_API_URL
    const isServerSide = typeof window === 'undefined';
    
    // Get environment variables safely
    // NOTE: NEXT_PUBLIC_* variables are replaced at BUILD TIME by Next.js
    // If not set during build, they will be undefined at runtime
    const getEnvVar = (key: string, defaultValue: string): string => {
      // In browser, process.env is replaced by Next.js at build time
      // In Node.js (SSR), process.env is available at runtime
      if (isServerSide) {
        // Server-side: read from process.env at runtime
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
          return process.env[key] as string;
        }
      } else {
        // Client-side: NEXT_PUBLIC_* vars are replaced at build time
        // Access via globalThis to avoid TypeScript errors
        const env = (globalThis as { __NEXT_DATA__?: { env?: Record<string, string> } }).__NEXT_DATA__?.env ?? {};
        if (env[key]) {
          return env[key];
        }
        // Fallback: try process.env (will be replaced by Next.js if set during build)
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
          return process.env[key] as string;
        }
      }
      return defaultValue;
    };
    
    // Runtime fallback: Detect environment and use correct backend URL
    const getRuntimeFallback = (): string | null => {
      if (isServerSide) {
        // Server-side: Check for Docker environment first
        if (typeof process !== 'undefined' && process.env) {
          const nodeEnv = process.env.NODE_ENV || 'development';
          const hostname = process.env.HOSTNAME || '';
          
          // Docker Compose: use service name for internal communication
          // Docker sets HOSTNAME to container name (e.g., kidzrunz-frontend)
          const isDocker = hostname.includes('kidzrunz') || process.env.DOCKER === 'true';
          if (isDocker && nodeEnv === 'development') {
            return 'http://backend:80/api/v1'; // Use Docker service name
          }
          
          // Local development (not in Docker): use localhost
          if (nodeEnv === 'development' || process.env.LOCAL_DEV === 'true') {
            return 'http://localhost:9080/api/v1';
          }
          
          // Render.com production
          const renderUrl = process.env.RENDER_EXTERNAL_URL;
          if (renderUrl && renderUrl.includes('onrender.com')) {
            return 'https://cams-backend-oj5x.onrender.com/api/v1';
          }
        }
      } else {
        // Client-side: Check window.location
        if (typeof window !== 'undefined' && window.location) {
          const hostname = window.location.hostname;
          const origin = window.location.origin;
          // Local development: localhost, 127.0.0.1, or local IP
          if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
            return 'http://localhost:9080/api/v1';
          }
          // Render.com production: Extract backend domain from current URL and use matching backend
          if (origin.includes('onrender.com')) {
            // Example: cams-frontend-xxxx.onrender.com → cams-backend-xxxx.onrender.com
            // This is more robust than hardcoding the backend URL
            const parts = hostname.split('-');
            if (parts.length >= 2 && parts[parts.length - 1].includes('onrender')) {
              // Replace 'frontend' with 'backend' in the domain
              const backendHost = hostname.replace('cams-frontend', 'cams-backend');
              return `https://${backendHost}/api/v1`;
            }
            // Fallback to hardcoded URL if pattern doesn't match
            return 'https://cams-backend-oj5x.onrender.com/api/v1';
          }
        }
      }
      return null;
    };
    
    const clientApiUrl = getEnvVar('NEXT_PUBLIC_API_URL', '');
    const serverApiUrl = getEnvVar('API_URL', '');
    
    // Ensure base URL always ends with /api/v1 (Laravel API prefix). If env is origin-only (e.g. http://localhost:9080), append it.
    const ensureApiV1Base = (url: string): string => {
      if (!url || !url.startsWith('http')) {
        return url;
      }
      const trimmed = url.replace(/\/$/, '');
      if (trimmed.endsWith('/api/v1')) {
        return trimmed;
      }
      return `${trimmed}/api/v1`;
    };

    // Use runtime fallback if env vars are not set
    const runtimeFallback = getRuntimeFallback();
    // Default: Docker service name for server-side in Docker, localhost for client-side
    const defaultServerUrl = runtimeFallback || 'http://backend:80/api/v1'; // Docker service name
    const defaultClientUrl = runtimeFallback || 'http://localhost:9080/api/v1'; // Browser uses localhost
    let finalClientUrl = ensureApiV1Base(clientApiUrl || runtimeFallback || defaultClientUrl);
    const finalServerUrl = ensureApiV1Base(serverApiUrl || runtimeFallback || defaultServerUrl);

    // In the browser in development, use same-origin /api/v1 so Next.js rewrites proxy to the backend (avoids CORS)
    const nodeEnvForProxy = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) || 'production';
    if (!isServerSide && nodeEnvForProxy === 'development' && typeof window !== 'undefined' && window.location?.origin) {
      finalClientUrl = `${window.location.origin}/api/v1`;
    }

    this.baseURL = config.baseURL ? ensureApiV1Base(config.baseURL) : (isServerSide ? finalServerUrl : finalClientUrl);
    
    // Log the resolved baseURL for debugging (only in development)
    // Safely check process.env to avoid TypeScript errors
    const nodeEnv = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) || 'production';
    if (nodeEnv === 'development' || !isServerSide) {
      console.log('[ApiClient] Resolved baseURL:', this.baseURL, {
        isServerSide,
        clientApiUrl: clientApiUrl || '(not set)',
        serverApiUrl: serverApiUrl || '(not set)',
        runtimeFallback: runtimeFallback || '(not used)',
        configBaseURL: config.baseURL || '(not set)',
        finalBaseURL: this.baseURL,
      });
    }
    // Increased timeout to handle slow backend responses during startup
    // Backend can take 5-10 seconds to respond initially, then speeds up
    this.timeout = config.timeout || 10000; // 10 seconds - allows backend to respond
    this.retries = config.retries || 1; // 1 retry - fail fast after timeout
    this.retryDelay = config.retryDelay || 500; // Faster retry delay
    this.getAuthToken = config.getAuthToken;
    this.onError = config.onError;
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    // Add Bearer token if available
    if (this.getAuthToken) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Add CSRF token for Laravel (if available)
    if (typeof document !== 'undefined') {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (csrfToken) {
        headers['X-CSRF-TOKEN'] = csrfToken;
      }
    }

    return headers;
  }

  /**
   * Create timeout promise
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    });
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make HTTP request with retry logic
   */
  private async request<T>(
    method: string,
    url: string,
    data?: unknown,
    options?: ApiRequestOptions,
    attempt: number = 0
  ): Promise<{ data: T }> {
    try {
      // Check if data is FormData (for file uploads)
      const isFormData = data instanceof FormData;

      // Per-request timeout (for large payloads e.g. rich-text page updates)
      const timeoutMs: number = (options && typeof (options as ApiRequestOptions).timeout === 'number'
        ? (options as ApiRequestOptions).timeout
        : this.timeout) ?? 30000;
      const { timeout: _omit, params: _params, ...fetchOptions } = options || {};

      // For GET, append params to URL (fetch does not send query params from a separate object)
      let fullUrl = `${this.baseURL}${url}`;
      if (method.toUpperCase() === 'GET' && _params && typeof _params === 'object' && Object.keys(_params).length > 0) {
        const search = new URLSearchParams(_params as Record<string, string>).toString();
        fullUrl += (url.includes('?') ? '&' : '?') + search;
      }

      // When caller passes Next.js cache options (next.revalidate/tags), do not set cache so ISR works
      const hasNextCacheOptions = fetchOptions && 'next' in fetchOptions && (fetchOptions as RequestInit & { next?: unknown }).next != null;
      const config: RequestInit = {
        method,
        // Avoid browser cache for client/dashboard; server calls with next.revalidate use Next.js caching
        ...(hasNextCacheOptions ? {} : { cache: 'no-store' as RequestCache }),
        // Send cookies for cross-origin requests (e.g. localhost:3000 → localhost:9080) so Sanctum can authenticate
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          ...this.getAuthHeaders(),
          // Don't set Content-Type for FormData - browser sets it with boundary
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          ...fetchOptions?.headers,
        },
        ...fetchOptions,
      };

      if (data) {
        // Don't stringify FormData - send as-is
        config.body = isFormData ? data : JSON.stringify(data);
      }

      const methodUpper = method.toUpperCase();

      // Development-only: log every API request URL for debugging 404s
      const nodeEnv = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) || 'production';
      if (nodeEnv === 'development') {
        console.log(`[ApiClient] ${methodUpper} ${fullUrl}`);
      }

      const requestPromise = fetch(fullUrl, config);
      const timeoutPromise = this.createTimeoutPromise(timeoutMs);

      const response = await Promise.race([requestPromise, timeoutPromise]);

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.statusText
        }));

        // Development-only: log exact URL and status for debugging 404s
        if (nodeEnv === 'development') {
          console.warn(
            `[ApiClient] ${methodUpper} ${fullUrl} -> ${response.status}`,
            (errorData as { errorCode?: string })?.errorCode ?? (errorData as { message?: string })?.message ?? ''
          );
        }

        const error: ApiError = {
          response: {
            status: response.status,
            statusText: response.statusText,
            data: errorData,
          },
          message: (errorData as { message?: string }).message || (errorData as { error?: string }).error || response.statusText,
          code: (errorData as { errorCode?: string }).errorCode ?? (errorData as { code?: string }).code,
          config: {
            url: fullUrl,
            method: methodUpper,
          },
        };

        // Call error handler if provided
        if (this.onError) {
          this.onError(error);
        }

        // Retry on 5xx errors (server errors)
        if (response.status >= 500 && attempt < this.retries) {
          await this.sleep(this.retryDelay * (attempt + 1));
          return this.request<T>(method, url, data, options, attempt + 1);
        }

        throw error;
      }

      // Parse response
      const responseData = await response.json().catch((parseError) => {
        // Handle empty responses (204 No Content)
        if (response.status === 204) {
          return {};
        }
        // For 201 Created with empty body, return empty object
        if (response.status === 201) {
          return {};
        }
        // For other errors, log and throw
        console.error('Failed to parse JSON response:', parseError);
        throw new Error('Invalid JSON response');
      });

      // Handle Laravel responses
      // Backend returns: { success: true, data: {...}, meta?: {...} }
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        // Check if this is a collection response (has pagination/collection metadata)
        // Collection responses have meta with: count, limit, offset, total_count
        // Single responses have meta with just: timestamp, version, requestId
        const isCollectionResponse = 
          'meta' in responseData && 
          responseData.meta &&
          typeof responseData.meta === 'object' &&
          ('count' in responseData.meta || 'total_count' in responseData.meta || 'limit' in responseData.meta);
        
        if (isCollectionResponse) {
          // Preserve both data and meta for collection responses
          return { 
            data: {
              data: responseData.data,
              meta: responseData.meta
            } as T 
          };
        }
        // Otherwise, just unwrap to data (single resources, auth responses, etc.)
        return { data: responseData.data as T };
      }

      return { data: responseData as T };
    } catch (error: unknown) {
      const err = error as { message?: string; name?: string; response?: unknown };
      const isNetworkError =
        error instanceof TypeError ||
        err?.message === 'Failed to fetch' ||
        (typeof err?.message === 'string' && (err.message.includes('NetworkError') || err.message.includes('Network request failed'))) ||
        err?.name === 'TypeError' ||
        (!err?.response && typeof err?.message === 'string');

      // Retry on network errors
      if (attempt < this.retries && isNetworkError) {
        await this.sleep(this.retryDelay * (attempt + 1));
        return this.request<T>(method, url, data, options, attempt + 1);
      }

      if (typeof err?.message === 'string' && err.message === 'Request timeout') {
        const timeoutError: ApiError = {
          message: 'Request timeout - the server took too long to respond',
          code: 'TIMEOUT',
          config: {
            url: `${this.baseURL}${url}`,
            method: method.toUpperCase(),
          },
        };
        if (this.onError) {
          this.onError(timeoutError);
        }
        throw timeoutError;
      }

      if (isNetworkError) {
        const fullUrl = `${this.baseURL}${url}`;
        let errorMessage: string = typeof err?.message === 'string' ? err.message : 'Network error - unable to connect to server';
        if (errorMessage === 'Failed to fetch') {
          errorMessage = `Failed to connect to ${fullUrl}. This usually means:
- The backend server is not running
- CORS is blocking the request
- The URL is incorrect
- Network connectivity issues`;
        }

        const networkError: ApiError = {
          message: errorMessage,
          code: 'NETWORK_ERROR',
          config: {
            url: fullUrl,
            method: method.toUpperCase(),
          },
        };

        const errMsg = typeof err?.message === 'string' ? err.message : 'Unknown';
        const errName = typeof err?.name === 'string' ? err.name : 'Error';
        const errStack = (error as { stack?: string })?.stack ?? '';
        const isAbortError = errMsg.includes('aborted') || errName === 'AbortError';
        const isFinalAttempt = attempt >= this.retries;

        if (!isAbortError && isFinalAttempt && typeof process !== 'undefined' && process.env && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV)) {
          console.error(
            '[ApiClient] Network error:',
            errorMessage,
            '| URL:',
            fullUrl,
            '| Method:',
            method.toUpperCase(),
          );
          console.error('[ApiClient] Raw error:', errName, errMsg, errStack || '(no stack)');
        }
        
        if (!isAbortError && this.onError) {
          this.onError(networkError);
        }
        throw networkError;
      }

      if (err?.response) {
        if (this.onError) {
          this.onError(error as ApiError);
        }
        throw error;
      }

      const apiError: ApiError = {
        message: typeof err?.message === 'string' ? err.message : 'Unknown error occurred',
        ...(typeof (error as { code?: string }).code === 'string' && { code: (error as { code: string }).code }),
        config: {
          url: `${this.baseURL}${url}`,
          method: method.toUpperCase(),
        },
      };

      if (this.onError) {
        this.onError(apiError);
      }

      throw apiError;
    }
  }

  /**
   * GET request
   */
  async get<T>(url: string, options?: ApiRequestOptions): Promise<{ data: T }> {
    return this.request<T>('GET', url, undefined, options);
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<{ data: T }> {
    return this.request<T>('POST', url, data, options);
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<{ data: T }> {
    return this.request<T>('PUT', url, data, options);
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<{ data: T }> {
    return this.request<T>('PATCH', url, data, options);
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, options?: ApiRequestOptions): Promise<{ data: T }> {
    return this.request<T>('DELETE', url, undefined, options);
  }
}

/**
 * Helper to safely get environment variables
 */
function getEnvVar(key: string, defaultValue: string): string {
  if (typeof process === 'undefined' || !process.env) {
    return defaultValue;
  }
  return process.env[key] || defaultValue;
}

/**
 * Check if running in development mode
 */
function isDevelopment(): boolean {
  return getEnvVar('NODE_ENV', 'development') === 'development';
}

/**
 * Get authentication token from browser storage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Try localStorage first
  const token = localStorage.getItem('auth_token');
  if (token) {
    return token;
  }
  
  // Fallback to cookie
  const cookieToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_token='))
    ?.split('=')[1];
  
  return cookieToken || null;
}

/**
 * Handle API errors with proper logging
 */
function handleApiError(error: ApiError): void {
  // Check if this is a non-critical error (e.g., schedule creation)
  // These are handled gracefully and don't need to be logged as errors
  const isNonCritical = (error?.response?.data as { message?: string } | undefined)?.message?.includes('schedule') ||
                       error?.message?.includes('schedule') ||
                       (error?.response?.status && error.response.status >= 400 && error.response.status < 500);
  
  // Always log errors in development, with detailed information
  // But use console.warn for non-critical errors instead of console.error
  if (isDevelopment()) {
    const logMethod = isNonCritical ? console.warn : console.error;
    const url = error?.config?.url ?? '(no URL)';
    const method = error?.config?.method ? String(error.config.method).toUpperCase() : 'REQUEST';
    const message = error?.message || 'Unknown error';
    const errorInfo = {
      message,
      code: error?.code,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      url: error?.config?.url || undefined,
      method: error?.config?.method ? String(error.config.method).toUpperCase() : undefined,
      isNonCritical,
    };

    // Log summary first for readability (always include url/method for debugging)
    logMethod(`API Error [${method}] ${url}:`, message);

    // Log full details as a plain object so console shows all fields (avoids "{}" when expandable ref is stale)
    logMethod('Full error details:', { ...errorInfo });
  }
  
  // Only log errors with meaningful content in production
  if (!isDevelopment()) {
    if (!error || typeof error !== 'object') {
      return;
    }
    
    const hasContent = 
      ('message' in error && error.message) ||
      ('response' in error && error.response) ||
      Object.keys(error).length > 0;
    
    if (hasContent) {
      console.error('API Error:', error.message || 'Unknown error');
    }
  }
}

/**
 * Default API client instance
 * Configure via environment variables or create custom instance
 */
export const apiClient = new ApiClient({
  timeout: parseInt(getEnvVar('NEXT_PUBLIC_API_TIMEOUT', '10000'), 10), // 10 seconds - allows backend to respond
  retries: parseInt(getEnvVar('NEXT_PUBLIC_API_RETRIES', '1'), 10), // 1 retry - fail fast after timeout
  getAuthToken,
  onError: handleApiError,
});

/**
 * Create custom API client instance
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}


