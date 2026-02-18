<?php

namespace App\Notifications;

use App\Models\BookingSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Trainer Session Starting Soon Notification
 *
 * Sent 30 minutes before the session start time to remind the trainer
 * that the session is about to start (e.g. session at 13:30, notify at 13:00).
 */
class TrainerSessionStartingSoonNotification extends Notification implements ShouldQueue
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
        $this->schedule->loadMissing(['booking.children', 'booking.package']);
        $booking = $this->schedule->booking;
        $children = $booking?->children?->pluck('name')->join(', ') ?: 'your session';
        $startTime = $this->schedule->start_time
            ? \Carbon\Carbon::parse($this->schedule->start_time)->format('g:i A')
            : '';
        $endTime = $this->schedule->end_time
            ? \Carbon\Carbon::parse($this->schedule->end_time)->format('g:i A')
            : '';
        $timeRange = trim($startTime . ' – ' . $endTime, ' –');

        $frontendUrl = rtrim(config('services.frontend.url', config('app.frontend_url', config('app.url'))), '/');
        $link = $frontendUrl . '/dashboard/trainer?scheduleId=' . $this->schedule->id;

        return (new MailMessage())
            ->subject('Session starting in 30 minutes')
            ->greeting('Hello ' . ($notifiable->name ? explode(' ', $notifiable->name)[0] : 'there') . ',')
            ->line('Your session with **' . $children . '** is at **' . $timeRange . '**.')
            ->line('Get ready to clock in when you arrive.')
            ->action('Open session', $link)
            ->salutation('Thanks,');
    }
}
