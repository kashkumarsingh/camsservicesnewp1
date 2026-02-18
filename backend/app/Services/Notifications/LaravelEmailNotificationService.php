<?php

namespace App\Services\Notifications;

use App\Models\Booking;
use App\Models\Child;
use App\Models\User;
use App\Models\ContactSubmission;
use App\Models\UserNotification;
use App\Notifications\BookingConfirmationNotification;
use App\Notifications\BookingCancellationNotification;
use App\Notifications\PaymentConfirmationNotification;
use App\Notifications\PaymentFailedNotification;
use App\Notifications\ActivityConfirmationNotification;
use App\Notifications\TrainerSessionBookedNotification;
use App\Notifications\TrainerSessionCancelledNotification;
use App\Notifications\AdminNewBookingNotification;
use App\Notifications\AdminPaymentReceivedNotification;
use App\Notifications\AdminChildApprovalRequiredNotification;
use App\Notifications\AdminSessionNeedsTrainerNotification;
use App\Notifications\NewContactSubmissionNotification;
use App\Notifications\ParentTrainerAssignedNotification;
use App\Mail\ChildApprovedNotification as ChildApprovedMailable;
use App\Mail\ChildRejectedNotification as ChildRejectedMailable;
use App\Mail\UserApprovedNotification as UserApprovedMailable;
use App\Mail\UserRejectedNotification as UserRejectedMailable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Mail;

/**
 * Laravel Email Notification Service
 * 
 * Clean Architecture: Infrastructure Layer (Service Implementation)
 * Purpose: Implements EmailNotificationService using Laravel Mail/Notification
 * Location: backend/app/Services/Notifications/LaravelEmailNotificationService.php
 * 
 * This service:
 * - Provides centralized email notification sending
 * - Handles errors gracefully with logging
 * - Uses existing Mailable and Notification classes
 * - Queues notifications for performance
 * - Maintains consistent error handling across all notifications
 */
class LaravelEmailNotificationService implements EmailNotificationService
{
    private function dashboard(): DashboardNotificationService
    {
        return app(DashboardNotificationService::class);
    }

    // ============================================
    // User & Child Approval Notifications
    // ============================================

    /**
     * Send child approved notification. Delegates to central dispatcher (in_app + email).
     */
    public function sendChildApproved(Child $child): void
    {
        app(\App\Contracts\Notifications\INotificationDispatcher::class)
            ->dispatch(\App\Services\Notifications\NotificationIntentFactory::childApproved($child));
    }

    /**
     * Send child rejected notification. Delegates to central dispatcher (in_app + email).
     */
    public function sendChildRejected(Child $child, string $reason): void
    {
        app(\App\Contracts\Notifications\INotificationDispatcher::class)
            ->dispatch(\App\Services\Notifications\NotificationIntentFactory::childRejected($child, $reason));
    }

    /**
     * Send user approved notification. Delegates to central dispatcher (in_app + email).
     */
    public function sendUserApproved(User $user): void
    {
        app(\App\Contracts\Notifications\INotificationDispatcher::class)
            ->dispatch(\App\Services\Notifications\NotificationIntentFactory::userApproved($user));
    }

    /**
     * Send user rejected notification. Delegates to central dispatcher (in_app + email).
     */
    public function sendUserRejected(User $user, string $reason): void
    {
        app(\App\Contracts\Notifications\INotificationDispatcher::class)
            ->dispatch(\App\Services\Notifications\NotificationIntentFactory::userRejected($user, $reason));
    }

    // ============================================
    // Booking Notifications
    // ============================================

