<?php

namespace App\Notifications;

use App\Models\Trainer;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminTrainerAvailabilityUpdatedNotification extends Notification
{
    public function __construct(private readonly Trainer $trainer)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->trainer->loadMissing('user');
        $trainerName = $this->trainer->user?->name ?? $this->trainer->name ?? 'A trainer';

        return (new MailMessage)
            ->subject(sprintf('Trainer availability updated: %s', $trainerName))
            ->markdown('mail.admin.trainer-availability-updated', [
                'trainerName' => $trainerName,
                'viewUrl' => frontend_url('/dashboard/admin/trainers'),
            ]);
    }
}
