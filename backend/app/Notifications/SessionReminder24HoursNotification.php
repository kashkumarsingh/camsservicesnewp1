<?php

namespace App\Notifications;

use App\Models\BookingSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Session Reminder (24 Hours) Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Reminder sent 24 hours before scheduled session
 * Location: backend/app/Notifications/SessionReminder24HoursNotification.php
 * 
 * Trigger: 24 hours before session start time
 * Recipient: Parent (booking user)
 */
class SessionReminder24HoursNotification extends Notification implements ShouldQueue
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
        $parentName = $booking?->user?->name 
            ?? $booking?->user?->first_name 
            ?? 'Parent';
        
        // Get child names
        $children = $booking?->children ?? collect();
        $childNames = $children->count() > 0 
            ? $children->pluck('name')->join(', ')
            : 'your child';
        
        // Format session date and time
        $sessionDate = $this->schedule->date 
            ? \Carbon\Carbon::parse($this->schedule->date)->format('l, F j, Y')
            : 'Not set';
        
        $sessionTime = $this->schedule->start_time && $this->schedule->end_time
            ? \Carbon\Carbon::parse($this->schedule->start_time)->format('g:i A') . ' - ' . 
              \Carbon\Carbon::parse($this->schedule->end_time)->format('g:i A')
            : 'Not set';
        
        // Trainer information
        $trainerName = $this->schedule->trainer?->name ?? 'To be assigned';
        $trainerPhone = $this->schedule->trainer?->user?->phone ?? null;
        
        // Location information (session location when set, otherwise to be confirmed)
        $location = $this->schedule->location ?? 'To be confirmed';
        
        // Booking details URL
        $bookingUrl = config('app.frontend_url') . '/bookings/' . $booking->id;

        return (new MailMessage())
            ->subject('Tomorrow: ' . $childNames . '\'s ' . $packageName . ' Session')
            ->markdown('mail.session.reminder-24h', [
                'schedule' => $this->schedule,
                'booking' => $booking,
                'packageName' => $packageName,
                'parentName' => $parentName,
                'childNames' => $childNames,
                'sessionDate' => $sessionDate,
                'sessionTime' => $sessionTime,
                'trainerName' => $trainerName,
                'trainerPhone' => $trainerPhone,
                'location' => $location,
                'bookingUrl' => $bookingUrl,
            ]);
    }
}
