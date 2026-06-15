<?php

namespace App\Notifications;

use App\Models\TrainerAbsenceRequest;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminTrainerAbsenceRequestNotification extends Notification
{
    public function __construct(private readonly TrainerAbsenceRequest $absence)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->absence->loadMissing('trainer.user');
        $trainerName = $this->absence->trainer?->user?->name ?? 'A trainer';

        return (new MailMessage)
            ->subject(sprintf('Trainer absence request: %s', $trainerName))
            ->markdown('mail.admin.trainer-absence-request', [
                'absence' => $this->absence,
                'trainerName' => $trainerName,
                'viewUrl' => frontend_url('/dashboard/admin/absence-requests'),
            ]);
    }
}
