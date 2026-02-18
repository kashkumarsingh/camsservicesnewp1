<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Admin Parent Registration Notification
 * 
 * Sent to admin when a new parent registers
 * Requires admin approval
 */
class AdminParentRegistrationNotification extends Notification implements ShouldQueue
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
        $adminUrl = config('app.url') . '/admin/users/' . $this->user->id;

        return (new MailMessage)
            ->subject('New Parent Registration - Approval Required')
            ->markdown('mail.admin.parent-registration', [
                'user' => $this->user,
                'adminUrl' => $adminUrl,
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
}
