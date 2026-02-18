<?php

namespace App\Services\Notifications;

use App\Domain\Notifications\IntentType;
use App\Domain\Notifications\NotificationIntent;
use App\Domain\Notifications\NotificationRecipientSet;
use App\Models\Booking;
use App\Models\BookingSchedule;
use App\Models\Child;
use App\Models\ContactSubmission;
use App\Models\SiteSetting;
use App\Models\Trainer;
use App\Models\TrainerApplication;
use App\Models\User;

/**
 * Builds NotificationIntent from domain models so callers use a single API.
 */
class NotificationIntentFactory
{
    public static function bookingConfirmed(Booking $booking): NotificationIntent
    {
        $pkg = $booking->package?->name ?? 'your package';
        $ref = $booking->reference ?? '';
        return new NotificationIntent(
            intentType: IntentType::BOOKING_CONFIRMED,
            entityType: 'booking',
            entityId: (string) $booking->id,
            recipients: $booking->user_id
                ? NotificationRecipientSet::forUser($booking->user_id)
                : NotificationRecipientSet::forEmails($booking->parent_email ? [$booking->parent_email] : []),
            payload: [
                'title' => 'Booking received',
                'message' => 'Your booking for ' . $pkg . ' (Ref ' . $ref . ') has been received.',
                'link' => '/dashboard/parent',
            ],
            entityKey: 'booking:' . $booking->id,
        );
    }

    public static function bookingCancelled(Booking $booking, ?string $reason = null): NotificationIntent
    {
        $ref = $booking->reference ?? '';
        $msg = 'Your booking (Ref ' . $ref . ') has been cancelled.';
        if ($reason) {
            $msg .= ' ' . $reason;
        }
        return new NotificationIntent(
            intentType: IntentType::BOOKING_CANCELLED,
            entityType: 'booking',
            entityId: (string) $booking->id,
            recipients: $booking->user_id
                ? NotificationRecipientSet::forUser($booking->user_id)
                : NotificationRecipientSet::forEmails($booking->parent_email ? [$booking->parent_email] : []),
            payload: [
                'title' => 'Booking cancelled',
                'message' => $msg,
                'link' => '/dashboard/parent/bookings',
                'notification_args' => [$reason],
            ],
            entityKey: 'booking:' . $booking->id,
        );
    }

    public static function paymentConfirmed(Booking $booking): NotificationIntent
    {
        $ref = $booking->reference ?? '';
        return new NotificationIntent(
            intentType: IntentType::PAYMENT_CONFIRMED,
            entityType: 'booking',
            entityId: (string) $booking->id,
            recipients: $booking->user_id
                ? NotificationRecipientSet::forUser($booking->user_id)
                : NotificationRecipientSet::forEmails($booking->parent_email ? [$booking->parent_email] : []),
            payload: [
                'title' => 'Payment received',
                'message' => 'We\'ve received your payment for booking Ref ' . $ref . '. Thank you.',
                'link' => '/dashboard/parent',
            ],
            entityKey: 'booking:' . $booking->id,
        );
    }

    public static function paymentFailed(Booking $booking, string $error): NotificationIntent
    {
        $ref = $booking->reference ?? '';
        return new NotificationIntent(
            intentType: IntentType::PAYMENT_FAILED,
            entityType: 'booking',
            entityId: (string) $booking->id,
            recipients: $booking->user_id
                ? NotificationRecipientSet::forUser($booking->user_id)
                : NotificationRecipientSet::forEmails($booking->parent_email ? [$booking->parent_email] : []),
            payload: [
                'title' => 'Payment failed',
                'message' => 'Payment for booking Ref ' . $ref . ' could not be processed. ' . $error,
                'link' => '/dashboard/parent',
                'notification_args' => [$error],
            ],
            entityKey: 'booking:' . $booking->id,
        );
    }

    public static function newBookingToAdmin(Booking $booking): NotificationIntent
    {
        $ref = $booking->reference ?? '';
        $emails = self::adminEmails();
        return new NotificationIntent(
            intentType: IntentType::NEW_BOOKING,
            entityType: 'booking',
            entityId: (string) $booking->id,
            recipients: NotificationRecipientSet::forAdmins($emails),
            payload: [
                'title' => 'New booking',
                'message' => 'New booking Ref ' . $ref . ' has been received. Review and confirm if needed.',
                'link' => '/dashboard/admin/bookings?status=pending',
            ],
            entityKey: 'booking:' . $booking->id,
        );
    }

