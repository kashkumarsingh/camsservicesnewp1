## Admin Users Endpoints - Implementation Summary

### Files Modified/Created (In Order)
1. **File:** `backend/app/Http/Controllers/Api/AdminUserController.php`
 - Layer: Interface (API)
 - Order: 1
 - Purpose: Provides admin-only list and detail endpoints for users, formatted for the Next.js admin dashboard.

2. **File:** `backend/routes/api.php`
 - Layer: Interface (Routing)
 - Order: 2
 - Purpose: Registers `GET /api/v1/admin/users` and `GET /api/v1/admin/users/{id}` within the existing `auth:sanctum` + `admin` middleware group.

3. **File:** `backend/app/Http/Controllers/Api/BookingController.php`
 - Layer: Interface (API)
 - Order: 3
 - Purpose: Relaxes booking ownership checks for `show` and `showByReference` so admins can read any booking while preserving strict checks for parents.

4. **File:** `frontend/src/infrastructure/http/apiEndpoints.ts`
 - Layer: Infrastructure (HTTP)
 - Order: 4
 - Purpose: Adds `ADMIN_USERS` and `ADMIN_USER_BY_ID` constants as the single source of truth for the new admin user endpoints.

5. **File:** `frontend/src/interfaces/web/hooks/dashboard/useAdminUsers.ts`
 - Layer: Interface (Web Hooks)
 - Order: 5
 - Purpose: Introduces `useAdminUsers` hook to fetch and map admin-visible users from Laravel into a UI-ready shape.

6. **File:** `frontend/src/app/dashboard/admin/users/AdminUsersPageClient.tsx`
 - Layer: Presentation (Next.js Client Component)
 - Order: 6
 - Purpose: Switches the admin users table from mock data to live data via `useAdminUsers`, with loading and error handling.

### Plain English Explanation
We added a small, focused admin users API on the backend and wired it directly into the new Next.js admin dashboard so admins can see real users today without disturbing the existing parent and trainer flows. Laravel exposes a secure list and detail view of users under `/api/v1/admin/users`, guarded by `auth:sanctum` and the existing `admin` middleware, and it reuses the standard `BaseApiController` response format to stay consistent with other APIs. On the frontend, the admin users page now uses a dedicated `useAdminUsers` hook built on the shared `ApiClient` and central `API_ENDPOINTS`, returning a typed list of users that slot straight into the existing inline table + right-hand side panel pattern. Finally, we relaxed the booking ownership checks only for admin roles so that admin-side booking detail panels work correctly without weakening the protections for parents.

### Summary of Changes
- **Backend**
  - Created `AdminUserController` with:
    - `index` action to return a filtered list of users (role and approval status) with basic limit/offset support and high-value counts (children, approved children, bookings).
    - `show` action to return a single user formatted for admin inspection.
  - Registered the new routes inside the existing admin-only group:
    - `GET /api/v1/admin/users`
    - `GET /api/v1/admin/users/{id}`
  - Updated `BookingController@show` and `BookingController@showByReference` so `admin`/`super_admin` bypass the strict ownership checks, while parents retain the “only your own bookings” behaviour.

- **Frontend**
  - Extended `API_ENDPOINTS` with:
    - `ADMIN_USERS`
    - `ADMIN_USER_BY_ID(id)`
  - Implemented `useAdminUsers` hook that:
    - Uses `useAuth` to ensure only admins/super_admins call the endpoint.
    - Calls `apiClient.get(API_ENDPOINTS.ADMIN_USERS)` and maps the remote user objects into `AdminUserRow` DTOs.
    - Exposes `{ users, loading, error, refetch }` for presentation components.
  - Updated `AdminUsersPageClient` to:
    - Replace the `MOCK_USERS` array with `useAdminUsers` output.
    - Add a loading row, an error banner and an accurate “Showing X of Y users” footer.
    - Preserve the existing inline table + `SideCanvas` detail panel UX.

### Clean Architecture Compliance
- **Direction of dependencies**
  - Controllers depend on the Domain model (`User`) but not on frontend concerns, keeping the API layer clean.
  - The new hook `useAdminUsers` depends only on:
    - `ApiClient` + `API_ENDPOINTS` (Infrastructure)
    - `useAuth` (Interface)
  - The admin users page is purely a presentation layer consumer of the hook and does not know about HTTP details.
- **Response shapes**
  - All new backend responses go through `BaseApiController` (`success`, `data`, `meta` with a request ID and basic metadata).
  - The frontend uses `ApiClient`’s unwrapping behaviour (`response.data`) and strongly typed DTOs to avoid leaking backend envelope details.
- **Security**
  - All admin user and stats routes are inside the existing `auth:sanctum` + `admin` middleware group.
  - Parents still cannot see other users’ bookings; only `admin`/`super_admin` roles skip the ownership checks in booking detail endpoints.

### Next Steps
- Introduce proper pagination (page/per_page) and search query parameters to `AdminUserController@index` and surface them through `useAdminUsers`.
- Add admin-side mutation endpoints (approve/reject, role changes, deactivate) and mirror them with a `useAdminUserActions` hook and inline action buttons in `AdminUsersPageClient`.
- Add feature tests for:
  - `GET /api/v1/admin/users` and `GET /api/v1/admin/users/{id}` (admin vs non-admin).
  - Booking detail access for admins vs parents after the relaxed checks.
- Wire admin-side booking, user and trainer actions into the existing approvals and booking update flows in a separate iteration, keeping this change set read-only and low-risk.

