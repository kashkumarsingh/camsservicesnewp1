<?php

namespace App\Notifications;

use App\Models\TrainerApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Trainer Application Approved Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Email notification to applicant when their trainer application is approved
 * Location: backend/app/Notifications/TrainerApplicationApprovedNotification.php
 */
class TrainerApplicationApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly TrainerApplication $application,
        private readonly ?string $loginEmail = null,
        private readonly ?string $temporaryPassword = null
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
            ->subject('Trainer Application Approved - Welcome to CAMS Services!')
            ->markdown('mail.trainer.application-approved', [
                'application' => $this->application,
                'applicantName' => $applicantName,
                'loginEmail' => $this->loginEmail ?? $this->application->email,
                'temporaryPassword' => $this->temporaryPassword,
                'hasAccount' => !empty($this->loginEmail),
            ]);
    }
}
