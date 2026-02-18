<?php

namespace App\Notifications;

use App\Models\BookingSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Trainer Session Booked Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Email notification to trainer when a session is booked for them
 * Location: backend/app/Notifications/TrainerSessionBookedNotification.php
 */
class TrainerSessionBookedNotification extends Notification implements ShouldQueue
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
        $packageName = $booking->package?->name ?? 'Package';
        $scheduleDate = $this->schedule->date->format('l, F j, Y');
        $scheduleTime = $this->schedule->start_time . ' - ' . $this->schedule->end_time;
        
        // Get participants (children)
        $participants = $booking->participants()->with('child')->get();
        $childNames = $participants->map(function ($participant) {
            return $participant->child 
                ? $participant->child->first_name . ' ' . $participant->child->last_name 
                : 'Child';
        })->implode(', ');

        // Get parent name
        $parentName = $booking->user?->name 
            ?? $booking->user?->first_name . ' ' . $booking->user?->last_name
            ?? 'Parent';

        return (new MailMessage())
            ->subject('New Session Booked - ' . $scheduleDate)
            ->markdown('mail.trainer.session-booked', [
                'schedule' => $this->schedule,
                'booking' => $booking,
                'packageName' => $packageName,
                'scheduleDate' => $scheduleDate,
                'scheduleTime' => $scheduleTime,
                'childNames' => $childNames,
                'parentName' => $parentName,
            ]);
    }
}
