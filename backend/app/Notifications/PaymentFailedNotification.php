<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Payment Failed Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Email notification when payment fails
 * Location: backend/app/Notifications/PaymentFailedNotification.php
 */
class PaymentFailedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Booking $booking,
        private readonly string $error
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $packageName = $this->booking->package?->name ?? 'selected package';
        $reference = $this->booking->reference;
        $totalPrice = number_format($this->booking->total_price, 2);

        return (new MailMessage())
            ->subject('Payment Failed - Reference ' . $reference)
            ->markdown('mail.booking.payment-failed', [
                'booking' => $this->booking,
                'packageName' => $packageName,
                'reference' => $reference,
                'totalPrice' => $totalPrice,
                'error' => $this->error,
            ]);
    }
}