    public static function paymentReceivedToAdmin(Booking $booking): NotificationIntent
    {
        $ref = $booking->reference ?? '';
        $emails = self::adminEmails();
        return new NotificationIntent(
            intentType: IntentType::PAYMENT_RECEIVED,
            entityType: 'booking',
            entityId: (string) $booking->id,
            recipients: NotificationRecipientSet::forAdmins($emails),
            payload: [
                'title' => 'Payment received',
                'message' => 'Payment received for booking Ref ' . $ref . '.',
                'link' => '/dashboard/admin/bookings',
            ],
            entityKey: 'booking:' . $booking->id,
        );
    }

    public static function trainerAssignedToParent(BookingSchedule $schedule): NotificationIntent
    {
        $booking = $schedule->booking;
        $trainerName = $schedule->trainer?->name ?? 'A trainer';
        $childNames = $booking?->children?->pluck('name')->join(', ') ?: 'Your child';
        $sessionDate = $schedule->date?->format('l, j F Y') ?? '';
        $sessionTime = $schedule->start_time && $schedule->end_time
            ? \Carbon\Carbon::parse($schedule->start_time)->format('g:i A') . ' – ' . \Carbon\Carbon::parse($schedule->end_time)->format('g:i A')
            : '';
        $message = $trainerName . ' has been assigned to ' . $childNames . "'s session" . ($sessionDate ? ' on ' . $sessionDate : '') . ($sessionTime ? ' · ' . $sessionTime : '') . '.';
        $recipients = $booking?->user_id
            ? NotificationRecipientSet::forUser($booking->user_id)
            : NotificationRecipientSet::forEmails($booking && $booking->parent_email ? [$booking->parent_email] : []);
        return new NotificationIntent(
            intentType: IntentType::TRAINER_ASSIGNED,
            entityType: 'schedule',
            entityId: (string) $schedule->id,
            recipients: $recipients,
            payload: [
                'title' => 'Trainer assigned to your session',
                'message' => $message,
                'link' => '/dashboard/parent',
            ],
            entityKey: 'schedule:' . $schedule->id,
        );
    }

    public static function sessionBookedToTrainer(BookingSchedule $schedule): NotificationIntent
    {
        $booking = $schedule->booking;
        $children = $booking?->children?->pluck('name')->join(', ') ?: 'Client';
        $dateStr = $schedule->date?->format('l, j M') ?? '';
        $trainer = $schedule->trainer;
        if (!$trainer?->user_id) {
            return new NotificationIntent(
                intentType: IntentType::SESSION_BOOKED,
                entityType: 'schedule',
                entityId: (string) $schedule->id,
                recipients: new NotificationRecipientSet(),
                payload: ['title' => '', 'message' => '', 'link' => ''],
                entityKey: 'schedule:' . $schedule->id,
            );
        }
        return new NotificationIntent(
            intentType: IntentType::SESSION_BOOKED,
            entityType: 'schedule',
            entityId: (string) $schedule->id,
            recipients: NotificationRecipientSet::forUser($trainer->user_id),
            payload: [
                'title' => 'New session assigned',
                'message' => $children . ' – ' . $dateStr . '. A new session has been assigned to you.',
                'link' => '/dashboard/trainer/bookings',
            ],
            entityKey: 'schedule:' . $schedule->id,
        );
    }

    public static function sessionConfirmationRequestToTrainer(BookingSchedule $schedule): NotificationIntent
    {
        $booking = $schedule->booking;
        $children = $booking?->children?->pluck('name')->join(', ') ?: 'Client';
        $dateStr = $schedule->date?->format('l, j M') ?? '';
        $trainer = $schedule->trainer;
        if (!$trainer?->user_id) {
            return new NotificationIntent(
                intentType: IntentType::SESSION_CONFIRMATION_REQUEST,
                entityType: 'schedule',
                entityId: (string) $schedule->id,
                recipients: new NotificationRecipientSet(),
                payload: ['title' => '', 'message' => '', 'link' => ''],
                entityKey: 'schedule:' . $schedule->id,
            );
        }
        return new NotificationIntent(
            intentType: IntentType::SESSION_CONFIRMATION_REQUEST,
            entityType: 'schedule',
            entityId: (string) $schedule->id,
            recipients: NotificationRecipientSet::forUser($trainer->user_id),
            payload: [
                'title' => 'Session confirmation requested',
                'message' => $children . ' – ' . $dateStr . '. Please confirm or decline this session.',
                'link' => '/dashboard/trainer/schedules?confirm=' . $schedule->id,
            ],
            entityKey: 'schedule:' . $schedule->id,
        );
    }

