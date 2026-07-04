<?php

namespace App\Notifications;

use App\Models\ReferralSubmission;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReferralSubmissionThankYouNotification extends Notification
{
    public function __construct(private readonly ReferralSubmission $submission)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Thank you for your referral to CAMS services')
            ->markdown('mail.referral.thank-you', [
                'name' => $this->submission->referrer_name,
                'youngPersonName' => $this->submission->young_person_name,
                'thankYouUrl' => frontend_url('/contact/thank-you?type=referral'),
            ]);
    }
}
