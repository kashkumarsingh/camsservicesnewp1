# Available Trainers for Session – Implementation Summary

## Overview

Admin assignment of a trainer to a booking session must respect **conflicts**, **trainer availability**, and **qualifications**. The "Assign" dropdowns (Schedule grid and Admin Bookings page) now use a dedicated **available trainers** API so admins only see and can assign trainers who pass these checks.

## Behaviour

### Rules (same as intelligent auto-assign)

A trainer is **available** for a session only if:

1. **Qualifications** – Qualified for the package activities (and not excluded).
2. **Location** – Parent postcode in trainer service area (or fallback when no postcode).
3. **Trainer availability** – `TrainerAvailability` covers the session date/time (weekly or specific date).
4. **No conflict** – No other session at the same time for that trainer.

Trainers are returned **ordered by score** (best match first).

### API

- **Endpoint:** `GET /api/v1/admin/bookings/sessions/{sessionId}/available-trainers`
- **Response:** `{ data: { trainers: [{ id, name, score }] } }`
- **Errors:** 404 if session not found. On failure (e.g. missing `trainer_availabilities` table), backend returns an empty list and logs a warning.

### Frontend usage

- **Schedule view (`AdminScheduleWeekGrid`):** For each unassigned session, the grid fetches available trainers. The Assign dropdown shows only those trainers. States: "Checking availability…", "No available trainers", or the list.
- **Admin Bookings page (`AdminBookingsPageClient`):** When the side panel opens for a booking, the app fetches available trainers per session. Each session's "Assign trainer" dropdown uses that list (same states as above). The currently assigned trainer is kept in the list when already set so the dropdown does not clear the selection.

### Server-side validation on assign

- **Endpoint:** `PUT /api/v1/admin/bookings/sessions/{sessionId}/trainer`
- **Validation:** After `exists:trainers,id`, the backend re-checks that the chosen trainer is in the **available** list for that session (same rules as above).
- **422:** If the trainer is not available, the API returns 422 with:  
  `trainer_id: ["The selected trainer is not available for this session (conflict, availability, or qualifications)."]`
- If the availability check throws (e.g. missing table), the API returns 422 with a message asking the user to try again or assign from the Schedule view.

## Files touched

| Layer        | File |
|-------------|------|
| Backend API | `backend/app/Http/Controllers/Api/AdminBookingsController.php` – `availableTrainersForSession`, `assignTrainer` (validation) |
| Backend Domain | `backend/app/Actions/Booking/AutoAssignTrainerAction.php` – `listAvailableForSession` |
| Frontend    | `frontend/src/components/dashboard/admin/AdminScheduleWeekGrid.tsx` – Assign dropdown uses available trainers |
| Frontend    | `frontend/src/app/dashboard/admin/bookings/AdminBookingsPageClient.tsx` – Assign dropdown uses available trainers per session |
| Frontend    | `frontend/src/infrastructure/http/apiEndpoints.ts` – `ADMIN_BOOKING_AVAILABLE_TRAINERS` |

## Dependencies

- **`trainer_availabilities` table:** If the migration has not been run, the availability filter is skipped and the backend may return an empty list (or log and return empty). Until the table exists and trainers set availability, "No available trainers" may appear.

## Optional / future improvements

- **UnassignedSessionsModal:** If this modal is used with a single list of trainers, it could be switched to per-session available trainers for consistency.
- **Primary trainer (assign same to all sessions):** The Admin Bookings page could restrict "assign same trainer to all sessions" to the intersection of available trainers for each session; currently that flow is unchanged.