    /**
     * Send booking confirmation notification
     */
    public function sendBookingConfirmation(Booking $booking): void
    {
        if ($booking->user_id) {
            $pkg = $booking->package?->name ?? 'your package';
            $this->dashboard()->notify(
                $booking->user_id,
                UserNotification::TYPE_BOOKING_CONFIRMED,
                'Booking received',
                'Your booking for ' . $pkg . ' (Ref ' . ($booking->reference ?? '') . ') has been received.',
                '/dashboard/parent',
                'booking:' . $booking->id
            );
        }
        if (blank($booking->parent_email)) {
            Log::warning('Cannot send booking confirmation: no email', [
                'booking_id' => $booking->id,
            ]);
            return;
        }

        try {
            Notification::route('mail', $booking->parent_email)
                ->notify(new BookingConfirmationNotification($booking));

            Log::info('Booking confirmation notification sent', [
                'booking_id' => $booking->id,
                'booking_reference' => $booking->reference,
                'email' => $booking->parent_email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send booking confirmation notification', [
                'booking_id' => $booking->id,
                'email' => $booking->parent_email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Send booking cancellation notification
     */
    public function sendBookingCancellation(Booking $booking, ?string $reason = null): void
    {
        if ($booking->user_id) {
            $this->dashboard()->notify(
                $booking->user_id,
                UserNotification::TYPE_BOOKING_CANCELLED,
                'Booking cancelled',
                'Your booking (Ref ' . ($booking->reference ?? '') . ') has been cancelled.' . ($reason ? ' ' . $reason : ''),
                '/dashboard/parent/bookings',
                'booking:' . $booking->id
            );
        }
        if (blank($booking->parent_email)) {
            Log::warning('Cannot send booking cancellation: no email', [
                'booking_id' => $booking->id,
            ]);
            return;
        }

        try {
            Notification::route('mail', $booking->parent_email)
                ->notify(new BookingCancellationNotification($booking, $reason));

            Log::info('Booking cancellation notification sent', [
                'booking_id' => $booking->id,
                'booking_reference' => $booking->reference,
                'email' => $booking->parent_email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send booking cancellation notification', [
                'booking_id' => $booking->id,
                'email' => $booking->parent_email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Send payment confirmation. Delegates to central dispatcher (in_app + email).
     */
    public function sendPaymentConfirmation(Booking $booking): void
    {
        app(\App\Contracts\Notifications\INotificationDispatcher::class)
            ->dispatch(\App\Services\Notifications\NotificationIntentFactory::paymentConfirmed($booking));
    }

    /**
     * Send payment failed notification. Delegates to central dispatcher (in_app + email).
     */
    public function sendPaymentFailed(Booking $booking, string $error): void
    {
        app(\App\Contracts\Notifications\INotificationDispatcher::class)
            ->dispatch(\App\Services\Notifications\NotificationIntentFactory::paymentFailed($booking, $error));
    }

    /**
     * Send booking status update. No dedicated intent; log only. Use bookingConfirmation/bookingCancelled intents where applicable.
     */
    public function sendBookingStatusUpdate(Booking $booking, string $oldStatus, string $newStatus): void
    {
        Log::info('Booking status update (no dedicated notification intent)', [
            'booking_id' => $booking->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
        ]);
    }

    // ============================================
    // Session & Activity Notifications
    // ============================================

    /**
     * Send activity confirmation notification
     */
    public function sendActivityConfirmation(Booking $booking, \App\Models\BookingSchedule $schedule, \Illuminate\Database\Eloquent\Collection $activities): void
    {
        if ($booking->user_id) {
            $dateStr = $schedule->date?->format('l, j M') ?? '';
            $this->dashboard()->notify(
                $booking->user_id,
                UserNotification::TYPE_ACTIVITY_CONFIRMED,
                'Session activities confirmed',
                'Activities for your session on ' . $dateStr . ' have been confirmed by the trainer.',
                '/dashboard/parent',
                'schedule:' . $schedule->id
            );
        }
        if (blank($booking->parent_email)) {
            Log::warning('Cannot send activity confirmation: no email', [
                'booking_id' => $booking->id,
            ]);
            return;
        }

        try {
            Notification::route('mail', $booking->parent_email)
                ->notify(new ActivityConfirmationNotification($booking, $schedule, $activities));

            Log::info('Activity confirmation notification sent', [
                'booking_id' => $booking->id,
                'schedule_id' => $schedule->id,
                'email' => $booking->parent_email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send activity confirmation notification', [
                'booking_id' => $booking->id,
                'schedule_id' => $schedule->id,
                'email' => $booking->parent_email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Send session cancelled. No dedicated parent-facing email intent; in_app only. Session cancellation to trainer uses SESSION_CANCELLED_TRAINER.
     */
    public function sendSessionCancelled(Booking $booking, string $sessionId, string $reason): void
    {
        if ($booking->user_id) {
            $this->dashboard()->notify(
                $booking->user_id,
                UserNotification::TYPE_SESSION_CANCELLED,
                'Session cancelled',
                'A session for booking Ref ' . ($booking->reference ?? '') . ' has been cancelled.' . ($reason ? ' ' . $reason : ''),
                '/dashboard/parent',
                'schedule:' . $sessionId
            );
        }
        Log::info('Session cancelled (in_app only; no parent email intent)', [
            'booking_id' => $booking->id,
            'session_id' => $sessionId,
        ]);
    }

    // ============================================
    // Admin Notifications
    // ============================================

    /**
     * Send contact submission to admin
     * 
     * Note: This uses the existing job-based system which handles
     * multiple admin emails and WhatsApp. We keep this as-is for now.
     */
    public function sendContactSubmissionToAdmin(ContactSubmission $submission): void
    {
        // Use existing job-based notification system
        // This is already well-implemented with support for multiple admin emails
        // and WhatsApp notifications, so we keep it as-is
        Log::info('Contact submission admin notification requested (uses existing job system)', [
            'submission_id' => $submission->id,
        ]);
    }

    /**
     * Send new booking alert to admin
     */
    public function sendNewBookingToAdmin(Booking $booking): void
    {
        $ref = $booking->reference ?? '';
        $this->dashboard()->notifyAdmins(
            UserNotification::TYPE_NEW_BOOKING,
            'New booking',
            'New booking Ref ' . $ref . ' has been received. Review and confirm if needed.',
            '/dashboard/admin/bookings?status=pending',
            'booking:' . $booking->id
        );

        $settings = \App\Models\SiteSetting::instance();
        $emails = $this->extractAdminEmails($settings->support_emails ?? []);

        if (empty($emails)) {
            Log::warning('No admin emails configured for new booking notification', [
                'booking_id' => $booking->id,
            ]);
            return;
        }

        foreach ($emails as $email) {
            try {
                Notification::route('mail', $email)
                    ->notify(new AdminNewBookingNotification($booking));

                Log::info('New booking admin notification sent', [
                    'booking_id' => $booking->id,
                    'booking_reference' => $booking->reference,
                    'email' => $email,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send new booking admin notification', [
                    'booking_id' => $booking->id,
                    'email' => $email,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Send payment received alert to admin
     */
    public function sendPaymentReceivedToAdmin(Booking $booking): void
    {
        $ref = $booking->reference ?? '';
        $this->dashboard()->notifyAdmins(
            UserNotification::TYPE_PAYMENT_RECEIVED,
            'Payment received',
            'Payment received for booking Ref ' . $ref . '.',
            '/dashboard/admin/bookings',
            'booking:' . $booking->id
        );

        $settings = \App\Models\SiteSetting::instance();
        $emails = $this->extractAdminEmails($settings->support_emails ?? []);

        if (empty($emails)) {
            Log::warning('No admin emails configured for payment received notification', [
                'booking_id' => $booking->id,
            ]);
            return;
        }

        foreach ($emails as $email) {
            try {
                Notification::route('mail', $email)
                    ->notify(new AdminPaymentReceivedNotification($booking));

                Log::info('Payment received admin notification sent', [
                    'booking_id' => $booking->id,
                    'booking_reference' => $booking->reference,
                    'email' => $email,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send payment received admin notification', [
                    'booking_id' => $booking->id,
                    'email' => $email,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Send child approval required alert to admin
     */
    public function sendChildApprovalRequiredToAdmin(Child $child): void
    {
        $this->dashboard()->notifyAdmins(
            UserNotification::TYPE_CHILD_APPROVAL_REQUIRED,
            'Child approval required',
            $child->name . '\'s checklist has been submitted. Review and approve or reject.',
            '/dashboard/admin/children',
            'child:' . $child->id
        );

        $settings = \App\Models\SiteSetting::instance();
        $emails = $this->extractAdminEmails($settings->support_emails ?? []);

        if (empty($emails)) {
            Log::warning('No admin emails configured for child approval required notification', [
                'child_id' => $child->id,
            ]);
            return;
        }

        foreach ($emails as $email) {
            try {
                Notification::route('mail', $email)
                    ->notify(new AdminChildApprovalRequiredNotification($child));

                Log::info('Child approval required admin notification sent', [
                    'child_id' => $child->id,
                    'email' => $email,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send child approval required admin notification', [
                    'child_id' => $child->id,
                    'email' => $email,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    // ============================================
    // Trainer Notifications
    // ============================================

    /**
     * Send notification to trainer when session is booked for them
     */
    public function sendSessionBookedToTrainer(\App\Models\BookingSchedule $schedule): void
    {
        $trainer = $schedule->trainer;
        if (!$trainer || !$trainer->user?->email) {
            Log::warning('Cannot send session booked notification to trainer: no email', [
                'schedule_id' => $schedule->id,
                'trainer_id' => $trainer?->id,
            ]);
            return;
        }

        if ($trainer->user_id) {
            $booking = $schedule->booking;
            $children = $booking?->children?->pluck('name')->join(', ') ?: 'Client';
            $dateStr = $schedule->date?->format('l, j M') ?? '';
            $this->dashboard()->notify(
                $trainer->user_id,
                UserNotification::TYPE_SESSION_BOOKED,
                'New session assigned',
                $children . ' – ' . $dateStr . '. A new session has been assigned to you.',
                '/dashboard/trainer/bookings',
                'schedule:' . $schedule->id
            );
        }
        try {
            Notification::route('mail', $trainer->user->email)
                ->notify(new TrainerSessionBookedNotification($schedule));

            Log::info('Session booked notification sent to trainer', [
                'schedule_id' => $schedule->id,
                'trainer_id' => $trainer->id,
                'email' => $trainer->user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send session booked notification to trainer', [
                'schedule_id' => $schedule->id,
                'trainer_id' => $trainer->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Send session confirmation request to trainer (accept/decline)
     */
    public function sendSessionConfirmationRequestToTrainer(\App\Models\BookingSchedule $schedule): void
    {
        $trainer = $schedule->trainer;
        if (!$trainer || !$trainer->user?->email) {
            Log::warning('Cannot send session confirmation request to trainer: no email', [
                'schedule_id' => $schedule->id,
                'trainer_id' => $trainer?->id,
            ]);
            return;
        }

        if ($trainer->user_id) {
            $booking = $schedule->booking;
            $children = $booking?->children?->pluck('name')->join(', ') ?: 'Client';
            $dateStr = $schedule->date?->format('l, j M') ?? '';
            $this->dashboard()->notify(
                $trainer->user_id,
                \App\Models\UserNotification::TYPE_SESSION_BOOKED,
                'Session confirmation requested',
                $children . ' – ' . $dateStr . '. Please confirm or decline this session.',
                '/dashboard/trainer/schedules?confirm=' . $schedule->id,
                'schedule:' . $schedule->id
            );
        }
        try {
            Notification::route('mail', $trainer->user->email)
                ->notify(new \App\Notifications\TrainerSessionConfirmationRequestNotification($schedule));

            Log::info('Session confirmation request sent to trainer', [
                'schedule_id' => $schedule->id,
                'trainer_id' => $trainer->id,
                'email' => $trainer->user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send session confirmation request to trainer', [
                'schedule_id' => $schedule->id,
                'trainer_id' => $trainer->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Send notification to trainer when session is cancelled
     */
    public function sendSessionCancelledToTrainer(\App\Models\BookingSchedule $schedule, string $reason): void
    {
        $trainer = $schedule->trainer;
        if (!$trainer || !$trainer->user?->email) {
            Log::warning('Cannot send session cancelled notification to trainer: no email', [
                'schedule_id' => $schedule->id,
                'trainer_id' => $trainer?->id,
            ]);
            return;
        }

        if ($trainer->user_id) {
            $dateStr = $schedule->date?->format('l, j M') ?? '';
            $this->dashboard()->notify(
                $trainer->user_id,
                UserNotification::TYPE_SESSION_CANCELLED_TRAINER,
                'Session cancelled',
                'A session on ' . $dateStr . ' has been cancelled.' . ($reason ? ' ' . $reason : ''),
                '/dashboard/trainer/bookings',
                'schedule:' . $schedule->id
            );
        }
        try {
            Notification::route('mail', $trainer->user->email)
                ->notify(new TrainerSessionCancelledNotification($schedule, $reason));

            Log::info('Session cancelled notification sent to trainer', [
                'schedule_id' => $schedule->id,
                'trainer_id' => $trainer->id,
                'email' => $trainer->user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send session cancelled notification to trainer', [
                'schedule_id' => $schedule->id,
                'trainer_id' => $trainer->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Send notification to trainer when new booking is assigned to them
     */
    public function sendBookingAssignedToTrainer(Booking $booking, \App\Models\Trainer $trainer): void
    {
        if (!$trainer->user?->email) {
            Log::warning('Cannot send booking assigned notification to trainer: no email', [
                'booking_id' => $booking->id,
                'trainer_id' => $trainer->id,
            ]);
            return;
        }

        // For now, we'll use session booked notification when first session is created
        // This can be enhanced later with a dedicated BookingAssignedToTrainerNotification
        Log::info('Booking assigned to trainer notification requested (use session booked notification instead)', [
            'booking_id' => $booking->id,
            'trainer_id' => $trainer->id,
        ]);
    }

    // ============================================
    // Helper Methods
    // ============================================

    /**
     * Send session needs trainer alert to admin
     */
    public function sendSessionNeedsTrainerToAdmin(\App\Models\BookingSchedule $schedule): void
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
        $this->dashboard()->notifyAdmins(
            UserNotification::TYPE_SESSION_NEEDS_TRAINER,
            'Session needs trainer',
            $message,
            '/dashboard/admin/bookings?needs_trainer=1',
            'schedule:' . $schedule->id
        );

        $settings = \App\Models\SiteSetting::instance();
        $emails = $this->extractAdminEmails($settings->support_emails ?? []);

        if (empty($emails)) {
            Log::warning('No admin emails configured for session needs trainer notification', [
                'schedule_id' => $schedule->id,
            ]);
            return;
        }

        foreach ($emails as $email) {
            try {
                Notification::route('mail', $email)
                    ->notify(new AdminSessionNeedsTrainerNotification($schedule));

                Log::info('Session needs trainer admin notification sent', [
                    'schedule_id' => $schedule->id,
                    'booking_id' => $schedule->booking_id,
                    'email' => $email,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send session needs trainer admin notification', [
                    'schedule_id' => $schedule->id,
                    'email' => $email,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Send notification to parent when a trainer is assigned to their session.
     * In-app (bell) + email so parent sees it on dashboard and in inbox.
     */
    public function sendTrainerAssignedToParent(\App\Models\BookingSchedule $schedule): void
    {
        $booking = $schedule->booking;
        if (!$booking) {
            Log::warning('Cannot send trainer assigned to parent: no booking', [
                'schedule_id' => $schedule->id,
            ]);
            return;
        }

        $trainerName = $schedule->trainer?->name ?? 'A trainer';
        $childNames = $booking->children?->pluck('name')->join(', ') ?: 'Your child';
        $sessionDate = $schedule->date?->format('l, j F Y') ?? '';
        $sessionTime = $schedule->start_time && $schedule->end_time
            ? \Carbon\Carbon::parse($schedule->start_time)->format('g:i A') . ' – ' . \Carbon\Carbon::parse($schedule->end_time)->format('g:i A')
            : '';
        $message = $trainerName . ' has been assigned to ' . $childNames . "'s session" . ($sessionDate ? ' on ' . $sessionDate : '') . ($sessionTime ? ' · ' . $sessionTime : '') . '.';
        $link = '/dashboard/parent';

        if ($booking->user_id) {
            $this->dashboard()->notify(
                $booking->user_id,
                UserNotification::TYPE_TRAINER_ASSIGNED,
                'Trainer assigned to your session',
                $message,
                $link,
                'schedule:' . $schedule->id
            );
        }

        $user = $booking->user;
        $email = $user?->email ?? $booking->parent_email ?? $booking->guest_email;
        if (blank($email)) {
            Log::warning('Cannot send trainer assigned to parent: no email', [
                'booking_id' => $booking->id,
            ]);
            return;
        }

        try {
            if ($user) {
                $user->notify(new ParentTrainerAssignedNotification($schedule));
            } else {
                Notification::route('mail', $email)->notify(new ParentTrainerAssignedNotification($schedule));
            }
            Log::info('Trainer assigned to parent notification sent', [
                'schedule_id' => $schedule->id,
                'booking_id' => $booking->id,
                'email' => $email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send trainer assigned to parent notification', [
                'schedule_id' => $schedule->id,
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    // ============================================
    // Trainer Application Notifications
    // ============================================

    public function sendTrainerApplicationSubmittedToAdmin(\App\Models\TrainerApplication $application): void
    {
        $this->dashboard()->notifyAdmins(
            UserNotification::TYPE_TRAINER_APPLICATION_SUBMITTED,
            'Trainer application submitted',
            $application->full_name . ' has submitted a trainer application. Review and approve or reject.',
            '/dashboard/admin/trainer-applications',
            'application:' . $application->id
        );

        $settings = \App\Models\SiteSetting::instance();
        $emails = $this->extractAdminEmails($settings->support_emails ?? []);

        // Fallback so admin is notified when support_emails not set in site settings (e.g. fresh install)
        if (empty($emails)) {
            $fallback = config('mail.admin_notification_email') ?: env('ADMIN_EMAIL') ?: config('mail.from.address');
            if (filled($fallback)) {
                $emails = [$fallback];
                Log::info('Trainer application notification using fallback admin email (support_emails not set)', [
                    'application_id' => $application->id,
                ]);
            }
        }

        if (empty($emails)) {
            Log::warning('No admin emails configured for trainer application notification', [
                'application_id' => $application->id,
            ]);
            return;
        }

        foreach ($emails as $email) {
            try {
                Notification::route('mail', $email)
                    ->notify(new \App\Notifications\AdminTrainerApplicationSubmittedNotification($application));

                Log::info('Trainer application submitted notification sent to admin', [
                    'application_id' => $application->id,
                    'applicant' => $application->full_name,
                    'admin_email' => $email,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send trainer application submitted notification', [
                    'application_id' => $application->id,
                    'admin_email' => $email,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    public function sendTrainerApplicationApproved(
        \App\Models\TrainerApplication $application,
        ?string $loginEmail = null,
        ?string $temporaryPassword = null
    ): void {
        if (blank($application->email)) {
            Log::warning('Cannot send trainer application approved: no email', [
                'application_id' => $application->id,
            ]);
            return;
        }

        try {
            Notification::route('mail', $application->email)
                ->notify(new \App\Notifications\TrainerApplicationApprovedNotification(
                    $application,
                    $loginEmail,
                    $temporaryPassword
                ));

            Log::info('Trainer application approved notification sent', [
                'application_id' => $application->id,
                'applicant_email' => $application->email,
                'has_login' => !empty($loginEmail),
            ]);
            $applicantUser = User::where('email', $application->email)->first();
            if ($applicantUser) {
                $this->dashboard()->notify(
                    $applicantUser->id,
                    UserNotification::TYPE_APPLICATION_APPROVED,
                    'Application approved',
                    'Your trainer application has been approved. You can now sign in to the trainer dashboard.',
                    '/dashboard/trainer',
                    'application:' . $application->id
                );
            }
        } catch (\Exception $e) {
            Log::error('Failed to send trainer application approved notification', [
                'application_id' => $application->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function sendTrainerApplicationRejected(
        \App\Models\TrainerApplication $application,
        ?string $reason = null
    ): void {
        if (blank($application->email)) {
            Log::warning('Cannot send trainer application rejected: no email', [
                'application_id' => $application->id,
            ]);
            return;
        }

        try {
            Notification::route('mail', $application->email)
                ->notify(new \App\Notifications\TrainerApplicationRejectedNotification($application, $reason));

            Log::info('Trainer application rejected notification sent', [
                'application_id' => $application->id,
                'applicant_email' => $application->email,
                'has_reason' => !empty($reason),
            ]);
            $applicantUser = User::where('email', $application->email)->first();
            if ($applicantUser) {
                $this->dashboard()->notify(
                    $applicantUser->id,
                    UserNotification::TYPE_APPLICATION_REJECTED,
                    'Application not approved',
                    'Your trainer application was not approved.' . ($reason ? ' ' . $reason : ''),
                    null,
                    'application:' . $application->id
                );
            }
        } catch (\Exception $e) {
            Log::error('Failed to send trainer application rejected notification', [
                'application_id' => $application->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function sendTrainerApplicationInformationRequested(
        \App\Models\TrainerApplication $application,
        string $message
    ): void {
        if (blank($application->email)) {
            Log::warning('Cannot send trainer application information requested: no email', [
                'application_id' => $application->id,
            ]);
            return;
        }

        try {
            Notification::route('mail', $application->email)
                ->notify(new \App\Notifications\TrainerApplicationInformationRequestedNotification($application, $message));

            Log::info('Trainer application information requested notification sent', [
                'application_id' => $application->id,
                'applicant_email' => $application->email,
            ]);
            $applicantUser = User::where('email', $application->email)->first();
            if ($applicantUser) {
                $this->dashboard()->notify(
                    $applicantUser->id,
                    UserNotification::TYPE_APPLICATION_INFO_REQUESTED,
                    'More information needed',
                    'We need more information about your trainer application. Please check your email.',
                    null,
                    'application:' . $application->id
                );
            }
        } catch (\Exception $e) {
            Log::error('Failed to send trainer application information requested notification', [
                'application_id' => $application->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    // ============================================
    // Private Helper Methods
    // ============================================

    /**
     * Extract admin emails from SiteSettings format
     * Handles both repeater-style [['value' => 'x']] and direct array format
     */
    private function extractAdminEmails(array $rawEmails): array
    {
        return collect($rawEmails)
            ->map(function ($item) {
                // If it's an object/array with 'value' key, extract it
                if (is_array($item) && isset($item['value'])) {
                    return $item['value'];
                }
                // If it's already a string, use it directly
                if (is_string($item)) {
                    return $item;
                }
                return null;
            })
            ->filter(fn ($email) => filled($email) && is_string($email))
            ->unique()
            ->values()
            ->all();
    }
}
