<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * In-app dashboard notification (bell) for parents, trainers, and admin.
 * Shared centralised notification store; type distinguishes context.
 * Use DashboardNotificationService to create notifications so all flows stay consistent.
 */
class UserNotification extends Model
{
    // Parent / booking
    public const TYPE_TRAINER_ASSIGNED = 'trainer_assigned';
    public const TYPE_BOOKING_CONFIRMED = 'booking_confirmed';
    public const TYPE_BOOKING_CANCELLED = 'booking_cancelled';
    public const TYPE_PAYMENT_CONFIRMED = 'payment_confirmed';
    public const TYPE_PAYMENT_FAILED = 'payment_failed';
    public const TYPE_ACTIVITY_CONFIRMED = 'activity_confirmed';
    public const TYPE_SESSION_CANCELLED = 'session_cancelled';
    public const TYPE_SESSION_TODAY = 'session_today';
    public const TYPE_SESSION_OVER = 'session_over';
    public const TYPE_SESSION_STARTED = 'session_started';

    // Admin (session live)
    public const TYPE_SESSION_STARTED_ADMIN = 'session_started_admin';

    // 30 min before session end (parent + admin)
    public const TYPE_SESSION_ENDING_SOON_PARENT = 'session_ending_soon_parent';
    public const TYPE_SESSION_ENDING_SOON_ADMIN = 'session_ending_soon_admin';

    // Parent / child & account
    public const TYPE_CHILD_APPROVED = 'child_approved';
    public const TYPE_CHILD_REJECTED = 'child_rejected';
    public const TYPE_CHILD_CHECKLIST_SUBMITTED = 'child_checklist_submitted';
    public const TYPE_USER_APPROVED = 'user_approved';
    public const TYPE_USER_REJECTED = 'user_rejected';

    // Trainer
    public const TYPE_SESSION_BOOKED = 'session_booked';
    public const TYPE_SESSION_CANCELLED_TRAINER = 'session_cancelled_trainer';
    public const TYPE_TRAINER_FORGOT_CLOCK_OUT = 'trainer_forgot_clock_out';
    public const TYPE_TRAINER_SESSION_ENDING_SOON = 'trainer_session_ending_soon';
    public const TYPE_TRAINER_SESSION_STARTING_SOON = 'trainer_session_starting_soon';
    public const TYPE_APPLICATION_APPROVED = 'application_approved';
    public const TYPE_APPLICATION_REJECTED = 'application_rejected';
    public const TYPE_APPLICATION_INFO_REQUESTED = 'application_info_requested';

    // Admin
    public const TYPE_CHILD_CHECKLIST_SUBMITTED_ADMIN = 'child_checklist_submitted_admin';
    public const TYPE_NEW_BOOKING = 'new_booking';
    public const TYPE_PAYMENT_RECEIVED = 'payment_received';
    public const TYPE_CHILD_APPROVAL_REQUIRED = 'child_approval_required';
    public const TYPE_SESSION_NEEDS_TRAINER = 'session_needs_trainer';
    public const TYPE_TRAINER_APPLICATION_SUBMITTED = 'trainer_application_submitted';
    public const TYPE_ABSENCE_REQUEST_SUBMITTED = 'absence_request_submitted';
    public const TYPE_TRAINER_AVAILABILITY_UPDATED = 'trainer_availability_updated';

    /** Category slugs for grouping in UI (booking, payment, session, child, account, trainer_application). */
    public const CATEGORY_BOOKING = 'booking';
    public const CATEGORY_PAYMENT = 'payment';
    public const CATEGORY_SESSION = 'session';
    public const CATEGORY_CHILD = 'child';
    public const CATEGORY_ACCOUNT = 'account';
    public const CATEGORY_TRAINER_APPLICATION = 'trainer_application';

