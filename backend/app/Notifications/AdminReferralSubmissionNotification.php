<?php

namespace App\Notifications;

use App\Models\ReferralSubmission;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminReferralSubmissionNotification extends Notification
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
            ->subject(sprintf('New Referral: %s', $this->submission->young_person_name))
            ->markdown('mail.admin.referral-submission', [
                'submission' => $this->submission,
                'viewUrl' => frontend_url('/dashboard/admin/referrals/' . $this->submission->id),
            ]);
    }
}
