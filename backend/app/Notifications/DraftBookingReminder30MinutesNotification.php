<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Draft Booking Reminder (30 Minutes) Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: First reminder sent 30 minutes after booking abandonment
 * Location: backend/app/Notifications/DraftBookingReminder30MinutesNotification.php
 * 
 * Trigger: 30 minutes after last activity on draft booking
 * Tone: Friendly, helpful
 */
class DraftBookingReminder30MinutesNotification extends Notification implements ShouldQueue
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
            ->subject('Complete Your Booking - ' . $packageName)
            ->markdown('mail.booking.draft-reminder-30m', [
                'booking' => $this->booking,
                'packageName' => $packageName,
                'reference' => $reference,
                'parentName' => $parentName,
                'childNames' => $childNames,
                'resumeUrl' => $resumeUrl,
            ]);
    }
}
