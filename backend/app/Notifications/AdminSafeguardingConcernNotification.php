<?php

namespace App\Notifications;

use App\Models\SafeguardingConcern;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminSafeguardingConcernNotification extends Notification
{
    public function __construct(private readonly SafeguardingConcern $concern)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->concern->loadMissing(['user', 'child']);

        return (new MailMessage)
            ->subject('Safeguarding concern reported')
            ->markdown('mail.admin.safeguarding-concern', [
                'concern' => $this->concern,
                'viewUrl' => frontend_url('/dashboard/admin'),
            ]);
    }
}
