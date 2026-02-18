<?php

namespace App\Notifications;

use App\Models\BookingSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Trainer Session Confirmation Request
 *
 * Sent when a session is auto-assigned and trainer must accept/decline (e.g. within 24h).
 */
class TrainerSessionConfirmationRequestNotification extends Notification implements ShouldQueue
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
        $packageName = $booking->package?->name ?? 'Package';
        $scheduleDate = $this->schedule->date->format('l, F j, Y');
        $scheduleTime = $this->schedule->start_time . ' - ' . $this->schedule->end_time;

        $participants = $booking->participants()->with('child')->get();
        $childNames = $participants->map(function ($participant) {
            return $participant->child
                ? $participant->child->first_name . ' ' . $participant->child->last_name
                : 'Child';
        })->implode(', ');

        $parentName = $booking->user?->name
            ?? trim(($booking->user?->first_name ?? '') . ' ' . ($booking->user?->last_name ?? ''))
            ?: 'Parent';

        $confirmUrl = url('/dashboard/trainer/schedules?confirm=' . $this->schedule->id);
        $declineUrl = url('/dashboard/trainer/schedules?decline=' . $this->schedule->id);

        return (new MailMessage())
            ->subject('Session confirmation requested – ' . $scheduleDate)
            ->line('A new session has been proposed for you. Please confirm or decline within 24 hours.')
            ->line('**When:** ' . $scheduleDate . ', ' . $scheduleTime)
            ->line('**Child(ren):** ' . $childNames)
            ->line('**Parent:** ' . $parentName)
            ->line('**Package:** ' . $packageName)
            ->action('Confirm session', $confirmUrl)
            ->line('To decline, use your trainer dashboard or reply to this email.');
    }
}
