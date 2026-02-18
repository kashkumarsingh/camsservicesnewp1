<?php

namespace App\Notifications;

use App\Models\TrainerApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Trainer Application Rejected Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Email notification to applicant when their trainer application is rejected
 * Location: backend/app/Notifications/TrainerApplicationRejectedNotification.php
 */
class TrainerApplicationRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly TrainerApplication $application,
        private readonly ?string $reason = null
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $applicantName = $this->application->first_name;

        return (new MailMessage())
            ->subject('Trainer Application Update')
            ->markdown('mail.trainer.application-rejected', [
                'application' => $this->application,
                'applicantName' => $applicantName,
                'reason' => $this->reason ?? $this->application->review_notes,
            ]);
    }
}
