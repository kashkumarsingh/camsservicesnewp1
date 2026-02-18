<?php

namespace App\Notifications;

use App\Models\BookingSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Admin Session Started Notification
 *
 * Sent when a trainer clocks in so admins know the session is live.
 * In-app bell and email: "Session started – [child]'s session with [trainer] has started."
 */
class AdminSessionStartedNotification extends Notification implements ShouldQueue
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
        $packageName = $booking?->package?->name ?? 'Session';
        $trainerName = $this->schedule->trainer?->user?->name ?? 'Trainer';
        $dateStr = $this->schedule->date ? \Carbon\Carbon::parse($this->schedule->date)->format('l j F Y') : '';
        $timeStr = $this->schedule->start_time && $this->schedule->end_time
            ? \Carbon\Carbon::parse($this->schedule->start_time)->format('g:i A') . ' – ' .
              \Carbon\Carbon::parse($this->schedule->end_time)->format('g:i A')
            : '';

        $adminUrl = config('app.url') . '/admin/booking-schedules/' . $this->schedule->id . '/edit';

        return (new MailMessage())
            ->subject('Session started – ' . $childNames . '\'s ' . $packageName)
            ->greeting('Session is live')
            ->line($childNames . '\'s session has started with **' . $trainerName . '**.')
            ->when($dateStr || $timeStr, function (MailMessage $mail) use ($dateStr, $timeStr) {
                $detail = trim($dateStr . ($timeStr ? ' at ' . $timeStr : ''));

                return $mail->line('**When:** ' . $detail);
            })
            ->action('View in admin', $adminUrl)
            ->line('You can view and manage this session in the admin booking schedules.')
            ->salutation('Thanks,');
    }
}
