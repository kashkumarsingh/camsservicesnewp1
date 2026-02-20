/**
 * Promise Utilities
 * 
 * FAANG-grade utilities for promise handling, timeouts, and race conditions.
 * Used across the application for consistent, reliable async operations.
 * 
 * Clean Architecture Layer: Utils (Shared Infrastructure)
 */

/**
 * Creates a promise that rejects after a specified timeout
 * 
 * @param timeoutMs - Timeout in milliseconds
 * @param errorMessage - Optional custom error message
 * @returns Promise that rejects with timeout error
 * 
 * @example
 * ```typescript
 * const timeout = createTimeoutPromise(5000, 'Request timed out');
 * const result = await Promise.race([apiCall(), timeout]);
 * ```
 */
export function createTimeoutPromise(
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });
}

/**
 * Wraps a promise with a timeout, returning a fallback value if timeout is exceeded
 * 
 * This is the preferred pattern for non-critical operations where graceful degradation
 * is acceptable (e.g., homepage data loading, optional features).
 * 
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param fallback - Fallback value to return if timeout is exceeded
 * @returns Promise that resolves with either the result or fallback
 * 
 * @example
 * ```typescript
 * const settings = await withTimeoutFallback(
 *   fetchSiteSettings(),
 *   3000,
 *   getDefaultSiteSettings()
 * );
 * ```
 */
export async function withTimeoutFallback<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallback: T
): Promise<T> {
  try {
    const timeoutPromise = createTimeoutPromise(timeoutMs, `Operation timed out after ${timeoutMs}ms`);
    const result = await Promise.race([
      promise,
      timeoutPromise.then(() => fallback),
    ]);
    return result;
  } catch {
    // If promise rejects, return fallback
    return fallback;
  }
}

/**
 * Wraps a fetch request with AbortController for proper timeout handling
 * 
 * This is the preferred pattern for fetch requests as it properly cancels
 * the underlying network request, preventing resource leaks.
 * 
 * @param url - URL to fetch
 * @param options - Fetch options (will be merged with signal)
 * @param timeoutMs - Timeout in milliseconds
 * @returns Promise that resolves with Response or rejects with timeout error
 * 
 * @example
 * ```typescript
 * const response = await fetchWithTimeout(
 *   'https://api.example.com/data',
 *   { headers: { 'Accept': 'application/json' } },
 *   5000
 * );
 * ```
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 5000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    const err = error as { name?: string };
    if (err?.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
    }
    
    throw error;
  }
}

/**
 * Executes multiple promises with individual timeouts and fallbacks
 * 
 * Useful for parallel data loading where each operation should fail independently.
 * 
 * @param operations - Array of operations with timeout and fallback
 * @returns Array of results (either resolved values or fallbacks)
 * 
 * @example
 * ```typescript
 * const [settings, packages, services] = await executeWithTimeouts([
 *   { promise: fetchSiteSettings(), timeout: 3000, fallback: null },
 *   { promise: fetchPackages(), timeout: 3000, fallback: [] },
 *   { promise: fetchServices(), timeout: 3000, fallback: [] },
 * ]);
 * ```
 */
export async function executeWithTimeouts<T>(
  operations: Array<{
    promise: Promise<T>;
    timeout: number;
    fallback: T;
  }>
): Promise<T[]> {
  const wrappedPromises = operations.map(({ promise, timeout, fallback }) =>
    withTimeoutFallback(promise, timeout, fallback)
  );

  return Promise.allSettled(wrappedPromises).then((results) =>
    results.map((result) => (result.status === 'fulfilled' ? result.value : operations[0].fallback))
  );
}

