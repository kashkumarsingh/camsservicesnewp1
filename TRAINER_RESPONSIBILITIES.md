# Trainer Responsibilities – Specification and Implementation Status

**Purpose:** Single source of truth for what trainers can and cannot do in the CAMS app. Use this for product, UX, and implementation alignment.

---

## 1. Sessions they're assigned to

| Responsibility | Detail | Implementation status |
|----------------|--------|------------------------|
| View assigned bookings and sessions | Calendar and list | **Done.** Trainer dashboard (`/dashboard/trainer`), `TrainerSessionsCalendar`, `BookingsList`, `TrainerBookingController::index`. |
| Confirm or decline session assignments | When admin (or system) assigns them | **Backend done.** `TrainerScheduleController::confirmAssignment`, `declineAssignment`; `ProcessTrainerDeclineAndTryNextAction`. **Gap:** No UI in trainer session modal/dashboard to confirm/decline (pending confirmation state not surfaced; buttons not wired). |
| Do not create sessions | Parents book; admin can assign | **Enforced.** `handleAddSession` shows toast that sessions are assigned by parents. No trainer create-booking flow. |

**Relevant code:**  
`frontend/src/app/dashboard/trainer/`, `TrainerSessionDetailModal.tsx`, `TrainerBookingController.php`, `TrainerScheduleController.php` (confirm/decline), `DashboardShell` nav (Overview, Schedule, Bookings via top nav).

---

## 2. Running a session

| Responsibility | Detail | Implementation status |
|----------------|--------|------------------------|
| Clock in / clock out | Time tracking for pay and records | **Done.** `TrainerTimeEntryController` (clock-in/out, index), `TimeEntry` model, `TrainerSessionDetailModal` time clock, `TrainerTimeEntryRepository`. |
| Update "current activity" during session | e.g. "Horse riding" | **Done.** `TrainerScheduleController::updateCurrentActivity`, session detail modal current-activity dropdown. |
| Add and edit session notes | Itinerary notes, etc. | **Done.** `TrainerScheduleController::getNotes`, `createNote`; notes in session modal. |
| Manage session activities | Assign/confirm/override activities for that session | **Done.** `TrainerActivityController` (getSessionActivities, assignActivity, confirmActivities, overrideActivityCount, removeActivity), `SessionActivityPlanner`. |
| Mark attendance | For the session | **Done.** `TrainerScheduleController::markAttendance`, `ScheduleAttendance`; API ready. **Check:** Attendance UI in trainer session modal may be partial (confirm in UI). |
| Mark session outcome | Completed, Cancelled, or No show (with notes) | **Done.** `TrainerBookingController::updateScheduleStatus`, `TrainerSessionDetailModal` (Mark completed / Cancel / No show with optional notes). |
| Add activity logs | What was done, outcomes; can be required before marking completed | **Done.** `TrainerActivityLogController`, `ActivityLogList` / `ActivityLogForm` in session modal; modal prompts to add log before completing if none. |

**Relevant code:**  
`TrainerSessionDetailModal.tsx`, `TrainerScheduleController.php`, `TrainerActivityController.php`, `TrainerActivityLogController.php`, `TrainerBookingController::updateScheduleStatus`.

---

## 3. Time and pay

| Responsibility | Detail | Implementation status |
|----------------|--------|------------------------|
| View timesheets | Clock-in/clock-out history | **Partial.** Backend: `TrainerTimeEntryController::index`. Frontend timesheets page exists (`/dashboard/trainer/timesheets`) but uses **mock data**; not wired to `time-entries` API. |
| View session payments | What they're owed / paid for sessions | **Partial.** Backend: `TrainerSessionPayController::index`, `show`. Frontend: no dedicated session-payments page wired to these APIs. |

**Relevant code:**  
`backend/app/Http/Controllers/Api/TrainerTimeEntryController.php`, `TrainerSessionPayController.php`, `frontend/src/app/dashboard/trainer/timesheets/page.tsx` (mock), `API_ENDPOINTS` for `time-entries` and `session-payments`.

---

## 4. Profile and availability

