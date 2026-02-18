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

        // Use a dedicated "from" address for system notifications
        // This ensures "From" and "To" are always different
        // Extract domain from default mail config or use a fallback
        $defaultFrom = config('mail.from.address');
        $fromName = config('mail.from.name', 'CAMS Services');
        
        // Extract domain from default from address, or use app URL domain
        $domain = substr(strrchr($defaultFrom, '@'), 1);
        if (!$domain) {
            $domain = parse_url(config('app.url'), PHP_URL_HOST) ?: 'camsservices.co.uk';
        }
        
        // Use noreply@domain for system notifications to avoid confusion
        $fromAddress = 'noreply@' . $domain;

        return (new MailMessage)
            ->from($fromAddress, $fromName)
            ->subject(sprintf('New Contact Request: %s', $submission->name))
            ->markdown('mail.admin.contact-submission', [
                'submission' => $submission,
            ]);
    }
}

