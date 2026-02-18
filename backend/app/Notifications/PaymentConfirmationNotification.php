<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Payment Confirmation Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Email notification when payment is confirmed
 * Location: backend/app/Notifications/PaymentConfirmationNotification.php
 */
class PaymentConfirmationNotification extends Notification implements ShouldQueue
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
        $totalPrice = number_format($this->booking->total_price, 2);
        $paidAmount = number_format($this->booking->paid_amount, 2);

        return (new MailMessage())
            ->subject('Payment Confirmed - Reference ' . $reference)
            ->markdown('mail.booking.payment-confirmation', [
                'booking' => $this->booking,
                'packageName' => $packageName,
                'reference' => $reference,
                'totalPrice' => $totalPrice,
                'paidAmount' => $paidAmount,
            ]);
    }
}
