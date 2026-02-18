<?php

namespace App\Notifications;

use App\Models\BookingSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Parent Trainer Assigned Notification
 *
 * Sent when admin assigns a trainer to a session. Parent receives email and sees in-app notification.
 */
class ParentTrainerAssignedNotification extends Notification implements ShouldQueue
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
        $packageName = $booking?->package?->name ?? 'your package';
        $trainerName = $this->schedule->trainer?->name ?? 'A trainer';
        $children = $booking?->children ?? collect();
        $childNames = $children->count() > 0 ? $children->pluck('name')->join(', ') : 'your child';
        $sessionDate = $this->schedule->date
            ? \Carbon\Carbon::parse($this->schedule->date)->format('l, F j, Y')
            : '';
        $sessionTime = $this->schedule->start_time && $this->schedule->end_time
            ? \Carbon\Carbon::parse($this->schedule->start_time)->format('g:i A') . ' – ' .
              \Carbon\Carbon::parse($this->schedule->end_time)->format('g:i A')
            : '';
        $bookingUrl = frontend_url('/dashboard/parent');

        return (new MailMessage())
            ->subject('A trainer has been assigned to your upcoming session')
            ->markdown('mail.parent.trainer-assigned', [
                'childNames' => $childNames,
                'packageName' => $packageName,
                'trainerName' => $trainerName,
                'sessionDate' => $sessionDate,
                'sessionTime' => $sessionTime,
                'bookingUrl' => $bookingUrl,
            ]);
    }
}
