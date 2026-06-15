<?php

namespace App\Notifications;

use App\Models\ContactSubmission;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ContactSubmissionThankYouNotification extends Notification
{
    public function __construct(private readonly ContactSubmission $submission)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Thank you for contacting CAMS Services')
            ->markdown('mail.contact.thank-you', [
                'name' => $this->submission->name,
                'thankYouUrl' => frontend_url('/contact/thank-you?type=contact'),
            ]);
    }
}
