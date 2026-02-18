<?php

namespace App\Notifications;

use App\Models\BookingSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Trainer Forgot Clock-Out Notification
 *
 * Sent when a trainer marks a session as completed but has not clocked out.
 * Email includes a link that opens the trainer dashboard with the clock-out modal.
 */
class TrainerForgotClockOutNotification extends Notification implements ShouldQueue
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
        $dateStr = $this->schedule->date?->format('l, j M Y') ?? '';
        $timeStr = $this->schedule->start_time && $this->schedule->end_time
            ? \Carbon\Carbon::parse($this->schedule->start_time)->format('g:i A') . ' – ' .
              \Carbon\Carbon::parse($this->schedule->end_time)->format('g:i A')
            : '';

        $frontendUrl = rtrim(config('services.frontend.url', config('app.frontend_url', config('app.url'))), '/');
        $link = $frontendUrl . '/dashboard/trainer?openClockOut=' . $this->schedule->id;

        return (new MailMessage())
            ->subject('You did not clock out – please add your clock-out time')
            ->greeting('Hello ' . ($notifiable->name ? explode(' ', $notifiable->name)[0] : 'there') . ',')
            ->line('You marked your session as completed but did not clock out.')
            ->line('**Session:** ' . $children . ' – ' . $dateStr . ($timeStr ? ' · ' . $timeStr : ''))
            ->line('Please add your clock-out time so your records and pay are correct.')
            ->action('Add clock-out time', $link)
            ->line('The link above will open your dashboard and prompt you to enter when you clocked out.')
            ->salutation('Thanks,');
    }
}
