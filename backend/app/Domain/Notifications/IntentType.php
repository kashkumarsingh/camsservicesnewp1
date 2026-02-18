<?php

namespace App\Domain\Notifications;

/**
 * Central registry of notification intent types.
 * Maps 1:1 to business events; channels (in_app, email, whatsapp) are configured per type.
 */
final class IntentType
{
    // Booking & payment (parent)
    public const BOOKING_CONFIRMED = 'booking_confirmed';
    public const BOOKING_CANCELLED = 'booking_cancelled';
    public const PAYMENT_CONFIRMED = 'payment_confirmed';
    public const PAYMENT_FAILED = 'payment_failed';
    public const ACTIVITY_CONFIRMED = 'activity_confirmed';
    public const SESSION_CANCELLED = 'session_cancelled';
    public const SESSION_TODAY = 'session_today';
    public const SESSION_OVER = 'session_over';
    public const SESSION_STARTED = 'session_started';
    public const SESSION_STARTED_ADMIN = 'session_started_admin';
    public const SESSION_ENDING_SOON_PARENT = 'session_ending_soon_parent';
    public const SESSION_ENDING_SOON_ADMIN = 'session_ending_soon_admin';
    public const SESSION_REMINDER_24H = 'session_reminder_24h';
    public const TRAINER_ASSIGNED = 'trainer_assigned';

    // Draft / reminders (scheduled)
    public const DRAFT_BOOKING_REMINDER_30M = 'draft_booking_reminder_30m';
    public const DRAFT_BOOKING_REMINDER_2H = 'draft_booking_reminder_2h';
    public const DRAFT_BOOKING_REMINDER_24H = 'draft_booking_reminder_24h';
    public const DRAFT_BOOKING_REMINDER_72H = 'draft_booking_reminder_72h';
    public const PAYMENT_REMINDER_24H_BEFORE = 'payment_reminder_24h_before';
    public const PAYMENT_REMINDER_3D_BEFORE = 'payment_reminder_3d_before';
    public const PAYMENT_REMINDER_7D_AFTER = 'payment_reminder_7d_after';

    // Child & account
    public const CHILD_APPROVED = 'child_approved';
    public const CHILD_REJECTED = 'child_rejected';
    public const CHILD_CHECKLIST_SUBMITTED = 'child_checklist_submitted';
    public const CHILD_CHECKLIST_REMINDER = 'child_checklist_reminder';
    public const USER_APPROVED = 'user_approved';
    public const USER_REJECTED = 'user_rejected';

    // Trainer
    public const SESSION_BOOKED = 'session_booked';
    public const SESSION_CONFIRMATION_REQUEST = 'session_confirmation_request';
    public const SESSION_CANCELLED_TRAINER = 'session_cancelled_trainer';
    public const TRAINER_FORGOT_CLOCK_OUT = 'trainer_forgot_clock_out';
    public const TRAINER_SESSION_ENDING_SOON = 'trainer_session_ending_soon';
    public const TRAINER_SESSION_STARTING_SOON = 'trainer_session_starting_soon';
    public const APPLICATION_APPROVED = 'application_approved';
    public const APPLICATION_REJECTED = 'application_rejected';
    public const APPLICATION_INFO_REQUESTED = 'application_info_requested';

    // Admin
    public const NEW_BOOKING = 'new_booking';
    public const PAYMENT_RECEIVED = 'payment_received';
    public const CHILD_APPROVAL_REQUIRED = 'child_approval_required';
    public const SESSION_NEEDS_TRAINER = 'session_needs_trainer';
    public const SESSION_BOOKED_ADMIN = 'session_booked_admin';
    public const TRAINER_APPLICATION_SUBMITTED = 'trainer_application_submitted';
    public const ABSENCE_REQUEST_SUBMITTED = 'absence_request_submitted';
    public const TRAINER_AVAILABILITY_UPDATED = 'trainer_availability_updated';
    public const CONTACT_SUBMISSION = 'contact_submission';
    public const CHILD_CHECKLIST_SUBMITTED_ADMIN = 'child_checklist_submitted_admin';

    /**
     * Intent types that must only be sent once per entity per recipient (strong deduplication).
     */
    public static function deduplicationWindowMinutes(string $intentType): int
    {
        return match ($intentType) {
            self::BOOKING_CONFIRMED, self::BOOKING_CANCELLED,
            self::PAYMENT_CONFIRMED, self::PAYMENT_FAILED,
            self::TRAINER_ASSIGNED, self::ACTIVITY_CONFIRMED,
            self::SESSION_CANCELLED, self::SESSION_CANCELLED_TRAINER,
            self::CHILD_APPROVED, self::CHILD_REJECTED,
            self::USER_APPROVED, self::USER_REJECTED,
            self::SESSION_BOOKED, self::SESSION_CONFIRMATION_REQUEST,
            self::TRAINER_FORGOT_CLOCK_OUT, self::TRAINER_SESSION_ENDING_SOON, self::TRAINER_SESSION_STARTING_SOON,
            self::APPLICATION_APPROVED, self::APPLICATION_REJECTED,
            self::APPLICATION_INFO_REQUESTED,
            self::NEW_BOOKING, self::PAYMENT_RECEIVED,
            self::CHILD_APPROVAL_REQUIRED, self::SESSION_NEEDS_TRAINER,
            self::SESSION_BOOKED_ADMIN, self::TRAINER_APPLICATION_SUBMITTED,
            self::ABSENCE_REQUEST_SUBMITTED, self::TRAINER_AVAILABILITY_UPDATED, self::CONTACT_SUBMISSION,
            self::CHILD_CHECKLIST_SUBMITTED, self::CHILD_CHECKLIST_SUBMITTED_ADMIN => 60,
            self::SESSION_TODAY, self::SESSION_OVER, self::SESSION_STARTED, self::SESSION_STARTED_ADMIN,
            self::SESSION_ENDING_SOON_PARENT, self::SESSION_ENDING_SOON_ADMIN, self::SESSION_REMINDER_24H => 1440, // 24h
            self::DRAFT_BOOKING_REMINDER_30M => 30,
            self::DRAFT_BOOKING_REMINDER_2H => 120,
            self::DRAFT_BOOKING_REMINDER_24H => 1440,
            self::DRAFT_BOOKING_REMINDER_72H => 4320,
            self::PAYMENT_REMINDER_24H_BEFORE, self::PAYMENT_REMINDER_3D_BEFORE,
            self::PAYMENT_REMINDER_7D_AFTER => 1440,
            self::CHILD_CHECKLIST_REMINDER => 1440,
            default => 10,
        };
    }
}
