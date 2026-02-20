# ADR-001: Single Source of Truth for API Responses

## Status

Accepted.

## Context

The codebase has a Laravel backend (REST API) and a Next.js frontend. Without a single contract:

- Backend controllers could return ad-hoc `response()->json()` with inconsistent keys (snake_case vs camelCase), envelope shapes, and error formats.
- Frontend repositories could each interpret response shapes differently (e.g. `data` vs `data.data`), leading to duplication, bugs, and drift.

We needed one place that defines *how* the API speaks and one place that defines *how* the frontend reads it, so that both sides stay aligned and new code doesn't reintroduce inconsistency.

## Decision

### Backend

- **Single place for response shaping:** All API responses go through `ApiResponseHelper` (used via the `BaseApiController` trait). Controllers, middleware, form requests, and actions must not call `response()->json()` directly.
- **Single place for key convention:** All API payload keys are camelCase. Conversion from snake_case (e.g. from Eloquent) happens only in `BaseApiController::keysToCamelCase()` (implemented via `ApiResponseHelper`).

This gives a single contract (see `API_RESPONSE_CONTRACT.md`) and one implementation path, so changes to envelope or key convention happen in one place.

### Frontend

- **Single place for HTTP and envelope handling:** All calls to the *internal* backend API go through `ApiClient`. It handles base URL, credentials, and unwrapping of the response envelope. No direct `fetch`/axios to the backend for JSON in repositories or hooks.
- **Single place for list extraction:** List endpoints may return `{ data: T[] }` or `{ data: { data: T[], meta } }`. All list handling uses `extractList()` from `frontend/src/infrastructure/http/responseHelpers.ts`. Repositories do not implement their own array/nested-shape logic for standard lists.

So: one place that talks to the backend (`ApiClient`), one place that turns list responses into arrays (`extractList`).

### Exceptions

Documented exceptions (see .cursorrules § SINGLE SOURCE OF TRUTH — Acceptable exceptions) are intentional:

- **Backend:** Web routes in `web.php` are not part of the API contract; they may use `response()->json()` for small JSON payloads (e.g. dashboard URL references). Debug routes (`/debug/*`) are to be deleted before production, not refactored into the API contract.
- **Frontend:** `ApiClient` itself uses `fetch` internally. `getSiteSettings`/`useSiteSettings` use fetch with Next.js ISR options. CSV/blob downloads and third-party APIs (e.g. location, address lookup) use fetch because they are not JSON-from-our-backend and are outside the ApiClient contract. `ApiBookingRepository` and `ApiPaymentRepository` have documented reasons for custom extraction (booking-specific list shape; payments nested in a booking payload).

## Consequences

- **Consistency:** All API responses and all frontend consumption of those responses follow the same rules. New endpoints and repositories are guided to use the same helpers.
- **Maintainability:** Changing the response envelope or key convention is done in one place (backend: ApiResponseHelper/BaseApiController; frontend: ApiClient + responseHelpers). No hunting through controllers or repositories.
- **Onboarding:** Cursor rules and this ADR tell developers *what* to do and *why*, reducing the chance that someone "fixes" an intentional exception or reintroduces raw `response()->json()` or inline list handling.

## References

- `.cursorrules` — § SINGLE SOURCE OF TRUTH — UNIVERSAL RULE and Acceptable exceptions
- `API_RESPONSE_CONTRACT.md` (repo root) — response envelope and key convention
- `backend/app/Support/ApiResponseHelper.php` — backend response implementation
- `backend/app/Http/Controllers/Api/Concerns/BaseApiController.php` — controller trait
- `frontend/src/infrastructure/http/ApiClient.ts` — frontend HTTP wrapper
- `frontend/src/infrastructure/http/responseHelpers.ts` — `extractList` and list shapes
