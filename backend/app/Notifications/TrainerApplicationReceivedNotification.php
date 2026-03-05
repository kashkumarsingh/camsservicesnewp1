<?php

namespace App\Notifications;

use App\Models\TrainerApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Trainer Application Received Notification
 *
 * Sent to the applicant when they submit a trainer application.
 * Confirms receipt and sets expectation that the team will review and be in touch.
 */
class TrainerApplicationReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly TrainerApplication $application
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $name = $this->application->first_name ?: 'there';

        return (new MailMessage())
            ->subject('Trainer Application Received - CAMS Services')
            ->greeting('Hello ' . $name . ',')
            ->line('Thank you for submitting your trainer application.')
            ->line('A member of our team will review it and be in touch shortly.')
            ->line('If you have any questions in the meantime, please contact us.')
            ->salutation('Kind regards, The CAMS Services Team');
    }
}
