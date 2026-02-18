<?php

namespace App\Notifications;

use App\Models\BookingSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Trainer Session Ending Soon Notification
 *
 * Sent 30 minutes before the session end time to remind the trainer to
 * clock out and complete session notes and activity logs.
 */
class TrainerSessionEndingSoonNotification extends Notification implements ShouldQueue
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
        $endTime = $this->schedule->end_time
            ? \Carbon\Carbon::parse($this->schedule->end_time)->format('g:i A')
            : '';

        $frontendUrl = rtrim(config('services.frontend.url', config('app.frontend_url', config('app.url'))), '/');
        $link = $frontendUrl . '/dashboard/trainer?scheduleId=' . $this->schedule->id;

        return (new MailMessage())
            ->subject('Session ending in 30 minutes – don’t forget to clock out')
            ->greeting('Hello ' . ($notifiable->name ? explode(' ', $notifiable->name)[0] : 'there') . ',')
            ->line('Your session with **' . $children . '** ends at **' . $endTime . '**.')
            ->line('Please remember to:')
            ->line('• Clock out when you finish')
            ->line('• Complete your session notes and activity logs')
            ->action('Open session', $link)
            ->salutation('Thanks,');
    }
}
