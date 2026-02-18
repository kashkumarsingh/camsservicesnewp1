# Safeguarding Concerns Submit – Implementation Summary

## Feature Name
Parent dashboard: submit safeguarding concern (API + frontend wiring).

## Files Modified/Created (In Order)

1. **Backend**
   - `backend/database/migrations/2026_02_03_120000_create_safeguarding_concerns_table.php` – Infrastructure (Persistence). Creates `safeguarding_concerns` table.
   - `backend/app/Models/SafeguardingConcern.php` – Domain. Model for parent-reported concerns.
   - `backend/app/Http/Requests/StoreSafeguardingConcernRequest.php` – Interface. Validates request; accepts camelCase from frontend and maps to snake_case.
   - `backend/app/Http/Controllers/Api/ParentSafeguardingConcernController.php` – Interface (API). `store()` creates a concern for the authenticated user.
   - `backend/routes/api.php` – Route: `POST /api/v1/dashboard/safeguarding-concerns` inside `auth:sanctum`.

2. **Frontend**
   - `frontend/src/infrastructure/http/apiEndpoints.ts` – Added `DASHBOARD_SAFEGUARDING_CONCERNS: '/dashboard/safeguarding-concerns'`.
   - `frontend/src/interfaces/web/hooks/dashboard/useSubmitSafeguardingConcern.ts` – Interface. Hook that POSTs form data to the API; throws on error.
   - `frontend/src/app/(public)/dashboard/DashboardPageClient.tsx` – Uses `useSubmitSafeguardingConcern` and passes `submitSafeguardingConcern` into `handleSafeguardingSubmit`; success toast after submit.

## Plain English Explanation

Parents can report a safeguarding concern from the dashboard. The form (SafeguardingConcernModal) collects type, description, optional child, date, and contact preference. On submit, the frontend calls `POST /api/v1/dashboard/safeguarding-concerns` with the form data. The backend validates, stores the concern with the authenticated user’s ID and optional child (must belong to the user), and returns 201. The modal closes and a success toast is shown; on API error the modal shows an error message.

## Summary of Changes

- **Backend:** New migration (user_id, concern_type, description, child_id nullable, date_of_concern, contact_preference, status, ip_address, user_agent). New model, form request (camelCase → snake_case, child_id scoped to user’s children), controller store action, route under `auth:sanctum`.
- **Frontend:** New endpoint constant, new hook `useSubmitSafeguardingConcern()` returning `submitSafeguardingConcern(data)`. Dashboard uses the hook and replaces the placeholder submit with the real API call; success toast unchanged; errors surface in the modal.

## Clean Architecture Compliance

- API and hook use centralised `API_ENDPOINTS` and existing `apiClient`.
- Controller uses Form Request and model; no business logic in controller beyond create and response.
- Child ID validation ensures the child belongs to the authenticated user.

## Next Steps

- Run migration: `php artisan migrate`.
- Optional: unit/feature test for `POST /api/v1/dashboard/safeguarding-concerns` (auth, validation, child scoping).
- Optional: Admin list for Designated Safeguarding Lead to triage concerns.
