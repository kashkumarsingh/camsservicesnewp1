<?php

namespace App\Notifications;

use App\Models\Child;
use App\Models\ChildChecklist;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Child Checklist Submitted Notification
 * 
 * Sent to parent when they complete the child checklist
 * Confirms submission and explains review process
 */
class ChildChecklistSubmittedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Child $child,
        private readonly ChildChecklist $checklist
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $logoUrl = $this->getLogoUrl();
        $childName = $this->child->name ?? 'your child';
        $parentName = $this->child->user?->name ?? 'there';

        return (new MailMessage)
            ->subject('Checklist Received - ' . $childName)
            ->markdown('mail.checklist.submitted', [
                'childName' => $childName,
                'parentName' => $parentName,
                'checklist' => $this->checklist,
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
