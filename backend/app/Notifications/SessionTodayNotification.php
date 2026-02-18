<?php

namespace App\Notifications;

use App\Models\BookingSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Session Today Notification
 *
 * Purpose: Signal to parent on the day of the session (in addition to 24h-reminder).
 * Sent once per schedule in the morning on session date.
 */
class SessionTodayNotification extends Notification implements ShouldQueue
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
        $packageName = $booking?->package?->name ?? 'Package';
        $parentName = $booking?->user?->name ?? 'Parent';

        $children = $booking?->children ?? collect();
        $childNames = $children->count() > 0
            ? $children->pluck('name')->join(', ')
            : 'your child';

        $sessionTime = $this->schedule->start_time && $this->schedule->end_time
            ? \Carbon\Carbon::parse($this->schedule->start_time)->format('g:i A') . ' - ' .
              \Carbon\Carbon::parse($this->schedule->end_time)->format('g:i A')
            : 'Not set';

        $trainerName = $this->schedule->trainer?->name ?? 'To be assigned';
        $trainerPhone = $this->schedule->trainer?->user?->phone ?? null;
        $location = $this->schedule->location ?? 'To be confirmed';

        $frontendUrl = rtrim(config('app.frontend_url', ''), '/');
        $bookingUrl = $frontendUrl . '/dashboard/parent';

        return (new MailMessage())
            ->subject('Today: ' . $childNames . '\'s ' . $packageName . ' session at ' . (\Carbon\Carbon::parse($this->schedule->start_time)->format('g:i A')))
            ->markdown('mail.session.reminder-today', [
                'schedule' => $this->schedule,
                'booking' => $booking,
                'packageName' => $packageName,
                'parentName' => $parentName,
                'childNames' => $childNames,
                'sessionTime' => $sessionTime,
                'trainerName' => $trainerName,
                'trainerPhone' => $trainerPhone,
                'location' => $location,
                'bookingUrl' => $bookingUrl,
            ]);
    }
}
