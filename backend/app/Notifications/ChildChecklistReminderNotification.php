<?php

namespace App\Notifications;

use App\Models\Child;
use App\Models\ChildChecklist;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Child Checklist Reminder Notification
 *
 * Sent to parent when an admin manually requests
 * a reminder for a child's checklist (missing or pending).
 */
class ChildChecklistReminderNotification extends Notification implements ShouldQueue
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

        $status = $this->checklist->checklist_completed ? 'Complete' : 'Not Complete';

        return (new MailMessage)
            ->subject('Please Complete Child Checklist - ' . $childName)
            ->markdown('mail.checklist.reminder', [
                'childName' => $childName,
                'parentName' => $parentName,
                'status' => $status,
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

