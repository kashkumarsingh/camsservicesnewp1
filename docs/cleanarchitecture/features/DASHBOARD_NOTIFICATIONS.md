# Dashboard Notifications (In-App Bell)

## Overview

A **centralised, intelligent** in-app notification system used across the product. Whenever something happens that a user (parent, trainer, or admin) should see on their dashboard, we create a notification in addition to any email.

- **Backend:** `user_notifications` table, `UserNotification` model, `DashboardNotificationService`, API under `GET/PATCH/POST /api/v1/notifications`.
- **Frontend:** Bell in `DashboardShell` shows count and dropdown; all authenticated roles use the same bell and API.

## When to Add a Notification

1. **Use `DashboardNotificationService`** – single place to create notifications.
   - `notify(User|int $userOrId, string $type, string $title, string $message, ?string $link = null)` for one user.
   - `notifyAdmins(string $type, string $title, string $message, ?string $link = null)` for all admin/super_admin users.

2. **Use a `UserNotification::TYPE_*` constant** so the frontend can style or filter by type if needed.

3. **Prefer wiring in `LaravelEmailNotificationService`** – for any flow that already sends an email, add a dashboard notification in the same method (same event, same recipient). That way “email + in-app” stay in one place.

4. **If there is no email** (e.g. child checklist submitted), call `DashboardNotificationService` from the controller or listener that performs the action.

## Notification Types (UserNotification)

| Type | Typical recipient | Example |
|------|-------------------|--------|
| `trainer_assigned` | Parent | Trainer assigned to session |
| `booking_confirmed` | Parent | Booking received |
| `booking_cancelled` | Parent | Booking cancelled |
| `payment_confirmed` | Parent | Payment received |
| `payment_failed` | Parent | Payment failed |
| `activity_confirmed` | Parent | Session activities confirmed |
| `session_cancelled` | Parent | Session cancelled |
| `child_approved` / `child_rejected` | Parent | Child application outcome |
| `child_checklist_submitted` | Parent | Checklist submitted |
| `user_approved` / `user_rejected` | User | Account outcome |
| `session_booked` / `session_cancelled_trainer` | Trainer | Session assigned/cancelled |
| `application_approved` / `application_rejected` / `application_info_requested` | Trainer (if user exists) | Application outcome |
| `new_booking` / `payment_received` / `child_approval_required` / `session_needs_trainer` / `trainer_application_submitted` / `child_checklist_submitted_admin` | Admins | Admin alerts |

## Links

Use **frontend paths** (no origin):

- Parent: `/dashboard/parent`, `/dashboard/parent/bookings`, `/dashboard/parent/bookings/{id}/sessions`, `/dashboard/parent/children`
- Trainer: `/dashboard/trainer`, `/dashboard/trainer/bookings`
- Admin: `/dashboard/admin/bookings`, `/dashboard/admin/children`, `/dashboard/admin/trainer-applications`, etc.

## Adding a New Flow

1. Add a new `TYPE_*` constant on `UserNotification` if needed.
2. Where the action happens (email service method or controller):
   - Resolve `DashboardNotificationService` (e.g. `app(DashboardNotificationService::class)`).
   - Call `notify()` or `notifyAdmins()` with the right type, title, message, and link.
3. No frontend change required for listing; the bell already shows all types. Optionally add type-based styling or filtering later.
