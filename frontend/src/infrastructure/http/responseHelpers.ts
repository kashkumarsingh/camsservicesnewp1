/**
 * Response shape helpers for remote backend API.
 *
 * Backend may return { data: [...] } or { data: { data: [...], meta } } for lists.
 * ApiClient passes this through as-is for collection responses, so repositories
 * must handle both shapes. These helpers normalise to a plain array and throw
 * on malformed payloads instead of silently returning wrong data.
 *
 * See API_RESPONSE_CONTRACT.md and ApiClient request() unwrap logic.
 */

/** Paginated list shape from backend (nested data + optional meta). */
export interface PaginatedListShape<T> {
  data: T[];
  meta?: unknown;
}

/** Unwrapped list response: either a direct array or a paginated object. */
export type ListResponseData<T> = T[] | PaginatedListShape<T>;

/** Full response object as received from ApiClient for list endpoints. */
export interface ListResponse<T> {
  data: ListResponseData<T>;
}

/**
 * Runtime guard: true if `data` is a valid paginated shape (object with
 * a `data` property that is an array). Rejects { data: "oops" } and similar.
 */
export function isPaginated<T>(data: unknown): data is PaginatedListShape<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    Array.isArray((data as PaginatedListShape<unknown>).data)
  );
}

/**
 * Extract a list from an API response that may be either:
 * - { data: T[] } (direct array)
 * - { data: { data: T[]; meta?: unknown } } (nested when backend sends meta)
 *
 * Throws if the payload looks paginated but `data` is not an array (e.g.
 * { data: { data: "oops" } }), so callers fail fast instead of getting wrong results.
 *
 * @param response - The unwrapped response from ApiClient (response.data may be array or { data, meta })
 * @returns The list of items
 * @throws If response.data is an object with a non-array `data` property
 */
export function extractList<T>(response: ListResponse<T> | null | undefined): T[] {
  const raw: unknown = response?.data;

  if (raw === null || raw === undefined) {
    return [];
  }

  if (Array.isArray(raw)) {
    return raw;
  }

  if (typeof raw === 'object' && 'data' in raw) {
    if (!isPaginated<T>(raw)) {
      throw new Error(
        `[extractList] Expected paginated shape { data: T[] } but data.data is not an array. Got: ${JSON.stringify(
          (raw as { data?: unknown }).data
        )}`
      );
    }
    return raw.data;
  }

  return [];
}
