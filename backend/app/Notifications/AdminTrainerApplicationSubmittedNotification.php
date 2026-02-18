<?php

namespace App\Notifications;

use App\Models\TrainerApplication;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Admin Trainer Application Submitted Notification
 *
 * Clean Architecture: Infrastructure Layer
 * Purpose: Email notification to admin when new trainer application is submitted
 * Sends synchronously so admin is notified immediately without requiring a queue worker.
 */
class AdminTrainerApplicationSubmittedNotification extends Notification
{
    public function __construct(private readonly TrainerApplication $application)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $applicantName = $this->application->full_name;
        $applicationDate = $this->application->created_at->format('l, F j, Y');
        $experienceYears = $this->application->experience_years ?? 'Not specified';

        return (new MailMessage())
            ->subject('New Trainer Application - ' . $applicantName)
            ->markdown('mail.admin.trainer-application-submitted', [
                'application' => $this->application,
                'applicantName' => $applicantName,
                'applicationDate' => $applicationDate,
                'experienceYears' => $experienceYears,
            ]);
    }
}
