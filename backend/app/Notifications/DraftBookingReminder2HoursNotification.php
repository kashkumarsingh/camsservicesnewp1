<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Draft Booking Reminder (2 Hours) Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Second reminder sent 2 hours after booking abandonment
 * Location: backend/app/Notifications/DraftBookingReminder2HoursNotification.php
 * 
 * Trigger: 2 hours after last activity on draft booking
 * Tone: Gentle reminder
 */
class DraftBookingReminder2HoursNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Booking $booking)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $packageName = $this->booking->package?->name ?? 'Package';
        $reference = $this->booking->reference;
        $parentName = $this->booking->user?->name 
            ?? $this->booking->user?->first_name 
            ?? 'Parent';
        
        // Get child names
        $children = $this->booking->children ?? collect();
        $childNames = $children->count() > 0 
            ? $children->pluck('name')->join(', ')
            : 'your child';
        
        // Resume booking URL
        $resumeUrl = config('app.frontend_url') . '/bookings/' . $this->booking->id . '/resume';

        return (new MailMessage())
            ->subject('Still Interested? Complete Your ' . $packageName . ' Booking')
            ->markdown('mail.booking.draft-reminder-2h', [
                'booking' => $this->booking,
                'packageName' => $packageName,
                'reference' => $reference,
                'parentName' => $parentName,
                'childNames' => $childNames,
                'resumeUrl' => $resumeUrl,
            ]);
    }
}
