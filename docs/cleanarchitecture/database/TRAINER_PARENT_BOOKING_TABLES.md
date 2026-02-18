## Trainer, Parent–Child, and Booking Tables – Overview

**Date:** 2026-02-10  
**Purpose:** Document which database tables relate to **trainers**, **parents/children**, and **bookings**, so we can safely rethink the trainer domain and its UX (as per the provided staff-portal screenshots) without accidentally breaking unrelated areas.

---

## 1. Trainer-Related Tables

These tables primarily store trainer data or operational data that is owned by, or driven from, a trainer.

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `trainers` | Core trainer profile: personal info, biography, qualifications, rates, etc. | Linked to `users` (login identity), `activity_trainer`, `trainer_availability`, `trainer_notes`, `trainer_emergency_contacts`, `time_entries`, `safeguarding_concerns`. |
| `trainer_applications` | Stores incoming applications from potential trainers before they become active trainers. | Often promoted into a row in `trainers` (and a `users` record) once approved. |
| `trainer_emergency_contacts` | Emergency contact details for each trainer. | `trainer_id` → `trainers.id`. |
| `trainer_availability` | Availability / unavailability patterns for each trainer (dates, time windows). Used to power calendar views like “Available”, “Unavailable”. | `trainer_id` → `trainers.id`; used alongside `booking_schedules` and `sessions` to determine what can be booked. |
| `trainer_notes` | Internal notes about a trainer (performance, reminders, private comments). | `trainer_id` → `trainers.id`; may also be linked conceptually to sessions or bookings. |
| `activities` | Catalogue of activities or roles a trainer can deliver (e.g. “Flexi Practitioner 1:1”). | Connected to trainers via `activity_trainer`; may be used by `booking_schedule_activities`. |
| `activity_trainer` | Pivot linking trainers to activities they are qualified for / can deliver. | `trainer_id` → `trainers.id`, `activity_id` → `activities.id`. Drives which shifts/sessions a trainer can be assigned. |
| `activity_logs` | Operational logs for activities and related trainer actions (audit-style). | Typically links back to `activities`, `trainers`, and sometimes `booking_schedules` or `sessions`. |
| `time_entries` | Detailed time-tracking rows (timesheets) for trainers – start/end times, duration, and pay calculation basis. | `trainer_id` → `trainers.id`; may reference `booking_schedules` / `sessions` for context; powers timesheets and pay calculations. |
| `schedule_attendance` | Per-session/person attendance flags (present, absent, etc.) – used heavily in staff-style dashboards. | Usually links to `booking_schedules` and indirectly to `trainers` via the assigned trainer on the schedule. |
| `session_completions` | Marks individual sessions or schedules as completed (with metadata about completion). | Linked to `booking_schedules` / `sessions`, and indirectly to `trainers`. |
| `safeguarding_concerns` | Records safeguarding concerns raised around sessions, trainers, or children. | Likely references `trainers`, `children`, and/or `bookings`; critical for compliance but domain-owned by safeguarding, not bookings. |

> **Rethink boundary:** When redesigning the trainer dashboard and mobile UX, the core trainer domain will centre on `trainers`, `trainer_availability`, `time_entries`, `schedule_attendance`, `session_completions`, `activity_trainer`, and `activities`. These should be treated as the backbone of the **staff portal** experience you showed in the screenshots.

---

## 2. Parent–Child-Related Tables

These tables represent parents, children, and any checklist / safeguarding data attached to them.

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `users` | All authenticated users (parents, trainers, admins). Parents typically have a specific role. | Linked to `roles` / `permissions` (Spatie), and to domain entities such as `children`, `bookings`, `user_checklists`. |
| `children` | Stores each child’s core data (name, DOB, medical flags, etc.). | Linked to a parent in `users` (e.g. `parent_id`); referenced by `bookings`, `booking_participants`, `child_checklists`, `safeguarding_concerns`. |
| `child_checklists` | Per-child checklist data (e.g. preferences, medical info, required documents). | `child_id` → `children.id`; may also reference `users` (who created/updated). |
| `user_checklists` | Checklist data directly on a user (e.g. parent onboarding, consents). | `user_id` → `users.id`. |
| `safeguarding_concerns` | Safeguarding incidents / concerns connected to a child and/or trainer. | Typically references `children` and `trainers`; may also reference bookings or sessions. |

