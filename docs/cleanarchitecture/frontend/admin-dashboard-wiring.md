## Admin Dashboard Wiring - Implementation Summary

### Files Modified/Created (In Order)
1. **File:** `backend/app/Http/Controllers/Api/AdminDashboardStatsController.php`
 - Layer: Application / Interface
 - Order: 1
 - Purpose: Exposes system-wide aggregates (bookings, users, trainers, alerts) for the admin dashboard, guarded by admin middleware.

2. **File:** `backend/routes/api.php`
 - Layer: Interface (Routing)
 - Order: 2
 - Purpose: Registers `GET /api/v1/admin/dashboard/stats` inside the authenticated + admin route group.

3. **File:** `frontend/src/infrastructure/http/apiEndpoints.ts`
 - Layer: Infrastructure (HTTP)
 - Order: 3
 - Purpose: Adds `ADMIN_DASHBOARD_STATS` endpoint constant for CMS-agnostic API access.

4. **File:** `frontend/src/interfaces/web/hooks/dashboard/useAdminDashboardStats.ts`
 - Layer: Interface (Web Hooks)
 - Order: 4
 - Purpose: Provides a typed React hook for fetching admin dashboard stats via `ApiClient`.

5. **File:** `frontend/src/app/dashboard/admin/AdminDashboardOverviewPageClient.tsx`
 - Layer: Presentation (Next.js Client Component)
 - Order: 5
 - Purpose: Renders the admin overview cards using live stats from the Laravel API.

6. **File:** `frontend/src/app/dashboard/admin/page.tsx`
 - Layer: Presentation (Next.js Server Component)
 - Order: 6
 - Purpose: Keeps metadata and delegates rendering to the client-side overview page.

7. **File:** `frontend/src/interfaces/web/hooks/booking/useAllBookings.ts`
 - Layer: Interface (Web Hooks)
 - Order: 7
 - Purpose: Provides an admin-only hook that lists all bookings via `ListBookingsUseCase`.

8. **File:** `frontend/src/app/dashboard/admin/bookings/AdminBookingsPageClient.tsx`
 - Layer: Presentation (Next.js Client Component)
 - Order: 8
 - Purpose: Implements the admin bookings table wired to the Laravel bookings API with client-side search.

9. **File:** `frontend/src/app/dashboard/admin/bookings/page.tsx`
 - Layer: Presentation (Next.js Server Component)
 - Order: 9
 - Purpose: Preserves route metadata and delegates to `AdminBookingsPageClient`.

### Plain English Explanation
The Laravel backend now exposes a dedicated admin stats endpoint that returns system-level metrics such as total bookings, confirmed/pending/cancelled counts, approved parents, active trainers, and safeguarding alerts. This endpoint is protected so only users with `admin` or `super_admin` roles can call it.  

On the frontend, the admin overview page has been wired to this endpoint via a strongly-typed React hook. The static cards have been replaced with live values, including a dedicated alerts card that highlights pending safeguarding concerns and parent approvals.  

For bookings, an admin-specific hook reuses the existing `ListBookingsUseCase` and booking repository to fetch all bookings (not just the current user). The admin bookings page now renders a real table powered by this hook, with client-side search over reference, parent name, trainer name and package name, whilst leaving filters/export clearly marked as “coming soon”.

### Summary of Changes
- **Backend:**
  - Added `AdminDashboardStatsController` to compute global aggregates using `Booking`, `User`, `Trainer` and `SafeguardingConcern` models.
  - Registered `GET /api/v1/admin/dashboard/stats` within the `auth:sanctum` + `admin` middleware group.
- **Frontend:**
  - Extended `API_ENDPOINTS` with `ADMIN_DASHBOARD_STATS`.
  - Added `useAdminDashboardStats` hook to consume the new endpoint via `ApiClient`.
  - Reworked the admin overview page to use a client component wired to real stats, including a live alerts card.
  - Added `useAllBookings` hook (admin-only) that leverages `ListBookingsUseCase` and `ApiBookingRepository`.
  - Replaced the static admin bookings layout with `AdminBookingsPageClient`, rendering actual bookings with search and clear future affordances for filters/export.
- **Database/API:**
  - No schema changes; all metrics are derived from existing tables (`bookings`, `users`, `trainers`, `safeguarding_concerns`).

### Clean Architecture Compliance
- **Dependency Direction:**
  - Domain models (`Booking`, `User`, `Trainer`, `SafeguardingConcern`) are only consumed by the new controller; no domain changes were made.
  - The new controller lives in the Application/Interface layer and is only referenced from routing (Interface layer).
  - Frontend Presentation components depend on Interface-level hooks, which in turn depend on the Infrastructure `ApiClient` and repository abstractions (`ListBookingsUseCase` + `IBookingRepository`).
- **Separation of Concerns:**
  - Aggregation logic is confined to `AdminDashboardStatsController` rather than being embedded in routes.
  - UI components (`AdminDashboardOverviewPageClient`, `AdminBookingsPageClient`) are purely presentational and do not know about API URLs or authentication.
  - All HTTP paths continue to be centralised in `apiEndpoints.ts`, preserving CMS-agnostic behaviour.

### Next Steps
- Extend admin stats to include revenue metrics and trainer utilisation (e.g. hours delivered) once those reporting requirements are confirmed.
- Add proper filtering, sorting and pagination to the admin bookings table, backed by server-side query parameters rather than client-side only filtering.
- Introduce admin-facing endpoints for listing users and trainers with richer metadata (approval history, safeguarding flags) and wire them into `/dashboard/admin/users` and `/dashboard/admin/trainers`.
- Add automated tests around `AdminDashboardStatsController` to validate counts and ensure future schema changes do not silently break the admin overview.

