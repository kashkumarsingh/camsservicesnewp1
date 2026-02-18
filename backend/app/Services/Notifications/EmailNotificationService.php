<?php

namespace App\Services\Notifications;

use App\Models\Booking;
use App\Models\Child;
use App\Models\User;
use App\Models\ContactSubmission;

/**
 * Email Notification Service Interface
 * 
 * Clean Architecture: Application Layer (Service Interface)
 * Purpose: Defines contract for email notification operations
 * Location: backend/app/Services/Notifications/EmailNotificationService.php
 * 
 * This interface provides a centralized way to send all email notifications
 * in the application, ensuring consistency and making it easy to:
 * - Test notifications (mock the interface)
 * - Add new notification channels (SMS, Push) in the future
 * - Implement retry logic, rate limiting, analytics
 * - Maintain consistent error handling
 */
interface EmailNotificationService
{
    // ============================================
    // User & Child Approval Notifications
    // ============================================

    /**
     * Send notification when child is approved
     * 
     * @param Child $child The approved child
     * @return void
     */
    public function sendChildApproved(Child $child): void;

    /**
     * Send notification when child is rejected
     * 
     * @param Child $child The rejected child
     * @param string $reason Rejection reason
     * @return void
     */
    public function sendChildRejected(Child $child, string $reason): void;

    /**
     * Send notification when user account is approved
     * 
     * @param User $user The approved user
     * @return void
     */
    public function sendUserApproved(User $user): void;

    /**
     * Send notification when user account is rejected
     * 
     * @param User $user The rejected user
     * @param string $reason Rejection reason
     * @return void
     */
    public function sendUserRejected(User $user, string $reason): void;

    // ============================================
    // Booking Notifications
    // ============================================

    /**
     * Send notification when booking is created (draft status)
     * 
     * @param Booking $booking The created booking
     * @return void
     */
    public function sendBookingConfirmation(Booking $booking): void;

    /**
     * Send notification when booking is cancelled
     * 
     * @param Booking $booking The cancelled booking
     * @param string|null $reason Cancellation reason (optional)
     * @return void
     */
    public function sendBookingCancellation(Booking $booking, ?string $reason = null): void;

    /**
     * Send notification when payment is confirmed
     * 
     * @param Booking $booking The booking with confirmed payment
     * @return void
     */
    public function sendPaymentConfirmation(Booking $booking): void;

    /**
     * Send notification when payment fails
     * 
     * @param Booking $booking The booking with failed payment
     * @param string $error Error message or reason
     * @return void
     */
    public function sendPaymentFailed(Booking $booking, string $error): void;

    /**
     * Send notification when booking status changes
     * 
     * @param Booking $booking The booking with updated status
     * @param string $oldStatus Previous status
     * @param string $newStatus New status
     * @return void
     */
    public function sendBookingStatusUpdate(Booking $booking, string $oldStatus, string $newStatus): void;

    // ============================================
    // Session & Activity Notifications
    // ============================================

    /**
     * Send notification when activity/session is confirmed
     * 
     * @param Booking $booking The booking
     * @param \App\Models\BookingSchedule $schedule The schedule with confirmed activities
     * @param \Illuminate\Database\Eloquent\Collection $activities Collection of confirmed activities
     * @return void
     */
    public function sendActivityConfirmation(Booking $booking, \App\Models\BookingSchedule $schedule, \Illuminate\Database\Eloquent\Collection $activities): void;

    /**
     * Send notification when session is cancelled
     * 
     * @param Booking $booking The booking
     * @param string $sessionId Session ID or identifier
     * @param string $reason Cancellation reason
     * @return void
     */
    public function sendSessionCancelled(Booking $booking, string $sessionId, string $reason): void;

    // ============================================
    // Trainer Notifications
    // ============================================

    /**
     * Send notification to trainer when session is booked for them
     *
     * @param \App\Models\BookingSchedule $schedule The booked session
     * @return void
     */
    public function sendSessionBookedToTrainer(\App\Models\BookingSchedule $schedule): void;

    /**
     * Send session confirmation request to trainer (accept/decline within 24h)
     *
     * @param \App\Models\BookingSchedule $schedule The session pending trainer confirmation
     * @return void
     */
    public function sendSessionConfirmationRequestToTrainer(\App\Models\BookingSchedule $schedule): void;

    /**
     * Send notification to trainer when session is cancelled
     * 
     * @param \App\Models\BookingSchedule $schedule The cancelled session
     * @param string $reason Cancellation reason
     * @return void
     */
    public function sendSessionCancelledToTrainer(\App\Models\BookingSchedule $schedule, string $reason): void;

    /**
     * Send notification to trainer when new booking is assigned to them
     * 
     * @param Booking $booking The booking assigned to trainer
     * @param \App\Models\Trainer $trainer The trainer
     * @return void
     */
    public function sendBookingAssignedToTrainer(Booking $booking, \App\Models\Trainer $trainer): void;

    // ============================================
    // Admin Notifications
    // ============================================

    /**
     * Send contact form submission to admin
     * 
     * @param ContactSubmission $submission The contact submission
     * @return void
     */
    public function sendContactSubmissionToAdmin(ContactSubmission $submission): void;

    /**
     * Send new booking alert to admin
     * 
     * @param Booking $booking The new booking
     * @return void
     */
    public function sendNewBookingToAdmin(Booking $booking): void;

    /**
     * Send payment received alert to admin
     * 
     * @param Booking $booking The booking with payment
     * @return void
     */
    public function sendPaymentReceivedToAdmin(Booking $booking): void;

    /**
     * Send child approval required alert to admin
     * 
     * @param Child $child The child requiring approval
     * @return void
     */
    public function sendChildApprovalRequiredToAdmin(Child $child): void;

    /**
     * Send session needs trainer alert to admin
     *
     * @param \App\Models\BookingSchedule $schedule The session without a trainer
     * @return void
     */
    public function sendSessionNeedsTrainerToAdmin(\App\Models\BookingSchedule $schedule): void;

    /**
     * Send notification to parent when a trainer is assigned to their session
     *
     * @param \App\Models\BookingSchedule $schedule The session with newly assigned trainer
     * @return void
     */
    public function sendTrainerAssignedToParent(\App\Models\BookingSchedule $schedule): void;

    // ============================================
    // Trainer Application Notifications
    // ============================================

    /**
     * Send trainer application submitted notification to admin
     * 
     * @param \App\Models\TrainerApplication $application The submitted application
     * @return void
     */
    public function sendTrainerApplicationSubmittedToAdmin(\App\Models\TrainerApplication $application): void;

    /**
     * Send trainer application approved notification to applicant
     * 
     * @param \App\Models\TrainerApplication $application The approved application
     * @param string|null $loginEmail Login email (if account created)
     * @param string|null $temporaryPassword Temporary password (if generated)
     * @return void
     */
    public function sendTrainerApplicationApproved(
        \App\Models\TrainerApplication $application,
        ?string $loginEmail = null,
        ?string $temporaryPassword = null
    ): void;

    /**
     * Send trainer application rejected notification to applicant
     * 
     * @param \App\Models\TrainerApplication $application The rejected application
     * @param string|null $reason Rejection reason
     * @return void
     */
    public function sendTrainerApplicationRejected(
        \App\Models\TrainerApplication $application,
        ?string $reason = null
    ): void;

    /**
     * Send "we need more information" to applicant with link to respond.
     *
     * @param \App\Models\TrainerApplication $application
     * @param string $message Admin's message to the applicant
     * @return void
     */
    public function sendTrainerApplicationInformationRequested(
        \App\Models\TrainerApplication $application,
        string $message
    ): void;
}