| Responsibility | Detail | Implementation status |
|----------------|--------|------------------------|
| Keep profile up to date | Name, bio, image, service area, postcodes, travel radius | **Done.** `TrainerProfileController::show`, `update`, `uploadImage`; trainer settings/profile UI. |
| Set availability | Working hours and rules | **Done.** `TrainerProfileController::updateAvailability`; availability page/settings. |
| Manage qualifications | Certifications, expiry dates | **Done.** `TrainerProfileController` (uploadQualification, deleteQualification). |
| Manage emergency contacts | **Done.** `TrainerEmergencyContactController` (index, store, update, destroy). |

**Relevant code:**  
`TrainerProfileController.php`, `TrainerEmergencyContactController.php`, trainer settings and availability pages.

---

## 5. Safeguarding

| Responsibility | Detail | Implementation status |
|----------------|--------|------------------------|
| Report concerns | Log a safeguarding concern about a child | **Done.** `SafeguardingConcernModal`, `useSubmitSafeguardingConcern`; trainer dashboard can open modal and submit. |
| View concerns | Related to children they have sessions with (from parents/others) | **Done.** `TrainerSafeguardingConcernController::index`. |
| Acknowledge concerns and add trainer notes | For the Designated Safeguarding Lead (DSL) | **Done.** `TrainerSafeguardingConcernController::update` (PATCH). |

**What trainers do not do:** Triage or close safeguarding concerns; that's admin/DSL.

**Relevant code:**  
`TrainerSafeguardingConcernController.php`, `SafeguardingConcernModal`, trainer dashboard safeguarding entry point.

---

## 6. Session notes for parents

| Responsibility | Detail | Implementation status |
|----------------|--------|------------------------|
| Create session notes parents can see | e.g. what the child did, progress, follow-up | **Done.** Schedule notes with `is_private: false` flow; `ParentSessionNotesController` returns non-private trainer notes for completed sessions; parents see them in Session notes / Progress. |

**Relevant code:**  
`TrainerScheduleController` (notes), `ParentSessionNotesController`, `SessionNotesCard` / parent progress and session notes UI.

---

## 7. Clients and progress (as built in the app)

| Responsibility | Detail | Implementation status |
|----------------|--------|------------------------|
| Clients | View the children/families they support | **Placeholder.** `/dashboard/trainer/clients` exists; copy says "when that page is wired to real data". Not yet wired to trainer's assigned children/families. |
| Progress | View progress/outcomes for those children | **Placeholder.** `/dashboard/trainer/progress` exists; to be wired when progress data and APIs are defined. |

**Relevant code:**  
`frontend/src/app/dashboard/trainer/clients/page.tsx`, `frontend/src/app/dashboard/trainer/progress/page.tsx`.

---

## What trainers do not do

- **Do not create or delete bookings.** Parents book; admin may assign. Enforced in UI and flow.
- **Do not approve or reject other trainers.** That's admin.
- **Do not change package or payment settings.** That's parent/admin.
- **Do not triage or close safeguarding concerns.** That's admin/DSL.

---

## Summary of gaps and next steps

| Gap | Priority | Action |
|-----|----------|--------|
| Confirm/decline assignment UI | High | Surface `trainer_assignment_status === pending_confirmation` in trainer session modal or list; add "Confirm" / "Decline" actions calling existing APIs. |
| Timesheets page real data | Medium | Replace mock data in `/dashboard/trainer/timesheets` with `time-entries` API (and optional pay-period/session-payments if needed). |
| Session payments page | Medium | Add a "Session payments" or "Pay" page under trainer dashboard wired to `session-payments` index/show. |
| Clients page real data | Lower | Wire `/dashboard/trainer/clients` to trainer's assigned children/families (e.g. from bookings/participants). |
| Progress page real data | Lower | Wire when progress/outcomes model and APIs exist. |
| Attendance UI in session modal | Verify | Confirm attendance is visible and editable in `TrainerSessionDetailModal`; if not, add UI calling `PUT schedules/{id}/attendance`. |

---

## Clean Architecture compliance

- Trainer capabilities are scoped to **trainer** API routes and **trainer** dashboard routes; no booking creation or admin-only actions.
- Backend: Controller -> Action/Service -> Model; frontend: Repository -> API client -> `API_ENDPOINTS`.
- Safeguarding and session notes respect visibility rules (trainer sees only own/related data; parents see only non-private notes for their children).

---

*Last updated: 2025-02-16. Align product and engineering against this doc when changing trainer flows.*
