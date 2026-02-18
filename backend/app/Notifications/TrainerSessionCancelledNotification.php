<?php

namespace App\Notifications;

use App\Models\BookingSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Trainer Session Cancelled Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Email notification to trainer when a session is cancelled
 * Location: backend/app/Notifications/TrainerSessionCancelledNotification.php
 */
class TrainerSessionCancelledNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly BookingSchedule $schedule,
        private readonly string $reason
    ) {
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

        return (new MailMessage())
            ->subject('Session Cancelled - ' . $scheduleDate)
            ->markdown('mail.trainer.session-cancelled', [
                'schedule' => $this->schedule,
                'booking' => $booking,
                'packageName' => $packageName,
                'scheduleDate' => $scheduleDate,
                'scheduleTime' => $scheduleTime,
                'reason' => $this->reason,
            ]);
    }
}
