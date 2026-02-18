<?php

namespace App\Notifications;

use App\Models\BookingSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Admin Session Needs Trainer Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Email notification to admin when a session is booked without a trainer (no preference)
 * Location: backend/app/Notifications/AdminSessionNeedsTrainerNotification.php
 * 
 * Trigger: When a parent books a session with "No preference" for trainer selection
 * Recipient: Admin emails from site settings (support_emails)
 */
class AdminSessionNeedsTrainerNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly BookingSchedule $schedule)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $booking = $this->schedule->booking;
        $packageName = $booking?->package?->name ?? 'Package';
        $reference = $booking?->reference ?? 'N/A';
        
        // Get parent name
        $parentName = $booking?->user?->name 
            ?? ($booking?->user?->first_name 
                ? $booking->user->first_name . ' ' . ($booking->user->last_name ?? '')
                : 'Parent');
        
        // Get child names
        $children = $booking?->children ?? collect();
        $childNames = $children->count() > 0 
            ? $children->pluck('name')->join(', ')
            : 'No children';
        
        // Format schedule date and time
        $scheduleDate = $this->schedule->date 
            ? \Carbon\Carbon::parse($this->schedule->date)->format('l, F j, Y')
            : 'Not set';
        
        $scheduleTime = $this->schedule->start_time && $this->schedule->end_time
            ? \Carbon\Carbon::parse($this->schedule->start_time)->format('g:i A') . ' - ' . 
              \Carbon\Carbon::parse($this->schedule->end_time)->format('g:i A')
            : 'Not set';

        return (new MailMessage())
            ->subject('⚠️ Session Needs Trainer Assignment - ' . $reference)
            ->markdown('mail.admin.session-needs-trainer', [
                'booking' => $booking,
                'schedule' => $this->schedule,
                'packageName' => $packageName,
                'reference' => $reference,
                'parentName' => $parentName,
                'childNames' => $childNames,
                'scheduleDate' => $scheduleDate,
                'scheduleTime' => $scheduleTime,
            ]);
    }
}
