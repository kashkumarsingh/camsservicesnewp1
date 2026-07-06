<?php

namespace App\Notifications;

use App\Models\Incident;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminIncidentReportedNotification extends Notification
{
    public function __construct(private readonly Incident $incident)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->incident->loadMissing(['reportedBy', 'child']);

        return (new MailMessage)
            ->subject('Incident report: ' . $this->incident->reference)
            ->markdown('mail.admin.incident-reported', [
                'incident' => $this->incident,
                'viewUrl' => frontend_url('/dashboard/admin/incidents'),
            ]);
    }
}
