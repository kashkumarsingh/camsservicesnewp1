# API Response Contract – CamelCase Centralisation

**Rephrased (Direct):** This document defines the centralised API response contract for camelCase and envelope handling between backend and frontend.

**Rephrased (Intent):** Single source of truth for how the Laravel API shapes responses (camelCase, envelope) and how the frontend consumes them (ApiClient unwrap, DTOs in camelCase).

---

## Summary

- **Backend:** All API responses go through `BaseApiController` helpers. Keys are converted to camelCase in one place (`keysToCamelCase()`). Controllers must not return raw `JsonResponse` or convert keys themselves.
- **Frontend:** All API calls use `ApiClient`. The client unwraps the envelope once; repositories receive unwrapped `data` and define DTOs in camelCase. No envelope unwrapping or key conversion elsewhere.

## Backend (Laravel)

### Response helpers (mandatory)

- **Single place for JSON:** All API JSON is built in `App\Support\ApiResponseHelper`. Controllers use `BaseApiController` (which delegates to the helper). Middleware, exception handler, form requests, and route closures use `ApiResponseHelper` directly.
- **Do not** call `response()->json()` anywhere in the API layer. Use:
  - **Controllers:** `$this->successResponse()`, `$this->errorResponse()`, etc. (trait delegates to `ApiResponseHelper`).
  - **Middleware / form requests / routes:** `ApiResponseHelper::errorResponse()`, `ApiResponseHelper::validationErrorResponse()`, `ApiResponseHelper::successResponse()`, etc.
- Helper methods (same shape from controller or helper):
  - `successResponse($data, $message = null, $meta = [], $statusCode = 200)`
  - `collectionResponse($collection, $message = null, $additionalMeta = [])`
  - `paginatedResponse($paginator, $message = null, $additionalMeta = [])`
  - `itemResponse($data, $statusCode = 200, $message = null)`
  - `errorResponse($message, $errorCode = null, $errors = [], $statusCode = 400)`
  - `validationErrorResponse($errors, $message = null)`
  - `notFoundResponse($resource)`
  - `unauthorizedResponse($message = null)`
  - `forbiddenResponse($message = null)`
  - `serverErrorResponse($message = null, $errorCode = null)`
  - `emptyResponse($statusCode = 204)`

### Rules

- **Never** return raw arrays or `response()->json(...)` in the API layer. Use `BaseApiController` (controllers) or `ApiResponseHelper` (middleware, exception handler, form requests, route closures).
- Controllers and services may keep **snake_case** in PHP (e.g. Eloquent `toArray()`). `ApiResponseHelper::keysToCamelCase()` converts all payload keys before sending.
- **Do not** convert keys to camelCase in individual controllers or services.
- Validation error keys are camelCased (e.g. `first_name` → `firstName`). Validation rules and frontend form field names should align with this.

### Where conversion happens

- All conversion is in `ApiResponseHelper::keysToCamelCase()` (success `data`/`meta`, collection items, paginator items, error `errors`).

Reference: `backend/app/Support/ApiResponseHelper.php`, `backend/app/Http/Controllers/Api/Concerns/BaseApiController.php`.

---

## Frontend (TypeScript)

### Central unwrap

- **All** API calls to the Laravel backend must go through `ApiClient`. Do not use `fetch` or `axios` directly in repositories or components for backend API calls.
- `ApiClient` unwraps the envelope. Repositories receive **already-unwrapped** `data` (or `{ data, meta }` for collection/paginated responses where the client preserves meta).

### Envelope shape

Every successful API response from the backend has this envelope (before unwrap):

```ts
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta | Meta;
}
```

- `ApiClient.get/post/put/patch/delete` return `Promise<{ data: T }>`.
- For single-resource responses, `T` is the payload (e.g. a package, a booking). So `response.data` is the resource.
- For collection/paginated responses, the client may return `{ data: { data: T[], meta } }` so repositories can use both list and pagination meta. Repositories should type `T` and meta accordingly.

### Repositories and DTOs

- Each repository defines its own response DTO (e.g. `RemotePackageResponse`) and maps to domain types.
- All response keys from the backend are **camelCase**. Define DTOs in camelCase; no manual key mapping in repositories.
- Form field names must use camelCase to match validation error keys from the backend.

### Where unwrap happens

- Unwrap is done **only** in `ApiClient` (in the `request()` method). No other layer should unwrap `{ success, data, meta }`.

Reference: `frontend/src/infrastructure/http/ApiClient.ts`.

---

## General rules

- **Key conversion:** Only in `BaseApiController::keysToCamelCase()`. Nowhere else.
- **Envelope unwrap:** Only in `ApiClient`. Nowhere else.
- **New endpoint:** Controller uses a base helper → repository defines a DTO in camelCase → ApiClient handles transport and unwrap.
- **Uncertainty:** Check `BaseApiController` for backend shape and `ApiClient` for frontend behaviour.

---

## Pagination meta (camelCase)

Backend paginated responses include `meta.pagination` with:

- `currentPage`, `perPage`, `total`, `lastPage`
- `hasMore`, `prevPage`, `nextPage`

Frontend types (e.g. `PaginationMeta`) should use these same camelCase property names.

---

## Files to check

| Layer     | File(s)                                                                 |
|----------|-------------------------------------------------------------------------|
| Backend  | `backend/app/Http/Controllers/Api/Concerns/BaseApiController.php`     |
| Frontend | `frontend/src/infrastructure/http/ApiClient.ts`                         |
| Endpoints| `frontend/src/infrastructure/http/apiEndpoints.ts`                      |
