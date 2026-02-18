# Centralised Notification System

## Overview

All application notifications (in-app bell, email, WhatsApp) go through a **single entry point**: `INotificationDispatcher::dispatch(NotificationIntent $intent)`. The dispatcher handles:

- **Deduplication** – Same intent + entity + recipient within a configurable window is not sent again (via `notification_logs` table).
- **Rate limiting** – Per user, per channel, per day (configurable in `config/notifications.php`).
- **Channel routing** – Each intent type is mapped to channels (in_app, email, whatsapp) in config.
- **Audit** – Every send (or skip) is logged in `notification_logs` for debugging and analytics.

No ad-hoc `Notification::route()`, `Mail::to()`, or `DashboardNotificationService::notify()` from feature code; use the dispatcher and the intent factory.

## Architecture

| Layer | Role |
|-------|------|
| **Domain** | `NotificationIntent`, `NotificationRecipientSet`, `IntentType` – value objects and intent types. |
| **Application** | `INotificationDispatcher`, `NotificationIntentFactory` – single API and intent building from domain models. |
| **Infrastructure** | `CentralNotificationDispatcher`, `InAppChannel`, `EmailChannel`, `WhatsAppChannel`, `NotificationLog` – dispatch logic, channel senders, audit. |
| **Config** | `config/notifications.php` – channels per intent, Notification/Mailable classes, rate limits, entity→model map. |

## Usage

### From application code (listeners, controllers, jobs)

1. Build an intent via `NotificationIntentFactory::...` (e.g. `bookingConfirmed($booking)`, `newBookingToAdmin($booking)`).
2. Dispatch it: `app(INotificationDispatcher::class)->dispatch($intent)`.

Example (listener):

```php
use App\Contracts\Notifications\INotificationDispatcher;
use App\Services\Notifications\NotificationIntentFactory;

app(INotificationDispatcher::class)->dispatch(
    NotificationIntentFactory::bookingConfirmed($event->booking)
);
```

Example (controller – trainer assigned + session booked):

```php
$dispatcher = app(INotificationDispatcher::class);
$dispatcher->dispatch(NotificationIntentFactory::sessionBookedToTrainer($schedule->fresh()));
$dispatcher->dispatch(NotificationIntentFactory::trainerAssignedToParent($schedule->fresh()));
```

### Adding a new notification type

1. **Intent type** – Add a constant to `App\Domain\Notifications\IntentType` and, if needed, a deduplication window in `IntentType::deduplicationWindowMinutes()`.
2. **Config** – In `config/notifications.php`:
   - Add to `channels_per_intent` (e.g. `['in_app', 'email']`).
   - For email: add to `intent_to_notification_class` (Laravel Notification class) or `intent_to_mailable_class` (Mailable class).
   - For in_app: add to `intent_to_user_notification_type` (UserNotification::TYPE_*).
3. **Entity model** – If the intent is keyed by an entity (booking, schedule, child, etc.), ensure `entity_model` in config maps that entity type to the Eloquent model class (for loading the subject in the email channel).
4. **Factory** – Add a static method on `NotificationIntentFactory` that builds `NotificationIntent` with the right `intentType`, `entityType`, `entityId`, `recipients`, and `payload` (title, message, link for in_app; `notification_args` for Notification/Mailable constructor extras).

## Intelligence

- **Deduplication** – Before sending, the dispatcher checks `notification_logs` for the same intent + entity + channel + recipient within the intent’s deduplication window. If found, the send is skipped and a `skipped_duplicate` log entry is written.
- **Rate limiting** – For user-based recipients, the dispatcher checks how many notifications were sent to that user on that channel in the last 24 hours. If the count is at or above the limit in config, the send is skipped and a `skipped_rate_limit` log entry is written.
- **Admin in_app** – When the intent has only admin emails (no user IDs) but the channel is in_app, the dispatcher resolves admin/super_admin/editor user IDs and sends in-app to those users.

## Files

| File | Purpose |
|------|---------|
| `app/Domain/Notifications/NotificationIntent.php` | Value object: intent type, entity, recipients, payload. |
| `app/Domain/Notifications/NotificationRecipientSet.php` | User IDs, emails, WhatsApp numbers. |
| `app/Domain/Notifications/IntentType.php` | Intent type constants and dedupe window. |
| `app/Contracts/Notifications/INotificationDispatcher.php` | Dispatcher contract. |
| `app/Contracts/Notifications/INotificationChannel.php` | Channel contract (in_app, email, whatsapp). |
| `app/Services/Notifications/CentralNotificationDispatcher.php` | Orchestrator: dedupe, rate limit, channel dispatch. |
| `app/Services/Notifications/NotificationIntentFactory.php` | Builds intents from Booking, Schedule, Child, etc. |
| `app/Services/Notifications/Channels/InAppChannel.php` | Creates UserNotification via DashboardNotificationService. |
| `app/Services/Notifications/Channels/EmailChannel.php` | Sends via Laravel Notification or Mailable (config-driven). |
| `app/Services/Notifications/Channels/WhatsAppChannel.php` | Sends via WhatsappNotificationService. |
| `app/Models/NotificationLog.php` | Audit/dedupe/rate-limit log. |
| `config/notifications.php` | Channels per intent, Notification/Mailable map, rate limits, entity_model. |
| `database/migrations/..._create_notification_log_table.php` | `notification_logs` table. |

## Migration from legacy code

- **Listeners** – Prefer dispatching an intent from the factory instead of calling `EmailNotificationService` or `DashboardNotificationService` directly. Already migrated: booking confirmation, admin new booking, payment confirmation, admin payment received, booking cancellation, payment failed, trainer session booked, admin session booked.
- **Controllers** – Replace direct `EmailNotificationService` / `DashboardNotificationService` calls with `INotificationDispatcher::dispatch(NotificationIntentFactory::...)`. Already migrated: TrainerScheduleController (session confirmed), TrainerAbsenceRequestController.
- **Jobs** – Replace ad-hoc Notification/Mail/WhatsApp logic with a single `dispatch(NotificationIntentFactory::...)`. Already migrated: SendContactSubmissionNotifications.
- **Scheduled jobs** – SendSessionTodayNotifications, SendSessionReminders, SendDraftBookingReminders, SendPaymentReminders can be migrated to build intents (e.g. sessionToday, sessionReminder24h, draftBookingReminder, paymentReminder) and dispatch them; the dispatcher then handles dedupe and channels.

## Legacy EmailNotificationService

`EmailNotificationService` / `LaravelEmailNotificationService` remain for flows that are not yet migrated (e.g. activity confirmation with compound subject, or child/user approval Mailables). New code should use the dispatcher; existing call sites can be moved over incrementally.
