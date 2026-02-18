<?php

namespace App\Notifications;

use App\Models\BookingSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Admin Session Ending Soon Notification
 *
 * Sent 30 minutes before the session end time so admins are aware.
 * In-app bell and email.
 */
class AdminSessionEndingSoonNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly BookingSchedule $schedule)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        $this->schedule->loadMissing(['booking.children', 'booking.package', 'trainer.user']);
        $booking = $this->schedule->booking;
        $childNames = $booking?->children?->pluck('name')->join(', ') ?: 'Child';
        $trainerName = $this->schedule->trainer?->user?->name ?? 'Trainer';
        $endTime = $this->schedule->end_time
            ? \Carbon\Carbon::parse($this->schedule->end_time)->format('g:i A')
            : '';

        $frontendUrl = rtrim(config('app.frontend_url', ''), '/');
        $link = $frontendUrl . '/dashboard/admin/booking-schedules?scheduleId=' . $this->schedule->id;

        return (new MailMessage())
            ->subject('Session ending in 30 minutes – ' . $childNames . ' with ' . $trainerName)
            ->greeting('Session ending soon')
            ->line($childNames . '\'s session with **' . $trainerName . '** ends at **' . $endTime . '**.')
            ->action('View in admin', $link)
            ->salutation('Thanks,');
    }
}
