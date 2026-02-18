<?php

namespace App\Notifications;

use App\Models\BookingSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Parent Session Ending Soon Notification
 *
 * Sent 30 minutes before the session end time so parents know the session
 * will finish soon. In-app bell and email.
 */
class ParentSessionEndingSoonNotification extends Notification implements ShouldQueue
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
        $this->schedule->loadMissing(['booking.children', 'booking.package']);
        $booking = $this->schedule->booking;
        $childNames = $booking?->children?->pluck('name')->join(', ') ?: 'your child';
        $packageName = $booking?->package?->name ?? 'Session';
        $endTime = $this->schedule->end_time
            ? \Carbon\Carbon::parse($this->schedule->end_time)->format('g:i A')
            : '';

        $frontendUrl = rtrim(config('app.frontend_url', ''), '/');
        $link = $frontendUrl . '/dashboard/parent/schedule?scheduleId=' . $this->schedule->id;

        return (new MailMessage())
            ->subject('Session ending in 30 minutes – ' . $childNames . '\'s ' . $packageName)
            ->greeting('Hello ' . ($notifiable->name ? explode(' ', $notifiable->name)[0] : 'there') . ',')
            ->line($childNames . '\'s session ends at **' . $endTime . '**.')
            ->line('You can view session details and activity logs in your dashboard.')
            ->action('View session', $link)
            ->salutation('Thanks,');
    }
}
