<?php

namespace App\Notifications;

use App\Models\Child;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Admin Child Approval Required Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Email notification to admin when a new child application is submitted
 * Location: backend/app/Notifications/AdminChildApprovalRequiredNotification.php
 */
class AdminChildApprovalRequiredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Child $child)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        // Child model only has 'name' field (not first_name/last_name)
        $childName = $this->child->name ?? 'N/A';
        $parentName = $this->child->user?->name ?? 'Parent';
        $applicationDate = $this->child->created_at->format('l, F j, Y');

        return (new MailMessage())
            ->subject('Child Approval Required - ' . $childName)
            ->markdown('mail.admin.child-approval-required', [
                'child' => $this->child,
                'childName' => $childName,
                'parentName' => $parentName,
                'applicationDate' => $applicationDate,
            ]);
    }
}
