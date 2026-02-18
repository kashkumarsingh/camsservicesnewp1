<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Draft Booking Reminder (24 Hours) Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Third reminder sent 24 hours after booking abandonment
 * Location: backend/app/Notifications/DraftBookingReminder24HoursNotification.php
 * 
 * Trigger: 24 hours after last activity on draft booking
 * Tone: Urgency without pressure
 */
class DraftBookingReminder24HoursNotification extends Notification implements ShouldQueue
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
        
        // Calculate expiry (96 hours from creation)
        $expiresAt = $this->booking->created_at?->addHours(96)->format('l, F j, Y');
        
        // Resume booking URL
        $resumeUrl = config('app.frontend_url') . '/bookings/' . $this->booking->id . '/resume';

        return (new MailMessage())
            ->subject('Don\'t Miss Out - Your ' . $packageName . ' Booking Expires Soon')
            ->markdown('mail.booking.draft-reminder-24h', [
                'booking' => $this->booking,
                'packageName' => $packageName,
                'reference' => $reference,
                'parentName' => $parentName,
                'childNames' => $childNames,
                'expiresAt' => $expiresAt,
                'resumeUrl' => $resumeUrl,
            ]);
    }
}
