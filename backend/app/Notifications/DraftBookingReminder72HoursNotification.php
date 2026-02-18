<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Draft Booking Reminder (72 Hours) Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Final reminder sent 72 hours after booking abandonment
 * Location: backend/app/Notifications/DraftBookingReminder72HoursNotification.php
 * 
 * Trigger: 72 hours after last activity on draft booking
 * Tone: Final reminder, helpful
 */
class DraftBookingReminder72HoursNotification extends Notification implements ShouldQueue
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
        
        // Support email
        $supportEmail = config('mail.from.address');

        return (new MailMessage())
            ->subject('Last Chance - Complete Your ' . $packageName . ' Booking')
            ->markdown('mail.booking.draft-reminder-72h', [
                'booking' => $this->booking,
                'packageName' => $packageName,
                'reference' => $reference,
                'parentName' => $parentName,
                'childNames' => $childNames,
                'resumeUrl' => $resumeUrl,
                'supportEmail' => $supportEmail,
            ]);
    }
}