    public static function trainerForgotClockOut(BookingSchedule $schedule): NotificationIntent
    {
        $trainer = $schedule->trainer;
        if (! $trainer?->user_id) {
            return new NotificationIntent(
                intentType: IntentType::TRAINER_FORGOT_CLOCK_OUT,
                entityType: 'schedule',
                entityId: (string) $schedule->id,
                recipients: new NotificationRecipientSet(),
                payload: ['title' => '', 'message' => '', 'link' => ''],
                entityKey: 'schedule:' . $schedule->id,
            );
        }
        $children = $schedule->booking?->children?->pluck('name')->join(', ') ?: 'Session';
        $dateStr = $schedule->date?->format('l, j M') ?? '';
        return new NotificationIntent(
            intentType: IntentType::TRAINER_FORGOT_CLOCK_OUT,
            entityType: 'schedule',
            entityId: (string) $schedule->id,
            recipients: NotificationRecipientSet::forUser($trainer->user_id),
            payload: [
                'title' => 'You did not clock out',
                'message' => 'You marked the session for ' . $children . ' (' . $dateStr . ') as completed but did not clock out. Please add your clock-out time.',
                'link' => '/dashboard/trainer?openClockOut=' . $schedule->id,
            ],
            entityKey: 'schedule:' . $schedule->id,
        );
    }

    public static function trainerSessionEndingSoon(BookingSchedule $schedule): NotificationIntent
    {
        $trainer = $schedule->trainer;
        if (! $trainer?->user_id) {
            return new NotificationIntent(
                intentType: IntentType::TRAINER_SESSION_ENDING_SOON,
                entityType: 'schedule',
                entityId: (string) $schedule->id,
                recipients: new NotificationRecipientSet(),
                payload: ['title' => '', 'message' => '', 'link' => ''],
                entityKey: 'schedule:' . $schedule->id,
            );
        }
        $children = $schedule->booking?->children?->pluck('name')->join(', ') ?: 'Session';
        $endTime = $schedule->end_time ? \Carbon\Carbon::parse($schedule->end_time)->format('g:i A') : '';
        return new NotificationIntent(
            intentType: IntentType::TRAINER_SESSION_ENDING_SOON,
            entityType: 'schedule',
            entityId: (string) $schedule->id,
            recipients: NotificationRecipientSet::forUser($trainer->user_id),
            payload: [
                'title' => 'Session ending in 30 minutes',
                'message' => 'Your session with ' . $children . ' ends at ' . $endTime . '. Do not forget to clock out and complete your session notes and activity logs.',
                'link' => '/dashboard/trainer?scheduleId=' . $schedule->id,
            ],
            entityKey: 'schedule:' . $schedule->id,
        );
    }

    /**
     * Notify parent 30 minutes before session end (same session, different message/link).
     */
    public static function parentSessionEndingSoon(BookingSchedule $schedule): NotificationIntent
    {
        $booking = $schedule->booking;
        $recipients = $booking?->user_id
            ? NotificationRecipientSet::forUser($booking->user_id)
            : NotificationRecipientSet::forEmails($booking && $booking->parent_email ? [$booking->parent_email] : []);
        $childNames = $booking?->children?->pluck('name')->join(', ') ?: 'your child';
        $endTime = $schedule->end_time ? \Carbon\Carbon::parse($schedule->end_time)->format('g:i A') : '';
        $link = '/dashboard/parent/schedule?scheduleId=' . $schedule->id;
        return new NotificationIntent(
            intentType: IntentType::SESSION_ENDING_SOON_PARENT,
            entityType: 'schedule',
            entityId: (string) $schedule->id,
            recipients: $recipients,
            payload: [
                'title' => 'Session ending in 30 minutes',
                'message' => $childNames . '\'s session ends at ' . $endTime . '. You can view session details and activity logs.',
                'link' => $link,
            ],
            entityKey: 'schedule:' . $schedule->id,
        );
    }

    /**
     * Notify admin 30 minutes before session end.
     */
    public static function adminSessionEndingSoon(BookingSchedule $schedule): NotificationIntent
    {
        $schedule->loadMissing('booking.children', 'trainer.user');
        $booking = $schedule->booking;
        $childNames = $booking?->children?->pluck('name')->join(', ') ?: 'Child';
        $trainerName = $schedule->trainer?->user?->name ?? 'Trainer';
        $endTime = $schedule->end_time ? \Carbon\Carbon::parse($schedule->end_time)->format('g:i A') : '';
        $emails = self::adminEmails();
        $link = '/dashboard/admin/booking-schedules?scheduleId=' . $schedule->id;
        return new NotificationIntent(
            intentType: IntentType::SESSION_ENDING_SOON_ADMIN,
            entityType: 'schedule',
            entityId: (string) $schedule->id,
            recipients: NotificationRecipientSet::forAdmins($emails),
            payload: [
                'title' => 'Session ending in 30 minutes',
                'message' => $childNames . '\'s session with ' . $trainerName . ' ends at ' . $endTime . '.',
                'link' => $link,
            ],
            entityKey: 'schedule:' . $schedule->id,
        );
    }

