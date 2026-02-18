<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingConfirmationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Booking $booking)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $packageName = $this->booking->package?->name ?? 'selected package';
        $reference = $this->booking->reference;

        return (new MailMessage())
            ->subject('Booking Received - Reference ' . $reference)
            ->markdown('mail.booking.confirmation', [
                'booking' => $this->booking,
                'packageName' => $packageName,
            ]);
    }
}

