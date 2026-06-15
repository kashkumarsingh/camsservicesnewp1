<?php

namespace App\Notifications;

use App\Models\Child;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminChildAddedNotification extends Notification
{
    public function __construct(private readonly Child $child)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->child->loadMissing('user');

        return (new MailMessage)
            ->subject(sprintf('New child added: %s', $this->child->name))
            ->markdown('mail.admin.child-added', [
                'child' => $this->child,
                'parent' => $this->child->user,
                'viewUrl' => frontend_url('/dashboard/admin/children'),
            ]);
    }
}