    /**
     * Notify trainer 30 minutes before session start (e.g. session at 13:30, notify at 13:00).
     */
    public static function trainerSessionStartingSoon(BookingSchedule $schedule): NotificationIntent
    {
        $trainer = $schedule->trainer;
        if (! $trainer?->user_id) {
            return new NotificationIntent(
                intentType: IntentType::TRAINER_SESSION_STARTING_SOON,
                entityType: 'schedule',
                entityId: (string) $schedule->id,
                recipients: new NotificationRecipientSet(),
                payload: ['title' => '', 'message' => '', 'link' => ''],
                entityKey: 'schedule:' . $schedule->id,
            );
        }
        $children = $schedule->booking?->children?->pluck('name')->join(', ') ?: 'a child';
        $startTime = $schedule->start_time ? \Carbon\Carbon::parse($schedule->start_time)->format('g:i A') : '';
        $endTime = $schedule->end_time ? \Carbon\Carbon::parse($schedule->end_time)->format('g:i A') : '';
        $timeRange = trim($startTime . ' – ' . $endTime, ' –');
        return new NotificationIntent(
            intentType: IntentType::TRAINER_SESSION_STARTING_SOON,
            entityType: 'schedule',
            entityId: (string) $schedule->id,
            recipients: NotificationRecipientSet::forUser($trainer->user_id),
            payload: [
                'title' => 'Session starting in 30 minutes',
                'message' => 'Your session with ' . $children . ' is at ' . $timeRange . '. Get ready to clock in.',
                'link' => '/dashboard/trainer?scheduleId=' . $schedule->id,
            ],
            entityKey: 'schedule:' . $schedule->id,
        );
    }

    public static function sessionBookedToAdmin(BookingSchedule $schedule): NotificationIntent
    {
        $emails = self::adminEmails();
        return new NotificationIntent(
            intentType: IntentType::SESSION_BOOKED_ADMIN,
            entityType: 'schedule',
            entityId: (string) $schedule->id,
            recipients: NotificationRecipientSet::forAdmins($emails),
            payload: [
                'title' => 'Session booked',
                'message' => 'A session has been booked. Review in admin.',
                'link' => '/dashboard/admin/bookings',
            ],
            entityKey: 'schedule:' . $schedule->id,
        );
    }

    public static function sessionNeedsTrainerToAdmin(BookingSchedule $schedule): NotificationIntent
    {
        $schedule->loadMissing('booking.participants.child');
        $booking = $schedule->booking;
        $ref = $booking?->reference ?? '';
        $childrenSummary = $booking && $booking->relationLoaded('participants')
            ? $booking->participants
                ->filter(fn ($p) => $p->child_id !== null)
                ->map(fn ($p) => $p->child ? $p->child->name : $p->full_name)
                ->filter()
                ->join(', ')
            : '';
        $message = $childrenSummary !== ''
            ? 'A session for ' . $childrenSummary . ' needs a trainer assigned.'
            : 'A session for booking Ref ' . $ref . ' needs a trainer assigned.';
        $emails = self::adminEmails();
        return new NotificationIntent(
            intentType: IntentType::SESSION_NEEDS_TRAINER,
            entityType: 'schedule',
            entityId: (string) $schedule->id,
            recipients: NotificationRecipientSet::forAdmins($emails),
            payload: [
                'title' => 'Session needs trainer',
                'message' => $message,
                'link' => '/dashboard/admin/bookings?needs_trainer=1',
            ],
            entityKey: 'schedule:' . $schedule->id,
        );
    }

    public static function sessionCancelledToTrainer(BookingSchedule $schedule, string $reason): NotificationIntent
    {
        $dateStr = $schedule->date?->format('l, j M') ?? '';
        $trainer = $schedule->trainer;
        if (!$trainer?->user_id) {
            return new NotificationIntent(
                intentType: IntentType::SESSION_CANCELLED_TRAINER,
                entityType: 'schedule',
                entityId: (string) $schedule->id,
                recipients: new NotificationRecipientSet(),
                payload: ['title' => '', 'message' => '', 'link' => '', 'notification_args' => [$reason]],
                entityKey: 'schedule:' . $schedule->id,
            );
        }
        return new NotificationIntent(
            intentType: IntentType::SESSION_CANCELLED_TRAINER,
            entityType: 'schedule',
            entityId: (string) $schedule->id,
            recipients: NotificationRecipientSet::forUser($trainer->user_id),
            payload: [
                'title' => 'Session cancelled',
                'message' => 'A session on ' . $dateStr . ' has been cancelled.' . ($reason ? ' ' . $reason : ''),
                'link' => '/dashboard/trainer/bookings',
                'notification_args' => [$reason],
            ],
            entityKey: 'schedule:' . $schedule->id,
        );
    }

