<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Parent Registered Notification
 * 
 * Sent to parent after successful registration
 * Confirms registration and explains approval process
 */
class ParentRegisteredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly User $user
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $logoUrl = $this->getLogoUrl();
        $settings = \App\Models\SiteSetting::instance();
        $supportEmail = $this->extractFirstEmail($settings->support_emails ?? []);

        return (new MailMessage)
            ->subject('Welcome to CAMS Services - Registration Received')
            ->markdown('mail.parent.registered', [
                'userName' => $this->user->name,
                'userEmail' => $this->user->email,
                'supportEmail' => $supportEmail,
                'logoUrl' => $logoUrl,
            ]);
    }

    private function getLogoUrl(): string
    {
        $settings = \App\Models\SiteSetting::instance();
        $logoPath = $settings->logo_path ?? 'logos/01K9YYDHWYKVXH4919QPXCWAMQ.webp';
        
        // Remove leading slash if present
        $logoPath = ltrim($logoPath, '/');
        
        // Build full URL
        $baseUrl = rtrim(config('app.url'), '/');
        return "{$baseUrl}/storage/{$logoPath}";
    }

    private function extractFirstEmail(array $rawEmails): string
    {
        $email = collect($rawEmails)
            ->map(function ($item) {
                if (is_array($item) && isset($item['value'])) {
                    return $item['value'];
                }
                if (is_string($item)) {
                    return $item;
                }
                return null;
            })
            ->filter(fn ($email) => filled($email) && is_string($email))
            ->first();

        return $email ?? 'support@camsservices.co.uk';
    }
}
