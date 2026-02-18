## Admin Activities Management - Implementation Summary

### Files Modified/Created (In Order)
1. **File:** `backend/app/Http/Controllers/Api/AdminActivitiesController.php`  
 - Layer: Interface (HTTP API Controller)  
 - Order: 1  
 - Purpose: Provide admin-only CRUD endpoints for activities under `/api/v1/admin/activities` with filtering by category, active status and search.

2. **File:** `backend/routes/api.php`  
 - Layer: Interface (Routing)  
 - Order: 2  
 - Purpose: Register `Route::apiResource('admin/activities', AdminActivitiesController::class)` within the `admin` middleware group.

3. **File:** `backend/database/seeders/LocalDemoSeeder.php`  
 - Layer: Infrastructure / Data Seeding  
 - Order: 3  
 - Purpose: Seed ~50 realistic demo `Activity` records across warm‑up, movement, ball skills, team games, conditioning, confidence, outdoor, cool‑down and project categories.

4. **File:** `frontend/src/infrastructure/http/apiEndpoints.ts`  
 - Layer: Infrastructure (HTTP Endpoints)  
 - Order: 4  
 - Purpose: Add `ADMIN_ACTIVITIES` and `ADMIN_ACTIVITY_BY_ID(id)` constants for the admin activities API.

5. **File:** `frontend/src/core/application/admin/dto/AdminActivityDTO.ts`  
 - Layer: Application (DTO)  
 - Order: 5  
 - Purpose: Define `AdminActivityDTO`, `CreateActivityDTO`, `UpdateActivityDTO`, the remote response type and a mapper `mapRemoteActivityToDTO`.

6. **File:** `frontend/src/interfaces/web/hooks/admin/useAdminActivities.ts`  
 - Layer: Interface (Web Hook)  
 - Order: 6  
 - Purpose: Expose a typed `useAdminActivities` hook for listing, creating, updating and deleting activities from the admin dashboard.

7. **File:** `frontend/src/components/dashboard/layout/DashboardShell.tsx`  
 - Layer: Presentation (Shared Layout)  
 - Order: 7  
 - Purpose: Add an "Activities" navigation item under the Admin sidebar pointing to `/dashboard/admin/activities`.

8. **File:** `frontend/src/app/dashboard/admin/activities/page.tsx`  
 - Layer: Presentation (Route Shell)  
 - Order: 8  
 - Purpose: Provide the Next.js route entry for `/dashboard/admin/activities` and set metadata.

9. **File:** `frontend/src/app/dashboard/admin/activities/AdminActivitiesPageClient.tsx`  
 - Layer: Presentation (Client Component)  
 - Order: 9  
 - Purpose: Implement the admin activities management UI (table, filters, create/edit form, detail panel).

### Plain English Explanation
Admins can now manage the master list of "standard activities" that appear in the parent booking flow and trainer session planning interfaces.  
On the backend there is a dedicated `AdminActivitiesController` that exposes a simple CRUD API for the `Activity` model, using camelCase fields aligned with the frontend DTOs and supporting filters for category, active status and free‑text search.  
The `LocalDemoSeeder` seeds roughly 50 activities covering warm‑ups, drills, team games, confidence‑building and cool‑down work so that local environments and demos always have a rich catalogue instead of showing an empty state.  
On the frontend, the admin dashboard gains a new `/dashboard/admin/activities` page reachable from the Admin sidebar, backed by a `useAdminActivities` hook and `AdminActivityDTO` types. The UI lets admins search, filter by category/status, create new activities, edit existing ones and soft‑delete activities, with a compact table and side detail panel.

### Summary of Changes
- **Backend**
  - Added `AdminActivitiesController` with:
    - `index` for filtered listing (`category`, `isActive`, `search`).
    - `show` for single activity retrieval by ID.
    - `store` and `update` with validation and camelCase → snake_case mapping.
    - `destroy` for soft deleting activities.
  - Registered `Route::apiResource('admin/activities', AdminActivitiesController::class)` inside the admin Sanctum group.
  - Extended `LocalDemoSeeder` to seed approximately 50 standard activities across common categories, using `firstOrCreate` on `slug` to avoid duplicates.

- **Frontend**
  - Added `ADMIN_ACTIVITIES` and `ADMIN_ACTIVITY_BY_ID(id)` to the central `API_ENDPOINTS`.
  - Introduced `AdminActivityDTO`, create/update DTOs, a remote response type and a robust mapper handling optional/null duration values.
  - Implemented `useAdminActivities` hook which:
    - Fetches and maps admin activities with filters (category, isActive, search).
    - Provides `createActivity`, `updateActivity`, `deleteActivity`, `getActivityById` helpers.
  - Updated `DashboardShell` admin section to include an "Activities" navigation item.
  - Created `/dashboard/admin/activities` route and `AdminActivitiesPageClient`:
    - Search input and filters for category and status.
    - Scrollable table showing name, category, duration, active status and quick actions.
    - Inline create/edit form with validation and "active" toggle.
    - Read‑only detail card for the selected activity.

### Clean Architecture Compliance
- **Backend**
  - `AdminActivitiesController` lives in the Interface layer and only depends on the `Activity` domain model plus standard Laravel validation and helpers.
  - The activities admin API uses camelCase field names (`isActive`, `createdAt`) in responses to avoid leaking database naming into the frontend Application layer.
  - Seeding logic is confined to `LocalDemoSeeder` in the Infrastructure/Data layer and uses domain models directly without coupling to HTTP concerns.

- **Frontend**
  - Presentation components (`AdminActivitiesPageClient`, `DashboardShell`) depend only on Interface‑layer hooks and Application‑layer DTOs, not on the raw HTTP client.
  - The `useAdminActivities` hook encapsulates all API endpoint knowledge and mapping, keeping the Presentation layer free from endpoint URLs.
  - DTOs and mappers in `AdminActivityDTO` form the contract between Interface and Application layers and perform all camelCase normalisation and type coercion.

### Next Steps
- Consider extending the activities model and admin UI to:
  - Tag activities with recommended age ranges and difficulty without re‑introducing removed DB columns.
  - Mark "featured" or "commonly used" activities for prioritised display in the parent booking flow.
  - Link activities more explicitly to packages for pre‑built itineraries.
- Add automated tests:
  - Backend HTTP tests for the admin activities endpoints (validation, filtering, soft deletes).
  - Frontend integration tests for the admin activities page (form flows, filters, empty state handling).