    public static function activityConfirmed(Booking $booking, BookingSchedule $schedule): NotificationIntent
    {
        $dateStr = $schedule->date?->format('l, j M') ?? '';
        return new NotificationIntent(
            intentType: IntentType::ACTIVITY_CONFIRMED,
            entityType: 'schedule',
            entityId: (string) $schedule->id,
            recipients: $booking->user_id
                ? NotificationRecipientSet::forUser($booking->user_id)
                : NotificationRecipientSet::forEmails($booking->parent_email ? [$booking->parent_email] : []),
            payload: [
                'title' => 'Session activities confirmed',
                'message' => 'Activities for your session on ' . $dateStr . ' have been confirmed by the trainer.',
                'link' => '/dashboard/parent',
            ],
            entityKey: 'schedule:' . $schedule->id,
        );
    }

    public static function sessionToday(BookingSchedule $schedule): NotificationIntent
    {
        $booking = $schedule->booking;
        $recipients = $booking?->user_id
            ? NotificationRecipientSet::forUser($booking->user_id)
            : NotificationRecipientSet::forEmails($booking && $booking->parent_email ? [$booking->parent_email] : []);
        $packageName = $booking?->package?->name ?? 'Package';
        $childNames = $booking?->children?->pluck('name')->join(', ') ?: 'your child';
        $timeStr = $schedule->start_time ? \Carbon\Carbon::parse($schedule->start_time)->format('g:i A') : '';
        return new NotificationIntent(
            intentType: IntentType::SESSION_TODAY,
            entityType: 'schedule',
            entityId: (string) $schedule->id,
            recipients: $recipients,
            payload: [
                'title' => 'Session today',
                'message' => $childNames . '\'s ' . $packageName . ' session' . ($timeStr ? ' at ' . $timeStr : '') . ' is today.',
                'link' => '/dashboard/parent',
            ],
            entityKey: 'schedule:' . $schedule->id,
        );
    }

    public static function parentSessionOver(BookingSchedule $schedule): NotificationIntent
    {
        $booking = $schedule->booking;
        $recipients = $booking?->user_id
            ? NotificationRecipientSet::forUser($booking->user_id)
            : NotificationRecipientSet::forEmails($booking && $booking->parent_email ? [$booking->parent_email] : []);
        $childNames = $booking?->children?->pluck('name')->join(', ') ?: 'your child';
        $dateStr = $schedule->date ? \Carbon\Carbon::parse($schedule->date)->format('D j M') : '';
        $link = '/dashboard/parent/schedule?scheduleId=' . $schedule->id;
        return new NotificationIntent(
            intentType: IntentType::SESSION_OVER,
            entityType: 'schedule',
            entityId: (string) $schedule->id,
            recipients: $recipients,
            payload: [
                'title' => 'Session finished',
                'message' => $childNames . '\'s session' . ($dateStr ? ' (' . $dateStr . ')' : '') . ' has finished. View activity logs and session details.',
                'link' => $link,
            ],
            entityKey: 'schedule:' . $schedule->id,
        );
    }

    /**
     * Notify parent when the trainer clocks in (session is live).
     */
    public static function parentSessionStarted(BookingSchedule $schedule): NotificationIntent
    {
        $schedule->loadMissing('booking.children', 'booking.package', 'trainer.user');
        $booking = $schedule->booking;
        $recipients = $booking?->user_id
            ? NotificationRecipientSet::forUser($booking->user_id)
            : NotificationRecipientSet::forEmails($booking && $booking->parent_email ? [$booking->parent_email] : []);
        $childNames = $booking?->children?->pluck('name')->join(', ') ?: 'your child';
        $trainerName = $schedule->trainer?->user?->name ?? 'your trainer';
        $link = '/dashboard/parent/schedule?scheduleId=' . $schedule->id;
        return new NotificationIntent(
            intentType: IntentType::SESSION_STARTED,
            entityType: 'schedule',
            entityId: (string) $schedule->id,
            recipients: $recipients,
            payload: [
                'title' => 'Session started',
                'message' => $childNames . '\'s session with ' . $trainerName . ' has started. View live activity.',
                'link' => $link,
            ],
            entityKey: 'schedule:' . $schedule->id,
        );
    }

