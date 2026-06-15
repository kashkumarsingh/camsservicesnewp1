<?php

namespace App\Notifications;

use App\Models\NewsletterSubscription;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminNewsletterSubscribedNotification extends Notification
{
    public function __construct(private readonly NewsletterSubscription $subscription)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(sprintf('Newsletter subscription: %s', $this->subscription->email))
            ->markdown('mail.admin.newsletter-subscribed', [
                'subscription' => $this->subscription,
            ]);
    }
}
