<?php

namespace App\Notifications;

use App\Models\ContactSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewContactSubmissionNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly ContactSubmission $submission
    ) {
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $submission = $this->submission;

        // Link must point to the frontend admin dashboard (Next.js), not the backend
        $viewUrl = frontend_url('/dashboard/admin/contact-submissions/' . $submission->id);

        return (new MailMessage)
            ->subject(sprintf('New Contact Request: %s', $submission->name))
            ->markdown('mail.admin.contact-submission', [
                'submission' => $submission,
                'viewUrl' => $viewUrl,
            ]);
    }
}