    /**
     * Notify admins when a trainer clocks in (session is live).
     */
    public static function adminSessionStarted(BookingSchedule $schedule): NotificationIntent
    {
        $schedule->loadMissing('booking.children', 'booking.package', 'trainer.user');
        $booking = $schedule->booking;
        $childNames = $booking?->children?->pluck('name')->join(', ') ?: 'Child';
        $trainerName = $schedule->trainer?->user?->name ?? 'Trainer';
        $emails = self::adminEmails();
        $link = '/dashboard/admin/booking-schedules?scheduleId=' . $schedule->id;
        return new NotificationIntent(
            intentType: IntentType::SESSION_STARTED_ADMIN,
            entityType: 'schedule',
            entityId: (string) $schedule->id,
            recipients: NotificationRecipientSet::forAdmins($emails),
            payload: [
                'title' => 'Session started',
                'message' => $childNames . '\'s session with ' . $trainerName . ' has started. View in admin.',
                'link' => $link,
            ],
            entityKey: 'schedule:' . $schedule->id,
        );
    }

    public static function sessionReminder24h(BookingSchedule $schedule): NotificationIntent
    {
        $booking = $schedule->booking;
        $recipients = $booking?->user_id
            ? NotificationRecipientSet::forUser($booking->user_id)
            : NotificationRecipientSet::forEmails($booking && $booking->parent_email ? [$booking->parent_email] : []);
        return new NotificationIntent(
            intentType: IntentType::SESSION_REMINDER_24H,
            entityType: 'schedule',
            entityId: (string) $schedule->id,
            recipients: $recipients,
            payload: ['title' => '', 'message' => '', 'link' => ''],
            entityKey: 'schedule:' . $schedule->id,
        );
    }

    public static function childApproved(Child $child): NotificationIntent
    {
        return new NotificationIntent(
            intentType: IntentType::CHILD_APPROVED,
            entityType: 'child',
            entityId: (string) $child->id,
            recipients: $child->user_id ? NotificationRecipientSet::forUser($child->user_id) : new NotificationRecipientSet(),
            payload: [
                'title' => 'Child approved',
                'message' => $child->name . ' has been approved. You can now add them to bookings.',
                'link' => '/dashboard/parent/children',
            ],
            entityKey: 'child:' . $child->id,
        );
    }

    public static function childRejected(Child $child, string $reason = ''): NotificationIntent
    {
        $msg = $child->name . '\'s application was not approved.';
        if ($reason) {
            $msg .= ' Reason: ' . $reason;
        }
        return new NotificationIntent(
            intentType: IntentType::CHILD_REJECTED,
            entityType: 'child',
            entityId: (string) $child->id,
            recipients: $child->user_id ? NotificationRecipientSet::forUser($child->user_id) : new NotificationRecipientSet(),
            payload: [
                'title' => 'Child application not approved',
                'message' => $msg,
                'link' => '/dashboard/parent/children',
                'notification_args' => [$reason],
            ],
            entityKey: 'child:' . $child->id,
        );
    }

    public static function userApproved(User $user): NotificationIntent
    {
        return new NotificationIntent(
            intentType: IntentType::USER_APPROVED,
            entityType: 'user',
            entityId: (string) $user->id,
            recipients: NotificationRecipientSet::forUser($user->id),
            payload: [
                'title' => 'Account approved',
                'message' => 'Your account has been approved. You can now sign in and use the dashboard.',
                'link' => '/dashboard/parent',
            ],
            entityKey: 'user:' . $user->id,
        );
    }

    public static function userRejected(User $user, string $reason = ''): NotificationIntent
    {
        return new NotificationIntent(
            intentType: IntentType::USER_REJECTED,
            entityType: 'user',
            entityId: (string) $user->id,
            recipients: NotificationRecipientSet::forUser($user->id),
            payload: [
                'title' => 'Account not approved',
                'message' => 'Your account application was not approved.' . ($reason ? ' Reason: ' . $reason : ''),
                'link' => null,
                'notification_args' => [$reason],
            ],
            entityKey: 'user:' . $user->id,
        );
    }

    public static function childChecklistSubmitted(Child $child, mixed $checklist): NotificationIntent
    {
        $user = $child->user;
        $adminEmails = self::adminEmails();
        return new NotificationIntent(
            intentType: IntentType::CHILD_CHECKLIST_SUBMITTED,
            entityType: 'child',
            entityId: (string) $child->id,
            recipients: $user?->id
                ? NotificationRecipientSet::forUser($user->id)
                : new NotificationRecipientSet(),
            payload: [
                'title' => 'Checklist submitted',
                'message' => $child->name . '\'s checklist has been submitted.',
                'link' => '/dashboard/parent/children',
            ],
            entityKey: 'child:' . $child->id,
        );
    }

    public static function childChecklistSubmittedToAdmin(Child $child, mixed $checklist): NotificationIntent
    {
        $emails = self::adminEmails();
        return new NotificationIntent(
            intentType: IntentType::CHILD_CHECKLIST_SUBMITTED_ADMIN,
            entityType: 'child',
            entityId: (string) $child->id,
            recipients: NotificationRecipientSet::forAdmins($emails),
            payload: [
                'title' => 'Child checklist submitted',
                'message' => $child->name . '\'s checklist has been submitted. Review and approve or reject.',
                'link' => '/dashboard/admin/children',
                'notification_args' => [$checklist],
            ],
            entityKey: 'child:' . $child->id,
        );
    }

