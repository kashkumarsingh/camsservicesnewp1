<?php

namespace App\Notifications;

use App\Models\TrainerApplication;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminTrainerApplicationResponseNotification extends Notification
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
        return (new MailMessage)
            ->subject(sprintf('Trainer application response: %s', $this->application->full_name))
            ->markdown('mail.admin.trainer-application-response', [
                'application' => $this->application,
                'viewUrl' => frontend_url('/dashboard/admin/trainer-applications'),
            ]);
    }
}
