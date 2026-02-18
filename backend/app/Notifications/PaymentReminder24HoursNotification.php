<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Payment Reminder (24 Hours) Notification
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: First reminder sent 24 hours after draft booking creation
 * Location: backend/app/Notifications/PaymentReminder24HoursNotification.php
 */
class PaymentReminder24HoursNotification extends Notification implements ShouldQueue
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
        $outstandingAmount = $this->booking->total_price - ($this->booking->paid_amount ?? 0);

        return (new MailMessage())
            ->subject('Payment Due Tomorrow - ' . $packageName)
            ->markdown('mail.payment.reminder-24h', [
                'booking' => $this->booking,
                'packageName' => $packageName,
                'reference' => $reference,
                'outstandingAmount' => $outstandingAmount,
            ]);
    }
}