    public static function childApprovalRequiredToAdmin(Child $child): NotificationIntent
    {
        $emails = self::adminEmails();
        return new NotificationIntent(
            intentType: IntentType::CHILD_APPROVAL_REQUIRED,
            entityType: 'child',
            entityId: (string) $child->id,
            recipients: NotificationRecipientSet::forAdmins($emails),
            payload: [
                'title' => 'Child approval required',
                'message' => $child->name . '\'s checklist has been submitted. Review and approve or reject.',
                'link' => '/dashboard/admin/children',
            ],
            entityKey: 'child:' . $child->id,
        );
    }

    public static function trainerApplicationSubmittedToAdmin(TrainerApplication $application): NotificationIntent
    {
        $emails = self::adminEmails();
        if (empty($emails)) {
            $fallback = config('mail.admin_notification_email') ?: config('mail.from.address');
            if (filled($fallback)) {
                $emails = [$fallback];
            }
        }
        return new NotificationIntent(
            intentType: IntentType::TRAINER_APPLICATION_SUBMITTED,
            entityType: 'trainer_application',
            entityId: (string) $application->id,
            recipients: NotificationRecipientSet::forAdmins($emails),
            payload: [
                'title' => 'Trainer application submitted',
                'message' => $application->full_name . ' has submitted a trainer application. Review and approve or reject.',
                'link' => '/dashboard/admin/trainer-applications',
            ],
            entityKey: 'application:' . $application->id,
        );
    }

    public static function trainerApplicationApproved(TrainerApplication $application, ?string $loginEmail = null, ?string $temporaryPassword = null): NotificationIntent
    {
        $userIds = [];
        $applicantUser = User::where('email', $application->email)->first();
        if ($applicantUser) {
            $userIds = [$applicantUser->id];
        }
        return new NotificationIntent(
            intentType: IntentType::APPLICATION_APPROVED,
            entityType: 'trainer_application',
            entityId: (string) $application->id,
            recipients: new NotificationRecipientSet(
                userIds: $userIds,
                emails: $application->email ? [$application->email] : [],
            ),
            payload: [
                'title' => 'Application approved',
                'message' => 'Your trainer application has been approved. You can now sign in to the trainer dashboard.',
                'link' => '/dashboard/trainer',
                'notification_args' => [$loginEmail, $temporaryPassword],
            ],
            entityKey: 'application:' . $application->id,
        );
    }

    public static function trainerApplicationRejected(TrainerApplication $application, ?string $reason = null): NotificationIntent
    {
        $userIds = [];
        $applicantUser = User::where('email', $application->email)->first();
        if ($applicantUser) {
            $userIds = [$applicantUser->id];
        }
        return new NotificationIntent(
            intentType: IntentType::APPLICATION_REJECTED,
            entityType: 'trainer_application',
            entityId: (string) $application->id,
            recipients: new NotificationRecipientSet(
                userIds: $userIds,
                emails: $application->email ? [$application->email] : [],
            ),
            payload: [
                'title' => 'Application not approved',
                'message' => 'Your trainer application was not approved.' . ($reason ? ' ' . $reason : ''),
                'link' => null,
                'notification_args' => [$reason],
            ],
            entityKey: 'application:' . $application->id,
        );
    }

    public static function trainerApplicationInformationRequested(TrainerApplication $application, string $message): NotificationIntent
    {
        $userIds = [];
        $applicantUser = User::where('email', $application->email)->first();
        if ($applicantUser) {
            $userIds = [$applicantUser->id];
        }
        return new NotificationIntent(
            intentType: IntentType::APPLICATION_INFO_REQUESTED,
            entityType: 'trainer_application',
            entityId: (string) $application->id,
            recipients: new NotificationRecipientSet(
                userIds: $userIds,
                emails: $application->email ? [$application->email] : [],
            ),
            payload: [
                'title' => 'More information needed',
                'message' => 'We need more information about your trainer application. Please check your email.',
                'link' => null,
                'notification_args' => [$message],
            ],
            entityKey: 'application:' . $application->id,
        );
    }

