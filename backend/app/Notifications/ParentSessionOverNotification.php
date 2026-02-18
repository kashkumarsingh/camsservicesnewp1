<?php

namespace App\Notifications;

use App\Models\BookingSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Parent Session Over Notification
 *
 * Purpose: Notify parent when a session has finished (trainer marked as completed).
 * In-app bell shows "Session finished" with actionable link to view activity logs and session details.
 */
class ParentSessionOverNotification extends Notification implements ShouldQueue
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
        $booking = $this->schedule->booking;
        $childNames = $booking?->children?->pluck('name')->join(', ') ?: 'your child';
        $packageName = $booking?->package?->name ?? 'Session';
        $dateStr = $this->schedule->date ? \Carbon\Carbon::parse($this->schedule->date)->format('l j F Y') : '';
        $timeStr = $this->schedule->start_time && $this->schedule->end_time
            ? \Carbon\Carbon::parse($this->schedule->start_time)->format('g:i A') . ' – ' .
              \Carbon\Carbon::parse($this->schedule->end_time)->format('g:i A')
            : '';

        $frontendUrl = rtrim(config('app.frontend_url', ''), '/');
        $link = $frontendUrl . '/dashboard/parent/schedule?scheduleId=' . $this->schedule->id;

        return (new MailMessage())
            ->subject('Session finished – ' . $childNames . '\'s ' . $packageName)
            ->greeting('Hello ' . ($notifiable->name ? explode(' ', $notifiable->name)[0] : 'there') . ',')
            ->line($childNames . '\'s session has finished.')
            ->when($dateStr || $timeStr, function (MailMessage $mail) use ($dateStr, $timeStr) {
                $detail = trim($dateStr . ($timeStr ? ' at ' . $timeStr : ''));
                return $mail->line('**When:** ' . $detail);
            })
            ->action('View activity logs & session details', $link)
            ->line('You can see what activities were completed and any notes from the trainer.')
            ->salutation('Thanks,');
    }
}
