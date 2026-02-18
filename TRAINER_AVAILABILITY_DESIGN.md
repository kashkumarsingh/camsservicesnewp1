# Trainer availability – centralized design

Single source of truth for trainer calendar availability (date-level and time-level), assignment rules, and API contract.

## Overview

- **Who writes:** Trainers only (via trainer dashboard calendar).
- **Who reads:** Trainer dashboard, admin trainer availability panel, admin schedule, and assignment logic.
- **Storage:** `trainer_availabilities` (specific-date and weekly patterns), `trainer_absence_requests` (approved/pending absence).

## Backend – single source of truth

### Model

- **`TrainerAvailability`**  
  - `trainer_id`, `specific_date` (nullable), `day_of_week` (nullable), `start_time`, `end_time`, `is_available`, `reason`.  
  - **Specific-date:** `specific_date` set; `start_time`/`end_time` null = whole-day available or whole-day blocked.  
  - **Weekly:** `specific_date` null; `day_of_week` (0–6), `start_time`/`end_time` define recurring windows.

### Actions (domain logic)

| Action | Purpose | Used by |
|--------|--------|--------|
| **GetTrainerAvailabilityDatesAction** | Read available + unavailable dates in a range (specific-date only). | TrainerAvailabilityDatesController (GET), AdminTrainerController::availabilityDates (GET) |
| **SetTrainerAvailabilityDatesAction** | Write available + unavailable dates for a range; replaces existing specific-date records in range. | TrainerAvailabilityDatesController (PUT) only |
| **CheckTrainerAvailabilityAction** | Can a trainer be assigned at (date, startTime, endTime)? Respects approved absence, specific-date (whole-day and time windows), then weekly. | Assignment flows, validation |

### Config

- **`config/booking.php`**  
  - `availability_date_range_max_days` (default 93). Used by both get/set availability-dates actions. Env: `BOOKING_AVAILABILITY_MAX_DAYS`.

### API contract (availability-dates)

- **GET** (trainer: `/api/v1/trainer/availability-dates`, admin: `/api/v1/admin/trainers/{id}/availability-dates`)  
  - Query: `date_from`, `date_to` (Y-m-d).  
  - Response: `data.dates` (available), `data.unavailable_dates` (explicitly unavailable). Same shape for trainer and admin.
- **PUT** (trainer only: `/api/v1/trainer/availability-dates`)  
  - Body: `date_from`, `date_to`, `dates` (available), `unavailable_dates` (optional).  
  - Replaces all specific-date availability in range.

### Assignment rules (CheckTrainerAvailabilityAction)

1. **Approved absence** on the date → not available.
2. **Specific date:**  
   - Any record with `is_available = false` and (whole-day or overlapping time) → not available.  
   - Any record with `is_available = true` and (whole-day or session within window) → available.  
   - If only specific records exist and none match as available → not available.
3. **Weekly:** `day_of_week`, `is_available = true`, session within `start_time`/`end_time` → available.  
   If there are weekly rules but none match → not available.
4. **No availability records** → treat as available (backward compatibility).

### Business rule: trainer marks unavailable and has confirmed sessions (illness / emergency)

**Scenario:** The trainer was available, a session was scheduled/confirmed (e.g. 13:30–16:30 with "Test child"). Later the trainer cannot do that date (e.g. illness, emergency) and goes to their dashboard to mark the date as unavailable.

**Rule:** The trainer **can** mark the date as unavailable. The system **allows** the update and **automatically releases** any assigned sessions on those dates: each session is treated like a trainer decline — (1) trainer is unassigned, (2) the system tries to assign the next available trainer (up to max attempts), (3) if no other trainer is available or accepts, the session **remains unassigned** and **admin is notified** to assign manually. The trainer does not have to decline each session when ill or in an emergency.

**Reason:** Supports real-life cases (illness, emergency) where the trainer must mark themselves unavailable immediately. Avoids inconsistent state by releasing sessions in the same request; parents get reassignment or admin follows up.

**Implementation:** `SetTrainerAvailabilityDatesAction` applies the availability update in a transaction, then calls `findAssignedSessionsOnDates()` for the now-unavailable dates. For each session found, it runs `ProcessTrainerDeclineAndTryNextAction` with reason *"Trainer marked as unavailable (e.g. illness or emergency)."* so sessions are reassigned or admin is notified.

### Business rule: trainer does not confirm (no response)

**Scenario:** A session is auto-assigned to a trainer who does not auto-accept; the trainer gets a confirmation request (email/dashboard) but neither confirms nor declines.

**Rule:** If the trainer does not confirm (or decline) within **configurable hours** (default 24), the session is **escalated** as if the trainer had declined: the system unassigns that trainer, tries the next available trainer (up to max attempts), or notifies admin if no one can be assigned. So sessions do not stay in "pending confirmation" indefinitely.

**Config:** `config('booking.trainer_confirmation_timeout_hours')` (env: `BOOKING_TRAINER_CONFIRMATION_TIMEOUT_HOURS`, default 24).

**Implementation:** `EscalatePendingTrainerConfirmationsJob` runs hourly, finds sessions where `trainer_assignment_status = pending_trainer_confirmation` and `trainer_confirmation_requested_at` is older than the configured timeout, and calls `ProcessTrainerDeclineAndTryNextAction` with reason *"Confirmation timeout (no response within X hours)."*

## Frontend – single source of truth

### API contract and parsing

- **`frontend/src/core/application/trainer/dto/TrainerAvailabilityDatesDTO.ts`**  
  - **TrainerAvailabilityDatesPayload:** `dates`, `unavailable_dates` (API response payload).  
  - **TrainerAvailabilityDatesResult:** `availableDates`, `unavailableDates` (normalised camelCase).  
  - **parseAvailabilityDatesPayload(data):** Normalises raw response into `TrainerAvailabilityDatesResult`. Use for all consumers.

### Consumers

- **Trainer dashboard:** `TrainerAvailabilityDatesRepository` (getDates/setDates) uses DTO and parser. Dashboard state: `availabilityDates`, `unavailableDates`; save sends both to PUT.
- **Admin trainer availability panel:** `useAdminTrainerAvailabilityDates` uses same DTO and `parseAvailabilityDatesPayload`. Panel also fetches absence via `ADMIN_TRAINER_ABSENCE_DATES`; cells show available (green), unavailable (red), approved absence (rose), pending absence (amber).

### Endpoints (centralised)

- Trainer: `API_ENDPOINTS.TRAINER_AVAILABILITY_DATES` (GET/PUT).  
- Admin: `API_ENDPOINTS.ADMIN_TRAINER_AVAILABILITY_DATES(trainerId)` (GET), `API_ENDPOINTS.ADMIN_TRAINER_ABSENCE_DATES(trainerId)` (GET).

## Summary

- **Backend:** One read action (GetTrainerAvailabilityDatesAction), one write action (SetTrainerAvailabilityDatesAction), one assignment check (CheckTrainerAvailabilityAction). Config for max range. Controllers delegate; no duplicated query or write logic.
- **Frontend:** One DTO + parser for availability-dates; repository and admin hook use it. Same contract for trainer and admin.
- **Behaviour:** Trainer sets available/unavailable (and optionally absence requests). Admin sees the same data read-only. Assignment respects approved absence and explicit unavailable (whole-day or time window).

---
*Move to `docs/cleanarchitecture/features/trainer-availability.md` if you keep feature docs under docs/.*