    /** Map each type to a category for grouped display so admin/parent/trainer see clear sections. */
    private static array $typeToCategory = [
        self::TYPE_TRAINER_ASSIGNED => self::CATEGORY_SESSION,
        self::TYPE_BOOKING_CONFIRMED => self::CATEGORY_BOOKING,
        self::TYPE_BOOKING_CANCELLED => self::CATEGORY_BOOKING,
        self::TYPE_PAYMENT_CONFIRMED => self::CATEGORY_PAYMENT,
        self::TYPE_PAYMENT_FAILED => self::CATEGORY_PAYMENT,
        self::TYPE_ACTIVITY_CONFIRMED => self::CATEGORY_SESSION,
        self::TYPE_SESSION_CANCELLED => self::CATEGORY_SESSION,
        self::TYPE_SESSION_TODAY => self::CATEGORY_SESSION,
        self::TYPE_SESSION_OVER => self::CATEGORY_SESSION,
        self::TYPE_SESSION_STARTED => self::CATEGORY_SESSION,
        self::TYPE_SESSION_STARTED_ADMIN => self::CATEGORY_SESSION,
        self::TYPE_CHILD_APPROVED => self::CATEGORY_CHILD,
        self::TYPE_CHILD_REJECTED => self::CATEGORY_CHILD,
        self::TYPE_CHILD_CHECKLIST_SUBMITTED => self::CATEGORY_CHILD,
        self::TYPE_USER_APPROVED => self::CATEGORY_ACCOUNT,
        self::TYPE_USER_REJECTED => self::CATEGORY_ACCOUNT,
        self::TYPE_SESSION_BOOKED => self::CATEGORY_SESSION,
        self::TYPE_SESSION_CANCELLED_TRAINER => self::CATEGORY_SESSION,
        self::TYPE_TRAINER_FORGOT_CLOCK_OUT => self::CATEGORY_SESSION,
        self::TYPE_TRAINER_SESSION_ENDING_SOON => self::CATEGORY_SESSION,
        self::TYPE_TRAINER_SESSION_STARTING_SOON => self::CATEGORY_SESSION,
        self::TYPE_APPLICATION_APPROVED => self::CATEGORY_TRAINER_APPLICATION,
        self::TYPE_APPLICATION_REJECTED => self::CATEGORY_TRAINER_APPLICATION,
        self::TYPE_APPLICATION_INFO_REQUESTED => self::CATEGORY_TRAINER_APPLICATION,
        self::TYPE_CHILD_CHECKLIST_SUBMITTED_ADMIN => self::CATEGORY_CHILD,
        self::TYPE_NEW_BOOKING => self::CATEGORY_BOOKING,
        self::TYPE_PAYMENT_RECEIVED => self::CATEGORY_PAYMENT,
        self::TYPE_CHILD_APPROVAL_REQUIRED => self::CATEGORY_CHILD,
        self::TYPE_SESSION_NEEDS_TRAINER => self::CATEGORY_SESSION,
        self::TYPE_TRAINER_APPLICATION_SUBMITTED => self::CATEGORY_TRAINER_APPLICATION,
        self::TYPE_ABSENCE_REQUEST_SUBMITTED => self::CATEGORY_SESSION,
        self::TYPE_TRAINER_AVAILABILITY_UPDATED => self::CATEGORY_SESSION,
    ];

    /** Human-readable labels for each category (for admin, parent, and trainer dashboards). */
    private static array $categoryLabels = [
        self::CATEGORY_BOOKING => 'Booking',
        self::CATEGORY_PAYMENT => 'Payment',
        self::CATEGORY_SESSION => 'Session',
        self::CATEGORY_CHILD => 'Child & checklist',
        self::CATEGORY_ACCOUNT => 'Account',
        self::CATEGORY_TRAINER_APPLICATION => 'Trainer application',
    ];

    /**
     * Get the category slug for a notification type (for grouping and filtering).
     */
    public static function categoryForType(string $type): string
    {
        return self::$typeToCategory[$type] ?? self::CATEGORY_SESSION;
    }

    /**
     * Get the human-readable label for a category (for UI section headers and badges).
     */
    public static function categoryLabelForType(string $type): string
    {
        $category = self::categoryForType($type);
        return self::$categoryLabels[$category] ?? 'Notification';
    }

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'link',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isRead(): bool
    {
        return $this->read_at !== null;
    }
}