    public static function absenceRequestSubmitted(
        ?string $entityKey = null,
        ?string $title = null,
        ?string $message = null,
        ?string $link = null
    ): NotificationIntent {
        $key = $entityKey ?? 'absence:' . now()->format('Y-m-d');
        $adminIds = User::whereIn('role', ['admin', 'super_admin', 'editor'])->pluck('id')->all();
        return new NotificationIntent(
            intentType: IntentType::ABSENCE_REQUEST_SUBMITTED,
            entityType: 'schedule',
            entityId: '0',
            recipients: NotificationRecipientSet::forUsers($adminIds),
            payload: [
                'title' => $title ?? 'Absence request submitted',
                'message' => $message ?? 'A trainer has submitted an absence request. Review in admin.',
                'link' => $link ?? '/dashboard/admin/absence-requests',
            ],
            entityKey: $key,
        );
    }

    public static function trainerAvailabilityUpdatedToAdmin(Trainer $trainer): NotificationIntent
    {
        $emails = self::adminEmails();
        $name = $trainer->name ?? 'A trainer';
        return new NotificationIntent(
            intentType: IntentType::TRAINER_AVAILABILITY_UPDATED,
            entityType: 'trainer',
            entityId: (string) $trainer->id,
            recipients: NotificationRecipientSet::forAdmins($emails),
            payload: [
                'title' => 'Trainer availability updated',
                'message' => $name . ' updated their calendar availability. You can assign them to sessions.',
                'link' => '/dashboard/admin',
            ],
            entityKey: 'trainer_availability:' . $trainer->id,
        );
    }

    public static function contactSubmission(ContactSubmission $submission): NotificationIntent
    {
        $settings = SiteSetting::instance();
        $emails = self::adminEmails();
        $numbers = collect($settings->support_whatsapp_numbers ?? [])
            ->map(fn ($item) => is_array($item) && isset($item['value']) ? $item['value'] : (is_string($item) ? $item : null))
            ->filter(fn ($n) => filled($n))
            ->unique()
            ->values()
            ->all();
        $message = sprintf(
            "New CAMS contact request from %s (%s).\nInquiry: %s\nUrgency: %s\nPreferred Contact: %s",
            $submission->name,
            $submission->email,
            $submission->inquiry_type,
            $submission->urgency,
            $submission->preferred_contact,
        );
        return new NotificationIntent(
            intentType: IntentType::CONTACT_SUBMISSION,
            entityType: 'contact_submission',
            entityId: (string) $submission->id,
            recipients: NotificationRecipientSet::forAdmins($emails, $numbers),
            payload: [
                'whatsapp_message' => $message,
            ],
            entityKey: 'contact:' . $submission->id,
        );
    }

    public static function draftBookingReminder(Booking $booking, string $reminderType): NotificationIntent
    {
        $intentType = match ($reminderType) {
            '30m' => IntentType::DRAFT_BOOKING_REMINDER_30M,
            '2h' => IntentType::DRAFT_BOOKING_REMINDER_2H,
            '24h' => IntentType::DRAFT_BOOKING_REMINDER_24H,
            '72h' => IntentType::DRAFT_BOOKING_REMINDER_72H,
            default => IntentType::DRAFT_BOOKING_REMINDER_24H,
        };
        $recipients = $booking->user_id
            ? NotificationRecipientSet::forUser($booking->user_id)
            : NotificationRecipientSet::forEmails($booking->parent_email ? [$booking->parent_email] : []);
        return new NotificationIntent(
            intentType: $intentType,
            entityType: 'booking',
            entityId: (string) $booking->id,
            recipients: $recipients,
            payload: ['title' => '', 'message' => '', 'link' => ''],
            entityKey: 'booking:' . $booking->id . ':' . $reminderType,
        );
    }

    public static function paymentReminder(Booking $booking, string $reminderType): NotificationIntent
    {
        $intentType = match ($reminderType) {
            '24h_before' => IntentType::PAYMENT_REMINDER_24H_BEFORE,
            '3d_before' => IntentType::PAYMENT_REMINDER_3D_BEFORE,
            '7d_after' => IntentType::PAYMENT_REMINDER_7D_AFTER,
            default => IntentType::PAYMENT_REMINDER_24H_BEFORE,
        };
        $recipients = $booking->user_id
            ? NotificationRecipientSet::forUser($booking->user_id)
            : NotificationRecipientSet::forEmails($booking->parent_email ? [$booking->parent_email] : []);
        return new NotificationIntent(
            intentType: $intentType,
            entityType: 'booking',
            entityId: (string) $booking->id,
            recipients: $recipients,
            payload: ['title' => '', 'message' => '', 'link' => ''],
            entityKey: 'booking:' . $booking->id . ':' . $reminderType,
        );
    }

    private static function adminEmails(): array
    {
        $settings = SiteSetting::instance();
        $raw = $settings->support_emails ?? [];
        return collect($raw)
            ->map(fn ($item) => is_array($item) && isset($item['value']) ? $item['value'] : (is_string($item) ? $item : null))
            ->filter(fn ($e) => filled($e) && is_string($e))
            ->unique()
            ->values()
            ->all();
    }
}
