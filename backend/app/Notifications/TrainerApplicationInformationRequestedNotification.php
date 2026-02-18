<?php

namespace App\Notifications;

use App\Models\TrainerApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Crypt;

/**
 * Notify applicant that admin has requested more information, with a link to respond.
 */
class TrainerApplicationInformationRequestedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly TrainerApplication $application,
        private readonly string $message
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $payload = [
            'id' => $this->application->id,
            'email' => $this->application->email,
            'exp' => now()->addDays(7)->timestamp,
        ];
        $token = Crypt::encryptString(json_encode($payload));
        $frontendUrl = rtrim(config('services.frontend.url', config('app.frontend_url', config('app.url'))), '/');
        $respondUrl = $frontendUrl . '/respond-to-application?token=' . urlencode($token);

        return (new MailMessage())
            ->subject('More information needed – Trainer application CAMS-TA-' . $this->application->id)
            ->markdown('mail.trainer.application-information-requested', [
                'application' => $this->application,
                'applicantName' => $this->application->first_name,
                'adminMessage' => $this->message,
                'respondUrl' => $respondUrl,
            ]);
    }
}