> **Note:** Parents mostly interact through `users`, `children`, and `bookings`. Checklists and safeguarding tables add compliance/quality-of-care layers on top of that core.

---

## 3. Booking-Related Tables

These tables form the booking engine: bookings, schedules, session details, and payment-related structures that power calendars and timesheets like in the screenshots.

### 3.1 Core Booking & Schedule Tables

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `bookings` | Top-level booking record (who booked, for which child(ren), overall status). | Links to `users` (parent), `children` (via `booking_participants`), `booking_schedules`, `booking_status_changes`, `booking_audit_logs`, `payments`. |
| `booking_schedules` | Individual scheduled blocks within a booking (date, time, duration, which trainer, which location). This is what appears as an item in a calendar. | `booking_id` → `bookings.id`; may reference `trainers`, `activities`, and underlying session/room/location data. |
| `booking_schedule_activities` | Which activities are attached to a given schedule instance (e.g. “Event Steward” for that shift). | `booking_schedule_id` → `booking_schedules.id`; `activity_id` → `activities.id`. |
| `booking_participants` | Links bookings/schedules to individual children or participants. | References `bookings` and `children`; sometimes also `booking_schedules` if scoped to specific sessions. |
| `booking_schedule_changes` | History of changes to a schedule (time changes, trainer changes, cancellations). | `booking_schedule_id` → `booking_schedules.id`. |
| `booking_status_changes` | Audit of booking status transitions (e.g. Pending → Approved → Cancelled). | `booking_id` → `bookings.id`. |
| `booking_audit_logs` | Low-level audit events related to bookings and schedules (who did what, and when). | References `bookings`, `booking_schedules`, and the acting `users`. |

### 3.2 Attendance, Timesheets, and Pay

These are operationally part of the booking engine but also feed into trainer UX (timesheets, pay) and compliance.

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `schedule_attendance` | Per-schedule/person attendance (present, absent, etc.). | Links to `booking_schedules` and usually to `children` and `trainers`. |
| `session_completions` | Flags schedules/sessions as completed, often with timestamps/outcome info. | References `booking_schedules` / sessions; downstream impact on timesheets and pay. |
| `time_entries` | Fine-grained time tracking rows used to build timesheets and pay records (per trainer, per shift). | `trainer_id` → `trainers.id`; may reference `booking_schedules` or sessions. |
| `payments` | Unified payment records for bookings (amounts, status, method, reference IDs). | References `bookings` (and potentially `users` as payer); replaces old `booking_payments`. |

### 3.3 Supporting Catalogues (Used by Booking Flows)

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `packages` | Commercial packages that bookings can be based on. | Linked via application-layer logic to `bookings` and `payments`. |
| `package_activity` | Links packages to activities (what is included in a package). | `package_id` → `packages.id`; `activity_id` → `activities.id`. |
| `activities` | Activity catalogue (also listed in the trainer section). | Shared between training/HR domain and bookings; determines the role/shift type. |

---

## 4. How to Use This When Rethinking the Trainer Domain

- **Trainer-focused redesign (staff portal style):**  
  Concentrate on `trainers`, `trainer_availability`, `time_entries`, `schedule_attendance`, `session_completions`, `activity_trainer`, and `activities`. These power calendars, open/assigned shifts, timesheets, and availability views for trainers.

- **Parent/child experience:**  
  Primarily use `users` (as parents), `children`, `bookings`, `booking_participants`, `child_checklists`, and `user_checklists`. This supports dashboards showing upcoming sessions for a child.

- **Booking engine (shared between both):**  
  Treat `bookings` and `booking_schedules` as the central bridge between parent–child data and trainer data. Any new UX (web or mobile) should read/write through these tables rather than inventing parallel structures.

