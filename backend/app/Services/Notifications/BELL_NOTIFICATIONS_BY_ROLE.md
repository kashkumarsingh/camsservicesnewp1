# Notification bell – when each role gets in-app notifications

The dashboard notification bell (in-app) shows items from `user_notifications` for the logged-in user. Below is when **parents**, **trainers**, and **admin** receive bell notifications.

---

## Parents (bell on parent dashboard)

| When | Bell notification type | Trigger |
|------|------------------------|--------|
| Booking confirmed | Booking received | New booking is confirmed (payment/booking flow). |
| Payment received | Payment received | Payment for their booking is confirmed. |
| Payment failed | Payment failed | Payment attempt failed. |
| Trainer assigned to a session | Trainer assigned | Admin (or system) assigns a trainer to one of their sessions. |
| Activities confirmed for a session | Activity confirmed | Trainer confirms activities for a session. |
| Session cancelled | Session cancelled | One of their sessions is cancelled. |
| Session today | Session today | Scheduled job: session is today (reminder). |
| Session finished | Session finished | Trainer marks a session as completed; parent gets link to view activity logs and session details. |
| Child approved | Child approved | Admin approves one of their children. |
| Child rejected | Child rejected | Admin rejects one of their children. |
| Child checklist submitted | Child checklist submitted | They (or admin) submit a checklist for a child; parent is notified. |
| User (account) approved | User approved | Admin approves their account. |
| User (account) rejected | User rejected | Admin rejects their account. |

---

## Trainers (bell on trainer dashboard)

| When | Bell notification type | Trigger |
|------|------------------------|--------|
| Session assigned / booked | Session booked | Admin assigns them to a session, or a session is booked for them. |
| Session confirmation requested | Session booked | Admin assigns them and they need to confirm/decline. |
| Session cancelled | Session cancelled (trainer) | A session they were assigned to is cancelled. |
| Forgot to clock out | Forgot clock out | System detects they didn’t clock out after a session. |
| Session ending soon | Session ending soon | Scheduled reminder that a session is ending soon. |
| Trainer application approved | Application approved | Admin approves their trainer application. |
| Trainer application rejected | Application rejected | Admin rejects their trainer application. |
| More info requested on application | Application info requested | Admin requests more information on their application. |

---

## Admin (bell on admin dashboard)

| When | Bell notification type | Trigger |
|------|------------------------|--------|
| New booking | New booking | A new booking is created (parent or system). |
| Payment received | Payment received | Payment is received for a booking. |
| Child approval needed | Child approval required | A new child is registered and needs approval. |
| Session needs trainer | Session needs trainer | A confirmed session has no trainer assigned. |
| Trainer application submitted | Trainer application submitted | Someone submits a trainer application. |
| Absence request submitted | Absence request submitted | A trainer submits an absence request. |
| Trainer availability updated | Trainer availability updated | A trainer updates their calendar (marks dates available/unavailable). |
| Child checklist submitted (admin) | Child checklist submitted (admin) | A parent submits a child checklist (admin sees it for review). |

---

## Notes

- **Recipients:** Parents get notifications for their own user/children/bookings. Trainers get notifications for their assigned sessions and their application. Admin (and editor) get notifications for system-wide events (bookings, payments, children, sessions, applications, absences).
- **Channels:** The bell is the **in_app** channel. Many of these also send **email** (see `config/notifications.php` → `channels_per_intent` and `intent_to_notification_class`).
- **No bell:** Contact form submissions use email/WhatsApp only (no in_app). Session reminder 24h and draft booking reminders are email-only. Session booked (admin copy) is email-only.
